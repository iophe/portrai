package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/db"
	database "backend/lib/services/db"
	"backend/sqlc_gen"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"mime/multipart"
	"time"

	"github.com/gofiber/fiber/v2"
)

type ProfileUpdateData struct {
	Name        string `json:"name"`
	Email       string `json:"email"`
	Phone       string `json:"phone"`
	Location    string `json:"location"`
	LinkedIn    string `json:"linkedin"`
	Website     string `json:"website"`
	CvPhotoPath string `json:"cv_photo_path"`
}

func HandleProfileUpdate(data ProfileUpdateData, c *fiber.Ctx, db *db.Database) error {
	// Création du contexte avec timeout
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	slog.Info("Before UpdateProfile", "name", data.Name)
	slog.Info("Before UpdateProfile", "phone", data.Phone)
	slog.Info("Before UpdateProfile", "website", data.Website)
	slog.Info("Before UpdateProfile", "linkedin", data.LinkedIn)
	slog.Info("Before UpdateProfile", "cvphotopath", data.CvPhotoPath)
	slog.Info("Before UpdateProfile", "email", data.Email)

	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	slog.Info("Before UpdateProfile", "userid", user_id)

	// Mise à jour du profil
	err2 := queries.UpdateProfile(query_ctx, sqlc_gen.UpdateProfileParams{
		Name:        data.Name,
		Email:       data.Email,
		Phone:       data.Phone,
		Location:    data.Location,
		Linkedin:    data.LinkedIn,
		Website:     data.Website,
		CvPhotoPath: data.CvPhotoPath, // Assurez-vous que ce champ existe dans ProfileUpdateData
		UserID:      user_id,          // Vous devez récupérer l'ID de l'utilisateur actuel
	})

	if err2 != nil {
		slog.Error("error UpdateProfile", "err", err2)

		return c.Status(fiber.StatusInternalServerError).Send([]byte("Error update profile "))
	}

	slog.Info("Profile updated successfully")

	return c.SendStatus(fiber.StatusOK)
}

func HandleGetProfile(c *fiber.Ctx, db *db.Database) error {

	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	// Création du contexte avec timeout
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	// Récupération du profil
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

type AvatarUploadResponse struct {
	Path      string    `json:"path"`
	UpdatedAt time.Time `json:"updated_at"`
}

func HandleAvatarUpload(c *fiber.Ctx, file *multipart.FileHeader, db *database.Database) (AvatarUploadResponse, error) {
	if file == nil {
		return AvatarUploadResponse{}, fmt.Errorf("no file provided")
	}

	userID := c.Locals("userID").(string)
	if userID == "" {
		return AvatarUploadResponse{}, fmt.Errorf("user not authenticated")
	}

	// Valider le fichier
	if !isValidImageType(file.Header.Get("Content-Type")) {
		return AvatarUploadResponse{}, fmt.Errorf("invalid file type: only images are allowed")
	}
	if file.Size > 5*1024*1024 {
		return AvatarUploadResponse{}, fmt.Errorf("file too large: maximum size is 5MB")
	}

	// Lire le fichier
	src, err := file.Open()
	if err != nil {
		return AvatarUploadResponse{}, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	fileBytes, err := io.ReadAll(src)
	if err != nil {
		return AvatarUploadResponse{}, fmt.Errorf("failed to read file: %w", err)
	}

	// Préparer le fichier pour l'upload
	fileName := fmt.Sprintf("avatars/%s_%d_%s", userID, time.Now().Unix(), file.Filename)

	// Préparer la requête multipart
	uploadData := &bytes.Buffer{}
	writer := multipart.NewWriter(uploadData)
	part, err := writer.CreateFormFile("file", fileName)
	if err != nil {
		return AvatarUploadResponse{}, fmt.Errorf("failed to create form file: %w", err)
	}
	if _, err := part.Write(fileBytes); err != nil {
		return AvatarUploadResponse{}, fmt.Errorf("failed to write file data: %w", err)
	}
	writer.Close()

	// Faire la requête à Supabase
	response, err := makeSupabaseRequest(
		"POST",
		fmt.Sprintf("storage/v1/object/%s", fileName),
		uploadData.Bytes(),
	)
	if err != nil {
		return AvatarUploadResponse{}, fmt.Errorf("failed to communicate with storage service: %w", err)
	}

	// Gérer la réponse
	defer response.Body.Close()
	bodyBytes, err := io.ReadAll(response.Body)
	if err != nil {
		return AvatarUploadResponse{}, fmt.Errorf("failed to read response body: %w", err)
	}

	if response.StatusCode >= 400 {
		var errorResp SupabaseError
		if err := json.Unmarshal(bodyBytes, &errorResp); err != nil {
			return AvatarUploadResponse{}, fmt.Errorf("storage service error (status %d): failed to parse error response",
				response.StatusCode)
		}
		slog.Error("Supabase error while handling the avatar upload", "body", string(bodyBytes))
		errorMsg := errorResp.Message
		if errorMsg == "" {
			errorMsg = errorResp.Error
		}
		if errorMsg == "" {
			errorMsg = "unexpected error"
		}
		return AvatarUploadResponse{}, fmt.Errorf("storage service error (status %d): %s",
			response.StatusCode, errorMsg)
	}

	// Création du contexte avec timeout
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	// Mise à jour du profil
	err2 := queries.UpdateProfile(query_ctx, sqlc_gen.UpdateProfileParams{
		CvPhotoPath: fileName,
	})

	var result AvatarUploadResponse

	if err2 != nil {
		return result, c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Could not update profile",
			"details": err.Error(),
		})
	}

	slog.Info("successfully uploaded avatar",
		"user_id", userID,
		"path", result.Path,
	)

	return result, nil
}

func isValidImageType(contentType string) bool {
	validTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}
	return validTypes[contentType]
}
