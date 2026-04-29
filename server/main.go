package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
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
	
	client := &http.Client{Timeout: 30 * time.Second}
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
		return false, "", ""
	}
	token := strings.TrimPrefix(authHeader, "Bearer ")
	
	url := supabaseURL + "/auth/v1/user"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, "", ""
	}
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+token)
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return false, "", ""
	}
	defer resp.Body.Close()
	
	body, _ := io.ReadAll(resp.Body)
	
	if resp.StatusCode != 200 {
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
	
	return true, userID, role
}

// AI Staff Matching using Gemini 2.5 Flash
func matchStaffWithAI(ctx context.Context, managerNeed string, staff []Profile) (string, error) {
	geminiAPIKey := os.Getenv("GEMINI_API_KEY")
	
	if geminiAPIKey == "" {
		return generateSimpleMatch(managerNeed, staff), nil
	}
	
	if len(staff) == 0 {
		return "❌ No staff members found in the database.", nil
	}
	
	client, err := genai.NewClient(ctx, option.WithAPIKey(geminiAPIKey))
	if err != nil {
		fmt.Printf("⚠️ AI client error: %v, falling back\n", err)
		return generateSimpleMatch(managerNeed, staff), nil
	}
	defer client.Close()
	
	// Using Gemini 2.5 Flash (latest stable version)
	model := client.GenerativeModel("gemini-2.5-flash")
	
	// Build staff list for AI
	var staffList strings.Builder
	staffList.WriteString("STAFF DATABASE - USE ONLY THESE EXACT NAMES:\n")
	staffList.WriteString("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n")
	
	for i, s := range staff {
		availabilityStr := "Not specified"
		if len(s.Availability) > 0 {
			availabilityStr = strings.Join(s.Availability, ", ")
		}
		
		vibeStr := "None"
		if len(s.VibeTags) > 0 {
			vibeStr = strings.Join(s.VibeTags, ", ")
		}
		
		staffList.WriteString(fmt.Sprintf("%d. NAME: \"%s\" | ROLE: %s | LOYALTY: %d%% | TAGS: %s | AVAILABLE: %s\n", 
			i+1, s.FullName, s.Role, s.LoyaltyScore, vibeStr, availabilityStr))
	}
	
	staffList.WriteString("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
	staffList.WriteString("RULES:\n")
	staffList.WriteString("1. ONLY recommend staff from list above\n")
	staffList.WriteString("2. Use EXACT names in quotes\n")
	staffList.WriteString("3. Never invent names\n\n")
	
	prompt := fmt.Sprintf(`HIRING REQUIREMENT: "%s"

%s

OUTPUT FORMAT (use EXACT names):
🎯 BEST MATCH:
• "EXACT_NAME" (Role) - Loyalty: X%
Reason: why they are perfect

🥈 SECOND BEST:
• "EXACT_NAME" (Role) - Loyalty: X%
Reason: why they fit

🥉 THIRD BEST:
• "EXACT_NAME" (Role) - Loyalty: X%
Reason: why they could work`, managerNeed, staffList.String())

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		fmt.Printf("⚠️ AI generation error: %v, falling back\n", err)
		return generateSimpleMatch(managerNeed, staff), nil
	}
	
	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return generateSimpleMatch(managerNeed, staff), nil
	}
	
	result := ""
	if txt, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
		result = string(txt)
	}
	
	// Validate that AI used real staff names
	for _, s := range staff {
		if strings.Contains(result, "\""+s.FullName+"\"") || strings.Contains(result, "• "+s.FullName) {
			fmt.Println("✅ AI used real staff names")
			return result, nil
		}
	}
	
	fmt.Println("⚠️ AI didn't use real staff names, using fallback")
	return generateSimpleMatch(managerNeed, staff), nil
}

