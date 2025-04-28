package handlers

import (
	"backend/lib/api/middlewares"
	ca "backend/lib/services/cache"
	database "backend/lib/services/db"
	"backend/lib/services/mailer"
	"backend/lib/utils"
	"backend/sqlc_gen"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Response structure from Supabase Auth
type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	User         struct {
		Id    string `json:"id"`
		Email string `json:"email"`
	} `json:"user"`
}

type EmailSignupData struct {
	Email          string `json:"email"`
	Password       string `json:"password"`
	TermsAccepted  bool   `json:"terms_accepted"`
	EmailConfirm   bool   `json:"email_confirm,omitempty"`    // Whether to send confirmation email
	RedirectTo     string `json:"redirect_to,omitempty"`      // URL to redirect after verification
	DataInRedirect bool   `json:"data_in_redirect,omitempty"` // Whether to include user data in redirect
}

func HandleEmailSignup(c *fiber.Ctx, data EmailSignupData, db *database.Database) (AuthResponse, error) {
	// Validate input
	if data.Email == "" || data.Password == "" {
		return AuthResponse{}, fmt.Errorf("Email and password are required")
	}
	data.EmailConfirm = true
	data.RedirectTo = utils.APP_URL + "/verify-account"
	response, err := makeSupabaseRequest("POST", "signup", data)
	if err != nil {
		return AuthResponse{}, fmt.Errorf("failed to communicate with auth service: %w", err)
	}

	auth_response, err := handleSupabaseResponse(response)
	if err != nil {
		return AuthResponse{}, err
	}
	return auth_response, nil
}

type EmailSigninData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func HandleEmailSignin(c *fiber.Ctx, data EmailSigninData) (AuthResponse, error) {
	if data.Email == "" || data.Password == "" {
		return AuthResponse{}, fmt.Errorf("email and password are required")
	}

	response, err := makeSupabaseRequest("POST", "token?grant_type=password", data)
	if err != nil {
		return AuthResponse{}, fmt.Errorf("failed to communicate with auth service: %w", err)
	}

	auth_response, err := handleSupabaseResponse(response)
	if err != nil {
		return AuthResponse{}, err
	}

	middlewares.SetAuthCookies(c, &middlewares.RefreshResponse{
		AccessToken:  auth_response.AccessToken,
		RefreshToken: auth_response.RefreshToken,
	})

	slog.Info("successfully signed in",
		"email", auth_response.User.Email,
		"id", auth_response.User.Id,
	)

	return auth_response, nil
}

type GoogleSignupData struct {
	IdToken       string `json:"id_token"`
	TermsAccepted bool   `json:"terms_accepted"`
}

