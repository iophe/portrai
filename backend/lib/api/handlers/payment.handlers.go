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

// HandleWebhook processes Stripe webhook events
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
	case "customer.subscription.created", "customer.subscription.updated":
		var subscription_obj stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription_obj)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).Send([]byte("Error parsing webhook payload"))
		}

		customer, err := queries.GetCustomerByStripeID(query_ctx, subscription_obj.Customer.ID)
		if err != nil {
			slog.Error("Error getting customer", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error processing webhook"))
		}

		err = queries.UpsertSubscription(query_ctx, sqlc_gen.UpsertSubscriptionParams{
			SubscriptionID:     subscription_obj.ID,
			UserID:             customer.ID,
			Status:             sqlc_gen.SubscriptionStatus(subscription_obj.Status),
			PriceID:            subscription_obj.Items.Data[0].Price.ID,
			Quantity:           int32(subscription_obj.Items.Data[0].Quantity),
			CancelAtPeriodEnd:  subscription_obj.CancelAtPeriodEnd,
			CurrentPeriodStart: db.Int64ToTimestamptz(subscription_obj.CurrentPeriodStart),
			CurrentPeriodEnd:   db.Int64ToTimestamptz(subscription_obj.CurrentPeriodEnd),
			CreatedAt:          db.Int64ToTimestamptz(subscription_obj.Created),
			EndedAt:            db.Int64ToTimestamptz(subscription_obj.EndedAt),
			CancelAt:           db.Int64ToTimestamptz(subscription_obj.CancelAt),
			CanceledAt:         db.Int64ToTimestamptz(subscription_obj.CanceledAt),
			TrialStart:         db.Int64ToTimestamptz(subscription_obj.TrialStart),
			TrialEnd:           db.Int64ToTimestamptz(subscription_obj.TrialEnd),
		})
		if err != nil {
			slog.Error("Error upserting subscription", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error updating subscription"))
		}

	case "customer.subscription.deleted":
		var subscription_obj stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription_obj)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).Send([]byte("Error parsing webhook payload"))
		}

		err = queries.DeleteSubscription(query_ctx, subscription_obj.ID)
		if err != nil {
			slog.Error("Error deleting subscription", "err", err)
			return c.Status(fiber.StatusInternalServerError).Send([]byte("Error deleting subscription"))
		}
	}

	return c.SendString("Webhook processed successfully")
}

// HandleCancelSubscription cancels a subscription
func HandleCancelSubscription(c *fiber.Ctx, params CancelSubscriptionParams, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	subscription, err := queries.GetSubscriptionByID(query_ctx, params.SubscriptionID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Subscription not found",
		})
	}

	if subscription.UserID != user_id {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Not authorized to cancel this subscription",
		})
	}

	err = payment.CancelStripeSubscription(params.SubscriptionID)
	if err != nil {
		slog.Error("Error canceling subscription", "err", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to cancel subscription",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Subscription cancelled successfully",
	})
}
