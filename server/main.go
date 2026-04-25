package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
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
	Preferences      []string `json:"preferences"`
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

var supabaseURL string
var supabaseKey string

// Direct HTTP client to Supabase
func supabaseRequest(method, path string, body interface{}, token string) ([]byte, error) {
	url := supabaseURL + "/rest/v1/" + path
	
	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}
	
	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	return io.ReadAll(resp.Body)
}

func verifyToken(c *gin.Context) (bool, string, string) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		fmt.Println("No auth header")
		return false, "", ""
	}
	token := strings.TrimPrefix(authHeader, "Bearer ")
	
	// Verify token with Supabase
	url := supabaseURL + "/auth/v1/user"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Println("Error creating request:", err)
		return false, "", ""
	}
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+token)
	
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error making request:", err)
		return false, "", ""
	}
	defer resp.Body.Close()
	
	body, _ := io.ReadAll(resp.Body)
	
	if resp.StatusCode != 200 {
		fmt.Printf("Token validation failed with status: %d\n", resp.StatusCode)
		return false, "", ""
	}
	
	var userData map[string]interface{}
	json.Unmarshal(body, &userData)
	
	role := "staff"
	if userMeta, ok := userData["user_metadata"].(map[string]interface{}); ok {
		if userRole, ok := userMeta["role"]; ok {
			role = userRole.(string)
		}
	}
	
	userID := ""
	if id, ok := userData["id"]; ok {
		userID = id.(string)
	}
	
	fmt.Println("User validated:", userID, "Role:", role)
	return true, userID, role
}

// matchStaffWithAI uses Gemini AI to find the best staff matches
func matchStaffWithAI(ctx context.Context, managerNeed string, staff []Profile) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	
	if apiKey == "" || len(staff) == 0 {
		return generateSimpleMatch(managerNeed, staff), nil
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return generateSimpleMatch(managerNeed, staff), nil
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")
	
	var staffList strings.Builder
	staffList.WriteString("🔴 IMPORTANT: YOU MUST ONLY USE THESE EXACT STAFF NAMES. DO NOT INVENT OR CREATE ANY STAFF NAMES. 🔴\n\n")
	
	for i, s := range staff {
		availabilityStr := "Not specified"
		if len(s.Availability) > 0 {
			availabilityStr = strings.Join(s.Availability, ", ")
		}
		
		vibeStr := "None"
		if len(s.VibeTags) > 0 {
			vibeStr = strings.Join(s.VibeTags, ", ")
		}
		
		staffList.WriteString(fmt.Sprintf("%d. NAME: %s | ROLE: %s | LOYALTY: %d%% | TAGS: %s | AVAILABLE: %s\n", 
			i+1, s.FullName, s.Role, s.LoyaltyScore, vibeStr, availabilityStr))
	}
	
	prompt := fmt.Sprintf(`REQUIREMENT: "%s"

AVAILABLE STAFF (USE ONLY THESE):
%s

Respond with ONLY staff from the list above. Format:
🎯 BEST MATCH:
• [EXACT NAME FROM LIST] (Role) - Loyalty: X%
Reason: [short reason]

🥈 SECOND BEST:
• [EXACT NAME FROM LIST] (Role) - Loyalty: X%
Reason: [short reason]

🥉 THIRD BEST:
• [EXACT NAME FROM LIST] (Role) - Loyalty: X%
Reason: [short reason]`, managerNeed, staffList.String())

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

// generateSimpleMatch provides fallback matching without AI
func generateSimpleMatch(managerNeed string, staff []Profile) string {
	if len(staff) == 0 {
		return "❌ No staff members found in the database."
	}
	
	recommendation := "🎯 STAFF RECOMMENDATIONS (From Your Real Database):\n\n"
	
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
				score += 30
			}
		}
		
		if strings.Contains(needLower, strings.ToLower(s.Role)) {
			score += 20
		}
		
		score += s.LoyaltyScore / 2
		
		if len(s.Availability) > 0 {
			score += 10
		}
		
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
	
	titles := []string{"🎯 BEST MATCH", "🥈 SECOND BEST", "🥉 THIRD BEST"}
	
	for i := 0; i < maxMatches; i++ {
		s := scored[i].Staff  // FIXED: using s.Staff directly
		availabilityStr := "Flexible"
		if len(s.Availability) > 0 {
			availabilityStr = strings.Join(s.Availability, ", ")
		}
		
		vibeStr := "None"
		if len(s.VibeTags) > 0 {
			vibeStr = strings.Join(s.VibeTags, ", ")
		}
		
		recommendation += fmt.Sprintf("\n%s:\n", titles[i])
		recommendation += fmt.Sprintf("• %s (%s)\n", s.FullName, s.Role)  // FIXED: using s.FullName directly
		recommendation += fmt.Sprintf("  Loyalty Score: %d%%\n", s.LoyaltyScore)  // FIXED: using s.LoyaltyScore directly
		recommendation += fmt.Sprintf("  Available: %s\n", availabilityStr)
		recommendation += fmt.Sprintf("  Vibe Tags: %s\n", vibeStr)
		recommendation += fmt.Sprintf("  Match Score: %d/100\n", scored[i].Score)
		recommendation += "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
	}
	
	return recommendation
}

