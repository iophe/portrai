package main

import (
	"bytes"
	"fmt"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt"
)

var KONG_AUTH_HOST = os.Getenv("KONG_AUTH_HOST")
var KONG_AUTH_PORT = os.Getenv("KONG_AUTH_PORT")
var SERVICE_ROLE_KEY = os.Getenv("SERVICE_ROLE_KEY")
var JWT_SECRET = os.Getenv("JWT_SECRET")
var KONG_STORAGE_URL = fmt.Sprintf("http://%s:%s/storage/v1", KONG_AUTH_HOST, KONG_AUTH_PORT)

var BUCKET_NAME = "latex"

func main() {
	app := fiber.New()

	port, err := strconv.Atoi(os.Getenv("PORT"))
	if err != nil {
		port = 3780
		slog.Warn("invalid port found in env, expected a valid positive integer, defaulting to 3780", "err", err)
	}

	api_group := app.Group("/api")
	v1_group := api_group.Group("/v1")

	RegisterRoutes(v1_group)

	err = app.Listen(fmt.Sprintf(":%d", port))
	if err != nil {
		panic(fmt.Sprintf("cannot start server: %s", err))
	}
}

func RegisterRoutes(api fiber.Router) {
	RegisterLatexRoutes(api)
}
func RegisterLatexRoutes(api fiber.Router) {
	latex_group := api.Group("latex")

	latex_group.Post("/generate", func(c *fiber.Ctx) error {
		var data LatexPDFGenerationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return HandleLatexPDFGeneration(data, c)
	})
}

type LatexPDFGenerationData struct {
	LatexFile string `json:"latex_file"`
	FileID    string `json:"file_id"`
	Filename  string `json:"file_name"`
	Store     bool   `json:"store"`
}

func HandleLatexPDFGeneration(data LatexPDFGenerationData, c *fiber.Ctx) error {
	if data.LatexFile == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "latex_file is required",
		})
	}

	temp_dir, err := os.MkdirTemp("", "latex-*")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create temporary directory",
		})
	}
	defer os.RemoveAll(temp_dir)

	tex_file_path := filepath.Join(temp_dir, data.FileID+".tex")
	if err := os.WriteFile(tex_file_path, []byte(data.LatexFile), 0644); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to write LaTeX file",
		})
	}

	// Run pdflatex to generate PDF
	cmd := exec.Command("pdflatex", "-interaction=nonstopmode", "-output-directory="+temp_dir, tex_file_path)
	var stderr bytes.Buffer
	var stdout bytes.Buffer
	cmd.Stderr = &stderr
	cmd.Stdout = &stdout

	if err := cmd.Run(); err != nil {
		slog.Error(stdout.String())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":  "LaTeX compilation failed: " + stderr.String(),
			"stderr": stderr.String(),
			"stdout": stdout.String(),
		})
	}

	// Path to the generated PDF
	pdf_file_path := strings.TrimSuffix(tex_file_path, ".tex") + ".pdf"
	if _, err := os.Stat(pdf_file_path); os.IsNotExist(err) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "PDF file was not generated",
		})
	}
	// Read the PDF file
	pdf_data, err := os.ReadFile(pdf_file_path)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read generated PDF",
		})
	}

	if data.Store {

		// Create buffer for multipart form data
		var request_body bytes.Buffer
		multipart_writer := multipart.NewWriter(&request_body)

		file_part, err := multipart_writer.CreateFormFile("file", data.FileID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create form file: " + err.Error(),
			})
		}

		if _, err = io.Copy(file_part, bytes.NewReader(pdf_data)); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to copy PDF data: " + err.Error(),
			})
		}

		if err = multipart_writer.Close(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to close multipart writer: " + err.Error(),
			})
		}

		request, err := http.NewRequest("POST",
			fmt.Sprintf("%s/object/%s/%s",
				KONG_STORAGE_URL, BUCKET_NAME, data.FileID),
			&request_body,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create HTTP request: " + err.Error(),
			})
		}
		request.Header.Set("Content-Type", multipart_writer.FormDataContentType())
		request.Header.Set("x-upsert", "true")
		claims := jwt.MapClaims{
			"role": "service_role",
			"iss":  "supabase",
			"iat":  time.Now().Unix(),
			"exp":  time.Now().Add(time.Hour).Unix(), // Token valid for 1 hour
		}

		// Create the token with the claims
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

		bearer, err := token.SignedString([]byte(JWT_SECRET))
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to authorized file storage: " + err.Error(),
			})
		}
		request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", bearer))
		request.Header.Set("apikey", SERVICE_ROLE_KEY)

		client := &http.Client{}
		response, err := client.Do(request)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to store pdf",
			})
		}
		defer response.Body.Close()

		if response.StatusCode != http.StatusOK {
			body_bytes, err := io.ReadAll(response.Body)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error":   "failed to read response body",
					"details": err.Error(),
				})
			}
			body_string := string(body_bytes)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "failed to store pdf",
				"details": body_string,
			})
		}
		return c.SendStatus(fiber.StatusOK)
	} else {
		c.Set("Content-Type", "application/pdf")
		return c.Send(pdf_data)
	}
}
