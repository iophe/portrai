package handlers

import (
	"backend/lib/api/middlewares"
	"backend/lib/services/cache"
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

// Common handler for getting full resume data
func HandleGetResumeData(c *fiber.Ctx, db *database.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}
	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)
	resume_data_bytes, err := queries.GetResumeData(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve resume data",
			"info":  err.Error(),
		})
	}
	var resume_data cache.ResumeCachedData
	if err := json.Unmarshal(resume_data_bytes, &resume_data); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse resume data",
			"info":  err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"resume_data": resume_data,
	})
}

type NoteCreationData struct {
	Content  string `json:"content"`
	ItemType string `json:"item_type"` // Type of resume item: experience, education, skill, certificate, project
	Type     string `json:"type"`      // Note type
	ItemID   int64  `json:"item_id"`   // ID of the associated resume item
}

func HandleCreateNote(data NoteCreationData, c *fiber.Ctx, db *database.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	// Create note on the unified resume_items table
	err = queries.CreateNoteOnResumeItem(query_ctx, sqlc_gen.CreateNoteOnResumeItemParams{
		UserID:   user_id,
		ItemID:   data.ItemID,
		NoteType: data.Type,
		Content:  data.Content,
	})

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("could not create note on %s", data.ItemType),
			"info":  err.Error(),
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

type NoteDeletionData struct {
	NoteID   int64  `json:"note_id"`
	ItemType string `json:"item_type"` // Type of resume item
	ItemID   int64  `json:"item_id"`   // ID of the associated resume item
}

func HandleDeleteNote(data NoteDeletionData, c *fiber.Ctx, db *database.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.DeleteNote(query_ctx, sqlc_gen.DeleteNoteParams{
		UserID: user_id,
		NoteID: data.NoteID,
		ItemID: data.ItemID,
	})

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("could not delete note from %s", data.ItemType),
			"info":  err.Error(),
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

// Common structure for all resume items
type ResumeItemCreationData struct {
	ItemType    string                 `json:"item_type"`  // experience, education, skill, certificate, project
	Title       string                 `json:"title"`      // job_title, degree, skill_name, certificate_name, project_title
	Subtitle    string                 `json:"subtitle"`   // company_name, school, skill_type, issuer, project_subtitle
	Location    string                 `json:"location"`   // not used for all types
	StartDate   string                 `json:"start_date"` // not used for all types
	EndDate     string                 `json:"end_date"`   // not used for all types
	IsCurrent   bool                   `json:"is_current"` // not used for all types
	Description string                 `json:"description"`
	Tags        []string               `json:"tags"`
	Metadata    map[string]interface{} `json:"metadata"` // Type-specific fields
}

func HandleResumeItemCreation(data ResumeItemCreationData, c *fiber.Ctx, db *database.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	// Process dates
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

	// Convert metadata to JSON
	var metadataJSON []byte
	if data.Metadata != nil {
		metadataJSON, err = json.Marshal(data.Metadata)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid metadata format",
			})
		}
	} else {
		metadataJSON = []byte("{}")
	}

	// Create using the unified CreateResumeItem function
	item_id, err := queries.CreateResumeItem(query_ctx, sqlc_gen.CreateResumeItemParams{
		UserID:      user_id,
		ItemType:    data.ItemType,
		Title:       data.Title,
		Subtitle:    data.Subtitle,
		Location:    data.Location,
		StartDate:   start_date,
		EndDate:     end_date,
		IsCurrent:   data.IsCurrent,
		Description: data.Description,
		Tags:        data.Tags,
		Metadata:    metadataJSON,
	})

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("could not create this %s", data.ItemType),
			"info":  err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"item_id": item_id,
		"type":    data.ItemType,
	})
}

type ResumeItemUpdateData struct {
	ItemID      int64                  `json:"item_id"`
	ItemType    string                 `json:"item_type"`  // experience, education, skill, certificate, project
	Title       pgtype.Text            `json:"title"`      // job_title, degree, skill_name, certificate_name, project_title
	Subtitle    pgtype.Text            `json:"subtitle"`   // company_name, school, skill_type, issuer, project_subtitle
	Location    pgtype.Text            `json:"location"`   // not used for all types
	StartDate   pgtype.Text            `json:"start_date"` // not used for all types
	EndDate     pgtype.Text            `json:"end_date"`   // not used for all types
	IsCurrent   pgtype.Bool            `json:"is_current"` // not used for all types
	Description pgtype.Text            `json:"description"`
	Priority    pgtype.Int4            `json:"priority"`
	Tags        []string               `json:"tags"`
	Metadata    map[string]interface{} `json:"metadata"` // Type-specific fields
}

