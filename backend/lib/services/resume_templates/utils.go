package resumetemplates

import (
	"backend/lib/utils"
	"backend/sqlc_gen"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/google/uuid"
)

func ConvertResumeToLatex(template_name string, resume_data utils.InputResumeData, user sqlc_gen.GetUserByIdRow, profile sqlc_gen.GetProfileByUserIdRow) (string, error) {
	switch template_name {
	case "standard-executive":
		return ConvertResumeToLatex_STANDARD_EXECUTIVE(resume_data, user, profile)
	default:
		return "", fmt.Errorf("Unknown template")
	}
}

func GenerateResumePDFFile(latex_file string, file_id uuid.UUID, resume_name string, store bool) ([]byte, error) {
	request_body := map[string]any{
		"latex_file": latex_file,
		"file_id":    file_id.String(),
		"file_name":  resume_name,
		"store":      store,
	}

	request_body_json, err := json.Marshal(request_body)
	if err != nil {
		return nil, err
	}
	request, err := http.NewRequest("POST",
		fmt.Sprintf("%s/api/v1/latex/generate",
			utils.LATEX_SERVER),
		bytes.NewBuffer(request_body_json),
	)
	request.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	body_bytes, err := io.ReadAll(response.Body)
	if response.StatusCode != http.StatusOK {
		body_string := string(body_bytes)
		if err != nil {
			return nil, fmt.Errorf(body_string)
		}
	}
	return body_bytes, nil
}
