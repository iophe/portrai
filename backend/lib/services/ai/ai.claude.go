package ai

import (
	ca "backend/lib/services/cache"
	"backend/lib/utils"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/google/uuid"
	"github.com/invopop/jsonschema"
)

var ANTHROPIC anthropic.Client = anthropic.NewClient(
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

### Tool Usage Instructions

1. Organize the analyzed information into the required format for the tool
2. Call the 'write_json_resume' tool with the following parameters:

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
- The resume must fit in one page unless requested otherwise
	`
	EN_INIT_PROMPT_TEMPLATE = `
The user's resume data we'll use: 
<USER_RESUME_DATA>
%s
<USER_RESUME_DATA/>
`
	EN_JOB_DESCRIPTION_TEMPLATE = `
The following job description, will be used when the user ask for creating the resume and the cover letter.
<JOB_DESCRIPTION>
	%s
<JOB_DESCRIPTION/>
`

	EN_CREATE_RESUME_WITH_INSTRUCTION_TEMPLATE = `
Based on the following instruction from the user :
<INSTRUCTION>
	%s
<INSTRUCTION/>
Please analyze the job description and select the most relevant experiences, skills,
projects, certificates, and education from the user's data, to create a optimized and tailored made resume.
First Use the 'write_json_resume' tool to create the resume.
Then Use the 'write_conversation_title' tool to create the title of the resume.
`

	EN_CREATE_RESUME_TEMPLATE = `
Please analyze the job description and select the most relevant experiences, skills,
projects, certificates, and education from the user's data, to create a optimized and tailored made resume.
First Use the 'write_json_resume' tool to create the resume.
Then Use the 'write_conversation_title' tool to create the title of the resume.
`

	EN_COMMENT_RESUME_PROMPT_TEMPLATE = `
Based on the following comment from the user :
<COMMENT>
	%s
<COMMENT/>
Please update the resume to create a optimized and tailored made resume that respond to the user's comment.
Use the 'write_json_resume' tool to create the resume.
`

	EN_COVER_LETTER_WITH_INSTRUCTION_PROMPT_TEMPLATE = `
Based on the following instruction from the user :
<INSTRUCTION>
	%s
<INSTRUCTION/>
Please analyze the job description and the resume to create a optimized and tailored made cover letter.
Use the 'write_cover_letter' tool to create the resume.
`

	EN_COVER_LETTER_PROMPT_TEMPLATE = `
Please analyze the job description and the resume to create a optimized and tailored made cover letter.
Use the 'write_cover_letter' tool to create the resume.
`

	EN_COMMENT_LETTER_PROMPT_TEMPLATE = `
Based on the following comment from the user :
<COMMENT>
	%s
<COMMENT/>
Please update the cover letter to create a optimized and tailored made cover letter that respond to the user's comment.
Use the 'write_cover_letter' tool to create the resume.
`
)

func GenerateSchema[T any]() anthropic.ToolInputSchemaParam {
	reflector := jsonschema.Reflector{
		AllowAdditionalProperties: false,
		DoNotReference:            true,
	}
	var v T

	schema := reflector.Reflect(v)

	return anthropic.ToolInputSchemaParam{
		Properties: schema.Properties,
	}
}

var WriteJsonResumeInputSchema = GenerateSchema[utils.ToolResumeDataParams]()
var WriteCoverLetterInputSchema = GenerateSchema[utils.ToolCoverLetterParams]()

const (
	MAX_HISTORY_MESSAGES = 3
)

type Usage struct {
	Usage    anthropic.Usage
	Duration time.Duration
	Valid    bool
}

var EN_SYSTEM_MESSAGE = anthropic.NewAssistantMessage(anthropic.ContentBlockParamUnion{
	OfRequestTextBlock: &anthropic.TextBlockParam{
		Text:         EN_SYSTEM_PROMPTS,
		CacheControl: anthropic.CacheControlEphemeralParam{Type: "ephemeral"},
	}})

var TOOL_WRITE_JSON_RESUME_NAME = "write_json_resume"
var TOOL_WRITE_JSON_RESUME_DESCRIPTION = `
Generates an optimized resume based on the provided structured data.
This tool transforms the resume information into a professionally formatted document
tailored to match the target job description.
The tool handles the formatting and organization of the resume sections
(experiences, education, skills, certificates, and projects),
optimizing keyword placement and content presentation for ATS compatibility.
All content should be tailored to highlight qualifications that match the target job requirements.
`

var PROMPT_RESUME_RESULT = "The resume has been successfully generated"
var TOOL_RESULT_RESUME = []anthropic.ToolResultBlockParamContentUnion{
	{
		OfRequestTextBlock: &anthropic.TextBlockParam{
			Text: PROMPT_RESUME_RESULT,
		},
	},
}

var PROMPT_LETER_RESULT = "The cover letter has been successfully generated"
var TOOL_RESULT_LETTER = []anthropic.ToolResultBlockParamContentUnion{
	{
		OfRequestTextBlock: &anthropic.TextBlockParam{
			Text: PROMPT_LETER_RESULT,
		},
	},
}

var TOOL_WRITE_TITLE_NAME = "write_conversation_title"
var TOOL_WRITE_TITLE_DESCRIPTION = `
Store the title of this conversation, for the user to easily remember and use the generated resume based on the job description
`

var TOOL_WRITE_COVER_LETTER_NAME = "write_cover_letter"
var TOOL_WRITE_COVER_LETTER_DESCRIPTION = `
Generates a optimized cover letter based on the provided cover letter.
`

var EN_TOOLS = []anthropic.ToolUnionParam{
	{
		OfTool: &anthropic.ToolParam{
			Name:        TOOL_WRITE_JSON_RESUME_NAME,
			Description: anthropic.String(TOOL_WRITE_JSON_RESUME_DESCRIPTION),
			InputSchema: anthropic.ToolInputSchemaParam{
				Properties:  WriteJsonResumeInputSchema.Properties,
				Type:        WriteJsonResumeInputSchema.Type,
				ExtraFields: WriteJsonResumeInputSchema.ExtraFields,
			},
			CacheControl: anthropic.CacheControlEphemeralParam{Type: "ephemeral"},
		},
	},
	{
		OfTool: &anthropic.ToolParam{
			Name:        TOOL_WRITE_COVER_LETTER_NAME,
			Description: anthropic.String(TOOL_WRITE_COVER_LETTER_DESCRIPTION),
			InputSchema: anthropic.ToolInputSchemaParam{
				Properties:  WriteCoverLetterInputSchema.Properties,
				Type:        WriteCoverLetterInputSchema.Type,
				ExtraFields: WriteCoverLetterInputSchema.ExtraFields,
			},
			//CacheControl: anthropic.CacheControlEphemeralParam{Type: "ephemeral"},
		},
	},
}

func StartConversation(
	ctx context.Context,
	user_id uuid.UUID,
	conversation_id uuid.UUID,
	job_description string,
	resume_data_json string,
	model anthropic.Model,
	claude *anthropic.Client,
	cache *ca.Cache,
) error {
	conversation := []anthropic.MessageParam{
		EN_SYSTEM_MESSAGE,

		// Resume data
		anthropic.NewUserMessage(anthropic.ContentBlockParamUnion{
			OfRequestTextBlock: &anthropic.TextBlockParam{
				Text:         fmt.Sprintf(EN_INIT_PROMPT_TEMPLATE, resume_data_json),
				CacheControl: anthropic.CacheControlEphemeralParam{Type: "ephemeral"},
			}}),
		anthropic.NewAssistantMessage(anthropic.NewTextBlock("I understand, I will use this to create the most fitting resume according to the job description and the provided json template")),

		// Job description
		anthropic.NewUserMessage(anthropic.ContentBlockParamUnion{
			OfRequestTextBlock: &anthropic.TextBlockParam{
				Text:         fmt.Sprintf(EN_JOB_DESCRIPTION_TEMPLATE, job_description),
				CacheControl: anthropic.CacheControlEphemeralParam{Type: "ephemeral"},
			}}),
		anthropic.NewAssistantMessage(anthropic.NewTextBlock("I understand, I will use this job description to create the most fitting resume")),
	}

	// Store conversation
	err := ca.StoreAI_Conversation(user_id, conversation_id, conversation, ctx, cache)
	if err != nil {
		return err
	}

	return nil
}

func CreateResume(
	ctx context.Context,
	user_id uuid.UUID,
	conversation_id uuid.UUID,
	instruction string,
	model anthropic.Model,
	claude *anthropic.Client,
	cache *ca.Cache) (Usage, error) {
	start_time := time.Now()

	conversation, err := ca.GetConversation(user_id, conversation_id, ctx, cache)
	if err != nil {
		return Usage{
			Usage:    anthropic.Usage{},
			Duration: time.Since(start_time),
			Valid:    false,
		}, err
	}

	if instruction != "" {
		conversation = append(conversation, anthropic.NewUserMessage(anthropic.ContentBlockParamUnion{
			OfRequestTextBlock: &anthropic.TextBlockParam{
				Text: fmt.Sprintf(EN_CREATE_RESUME_WITH_INSTRUCTION_TEMPLATE, instruction),
			}}))
	} else {
		conversation = append(conversation, anthropic.NewUserMessage(anthropic.ContentBlockParamUnion{
			OfRequestTextBlock: &anthropic.TextBlockParam{
				Text: EN_CREATE_RESUME_TEMPLATE,
			}}))
	}

	message, err := claude.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     model,
		MaxTokens: int64(4096),
		Messages:  conversation,
		Tools:     EN_TOOLS,
	})
	if err != nil {
		if message != nil {
			return Usage{
				Usage:    message.Usage,
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		} else {
			return Usage{
				Usage:    anthropic.Usage{},
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		}
	}

	conversation = append(conversation, message.ToParam())
	if message.StopReason == anthropic.MessageStopReasonToolUse {
		err = analyseToolUse(message, ToolUseCallback{
			OnResume: func(input utils.ToolResumeDataParams, block anthropic.ContentBlockUnion) error {
				err = tool_CreateResume(user_id, conversation_id, input, ctx, cache)
				if err != nil {
					return err
				}

				conversation = append(conversation, anthropic.NewUserMessage(anthropic.ContentBlockParamUnion{
					OfRequestToolResultBlock: &anthropic.ToolResultBlockParam{
						ToolUseID: block.ID,
						Content:   TOOL_RESULT_RESUME,
					}}))
				return nil
			},
		})
		if err != nil {
			if message != nil {
				return Usage{
					Usage:    message.Usage,
					Duration: time.Since(start_time),
					Valid:    false,
				}, err
			} else {
				return Usage{
					Usage:    anthropic.Usage{},
					Duration: time.Since(start_time),
					Valid:    false,
				}, err
			}
		}
	} else {
		return Usage{
			Usage:    message.Usage,
			Duration: time.Since(start_time),
			Valid:    false,
		}, fmt.Errorf("Invalid response from the AI assistant")
	}

	// Store conversation
	err = ca.StoreAI_Conversation(user_id, conversation_id, conversation, ctx, cache)
	if err != nil {
		if message != nil {
			return Usage{
				Usage:    message.Usage,
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		} else {
			return Usage{
				Usage:    anthropic.Usage{},
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		}
	}

	return Usage{
		Usage:    message.Usage,
		Duration: time.Since(start_time),
		Valid:    true,
	}, nil
}

func CommentAndRecreateResume(
	ctx context.Context,
	user_id uuid.UUID,
	conversation_id uuid.UUID,
	comment string,
	model anthropic.Model,
	claude *anthropic.Client,
	cache *ca.Cache,
) (Usage, error) {
	start_time := time.Now()
	conversation, err := ca.GetConversation(user_id, conversation_id, ctx, cache)
	if err != nil {
		return Usage{
			Usage:    anthropic.Usage{},
			Duration: time.Since(start_time),
			Valid:    false,
		}, err
	}
	conversation = append(conversation, anthropic.NewUserMessage(anthropic.ContentBlockParamUnion{
		OfRequestTextBlock: &anthropic.TextBlockParam{
			Text: fmt.Sprintf(EN_COMMENT_RESUME_PROMPT_TEMPLATE, comment),
		}}))

	message, err := claude.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     model,
		MaxTokens: int64(4096),
		Messages:  conversation,
		Tools:     EN_TOOLS,
	})
	if err != nil {
		if message != nil {
			return Usage{
				Usage:    message.Usage,
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		} else {
			return Usage{
				Usage:    anthropic.Usage{},
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		}
	}
	conversation = append(conversation, message.ToParam())
	if message.StopReason == anthropic.MessageStopReasonToolUse {
		err = analyseToolUse(message, ToolUseCallback{
			OnResume: func(input utils.ToolResumeDataParams, block anthropic.ContentBlockUnion) error {
				err = tool_CreateResume(user_id, conversation_id, input, ctx, cache)
				if err != nil {
					return err
				}
				conversation = append(conversation, anthropic.NewUserMessage(anthropic.ContentBlockParamUnion{
					OfRequestToolResultBlock: &anthropic.ToolResultBlockParam{
						ToolUseID: block.ID,
						Content:   TOOL_RESULT_RESUME,
					}}))
				return nil
			},
		})
		if err != nil {
			if message != nil {
				return Usage{
					Usage:    message.Usage,
					Duration: time.Since(start_time),
					Valid:    false,
				}, err
			} else {
				return Usage{
					Usage:    anthropic.Usage{},
					Duration: time.Since(start_time),
					Valid:    false,
				}, err
			}
		}
	} else {
		return Usage{
			Usage:    message.Usage,
			Duration: time.Since(start_time),
			Valid:    false,
		}, fmt.Errorf("Invalid response from the AI assistant")
	}
	err = ca.StoreAI_Conversation(user_id, conversation_id, conversation, ctx, cache)
	if err != nil {
		if message != nil {
			return Usage{
				Usage:    message.Usage,
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		} else {
			return Usage{
				Usage:    anthropic.Usage{},
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		}
	}

	return Usage{
		Usage:    message.Usage,
		Duration: time.Since(start_time),
		Valid:    true,
	}, nil
}

func CreateCoverLetter(
	ctx context.Context,
	user_id uuid.UUID,
	conversation_id uuid.UUID,
	instruction string,
	model anthropic.Model,
	claude *anthropic.Client,
	cache *ca.Cache,
) (Usage, error) {
	start_time := time.Now()
	conversation, err := ca.GetConversation(user_id, conversation_id, ctx, cache)
	if err != nil {
		return Usage{
			Usage:    anthropic.Usage{},
			Duration: time.Since(start_time),
			Valid:    false,
		}, err
	}
	if instruction != "" {
		conversation = append(conversation, anthropic.NewUserMessage(anthropic.ContentBlockParamUnion{
			OfRequestTextBlock: &anthropic.TextBlockParam{
				Text: fmt.Sprintf(EN_COVER_LETTER_WITH_INSTRUCTION_PROMPT_TEMPLATE, instruction),
			}}))
	} else {
		conversation = append(conversation, anthropic.NewUserMessage(anthropic.ContentBlockParamUnion{
			OfRequestTextBlock: &anthropic.TextBlockParam{
				Text: EN_COVER_LETTER_PROMPT_TEMPLATE,
			}}))
	}

	message, err := claude.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     model,
		MaxTokens: int64(4096),
		Messages:  conversation,
		Tools:     EN_TOOLS,
	})
	if err != nil {
		if message != nil {
			return Usage{
				Usage:    message.Usage,
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		} else {
			return Usage{
				Usage:    anthropic.Usage{},
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		}
	}
	conversation = append(conversation, message.ToParam())
	if message.StopReason == anthropic.MessageStopReasonToolUse {
		err = analyseToolUse(message, ToolUseCallback{
			OnLetter: func(input utils.ToolCoverLetterParams, block anthropic.ContentBlockUnion) error {

				slog.Info("Create cover letter", "letter", input)
				err = tool_CreateCoverLetter(user_id, conversation_id, input, ctx, cache)
				if err != nil {
					return err
				}
				conversation = append(conversation, anthropic.NewUserMessage(anthropic.ContentBlockParamUnion{
					OfRequestToolResultBlock: &anthropic.ToolResultBlockParam{
						ToolUseID: block.ID,
						Content:   TOOL_RESULT_LETTER,
					}}))
				return nil
			},
		})
		if err != nil {
			if message != nil {
				return Usage{
					Usage:    message.Usage,
					Duration: time.Since(start_time),
					Valid:    false,
				}, err
			} else {
				return Usage{
					Usage:    anthropic.Usage{},
					Duration: time.Since(start_time),
					Valid:    false,
				}, err
			}
		}
	} else {
		return Usage{
			Usage:    message.Usage,
			Duration: time.Since(start_time),
			Valid:    false,
		}, fmt.Errorf("Invalid response from the AI assistant")
	}
	err = ca.StoreAI_Conversation(user_id, conversation_id, conversation, ctx, cache)
	if err != nil {
		if message != nil {
			return Usage{
				Usage:    message.Usage,
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		} else {
			return Usage{
				Usage:    anthropic.Usage{},
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		}
	}

	return Usage{
		Usage:    message.Usage,
		Duration: time.Since(start_time),
		Valid:    true,
	}, nil
}

func CommentAndRecreateCoverLetter(
	ctx context.Context,
	user_id uuid.UUID,
	conversation_id uuid.UUID,
	comment string,
	model anthropic.Model,
	claude *anthropic.Client,
	cache *ca.Cache,
) (Usage, error) {
	start_time := time.Now()
	conversation, err := ca.GetConversation(user_id, conversation_id, ctx, cache)
	if err != nil {
		return Usage{
			Usage:    anthropic.Usage{},
			Duration: time.Since(start_time),
			Valid:    false,
		}, err
	}

	conversation = append(conversation, anthropic.NewUserMessage(anthropic.ContentBlockParamUnion{
		OfRequestTextBlock: &anthropic.TextBlockParam{
			Text: fmt.Sprintf(EN_COMMENT_LETTER_PROMPT_TEMPLATE, comment),
		}}))

	message, err := claude.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     model,
		MaxTokens: int64(4096),
		Messages:  conversation,
		Tools:     EN_TOOLS,
	})
	if err != nil {
		if message != nil {
			return Usage{
				Usage:    message.Usage,
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		} else {
			return Usage{
				Usage:    anthropic.Usage{},
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		}
	}

	conversation = append(conversation, message.ToParam())
	if message.StopReason == anthropic.MessageStopReasonToolUse {
		err = analyseToolUse(message, ToolUseCallback{
			OnLetter: func(input utils.ToolCoverLetterParams, block anthropic.ContentBlockUnion) error {
				err = tool_CreateCoverLetter(user_id, conversation_id, input, ctx, cache)
				if err != nil {
					return err
				}
				conversation = append(conversation, anthropic.NewUserMessage(anthropic.ContentBlockParamUnion{
					OfRequestToolResultBlock: &anthropic.ToolResultBlockParam{
						ToolUseID: block.ID,
						Content:   TOOL_RESULT_LETTER,
					}}))
				return nil
			},
		})
		if err != nil {
			if message != nil {
				return Usage{
					Usage:    message.Usage,
					Duration: time.Since(start_time),
					Valid:    false,
				}, err
			} else {
				return Usage{
					Usage:    anthropic.Usage{},
					Duration: time.Since(start_time),
					Valid:    false,
				}, err
			}
		}
	} else {
		return Usage{
			Usage:    message.Usage,
			Duration: time.Since(start_time),
			Valid:    false,
		}, fmt.Errorf("Invalid response from the AI assistant")
	}
	err = ca.StoreAI_Conversation(user_id, conversation_id, conversation, ctx, cache)
	if err != nil {
		if message != nil {
			return Usage{
				Usage:    message.Usage,
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		} else {
			return Usage{
				Usage:    anthropic.Usage{},
				Duration: time.Since(start_time),
				Valid:    false,
			}, err
		}
	}

	return Usage{
		Usage:    message.Usage,
		Duration: time.Since(start_time),
		Valid:    true,
	}, nil
}

type ToolUseCallback struct {
	OnResume func(input utils.ToolResumeDataParams, block anthropic.ContentBlockUnion) error
	OnLetter func(input utils.ToolCoverLetterParams, block anthropic.ContentBlockUnion) error
}

func analyseToolUse(message *anthropic.Message, callbacks ToolUseCallback) error {
	for _, block := range message.Content {
		switch variant := block.AsAny().(type) {
		case anthropic.ToolUseBlock:
			switch block.Name {
			case TOOL_WRITE_JSON_RESUME_NAME:
				var input utils.ToolResumeDataParams
				err := json.Unmarshal([]byte(variant.JSON.Input.Raw()), &input)
				if err != nil {
					return err
				}

				if callbacks.OnResume != nil {
					err = callbacks.OnResume(input, block)
					if err != nil {
						return err
					}
				}
			case TOOL_WRITE_COVER_LETTER_NAME:
				var input utils.ToolCoverLetterParams
				err := json.Unmarshal([]byte(variant.JSON.Input.Raw()), &input)
				if err != nil {
					return err
				}

				if callbacks.OnLetter != nil {
					err = callbacks.OnLetter(input, block)
					if err != nil {
						return err
					}
				}
			}
		}
	}
	return nil
}

func tool_CreateResume(
	user_id uuid.UUID,
	conversation_id uuid.UUID,
	params utils.ToolResumeDataParams,
	c context.Context,
	cache *ca.Cache,
) error {
	err := ca.StoreAI_ResumeResult(user_id, conversation_id, params, c, cache)
	if err != nil {
		slog.Warn("Failed to StoreAI_ResumeResult", "error", err.Error())
		return err
	}
	err = ca.StoreAI_TitleResult(user_id, conversation_id, params.Title, c, cache)
	if err != nil {
		slog.Warn("Failed to StoreAI_ResumeResult", "error", err.Error())
		return err
	}
	return nil
}

func tool_CreateCoverLetter(
	user_id uuid.UUID,
	conversation_id uuid.UUID,
	params utils.ToolCoverLetterParams,
	c context.Context,
	cache *ca.Cache,
) error {
	err := ca.StoreAI_CoverLetterResult(user_id, conversation_id, params, c, cache)
	if err != nil {
		slog.Warn("Failed to StoreAI_CoverLetterResult", "error", err.Error())
		return err
	}
	return nil
}