func HandleGoogleSignup(c *fiber.Ctx, data GoogleSignupData, db *database.Database) (AuthResponse, error) {
	if data.IdToken == "" {
		return AuthResponse{}, fmt.Errorf("id_token is required")
	}

	// Prepare request data for Supabase (GoTrue)
	requestBody := map[string]interface{}{
		"id_token": data.IdToken,
		"provider": "google",
	}

	// Make request to Supabase Auth (GoTrue) using the token endpoint with OAuth grant type
	response, err := makeSupabaseRequest("POST", "token?grant_type=id_token", requestBody)
	if err != nil {
		return AuthResponse{}, fmt.Errorf("failed to communicate with auth service: %w", err)
	}

	auth_response, err := handleSupabaseResponse(response)
	if err != nil {
		return AuthResponse{}, err
	}

	var token *jwt.Token
	token, err = jwt.ParseWithClaims(auth_response.AccessToken, &middlewares.UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify signing algorithm
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// Get JWT secret from environment
		secret := utils.JWT_SECRET
		if secret == "" {
			return nil, fmt.Errorf("JWT_SECRET not set")
		}

		return []byte(secret), nil
	})
	if err != nil {
		return AuthResponse{}, err
	}

	claims, ok := token.Claims.(*middlewares.UserClaims)
	if !ok {
		return AuthResponse{}, err
	}

	c.Locals("USER_CLAIMS", *claims)

	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return AuthResponse{}, err
	}

	tx, err := db.Pool.Begin(c.Context())
	if err != nil {
		return AuthResponse{}, fmt.Errorf("Failed to start transaction")
	}
	defer tx.Rollback(c.Context())
	queries := sqlc_gen.New(tx)

	price, err := queries.GetPriceByPlan(c.Context(), utils.DEFAULT_PLAN)
	if err != nil {
		return AuthResponse{}, err
	}
	period, err := queries.GetValidityPeroidByProductID(c.Context(), price.ProductID.String)
	if err != nil {
		return AuthResponse{}, err
	}
	period_duration := database.IntervalToDuration(period)

	usage, err := queries.GetFeaturesUsageByProductID(c.Context(), price.ProductID.String)
	if err != nil {
		return AuthResponse{}, err
	}
	err = queries.UpsertPaymentValidity(c.Context(), sqlc_gen.UpsertPaymentValidityParams{
		PaymentID: uuid.NewString(),
		UserID:    user_id,
		PriceID:   price.ID,
		ExpiredAt: time.Now().Add(period_duration),
		Metadata:  []byte("{}"),
		Usage:     usage,
	})
	if err != nil {
		slog.Error("UpsertPaymentValidity", "err", err)
		return AuthResponse{}, err
	}

	if err = tx.Commit(c.Context()); err != nil {
		return AuthResponse{}, err
	}
	slog.Info("successfully signed in with Google",
		"email", auth_response.User.Email,
		"id", auth_response.User.Id,
	)

	middlewares.SetAuthCookies(c, &middlewares.RefreshResponse{
		AccessToken:  auth_response.AccessToken,
		RefreshToken: auth_response.RefreshToken,
	})

	return auth_response, nil
}

func HandleGoogleSignin(c *fiber.Ctx, data GoogleSignupData) (AuthResponse, error) {
	if data.IdToken == "" {
		return AuthResponse{}, fmt.Errorf("id_token is required")
	}

	// Prepare request data for Supabase (GoTrue)
	requestBody := map[string]interface{}{
		"id_token": data.IdToken,
		"provider": "google",
	}

	// Make request to Supabase Auth (GoTrue) using the token endpoint with OAuth grant type
	response, err := makeSupabaseRequest("POST", "token?grant_type=id_token", requestBody)
	if err != nil {
		return AuthResponse{}, fmt.Errorf("failed to communicate with auth service: %w", err)
	}

	auth_response, err := handleSupabaseResponse(response)
	if err != nil {
		return AuthResponse{}, err
	}

	// Set auth cookies, same as in email auth
	middlewares.SetAuthCookies(c, &middlewares.RefreshResponse{
		AccessToken:  auth_response.AccessToken,
		RefreshToken: auth_response.RefreshToken,
	})

	slog.Info("successfully signed in with Google",
		"email", auth_response.User.Email,
		"id", auth_response.User.Id,
	)

	return auth_response, nil
}

type GoogleCallbackQuery struct {
	Code string `query:"code"`
}

func HandleGoogleCallback(c *fiber.Ctx, query GoogleCallbackQuery) error {

	// Forward the request to the internal GoTrue service
	request, err := http.NewRequest("GET",
		fmt.Sprintf("%s/callback?provider=google&code=%s", utils.KONG_AUTH_URL, query.Code),
		nil)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create request",
		})
	}

	// Add necessary headers
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("apikey", utils.SERVICE_ROLE_KEY)

	// Execute the request
	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to communicate with auth service",
		})
	}
	defer response.Body.Close()

	// Read and parse the response
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read response",
		})
	}

	if response.StatusCode != http.StatusOK {
		return c.Status(response.StatusCode).Send(body)
	}

	// Parse the auth response
	var auth_response AuthResponse
	if err := json.Unmarshal(body, &auth_response); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse auth response",
		})
	}

	// Set auth cookies
	middlewares.SetAuthCookies(c, &middlewares.RefreshResponse{
		AccessToken:  auth_response.AccessToken,
		RefreshToken: auth_response.RefreshToken,
	})

	// Redirect to the frontend after successful authentication
	return c.Redirect("/")
}

