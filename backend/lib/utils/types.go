package utils

import "encoding/json"

type Experience struct {
	CompanyName     string   `json:"company_name" jsonschema_description:"Name of the employer or organization, do not modify"`
	JobTitle        string   `json:"job_title" jsonschema_description:"The role title, optimized to match target job terminology"`
	Location        string   `json:"location" jsonschema_description:"City and state/country of employment, do not modify"`
	StartDate       string   `json:"start_date" jsonschema_description:"Employment start date in YYYY-MM-DD format, do not modify"`
	OptionalEndDate string   `json:"optional_end_date" jsonschema_description:"Employment end date in YYYY-MM-DD format (leave empty for current positions), do not modify"`
	IsCurrent       bool     `json:"is_current" jsonschema_description:"Set to true if this is your current position, do not modify"`
	Description     string   `json:"description" jsonschema_description:"Description of responsibilities and achievements, optimized with keywords from the job description, important write the description in latex but try avoiding long bullet points"`
	Priority        int32    `json:"priority" jsonschema_description:"do not modify"`
	IsVisible       bool     `json:"is_visible" jsonschema_description:"Whether to include this experience in the final resume (set false for irrelevant positions)"`
	Tags            []string `json:"tags" jsonschema_description:"Keywords from job description that this experience satisfies"`
}

type Education struct {
	School          string   `json:"school" jsonschema_description:"Name of educational institution, do not modify"`
	Degree          string   `json:"degree" jsonschema_description:"Degree name and field of study, do not modify"`
	Location        string   `json:"location" jsonschema_description:"City and state/country of institution, do not modify"`
	StartDate       string   `json:"start_date" jsonschema_description:"Education start date in YYYY-MM-DD format, do not modify"`
	OptionalEndDate string   `json:"optional_end_date" jsonschema_description:"Education end date in YYYY-MM-DD format (leave empty if currently enrolled), do not modify"`
	IsCurrent       bool     `json:"is_current" jsonschema_description:"Set to true if currently enrolled, do not modify"`
	Description     string   `json:"description" jsonschema_description:"Relevant coursework, academic achievements, and projects that align with job requirements, important write the description in latex but try avoiding long bullet points"`
	Priority        int32    `json:"priority" jsonschema_description:"do not modify"`
	IsVisible       bool     `json:"is_visible" jsonschema_description:"Whether to include this education in the final resume"`
	Tags            []string `json:"tags" jsonschema_description:"Keywords from job description that this education satisfies"`
}

type Skill struct {
	SkillName          string   `json:"skill_name" jsonschema_description:"Name of skill, using terminology from job description"`
	OptionalSkillType  string   `json:"optional_skill_type" jsonschema_description:"Category of skill"`
	OptionalSkillLevel string   `json:"optional_skill_level" jsonschema_description:"Proficiency level"`
	Description        string   `json:"description" jsonschema_description:"Brief description or context for the skill as it relates to the target position"`
	Priority           int32    `json:"priority" jsonschema_description:"do not modify"`
	IsVisible          bool     `json:"is_visible" jsonschema_description:"Whether to include this skill in the final resume"`
	Tags               []string `json:"tags" jsonschema_description:"Categories or keywords this skill relates to in the job description"`
}

type Certificate struct {
	CertificateName     string   `json:"certificate_name" jsonschema_description:"Name of certification using standard industry terminology, do not modify"`
	OptionalIssuer      string   `json:"optional_issuer" jsonschema_description:"Organization that issued the certification, do not modify"`
	OptionalLocation    string   `json:"optional_location" jsonschema_description:"Location where certification was obtained (if relevant), do not modify"`
	OptionalGrantedDate string   `json:"optional_granted_date" jsonschema_description:"Date certification was obtained in YYYY-MM-DD format, do not modify"`
	Description         string   `json:"description" jsonschema_description:"Brief description of certification relevance to target position, important write the description in latex but try avoiding long bullet points"`
	Priority            int32    `json:"priority" jsonschema_description:"do not modify"`
	IsVisible           bool     `json:"is_visible" jsonschema_description:"Whether to include this certification in the final resume"`
	Tags                []string `json:"tags" jsonschema_description:"Keywords from job description that this certification satisfies"`
}

