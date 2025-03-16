package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/db"
	"backend/lib/utils"
	"backend/sqlc_gen"
	"bytes"
	"context"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgtype"
)

func HandleGetUser(c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	// Get user data
	user, err := queries.GetUserById(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Could not get user",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"user": user,
	})
}

type UserUpdateData struct {
	FullName pgtype.Text `json:"full_name"`
	Email    pgtype.Text `json:"email"`
	Phone    pgtype.Text `json:"phone"`
	Location pgtype.Text `json:"location"`
}

func HandleUpdateUser(data UserUpdateData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.UpdateUser(query_ctx, sqlc_gen.UpdateUserParams{
		UserID:   user_id,
		FullName: data.FullName,
		Email:    data.Email,
		Phone:    data.Phone,
		Location: data.Location,
	})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Error updating user",
			"details": err.Error(),
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

type ProfileUpdateData struct {
	LinkedIn    pgtype.Text `json:"linkedin"`
	Website     pgtype.Text `json:"website"`
	Description pgtype.Text `json:"description"`
}

func HandleProfileUpdate(data ProfileUpdateData, c *fiber.Ctx, db *db.Database) error {
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	err = queries.UpdateProfile(query_ctx, sqlc_gen.UpdateProfileParams{
		Linkedin:    data.LinkedIn,
		Website:     data.Website,
		Description: data.Description,
		UserID:      user_id,
	})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).Send([]byte("Error update profile "))
	}

	return c.SendStatus(fiber.StatusOK)
}

func HandleGetProfile(c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	profile, err := queries.GetProfileByUserId(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Could not get profile",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"profile": profile,
	})
}

func HandleUploadProfileAvatar(c *fiber.Ctx) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No image provided",
		})
	}

	if file.Size > 5*1024*1024 { // 5MB limit
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Image size exceeds 5MB limit",
		})
	}

	extension := filepath.Ext(file.Filename)
	allowed_extension := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if !allowed_extension[strings.ToLower(extension)] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Unsupported file format. Use JPG, PNG or WEBP",
		})
	}

	// Open the file
	src, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to open image file",
		})
	}
	defer src.Close()

	user_hash := utils.Hash(user_id[:])
	image, err := io.ReadAll(src)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read image file",
		})
	}
	avatar_id := hex.EncodeToString(user_hash[:])

	bucket := "avatars"

	request, err := http.NewRequest("POST",
		fmt.Sprintf("%s/object/%s/%s",
			utils.KONG_STORAGE_URL, bucket, avatar_id),
		bytes.NewBuffer(image),
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create request",
		})
	}

	if strings.ToLower(extension) == ".png" {
		request.Header.Set("Content-Type", "image/png")
	} else if strings.ToLower(extension) == ".webp" {
		request.Header.Set("Content-Type", "image/webp")
	} else {
		request.Header.Set("Content-Type", "image/jpeg") // Default for jpg/jpeg
	}
	request.Header.Set("x-upsert", "true")

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
			"error": "failed to upload image",
		})
	}
	defer response.Body.Close()
	body_bytes, err := io.ReadAll(response.Body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to read response body",
			"details": err.Error(),
		})
	}

	body_string := string(body_bytes)
	fmt.Printf("Response body: %s\n", body_string)

	if response.StatusCode != http.StatusOK {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to upload image",
			"details": body_string,
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

func HandleGetProfileAvatar(c *fiber.Ctx) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	user_hash := utils.Hash(user_id[:])
	avatar_id := hex.EncodeToString(user_hash[:])

	bucket := "avatars"

	request, err := http.NewRequest("GET", fmt.Sprintf("%s/object/%s/%s", utils.KONG_STORAGE_URL, bucket, avatar_id), nil)
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
			"error": "failed to get image",
		})
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		body_bytes, err := io.ReadAll(response.Body)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "failed to get image",
				"details": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get image",
			"details": string(body_bytes),
		})
	}
	contentType := response.Header.Get("Content-Type")
	c.Set("Content-Type", contentType)

	image, err := io.ReadAll(response.Body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read image data",
		})
	}

	return c.Send(image)
}