func HandleLogout(c *fiber.Ctx) error {
	claims, err := middlewares.GetUserClaims(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}
	// Call Supabase logout endpoint
	request, err := http.NewRequest("POST", fmt.Sprintf("%s/logout", utils.KONG_AUTH_URL), nil)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create request",
		})
	}

	request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", claims.Bearer))
	request.Header.Set("apikey", utils.SERVICE_ROLE_KEY)

	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to logout",
		})
	}
	defer response.Body.Close()

	// Clear auth cookies regardless of Supabase response
	middlewares.ClearAuthCookies(c)
	middlewares.ClearActiveAccountCookies(c)

	slog.Info("successfully signed out", "email", claims.Email, "id", claims.UserId)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "successfully logged out",
	})
}

func HandleDeleteAccount(c *fiber.Ctx, cache *ca.Cache, db *database.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	// Delete users data from the storage, the cache and the database
	request, err := http.NewRequest("DELETE", fmt.Sprintf("%s/admin/users/%s", utils.KONG_AUTH_URL, user_id), nil)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create request",
		})
	}
	bearer, err := createSupabaseAdminToken()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create request",
		})
	}
	request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", bearer))
	request.Header.Set("apikey", utils.SERVICE_ROLE_KEY)

	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to delete account",
		})
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		body_bytes, err := io.ReadAll(response.Body)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "failed to delete account",
				"details": err.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to delete account",
			"details": string(body_bytes),
		})
	}
	// Clear auth cookies after successful deletion
	middlewares.ClearAuthCookies(c)
	middlewares.ClearActiveAccountCookies(c)

	slog.Info("successfully deleted", "id", user_id)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "account successfully deleted",
	})
}

// Extract email from request
type ResendVerificationData struct {
	Email string `json:"email"`
}

// ResendVerificationEmail sends another verification email to the user
func HandleResendVerification(c *fiber.Ctx, data ResendVerificationData) error {
	if data.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email is required",
		})
	}

	// Prepare request for GoTrue
	requestBody := map[string]interface{}{
		"email": data.Email,
		"type":  "signup",
	}

	// Send request to resend verification email
	response, err := makeSupabaseRequest("POST", "otp", requestBody)
	if err != nil {
		slog.Error("Failed to resend verification email", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to resend verification email",
		})
	}

	// Check response
	if response.StatusCode != http.StatusOK {
		body_bytes, err := io.ReadAll(response.Body)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to read response from auth service",
			})
		}

		response.Body.Close()
		return c.Status(response.StatusCode).JSON(fiber.Map{
			"error": string(body_bytes),
		})
	}

	slog.Info("Successfully resent verification email", "email", data.Email)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Verification email has been resent",
	})
}

type VerifyEmailData struct {
	Token      string `json:"token"`
	Type       string `json:"type"`
	RedirectTo string `json:"redirect_to,omitempty"`
}

