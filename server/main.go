package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/nedpals/supabase-go"
	"github.com/yourusername/pulse-server/internal/models"
	"github.com/yourusername/pulse-server/internal/ai"
)

func main() {
	// 1. Load the secrets
	err := godotenv.Load()
	if err != nil {
		log.Println("Note: .env file not found, using system env")
	}

	// 2. Setup Supabase
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	sbClient := supabase.CreateClient(supabaseUrl, supabaseKey)

	// 3. Setup the Router
	r := gin.Default()

	// 4. CORS MIDDLEWARE - Allow your Vercel frontend
	r.Use(func(c *gin.Context) {
		// Allow your Vercel frontend URL
		allowedOrigins := []string{
			"http://localhost:3000",                                                    // Local development
			"https://connections-git-main-koniabdu81-7200s-projects.vercel.app",       // Your Vercel app
			"https://connections-koniabdu81-7200s-projects.vercel.app",                // Your Vercel app (main branch)
		}
		
		origin := c.Request.Header.Get("Origin")
		for _, allowedOrigin := range allowedOrigins {
			if allowedOrigin == origin {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}
		
		// If no match, don't set CORS header (or set to * for development)
		if c.Writer.Header().Get("Access-Control-Allow-Origin") == "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}
		
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Accept")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 5. ALL ROUTES
	
	// Health check
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "healthy",
			"message": "Server is running",
		})
	})

	// Test ping
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	// GET all staff
	r.GET("/api/staff", func(c *gin.Context) {
		var staff []models.Profile
		err := sbClient.DB.From("profiles").Select("*").Execute(&staff)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, staff)
	})

	// CREATE new staff
	r.POST("/api/staff", func(c *gin.Context) {
		var newStaffData map[string]interface{}
		if err := c.ShouldBindJSON(&newStaffData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data: " + err.Error()})
			return
		}

		// Set default loyalty if not provided
		if _, ok := newStaffData["loyalty_score"]; !ok {
			newStaffData["loyalty_score"] = 100
		}

		// Insert into Supabase
		var results []map[string]interface{}
		err := sbClient.DB.From("profiles").Insert(newStaffData).Execute(&results)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, results[0])
	})

	// GET waiters only
	r.GET("/api/waiters", func(c *gin.Context) {
		var profiles []models.Profile
		err := sbClient.DB.From("profiles").Select("*").Eq("role", "waiter").Execute(&profiles)
		
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, profiles)
	})

	// AI Recruitment
	r.POST("/api/recruit", func(c *gin.Context) {
		var input struct {
			Requirement string `json:"requirement"`
			Role        string `json:"role,omitempty"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request: " + err.Error()})
			return
		}

		if input.Requirement == "" {
			c.JSON(400, gin.H{"error": "Requirement cannot be empty"})
			return
		}

		// Get ALL staff from database
		var allStaff []models.Profile
		err := sbClient.DB.From("profiles").Select("*").Execute(&allStaff)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch staff: " + err.Error()})
			return
		}

		// Filter by role if specified
		if input.Role != "" && input.Role != "all" {
			filteredStaff := []models.Profile{}
			for _, staff := range allStaff {
				if staff.Role == input.Role {
					filteredStaff = append(filteredStaff, staff)
				}
			}
			allStaff = filteredStaff
			log.Printf("Filtered to role: %s, found %d staff", input.Role, len(allStaff))
		} else {
			log.Printf("No role filter - considering all %d staff members", len(allStaff))
		}

		if len(allStaff) == 0 {
			c.JSON(404, gin.H{"error": fmt.Sprintf("No staff found")})
			return
		}

		// Log all staff being sent to AI
		log.Printf("Sending to AI: %d staff members", len(allStaff))
		for _, s := range allStaff {
			log.Printf("  - %s (%s): %v", s.FullName, s.Role, s.VibeTags)
		}

		recommendation, err := ai.MatchStaff(input.Requirement, allStaff)
		if err != nil {
			log.Printf("AI Error: %v", err)
			c.JSON(500, gin.H{"error": "AI processing failed: " + err.Error()})
			return
		}

		c.JSON(200, gin.H{"recommendation": recommendation})
	})

	// 6. Start the engine
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Println("========================================")
	log.Println("🚀 Server starting on port:", port)
	log.Println("📋 Available endpoints:")
	log.Println("   GET  /api/health")
	log.Println("   GET  /ping")
	log.Println("   GET  /api/staff")
	log.Println("   POST /api/staff")
	log.Println("   GET  /api/waiters")
	log.Println("   POST /api/recruit")
	log.Println("========================================")
	
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}