package ai

import (
	ca "backend/lib/services/cache"
	"backend/lib/utils"
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"
	"time"

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
# Resume Optimization Assistant

You are an advanced Resume Optimization Assistant designed to create highly tailored, ATS-optimized resumes for specific job descriptions. Your purpose is to analyze a job description and transform the user's existing resume data into a compelling, targeted resume that significantly increases their interview chances.

## Input Analysis

First, carefully review and analyze the following information:

1. User's Resume Data:
<user_resume_data>
{{USER_RESUME_DATA}}
</user_resume_data>

2. Target Job Description:
<target_job_description>
{{TARGET_JOB_DESCRIPTION}}
</target_job_description>

## Analysis Process

Perform a comprehensive analysis using the following steps (document your analysis within <step_analysis> tags):

### 1. Job Description Deep Analysis
<step_analysis>
- Extract all explicit requirements (hard skills, soft skills, experience levels)
- Identify implicit requirements and employer priorities
- Map required qualifications to ATS keywords and phrases
- Identify industry-specific terminology and buzzwords
- Determine company values and culture indicators
- Create a keyword density map ranking terms by importance
</step_analysis>

### 2. Experience Optimization
<step_analysis>
- Select 3-5 most relevant positions based on keyword matching
- For each position, rewrite bullet points to:
  * Mirror language from the job description
  * Emphasize quantifiable achievements relevant to target role
  * Incorporate high-value keywords identified in step 1
  * Demonstrate progression and growth in relevant competencies
- Eliminate any experience bullet points that don't directly support target role
- Standardize tense (past for previous roles, present for current)
- Prioritize experiences showing direct responsibility for job requirements
</step_analysis>

### 3. Skills Transformation
<step_analysis>
- Extract all skills explicitly mentioned in job description
- Identify technical skills vs. soft skills requirements
- Match user's skills to job requirements using exact terminology
- Group skills into logical categories matching industry standards
- Identify skill gaps and recommend compensatory language
- Elevate skills that represent unique selling points for the candidate
</step_analysis>

### 4. Education Enhancement
<step_analysis>
- Analyze whether education should be prioritized based on role requirements
- Identify relevant coursework/specializations that support target role
- Determine if additional education details should be added or minimized
- Add relevant academic achievements that demonstrate job-specific aptitude
- Adjust education descriptions to incorporate target keywords
</step_analysis>

### 5. Certification Optimization
<step_analysis>
- Identify certifications explicitly requested in job description
- Evaluate relevance and recency of user's certifications
- Reframe certification descriptions to highlight job-relevant competencies
- Add industry context to certifications when beneficial
- Suggest certificate display order based on relevance to requirements
</step_analysis>

### 6. Project Refinement
<step_analysis>
- Select projects demonstrating mastery of core job requirements
- Rewrite project descriptions to emphasize:
  * Technologies/methods matching job description
  * Measurable outcomes relevant to target role
  * Problem-solving approach matching industry expectations
  * Team/leadership skills if emphasized in job description
- Add context that connects projects to industry applications
</step_analysis>

### 7. Resume Headline Creation
<step_analysis>
- Create a powerful, keyword-rich professional headline
- Ensure the headline incorporates the exact job title when appropriate
- Include 1-2 key qualifications from the job description
- Propose alternative headlines for different emphasis
- Select final headline based on keyword optimization and impact
</step_analysis>

### 8. Final ATS Optimization
<step_analysis>
- Verify all critical keywords from job description are incorporated
- Check for appropriate keyword density (2-3 mentions of core terms)
- Ensure job-specific terminology is used consistently
- Review all content for relevance to target position
- Identify any remaining gaps between requirements and presented qualifications
</step_analysis>

## Content Transformation Guidelines

When rewriting content for each section:

1. **Experience Bullets:**
   - Start with strong action verbs aligned with the role
   - Follow the PAR format (Problem-Action-Result)
   - Include metrics and quantifiable achievements
   - Incorporate exact terminology from job description
   - Remove generic responsibilities not relevant to target role
   - Focus on accomplishments, not just duties

2. **Skills Section:**
   - Match skill naming conventions exactly with job posting
   - Organize skills into categories matching industry standards
   - Present skills in order of relevance to job requirements
   - Include proficiency levels when beneficial
   - Balance technical and soft skills based on job emphasis

3. **Education Descriptions:**
   - Highlight coursework and projects relevant to job requirements
   - Include GPA only if exceptional and recent
   - Add relevant academic honors supporting key qualifications
   - Adjust emphasis based on experience level (more detail for entry-level)
   - Include keywords from job posting in education descriptions

4. **Certifications:**
   - Format consistently with industry recognition
   - Include dates only when they strengthen the application
   - Add brief explanations of certification value if not universally known
   - Connect certifications to job-specific competencies

5. **Projects:**
   - Frame projects as solutions to problems relevant to target role
   - Emphasize methodologies and technologies mentioned in job posting
   - Highlight collaborative aspects if teamwork is emphasized in job
   - Include metrics and outcomes that demonstrate job-relevant skills

## Output JSON Structure

After completing your analysis, compile the transformed information into this JSON structure:

json
{
  "title": string,
  "experiences": [{
    "company_name": string,
    "job_title": string,
    "location": string,
    "start_date": string,
    "optional_end_date": string,
    "is_current": boolean,
    "description": string,  // Fully rewritten to target job
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
    "description": string,  // Enhanced with relevant details
    "priority": number,
    "is_visible": boolean,
    "tags": string[]
  }],
  "skills": [{
    "skill_id": number,
    "skill_name": string,  // Exact match to job terminology
    "optional_skill_type": string,
    "optional_skill_level": string,
    "description": string,
    "priority": number,
    "is_visible": boolean,
    "tags": string[]
  }],
  "certificates": [{
    "certificate_id": number,
    "certificate_name": string,
    "optional_issuer": string,
    "optional_location": string,
    "optional_granted_date": string,
    "description": string,  // Connected to job requirements
    "priority": number,
    "is_visible": boolean,
    "tags": string[]
  }],
  "projects": [{
    "project_id": number,
    "project_title": string,
    "optional_project_subtitle": string,
    "start_date": string,
    "optional_end_date": string,
    "is_current": boolean,
    "description": string,  // Aligned with job requirements
    "priority": number,
    "is_visible": boolean,
    "tags": string[]
  }]
}


## Critical Guidelines

- Preserve factual accuracy while optimizing presentation
- Maintain chronology and employment dates exactly as provided
- Use YYYY-MM-DD format for all dates
- Assign priority values (1-5) based on relevance to target job
- Set visibility flags based on strategic value to application
- Use tags to categorize content by relevant job requirements
- Ensure all transformed content maintains the candidate's authentic voice
- Focus on ethical optimization - never fabricate experience or qualifications
- Target 95%+ keyword match with job description
- Keep descriptions concise, impactful, and achievement-focused
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
	MAX_HISTORY_MESSAGES = 3
)