// VerifyEmail handles email verification token
func HandleVerifyEmail(c *fiber.Ctx, data VerifyEmailData, db *database.Database) error {
	if data.Token == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Token is required",
		})
	}

	// Set verification type if not provided
	if data.Type == "" {
		data.Type = "signup"
	}

	// Prepare request for GoTrue
	requestBody := map[string]interface{}{
		"token_hash": data.Token,
		"type":       data.Type,
	}

	// Add redirect URL if provided
	if data.RedirectTo != "" {
		requestBody["redirect_to"] = data.RedirectTo
	}

	// Send request to verify email
	response, err := makeSupabaseRequest("POST", "verify", requestBody)
	if err != nil {
		slog.Error("Failed to verify email", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to verify email",
		})
	}

	// Handle response
	auth_response, err := handleSupabaseResponse(response)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Update user cookies with new tokens
	middlewares.SetAuthCookies(c, &middlewares.RefreshResponse{
		AccessToken:  auth_response.AccessToken,
		RefreshToken: auth_response.RefreshToken,
	})

	err = mailer.MailGreeting(mailer.GreetingData{
		Email: auth_response.User.Email,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	var token *jwt.Token
	token, err = jwt.ParseWithClaims(auth_response.AccessToken, &middlewares.UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify signing algorithm
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// Get JWT secret from environment
		secret := utils.JWT_SECRET
		if secret == "" {
			return nil, fmt.Errorf("JWT_SECRET not set")
		}

		return []byte(secret), nil
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	claims, ok := token.Claims.(*middlewares.UserClaims)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	c.Locals("USER_CLAIMS", *claims)

	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	tx, err := db.Pool.Begin(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	defer tx.Rollback(c.Context())
	queries := sqlc_gen.New(tx)

	price, err := queries.GetPriceByPlan(c.Context(), utils.DEFAULT_PLAN)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	period, err := queries.GetValidityPeroidByProductID(c.Context(), price.ProductID.String)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	period_duration := database.IntervalToDuration(period)

	usage, err := queries.GetFeaturesUsageByProductID(c.Context(), price.ProductID.String)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	err = queries.UpsertPaymentValidity(c.Context(), sqlc_gen.UpsertPaymentValidityParams{
		PaymentID: uuid.NewString(),
		UserID:    user_id,
		PriceID:   price.ID,
		ExpiredAt: time.Now().Add(period_duration),
		Metadata:  []byte("{}"),
		Usage:     usage,
	})
	if err != nil {
		slog.Error("UpsertPaymentValidity", "err", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if err = tx.Commit(c.Context()); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	slog.Info("Successfully verified email",
		"email", auth_response.User.Email,
		"id", auth_response.User.Id,
	)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Email successfully verified",
		"user":    auth_response.User,
	})
}

type VerifyEmailCodeData struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

func HandleVerifyEmailCode(c *fiber.Ctx, data VerifyEmailCodeData) error {
	if data.Email == "" || data.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email and verification code are required",
		})
	}

	requestBody := map[string]interface{}{
		"email": data.Email,
		"token": data.Code,
		"type":  "signup",
	}

	response, err := makeSupabaseRequest("POST", "verify", requestBody)
	if err != nil {
		slog.Error("Failed to verify email with code", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to verify email with code",
		})
	}

	// Handle response
	auth_response, err := handleSupabaseResponse(response)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Update user cookies with new tokens
	middlewares.SetAuthCookies(c, &middlewares.RefreshResponse{
		AccessToken:  auth_response.AccessToken,
		RefreshToken: auth_response.RefreshToken,
	})

	err = mailer.MailGreeting(mailer.GreetingData{
		Email: auth_response.User.Email,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	slog.Info("Successfully verified email with code",
		"email", auth_response.User.Email,
		"id", auth_response.User.Id,
	)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Email successfully verified",
		"user":    auth_response.User,
	})
}

type PasswordRecoveryData struct {
	Email      string `json:"email"`
	RedirectTo string `json:"redirect_to,omitempty"`
}

// Initiate password recovery process
func HandlePasswordRecovery(c *fiber.Ctx, data PasswordRecoveryData) error {
	if data.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email is required",
		})
	}

	// Prepare request for GoTrue
	requestBody := map[string]interface{}{
		"email": data.Email,
		"type":  "recovery",
	}

	// Add redirect URL if provided
	if data.RedirectTo != "" {
		requestBody["redirect_to"] = data.RedirectTo
	}

	// Send request to initiate password recovery
	response, err := makeSupabaseRequest("POST", "recover", requestBody)
	if err != nil {
		slog.Error("Failed to initiate password recovery", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to initiate password recovery",
		})
	}

	// Check response
	if response.StatusCode != http.StatusOK {
		body_bytes, err := io.ReadAll(response.Body)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to read response from auth service",
			})
		}
		defer response.Body.Close()

		return c.Status(response.StatusCode).JSON(fiber.Map{
			"error": string(body_bytes),
		})
	}
	defer response.Body.Close()

	slog.Info("Successfully initiated password recovery", "email", data.Email)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Password recovery email has been sent",
	})
}