func main() {
	godotenv.Load()
	
	supabaseURL = os.Getenv("SUPABASE_URL")
	supabaseKey = os.Getenv("SUPABASE_KEY")
	
	if supabaseURL == "" || supabaseKey == "" {
		panic("SUPABASE_URL and SUPABASE_KEY must be set in .env file")
	}
	
	fmt.Println("🚀 Pulse Hospitality API Server Starting...")
	fmt.Println("✅ Supabase Connected")

	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Health Check
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy", "service": "pulse-hospitality-api"})
	})

	// Recruit AI Endpoint
	r.POST("/api/recruit", func(c *gin.Context) {
		var input struct {
			Requirement string `json:"requirement"`
			Role        string `json:"role,omitempty"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		
		data, err := supabaseRequest("GET", "profiles?select=*", nil, "")
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch staff"})
			return
		}
		
		var allStaff []Profile
		json.Unmarshal(data, &allStaff)
		
		var filteredStaff []Profile
		if input.Role != "" {
			for _, s := range allStaff {
				if strings.ToLower(s.Role) == strings.ToLower(input.Role) {
					filteredStaff = append(filteredStaff, s)
				}
			}
		} else {
			filteredStaff = allStaff
		}
		
		ctx := context.Background()
		recommendation, err := matchStaffWithAI(ctx, input.Requirement, filteredStaff)
		if err != nil {
			c.JSON(500, gin.H{"error": "AI matching failed"})
			return
		}
		
		c.JSON(200, gin.H{"recommendation": recommendation})
	})

	// Staff Routes
	staffGroup := r.Group("/api/staff")
	{
		staffGroup.GET("", func(c *gin.Context) {
			authenticated, _, _ := verifyToken(c)
			if !authenticated {
				c.JSON(401, gin.H{"error": "Unauthorized"})
				return
			}
			
			data, err := supabaseRequest("GET", "profiles?select=*", nil, "")
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch staff"})
				return
			}
			
			var staff []Profile
			json.Unmarshal(data, &staff)
			c.JSON(200, staff)
		})

		staffGroup.GET("/:id", func(c *gin.Context) {
			authenticated, _, _ := verifyToken(c)
			if !authenticated {
				c.JSON(401, gin.H{"error": "Unauthorized"})
				return
			}
			
			id := c.Param("id")
			data, err := supabaseRequest("GET", "profiles?select=*&id=eq."+id, nil, "")
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch staff"})
				return
			}
			
			var staff []Profile
			json.Unmarshal(data, &staff)
			if len(staff) == 0 {
				c.JSON(404, gin.H{"error": "Staff not found"})
				return
			}
			c.JSON(200, staff[0])
		})

		staffGroup.GET("/:id/shifts", func(c *gin.Context) {
			authenticated, _, _ := verifyToken(c)
			if !authenticated {
				c.JSON(401, gin.H{"error": "Unauthorized"})
				return
			}
			
			id := c.Param("id")
			data, err := supabaseRequest("GET", "shifts?select=*&staff_id=eq."+id, nil, "")
			if err != nil {
				c.JSON(200, []Shift{})
				return
			}
			
			var shifts []Shift
			json.Unmarshal(data, &shifts)
			c.JSON(200, shifts)
		})

		staffGroup.GET("/:id/notifications", func(c *gin.Context) {
			authenticated, _, _ := verifyToken(c)
			if !authenticated {
				c.JSON(401, gin.H{"error": "Unauthorized"})
				return
			}
			
			id := c.Param("id")
			data, err := supabaseRequest("GET", "notifications?select=*&staff_id=eq."+id, nil, "")
			if err != nil {
				c.JSON(200, []Notification{})
				return
			}
			
			var notifications []Notification
			json.Unmarshal(data, &notifications)
			
			sort.Slice(notifications, func(i, j int) bool {
				return notifications[i].CreatedAt > notifications[j].CreatedAt
			})
			
			c.JSON(200, notifications)
		})

		staffGroup.PATCH("/:id", func(c *gin.Context) {
			authenticated, userID, role := verifyToken(c)
			if !authenticated {
				c.JSON(401, gin.H{"error": "Unauthorized"})
				return
			}
			
			id := c.Param("id")
			
			if role != "admin" && id != userID {
				c.JSON(403, gin.H{"error": "Forbidden"})
				return
			}
			
			var updateData map[string]interface{}
			if err := c.ShouldBindJSON(&updateData); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			
			_, err := supabaseRequest("PATCH", "profiles?id=eq."+id, updateData, "")
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			
			data, _ := supabaseRequest("GET", "profiles?select=*&id=eq."+id, nil, "")
			var updated []Profile
			json.Unmarshal(data, &updated)
			
			c.JSON(200, updated[0])
		})
	}

	// Admin Routes
	adminGroup := r.Group("/api/admin")
	{
		adminGroup.GET("/staff", func(c *gin.Context) {
			authenticated, _, role := verifyToken(c)
			if !authenticated || role != "admin" {
				c.JSON(403, gin.H{"error": "Admin access required"})
				return
			}
			
			data, err := supabaseRequest("GET", "profiles?select=*", nil, "")
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch staff"})
				return
			}
			
			var staff []Profile
			json.Unmarshal(data, &staff)
			c.JSON(200, staff)
		})
		
		adminGroup.PATCH("/staff/:id", func(c *gin.Context) {
			authenticated, _, role := verifyToken(c)
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
			
			_, err := supabaseRequest("PATCH", "profiles?id=eq."+id, updateData, "")
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			
			data, _ := supabaseRequest("GET", "profiles?select=*&id=eq."+id, nil, "")
			var updated []Profile
			json.Unmarshal(data, &updated)
			
			c.JSON(200, updated[0])
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	fmt.Printf("\n✅ Server running on http://localhost:%s\n", port)
	r.Run(":" + port)
}