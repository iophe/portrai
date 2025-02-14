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
	Plan string `json:"plan"`
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
	price, err := queries.GetPriceByPlan(query_ctx, data.Plan)
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
	session_url, err := payment.CreateCheckoutSession(price.ProductID.String, price.ID, customer.StripeCustomerID.String)
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
	stripe.Key = utils.STRIPE_SECRET_KEY
	webhook_secret := utils.STRIPE_WEBHOOK_SECRET

	webhook_payload := c.Body()
	signature := c.Get("Stripe-Signature")

	event, err := webhook.ConstructEvent(webhook_payload, signature, webhook_secret)
	if err != nil {
		slog.Error("Error verifying webhook signature", "err", err)
		return c.Status(fiber.StatusBadRequest).Send([]byte("Webhook signature verification failed"))
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(DB.Pool)

	switch event.Type {
	case "checkout.session.completed":
		var session_obj stripe.CheckoutSession
		err := json.Unmarshal(event.Data.Raw, &session_obj)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).Send([]byte("Error parsing webhook payload"))
		}

		customer, err := queries.GetCustomerByStripeID(query_ctx, session_obj.Customer.ID)
		if err != nil {
			slog.Error("Error getting customer", "err", err)
			return c.Status(fiber.StatusBadRequest).Send([]byte("Error parsing webhook payload"))
		}
		metadata, err := json.Marshal(session_obj)
		if err != nil {
			slog.Error("error marshaling metadata", "err", err)
			return c.Status(fiber.StatusBadRequest).Send([]byte("Error parsing webhook payload"))
		}
		err = queries.InsertPayment(query_ctx, sqlc_gen.InsertPaymentParams{
			PaymentID: session_obj.PaymentIntent.ID,
			UserID:    customer.ID,
			PriceID:   session_obj.Metadata["price_id"],
			Amount:    int32(session_obj.AmountTotal),
			Currency:  string(session_obj.Currency),
			Metadata:  metadata,
			CreatedAt: db.Int64ToTimestamptz(session_obj.Created),
		})
		if err != nil {
			slog.Error("error InsertPayment", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error processing webhook"))
		}
		period, err := queries.GetValidityPeroidByProductID(query_ctx, session_obj.Metadata["product_id"])
		if err != nil {
			slog.Error("error GetValidityPeroidByProductID", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error processing webhook"))
		}
		period_duration := db.IntervalToDuration(period)

		err = queries.UpsertPaymentValidity(query_ctx, sqlc_gen.UpsertPaymentValidityParams{
			PaymentID: session_obj.PaymentIntent.ID,
			UserID:    customer.ID,
			PriceID:   session_obj.Metadata["price_id"],
			ExpiredAt: time.Now().Add(period_duration),
			Metadata:  metadata,
		})
		if err != nil {
			slog.Error("error UpsertPaymentValidity", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error processing webhook"))
		}

	case "checkout.session.expired", "payment_intent.payment_failed":
		var session_obj stripe.CheckoutSession
		err := json.Unmarshal(event.Data.Raw, &session_obj)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).Send([]byte("Error parsing webhook payload"))
		}
		slog.Warn("payement failed", "payment_id", session_obj.PaymentIntent.ID)
	}

	return c.SendString("Webhook processed successfully")
}