// Resend the password recovery email
func HandleResendRecovery(c *fiber.Ctx, data PasswordRecoveryData) error {
	if data.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email is required",
		})
	}

	// Prepare request for GoTrue
	requestBody := map[string]interface{}{
		"email": data.Email,
		"type":  "recovery",
	}

	// Add redirect URL if provided
	if data.RedirectTo != "" {
		requestBody["redirect_to"] = data.RedirectTo
	}

	// Send request to resend recovery email
	response, err := makeSupabaseRequest("POST", "otp", requestBody)
	if err != nil {
		slog.Error("Failed to resend recovery email", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to resend recovery email",
		})
	}

	// Check response
	if response.StatusCode != http.StatusOK {
		body_bytes, err := io.ReadAll(response.Body)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to read response from auth service",
			})
		}
		defer response.Body.Close()

		return c.Status(response.StatusCode).JSON(fiber.Map{
			"error": string(body_bytes),
		})
	}
	defer response.Body.Close()

	slog.Info("Successfully resent recovery email", "email", data.Email)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Password recovery email has been resent",
	})
}

type PasswordResetData struct {
	Token      string `json:"token"`
	Password   string `json:"password"`
	RedirectTo string `json:"redirect_to,omitempty"`
}

// Reset password using token from email
func HandlePasswordReset(c *fiber.Ctx, data PasswordResetData) error {
	if data.Token == "" || data.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Token and password are required",
		})
	}

	requestBody := map[string]interface{}{
		"type":       "recovery",
		"token_hash": data.Token,
		"password":   data.Password,
	}

	// Add redirect URL if provided
	if data.RedirectTo != "" {
		requestBody["redirect_to"] = data.RedirectTo
	}

	// Send request to verify & update password
	response, err := makeSupabaseRequest("POST", "verify", requestBody)
	if err != nil {
		slog.Error("Failed to reset password", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to reset password: " + err.Error(),
		})
	}

	// Handle response
	auth_response, err := handleSupabaseResponse(response)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Prepare request for GoTrue
	requestBody = map[string]interface{}{
		"email":    auth_response.User.Email,
		"password": data.Password,
	}

	// Send request to verify and reset password
	json_data, err := json.Marshal(requestBody)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Errorf("failed to marshal request data: %w", err).Error(),
		})
	}

	supabase_url := fmt.Sprintf("%s/%s", utils.KONG_AUTH_URL, "user")
	request, err := http.NewRequest("PUT", supabase_url, bytes.NewBuffer(json_data))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Errorf("failed to create request: %w", err).Error(),
		})
	}

	request.Header.Set("Content-Type", "application/json")
	claims := jwt.MapClaims{
		"role": "service_role",
		"sub":  auth_response.User.Id,
		"iss":  "supabase",
		"iat":  time.Now().Unix(),
		"exp":  time.Now().Add(time.Hour).Unix(), // Token valid for 1 hour
	}

	// Create the token with the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	bearer, err := token.SignedString([]byte(utils.JWT_SECRET))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create request",
		})
	}
	request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", bearer))
	request.Header.Set("apikey", utils.SERVICE_ROLE_KEY)

	client := &http.Client{}
	response, err = client.Do(request)
	if err != nil {
		slog.Error("Failed to reset password", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to reset password",
		})
	}

	// Handle response
	auth_response, err = handleSupabaseResponse(response)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Update user cookies with new tokens
	middlewares.SetAuthCookies(c, &middlewares.RefreshResponse{
		AccessToken:  auth_response.AccessToken,
		RefreshToken: auth_response.RefreshToken,
	})

	slog.Info("Successfully reset password",
		"email", auth_response.User.Email,
		"id", auth_response.User.Id,
	)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Password successfully reset",
		"user":    auth_response.User,
	})
}

