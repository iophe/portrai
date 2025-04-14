package handlers

import (
	"backend/lib/api/middlewares"
	ca "backend/lib/services/cache"
	db_lib "backend/lib/services/db"
	resumetemplates "backend/lib/services/resume_templates"
	"backend/lib/utils"
	"backend/sqlc_gen"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type GetPDFResumeParams struct {
	Fileid string `params:"file_id"`
}

func HandleGetPDFResume(params GetPDFResumeParams, c *fiber.Ctx) error {
	bucket := "latex"

	request, err := http.NewRequest("GET", fmt.Sprintf("%s/object/%s/%s", utils.KONG_STORAGE_URL, bucket, params.Fileid), nil)
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
			"error": "failed to get pdf",
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
	if response.StatusCode != http.StatusOK {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get pdf, the file does not exist",
			"details": string(body_bytes),
		})
	}

	c.Set("Content-Type", "application/pdf")
	return c.Status(fiber.StatusOK).Send(body_bytes)
}

type GenerateResumeFromProfileParams struct {
	TemplateName string `params:"template_name"`
}

func (params *GenerateResumeFromProfileParams) Validate() bool {
	return resumetemplates.ValidateTemplateName(params.TemplateName)
}

func HandleGenerateResumeFromProfile(params GenerateResumeFromProfileParams, c *fiber.Ctx, db *db_lib.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	queries := sqlc_gen.New(db.Pool)

	opt_resume_uid, err := queries.GetCurrentResumeUID(c.Context(), user_id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve resume uid",
			"details": err.Error(),
		})
	}

	build_file_flag := true
	create_generated_resume_row_flag := false
	create_resume_uid_flag := false

	var file_id uuid.UUID
	var resume_name string
	var resume_uid uuid.UUID

	if opt_resume_uid.Valid {
		resume_uid = opt_resume_uid.Bytes
		generated_resume, err := queries.GetGeneratedResumeByUID(c.Context(), sqlc_gen.GetGeneratedResumeByUIDParams{
			ResumeUid: resume_uid,
			UserID:    user_id,
		})

		if err != nil && err != pgx.ErrNoRows {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Failed to retrieve generated resume",
				"details": err.Error(),
			})
		} else if err == pgx.ErrNoRows {
			generated_resume, err := queries.GetGeneratedResumeByUserID(c.Context(), user_id)
			if err != nil && err != pgx.ErrNoRows {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error":   "Failed to retrieve generated resume",
					"details": err.Error(),
				})
			} else if err == pgx.ErrNoRows {
				// Create new row
				file_id = uuid.New()
				create_generated_resume_row_flag = true
			} else {
				// update the found row
				file_id = generated_resume.ResumeFileID
			}
		} else {
			file_id = generated_resume.ResumeFileID
			if generated_resume.TemplateName == params.TemplateName {
				// Return old resume, no need to rebuild one
				build_file_flag = false
				resume_name = generated_resume.Filename
			} else {
				// Rebuild one with the same file_id and update template name
			}
		}
	} else {
		file_id = uuid.New()
		create_resume_uid_flag = true
		create_generated_resume_row_flag = true
		resume_uid = uuid.New()
	}

	if !build_file_flag {
		// Return old resume
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"resume_id":   file_id,
			"resume_name": resume_name,
		})
	} else {
		resume_data, user, profile, err := getResumeData(user_id, c.Context(), queries)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Could get the data of the resume",
				"details": err.Error(),
			})
		}

		latex_file, err := resumetemplates.ConvertResumeToLatex(params.TemplateName, resume_data.Convert(), user, profile)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Could generate latex file",
				"details": err.Error(),
			})
		}

		fmt.Println()
		fmt.Println()
		fmt.Println(latex_file)
		fmt.Println()
		fmt.Println()

		resume_name = fmt.Sprintf("%s_%s", strings.ReplaceAll(user.FullName, " ", "_"), time.Now().Format("2006_01_02"))

		if create_resume_uid_flag {
			err = queries.UpdateResumeUIDinVersion(c.Context(), sqlc_gen.UpdateResumeUIDinVersionParams{
				UserID:    user_id,
				ResumeUid: resume_uid,
				VersionID: user.CurrentResumeVersion,
			})
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error":   "failed to create resume file metadata",
					"details": err.Error(),
				})
			}
		}

		if create_generated_resume_row_flag {
			err = queries.InsertGeneratedResume(c.Context(), sqlc_gen.InsertGeneratedResumeParams{
				ResumeFileID: file_id,
				Filename:     resume_name,
				UserID:       user_id,
				ResumeUid:    resume_uid,
				TemplateName: params.TemplateName,
			})
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error":   "failed to create resume file metadata",
					"details": err.Error(),
				})
			}
		} else {
			err = queries.UpdateGeneratedResume(c.Context(), sqlc_gen.UpdateGeneratedResumeParams{
				ResumeFileID: file_id,
				Filename:     pgtype.Text{String: resume_name, Valid: true},
				ResumeUid:    pgtype.UUID{Bytes: resume_uid, Valid: true},
				TemplateName: pgtype.Text{String: params.TemplateName, Valid: true},
			})
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error":   "failed to update resume file metadata",
					"details": err.Error(),
				})
			}
		}

		_, err = resumetemplates.GenerateResumePDFFile(latex_file, file_id, resume_name, true)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "failed to generate pdf",
				"details": err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"resume_id":   file_id,
			"resume_name": resume_name,
		})
	}

}

