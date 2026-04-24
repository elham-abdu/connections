package main

import (
	"context"
	"fmt"
	"os"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"github.com/nedpals/supabase-go"
	"google.golang.org/api/option"
)

// Profile struct matches your Supabase profiles table
type Profile struct {
	ID               string   `json:"id"`
	Email            string   `json:"email"`
	FullName         string   `json:"full_name"`
	Role             string   `json:"role"`
	Bio              string   `json:"bio"`
	Experience       string   `json:"experience"`
	Availability     []string `json:"availability"`
	VibeTags         []string `json:"vibe_tags"`
	LoyaltyScore     int      `json:"loyalty_score"`
	Phone            string   `json:"phone"`
	Address          string   `json:"address"`
	City             string   `json:"city"`
	EmergencyContact string   `json:"emergency_contact"`
}

type Shift struct {
	ID        string `json:"id"`
	StaffID   string `json:"staff_id"`
	Date      string `json:"date"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
	Status    string `json:"status"`
}

type Notification struct {
	ID        string `json:"id"`
	StaffID   string `json:"staff_id"`
	Title     string `json:"title"`
	Message   string `json:"message"`
	CreatedAt string `json:"created_at"`
}

func verifyToken(c *gin.Context, sbClient *supabase.Client) (bool, string, string) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return false, "", ""
	}
	token := strings.TrimPrefix(authHeader, "Bearer ")
	user, err := sbClient.Auth.User(c.Request.Context(), token)
	if err != nil || user == nil {
		return false, "", ""
	}
	role := "staff"
	if userRole, ok := user.UserMetadata["role"]; ok {
		role = userRole.(string)
	}
	return true, user.ID, role
}

// matchStaffWithAI uses Gemini AI to find the best staff matches
func matchStaffWithAI(ctx context.Context, managerNeed string, staff []Profile) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	
	if apiKey == "" {
		return generateSimpleMatch(managerNeed, staff), nil
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
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

func generateSimpleMatch(managerNeed string, staff []Profile) string {
	recommendation := "Based on your requirements, we recommend:\n\n"
	
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
	
	// Sort by score
	for i := 0; i < len(scored)-1; i++ {
		for j := i + 1; j < len(scored); j++ {
			if scored[j].Score > scored[i].Score {
				scored[i], scored[j] = scored[j], scored[i]
			}
		}
	}
	
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

func main() {
	godotenv.Load()
	
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	
	if supabaseUrl == "" || supabaseKey == "" {
		panic("SUPABASE_URL and SUPABASE_KEY must be set in .env file")
	}
	
	sbClient := supabase.CreateClient(supabaseUrl, supabaseKey)

	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"https://pulse-hospitality.vercel.app",
			"https://pulse-hospitality-git-main.vercel.app",
		}
		origin := c.Request.Header.Get("Origin")
		allowed := false
		for _, o := range allowedOrigins {
			if o == origin {
				allowed = true
				break
			}
		}
		
		if allowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// --- Health Check ---
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy", "service": "pulse-hospitality-api"})
	})

	// --- Recruit AI Endpoint ---
	r.POST("/api/recruit", func(c *gin.Context) {
		var input struct {
			Requirement string `json:"requirement"`
			Role        string `json:"role,omitempty"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		
		var allStaff []Profile
		err := sbClient.DB.From("profiles").Select("*").Execute(&allStaff)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch staff"})
			return
		}
		
		var filteredStaff []Profile
		if input.Role != "" {
			for _, s := range allStaff {
				if s.Role == input.Role {
					filteredStaff = append(filteredStaff, s)
				}
			}
		} else {
			filteredStaff = allStaff
		}
		
		ctx := context.Background()
		recommendation, err := matchStaffWithAI(ctx, input.Requirement, filteredStaff)
		if err != nil {
			c.JSON(500, gin.H{"error": "AI matching failed: " + err.Error()})
			return
		}
		
		c.JSON(200, gin.H{"recommendation": recommendation})
	})

	// --- Staff Routes ---
	staffGroup := r.Group("/api/staff")
	{
		// Get all staff
		staffGroup.GET("", func(c *gin.Context) {
			authenticated, _, _ := verifyToken(c, sbClient)
			if !authenticated {
				c.JSON(401, gin.H{"error": "Unauthorized"})
				return
			}
			
			var staff []Profile
			err := sbClient.DB.From("profiles").Select("*").Execute(&staff)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch staff"})
				return
			}
			c.JSON(200, staff)
		})

		// Get staff by ID
		staffGroup.GET("/:id", func(c *gin.Context) {
			authenticated, _, _ := verifyToken(c, sbClient)
			if !authenticated {
				c.JSON(401, gin.H{"error": "Unauthorized"})
				return
			}
			
			id := c.Param("id")
			var staff []Profile
			err := sbClient.DB.From("profiles").Select("*").Eq("id", id).Execute(&staff)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch staff"})
				return
			}
			if len(staff) == 0 {
				c.JSON(404, gin.H{"error": "Staff not found"})
				return
			}
			c.JSON(200, staff[0])
		})

		// Get staff shifts
		staffGroup.GET("/:id/shifts", func(c *gin.Context) {
			authenticated, _, _ := verifyToken(c, sbClient)
			if !authenticated {
				c.JSON(401, gin.H{"error": "Unauthorized"})
				return
			}
			
			id := c.Param("id")
			var shifts []Shift
			err := sbClient.DB.From("shifts").Select("*").Eq("staff_id", id).Execute(&shifts)
			if err != nil {
				c.JSON(200, []Shift{})
				return
			}
			c.JSON(200, shifts)
		})

		// Get staff notifications
		staffGroup.GET("/:id/notifications", func(c *gin.Context) {
			authenticated, _, _ := verifyToken(c, sbClient)
			if !authenticated {
				c.JSON(401, gin.H{"error": "Unauthorized"})
				return
			}
			
			id := c.Param("id")
			var notifications []Notification
			err := sbClient.DB.From("notifications").Select("*").Eq("staff_id", id).Execute(&notifications)
			if err != nil {
				c.JSON(200, []Notification{})
				return
			}
			
			// Sort by created_at descending (newest first)
			sort.Slice(notifications, func(i, j int) bool {
				return notifications[i].CreatedAt > notifications[j].CreatedAt
			})
			
			c.JSON(200, notifications)
		})

		// Update staff profile
		staffGroup.PATCH("/:id", func(c *gin.Context) {
			authenticated, userID, role := verifyToken(c, sbClient)
			if !authenticated {
				c.JSON(401, gin.H{"error": "Unauthorized"})
				return
			}

			id := c.Param("id")
			var updateData map[string]interface{}
			if err := c.ShouldBindJSON(&updateData); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			// Security: If not admin, check if they own the profile
			if role != "admin" && id != userID {
				c.JSON(403, gin.H{"error": "Forbidden: Not your profile"})
				return
			}

			var results []map[string]interface{}
			err := sbClient.DB.From("profiles").Update(updateData).Eq("id", id).Execute(&results)
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			
			if len(results) == 0 {
				c.JSON(404, gin.H{"error": "Profile not found"})
				return
			}
			
			c.JSON(200, results[0])
		})
	}

	// --- Admin Routes ---
	adminGroup := r.Group("/api/admin")
	{
		adminGroup.GET("/staff", func(c *gin.Context) {
			authenticated, _, role := verifyToken(c, sbClient)
			if !authenticated || role != "admin" {
				c.JSON(403, gin.H{"error": "Admin access required"})
				return
			}
			
			var staff []Profile
			err := sbClient.DB.From("profiles").Select("*").Execute(&staff)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch staff"})
				return
			}
			c.JSON(200, staff)
		})
		
		adminGroup.PATCH("/staff/:id", func(c *gin.Context) {
			authenticated, _, role := verifyToken(c, sbClient)
			if !authenticated || role != "admin" {
				c.JSON(403, gin.H{"error": "Admin access required"})
				return
			}
			
			id := c.Param("id")
			var updateData map[string]interface{}
			if err := c.ShouldBindJSON(&updateData); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			
			var results []map[string]interface{}
			err := sbClient.DB.From("profiles").Update(updateData).Eq("id", id).Execute(&results)
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			
			c.JSON(200, results[0])
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	r.Run(":" + port)
}