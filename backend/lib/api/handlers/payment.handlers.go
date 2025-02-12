package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/db"
	"backend/lib/services/payment"
	"backend/lib/utils"
	"backend/sqlc_gen"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/webhook"
)

// Request/Response structs
type CreateCheckoutData struct {
	PriceID string `json:"price_id"`
}

type CreateCustomerData struct {
	FullName string `json:"full_name"`
}

type CancelSubscriptionParams struct {
	SubscriptionID string `params:"subscription_id"`
}

// HandleCreateCheckoutSession creates a Stripe checkout session
func HandleCreateCheckoutSession(c *fiber.Ctx, data CreateCheckoutData, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	user_email, err := middlewares.GetUserEmail(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	// Get price details from database
	price, err := queries.GetPriceByID(query_ctx, data.PriceID)
	if err != nil {
		slog.Error("Error getting price", "err", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Price not found",
		})
	}

	// Get or create customer
	customer, err := queries.GetCustomerByUserID(query_ctx, user_id)
	if err != nil {
		stripe_customer, err := payment.CreateStripeCustomer(user_email, "")
		if err != nil {
			slog.Error("Error creating stripe customer", "err", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create customer",
			})
		}

		err = queries.CreateCustomer(query_ctx, sqlc_gen.CreateCustomerParams{
			UserID:           user_id,
			StripeCustomerID: stripe_customer.ID,
		})
		if err != nil {
			slog.Error("Error saving customer", "err", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to save customer",
			})
		}
		customer.StripeCustomerID = pgtype.Text{String: stripe_customer.ID, Valid: true}
	}

	// Create checkout session
	if !customer.StripeCustomerID.Valid {
		slog.Error("Error creating checkout session", "err", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create checkout session",
		})
	}
	session_url, err := payment.CreateCheckoutSession(price.ID, customer.StripeCustomerID.String)
	if err != nil {
		slog.Error("Error creating checkout session", "err", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create checkout session",
		})
	}

	return c.JSON(fiber.Map{
		"checkout_url": session_url,
	})
}

// HandleWebhook processes incoming Stripe webhook notifications
func HandleWebhook(c *fiber.Ctx, DB *db.Database) error {
	// Configure Stripe API key
	stripe.Key = utils.STRIPE_SECRET_KEY

	// Get webhook secret (should start with 'whsec_')
	webhookSecret := utils.STRIPE_WEBHOOK_SECRET

	// Get raw payload
	payload := c.BodyRaw()
	slog.Info("Payload received",
		"size", len(payload),
		"start", string(payload)[:100],
	)

	// Log all headers and body for debugging
	slog.Info("Webhook details",
		"headers", c.GetReqHeaders(),
		"body", string(payload),
	)

	// Log webhook secret information (first 6 chars only for security)
	slog.Info("Webhook secret check",
		"starts_with", webhookSecret[:6],
		"length", len(webhookSecret),
	)

	// Try different header formats for signature
	sig := c.Get("Stripe-Signature")
	if sig == "" {
		sig = c.Get("stripe-signature")
	}
	if sig == "" {
		sig = string(c.Request().Header.Peek("Stripe-Signature"))
	}

	slog.Info("Signature found", "signature", sig)

	// Verify Stripe signature
	event, err := webhook.ConstructEvent(payload, sig, webhookSecret)
	if err != nil {
		slog.Error("Signature verification failed",
			"error", err,
			"has_signature", sig != "",
			"payload_size", len(payload),
		)
		return c.Status(fiber.StatusBadRequest).Send([]byte(err.Error()))
	}

	// Create database context with timeout
	queryCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(DB.Pool)

	// Log event type for debugging
	slog.Info("Processing webhook event", "type", event.Type)

	switch event.Type {
	case "checkout.session.completed":
		if err := handleCheckoutSessionCompleted(c, queries, event); err != nil {
			slog.Error("Error handling completed checkout", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte(err.Error()))
		}

	case "checkout.session.expired", "payment_intent.payment_failed":
		if err := handlePaymentFailure(queryCtx, queries, event); err != nil {
			slog.Error("Error handling payment failure", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte(err.Error()))
		}
	}

	return c.SendString("Webhook processed successfully")
}