type Project struct {
	ProjectTitle            string   `json:"project_title" jsonschema_description:"Name of project, optimized with keywords from job description"`
	OptionalProjectSubtitle string   `json:"optional_project_subtitle" jsonschema_description:"Brief descriptive subtitle or technology stack used"`
	OptionalStartDate       string   `json:"optional_start_date" jsonschema_description:"Project start date in YYYY-MM-DD format, do not modify"`
	OptionalEndDate         string   `json:"optional_end_date" jsonschema_description:"Project end date in YYYY-MM-DD format (leave empty for ongoing projects), do not modify"`
	IsCurrent               bool     `json:"is_current" jsonschema_description:"Set to true if this is a current ongoing project, do not modify"`
	Description             string   `json:"description" jsonschema_description:"Detailed description of project focusing on techniques, technologies, and outcomes that match job requirements, important write the description in latex but try avoiding long bullet points"`
	Priority                int32    `json:"priority" jsonschema_description:"do not modify"`
	IsVisible               bool     `json:"is_visible" jsonschema_description:"Whether to include this project in the final resume"`
	Tags                    []string `json:"tags" jsonschema_description:"Keywords from job description that this project demonstrates"`
}

type InputResumeData struct {
	Experiences  []Experience  `json:"experiences" jsonschema_description:"A list of professional experiences ordered by relevance to the target position"`
	Educations   []Education   `json:"educations" jsonschema_description:"A list of educational qualifications ordered by relevance to the target position"`
	Skills       []Skill       `json:"skills" jsonschema_description:"A list of professional skills matching terminology from the target job description"`
	Certificates []Certificate `json:"certificates" jsonschema_description:"A list of professional certifications relevant to the target position"`
	Projects     []Project     `json:"projects" jsonschema_description:"A list of relevant projects demonstrating qualifications for the target position"`
}

type StoredExperience struct {
	Experience
	Notes []json.RawMessage `json:"notes"`
	ID    int64             `json:"experience_id"`
}

type StoredEducation struct {
	Education
	Notes []json.RawMessage `json:"notes"`
	ID    int64             `json:"education_id"`
}

type StoredSkill struct {
	Skill
	Notes []json.RawMessage `json:"notes"`
	ID    int64             `json:"skill_id"`
}

type StoredCertificate struct {
	Certificate
	Notes []json.RawMessage `json:"notes"`
	ID    int64             `json:"certificate_id"`
}

type StoredProject struct {
	Project
	Notes []json.RawMessage `json:"notes"`
	ID    int64             `json:"project_id"`
}

type StoredResumeData struct {
	Experiences  []StoredExperience  `json:"experiences"`
	Educations   []StoredEducation   `json:"educations"`
	Skills       []StoredSkill       `json:"skills"`
	Certificates []StoredCertificate `json:"certificates"`
	Projects     []StoredProject     `json:"projects"`
}

type ToolResumeDataParams struct {
	InputResumeData
	Title string `json:"title" jsonschema_description:"A title for the resume based on the job description"`
}

type ToolCoverLetterParams struct {
	CoverLetter string `json:"cover_letter" jsonschema_description:"A cover letter based on the user provided data and resume for the job offer"`
}

// // HELPERS
// Convert StoredExperience to Experience
func (s StoredExperience) ToExperience() Experience {
	return s.Experience
}

// Convert StoredEducation to Education
func (s StoredEducation) ToEducation() Education {
	return s.Education
}

// Convert StoredSkill to Skill
func (s StoredSkill) ToSkill() Skill {
	return s.Skill
}

// Convert StoredCertificate to Certificate
func (s StoredCertificate) ToCertificate() Certificate {
	return s.Certificate
}

// Convert StoredProject to Project
func (s StoredProject) ToProject() Project {
	return s.Project
}

// Convert StoredResumeData to ToolResumeDataParams
func (stored StoredResumeData) Convert() InputResumeData {
	return InputResumeData{
		Experiences:  ConvertExperiences(stored.Experiences),
		Educations:   ConvertEducations(stored.Educations),
		Skills:       ConvertSkills(stored.Skills),
		Certificates: ConvertCertificates(stored.Certificates),
		Projects:     ConvertProjects(stored.Projects),
	}
}

// Helper functions to convert each list type
func ConvertExperiences(stored []StoredExperience) []Experience {
	result := make([]Experience, len(stored))
	for i, item := range stored {
		result[i] = item.ToExperience()
	}
	return result
}

func ConvertEducations(stored []StoredEducation) []Education {
	result := make([]Education, len(stored))
	for i, item := range stored {
		result[i] = item.ToEducation()
	}
	return result
}

func ConvertSkills(stored []StoredSkill) []Skill {
	result := make([]Skill, len(stored))
	for i, item := range stored {
		result[i] = item.ToSkill()
	}
	return result
}

func ConvertCertificates(stored []StoredCertificate) []Certificate {
	result := make([]Certificate, len(stored))
	for i, item := range stored {
		result[i] = item.ToCertificate()
	}
	return result
}

func ConvertProjects(stored []StoredProject) []Project {
	result := make([]Project, len(stored))
	for i, item := range stored {
		result[i] = item.ToProject()
	}
	return result
}
