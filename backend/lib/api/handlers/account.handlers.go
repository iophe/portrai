package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/db"
	database "backend/lib/services/db"
	"backend/sqlc_gen"
	"context"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"log/slog"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nfnt/resize"
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

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		return AvatarUploadResponse{}, c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	// Valider le type de fichier
	contentType := file.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		return AvatarUploadResponse{}, fmt.Errorf("file must be an image")
	}

	// Limiter la taille du fichier
	if file.Size > 10*1024*1024 {
		return AvatarUploadResponse{}, fmt.Errorf("file size exceeds 10MB limit")
	}

	// Ouvrir le fichier uploadé
	src, err := file.Open()
	if err != nil {
		return AvatarUploadResponse{}, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	// Décoder l'image
	img, format, err := image.Decode(src)
	if err != nil {
		return AvatarUploadResponse{}, fmt.Errorf("failed to decode image: %w", err)
	}

	// Redimensionner l'image pour un CV (800x1000 max)
	resizedImg := resize.Thumbnail(800, 1000, img, resize.Lanczos3)

	// Créer le répertoire de stockage
	uploadDir := "./static/uploads/profile_photos"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return AvatarUploadResponse{}, fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Créer un nom de fichier unique
	ext := ".jpg"
	if format == "png" {
		ext = ".png"
	}
	uniqueFilename := fmt.Sprintf("%s_%d%s", userID, time.Now().UnixNano(), ext)
	filePath := filepath.Join(uploadDir, uniqueFilename)

	// Créer le fichier de destination
	dst, err := os.Create(filePath)
	if err != nil {
		return AvatarUploadResponse{}, fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	// Encoder et sauvegarder l'image
	if format == "png" {
		encoder := png.Encoder{
			CompressionLevel: png.BestCompression,
		}
		if err := encoder.Encode(dst, resizedImg); err != nil {
			return AvatarUploadResponse{}, fmt.Errorf("failed to encode png image: %w", err)
		}
	} else {
		// Pour CV, utiliser JPEG avec 90% de qualité
		if err := jpeg.Encode(dst, resizedImg, &jpeg.Options{Quality: 90}); err != nil {
			return AvatarUploadResponse{}, fmt.Errorf("failed to encode jpeg image: %w", err)
		}
	}

	// URL relative pour accéder au fichier
	photoPath := fmt.Sprintf("/uploads/profile_photos/%s", uniqueFilename)

	// Mettre à jour le profil dans la base de données
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	queries := sqlc_gen.New(db.Pool)
	err = queries.UpdateProfileAvatar(query_ctx, sqlc_gen.UpdateProfileAvatarParams{
		CvPhotoPath: photoPath,
		UserID:      userID,
	})

	if err != nil {
		return AvatarUploadResponse{}, fmt.Errorf("failed to update profile avatar: %w", err)
	}

	// Retourner la réponse avec le chemin et l'heure de mise à jour
	return AvatarUploadResponse{
		Path:      photoPath,
		UpdatedAt: time.Now(),
	}, nil
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