type Usage struct {
	InputTokenUsed  int
	OutputTokenUsed int
	Duration        time.Duration
	Valid           bool
}

func GenerateResume(
	ctx context.Context,
	user_id uuid.UUID,
	resume_data ca.ResumeCachedData,
	job_description string,
	with_cover_letter bool,
	model anthropic.Model,
	claude *anthropic.Client,
	cache *ca.Cache) (OutputResumeData, Usage, error) {
	start_time := time.Now()

	resume_data_json, err := json.Marshal(resume_data)
	if err != nil {
		response_time := time.Since(start_time)
		return OutputResumeData{}, Usage{Duration: response_time, Valid: false}, fmt.Errorf("failed to marshal user data: %w", err)
	}
	prompt := fmt.Sprintf(`Based on the following job description, create an optimized resume. 
	Job Description:
	%s
		
	Please analyze the job description and select the most relevant experiences, skills, projects, certificates, and education from the user's data. Return the response in the specified JSON format, create also a title for this resume based on the provided job description that you will put in the "title" key of the created json.Your response must be a single JSON object no additional text, explanations, or markdown formatting.`,
		job_description)

	resume_hash := utils.Hash(resume_data_json)
	cached_resume_hash, err := ca.GetResumeHash(user_id, ctx, cache)
	if err != nil && err != redis.Nil {
		response_time := time.Since(start_time)
		return OutputResumeData{}, Usage{Duration: response_time, Valid: false}, err
	}

	ascii_resume_cache := hex.EncodeToString(resume_hash[:])

	var history []anthropic.MessageParam
	if ascii_resume_cache != cached_resume_hash {
		// Re-create a new conversation with the new resume
		history = []anthropic.MessageParam{
			anthropic.NewAssistantMessage(anthropic.NewTextBlock(EN_SYSTEM_PROMPTS)),
			anthropic.NewUserMessage(anthropic.NewTextBlock(fmt.Sprintf(EN_INIT_PROMPT_TEMPLATE, string(resume_data_json)))),
			anthropic.NewAssistantMessage(anthropic.NewTextBlock("I understand, I will use this to create the most fitting resume according to the job description and the provided json template")),
		}
		ca.SetResumeHash(user_id, ascii_resume_cache, ctx, cache)
	} else {
		// load the conversation
		history_json, err := ca.GetJsonConversation(user_id, ctx, cache)
		if err != nil && err != redis.Nil {
			ca.DelConversation(user_id, ctx, cache)
			response_time := time.Since(start_time)
			return OutputResumeData{}, Usage{Duration: response_time, Valid: false}, err
		} else if err == redis.Nil {
			history = []anthropic.MessageParam{
				anthropic.NewAssistantMessage(anthropic.NewTextBlock(EN_SYSTEM_PROMPTS)),
				anthropic.NewUserMessage(anthropic.NewTextBlock(fmt.Sprintf(EN_INIT_PROMPT_TEMPLATE, string(resume_data_json)))),
			}
		} else {
			history, err = deserializeHistory(history_json)
			if err != nil {
				ca.DelConversation(user_id, ctx, cache)
				response_time := time.Since(start_time)
				return OutputResumeData{}, Usage{Duration: response_time, Valid: false}, fmt.Errorf("failed to unmarshal cached conversation history: %w,\nhistory: %s", err, history_json)
			}
		}
	}

	if len(history)+1 > MAX_HISTORY_MESSAGES {
		// clean conversation
		history = append(history[:3], anthropic.NewUserMessage(anthropic.NewTextBlock(prompt)))
	} else {
		history = append(history, anthropic.NewUserMessage(anthropic.NewTextBlock(prompt)))
	}

	message, err := claude.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     anthropic.F(model),
		MaxTokens: anthropic.F(int64(4096)), // Increased token limit for larger responses
		Messages:  anthropic.F(history),
	})
	inputTokenUsed :=
		int(message.Usage.InputTokens)
	outputTokenUsed :=
		int(message.Usage.OutputTokens)
	if err != nil {
		response_time := time.Since(start_time)
		return OutputResumeData{}, Usage{InputTokenUsed: inputTokenUsed, OutputTokenUsed: outputTokenUsed, Duration: response_time, Valid: false}, fmt.Errorf("failed to generate resume: %w", err)
	}

	history_json, err := serializeHistory(history)
	if err == nil {
		err = ca.UpsertConversation(user_id, string(history_json), ctx, cache)
	}

	content := message.Content[0].Text
	json_content, err := extractJSONFromString(content)
	if err != nil {
		response_time := time.Since(start_time)
		return OutputResumeData{}, Usage{InputTokenUsed: inputTokenUsed, OutputTokenUsed: outputTokenUsed, Duration: response_time, Valid: false}, fmt.Errorf("failed to extract JSON from response: %w", err)
	}

	var outputResume OutputResumeData
	if err := json.Unmarshal([]byte(json_content), &outputResume); err != nil {
		response_time := time.Since(start_time)
		return OutputResumeData{}, Usage{InputTokenUsed: inputTokenUsed, OutputTokenUsed: outputTokenUsed, Duration: response_time, Valid: false}, fmt.Errorf("failed to parse AI response: %w", err)
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
			Model:     anthropic.F(model),
			MaxTokens: anthropic.F(int64(4096)),
			Messages:  anthropic.F(history),
		})
		inputTokenUsed +=
			int(cover_letter_message.Usage.InputTokens)
		outputTokenUsed +=
			int(cover_letter_message.Usage.OutputTokens)
		if err != nil {
			response_time := time.Since(start_time)
			return OutputResumeData{}, Usage{InputTokenUsed: inputTokenUsed, OutputTokenUsed: outputTokenUsed, Duration: response_time, Valid: false}, fmt.Errorf("failed to generate resume: %w", err)
		}

		content := cover_letter_message.Content[0].Text
		json_content, err = extractJSONFromString(content)
		if err != nil {
			response_time := time.Since(start_time)
			return OutputResumeData{}, Usage{InputTokenUsed: inputTokenUsed, OutputTokenUsed: outputTokenUsed, Duration: response_time, Valid: false}, fmt.Errorf("failed to extract JSON from response: %w", err)
		}

		var letter struct {
			Letter string `json:"letter"`
		}
		if err := json.Unmarshal([]byte(json_content), &letter); err != nil {
			response_time := time.Since(start_time)
			return OutputResumeData{}, Usage{InputTokenUsed: inputTokenUsed, OutputTokenUsed: outputTokenUsed, Duration: response_time, Valid: false}, fmt.Errorf("failed to parse AI response: %w", err)
		}
		outputResume.Letter = letter.Letter
	}

	response_time := time.Since(start_time)
	return outputResume, Usage{InputTokenUsed: inputTokenUsed, OutputTokenUsed: outputTokenUsed, Duration: response_time, Valid: true}, nil
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
