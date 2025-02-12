package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/db"
	database "backend/lib/services/db"
	"backend/sqlc_gen"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgtype"
)

type ExperienceCreationData struct {
	CompanyName string      `json:"company_name"`
	JobTitle    string      `json:"job_title"`
	Location    string      `json:"location"`
	StartDate   string      `json:"start_date"`
	EndDate     string      `json:"end_date"`
	IsCurrent   bool        `json:"is_current"`
	Description string      `json:"description"`
	Priority    int32       `json:"priority"`
	Tags        []string    `json:"tags"`
	Notes       []fiber.Map `json:"notes"`
}

func HandleExperienceCreation(data ExperienceCreationData, c *fiber.Ctx, db *database.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	notes := make([][]byte, len(data.Notes))
	if len(data.Notes) > 0 {
		for i, note := range data.Notes {
			bytes_note, err := json.Marshal(note)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "could not understand the notes",
				})
			}
			notes[i] = bytes_note
		}
	}
	start_date, err := database.StringToDate(data.StartDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid start date",
		})
	}
	var end_date pgtype.Date
	if len(data.EndDate) > 0 {
		end_date, err = database.StringToDate(data.EndDate)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid end date",
			})
		}
	}

	_, err = queries.CreateExperience(query_ctx, sqlc_gen.CreateExperienceParams{
		UserID:      user_id,
		CompanyName: data.CompanyName,
		JobTitle:    data.JobTitle,
		Location:    data.Location,
		StartDate:   start_date,
		EndDate:     end_date,
		IsCurrent:   data.IsCurrent,
		Description: data.Description,
		Priority:    data.Priority,
		Tags:        data.Tags,
		Notes:       notes,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not create this experience",
		})
	}
	return c.SendStatus(fiber.StatusOK)
}

type ExperienceUpdateData struct {
	ExperienceId int64       `json:"experience_id"`
	CompanyName  string      `json:"company_name"`
	JobTitle     string      `json:"job_title"`
	Location     string      `json:"location"`
	StartDate    string      `json:"start_date"`
	EndDate      string      `json:"end_date"`
	IsCurrent    bool        `json:"is_current"`
	Description  string      `json:"description"`
	Priority     int32       `json:"priority"`
	Tags         []string    `json:"tags"`
	Notes        []fiber.Map `json:"notes"`
}

func HandleExperienceUpdate(data ExperienceUpdateData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	notes := make([][]byte, len(data.Notes))
	if len(data.Notes) > 0 {
		for i, note := range data.Notes {
			bytes_note, err := json.Marshal(note)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "could not understand the notes",
				})
			}
			notes[i] = bytes_note
		}
	}

	start_date, err := database.StringToDate(data.StartDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("invalid start date %s", err),
		})
	}
	var end_date pgtype.Date
	if len(data.EndDate) > 0 {
		end_date, err = database.StringToDate(data.EndDate)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fmt.Sprintf("invalid end date %s", err),
			})
		}
	}
	slog.Info("updating", "id", data.ExperienceId, "user", user_id)
	err = queries.UpdateExperience(query_ctx, sqlc_gen.UpdateExperienceParams{
		ExperienceID: data.ExperienceId,
		UserID:       user_id,
		CompanyName:  data.CompanyName,
		JobTitle:     data.JobTitle,
		Location:     data.Location,
		StartDate:    start_date,
		EndDate:      end_date,
		IsCurrent:    data.IsCurrent,
		Description:  data.Description,
		Priority:     data.Priority,
		Tags:         data.Tags,
		Notes:        notes,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not update this experience",
		})
	}
	return c.SendStatus(fiber.StatusOK)
}

func HandleGetAllExperiences(c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	experiences, err := queries.GetExperiencesByUserId(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get your experiences",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"experiences": experiences,
	})
}

type GetExperienceParams struct {
	ExperienceId int64 `query:"experience_id"`
}

func HandleGetExperience(params GetExperienceParams, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	experience, err := queries.GetExperienceById(query_ctx, sqlc_gen.GetExperienceByIdParams{
		ExperienceID: params.ExperienceId,
		UserID:       user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get this experience",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"experience": experience,
	})
}

type DeleteExperienceParams struct {
	ExperienceId int64 `json:"experience_id"`
}

func HandleDeleteExperience(params DeleteExperienceParams, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.DeleteExperience(query_ctx, sqlc_gen.DeleteExperienceParams{
		ExperienceID: params.ExperienceId,
		UserID:       user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not delete this experiences",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}
