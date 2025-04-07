package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/ai"
	ca "backend/lib/services/cache"
	db_lib "backend/lib/services/db"
	"backend/sqlc_gen"
	"context"
	"fmt"
	"log/slog"
	"strconv"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const (
	PROFIT_MARGIN = 0.5
	HIGH_TIER     = 0.25
)

type StartConversationData struct {
	JobDescription string `json:"job_description"`
	TemplateName   string `json:"template_name"`
}

func HandleStartConversation(data StartConversationData, c *fiber.Ctx, cache *ca.Cache, db *db_lib.Database, claude *anthropic.Client) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	resume_uid, err := getOrCreateCurrentResumeUID(user_id, query_ctx, queries)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve resume uid",
			"details": err.Error(),
		})
	}

	conversation_id, err := ca.CreateConversation(user_id, resume_uid, c.Context(), cache)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create conversation in cache",
			"details": err.Error(),
		})
	}
	model, err := assertUsabilityAndGetModel(user_id, query_ctx, queries)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to start the conversation",
			"details": err.Error(),
		})
	}

	resume_data_json, err := queries.GetResumeData(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to retrieve the resume data",
			"details": err.Error(),
		})
	}

	err = ai.StartConversation(
		c.Context(),
		user_id,
		conversation_id,
		data.JobDescription,
		string(resume_data_json),
		model.model,
		claude,
		cache,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to start conversation",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"conversation_id": conversation_id.String(),
	})
}

type GetMetadataParams struct {
	ConversationID string `params:"conversation_id"`
}

func HandleGetMetadata(params GetMetadataParams, c *fiber.Ctx, cache *ca.Cache) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	conversation_id, err := db_lib.StringToUUID(params.ConversationID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get the conversation_id",
			"details": err.Error(),
		})
	}

	title, err := ca.GetResumeTitle(user_id, conversation_id, c.Context(), cache)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get the title",
			"details": err.Error(),
		})
	}

	resume_data, err := ca.GetResumeData(user_id, conversation_id, c.Context(), cache)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get the title",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"title":       title.Title,
		"resume_data": resume_data,
	})
}

type CreateResumeParams struct {
	ConversationID string `params:"conversation_id"`
}

type CreateResumeData struct {
	Instruction string `json:"instruction"`
}

func HandleCreateResume(params CreateResumeParams, data CreateResumeData, c *fiber.Ctx, cache *ca.Cache, db *db_lib.Database, claude *anthropic.Client) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	conversation_id, err := db_lib.StringToUUID(params.ConversationID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get the conversation_id",
			"details": err.Error(),
		})
	}
	query_ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	model, err := assertUsabilityAndGetModel(user_id, query_ctx, queries)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to use the model",
			"details": err.Error(),
		})
	}
	usage, err := ai.CreateResume(c.Context(), user_id, conversation_id, data.Instruction, model.model, claude, cache)
	if err != nil {
		slog.Info("Failed to create resume", "usage", usage, "err", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to create the resume",
			"details": err.Error(),
		})
	}
	slog.Info("Successfuly created resume", "usage", usage)
	return c.SendStatus(fiber.StatusOK)
}

type CommentResumeParams struct {
	ConversationID string `params:"conversation_id"`
}

type CommentResumeData struct {
	Comment string `json:"comment"`
}

func HandleCommentResume(params CommentResumeParams, data CommentResumeData, c *fiber.Ctx, cache *ca.Cache, db *db_lib.Database, claude *anthropic.Client) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	conversation_id, err := db_lib.StringToUUID(params.ConversationID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get the conversation_id",
			"details": err.Error(),
		})
	}
	query_ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	model, err := assertUsabilityAndGetModel(user_id, query_ctx, queries)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to start the conversation",
			"details": err.Error(),
		})
	}
	usage, err := ai.CommentAndRecreateResume(c.Context(), user_id, conversation_id, data.Comment, model.model, claude, cache)
	if err != nil {
		slog.Info("Failed to comment on resume", "usage", usage, "err", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to start conversation",
			"details": err.Error(),
		})
	}
	slog.Info("Successfuly commented on resume", "usage", usage)

	return c.SendStatus(fiber.StatusOK)
}

type CommentCoverLetterParams struct {
	ConversationID string `params:"conversation_id"`
}

type CommentCoverLetterData struct {
	Comment string `json:"comment"`
}

