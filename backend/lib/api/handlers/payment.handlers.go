package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/db"
	"backend/lib/services/mailer"
	"backend/lib/services/payment"
	"backend/lib/utils"
	"backend/sqlc_gen"
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

	queries := sqlc_gen.New(db.Pool)

	// Get price details from database
	price, err := queries.GetPriceByPlan(c.Context(), data.Plan)
	if err != nil {
		slog.Error("Error getting price", "err", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Price not found",
		})
	}

	// Get or create customer
	customer, err := queries.GetCustomerByUserID(c.Context(), user_id)
	if err != nil {
		stripe_customer, err := payment.CreateStripeCustomer(user_email, "")
		if err != nil {
			slog.Error("Error creating stripe customer", "err", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create customer",
			})
		}

		err = queries.CreateCustomer(c.Context(), sqlc_gen.CreateCustomerParams{
			UserID:           user_id,
			StripeCustomerID: stripe_customer.ID,
			Email:            user_email,
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
		slog.Error("verifying webhook signature", "err", err)
		return c.Status(fiber.StatusBadRequest).Send([]byte("Webhook signature verification failed"))
	}
	tx, err := DB.Pool.Begin(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to start transaction",
		})
	}
	defer tx.Rollback(c.Context())
	queries := sqlc_gen.New(tx)

	switch event.Type {
	case "checkout.session.completed":

		var session_obj stripe.CheckoutSession

		err := json.Unmarshal(event.Data.Raw, &session_obj)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).Send([]byte("Error parsing webhook payload"))
		}

		customer, err := queries.GetCustomerByStripeID(c.Context(), session_obj.Customer.ID)
		if err != nil {
			slog.Error("getting customer", "err", err)
			return c.Status(fiber.StatusBadRequest).Send([]byte("Error parsing webhook payload"))
		}
		metadata, err := json.Marshal(session_obj)
		if err != nil {
			slog.Error("marshaling metadata", "err", err)
		}

		err = queries.InsertPayment(c.Context(), sqlc_gen.InsertPaymentParams{
			PaymentID:        session_obj.PaymentIntent.ID,
			UserID:           customer.ID.Bytes,
			StripeCustomerID: customer.StripeCustomerID.String,
			PriceID:          session_obj.Metadata["price_id"],
			Amount:           int32(session_obj.AmountTotal),
			Currency:         string(session_obj.Currency),
			Metadata:         metadata,
			CreatedAt:        db.Int64ToTimestamptz(session_obj.Created),
		})
		if err != nil {
			slog.Error("InsertPayment", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error processing webhook"))
		}
		period, err := queries.GetValidityPeroidByProductID(c.Context(), session_obj.Metadata["product_id"])
		if err != nil {
			slog.Error("GetValidityPeroidByProductID", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error processing webhook"))
		}
		period_duration := db.IntervalToDuration(period)

		usage, err := queries.GetFeaturesUsageByProductID(c.Context(), session_obj.Metadata["product_id"])
		if err != nil {
			slog.Error("GetFeaturesUsageByProductID", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error processing webhook"))
		}

		err = queries.UpsertPaymentValidity(c.Context(), sqlc_gen.UpsertPaymentValidityParams{
			PaymentID: session_obj.PaymentIntent.ID,
			UserID:    customer.ID.Bytes,
			PriceID:   session_obj.Metadata["price_id"],
			ExpiredAt: time.Now().Add(period_duration),
			Metadata:  metadata,
			Usage:     usage,
		})
		if err != nil {
			slog.Error("UpsertPaymentValidity", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error processing webhook"))
		}

		_ = mailer.MailThanksPayment(mailer.ThanksPaymentData{
			Email: customer.Email.String,
		})

	case "checkout.session.expired", "payment_intent.payment_failed":
		var session_obj stripe.CheckoutSession
		err := json.Unmarshal(event.Data.Raw, &session_obj)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).Send([]byte("Error parsing webhook payload"))
		}
		slog.Warn("payement failed", "payment_id", session_obj.PaymentIntent.ID)
	}

	if err = tx.Commit(c.Context()); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to commit transaction",
		})
	}
	return c.SendString("Webhook processed successfully")
}

func HandlePaymentValidityStatus(c *fiber.Ctx, DB *db.Database) error {

	queries := sqlc_gen.New(DB.Pool)

	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	validity_status, err := queries.GetUserValidityStatus(c.Context(), user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Could not get profile",
			"details": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"validity_status": validity_status,
	})
}

func HandlePaymentHistory(c *fiber.Ctx, DB *db.Database) error {

	queries := sqlc_gen.New(DB.Pool)

	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	payment_history, err := queries.GetUserPaymentHistory(c.Context(), user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Could not get profile",
			"details": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"payment_history": payment_history,
	})
}
