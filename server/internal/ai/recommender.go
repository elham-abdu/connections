package ai

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// Profile matches the model from your main.go - use the same struct
type Profile struct {
	ID           string   `json:"id"`
	Email        string   `json:"email"`
	FullName     string   `json:"full_name"`
	Role         string   `json:"role"`
	Bio          string   `json:"bio"`
	Experience   string   `json:"experience"`
	Availability []string `json:"availability"`
	VibeTags     []string `json:"vibe_tags"`
	LoyaltyScore int      `json:"loyalty_score"`
}

// MatchStaff uses Gemini AI to find the best staff matches
func MatchStaff(ctx context.Context, managerNeed string, staff []Profile) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	
	// Fallback if no API key
	if apiKey == "" {
		return generateSimpleMatch(managerNeed, staff), nil
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		// Fallback to simple matching if AI fails
		return generateSimpleMatch(managerNeed, staff), nil
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")
	
	var staffList strings.Builder
	for i, s := range staff {
		staffList.WriteString(fmt.Sprintf("%d. %s (%s) - Tags: %s, Loyalty: %d\n", 
			i+1, s.FullName, s.Role, strings.Join(s.VibeTags, ", "), s.LoyaltyScore))
	}
	
	prompt := fmt.Sprintf(`Find the best 3 staff members for: "%s"

Available staff:
%s

Return exactly 3 matches. Put PERFECT matches first. Be brief.

Format:
1. Name (Role) - Reason: why
2. Name (Role) - Reason: why
3. Name (Role) - Reason: why`, managerNeed, staffList.String())

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return generateSimpleMatch(managerNeed, staff), nil
	}

	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		if txt, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
			return string(txt), nil
		}
	}
	
	return generateSimpleMatch(managerNeed, staff), nil
}

// generateSimpleMatch provides a fallback matching without AI
func generateSimpleMatch(managerNeed string, staff []Profile) string {
	recommendation := "Based on your requirements, we recommend:\n\n"
	
	// Score each staff member based on keyword matching
	type ScoredStaff struct {
		Staff Profile
		Score int
	}
	
	var scored []ScoredStaff
	needLower := strings.ToLower(managerNeed)
	
	for _, s := range staff {
		score := 0
		for _, tag := range s.VibeTags {
			if strings.Contains(needLower, strings.ToLower(tag)) {
				score += 10
			}
		}
		if strings.Contains(needLower, strings.ToLower(s.Role)) {
			score += 5
		}
		score += s.LoyaltyScore / 20
		scored = append(scored, ScoredStaff{Staff: s, Score: score})
	}
	
	// Sort by score (simple bubble sort)
	for i := 0; i < len(scored)-1; i++ {
		for j := i + 1; j < len(scored); j++ {
			if scored[j].Score > scored[i].Score {
				scored[i], scored[j] = scored[j], scored[i]
			}
		}
	}
	
	// Take top 3
	maxMatches := 3
	if len(scored) < maxMatches {
		maxMatches = len(scored)
	}
	
	for i := 0; i < maxMatches; i++ {
		s := scored[i].Staff
		recommendation += fmt.Sprintf("• %s (%s) - Vibe Tags: %s, Loyalty: %d%%\n", 
			s.FullName, s.Role, strings.Join(s.VibeTags, ", "), s.LoyaltyScore)
	}
	
	if recommendation == "Based on your requirements, we recommend:\n\n" {
		recommendation = "No matching staff found for your requirements."
	}
	
	return recommendation
}