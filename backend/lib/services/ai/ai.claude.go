package ai

import (
	ca "backend/lib/services/cache"
	"backend/lib/utils"
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

var ANTHROPIC *anthropic.Client = anthropic.NewClient(
	option.WithAPIKey(utils.ANTHROPIC_SECRET_KEY),
)

const (
	EN_SYSTEM_PROMPTS = `
	You are a specialized Job Hunter Assistant designed to help users create optimized resumes based on their professional data and target job descriptions. Your primary goal is to analyze job descriptions and select the most relevant experiences, skills, projects, certificates, and education from the user's data to maximize their chances of employment.

Core Responsibilities:

1. Job Description Analysis
- Extract key requirements, skills, and qualifications from the job description
- Identify both explicit and implicit requirements
- Recognize industry-specific terminology and requirements
- Create a mental mapping of required qualifications to user data fields

2. Data Processing Rules:
- Process all incoming user data as specified in the ResumeData interface
- Maintain all required fields in the output as per the output ResumeData interface
- Never modify or fabricate data - only select and prioritize existing entries
- Preserve data integrity while removing unnecessary fields (like IDs and notes)

3. Selection Criteria:
- Relevance Matching:
  * Match user experiences and skills directly to job requirements
  * Consider both technical and soft skills mentioned in the job description
  * Look for keyword matches in descriptions and tags
  * Consider the chronological relevance of experiences

- Priority Assignment:
  * Assign higher priority (1-5) to experiences that directly match job requirements
  * Consider recency of experiences when assigning priority
  * Weigh the importance of different skills based on job description emphasis
  * Factor in the seniority level of the position

4. Output Requirements:
- Always return data in the specified ResumeData interface format
- Include only the most relevant items in each category
- Ensure all dates are properly formatted (YYYY-MM-DD)
- Set appropriate visibility flags based on relevance
- Maintain consistent priority scoring across all sections

5. Selection Guidelines:
- Experiences:
  * Select 3-5 most relevant positions
  * Prioritize recent experiences that match job requirements
  * Focus on experiences with transferable skills

- Skills:
  * Include all skills explicitly mentioned in the job description
  * Add relevant complementary skills
  * Prioritize technical skills for technical positions

- Education:
  * Include degrees relevant to the position
  * Prioritize highest level of education
  * Include specialized courses relevant to the role

- Certificates:
  * Include certificates that validate required skills
  * Prioritize industry-recognized certifications
  * Include only active/relevant certifications

- Projects:
  * Select projects that demonstrate required skills
  * Prioritize projects with measurable outcomes
  * Include projects that show leadership/initiative if relevant

6. Response Format:
Always return a JSON object strictly following this structure:
{
  "title": string, // A title for the given job offers
  "experiences": [{
    "company_name": string,
    "job_title": string,
    "location": string,
    "start_date": string,
    "optional_end_date": string,
    "is_current": boolean,
    "description": string,
    "priority": number,
    "is_visible": boolean,
    "tags": string[]
  }],
  "educations": [{
	"school": string,
	"degree": string,
	"location": string,
	"start_date": string,
	"optional_end_date": string,
	"is_current": boolean,
	"description": string,
	"priority": number,
	"is_visible": boolean,
    "tags": string[]
}],
  "skills": [{
	"skill_id": number,
	"skill_name": string,
	"optional_skill_type": string,
	"optional_skill_level": string,
	"description": string,
	"priority": number,
	"is_visible": boolean,
    "tags": string[]
}],
  "certificates": [{
	certificate_id: number,
	certificate_name: string,
	optional_issuer: string,
	optional_location: string,
	optional_granted_date: string,
	description: string,
	priority: number,
	is_visible: boolean,
    "tags": string[]
}],
  "projects": [{
	"project_id": number,
	"project_title": string,
	"optional_project_subtitle": string,
	"start_date": string,
	"optional_end_date": string,
	"is_current": boolean,
	"description": string,
	"priority": number,
	"is_visible": boolean,
	"tags": string[],
}]
}

7. Error Handling:
- Validate all required fields are present
- Ensure date formats are consistent
- Verify priority values are within valid range (1-5)
- Check for data consistency across sections

8. Optimization Strategies:
- Keywords: Match keywords from job description to user data
- Chronology: Prioritize recent relevant experience
- Skills Alignment: Ensure critical skills are highlighted
- Achievement Focus: Emphasize quantifiable achievements
- Industry Alignment: Consider industry-specific requirements

9. Additional Guidelines:
- Remove any personal or sensitive information
- Maintain professional language in all descriptions
- Ensure consistency in formatting
- Preserve original dates and company names
- Keep descriptions concise and achievement-focused

Remember: Your goal is to present the user's qualifications in the most compelling way possible while maintaining complete accuracy and honesty in the data presentation.
	`
	EN_INIT_PROMPT_TEMPLATE = `
Here is the user's resume data that we'll use for all future job descriptions: %s
	`
)

type OutputResumeData struct {
	Experiences []struct {
		CompanyName     string   `json:"company_name"`
		JobTitle        string   `json:"job_title"`
		Location        string   `json:"location"`
		StartDate       string   `json:"start_date"`
		OptionalEndDate string   `json:"optional_end_date"`
		IsCurrent       bool     `json:"is_current"`
		Description     string   `json:"description"`
		Priority        int32    `json:"priority"`
		IsVisible       bool     `json:"is_visible"`
		Tags            []string `json:"tags"`
	} `json:"experiences"`
	Educations []struct {
		School          string   `json:"school"`
		Degree          string   `json:"degree"`
		Location        string   `json:"location"`
		StartDate       string   `json:"start_date"`
		OptionalEndDate string   `json:"optional_end_date"`
		IsCurrent       bool     `json:"is_current"`
		Description     string   `json:"description"`
		Priority        int32    `json:"priority"`
		IsVisible       bool     `json:"is_visible"`
		Tags            []string `json:"tags"`
	} `json:"educations"`
	Skills []struct {
		SkillName          string   `json:"skill_name"`
		OptionalSkillType  string   `json:"optional_skill_type"`
		OptionalSkillLevel string   `json:"optional_skill_level"`
		Description        string   `json:"description"`
		Priority           int32    `json:"priority"`
		IsVisible          bool     `json:"is_visible"`
		Tags               []string `json:"tags"`
	} `json:"skills"`
	Certificates []struct {
		CertificateName     string   `json:"certificate_name"`
		OptionalIssuer      string   `json:"optional_issuer"`
		OptionalLocation    string   `json:"optional_location"`
		OptionalGrantedDate string   `json:"optional_granted_date"`
		Description         string   `json:"description"`
		Priority            int32    `json:"priority"`
		IsVisible           bool     `json:"is_visible"`
		Tags                []string `json:"tags"`
	} `json:"certificates"`
	Projects []struct {
		ProjectTitle            string   `json:"project_title"`
		OptionalProjectSubtitle string   `json:"optional_project_subtitle"`
		StartDate               string   `json:"start_date"`
		OptionalEndDate         string   `json:"optional_end_date"`
		IsCurrent               bool     `json:"is_current"`
		Description             string   `json:"description"`
		Priority                int32    `json:"priority"`
		IsVisible               bool     `json:"is_visible"`
		Tags                    []string `json:"tags"`
	} `json:"projects"`
	Letter string `json:"letter"`
	Title  string `json:"title"`
}

const (
	MAX_HISTORY_MESSAGES = 2
)

func GenerateResume(ctx context.Context, user_id uuid.UUID, resume_data ca.ResumeCachedData, job_description string, with_cover_letter bool, claude *anthropic.Client, cache *ca.Cache) (OutputResumeData, error) {
	resume_data_json, err := json.Marshal(resume_data)
	if err != nil {
		return OutputResumeData{}, fmt.Errorf("failed to marshal user data: %w", err)
	}
	prompt := fmt.Sprintf(`Based on the following job description, create an optimized resume. 
	Job Description:
	%s
		
	Please analyze the job description and select the most relevant experiences, skills, projects, certificates, and education from the user's data. Return the response in the specified JSON format, create also a title for this resume based on the provided job description that you will put in the "title" key of the created json.Your response must be a single JSON object no additional text, explanations, or markdown formatting.`,
		job_description)

	resume_hash := utils.Hash(resume_data_json)
	cached_resume_hash, err := ca.GetResumeHash(user_id, ctx, cache)
	if err != nil && err != redis.Nil {
		return OutputResumeData{}, err
	}

	ascii_resume_cache := hex.EncodeToString(resume_hash[:])

	var history []anthropic.MessageParam
	if ascii_resume_cache != cached_resume_hash {
		// Re-create a new conversation with the new resume
		history = []anthropic.MessageParam{
			anthropic.NewAssistantMessage(anthropic.NewTextBlock(EN_SYSTEM_PROMPTS)),
			anthropic.NewUserMessage(anthropic.NewTextBlock(fmt.Sprintf(EN_INIT_PROMPT_TEMPLATE, string(resume_data_json)))),
		}
		ca.SetResumeHash(user_id, ascii_resume_cache, ctx, cache)
	} else {
		// load the conversation
		history_json, err := ca.GetJsonConversation(user_id, ctx, cache)
		if err != nil && err != redis.Nil {
			ca.DelConversation(user_id, ctx, cache)
			return OutputResumeData{}, err
		} else if err == redis.Nil {
			history = []anthropic.MessageParam{
				anthropic.NewAssistantMessage(anthropic.NewTextBlock(EN_SYSTEM_PROMPTS)),
				anthropic.NewUserMessage(anthropic.NewTextBlock(fmt.Sprintf(EN_INIT_PROMPT_TEMPLATE, string(resume_data_json)))),
			}
		} else {
			history, err = deserializeHistory(history_json)
			if err != nil {
				ca.DelConversation(user_id, ctx, cache)
				return OutputResumeData{}, fmt.Errorf("failed to unmarshal cached conversation history: %w,\nhistory: %s", err, history_json)
			}
		}
	}

	if len(history)+1 > MAX_HISTORY_MESSAGES {
		// clean conversation
		history = append(history[:2], anthropic.NewUserMessage(anthropic.NewTextBlock(prompt)))
	} else {
		history = append(history, anthropic.NewUserMessage(anthropic.NewTextBlock(prompt)))
	}

	message, err := claude.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     anthropic.F(anthropic.ModelClaude3_5HaikuLatest),
		MaxTokens: anthropic.F(int64(4096)), // Increased token limit for larger responses
		Messages:  anthropic.F(history),
	})
	if err != nil {
		return OutputResumeData{}, fmt.Errorf("failed to generate resume: %w", err)
	}

	history_json, err := serializeHistory(history)
	if err == nil {
		err = ca.UpsertConversation(user_id, string(history_json), ctx, cache)
	}

	content := message.Content[0].Text
	json_content, err := extractJSONFromString(content)
	if err != nil {
		return OutputResumeData{}, fmt.Errorf("failed to extract JSON from response: %w", err)
	}

	var outputResume OutputResumeData
	if err := json.Unmarshal([]byte(json_content), &outputResume); err != nil {
		return OutputResumeData{}, fmt.Errorf("failed to parse AI response: %w", err)
	}
	if with_cover_letter {
		cover_letter_prompt := fmt.Sprintf(`The profile of the user is : %s
		Please write a cover letter for this job offer,
		Your response must be a single JSON object with a single key 'letter' with a string as value
		and with no additional text, explanations, or markdown formatting.`,
			"",
		)

		history = append(history, message.ToParam())
		history = append(history, anthropic.NewUserMessage(anthropic.NewTextBlock(cover_letter_prompt)))
		cover_letter_message, err := claude.Messages.New(ctx, anthropic.MessageNewParams{
			Model:     anthropic.F(anthropic.ModelClaude3_5HaikuLatest),
			MaxTokens: anthropic.F(int64(4096)),
			Messages:  anthropic.F(history),
		})
		if err != nil {
			return OutputResumeData{}, fmt.Errorf("failed to generate resume: %w", err)
		}

		content := cover_letter_message.Content[0].Text
		json_content, err = extractJSONFromString(content)
		if err != nil {
			return OutputResumeData{}, fmt.Errorf("failed to extract JSON from response: %w", err)
		}

		var letter struct {
			Letter string `json:"letter"`
		}
		if err := json.Unmarshal([]byte(json_content), &letter); err != nil {
			return OutputResumeData{}, fmt.Errorf("failed to parse AI response: %w", err)
		}
		outputResume.Letter = letter.Letter
	}

	return outputResume, nil
}

