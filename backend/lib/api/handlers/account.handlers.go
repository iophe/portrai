package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/db"
	"backend/sqlc_gen"
	"context"
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
