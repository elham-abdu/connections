package models

import "time"

type Profile struct {
	ID           string    `json:"id,omitempty" db:"id"`
	Email        string    `json:"email" db:"email"`
	FullName     string    `json:"full_name" db:"full_name"`
	Role         string    `json:"role" db:"role"`
	LoyaltyScore int       `json:"loyalty_score" db:"loyalty_score"`
	VibeTags     []string  `json:"vibe_tags" db:"vibe_tags"`
	Availability []string  `json:"availability" db:"availability"` 
	Bio          string    `json:"bio" db:"bio"`
	Experience   string    `json:"experience" db:"experience"`
	CreatedAt    time.Time `json:"created_at,omitempty" db:"created_at"`
}