type GenerateLiveResumeFromData struct {
	ResumeData utils.InputResumeData `json:"resume_data"`
}

func HandleGenerateLiveResumeFromData(params GenerateResumeFromProfileParams, data GenerateLiveResumeFromData, c *fiber.Ctx, db *db_lib.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	queries := sqlc_gen.New(db.Pool)

	user, err := queries.GetUserById(c.Context(), user_id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to retrieve user data",
			"details": err.Error(),
		})
	}

	profile, err := queries.GetProfileByUserId(c.Context(), user_id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to retrieve profile data",
			"details": err.Error(),
		})
	}

	latex_file, err := resumetemplates.ConvertResumeToLatex(params.TemplateName, data.ResumeData, user, profile)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Could generate latex file",
			"details": err.Error(),
		})
	}

	resume_name := fmt.Sprintf("%s_%s", strings.ReplaceAll(user.FullName, " ", "_"), time.Now().Format("2006_01_02"))
	file_id := uuid.New()

	pdf_data, err := resumetemplates.GenerateResumePDFFile(latex_file, file_id, resume_name, false)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to generate pdf",
			"details": err.Error(),
		})
	}

	c.Set("Content-Type", "application/pdf")
	return c.Send(pdf_data)
}

type GenerateLiveResumeFromCache struct {
	ConversationID string `json:"conversation_id"`
}

func HandleGenerateLiveResumeFromCache(params GenerateResumeFromProfileParams, data GenerateLiveResumeFromCache, c *fiber.Ctx, cache *ca.Cache, db *db_lib.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	queries := sqlc_gen.New(db.Pool)

	user, err := queries.GetUserById(c.Context(), user_id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to retrieve user data",
			"details": err.Error(),
		})
	}

	profile, err := queries.GetProfileByUserId(c.Context(), user_id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to retrieve profile data",
			"details": err.Error(),
		})
	}
	conversation_id, err := db_lib.StringToUUID(data.ConversationID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get the conversation_id",
			"details": err.Error(),
		})
	}
	resume_data, err := ca.GetResumeData(user_id, conversation_id, c.Context(), cache)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to get the resume data",
			"details": err.Error(),
		})
	}

	latex_file, err := resumetemplates.ConvertResumeToLatex(params.TemplateName, resume_data.InputResumeData, user, profile)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Could generate latex file",
			"details": err.Error(),
		})
	}

	resume_name := fmt.Sprintf("%s_%s", strings.ReplaceAll(user.FullName, " ", "_"), time.Now().Format("2006_01_02"))
	file_id := uuid.New()

	pdf_data, err := resumetemplates.GenerateResumePDFFile(latex_file, file_id, resume_name, false)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "failed to generate pdf",
			"details": err.Error(),
		})
	}

	c.Set("Content-Type", "application/pdf")
	return c.Send(pdf_data)
}

func getResumeData(user_id uuid.UUID, c context.Context, queries *sqlc_gen.Queries) (utils.StoredResumeData, sqlc_gen.GetUserByIdRow, sqlc_gen.GetProfileByUserIdRow, error) {

	resume_data_bytes, err := queries.GetResumeData(c, user_id)
	if err != nil {
		return utils.StoredResumeData{}, sqlc_gen.GetUserByIdRow{}, sqlc_gen.GetProfileByUserIdRow{}, err
	}
	var resume_data utils.StoredResumeData
	if err := json.Unmarshal(resume_data_bytes, &resume_data); err != nil {
		return utils.StoredResumeData{}, sqlc_gen.GetUserByIdRow{}, sqlc_gen.GetProfileByUserIdRow{}, err
	}

	user, err := queries.GetUserById(c, user_id)
	if err != nil {
		return utils.StoredResumeData{}, sqlc_gen.GetUserByIdRow{}, sqlc_gen.GetProfileByUserIdRow{}, err
	}

	profile, err := queries.GetProfileByUserId(c, user_id)
	if err != nil {
		return utils.StoredResumeData{}, sqlc_gen.GetUserByIdRow{}, sqlc_gen.GetProfileByUserIdRow{}, err
	}

	return resume_data, user, profile, nil
}