type PasswordResetCodeData struct {
	Email    string `json:"email"`
	Code     string `json:"code"`
	Password string `json:"password"`
}

// Reset password using numerical code
func HandlePasswordResetWithCode(c *fiber.Ctx, data PasswordResetCodeData) error {
	if data.Email == "" || data.Code == "" || data.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email, code, and password are required",
		})
	}

	// Prepare request for GoTrue
	requestBody := map[string]interface{}{
		"email":    data.Email,
		"token":    data.Code,
		"password": data.Password,
		"type":     "recovery",
	}

	// Send request to verify and reset password
	response, err := makeSupabaseRequest("POST", "verify", requestBody)
	if err != nil {
		slog.Error("Failed to reset password with code", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to reset password with code",
		})
	}

	// Handle response
	auth_response, err := handleSupabaseResponse(response)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Prepare request for GoTrue
	requestBody = map[string]interface{}{
		"email":    auth_response.User.Email,
		"password": data.Password,
	}

	// Send request to verify and reset password
	json_data, err := json.Marshal(requestBody)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Errorf("failed to marshal request data: %w", err).Error(),
		})
	}

	supabase_url := fmt.Sprintf("%s/%s", utils.KONG_AUTH_URL, "user")
	request, err := http.NewRequest("PUT", supabase_url, bytes.NewBuffer(json_data))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Errorf("failed to create request: %w", err).Error(),
		})
	}

	request.Header.Set("Content-Type", "application/json")
	claims := jwt.MapClaims{
		"role": "service_role",
		"sub":  auth_response.User.Id,
		"iss":  "supabase",
		"iat":  time.Now().Unix(),
		"exp":  time.Now().Add(time.Hour).Unix(), // Token valid for 1 hour
	}

	// Create the token with the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	bearer, err := token.SignedString([]byte(utils.JWT_SECRET))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create request",
		})
	}
	request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", bearer))
	request.Header.Set("apikey", utils.SERVICE_ROLE_KEY)

	client := &http.Client{}
	response, err = client.Do(request)
	if err != nil {
		slog.Error("Failed to reset password", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to reset password",
		})
	}

	// Handle response
	auth_response, err = handleSupabaseResponse(response)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Update user cookies with new tokens
	middlewares.SetAuthCookies(c, &middlewares.RefreshResponse{
		AccessToken:  auth_response.AccessToken,
		RefreshToken: auth_response.RefreshToken,
	})

	slog.Info("Successfully reset password with code",
		"email", auth_response.User.Email,
		"id", auth_response.User.Id,
	)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Password successfully reset",
		"user":    auth_response.User,
	})
}

type PasswordUpdateData struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

