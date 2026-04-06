package ai

import (
	"context"
	"fmt"
	"os"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
	"github.com/yourusername/pulse-server/internal/models"
)

func MatchWaiters(managerNeed string, waiters []models.Profile) (string, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("GEMINI_API_KEY")))
	if err != nil {
		return "", err
	}
	defer client.Close()

	// Use the correct model name from your curl output
	model := client.GenerativeModel("models/gemini-2.5-flash")

	// Build the prompt
	prompt := fmt.Sprintf(`
		You are a luxury hotel recruitment assistant. 
		A manager is looking for: "%s"
		
		Here are the available staff: %v
		
		Pick the best 3 candidates and explain why their "vibe_tags" match the manager's request. 
		Keep it professional and concise.
	`, managerNeed, waiters)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", err
	}

	// Extract the text response safely
	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no response from AI model")
	}

	return fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0]), nil
}