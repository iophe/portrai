package cache

import (
	"backend/lib/services/db"
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Experience struct {
	ExperienceID    int64             `json:"experience_id"`
	CompanyName     string            `json:"company_name"`
	JobTitle        string            `json:"job_title"`
	Location        string            `json:"location"`
	StartDate       string            `json:"start_date"`
	OptionalEndDate string            `json:"optional_end_date"`
	IsCurrent       bool              `json:"is_current"`
	Description     string            `json:"description"`
	Priority        int32             `json:"priority"`
	IsVisible       bool              `json:"is_visible"`
	Tags            []string          `json:"tags"`
	Notes           []json.RawMessage `json:"notes"`
}

type Education struct {
	EducationID     int64             `json:"education_id"`
	School          string            `json:"school"`
	Degree          string            `json:"degree"`
	Location        string            `json:"location"`
	StartDate       string            `json:"start_date"`
	OptionalEndDate string            `json:"optional_end_date"`
	IsCurrent       bool              `json:"is_current"`
	Description     string            `json:"description"`
	Priority        int32             `json:"priority"`
	IsVisible       bool              `json:"is_visible"`
	Tags            []string          `json:"tags"`
	Notes           []json.RawMessage `json:"notes"`
}

type Skill struct {
	SkillID            int64             `json:"skill_id"`
	SkillName          string            `json:"skill_name"`
	OptionalSkillType  string            `json:"optional_skill_type"`
	OptionalSkillLevel string            `json:"optional_skill_level"`
	Description        string            `json:"description"`
	Priority           int32             `json:"priority"`
	IsVisible          bool              `json:"is_visible"`
	Tags               []string          `json:"tags"`
	Notes              []json.RawMessage `json:"notes"`
}

type Certificate struct {
	CertificateID       int64             `json:"certificate_id"`
	CertificateName     string            `json:"certificate_name"`
	OptionalIssuer      string            `json:"optional_issuer"`
	OptionalLocation    string            `json:"optional_location"`
	OptionalGrantedDate string            `json:"optional_granted_date"`
	Description         string            `json:"description"`
	Priority            int32             `json:"priority"`
	IsVisible           bool              `json:"is_visible"`
	Tags                []string          `json:"tags"`
	Notes               []json.RawMessage `json:"notes"`
}

type Project struct {
	ProjectID               int64             `json:"project_id"`
	ProjectTitle            string            `json:"project_title"`
	OptionalProjectSubtitle string            `json:"optional_project_subtitle"`
	OptionalStartDate       string            `json:"optional_start_date"`
	OptionalEndDate         string            `json:"optional_end_date"`
	IsCurrent               bool              `json:"is_current"`
	Description             string            `json:"description"`
	Priority                int32             `json:"priority"`
	IsVisible               bool              `json:"is_visible"`
	Tags                    []string          `json:"tags"`
	Notes                   []json.RawMessage `json:"notes"`
}

type ResumeCachedData struct {
	Experiences  []Experience  `json:"experiences"`
	Educations   []Education   `json:"educations"`
	Skills       []Skill       `json:"skills"`
	Certificates []Certificate `json:"certificates"`
	Projects     []Project     `json:"projects"`
}

const (
	// USER_RESUME_DATA_KEY = ""
	// USER_RESUME_DATA_TTL = 1 * time.Hour

	USER_AI_CONVERSATION_KEY = "ai:conversations"
	USER_AI_CONVERSATION_TTL = 24 * time.Hour

	USER_AI_RESUME_HASH_KEY = "ai:hash"
	USER_AI_RESUME_HASH_TTL = 24 * time.Hour
)

// func UpsertUserResumeData(user_id uuid.UUID, data ResumeCachedData, c context.Context, cache *Cache) error {
// 	resume_data_key := fmt.Sprintf("%s:%s", USER_RESUME_DATA_KEY, db.UUIDToString(user_id))
// 	data_json, err := json.Marshal(data)
// 	if err != nil {
// 		return fmt.Errorf("failed to marshal resume: %w", err)
// 	}
// 	err = cache.Client.Set(c, resume_data_key, data_json, USER_RESUME_DATA_TTL).Err()
// 	return err
// }

// func GetUserResumeData(user_id uuid.UUID, c context.Context, cache *Cache) (ResumeCachedData, error) {
// 	resume_data_key := fmt.Sprintf("%s:%s", USER_RESUME_DATA_KEY, db.UUIDToString(user_id))
// 	data_json, err := cache.Client.Get(c, resume_data_key).Result()
// 	if err != nil {
// 		return ResumeCachedData{}, err
// 	}
// 	var data ResumeCachedData
// 	if err := json.Unmarshal([]byte(data_json), &data); err != nil {
// 		return ResumeCachedData{}, fmt.Errorf("failed to unmarshal resume data: %w", err)
// 	}
// 	return data, nil
// }

func GetJsonConversation(user_id uuid.UUID, c context.Context, cache *Cache) (string, error) {
	conversation_key := fmt.Sprintf("%s:%s", USER_AI_CONVERSATION_KEY, db.UUIDToString(user_id))
	return cache.Client.Get(c, conversation_key).Result()
}

func GetResumeHash(user_id uuid.UUID, c context.Context, cache *Cache) (string, error) {
	hash_key := fmt.Sprintf("%s:%s", USER_AI_RESUME_HASH_KEY, db.UUIDToString(user_id))
	return cache.Client.Get(c, hash_key).Result()
}

func SetResumeHash(user_id uuid.UUID, hex_hash string, c context.Context, cache *Cache) error {
	hash_key := fmt.Sprintf("%s:%s", USER_AI_RESUME_HASH_KEY, db.UUIDToString(user_id))
	return cache.Client.Set(c, hash_key, hex_hash, USER_AI_RESUME_HASH_TTL).Err()
}

func UpsertConversation(user_id uuid.UUID, json_conversation string, c context.Context, cache *Cache) error {
	conversation_key := fmt.Sprintf("%s:%s", USER_AI_CONVERSATION_KEY, db.UUIDToString(user_id))
	return cache.Client.Set(c, conversation_key, json_conversation, USER_AI_CONVERSATION_TTL).Err()
}

func DelConversation(user_id uuid.UUID, c context.Context, cache *Cache) error {
	conversation_key := fmt.Sprintf("%s:%s", USER_AI_CONVERSATION_KEY, db.UUIDToString(user_id))
	return cache.Client.Del(c, conversation_key).Err()
}