// Reset password using numerical code
func HandlePasswordUpdate(c *fiber.Ctx, data PasswordUpdateData) error {
	user_claims, err := middlewares.GetUserClaims(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	signinData := EmailSigninData{
		Email:    user_claims.Email,
		Password: data.CurrentPassword,
	}

	_, err = HandleEmailSignin(c, signinData)
	if err != nil {
		slog.Error("Failed to verify current password", "error", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Current password is incorrect",
		})
	}

	// Prepare request for GoTrue
	requestBody := map[string]interface{}{
		"email":    user_claims.Email,
		"password": data.NewPassword,
	}

	// Send request to verify and reset password
	json_data, err := json.Marshal(requestBody)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Errorf("failed to marshal request data: %w", err).Error(),
		})
	}

	supabase_url := fmt.Sprintf("%s/%s", utils.KONG_AUTH_URL, "user")
	request, err := http.NewRequest("PUT", supabase_url, bytes.NewBuffer(json_data))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Errorf("failed to create request: %w", err).Error(),
		})
	}

	request.Header.Set("Content-Type", "application/json")
	claims := jwt.MapClaims{
		"role": "service_role",
		"sub":  user_id,
		"iss":  "supabase",
		"iat":  time.Now().Unix(),
		"exp":  time.Now().Add(time.Hour).Unix(), // Token valid for 1 hour
	}

	// Create the token with the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	bearer, err := token.SignedString([]byte(utils.JWT_SECRET))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create request",
		})
	}
	request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", bearer))
	request.Header.Set("apikey", utils.SERVICE_ROLE_KEY)

	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		slog.Error("Failed to reset password", "error", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to reset password",
		})
	}

	// Handle response
	auth_response, err := handleSupabaseResponse(response)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Update user cookies with new tokens
	middlewares.SetAuthCookies(c, &middlewares.RefreshResponse{
		AccessToken:  auth_response.AccessToken,
		RefreshToken: auth_response.RefreshToken,
	})

	slog.Info("Successfully updated password",
		"email", auth_response.User.Email,
		"id", auth_response.User.Id,
	)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Password successfully updated",
		"user":    auth_response.User,
	})
}

func HandleGetAuthUserEmail(c *fiber.Ctx) error {
	claims, err := middlewares.GetUserClaims(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"email": claims.Email,
	})
}

func createSupabaseAdminToken() (string, error) {
	// Create claims with admin access
	claims := jwt.MapClaims{
		"role": "service_role",
		"iss":  "supabase",
		"iat":  time.Now().Unix(),
		"exp":  time.Now().Add(time.Hour).Unix(), // Token valid for 1 hour
	}

	// Create the token with the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(utils.JWT_SECRET))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

type SupabaseError struct {
	Message   string `json:"message,omitempty"`
	Msg       string `json:"msg,omitempty"`
	Error     string `json:"error,omitempty"`
	ErrorCode string `json:"error_code,omitempty"`
}

func makeSupabaseRequest(method, endpoint string, data interface{}) (*http.Response, error) {
	json_data, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request data: %w", err)
	}

	supabase_url := fmt.Sprintf("%s/%s", utils.KONG_AUTH_URL, endpoint)
	request, err := http.NewRequest(method, supabase_url, bytes.NewBuffer(json_data))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("apikey", utils.SERVICE_ROLE_KEY)

	client := &http.Client{}
	return client.Do(request)
}

func handleSupabaseResponse(response *http.Response) (AuthResponse, error) {
	defer response.Body.Close()

	body_bytes, err := io.ReadAll(response.Body)
	if err != nil {
		return AuthResponse{}, fmt.Errorf("failed to read response body: %w", err)
	}

	if response.StatusCode >= 400 {
		var error_resp SupabaseError
		slog.Info(string(body_bytes))
		if err := json.Unmarshal(body_bytes, &error_resp); err != nil {
			slog.Error("", "err", err)
			return AuthResponse{}, fmt.Errorf("auth service error (status %d): failed to parse error response",
				response.StatusCode)
		}
		slog.Error("Supabase error while handling the request", "body", string(body_bytes))
		error_msg := error_resp.Message
		if error_msg == "" {
			error_msg = error_resp.Msg
		}
		if error_msg == "" {
			error_msg = error_resp.Error
		}
		if error_msg == "" {
			error_msg = error_resp.ErrorCode
		}
		if error_msg == "" {
			error_msg = "unexpected error"
		}
		return AuthResponse{}, fmt.Errorf("auth service error (status %d): %s",
			response.StatusCode, error_msg)
	}

	var auth_response AuthResponse
	if err := json.Unmarshal(body_bytes, &auth_response); err != nil {
		return AuthResponse{}, fmt.Errorf("failed to parse auth response: %w", err)
	}

	return auth_response, nil
}
