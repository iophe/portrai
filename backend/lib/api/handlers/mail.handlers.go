package handlers

import (
	"backend/lib/services/mailer"
	"log/slog"

	"github.com/gofiber/fiber/v2"
)

type IssueData struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

func HandleNewIssue(c *fiber.Ctx, data IssueData) error {
	err := mailer.Mailer.SendEmail(mailer.EmailData{
		From:     mailer.Mailer.Cfg.Username,
		Name:     "Portrai Contact",
		To:       []string{mailer.Mailer.Cfg.Username},
		Subject:  "Issue",
		Template: "issue.html",
		TemplateData: map[string]interface{}{
			"name":    data.Name,
			"email":   data.Email,
			"subject": data.Subject,
			"message": data.Message,
		},
	})
	if err != nil {
		slog.Error(err.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "could not send email",
		})
	}
	return c.SendStatus(fiber.StatusOK)
}
