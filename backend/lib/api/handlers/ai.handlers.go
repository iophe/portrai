package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/ai"
	ca "backend/lib/services/cache"
	database "backend/lib/services/db"
	"backend/sqlc_gen"
	"context"
	"encoding/json"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/gofiber/fiber/v2"
)

type BuildResumeData struct {
	JobDescription  string `json:"job_description"`
	WithCoverLetter bool   `json:"with_cover_letter"`
}

func HandleBuildResume(data BuildResumeData, c *fiber.Ctx, cache *ca.Cache, db *database.Database, claude *anthropic.Client) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	var resume_data ca.ResumeCachedData
	resume_data_bytes, err := queries.GetResumeData(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to retrieve resume data",
		})
	}
	if err := json.Unmarshal(resume_data_bytes, &resume_data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse resume data",
			"info":  err,
		})
	}

	result, err := ai.GenerateResume(c.Context(), user_id, resume_data, data.JobDescription, data.WithCoverLetter, claude, cache)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to generate the resume with claude",
			"info":  err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"result": result,
	})
}
