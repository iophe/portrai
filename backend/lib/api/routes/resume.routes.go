package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/db"
	"backend/lib/services/sess"
	"backend/lib/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/csrf"
	futils "github.com/gofiber/fiber/v2/utils"
)

func RegisterResumeRoutes(group fiber.Router) {
	resume_group := group.Group("/resume")

	// CSRF Protection
	resume_group.Use(csrf.New(csrf.Config{
		KeyLookup:         "header:X-Csrf-Token",
		CookieName:        "csrf_",
		CookieSameSite:    "Lax",
		CookieSecure:      utils.SECURE_COOKIE,
		CookieSessionOnly: true,
		KeyGenerator:      futils.UUIDv4,
		Expiration:        1 * time.Hour,
		Session:           sess.SESSIONS,
		SessionKey:        "fiber.csrf.token",
		HandlerContextKey: "fiber.csrf.handler",
	}))

	resume_group.Use(middlewares.Protected(), middlewares.PayingFeature())

	// Main resume data endpoint
	resume_group.Get("/data", func(c *fiber.Ctx) error {
		return handlers.HandleGetResumeData(c, &db.DB)
	})
	resume_group.Get("/versions", func(c *fiber.Ctx) error {
		return handlers.HandleGetResumeVersions(c, &db.DB)
	})
	resume_group.Post("/change-version", func(c *fiber.Ctx) error {
		var data handlers.ChangeResumeVersionData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleChangeResumeVersion(data, c, &db.DB)
	})
	resume_group.Post("/add-version", func(c *fiber.Ctx) error {
		var data handlers.AddResumeVersionData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleAddResumeVersion(data, c, &db.DB)
	})
	resume_group.Post("/delete-version", func(c *fiber.Ctx) error {
		var data handlers.DeleteResumeVersionData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleDeleteResumeVersion(data, c, &db.DB)
	})
	resume_group.Post("/rename-version", func(c *fiber.Ctx) error {
		var data handlers.RenameResumeVersionData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleRenameResumeVersion(data, c, &db.DB)
	})
	// This is a new API that provides a unified way to work with all resume items
	items_group := resume_group.Group("/items")

	// Create a resume item
	items_group.Post("/create", func(c *fiber.Ctx) error {
		var data handlers.ResumeItemCreationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleResumeItemCreation(data, c, &db.DB)
	})

	// Update a resume item
	items_group.Post("/update", func(c *fiber.Ctx) error {
		var data handlers.ResumeItemUpdateData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleResumeItemUpdate(data, c, &db.DB)
	})

	// Get items by type
	items_group.Get("/by-type", func(c *fiber.Ctx) error {
		var params handlers.GetItemsByTypeParams
		if err := c.QueryParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		return handlers.HandleGetItemsByType(params, c, &db.DB)
	})

	// Get one item by ID
	items_group.Get("/one", func(c *fiber.Ctx) error {
		var params handlers.GetItemParams
		if err := c.QueryParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		return handlers.HandleGetItemById(params, c, &db.DB)
	})

	// Delete an item
	items_group.Post("/delete", func(c *fiber.Ctx) error {
		var data handlers.DeleteItemData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleDeleteItem(data, c, &db.DB)
	})

	// Toggle item visibility
	items_group.Post("/toggle", func(c *fiber.Ctx) error {
		var data handlers.ToggleItemVisibilityData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleToggleItemVisibility(data, c, &db.DB)
	})

	// Reorder an item
	items_group.Post("/reorder", func(c *fiber.Ctx) error {
		var data handlers.ReorderItemData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleReorderItem(data, c, &db.DB)
	})

	notes_group := resume_group.Group("/notes")

	// Create a note
	notes_group.Post("/create", func(c *fiber.Ctx) error {
		var data handlers.NoteCreationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleCreateNote(data, c, &db.DB)
	})

	// Delete a note
	notes_group.Post("/delete", func(c *fiber.Ctx) error {
		var data handlers.NoteDeletionData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleDeleteNote(data, c, &db.DB)
	})
}
