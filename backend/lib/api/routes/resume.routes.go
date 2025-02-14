package routes

import (
	"backend/lib/api/handlers"
	"backend/lib/api/middlewares"
	"backend/lib/services/db"

	"github.com/gofiber/fiber/v2"
)

func RegisterResumeRoutes(group fiber.Router) {
	resume_group := group.Group("/resume")

	resume_group.Use(middlewares.Protected(), middlewares.PayingFeature())
	resume_group.Get("/data", func(c *fiber.Ctx) error {
		return handlers.HandleGetResumeData(c, &db.DB)
	})

	// Notes Routes
	notes_group := resume_group.Group("/notes")
	notes_group.Post("/create", func(c *fiber.Ctx) error {
		var data handlers.NoteCreationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleCreateNote(data, c, &db.DB)
	})
	notes_group.Post("/delete", func(c *fiber.Ctx) error {
		var data handlers.NoteDeletionData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleDeleteNote(data, c, &db.DB)
	})

	// Experience Routes
	experience_group := resume_group.Group("/experience")
	experience_group.Post("/create", func(c *fiber.Ctx) error {
		var data handlers.ExperienceCreationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleExperienceCreation(data, c, &db.DB)
	})

	experience_group.Post("/update", func(c *fiber.Ctx) error {
		var data handlers.ExperienceUpdateData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleExperienceUpdate(data, c, &db.DB)
	})

	experience_group.Get("/all", func(c *fiber.Ctx) error {
		return handlers.HandleGetAllExperiences(c, &db.DB)
	})

	experience_group.Get("/one", func(c *fiber.Ctx) error {
		var params handlers.GetExperienceParams
		if err := c.QueryParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		return handlers.HandleGetExperience(params, c, &db.DB)
	})

	experience_group.Post("/delete", func(c *fiber.Ctx) error {
		var params handlers.DeleteExperienceData
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleDeleteExperience(params, c, &db.DB)
	})

	experience_group.Post("/toggle", func(c *fiber.Ctx) error {
		var data handlers.ToggleExperienceVisibilityData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleToggleExperienceVisibility(data, c, &db.DB)
	})

	experience_group.Post("/reorder", func(c *fiber.Ctx) error {
		var data handlers.ReorderExperienceData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleReorderExperience(data, c, &db.DB)
	})

	// Education Routes
	education_group := resume_group.Group("/education")
	education_group.Post("/create", func(c *fiber.Ctx) error {
		var data handlers.EducationCreationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleEducationCreation(data, c, &db.DB)
	})
	education_group.Post("/update", func(c *fiber.Ctx) error {
		var data handlers.EducationUpdateData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleEducationUpdate(data, c, &db.DB)
	})
	education_group.Get("/all", func(c *fiber.Ctx) error {
		return handlers.HandleGetAllEducations(c, &db.DB)
	})
	education_group.Get("/one", func(c *fiber.Ctx) error {
		var params handlers.GetEducationParams
		if err := c.QueryParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		return handlers.HandleGetEducation(params, c, &db.DB)
	})
	education_group.Post("/delete", func(c *fiber.Ctx) error {
		var params handlers.DeleteEducationData
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleDeleteEducation(params, c, &db.DB)
	})

	education_group.Post("/toggle", func(c *fiber.Ctx) error {
		var data handlers.ToggleEducationVisibilityData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleToggleEducationVisibility(data, c, &db.DB)
	})

	education_group.Post("/reorder", func(c *fiber.Ctx) error {
		var data handlers.ReorderEducationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleReorderEducation(data, c, &db.DB)
	})

	// Skill Routes
	skill_group := resume_group.Group("/skill")
	skill_group.Post("/create", func(c *fiber.Ctx) error {
		var data handlers.SkillCreationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleSkillCreation(data, c, &db.DB)
	})
	skill_group.Post("/update", func(c *fiber.Ctx) error {
		var data handlers.SkillUpdateData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleSkillUpdate(data, c, &db.DB)
	})
	skill_group.Get("/all", func(c *fiber.Ctx) error {
		return handlers.HandleGetAllSkills(c, &db.DB)
	})
	skill_group.Get("/one", func(c *fiber.Ctx) error {
		var params handlers.GetSkillParams
		if err := c.QueryParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		return handlers.HandleGetSkill(params, c, &db.DB)
	})
	skill_group.Post("/delete", func(c *fiber.Ctx) error {
		var params handlers.DeleteSkillData
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleDeleteSkill(params, c, &db.DB)
	})

	skill_group.Post("/toggle", func(c *fiber.Ctx) error {
		var data handlers.ToggleSkillVisibilityData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleToggleSkillVisibility(data, c, &db.DB)
	})

	skill_group.Post("/reorder", func(c *fiber.Ctx) error {
		var data handlers.ReorderSkillData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleReorderSkill(data, c, &db.DB)
	})

	// Certificate Routes
	certificate_group := resume_group.Group("/certificate")
	certificate_group.Post("/create", func(c *fiber.Ctx) error {
		var data handlers.CertificateCreationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleCertificateCreation(data, c, &db.DB)
	})
	certificate_group.Post("/update", func(c *fiber.Ctx) error {
		var data handlers.CertificateUpdateData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleCertificateUpdate(data, c, &db.DB)
	})
	certificate_group.Get("/all", func(c *fiber.Ctx) error {
		return handlers.HandleGetAllCertificates(c, &db.DB)
	})
	certificate_group.Get("/one", func(c *fiber.Ctx) error {
		var params handlers.GetCertificateParams
		if err := c.QueryParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		return handlers.HandleGetCertificate(params, c, &db.DB)
	})
	certificate_group.Post("/delete", func(c *fiber.Ctx) error {
		var params handlers.DeleteCertificateData
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleDeleteCertificate(params, c, &db.DB)
	})

	certificate_group.Post("/toggle", func(c *fiber.Ctx) error {
		var data handlers.ToggleCertificateVisibilityData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleToggleCertificateVisibility(data, c, &db.DB)
	})

	certificate_group.Post("/reorder", func(c *fiber.Ctx) error {
		var data handlers.ReorderCertificateData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleReorderCertificate(data, c, &db.DB)
	})

	// Project Routes
	project_group := resume_group.Group("/project")
	project_group.Post("/create", func(c *fiber.Ctx) error {
		var data handlers.ProjectCreationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleProjectCreation(data, c, &db.DB)
	})
	project_group.Post("/update", func(c *fiber.Ctx) error {
		var data handlers.ProjectUpdateData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleProjectUpdate(data, c, &db.DB)
	})
	project_group.Get("/all", func(c *fiber.Ctx) error {
		return handlers.HandleGetAllProjects(c, &db.DB)
	})
	project_group.Get("/one", func(c *fiber.Ctx) error {
		var params handlers.GetProjectParams
		if err := c.QueryParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid query parameters",
			})
		}
		return handlers.HandleGetProject(params, c, &db.DB)
	})
	project_group.Post("/delete", func(c *fiber.Ctx) error {
		var params handlers.DeleteProjectData
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleDeleteProject(params, c, &db.DB)
	})
	project_group.Post("/toggle", func(c *fiber.Ctx) error {
		var data handlers.ToggleProjectVisibilityData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleToggleProjectVisibility(data, c, &db.DB)
	})

	project_group.Post("/reorder", func(c *fiber.Ctx) error {
		var data handlers.ReorderProjectData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return handlers.HandleReorderProject(data, c, &db.DB)
	})
}
