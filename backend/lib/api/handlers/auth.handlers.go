package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/utils"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
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
	Email    string `json:"email"`
	Password string `json:"password"`
}

func HandleEmailSignup(c *fiber.Ctx, data EmailSignupData) (AuthResponse, error) {
	// Validate input
	if data.Email == "" || data.Password == "" {
		return AuthResponse{}, fmt.Errorf("Email and password are required")
	}

	// Prepare request to Supabase Auth
	signup_data := map[string]interface{}{
		"email":    data.Email,
		"password": data.Password,
	}

	json_data, err := json.Marshal(signup_data)
	if err != nil {
		return AuthResponse{}, fmt.Errorf("Failed to process request")
	}

	// Make request to Supabase Auth
	supabase_url := fmt.Sprintf("%s/signup", utils.KONG_AUTH_URL)
	request, err := http.NewRequest("POST", supabase_url, bytes.NewBuffer(json_data))
	if err != nil {
		return AuthResponse{}, fmt.Errorf("Failed to create request")
	}

	// Add required headers
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("apikey", utils.SERVICE_ROLE_KEY)

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
	IdToken string `json:"id_token"` // JWT token from Google
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
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    "",
		Expires:  time.Now().Add(-24 * time.Hour),
		Secure:   true,
		HTTPOnly: true,
		SameSite: "Strict",
	})
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Expires:  time.Now().Add(-24 * time.Hour),
		Secure:   true,
		HTTPOnly: true,
		SameSite: "Strict",
	})

	// Clear auth cookies regardless of Supabase response
	c.Cookie(&fiber.Cookie{
		Name:     "payment_status",
		Value:    "",
		Expires:  time.Now().Add(-24 * time.Hour),
		Secure:   true,
		HTTPOnly: true,
		SameSite: "Strict",
	})

	// Clear auth cookies regardless of Supabase response
	c.Cookie(&fiber.Cookie{
		Name:     "payment_token",
		Value:    "",
		Expires:  time.Now().Add(-24 * time.Hour),
		Secure:   true,
		HTTPOnly: true,
		SameSite: "Strict",
	})
	slog.Info("successfully signed out", "email", claims.Email, "id", claims.UserId)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "successfully logged out",
	})
}

func HandleDeleteAccount(c *fiber.Ctx) error {
	// Get user from context (requires Protected middleware)
	claims, err := middlewares.GetUserClaims(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}

	// Delete users data from the storage, the cache and the database
	// TODO

	// Clear auth cookies after successful deletion
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    "",
		Expires:  time.Now().Add(-24 * time.Hour),
		Secure:   true,
		HTTPOnly: true,
		SameSite: "Strict",
	})
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Expires:  time.Now().Add(-24 * time.Hour),
		Secure:   true,
		HTTPOnly: true,
		SameSite: "Strict",
	})

	slog.Info("successfully deleted", "email", claims.Email, "id", claims.UserId)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "account successfully deleted",
	})
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
