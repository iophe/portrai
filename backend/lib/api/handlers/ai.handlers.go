package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/ai"
	ca "backend/lib/services/cache"
	db_lib "backend/lib/services/db"
	"backend/sqlc_gen"
	"context"
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
		"title":       title,
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

	queries := sqlc_gen.New(db.Pool)

	model, err := assertUsabilityAndGetModel(user_id, c.Context(), queries)
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
	_ = queries.AddProductUsage(c.Context(), sqlc_gen.AddProductUsageParams{
		UserID:                           user_id,
		InputTokenUsed:                   usage.Usage.InputTokens,
		OutputTokenUsed:                  usage.Usage.OutputTokens,
		CachedInputTokenUsed:             usage.Usage.CacheReadInputTokens,
		CachedInputTokenCreated:          usage.Usage.CacheCreationInputTokens,
		Valid:                            usage.Valid,
		Model:                            model.model,
		Duration:                         db_lib.DurationToInterval(usage.Duration),
		PriceRateInputToken:              model.numeric_priceRateInputToken,
		PriceRateOutputToken:             model.numeric_priceRateOutputToken,
		PriceRateCachedInputTokenCreated: model.numeric_priceRateCachedInputTokenCreated,
		PriceRateCachedInputTokenUsed:    model.numeric_priceRateCachedInputTokenUsed,
	})
	err = middlewares.IncrementUsage(c, user_id, middlewares.RESUME_GENERATION, db)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Unexpected error",
		})
	}
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

	queries := sqlc_gen.New(db.Pool)

	model, err := assertUsabilityAndGetModel(user_id, c.Context(), queries)
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
	_ = queries.AddProductUsage(c.Context(), sqlc_gen.AddProductUsageParams{
		UserID:                           user_id,
		InputTokenUsed:                   usage.Usage.InputTokens,
		OutputTokenUsed:                  usage.Usage.OutputTokens,
		CachedInputTokenUsed:             usage.Usage.CacheReadInputTokens,
		CachedInputTokenCreated:          usage.Usage.CacheCreationInputTokens,
		Valid:                            usage.Valid,
		Model:                            model.model,
		Duration:                         db_lib.DurationToInterval(usage.Duration),
		PriceRateInputToken:              model.numeric_priceRateInputToken,
		PriceRateOutputToken:             model.numeric_priceRateOutputToken,
		PriceRateCachedInputTokenCreated: model.numeric_priceRateCachedInputTokenCreated,
		PriceRateCachedInputTokenUsed:    model.numeric_priceRateCachedInputTokenUsed,
	})
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

	queries := sqlc_gen.New(db.Pool)

	model, err := assertUsabilityAndGetModel(user_id, c.Context(), queries)
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
	_ = queries.AddProductUsage(c.Context(), sqlc_gen.AddProductUsageParams{
		UserID:                           user_id,
		InputTokenUsed:                   usage.Usage.InputTokens,
		OutputTokenUsed:                  usage.Usage.OutputTokens,
		CachedInputTokenUsed:             usage.Usage.CacheReadInputTokens,
		CachedInputTokenCreated:          usage.Usage.CacheCreationInputTokens,
		Valid:                            usage.Valid,
		Model:                            model.model,
		Duration:                         db_lib.DurationToInterval(usage.Duration),
		PriceRateInputToken:              model.numeric_priceRateInputToken,
		PriceRateOutputToken:             model.numeric_priceRateOutputToken,
		PriceRateCachedInputTokenCreated: model.numeric_priceRateCachedInputTokenCreated,
		PriceRateCachedInputTokenUsed:    model.numeric_priceRateCachedInputTokenUsed,
	})
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

	queries := sqlc_gen.New(db.Pool)

	model, err := assertUsabilityAndGetModel(user_id, c.Context(), queries)
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
	_ = queries.AddProductUsage(c.Context(), sqlc_gen.AddProductUsageParams{
		UserID:                           user_id,
		InputTokenUsed:                   usage.Usage.InputTokens,
		OutputTokenUsed:                  usage.Usage.OutputTokens,
		CachedInputTokenUsed:             usage.Usage.CacheReadInputTokens,
		CachedInputTokenCreated:          usage.Usage.CacheCreationInputTokens,
		Valid:                            usage.Valid,
		Model:                            model.model,
		Duration:                         db_lib.DurationToInterval(usage.Duration),
		PriceRateInputToken:              model.numeric_priceRateInputToken,
		PriceRateOutputToken:             model.numeric_priceRateOutputToken,
		PriceRateCachedInputTokenCreated: model.numeric_priceRateCachedInputTokenCreated,
		PriceRateCachedInputTokenUsed:    model.numeric_priceRateCachedInputTokenUsed,
	})
	err = middlewares.IncrementUsage(c, user_id, middlewares.COVER_LETTER_GENERATION, db)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Unexpected error",
		})
	}
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
	model                                    anthropic.Model
	numeric_priceRateInputToken              pgtype.Numeric
	numeric_priceRateOutputToken             pgtype.Numeric
	numeric_priceRateCachedInputTokenCreated pgtype.Numeric
	numeric_priceRateCachedInputTokenUsed    pgtype.Numeric
}