func HandleCommentCoverLetter(params CommentCoverLetterParams, data CommentCoverLetterData, c *fiber.Ctx, cache *ca.Cache, db *db_lib.Database, claude *anthropic.Client) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	conversation_id, err := db_lib.StringToUUID(params.ConversationID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get the conversation_id",
			"details": err.Error(),
		})
	}
	query_ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	model, err := assertUsabilityAndGetModel(user_id, query_ctx, queries)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to start the conversation",
			"details": err.Error(),
		})
	}
	usage, err := ai.CommentAndRecreateCoverLetter(c.Context(), user_id, conversation_id, data.Comment, model.model, claude, cache)
	if err != nil {
		slog.Info("Failed to comment on cover letter", "usage", usage, "err", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to comment on the cover letter",
			"details": err.Error(),
		})
	}
	slog.Info("Successfuly commented on cover letter", "usage", usage)
	cover_letter, err := ca.GetResumeCoverLetter(user_id, conversation_id, c.Context(), cache)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to retrieve cover letter",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"letter": cover_letter.CoverLetter,
	})
}

type CreateCoverLetterParams struct {
	ConversationID string `params:"conversation_id"`
}

type CreateCoverLetterData struct {
	Instruction string `json:"instruction"`
}

func HandleCreateCoverLetter(params CreateCoverLetterParams, data CreateCoverLetterData, c *fiber.Ctx, cache *ca.Cache, db *db_lib.Database, claude *anthropic.Client) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	conversation_id, err := db_lib.StringToUUID(params.ConversationID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get the conversation_id",
			"details": err.Error(),
		})
	}
	query_ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	model, err := assertUsabilityAndGetModel(user_id, query_ctx, queries)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to start the conversation",
			"details": err.Error(),
		})
	}
	usage, err := ai.CreateCoverLetter(c.Context(), user_id, conversation_id, data.Instruction, model.model, claude, cache)
	if err != nil {
		slog.Info("Failed to create cover letter", "usage", usage, "err", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to create cover letter",
			"details": err.Error(),
		})
	}
	slog.Info("Successfuly created cover letter", "usage", usage)
	cover_letter, err := ca.GetResumeCoverLetter(user_id, conversation_id, c.Context(), cache)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Unable to retrieve cover letter",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"letter": cover_letter.CoverLetter,
	})
}

type modelAndPrices struct {
	model                        anthropic.Model
	numeric_priceRateInputToken  pgtype.Numeric
	numeric_priceRateOutputToken pgtype.Numeric
}

func assertUsabilityAndGetModel(user_id uuid.UUID, query_ctx context.Context, queries *sqlc_gen.Queries) (modelAndPrices, error) {

	paid_price, err := queries.GetPriceForPayment(query_ctx, user_id)
	if err != nil {
		return modelAndPrices{}, fmt.Errorf("Failed to retrieve the cost")
	}

	cost, err := queries.GetConsumptionCost(query_ctx, user_id)
	if err != nil {
		return modelAndPrices{}, fmt.Errorf("Failed to retrieve the cost")
	}
	float_cost, err := cost.Float64Value()
	if err != nil {
		return modelAndPrices{}, fmt.Errorf("Failed to retrieve the cost")
	}
	if float_cost.Float64 >= (float64(paid_price.Int64)/100)*PROFIT_MARGIN {
		return modelAndPrices{}, fmt.Errorf("maximum usage limits has been reach")
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
	return modelAndPrices{model: model, numeric_priceRateInputToken: numeric_priceRateInputToken, numeric_priceRateOutputToken: numeric_priceRateOutputToken}, nil
}

func getOrCreateCurrentResumeUID(user_id uuid.UUID, query_ctx context.Context, queries *sqlc_gen.Queries) (uuid.UUID, error) {

	opt_resume_uid, err := queries.GetCurrentResumeUID(query_ctx, user_id)
	if err != nil {
		return uuid.UUID{}, err
	}
	if !opt_resume_uid.Valid {
		opt_resume_uid.Bytes = uuid.New()

		user, err := queries.GetUserById(query_ctx, user_id)
		if err != nil {
			return uuid.UUID{}, err
		}
		err = queries.UpdateResumeUIDinVersion(query_ctx, sqlc_gen.UpdateResumeUIDinVersionParams{
			UserID:    user_id,
			ResumeUid: opt_resume_uid.Bytes,
			VersionID: user.CurrentResumeVersion,
		})
		if err != nil {
			return uuid.UUID{}, err
		}
	}
	return opt_resume_uid.Bytes, nil
}

/*

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

	var resume_data ca.ResumeData
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
*/
