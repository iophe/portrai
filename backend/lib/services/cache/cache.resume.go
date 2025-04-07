package cache

import (
	"backend/lib/services/db"
	"backend/lib/utils"
	"context"
	"encoding/json"
	"fmt"
	"slices"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/packages/param"
	"github.com/anthropics/anthropic-sdk-go/shared/constant"
	"github.com/google/uuid"
)

const (
	// USER_RESUME_DATA_KEY = ""
	// USER_RESUME_DATA_TTL = 1 * time.Hour

	USER_AI_CONVERSATION_KEY = "ai:conversations"
	USER_AI_CONVERSATION_TTL = 24 * time.Hour

	USER_AI_RESUME_HASH_KEY = "ai:hash"
	USER_AI_RESUME_HASH_TTL = 24 * time.Hour
)

func CreateConversation(user_id uuid.UUID, resume_uid uuid.UUID, c context.Context, cache *Cache) (uuid.UUID, error) {
	conversation_id := uuid.New()

	conversation_key := fmt.Sprintf(
		"%s:%s:%s:resume_uid",
		USER_AI_CONVERSATION_KEY,
		db.UUIDToString(user_id),
		db.UUIDToString(conversation_id),
	)
	err := cache.Client.Set(c, conversation_key, db.UUIDToString(resume_uid), USER_AI_CONVERSATION_TTL).Err()
	return conversation_id, err
}

func StoreAI_TitleResult(user_id uuid.UUID, conversation_id uuid.UUID, title utils.ToolTitleParams, c context.Context, cache *Cache) error {

	title_json, err := json.Marshal(title)
	if err != nil {
		return fmt.Errorf("Failed to marshal the created title")
	}

	title_key := fmt.Sprintf(
		"%s:%s:%s:title",
		USER_AI_CONVERSATION_KEY,
		db.UUIDToString(user_id),
		db.UUIDToString(conversation_id),
	)
	err = cache.Client.Set(c, title_key, title_json, USER_AI_CONVERSATION_TTL).Err()
	return err
}

func StoreAI_ResumeResult(user_id uuid.UUID, conversation_id uuid.UUID, resume utils.ToolResumeDataParams, c context.Context, cache *Cache) error {

	resume_json, err := json.Marshal(resume)
	if err != nil {
		return fmt.Errorf("Failed to marshal the created resume")
	}

	resume_key := fmt.Sprintf(
		"%s:%s:%s:data",
		USER_AI_CONVERSATION_KEY,
		db.UUIDToString(user_id),
		db.UUIDToString(conversation_id),
	)
	err = cache.Client.Set(c, resume_key, resume_json, USER_AI_CONVERSATION_TTL).Err()
	return err
}

func StoreAI_CoverLetterResult(user_id uuid.UUID, conversation_id uuid.UUID, letter utils.ToolCoverLetterParams, c context.Context, cache *Cache) error {

	letter_json, err := json.Marshal(letter)
	if err != nil {
		return fmt.Errorf("Failed to marshal the created cover letter")
	}

	letter_key := fmt.Sprintf(
		"%s:%s:%s:letter",
		USER_AI_CONVERSATION_KEY,
		db.UUIDToString(user_id),
		db.UUIDToString(conversation_id),
	)
	err = cache.Client.Set(c, letter_key, letter_json, USER_AI_CONVERSATION_TTL).Err()
	return err
}

func StoreAI_Conversation(user_id uuid.UUID, conversation_id uuid.UUID, conversation []anthropic.MessageParam, c context.Context, cache *Cache) error {
	// Temporary fix to Marshal/UnMarshal []anthropic.MessageParam
	// TODO : To remove when fix !!!
	/*buffer := make([]string, len(conversation))
	for i, c := range conversation {
		json, err := c.MarshalJSON()
		if err != nil {
			return fmt.Errorf("Failed to marshal the created cover letter")
		}
		buffer[i] = string(json)
	}*/
	/*
		for _, msg := range conversation {
			slog.Info("StoreAI_Conversation", "from", msg.Role)
			for _, content := range msg.Content {
				if content.OfRequestTextBlock != nil {
					slog.Info("StoreAI_Conversation", "type", "text")
					slog.Info("StoreAI_Conversation", "content", content.OfRequestTextBlock.Text[:25])
				} else if content.OfRequestToolUseBlock != nil {
					slog.Info("StoreAI_Conversation", "type", "tool_use")
				} else if content.OfRequestToolResultBlock != nil {
					slog.Info("StoreAI_Conversation", "type", "tool_result")
				} else {
					slog.Info("StoreAI_Conversation", "type", "nil")
				}
				slog.Info("--------------------")
			}
		}*/

	conversation_json, err := json.Marshal(conversation)
	if err != nil {
		return fmt.Errorf("Failed to marshal the created cover letter")
	}

	conversation_key := fmt.Sprintf(
		"%s:%s:%s:conversation",
		USER_AI_CONVERSATION_KEY,
		db.UUIDToString(user_id),
		db.UUIDToString(conversation_id),
	)
	err = cache.Client.Set(c, conversation_key, conversation_json, USER_AI_CONVERSATION_TTL).Err()
	return err
}

