package main

import (
	"log"
	"log/slog"

	"github.com/gofiber/fiber/v2"
	"gopkg.in/mail.v2"
)

// EmailConfig holds SMTP configuration
type EmailConfig struct {
	Host     string
	Port     int
	Username string
	Password string
}

// EmailData represents the email message data
type EmailData struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Body    string   `json:"body"`
}

// Email service struct
type EmailService struct {
	config EmailConfig
}

// NewEmailService creates a new email service
func NewEmailService(config EmailConfig) *EmailService {
	return &EmailService{
		config: config,
	}
}

// SendEmail sends an email using SMTP
func (s *EmailService) SendEmail(data EmailData) error {
	m := mail.NewMessage()
	m.SetHeader("From", data.From)
	m.SetHeader("To", data.To...)
	m.SetHeader("Subject", data.Subject)
	m.SetBody("text/html", data.Body)

	d := mail.NewDialer(s.config.Host, s.config.Port, s.config.Username, s.config.Password)
	d.StartTLSPolicy = mail.MandatoryStartTLS

	return d.DialAndSend(m)
}

func main() {
	// Create a new Fiber app
	app := fiber.New()

	// Setup email service with Gmail SMTP settings
	emailService := NewEmailService(EmailConfig{
		Host:     "smtp.gmail.com",
		Port:     587,
		Username: "portrai.contact@gmail.com", // Your Gmail address
		Password: "ipjf vnkw gqzz ehno",       // Your Gmail app password
	})

	// Define the route for sending emails
	app.Post("/send-email", func(c *fiber.Ctx) error {
		slog.Info("Post request to send-email")
		var emailData EmailData
		if err := c.BodyParser(&emailData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Cannot parse JSON",
			})
		}

		// Validate email data
		if len(emailData.To) == 0 || emailData.Subject == "" || emailData.Body == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Missing required fields",
			})
		}

		// Set the from address if not provided
		if emailData.From == "" {
			emailData.From = "portrai.contact@gmail.com"
		}

		// Send the email
		if err := emailService.SendEmail(emailData); err != nil {
			log.Printf("Failed to send email: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to send email",
			})
		}

		return c.JSON(fiber.Map{
			"message": "Email sent successfully",
		})
	})

	// Start the server
	log.Fatal(app.Listen(":3001"))

	// cfg, err := lib.Setup()
	// if err != nil {
	// 	slog.Error("could not setup the server", "err", err)
	// 	return
	// }

	// server := server.New()
	// server.Init(&cfg.ServerCfg)
	// server.Start(&cfg.ServerCfg)
}