func extractJSONFromString(s string) (string, error) {
	// Find the first occurrence of '{'
	start := strings.Index(s, "{")
	if start == -1 {
		return "", fmt.Errorf("no JSON object found in string")
	}

	// Find the last occurrence of '}'
	end := strings.LastIndex(s, "}")
	if end == -1 {
		return "", fmt.Errorf("no closing brace found in JSON string")
	}

	// Extract the JSON substring
	jsonStr := s[start : end+1]

	// Validate that it's a valid JSON
	var js json.RawMessage
	if err := json.Unmarshal([]byte(jsonStr), &js); err != nil {
		return "", fmt.Errorf("invalid JSON structure: %w", err)
	}

	return jsonStr, nil
}

type SerializedMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// serializeHistory converts []anthropic.MessageParam to JSON string
func serializeHistory(history []anthropic.MessageParam) (string, error) {
	serialized := make([]SerializedMessage, len(history))

	for i, msg := range history {
		// Extract role and content from MessageParam
		var role string
		if msg.Role.Value.IsKnown() {
			role = msg.Role.String()
		}

		// Get content from the first text block
		var content string
		if msg.Content.Present && len(msg.Content.Value) > 0 {
			content = msg.Content.String()
		}

		serialized[i] = SerializedMessage{
			Role:    role,
			Content: content,
		}
	}

	// Marshal to JSON
	jsonBytes, err := json.Marshal(serialized)
	if err != nil {
		return "", fmt.Errorf("failed to marshal message history: %w", err)
	}

	return string(jsonBytes), nil
}

// deserializeHistory converts JSON string back to []anthropic.MessageParam
func deserializeHistory(jsonStr string) ([]anthropic.MessageParam, error) {
	var serialized []SerializedMessage

	// Unmarshal JSON
	if err := json.Unmarshal([]byte(jsonStr), &serialized); err != nil {
		return nil, fmt.Errorf("failed to unmarshal message history: %w", err)
	}

	// Convert back to MessageParam
	history := make([]anthropic.MessageParam, len(serialized))
	for i, msg := range serialized {
		var messageParam anthropic.MessageParam
		if msg.Role == "assistant" {
			messageParam = anthropic.NewAssistantMessage(anthropic.NewTextBlock(msg.Content))
		} else {
			messageParam = anthropic.NewUserMessage(anthropic.NewTextBlock(msg.Content))

		}
		history[i] = messageParam
	}

	return history, nil
}
