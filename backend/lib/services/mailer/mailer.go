package mailer

import (
	"backend/lib/utils"
	"bytes"
	"fmt"
	"html/template"
	"log/slog"
	"path/filepath"
	"time"

	"gopkg.in/mail.v2"
)

type EmailCfg struct {
	Host     string
	Port     int
	Username string
	Password string
}

type EmailData struct {
	From         string                 `json:"from"`
	Name         string                 `json:"name"`
	To           []string               `json:"to"`
	Subject      string                 `json:"subject"`
	Body         string                 `json:"body"`
	Template     string                 `json:"template,omitempty"`
	TemplateData map[string]interface{} `json:"template_data,omitempty"`
}

type SMTPMailer struct {
	Cfg          EmailCfg
	template_dir string
}

var Mailer SMTPMailer = SMTPMailer{}

func NewMailer(cfg EmailCfg) SMTPMailer {
	slog.Info("Mailer Initialization", "cfg", cfg)
	return SMTPMailer{
		Cfg:          cfg,
		template_dir: "./templates/",
	}
}

type GreetingData struct {
	Email string `json:"email"`
}

func MailGreeting(data GreetingData) error {
	year, _, _ := time.Now().Date()
	err := Mailer.SendEmail(EmailData{
		From:     Mailer.Cfg.Username,
		Name:     "Portrai Contact",
		To:       []string{data.Email},
		Subject:  "Welcolm to Portrai",
		Template: "greeting.html",
		TemplateData: map[string]interface{}{
			"current_year": year,
			"home_url":     utils.APP_URL,
		},
	})
	if err != nil {
		return fmt.Errorf("could not send email")
	}
	return nil
}

type ThanksPaymentData struct {
	Email string `json:"email"`
}

func MailThanksPayment(data ThanksPaymentData) error {
	year, _, _ := time.Now().Date()
	err := Mailer.SendEmail(EmailData{
		From:     Mailer.Cfg.Username,
		Name:     "Portrai Contact",
		To:       []string{data.Email},
		Subject:  "Payment Successful",
		Template: "thanks.html",
		TemplateData: map[string]interface{}{
			"current_year": year,
			"home_url":     utils.APP_URL,
		},
	})
	if err != nil {
		return fmt.Errorf("could not send email")
	}
	return nil
}

// SendEmail sends an email with the provided data
func (mailer *SMTPMailer) SendEmail(data EmailData) error {
	msg := mail.NewMessage()
	from := msg.FormatAddress(data.From, data.Name)
	msg.SetHeader("From", from)
	msg.SetHeader("To", data.To...)
	msg.SetHeader("Subject", data.Subject)

	// If template is specified, render it with the provided data
	if data.Template != "" {
		email_body, err := mailer.renderTemplate(data.Template, data.TemplateData)
		if err != nil {
			return err
		}
		msg.SetBody("text/html", email_body)
	} else {
		// Otherwise use the provided body
		msg.SetBody("text/html", data.Body)
	}

	dialer := mail.NewDialer(mailer.Cfg.Host, mailer.Cfg.Port, mailer.Cfg.Username, mailer.Cfg.Password)
	dialer.StartTLSPolicy = mail.MandatoryStartTLS

	return dialer.DialAndSend(msg)
}

// renderTemplate renders the specified template with the provided data
func (mailer *SMTPMailer) renderTemplate(template_name string, template_data map[string]interface{}) (string, error) {
	template_path := filepath.Join(mailer.template_dir, template_name)

	// Parse the template file
	email_template, err := template.ParseFiles(template_path)
	if err != nil {
		return "", err
	}

	// Render the template with the provided data
	var rendered_content bytes.Buffer
	if err := email_template.Execute(&rendered_content, template_data); err != nil {
		return "", err
	}

	return rendered_content.String(), nil
}