func assertUsabilityAndGetModel(user_id uuid.UUID, query_ctx context.Context, queries *sqlc_gen.Queries) (modelAndPrices, error) {

	var model anthropic.Model
	model = anthropic.ModelClaude3_7SonnetLatest

	var priceRateInputToken float64
	var priceRateOutputToken float64
	var priceRateCachedInputTokenCreated float64
	var priceRateCachedInputTokenUsed float64
	var numeric_priceRateInputToken pgtype.Numeric
	var numeric_priceRateOutputToken pgtype.Numeric
	var numeric_priceRateCachedInputTokenCreated pgtype.Numeric
	var numeric_priceRateCachedInputTokenUsed pgtype.Numeric

	switch model {
	case anthropic.ModelClaude3_7SonnetLatest:
		priceRateInputToken = 0.000003 // $3 per million input tokens
		numeric_priceRateInputToken.Scan(strconv.FormatFloat(priceRateInputToken, 'f', -1, 64))
		priceRateOutputToken = 0.000015 // $15 per million output tokens
		numeric_priceRateOutputToken.Scan(strconv.FormatFloat(priceRateOutputToken, 'f', -1, 64))

		priceRateCachedInputTokenCreated = 0.000003 * 1.25 // $3 per million input tokens * 1.25 : 25% more expensive
		numeric_priceRateCachedInputTokenCreated.Scan(strconv.FormatFloat(priceRateCachedInputTokenCreated, 'f', -1, 64))
		priceRateCachedInputTokenUsed = 0.000003 * 0.1 // $3 per million input tokens * 0.1 : 90% less expensive
		numeric_priceRateCachedInputTokenUsed.Scan(strconv.FormatFloat(priceRateCachedInputTokenUsed, 'f', -1, 64))
	case anthropic.ModelClaude3_5HaikuLatest:
		priceRateInputToken = 0.00000080 // $0.80 per million input tokens
		numeric_priceRateInputToken.Scan(strconv.FormatFloat(priceRateInputToken, 'f', -1, 64))
		priceRateOutputToken = 0.000004 // $4 per million output tokens
		numeric_priceRateOutputToken.Scan(strconv.FormatFloat(priceRateOutputToken, 'f', -1, 64))

		priceRateCachedInputTokenCreated = 0.00000080 * 1.25 // $0.80 per million input tokens * 1.25 : 25% more expensive
		numeric_priceRateCachedInputTokenCreated.Scan(strconv.FormatFloat(priceRateCachedInputTokenCreated, 'f', -1, 64))
		priceRateCachedInputTokenUsed = 0.00000080 * 0.1 // $0.80 per million input tokens * 0.1 : 90% less expensive
		numeric_priceRateCachedInputTokenUsed.Scan(strconv.FormatFloat(priceRateCachedInputTokenUsed, 'f', -1, 64))
	default: // Not possible
	}
	return modelAndPrices{
		model:                                    model,
		numeric_priceRateInputToken:              numeric_priceRateInputToken,
		numeric_priceRateOutputToken:             numeric_priceRateOutputToken,
		numeric_priceRateCachedInputTokenCreated: numeric_priceRateCachedInputTokenCreated,
		numeric_priceRateCachedInputTokenUsed:    numeric_priceRateCachedInputTokenUsed,
	}, nil
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