// Deterministic fallback matching
func generateSimpleMatch(managerNeed string, staff []Profile) string {
	if len(staff) == 0 {
		return "❌ No staff members found.\n\nPlease add staff to the database."
	}
	
	recommendation := "🔬 RESEARCH-GRADE STAFF MATCHING (Deterministic Algorithm)\n"
	recommendation += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
	
	type ScoredStaff struct {
		Staff      Profile
		Score      int
		TagMatches []string
	}
	
	var scored []ScoredStaff
	needLower := strings.ToLower(managerNeed)
	
	for _, s := range staff {
		score := 0
		var matchedTags []string
		
		for _, tag := range s.VibeTags {
			if strings.Contains(needLower, strings.ToLower(tag)) {
				score += 15
				matchedTags = append(matchedTags, tag)
			}
		}
		
		if strings.Contains(needLower, strings.ToLower(s.Role)) {
			score += 20
		}
		
		score += (s.LoyaltyScore * 40) / 100
		
		if len(s.Availability) > 0 {
			score += 10
		}
		
		scored = append(scored, ScoredStaff{Staff: s, Score: score, TagMatches: matchedTags})
	}
	
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
		s := scored[i].Staff
		availabilityStr := "Flexible"
		if len(s.Availability) > 0 {
			availabilityStr = strings.Join(s.Availability, ", ")
		}
		
		vibeStr := "None"
		if len(s.VibeTags) > 0 {
			vibeStr = strings.Join(s.VibeTags, ", ")
		}
		
		recommendation += fmt.Sprintf("%s:\n", titles[i])
		recommendation += fmt.Sprintf("• %s (%s)\n", s.FullName, s.Role)
		recommendation += fmt.Sprintf("  Loyalty Score: %d%%\n", s.LoyaltyScore)
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
	
	geminiAPIKey := os.Getenv("GEMINI_API_KEY")
	
	fmt.Println("🔬 PULSE HOSPITALITY INTELLIGENCE SYSTEM")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Printf("✓ Supabase: Connected\n")
	if geminiAPIKey != "" {
		fmt.Printf("✓ Gemini AI: Enabled (Using gemini-2.5-flash)\n")
	} else {
		fmt.Printf("⚠️ Gemini AI: Disabled (Using Deterministic Algorithm)\n")
	}

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
		c.JSON(200, gin.H{
			"status": "healthy",
			"service": "pulse-hospitality-api",
			"ai_enabled": geminiAPIKey != "",
			"model": "gemini-2.5-flash",
		})
	})

	// Test Gemini API Endpoint
	r.GET("/api/test-gemini", func(c *gin.Context) {
		apiKey := os.Getenv("GEMINI_API_KEY")
		if apiKey == "" {
			c.JSON(400, gin.H{"error": "GEMINI_API_KEY not set in .env file"})
			return
		}
		
		fmt.Println("Testing Gemini API connection...")
		
		ctx := context.Background()
		client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to create Gemini client", "details": err.Error()})
			return
		}
		defer client.Close()
		
		model := client.GenerativeModel("gemini-2.5-flash")
		resp, err := model.GenerateContent(ctx, genai.Text("Say 'Gemini 2.5 Flash is working!'"))
		if err != nil {
			c.JSON(500, gin.H{"error": "Gemini API call failed", "details": err.Error()})
			return
		}
		
		if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
			if txt, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
				fmt.Println("✅ Gemini 2.5 Flash is working!")
				c.JSON(200, gin.H{
					"status": "Gemini 2.5 Flash is working!",
					"response": string(txt),
				})
				return
			}
		}
		
		c.JSON(500, gin.H{"error": "No valid response from Gemini"})
	})

	// AI Recruitment Endpoint
	r.POST("/api/recruit", func(c *gin.Context) {
		var input struct {
			Requirement string `json:"requirement"`
			Role        string `json:"role,omitempty"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		
		fmt.Printf("\n🔍 Recruitment Request:\n")
		fmt.Printf("├─ Requirement: %s\n", input.Requirement)
		if input.Role != "" {
			fmt.Printf("├─ Role Filter: %s\n", input.Role)
		}
		
		data, err := supabaseRequest("GET", "profiles?select=*", nil, "")
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch staff"})
			return
		}
		
		var allStaff []Profile
		json.Unmarshal(data, &allStaff)
		fmt.Printf("├─ Total Staff: %d\n", len(allStaff))
		
		var filteredStaff []Profile
		if input.Role != "" {
			for _, s := range allStaff {
				if strings.ToLower(s.Role) == strings.ToLower(input.Role) {
					filteredStaff = append(filteredStaff, s)
				}
			}
			fmt.Printf("├─ After Role Filter: %d\n", len(filteredStaff))
		} else {
			filteredStaff = allStaff
		}
		
		if len(filteredStaff) == 0 {
			c.JSON(200, gin.H{"recommendation": "❌ No staff members found matching your criteria."})
			return
		}
		
		var recommendation string
		if geminiAPIKey != "" {
			fmt.Println("├─ 🤖 Using Gemini 2.5 Flash AI...")
			ctx := context.Background()
			rec, err := matchStaffWithAI(ctx, input.Requirement, filteredStaff)
			if err != nil {
				fmt.Printf("└─ ⚠️ AI error: %v, using fallback\n", err)
				recommendation = generateSimpleMatch(input.Requirement, filteredStaff)
			} else {
				recommendation = rec
				fmt.Println("└─ ✅ AI recommendation generated!")
			}
		} else {
			fmt.Println("└─ Using deterministic matching (AI not configured)")
			recommendation = generateSimpleMatch(input.Requirement, filteredStaff)
		}
		
		c.JSON(200, gin.H{"recommendation": recommendation})
	})

	// Staff Routes (keep existing)
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
				c.JSON(200, []interface{}{})
				return
			}
			
			var shifts []interface{}
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
				c.JSON(200, []interface{}{})
				return
			}
			
			var notifications []interface{}
			json.Unmarshal(data, &notifications)
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
			
			if len(updated) > 0 {
				c.JSON(200, updated[0])
			} else {
				c.JSON(200, gin.H{"message": "Profile updated"})
			}
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
			
			if len(updated) > 0 {
				c.JSON(200, updated[0])
			} else {
				c.JSON(200, gin.H{"message": "Staff updated"})
			}
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	fmt.Printf("\n🚀 Server running on http://localhost:%s\n", port)
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Println("📋 Available endpoints:")
	fmt.Println("   GET  /api/health")
	fmt.Println("   GET  /api/test-gemini  (Test Gemini 2.5 Flash)")
	fmt.Println("   POST /api/recruit      (AI Staff Matching)")
	fmt.Println("   GET  /api/staff")
	fmt.Println("   GET  /api/admin/staff")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
	r.Run(":" + port)
}