func handleCheckoutSessionCompleted(ctx *fiber.Ctx, queries *sqlc_gen.Queries, event stripe.Event) error {
	var session stripe.CheckoutSession
	if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
		slog.Error("Failed to unmarshal session",
			"error", err,
			"raw_data", string(event.Data.Raw),
		)
		return fmt.Errorf("error parsing webhook payload: %w", err)
	}

	// Log session details for debugging
	slog.Info("Parsed checkout session",
		"session_id", session.ID,
		"payment_intent_present", session.PaymentIntent != nil,
		"customer_present", session.Customer != nil,
		"line_items_present", session.LineItems != nil && len(session.LineItems.Data) > 0,
		"raw_data", string(event.Data.Raw),
	)

	// Validate required fields
	if session.PaymentIntent == nil {
		return fmt.Errorf("missing payment intent in checkout session")
	}
	if session.Customer == nil {
		return fmt.Errorf("missing customer in checkout session")
	}

	// Get customer UUID

	c := ctx.Context()
	customer, err := queries.GetCustomerByStripeID(c, session.Customer.ID)
	if err != nil {
		return fmt.Errorf("error getting customer: %w", err)
	}

	// Prepare metadata
	metadata := map[string]interface{}{
		"checkout_session_id": session.ID,
	}
	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("error marshaling metadata: %w", err)
	}

	// Upsert payment record

	err = queries.UpsertPayment(c, sqlc_gen.UpsertPaymentParams{
		PaymentID: session.PaymentIntent.ID, // Changed from session.PaymentIntent.ID
		UserID:    customer.ID,
		Status:    sqlc_gen.PaymentStatusCompleted,
		PriceID:   session.Metadata["price_id"], // Using sessionWithItems
		Amount:    int32(session.AmountTotal),
		Currency:  string(session.Currency),
		Metadata:  metadataJSON,
		CreatedAt: db.Int64ToTimestamptz(session.Created),
		UpdatedAt: db.Int64ToTimestamptz(time.Now().Unix()),
	})
	if err != nil {
		return fmt.Errorf("error upserting payment: %w", err)
	}

	return nil
}

func getPriceIDFromAmount(ctx context.Context, queries *sqlc_gen.Queries, amount int32, currency string) (string, error) {
	price, err := queries.GetPriceByAmount(ctx, sqlc_gen.GetPriceByAmountParams{
		UnitAmount: amount,
		Currency:   currency,
	})
	if err != nil {
		return "", fmt.Errorf("error getting price: %w", err)
	}
	return price, nil
}

func handlePaymentFailure(ctx context.Context, queries *sqlc_gen.Queries, event stripe.Event) error {
	var paymentIntent stripe.PaymentIntent

	if event.Type == "checkout.session.expired" {
		var session stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
			slog.Error("Failed to unmarshal session",
				"error", err,
				"raw_data", string(event.Data.Raw),
			)
			return fmt.Errorf("error parsing webhook payload: %w", err)
		}

	} else {
		if err := json.Unmarshal(event.Data.Raw, &paymentIntent); err != nil {
			return fmt.Errorf("error parsing webhook payload: %w", err)
		}
	}

	// Trouver le price_id correspondant au montant
	priceID, err := getPriceIDFromAmount(ctx, queries, int32(paymentIntent.Amount), string(paymentIntent.Currency))
	if err != nil {
		slog.Warn("Could not find price for amount",
			"amount", paymentIntent.Amount,
			"currency", paymentIntent.Currency,
		)
		// On continue même si on ne trouve pas le price_id car il n'est pas obligatoire
	}

	customer, err := queries.GetCustomerByStripeID(ctx, paymentIntent.Customer.ID)
	if err != nil {
		return fmt.Errorf("error getting customer: %w", err)
	}

	// Prepare failure metadata
	metadata := map[string]interface{}{
		"event_type": event.Type,
	}
	if paymentIntent.LastPaymentError != nil {
		metadata["failure_reason"] = paymentIntent.LastPaymentError.Msg
		metadata["failure_code"] = paymentIntent.LastPaymentError.Code
	}

	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("error marshaling failure metadata: %w", err)
	}

	// Upsert failed payment record
	err = queries.UpsertPayment(ctx, sqlc_gen.UpsertPaymentParams{
		PaymentID: paymentIntent.ID,
		UserID:    customer.ID,
		Status:    sqlc_gen.PaymentStatusFailed,
		PriceID:   priceID, // Peut être vide si pas trouvé
		Amount:    int32(paymentIntent.Amount),
		Currency:  string(paymentIntent.Currency),
		Metadata:  metadataJSON,
		CreatedAt: db.Int64ToTimestamptz(paymentIntent.Created),
		UpdatedAt: db.Int64ToTimestamptz(time.Now().Unix()),
	})
	if err != nil {
		return fmt.Errorf("error upserting failed payment: %w", err)
	}

	return nil
}
