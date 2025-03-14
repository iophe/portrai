package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/ai"
	ca "backend/lib/services/cache"
	database "backend/lib/services/db"
	"backend/sqlc_gen"
	"encoding/json"
	"log/slog"
	"strconv"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgtype"
)

const (
	PROFIT_MARGIN = 0.5
	HIGH_TIER     = 0.25
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

	query_ctx := c.Context()
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

	paid_price, err := queries.GetPriceForPayment(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to retrieve the cost",
		})
	}

	cost, err := queries.GetConsumptionCost(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to retrieve the cost",
		})
	}
	float_cost, err := cost.Float64Value()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to retrieve the cost",
		})
	}
	if float_cost.Float64 >= (float64(paid_price.Int64)/100)*PROFIT_MARGIN {
		return c.Status(fiber.StatusNotAcceptable).JSON(fiber.Map{
			"error": "maximum usage limits has been reach",
		})
	}

	var model anthropic.Model
	if float_cost.Float64 <= (float64(paid_price.Int64)/100)*HIGH_TIER {
		model = anthropic.ModelClaude3_5SonnetLatest
	} else {
		model = anthropic.ModelClaude3_5HaikuLatest
	}
	var priceRateInputToken float64
	var priceRateOutputToken float64
	var numeric_priceRateInputToken pgtype.Numeric
	var numeric_priceRateOutputToken pgtype.Numeric
	switch model {
	case anthropic.ModelClaude3_5SonnetLatest:
		priceRateInputToken = 0.000003 // $3 per million input tokens
		numeric_priceRateInputToken.Scan(strconv.FormatFloat(priceRateInputToken, 'f', -1, 64))
		priceRateOutputToken = 0.000015 // $15 per million output tokens
		numeric_priceRateOutputToken.Scan(strconv.FormatFloat(priceRateOutputToken, 'f', -1, 64))
	case anthropic.ModelClaude3_5HaikuLatest:
		priceRateInputToken = 0.00000080 // $0.80 per million input tokens
		numeric_priceRateInputToken.Scan(strconv.FormatFloat(priceRateInputToken, 'f', -1, 64))
		priceRateOutputToken = 0.000004 // $4 per million output tokens
		numeric_priceRateOutputToken.Scan(strconv.FormatFloat(priceRateOutputToken, 'f', -1, 64))
	default: // Not possible
	}
	result, usage, err := ai.GenerateResume(c.Context(), user_id, resume_data, data.JobDescription, data.WithCoverLetter, model, claude, cache)

	slog.Info("Generated resume", "usage", sqlc_gen.AddProductUsageParams{
		UserID:               user_id,
		InputTokenUsed:       int64(usage.InputTokenUsed),
		OutputTokenUsed:      int64(usage.OutputTokenUsed),
		Valid:                usage.Valid,
		Model:                model,
		Duration:             database.DurationToInterval(usage.Duration),
		PriceRateInputToken:  numeric_priceRateInputToken,
		PriceRateOutputToken: numeric_priceRateOutputToken,
	})
	err_query := queries.AddProductUsage(query_ctx, sqlc_gen.AddProductUsageParams{
		UserID:               user_id,
		InputTokenUsed:       int64(usage.InputTokenUsed),
		OutputTokenUsed:      int64(usage.OutputTokenUsed),
		Valid:                usage.Valid,
		Model:                model,
		Duration:             database.DurationToInterval(usage.Duration),
		PriceRateInputToken:  numeric_priceRateInputToken,
		PriceRateOutputToken: numeric_priceRateOutputToken,
	})
	if err_query != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to generate the resume with claude",
			"info":  err_query.Error(),
		})
	}
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
