package ai

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
	"github.com/yourusername/pulse-server/internal/models"
)

func MatchStaff(managerNeed string, staff []models.Profile) (string, error) {
	ctx := context.Background()
	
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY environment variable not set")
	}
	
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", fmt.Errorf("failed to create AI client: %v", err)
	}
	defer client.Close()

	model := client.GenerativeModel("models/gemini-2.5-flash")
	
	// Build a simple, clear staff list
	var staffList strings.Builder
	for i, s := range staff {
		staffList.WriteString(fmt.Sprintf("%d. %s - %s - Tags: %s\n", 
			i+1, s.FullName, s.Role, strings.Join(s.VibeTags, ", ")))
	}
	
	prompt := fmt.Sprintf(`Find best staff for: "%s"

Available staff:
%s

Return TOP 3 matches. Put PERFECT matches first. Be brief.

Example format:
1. Name (Role) - Tags: [tags] - Reason: why
2. Name (Role) - Tags: [tags] - Reason: why
3. Name (Role) - Tags: [tags] - Reason: why

Summary: one sentence.`, managerNeed, staffList.String())

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("AI generation failed: %v", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no response from AI model")
	}

	return fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0]), nil
}

func MatchWaiters(managerNeed string, waiters []models.Profile) (string, error) {
	return MatchStaff(managerNeed, waiters)
}