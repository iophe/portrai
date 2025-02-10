package payment

import (
	"backend/lib/utils"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
	"github.com/stripe/stripe-go/v81/customer"
)

// CreateStripeCustomer creates a new customer in Stripe
func CreateStripeCustomer(email string, name string) (*stripe.Customer, error) {
	stripe.Key = utils.STRIPE_SECRET_KEY

	params := &stripe.CustomerParams{
		Email: stripe.String(email),
		Name:  stripe.String(name),
	}

	return customer.New(params)
}

// CreateCheckoutSession creates a new Stripe checkout session
func CreateCheckoutSession(price_id string, customer_id string) (string, error) {
	stripe.Key = utils.STRIPE_SECRET_KEY

	params := &stripe.CheckoutSessionParams{
		Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(price_id),
				Quantity: stripe.Int64(1),
			},
		},
		Customer:   stripe.String(customer_id),
		SuccessURL: stripe.String(utils.STRIPE_SUCCESS_URL),
		CancelURL:  stripe.String(utils.STRIPE_CANCEL_URL),
		Metadata: map[string]string{
			"price_id": price_id, // Save the price here
		},
	}

	session_obj, err := session.New(params)
	if err != nil {
		return "", err
	}

	return session_obj.URL, nil
}
