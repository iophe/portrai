package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/db"
	"backend/lib/services/payment"
	"backend/lib/utils"
	"backend/sqlc_gen"
	"context"
	"encoding/json"
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

func HandleWebhook(c *fiber.Ctx, DB *db.Database) error {
	stripe.Key = utils.STRIPE_SECRET_KEY
	webhook_secret := utils.STRIPE_WEBHOOK_SECRET

	// 1. Debug tous les headers
	slog.Info("ALL HEADERS:", "headers", c.GetReqHeaders())

	// 2. Vérifier que le body est bien reçu et non altéré
	payload := c.BodyRaw()
	slog.Info("Payload received",
		"size", len(payload),
		"start", string(payload)[:100],
	)

	// 3. Vérifier que la bonne clé webhook est utilisée
	slog.Info("Webhook secret check",
		"starts_with", webhook_secret[:6],
		"length", len(webhook_secret),
	)

	// 4. Rechercher la signature dans différents formats de header
	sig := c.Get("Stripe-Signature")
	if sig == "" {
		sig = c.Get("stripe-signature")
	}
	if sig == "" {
		sig = string(c.Request().Header.Peek("Stripe-Signature"))
	}

	slog.Info("Signature found", "signature", sig)

	event, err := webhook.ConstructEvent(payload, sig, webhook_secret)
	if err != nil {
		slog.Error("Signature verification failed",
			"error", err,
			"has_signature", sig != "",
			"payload_size", len(payload),
		)
		return c.Status(fiber.StatusBadRequest).Send([]byte(err.Error()))
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(DB.Pool)

	switch event.Type {
	case "checkout.session.completed":
		var session stripe.CheckoutSession
		err := json.Unmarshal(event.Data.Raw, &session)
		if err != nil {
			slog.Error("Error parsing webhook payload", "err", err)
			return c.Status(fiber.StatusBadRequest).Send([]byte("Error parsing webhook payload"))
		}

		// Récupérer le customer pour avoir son UUID
		customer, err := queries.GetCustomerByStripeID(query_ctx, session.Customer.ID)
		if err != nil {
			slog.Error("Error getting customer", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error getting customer"))
		}

		metadata := map[string]interface{}{
			"checkout_session_id": session.ID,
		}
		metadataJSON, err := json.Marshal(metadata)
		if err != nil {
			slog.Error("Error marshaling metadata", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error processing metadata"))
		}

		err = queries.UpsertPayment(query_ctx, sqlc_gen.UpsertPaymentParams{
			PaymentID: session.PaymentIntent.ID,
			UserID:    customer.ID, // Utilisation de l'UUID du customer
			Status:    sqlc_gen.PaymentStatusCompleted,
			PriceID:   session.LineItems.Data[0].Price.ID,
			Amount:    int32(session.AmountTotal),
			Currency:  string(session.Currency),
			Metadata:  metadataJSON,
			CreatedAt: db.Int64ToTimestamptz(session.Created),
			UpdatedAt: db.Int64ToTimestamptz(time.Now().Unix()),
		})
		if err != nil {
			slog.Error("Error upserting payment", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error recording payment"))
		}

	case "checkout.session.expired", "payment_intent.payment_failed":
		var paymentIntent stripe.PaymentIntent
		if event.Type == "checkout.session.expired" {
			var session stripe.CheckoutSession
			err := json.Unmarshal(event.Data.Raw, &session)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).Send([]byte("Error parsing webhook payload"))
			}
			paymentIntent = *session.PaymentIntent
		} else {
			err := json.Unmarshal(event.Data.Raw, &paymentIntent)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).Send([]byte("Error parsing webhook payload"))
			}
		}

		// Récupérer le customer pour avoir son UUID
		customer, err := queries.GetCustomerByStripeID(query_ctx, paymentIntent.Customer.ID)
		if err != nil {
			slog.Error("Error getting customer", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error getting customer"))
		}

		metadata := map[string]interface{}{
			"failure_reason": paymentIntent.LastPaymentError.Msg,
			"failure_code":   paymentIntent.LastPaymentError.Code,
		}
		metadataJSON, err := json.Marshal(metadata)
		if err != nil {
			slog.Error("Error marshaling failure metadata", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error processing failure metadata"))
		}

		err = queries.UpsertPayment(query_ctx, sqlc_gen.UpsertPaymentParams{
			PaymentID: paymentIntent.ID,
			UserID:    customer.ID, // Utilisation de l'UUID du customer
			Status:    sqlc_gen.PaymentStatusFailed,
			PriceID:   paymentIntent.Metadata["price_id"],
			Amount:    int32(paymentIntent.Amount),
			Currency:  string(paymentIntent.Currency),
			Metadata:  metadataJSON,
			CreatedAt: db.Int64ToTimestamptz(paymentIntent.Created),
			UpdatedAt: db.Int64ToTimestamptz(time.Now().Unix()),
		})
		if err != nil {
			slog.Error("Error upserting failed payment", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error recording failed payment"))
		}
	}

	return c.SendString("Webhook processed successfully")
}
