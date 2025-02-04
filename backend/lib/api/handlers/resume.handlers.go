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

	experience_id, err := queries.CreateExperience(query_ctx, sqlc_gen.CreateExperienceParams{
		UserID:          user_id,
		CompanyName:     data.CompanyName,
		JobTitle:        data.JobTitle,
		Location:        data.Location,
		StartDate:       start_date,
		OptionalEndDate: end_date,
		IsCurrent:       data.IsCurrent,
		Description:     data.Description,
		Tags:            data.Tags,
		Notes:           notes,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not create this experience",
			"info":  err,
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"experience_id": experience_id,
	})
}

type ExperienceUpdateData struct {
	ExperienceId int64       `json:"experience_id"`
	CompanyName  string      `json:"company_name"`
	JobTitle     string      `json:"job_title"`
	Location     string      `json:"location"`
	StartDate    string      `json:"start_date"`
	EndDate      string      `json:"optional_end_date"`
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
		ExperienceID:    data.ExperienceId,
		UserID:          user_id,
		CompanyName:     data.CompanyName,
		JobTitle:        data.JobTitle,
		Location:        data.Location,
		StartDate:       start_date,
		OptionalEndDate: end_date,
		IsCurrent:       data.IsCurrent,
		Description:     data.Description,
		Priority:        data.Priority,
		Tags:            data.Tags,
		Notes:           notes,
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

type DeleteExperienceData struct {
	ExperienceId int64 `json:"experience_id"`
}

func HandleDeleteExperience(data DeleteExperienceData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)
	slog.Info("deleting experiences", "experience_id", data.ExperienceId, "user_id", user_id)
	err = queries.DeleteExperience(query_ctx, sqlc_gen.DeleteExperienceParams{
		ExperienceID: data.ExperienceId,
		UserID:       user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not delete this experiences",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

type ToggleExperienceVisibilityData struct {
	ExperienceId int64 `json:"experience_id"`
}

func HandleToggleExperienceVisibility(data ToggleExperienceVisibilityData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	visibility, err := queries.ToggleExperienceVisibility(query_ctx, sqlc_gen.ToggleExperienceVisibilityParams{
		ExperienceID: data.ExperienceId,
		UserID:       user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not toggle this experience visibility",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"visibility": visibility,
	})
}

type ReorderExperienceData struct {
	ExperienceId int64 `json:"experience_id"`
	AfterID      int64 `json:"after_id"`
}

func HandleReorderExperience(data ReorderExperienceData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.ReorderExperience(query_ctx, sqlc_gen.ReorderExperienceParams{
		ExperienceID: data.ExperienceId,
		AfterID:      data.AfterID,
		UserID:       user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not toggle this experience visibility",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

// Education Handlers

type EducationCreationData struct {
	School      string      `json:"school"`
	Degree      string      `json:"degree"`
	Location    string      `json:"location"`
	StartDate   string      `json:"start_date"`
	EndDate     string      `json:"end_date"`
	IsCurrent   bool        `json:"is_current"`
	Description string      `json:"description"`
	Tags        []string    `json:"tags"`
	Notes       []fiber.Map `json:"notes"`
}

func HandleEducationCreation(data EducationCreationData, c *fiber.Ctx, db *database.Database) error {
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

	education_id, err := queries.CreateEducation(query_ctx, sqlc_gen.CreateEducationParams{
		UserID:          user_id,
		School:          data.School,
		Degree:          data.Degree,
		Location:        data.Location,
		StartDate:       start_date,
		OptionalEndDate: end_date,
		IsCurrent:       data.IsCurrent,
		Description:     data.Description,
		Tags:            data.Tags,
		Notes:           notes,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not create this education",
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"education_id": education_id,
	})
}

type EducationUpdateData struct {
	EducationId int64       `json:"education_id"`
	School      string      `json:"school"`
	Degree      string      `json:"degree"`
	Location    string      `json:"location"`
	StartDate   string      `json:"start_date"`
	EndDate     string      `json:"end_date"`
	IsCurrent   bool        `json:"is_current"`
	Description string      `json:"description"`
	Priority    int32       `json:"priority"`
	Tags        []string    `json:"tags"`
	Notes       []fiber.Map `json:"notes"`
}

func HandleEducationUpdate(data EducationUpdateData, c *fiber.Ctx, db *db.Database) error {
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

	err = queries.UpdateEducation(query_ctx, sqlc_gen.UpdateEducationParams{
		EducationID:     data.EducationId,
		UserID:          user_id,
		School:          data.School,
		Degree:          data.Degree,
		Location:        data.Location,
		StartDate:       start_date,
		OptionalEndDate: end_date,
		IsCurrent:       data.IsCurrent,
		Description:     data.Description,
		Priority:        data.Priority,
		Tags:            data.Tags,
		Notes:           notes,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not update this education",
		})
	}
	return c.SendStatus(fiber.StatusOK)
}

func HandleGetAllEducations(c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	educations, err := queries.GetEducationsByUserId(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get your educations",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"educations": educations,
	})
}

type GetEducationParams struct {
	EducationId int64 `query:"education_id"`
}

func HandleGetEducation(params GetEducationParams, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	education, err := queries.GetEducationById(query_ctx, sqlc_gen.GetEducationByIdParams{
		EducationID: params.EducationId,
		UserID:      user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get this education",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"education": education,
	})
}

type DeleteEducationData struct {
	EducationId int64 `json:"education_id"`
}

func HandleDeleteEducation(params DeleteEducationData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.DeleteEducation(query_ctx, sqlc_gen.DeleteEducationParams{
		EducationID: params.EducationId,
		UserID:      user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not delete this education",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

type ToggleEducationVisibilityData struct {
	EducationId int64 `json:"education_id"`
}

func HandleToggleEducationVisibility(data ToggleEducationVisibilityData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	visibility, err := queries.ToggleEducationVisibility(query_ctx, sqlc_gen.ToggleEducationVisibilityParams{
		EducationID: data.EducationId,
		UserID:      user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not toggle this experience visibility",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"visibility": visibility,
	})
}

type ReorderEducationData struct {
	EducationId int64 `json:"education_id"`
	AfterID     int64 `json:"after_id"`
}

func HandleReorderEducation(data ReorderEducationData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.ReorderEducation(query_ctx, sqlc_gen.ReorderEducationParams{
		EducationID: data.EducationId,
		AfterID:     data.AfterID,
		UserID:      user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not toggle this experience visibility",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

// Skills Handlers

type SkillCreationData struct {
	SkillName          string      `json:"skill_name"`
	OptionalSkillType  string      `json:"optional_skill_type"`
	OptionalSkillLevel string      `json:"optional_skill_level"`
	Description        string      `json:"description"`
	Tags               []string    `json:"tags"`
	Notes              []fiber.Map `json:"notes"`
}

func HandleSkillCreation(data SkillCreationData, c *fiber.Ctx, db *database.Database) error {
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

	skill_id, err := queries.CreateSkill(query_ctx, sqlc_gen.CreateSkillParams{
		UserID:             user_id,
		SkillName:          data.SkillName,
		OptionalSkillType:  sqlc_gen.SkillType(data.OptionalSkillType),
		OptionalSkillLevel: sqlc_gen.SkillLevel(data.OptionalSkillLevel),
		Description:        data.Description,
		Tags:               data.Tags,
		Notes:              notes,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not create this skill",
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"skill_id": skill_id,
	})
}

type SkillUpdateData struct {
	SkillId            int64       `json:"skill_id"`
	SkillName          string      `json:"skill_name"`
	OptionalSkillType  string      `json:"optional_skill_type"`
	OptionalSkillLevel string      `json:"optional_skill_level"`
	Description        string      `json:"description"`
	Priority           int32       `json:"priority"`
	Tags               []string    `json:"tags"`
	Notes              []fiber.Map `json:"notes"`
}

func HandleSkillUpdate(data SkillUpdateData, c *fiber.Ctx, db *db.Database) error {
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

	err = queries.UpdateSkill(query_ctx, sqlc_gen.UpdateSkillParams{
		SkillID:            data.SkillId,
		UserID:             user_id,
		SkillName:          data.SkillName,
		OptionalSkillType:  sqlc_gen.SkillType(data.OptionalSkillType),
		OptionalSkillLevel: sqlc_gen.SkillLevel(data.OptionalSkillLevel),
		Description:        data.Description,
		Priority:           data.Priority,
		Tags:               data.Tags,
		Notes:              notes,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not update this skill",
		})
	}
	return c.SendStatus(fiber.StatusOK)
}

func HandleGetAllSkills(c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	skills, err := queries.GetSkillsByUserId(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get your skills",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"skills": skills,
	})
}

type GetSkillParams struct {
	SkillId int64 `query:"skill_id"`
}

func HandleGetSkill(params GetSkillParams, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	skill, err := queries.GetSkillById(query_ctx, sqlc_gen.GetSkillByIdParams{
		SkillID: params.SkillId,
		UserID:  user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get this skill",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"skill": skill,
	})
}

type DeleteSkillData struct {
	SkillId int64 `json:"skill_id"`
}

func HandleDeleteSkill(params DeleteSkillData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.DeleteSkill(query_ctx, sqlc_gen.DeleteSkillParams{
		SkillID: params.SkillId,
		UserID:  user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not delete this skill",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

type ToggleSkillVisibilityData struct {
	SkillId int64 `json:"skill_id"`
}

func HandleToggleSkillVisibility(data ToggleSkillVisibilityData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	visibility, err := queries.ToggleSkillVisibility(query_ctx, sqlc_gen.ToggleSkillVisibilityParams{
		SkillID: data.SkillId,
		UserID:  user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not toggle this experience visibility",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"visibility": visibility,
	})
}

type ReorderSkillData struct {
	SkillId int64 `json:"skill_id"`
	AfterID int64 `json:"after_id"`
}

func HandleReorderSkill(data ReorderSkillData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.ReorderSkill(query_ctx, sqlc_gen.ReorderSkillParams{
		SkillID: data.SkillId,
		AfterID: data.AfterID,
		UserID:  user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not toggle this experience visibility",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

// Certificate Handlers

type CertificateCreationData struct {
	CertificateName     string      `json:"certificate_name"`
	OptionalIssuer      string      `json:"optional_issuer"`
	OptionalLocation    string      `json:"optional_location"`
	OptionalGrantedDate string      `json:"optional_granted_date"`
	Description         string      `json:"description"`
	Tags                []string    `json:"tags"`
	Notes               []fiber.Map `json:"notes"`
}

func HandleCertificateCreation(data CertificateCreationData, c *fiber.Ctx, db *database.Database) error {
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

	granted_date, err := database.StringToDate(data.OptionalGrantedDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid granted date",
		})
	}

	certificate_id, err := queries.CreateCertificate(query_ctx, sqlc_gen.CreateCertificateParams{
		UserID:              user_id,
		CertificateName:     data.CertificateName,
		OptionalIssuer:      data.OptionalIssuer,
		OptionalLocation:    data.OptionalLocation,
		OptionalGrantedDate: granted_date,
		Description:         data.Description,
		Tags:                data.Tags,
		Notes:               notes,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not create this certificate",
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"certificate_id": certificate_id,
	})
}

type CertificateUpdateData struct {
	CertificateId       int64       `json:"certificate_id"`
	CertificateName     string      `json:"certificate_name"`
	OptionalIssuer      string      `json:"optional_issuer"`
	OptionalLocation    string      `json:"optional_location"`
	OptionalGrantedDate string      `json:"optional_granted_date"`
	Description         string      `json:"description"`
	Priority            int32       `json:"priority"`
	Tags                []string    `json:"tags"`
	Notes               []fiber.Map `json:"notes"`
}

func HandleCertificateUpdate(data CertificateUpdateData, c *fiber.Ctx, db *db.Database) error {
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

	granted_date, err := database.StringToDate(data.OptionalGrantedDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("invalid granted date %s", err),
		})
	}

	err = queries.UpdateCertificate(query_ctx, sqlc_gen.UpdateCertificateParams{
		CertificateID:       data.CertificateId,
		UserID:              user_id,
		CertificateName:     data.CertificateName,
		OptionalIssuer:      data.OptionalIssuer,
		OptionalLocation:    data.OptionalLocation,
		OptionalGrantedDate: granted_date,
		Description:         data.Description,
		Priority:            data.Priority,
		Tags:                data.Tags,
		Notes:               notes,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not update this certificate",
		})
	}
	return c.SendStatus(fiber.StatusOK)
}

func HandleGetAllCertificates(c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	certificates, err := queries.GetCertificatesByUserId(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get your certificates",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"certificates": certificates,
	})
}

type GetCertificateParams struct {
	CertificateId int64 `query:"certificate_id"`
}

func HandleGetCertificate(params GetCertificateParams, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	certificate, err := queries.GetCertificateById(query_ctx, sqlc_gen.GetCertificateByIdParams{
		CertificateID: params.CertificateId,
		UserID:        user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get this certificate",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"certificate": certificate,
	})
}

type DeleteCertificateData struct {
	CertificateId int64 `json:"certificate_id"`
}

func HandleDeleteCertificate(params DeleteCertificateData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.DeleteCertificate(query_ctx, sqlc_gen.DeleteCertificateParams{
		CertificateID: params.CertificateId,
		UserID:        user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not delete this certificate",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

type ToggleCertificateVisibilityData struct {
	CertificateId int64 `json:"certificate_id"`
}

func HandleToggleCertificateVisibility(data ToggleCertificateVisibilityData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	visibility, err := queries.ToggleCertificateVisibility(query_ctx, sqlc_gen.ToggleCertificateVisibilityParams{
		CertificateID: data.CertificateId,
		UserID:        user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not toggle this experience visibility",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"visibility": visibility,
	})
}

type ReorderCertificateData struct {
	CertificateId int64 `json:"certificate_id"`
	AfterID       int64 `json:"after_id"`
}

func HandleReorderCertificate(data ReorderCertificateData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.ReorderCertificate(query_ctx, sqlc_gen.ReorderCertificateParams{
		CertificateID: data.CertificateId,
		AfterID:       data.AfterID,
		UserID:        user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not toggle this experience visibility",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

// Project Handlers

type ProjectCreationData struct {
	ProjectTitle            string      `json:"project_title"`
	OptionalProjectSubtitle string      `json:"optional_project_subtitle"`
	StartDate               string      `json:"start_date"`
	EndDate                 string      `json:"end_date"`
	IsCurrent               bool        `json:"is_current"`
	Description             string      `json:"description"`
	Tags                    []string    `json:"tags"`
	Notes                   []fiber.Map `json:"notes"`
}

func HandleProjectCreation(data ProjectCreationData, c *fiber.Ctx, db *database.Database) error {
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

	var start_date pgtype.Date
	if len(data.StartDate) > 0 {
		start_date, err = database.StringToDate(data.StartDate)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid start date",
			})
		}
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

	project_id, err := queries.CreateProject(query_ctx, sqlc_gen.CreateProjectParams{
		UserID:                  user_id,
		ProjectTitle:            data.ProjectTitle,
		OptionalProjectSubtitle: data.OptionalProjectSubtitle,
		OptionalStartDate:       start_date,
		OptionalEndDate:         end_date,
		IsCurrent:               data.IsCurrent,
		Description:             data.Description,
		Tags:                    data.Tags,
		Notes:                   notes,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not create this project",
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"project_id": project_id,
	})
}

type ProjectUpdateData struct {
	ProjectId               int64       `json:"project_id"`
	ProjectTitle            string      `json:"project_title"`
	OptionalProjectSubtitle string      `json:"optional_project_subtitle"`
	StartDate               string      `json:"start_date"`
	EndDate                 string      `json:"end_date"`
	IsCurrent               bool        `json:"is_current"`
	Description             string      `json:"description"`
	Priority                int32       `json:"priority"`
	Tags                    []string    `json:"tags"`
	Notes                   []fiber.Map `json:"notes"`
}

func HandleProjectUpdate(data ProjectUpdateData, c *fiber.Ctx, db *db.Database) error {
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

	var start_date pgtype.Date
	if len(data.StartDate) > 0 {
		start_date, err = database.StringToDate(data.StartDate)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fmt.Sprintf("invalid start date %s", err),
			})
		}
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

	err = queries.UpdateProject(query_ctx, sqlc_gen.UpdateProjectParams{
		ProjectID:               data.ProjectId,
		UserID:                  user_id,
		ProjectTitle:            data.ProjectTitle,
		OptionalProjectSubtitle: data.OptionalProjectSubtitle,
		OptionalStartDate:       start_date,
		OptionalEndDate:         end_date,
		IsCurrent:               data.IsCurrent,
		Description:             data.Description,
		Priority:                data.Priority,
		Tags:                    data.Tags,
		Notes:                   notes,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not update this project",
		})
	}
	return c.SendStatus(fiber.StatusOK)
}

func HandleGetAllProjects(c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	projects, err := queries.GetProjectsByUserId(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get your projects",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"projects": projects,
	})
}

type GetProjectParams struct {
	ProjectId int64 `query:"project_id"`
}

func HandleGetProject(params GetProjectParams, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	project, err := queries.GetProjectById(query_ctx, sqlc_gen.GetProjectByIdParams{
		ProjectID: params.ProjectId,
		UserID:    user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get this project",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"project": project,
	})
}

type DeleteProjectData struct {
	ProjectId int64 `json:"project_id"`
}

func HandleDeleteProject(params DeleteProjectData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.DeleteProject(query_ctx, sqlc_gen.DeleteProjectParams{
		ProjectID: params.ProjectId,
		UserID:    user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not delete this project",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

type ToggleProjectVisibilityData struct {
	ProjectId int64 `json:"project_id"`
}

func HandleToggleProjectVisibility(data ToggleProjectVisibilityData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	visibility, err := queries.ToggleProjectVisibility(query_ctx, sqlc_gen.ToggleProjectVisibilityParams{
		ProjectID: data.ProjectId,
		UserID:    user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not toggle this experience visibility",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"visibility": visibility,
	})
}

type ReorderProjectData struct {
	ProjectId int64 `json:"project_id"`
	AfterID   int64 `json:"after_id"`
}

func HandleReorderProject(data ReorderProjectData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.ReorderProject(query_ctx, sqlc_gen.ReorderProjectParams{
		ProjectID: data.ProjectId,
		AfterID:   data.AfterID,
		UserID:    user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not toggle this experience visibility",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}