func HandleResumeItemUpdate(data ResumeItemUpdateData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	// Process dates
	var start_date pgtype.Date
	if data.StartDate.Valid {
		start_date, err = database.StringToDate(data.StartDate.String)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fmt.Sprintf("invalid start date %s", err),
			})
		}
	}

	var end_date pgtype.Date
	if data.EndDate.Valid {
		end_date, err = database.StringToDate(data.EndDate.String)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fmt.Sprintf("invalid end date %s", err),
			})
		}
	}

	// Convert metadata to JSON
	var metadataJSON []byte
	if data.Metadata != nil {
		metadataJSON, err = json.Marshal(data.Metadata)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid metadata format",
			})
		}
	} else {
		metadataJSON = []byte("{}")
	}

	err = queries.UpdateResumeItem(query_ctx, sqlc_gen.UpdateResumeItemParams{
		ItemID:      data.ItemID,
		UserID:      user_id,
		Title:       data.Title,
		Subtitle:    data.Subtitle,
		Location:    data.Location,
		StartDate:   start_date,
		EndDate:     end_date,
		IsCurrent:   data.IsCurrent,
		Description: data.Description,
		Priority:    data.Priority,
		Tags:        data.Tags,
		Metadata:    metadataJSON,
	})

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("could not update this %s", data.ItemType),
			"info":  err.Error(),
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

// Get items of a specific type
type GetItemsByTypeParams struct {
	ItemType string `query:"item_type"`
}

func HandleGetItemsByType(params GetItemsByTypeParams, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	items, err := queries.GetResumeItemsByType(query_ctx, sqlc_gen.GetResumeItemsByTypeParams{
		UserID:   user_id,
		ItemType: params.ItemType,
	})

	if err != nil {
		slog.Error(err.Error())
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("could not get your %ss", params.ItemType),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"items": items,
		"type":  params.ItemType,
	})
}

// Get a specific item by ID
type GetItemParams struct {
	ItemID   int64  `query:"item_id"`
	ItemType string `query:"item_type"`
}

func HandleGetItemById(params GetItemParams, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	item, err := queries.GetResumeItemById(query_ctx, sqlc_gen.GetResumeItemByIdParams{
		ItemID: params.ItemID,
		UserID: user_id,
	})

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("could not get this %s", params.ItemType),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"item": item,
		"type": params.ItemType,
	})
}

// Delete an item
type DeleteItemData struct {
	ItemID   int64  `json:"item_id"`
	ItemType string `json:"item_type"`
}

func HandleDeleteItem(data DeleteItemData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	slog.Info("deleting item", "item_id", data.ItemID, "item_type", data.ItemType, "user_id", user_id)

	err = queries.DeleteResumeItem(query_ctx, sqlc_gen.DeleteResumeItemParams{
		ItemID: data.ItemID,
		UserID: user_id,
	})

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("could not delete this %s", data.ItemType),
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

// Toggle item visibility
type ToggleItemVisibilityData struct {
	ItemID   int64  `json:"item_id"`
	ItemType string `json:"item_type"`
}

func HandleToggleItemVisibility(data ToggleItemVisibilityData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	visibility, err := queries.ToggleResumeItemVisibility(query_ctx, sqlc_gen.ToggleResumeItemVisibilityParams{
		ItemID: data.ItemID,
		UserID: user_id,
	})

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("could not toggle this %s visibility", data.ItemType),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"visibility": visibility,
	})
}

// Reorder an item
type ReorderItemData struct {
	ItemID   int64  `json:"item_id"`
	AfterID  int64  `json:"after_id"`
	ItemType string `json:"item_type"`
}

func HandleReorderItem(data ReorderItemData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.ReorderResumeItem(query_ctx, sqlc_gen.ReorderResumeItemParams{
		ItemID:  data.ItemID,
		AfterID: data.AfterID,
		UserID:  user_id,
	})

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("could not reorder this %s", data.ItemType),
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

func HandleGetResumeVersions(c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	versions, err := queries.GetUserResumeVersions(query_ctx, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get all the versions",
		})
	}

	return c.Status(fiber.StatusOK).JSON(versions)
}

type ChangeResumeVersionData struct {
	Version string `json:"version"`
}

func HandleChangeResumeVersion(data ChangeResumeVersionData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.ChangeResumeVersion(query_ctx, sqlc_gen.ChangeResumeVersionParams{
		Version: data.Version,
		UserID:  user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get all the versions",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

type AddResumeVersionData struct {
	NewVersion string `json:"new_version"`
}

func HandleAddResumeVersion(data AddResumeVersionData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.AddResumeVersion(query_ctx, sqlc_gen.AddResumeVersionParams{
		UserID:     user_id,
		NewVersion: data.NewVersion,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "could not get all the versions",
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

type DeleteResumeVersionData struct {
	Version string `json:"version"`
}

func HandleDeleteResumeVersion(data DeleteResumeVersionData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.DeleteResumeVersion(query_ctx, sqlc_gen.DeleteResumeVersionParams{
		UserID:  user_id,
		Version: data.Version,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "could not delete this version",
			"details": err.Error(),
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

type RenameResumeVersionData struct {
	OldName string `json:"old_name"`
	NewName string `json:"new_name"`
}

func HandleRenameResumeVersion(data RenameResumeVersionData, c *fiber.Ctx, db *db.Database) error {
	user_id, err := middlewares.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	query_ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	queries := sqlc_gen.New(db.Pool)

	err = queries.RenameResumeVersion(query_ctx, sqlc_gen.RenameResumeVersionParams{
		NewName: data.NewName,
		OldName: data.OldName,
		UserID:  user_id,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "could not rename this version",
			"details": err.Error(),
		})
	}

	return c.SendStatus(fiber.StatusOK)
}
