package models

import "time"

type Profile struct {
	ID           string    `json:"id"`
	FullName     string    `json:"full_name"`
	Role         string    `json:"role"`
	LoyaltyScore int       `json:"loyalty_score"`
	VibeTags     []string  `json:"vibe_tags"` // Supabase JSONB becomes a slice in Go
	CreatedAt    time.Time `json:"created_at"`
}