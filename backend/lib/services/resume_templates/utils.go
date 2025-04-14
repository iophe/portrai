package resumetemplates

import (
	"backend/lib/utils"
	"backend/sqlc_gen"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"sort"
	"strings"
	"text/template"
	"time"

	"github.com/google/uuid"
)

func ValidateTemplateName(template_name string) bool {
	switch template_name {
	case "standard-executive":
		return true
	case "light-executive":
		return true
	case "columns-executive":
		return true
	default:
		return false
	}
}

func ConvertResumeToLatex(template_name string, resume_data utils.InputResumeData, user sqlc_gen.GetUserByIdRow, profile sqlc_gen.GetProfileByUserIdRow) (string, error) {
	slog.Info("Chosen template", "name", template_name)
	switch template_name {
	case "standard-executive":
		return ConvertResumeToLatex_STANDARD_EXECUTIVE(resume_data, user, profile)
	case "light-executive":
		return ConvertResumeToLatex_LIGHT_EXECUTIVE(resume_data, user, profile)
	case "columns-executive":
		return ConvertResumeToLatex_COLUMNS_EXECUTIVE(resume_data, user, profile)
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

	slog.Warn("Status code genration", "code", response.StatusCode)
	if response.StatusCode != http.StatusOK {
		body_string := string(body_bytes)
		return nil, fmt.Errorf(body_string)
	}
	return body_bytes, nil
}

// Helper function to render the LaTeX document
func render_latex_document(template_data map[string]any, template_name string, resume_template string) (string, error) {
	tmpl, err := template.New(template_name).Delims("<<", ">>").Funcs(template.FuncMap{
		"escape_latex":   escape_latex_special_chars,
		"split":          split,
		"get_skill_icon": get_skill_type_icon,
	}).Parse(resume_template)

	if err != nil {
		return "", fmt.Errorf("error parsing template: %v", err)
	}

	var buf bytes.Buffer
	err = tmpl.Execute(&buf, template_data)
	if err != nil {
		return "", fmt.Errorf("error executing template: %v", err)
	}

	return buf.String(), nil
}

// Helper function to format education section
func format_education_section(educations []utils.Education) []map[string]any {
	if len(educations) == 0 {
		return []map[string]any{}
	}

	// Sort educations by priority
	sort.Slice(educations, func(i, j int) bool {
		return educations[i].Priority < educations[j].Priority
	})

	// Format visible educations
	formatted_educations := make([]map[string]any, 0, len(educations))
	for _, edu := range educations {
		if !edu.IsVisible {
			continue
		}

		is_latex := is_raw_latex(edu.Description)

		edu_entry := map[string]any{
			"school":       edu.School,
			"degree":       edu.Degree,
			"location":     edu.Location,
			"start_date":   format_date(edu.StartDate),
			"description":  edu.Description,
			"is_raw_latex": is_latex,
		}

		if edu.IsCurrent {
			edu_entry["end_date"] = "Present"
		} else if edu.OptionalEndDate != "" {
			edu_entry["end_date"] = format_date(edu.OptionalEndDate)
		} else {
			edu_entry["end_date"] = ""
		}

		formatted_educations = append(formatted_educations, edu_entry)
	}

	return formatted_educations
}

// Helper function to format experience section
func format_experience_section(experiences []utils.Experience) []map[string]any {
	if len(experiences) == 0 {
		return []map[string]any{}
	}

	// Sort experiences by priority
	sort.Slice(experiences, func(i, j int) bool {
		return experiences[i].Priority < experiences[j].Priority
	})

	// Format visible experiences
	formatted_experiences := make([]map[string]any, 0, len(experiences))
	for _, exp := range experiences {
		if !exp.IsVisible {
			continue
		}

		is_latex := is_raw_latex(exp.Description)
		exp_entry := map[string]any{
			"company":      exp.CompanyName,
			"title":        exp.JobTitle,
			"location":     exp.Location,
			"start_date":   format_date(exp.StartDate),
			"description":  exp.Description,
			"is_raw_latex": is_latex,
		}

		if exp.IsCurrent {
			exp_entry["end_date"] = "Present"
		} else if exp.OptionalEndDate != "" {
			exp_entry["end_date"] = format_date(exp.OptionalEndDate)
		} else {
			exp_entry["end_date"] = ""
		}

		formatted_experiences = append(formatted_experiences, exp_entry)
	}

	return formatted_experiences
}

// Helper function to format regular skills (non-language) section
func format_skills_section(skills []utils.Skill) []map[string]string {
	if len(skills) == 0 {
		return []map[string]string{}
	}

	formatted_skills := make([]map[string]string, 0)

	// Sort skills by priority
	sort.Slice(skills, func(i, j int) bool {
		return skills[i].Priority < skills[j].Priority
	})

	for _, skill := range skills {
		if !skill.IsVisible {
			continue
		}
		// Skip language skills - they'll be handled by format_languages_section
		if strings.EqualFold(skill.OptionalSkillType, "Language") ||
			strings.EqualFold(skill.OptionalSkillType, "Languages") {
			continue
		}

		skill_type := skill.OptionalSkillType
		if skill_type == "" {
			skill_type = "General"
		}

		// Create a map with name, type, and level
		skill_info := map[string]string{
			"name":        skill.SkillName,
			"type":        skill.OptionalSkillType,
			"description": skill.Description,
			"level":       skill.OptionalSkillLevel,
		}

		formatted_skills = append(formatted_skills, skill_info)
	}

	return formatted_skills
}

// Helper function to format language skills section
func format_languages_section(skills []utils.Skill) []map[string]string {
	if len(skills) == 0 {
		return []map[string]string{}
	}

	language_skills := make([]map[string]string, 0)

	// Sort skills by priority
	sort.Slice(skills, func(i, j int) bool {
		return skills[i].Priority < skills[j].Priority
	})

	for _, skill := range skills {
		if !skill.IsVisible {
			continue
		}

		// Only include language skills
		if strings.EqualFold(skill.OptionalSkillType, "Language") ||
			strings.EqualFold(skill.OptionalSkillType, "Languages") {
			language_info := map[string]string{
				"name":        skill.SkillName,
				"description": skill.Description,
				"level":       skill.OptionalSkillLevel,
			}

			language_skills = append(language_skills, language_info)
		}
	}

	return language_skills
}

// Helper function to format projects section
func format_projects_section(projects []utils.Project) []map[string]any {
	if len(projects) == 0 {
		return []map[string]any{}
	}

	// Sort projects by priority
	sort.Slice(projects, func(i, j int) bool {
		return projects[i].Priority < projects[j].Priority
	})

	// Format visible projects
	formatted_projects := make([]map[string]any, 0, len(projects))
	for _, proj := range projects {
		if !proj.IsVisible {
			continue
		}

		is_latex := is_raw_latex(proj.Description)
		proj_entry := map[string]any{
			"title":        proj.ProjectTitle,
			"subtitle":     proj.OptionalProjectSubtitle,
			"start_date":   format_date(proj.OptionalStartDate),
			"description":  proj.Description,
			"is_raw_latex": is_latex,
		}

		end_date_str := ""
		if proj.IsCurrent {
			end_date_str = "Present"
		} else if proj.OptionalEndDate != "" {
			end_date_str = format_date(proj.OptionalEndDate)
		}
		proj_entry["end_date"] = end_date_str

		// Format date display
		if proj_entry["start_date"] != "" && proj_entry["end_date"] != "" {
			proj_entry["date_display"] = format_date(proj.OptionalStartDate) + " – " + end_date_str
		} else if proj_entry["start_date"] != "" {
			proj_entry["date_display"] = proj_entry["start_date"]
		} else if proj_entry["end_date"] != "" {
			proj_entry["date_display"] = proj_entry["end_date"]
		} else {
			proj_entry["date_display"] = ""
		}

		formatted_projects = append(formatted_projects, proj_entry)
	}

	return formatted_projects
}

// Helper function to format certificates section
func format_certificates_section(certificates []utils.Certificate) []map[string]any {
	if len(certificates) == 0 {
		return []map[string]any{}
	}

	// Sort certificates by priority
	sort.Slice(certificates, func(i, j int) bool {
		return certificates[i].Priority < certificates[j].Priority
	})

	// Format visible certificates
	formatted_certificates := make([]map[string]any, 0, len(certificates))
	for _, cert := range certificates {
		if !cert.IsVisible {
			continue
		}

		is_latex := is_raw_latex(cert.Description)
		cert_entry := map[string]any{
			"name":         cert.CertificateName,
			"issuer":       cert.OptionalIssuer,
			"location":     cert.OptionalLocation,
			"granted_date": format_date(cert.OptionalGrantedDate),
			"description":  cert.Description,
			"is_raw_latex": is_latex,
		}

		formatted_certificates = append(formatted_certificates, cert_entry)
	}

	return formatted_certificates
}

// Helper function to format dates (assuming ISO format input)
func format_date(date_str string) string {
	if date_str == "" {
		return ""
	}

	// Try to parse the date
	var date_formats = []string{
		"2006-01-02",
		"2006-01",
		"2006",
		"Jan 2006",
		"January 2006",
	}

	var parsed_time time.Time
	var err error

	for _, format := range date_formats {
		parsed_time, err = time.Parse(format, date_str)
		if err == nil {
			break
		}
	}

	if err != nil {
		// If we can't parse it, return it as is
		return date_str
	}

	// Format as "Month Year" (e.g., "Sept 2000")
	return parsed_time.Format("Jan 2006")
}

// Helper function to determine if text should be treated as raw LaTeX
func is_raw_latex(text string) bool {
	// Check for common LaTeX environments or commands
	latex_indicators := []string{
		"\\begin{",
		"\\end{",
		"\\item",
		"\\textbf{",
		"\\textit{",
		"\\section",
		"\\subsection",
	}

	for _, indicator := range latex_indicators {
		if strings.Contains(text, indicator) {
			return true
		}
	}

	return false
}

// Helper function to escape LaTeX special characters
func escape_latex_special_chars(text string) string {
	var result strings.Builder
	result.Grow(len(text) * 2)

	for _, char := range text {
		switch char {
		case '\\':
			result.WriteString("\\textbackslash{}")
		case '&':
			result.WriteString("\\&")
		case '%':
			result.WriteString("\\%")
		case '$':
			result.WriteString("\\$")
		case '#':
			result.WriteString("\\#")
		case '_':
			result.WriteString("\\_")
		case '{':
			result.WriteString("\\{")
		case '}':
			result.WriteString("\\}")
		case '~':
			result.WriteString("\\textasciitilde{}")
		case '^':
			result.WriteString("\\textasciicircum{}")
		default:
			result.WriteRune(char)
		}
	}

	return result.String()
}

func split(s string, sep string) []string {
	return strings.Split(s, sep)
}

func get_skill_type_icon(skill_type string) string {
	switch skill_type {
	case "Technical":
		return "\\footnotesize\\faCode"
	case "Soft":
		return "\\footnotesize\\faHandshake"
	case "Language":
		return "\\footnotesize\\faLanguage"
	case "Tool":
		return "\\footnotesize\\faTools"
	case "Framework":
		return "\\footnotesize\\faCubes"
	case "Platform":
		return "\\footnotesize\\faServer"
	case "Other":
		return "\\footnotesize\\faStar"
	default:
		return "\\footnotesize\\faStar" // Default icon
	}
}
