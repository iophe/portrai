package handlers

import (
	"backend/lib/api/middlewares"
	ca "backend/lib/services/cache"
	"backend/lib/services/db"
	database "backend/lib/services/db"
	"backend/lib/utils"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
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
	EmailConfirm   bool   `json:"email_confirm,omitempty"`    // Whether to send confirmation email
	RedirectTo     string `json:"redirect_to,omitempty"`      // URL to redirect after verification
	DataInRedirect bool   `json:"data_in_redirect,omitempty"` // Whether to include user data in redirect
}

func HandleEmailSignup(c *fiber.Ctx, data EmailSignupData, db *db.Database) (AuthResponse, error) {
	// Validate input
	if data.Email == "" || data.Password == "" {
		return AuthResponse{}, fmt.Errorf("Email and password are required")
	}
	data.EmailConfirm = true
	data.RedirectTo = "http:localhost:5050/verify-account"
	response, err := makeSupabaseRequest("POST", "signup", data)
	if err != nil {
		slog.Error("")
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
	slog.Info("successfully signed up",
		"email", auth_response.User.Email,
		"id", auth_response.User.Id,
	)
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
	IdToken string `json:"id_token"`
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
	middlewares.ClearPaymentCookies(c)

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
	middlewares.ClearPaymentCookies(c)

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
func HandleVerifyEmail(c *fiber.Ctx, data VerifyEmailData) error {
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
		"token": data.Token,
		"type":  data.Type,
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
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Update user cookies with new tokens
	middlewares.SetAuthCookies(c, &middlewares.RefreshResponse{
		AccessToken:  auth_response.AccessToken,
		RefreshToken: auth_response.RefreshToken,
	})

	slog.Info("Successfully verified email",
		"email", auth_response.User.Email,
		"id", auth_response.User.Id,
	)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Email successfully verified",
		"user":    auth_response.User,
	})
}

// Check if a user's email is verified
func HandleCheckEmailVerification(c *fiber.Ctx) error {
	claims, err := middlewares.GetUserClaims(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Prepare request to get user data from Supabase
	request, err := http.NewRequest("GET", fmt.Sprintf("%s/user", utils.KONG_AUTH_URL), nil)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create request",
		})
	}

	request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", claims.Bearer))
	request.Header.Set("apikey", utils.SERVICE_ROLE_KEY)

	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get user data",
		})
	}
	defer response.Body.Close()

	// Parse response
	var userData struct {
		EmailConfirmedAt *string `json:"email_confirmed_at"`
	}

	body_bytes, err := io.ReadAll(response.Body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read response",
		})
	}

	if err := json.Unmarshal(body_bytes, &userData); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse user data",
		})
	}

	// Check if email is verified
	emailVerified := userData.EmailConfirmedAt != nil

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"email_verified": emailVerified,
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
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
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
		if err := json.Unmarshal(body_bytes, &error_resp); err != nil {
			return AuthResponse{}, fmt.Errorf("auth service error (status %d): failed to parse error response",
				response.StatusCode)
		}
		slog.Error("Supabase error while handling the request", "body", string(body_bytes))
		error_msg := error_resp.Message
		if error_msg == "" {
			error_msg = error_resp.Error
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