func GetResumeData(user_id uuid.UUID, conversation_id uuid.UUID, c context.Context, cache *Cache) (utils.ToolResumeDataParams, error) {
	resume_key := fmt.Sprintf(
		"%s:%s:%s:data",
		USER_AI_CONVERSATION_KEY,
		db.UUIDToString(user_id),
		db.UUIDToString(conversation_id),
	)
	data_json, err := cache.Client.Get(c, resume_key).Result()
	if err != nil {
		return utils.ToolResumeDataParams{}, fmt.Errorf("failed to get resume data from cache: %w", err)
	}

	var data utils.ToolResumeDataParams
	if err := json.Unmarshal([]byte(data_json), &data); err != nil {
		return utils.ToolResumeDataParams{}, fmt.Errorf("failed to unmarshal resume data: %w", err)
	}

	return data, nil
}

func GetResumeTitle(user_id uuid.UUID, conversation_id uuid.UUID, c context.Context, cache *Cache) (utils.ToolTitleParams, error) {
	title_key := fmt.Sprintf(
		"%s:%s:%s:title",
		USER_AI_CONVERSATION_KEY,
		db.UUIDToString(user_id),
		db.UUIDToString(conversation_id),
	)
	data_json, err := cache.Client.Get(c, title_key).Result()
	if err != nil {
		return utils.ToolTitleParams{}, fmt.Errorf("failed to get resume title from cache: %w", err)
	}

	var data utils.ToolTitleParams
	if err := json.Unmarshal([]byte(data_json), &data); err != nil {
		return utils.ToolTitleParams{}, fmt.Errorf("failed to unmarshal resume title: %w", err)
	}

	return data, nil
}

func GetResumeCoverLetter(user_id uuid.UUID, conversation_id uuid.UUID, c context.Context, cache *Cache) (utils.ToolCoverLetterParams, error) {
	letter_key := fmt.Sprintf(
		"%s:%s:%s:letter",
		USER_AI_CONVERSATION_KEY,
		db.UUIDToString(user_id),
		db.UUIDToString(conversation_id),
	)
	data_json, err := cache.Client.Get(c, letter_key).Result()
	if err != nil {
		return utils.ToolCoverLetterParams{}, fmt.Errorf("failed to get resume letter from cache: %w", err)
	}

	var data utils.ToolCoverLetterParams
	if err := json.Unmarshal([]byte(data_json), &data); err != nil {
		return utils.ToolCoverLetterParams{}, fmt.Errorf("failed to unmarshal resume letter: %w", err)
	}

	return data, nil
}

