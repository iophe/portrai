package utils

import (
	"fmt"
	"os"
	"strconv"
)

// SERVER CONF
var SERVER_PORT = os.Getenv("PORT")
var LOG_FILEPATH = os.Getenv("LOG_FILEPATH")
var APP_URL = os.Getenv("APP_URL")
var SECURE_COOKIE = Must(strconv.ParseBool(os.Getenv("SECURE_COOKIE")))

// MAILER CONF
var MAILER_SMTP_HOST = os.Getenv("MAILER_SMTP_HOST")
var MAILER_SMTP_PORT = Must(strconv.Atoi(os.Getenv("MAILER_SMTP_PORT")))
var MAILER_SMTP_USERNAME = os.Getenv("MAILER_SMTP_USERNAME")
var MAILER_SMTP_PASSWORD = os.Getenv("MAILER_SMTP_PASSWORD")

// DATABASE CONF
var POSTGRES_PASSWORD = os.Getenv("POSTGRES_PASSWORD")
var POSTGRES_HOST = os.Getenv("POSTGRES_HOST")
var POSTGRES_DB = os.Getenv("POSTGRES_DB")
var POSTGRES_PORT = os.Getenv("POSTGRES_PORT")
var POSTGRES_USER = os.Getenv("POSTGRES_USER")

// CACHE CONF
var DRAGONFLY_PASSWORD = os.Getenv("DRAGONFLY_PASSWORD")
var DRAGONFLY_ADDR = os.Getenv("DRAGONFLY_ADDR")
var DRAGONFLY_PORT = os.Getenv("DRAGONFLY_PORT")
var DRAGONFLY_USER = os.Getenv("DRAGONFLY_USER")

// SECRETS
var SERVICE_ROLE_KEY = os.Getenv("SERVICE_ROLE_KEY")
var JWT_SECRET = os.Getenv("JWT_SECRET")
var PAYMENT_SECRET = os.Getenv("PAYMENT_SECRET")
var COOKIES_ENCRYPTION_KEY = os.Getenv("COOKIES_ENCRYPTION_KEY")

// AUTH
var KONG_AUTH_HOST = os.Getenv("KONG_AUTH_HOST")
var KONG_AUTH_PORT = os.Getenv("KONG_AUTH_PORT")
var KONG_AUTH_URL = fmt.Sprintf("http://%s:%s/auth/v1", KONG_AUTH_HOST, KONG_AUTH_PORT)
var KONG_STORAGE_URL = fmt.Sprintf("http://%s:%s/storage/v1", KONG_AUTH_HOST, KONG_AUTH_PORT)
var GOTRUE_AUTH_HOST = os.Getenv("GOTRUE_AUTH_HOST")
var GOTRUE_AUTH_PORT = os.Getenv("GOTRUE_AUTH_PORT")
var GOTRUE_AUTH_URL = fmt.Sprintf("http://%s:%s", GOTRUE_AUTH_HOST, GOTRUE_AUTH_PORT)

// Stripe
var STRIPE_SECRET_KEY = os.Getenv("STRIPE_SECRET_KEY")
var STRIPE_WEBHOOK_SECRET = os.Getenv("STRIPE_WEBHOOK_SECRET")
var STRIPE_SUCCESS_URL = os.Getenv("STRIPE_SUCCESS_URL")
var STRIPE_CANCEL_URL = os.Getenv("STRIPE_CANCEL_URL")

// ANTHROPIC
var ANTHROPIC_SECRET_KEY = os.Getenv("ANTHROPIC_SECRET_KEY")

func Must[T any](obj T, err error) T {
	if err != nil {
		panic(err)
	}
	return obj
}