func GetConversation(user_id uuid.UUID, conversation_id uuid.UUID, c context.Context, cache *Cache) ([]anthropic.MessageParam, error) {
	conversation_key := fmt.Sprintf(
		"%s:%s:%s:conversation",
		USER_AI_CONVERSATION_KEY,
		db.UUIDToString(user_id),
		db.UUIDToString(conversation_id),
	)
	data_json, err := cache.Client.Get(c, conversation_key).Result()
	if err != nil {
		return []anthropic.MessageParam{}, fmt.Errorf("failed to get resume letter from cache: %w", err)
	}

	// Temporary fix to Marshal/UnMarshal []anthropic.MessageParam
	// TODO : To remove when fixed !!!
	type ToolResultBlockParamContentUnion struct {
		anthropic.TextBlockParam  `json:",omitzero,inline"`
		anthropic.ImageBlockParam `json:",omitzero,inline"`
		Type                      string `json:"type,required"`
	}
	type ToolResultBlockParam struct {
		ToolUseID    string                               `json:"tool_use_id,required"`
		IsError      param.Opt[bool]                      `json:"is_error,omitzero"`
		CacheControl anthropic.CacheControlEphemeralParam `json:"cache_control,omitzero"`
		Content      []ToolResultBlockParamContentUnion   `json:"content,omitzero"`
		// This field can be elided, and will marshal its zero value as "tool_result".
		Type constant.ToolResult `json:"type,required"`
	}

	type Aggregate struct {
		anthropic.TextBlockParam             `json:",omitzero,inline"`
		anthropic.ImageBlockParam            `json:",omitzero,inline"`
		anthropic.ToolUseBlockParam          `json:",omitzero,inline"`
		ToolResultBlockParam                 `json:",omitzero,inline"`
		anthropic.DocumentBlockParam         `json:",omitzero,inline"`
		anthropic.ThinkingBlockParam         `json:",omitzero,inline"`
		anthropic.RedactedThinkingBlockParam `json:",omitzero,inline"`
		Type                                 string                               `json:"type,required"`
		CacheControl                         anthropic.CacheControlEphemeralParam `json:"cache_control,omitzero"`
	}
	type MessageParamStub struct {
		Content []Aggregate                `json:"content,omitzero,required"`
		Role    anthropic.MessageParamRole `json:"role,omitzero,required"`
	}
	var stub []MessageParamStub
	if err := json.Unmarshal([]byte(data_json), &stub); err != nil {
		return []anthropic.MessageParam{}, fmt.Errorf("failed to unmarshal conversation array: %w", err)
	}

	data := make([]anthropic.MessageParam, len(stub))
	for i, msg := range stub {
		content := make([]anthropic.ContentBlockParamUnion, len(msg.Content))
		for j, stubbed_content := range msg.Content {
			switch stubbed_content.Type {
			case "text":
				stubbed_content.TextBlockParam.CacheControl = stubbed_content.CacheControl
				content[j] = anthropic.ContentBlockParamUnion{
					OfRequestTextBlock: &stubbed_content.TextBlockParam,
				}
			case "tool_use":
				stubbed_content.TextBlockParam.CacheControl = stubbed_content.CacheControl
				content[j] = anthropic.ContentBlockParamUnion{
					OfRequestToolUseBlock: &stubbed_content.ToolUseBlockParam,
				}
			case "tool_result":
				stubbed_content.TextBlockParam.CacheControl = stubbed_content.CacheControl
				tool_result_content := make([]anthropic.ToolResultBlockParamContentUnion, len(stubbed_content.ToolResultBlockParam.Content))
				for k, c := range stubbed_content.ToolResultBlockParam.Content {
					switch c.Type {
					case "text":
						tool_result_content[k] = anthropic.ToolResultBlockParamContentUnion{
							OfRequestTextBlock: &c.TextBlockParam,
						}
					case "image":
						tool_result_content[k] = anthropic.ToolResultBlockParamContentUnion{
							OfRequestImageBlock: &c.ImageBlockParam,
						}
					}
				}
				content[j] = anthropic.ContentBlockParamUnion{
					OfRequestToolResultBlock: &anthropic.ToolResultBlockParam{
						ToolUseID:    stubbed_content.ToolResultBlockParam.ToolUseID,
						IsError:      stubbed_content.ToolResultBlockParam.IsError,
						CacheControl: stubbed_content.ToolResultBlockParam.CacheControl,
						Content:      tool_result_content,
						Type:         stubbed_content.ToolResultBlockParam.Type,
					},
				}
			case "document":
				stubbed_content.TextBlockParam.CacheControl = stubbed_content.CacheControl
				content[j] = anthropic.ContentBlockParamUnion{
					OfRequestDocumentBlock: &stubbed_content.DocumentBlockParam,
				}
			case "thinking":
				stubbed_content.TextBlockParam.CacheControl = stubbed_content.CacheControl
				content[j] = anthropic.ContentBlockParamUnion{
					OfRequestThinkingBlock: &stubbed_content.ThinkingBlockParam,
				}
			case "redacted_thinking":
				stubbed_content.TextBlockParam.CacheControl = stubbed_content.CacheControl
				content[j] = anthropic.ContentBlockParamUnion{
					OfRequestRedactedThinkingBlock: &stubbed_content.RedactedThinkingBlockParam,
				}
			}
		}
		data[i] = anthropic.MessageParam{
			Role:    msg.Role,
			Content: content,
		}
	}
	/*
		for _, msg := range data {
			slog.Info("GetConversation", "from", msg.Role)
			for _, content := range msg.Content {
				if content.OfRequestTextBlock != nil {
					slog.Info("GetConversation", "type", "text")
					slog.Info("GetConversation", "content", content.OfRequestTextBlock.Text[:25])
				} else if content.OfRequestToolUseBlock != nil {
					slog.Info("GetConversation", "type", "tool_use")
				} else if content.OfRequestToolResultBlock != nil {
					slog.Info("GetConversation", "type", "tool_result")
				} else {
					slog.Info("GetConversation", "type", "nil")
				}
			}
			slog.Info("--------------------------")
		}*/

	return slices.Clip(data), nil
}
