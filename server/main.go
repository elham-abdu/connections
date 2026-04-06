package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/nedpals/supabase-go"
	"github.com/yourusername/pulse-server/internal/models"
	"github.com/yourusername/pulse-server/internal/ai"  // This imports recommender.go
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

	// 4. CORS MIDDLEWARE - MUST BE FIRST BEFORE ANY ROUTES
	r.Use(func(c *gin.Context) {
		// Allow all origins for development
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Accept")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		
		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 5. ROUTES (Now protected by CORS)
	
	// Health check route (useful for frontend)
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "healthy",
			"message": "Server is running",
			"endpoints": []string{
				"/ping",
				"/api/waiters",
				"/api/recruit",
			},
		})
	})

	// Test route
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	// Waiters route
	r.GET("/api/waiters", func(c *gin.Context) {
		var profiles []models.Profile

		// Select from Supabase
		err := sbClient.DB.From("profiles").Select("*").Eq("role", "waiter").Execute(&profiles)
		
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, profiles)
	})

	// Recruit route
	r.POST("/api/recruit", func(c *gin.Context) {
		// 1. Get the manager's requirement from the request
		var input struct {
			Requirement string `json:"requirement"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request: " + err.Error()})
			return
		}

		// Validate requirement
		if input.Requirement == "" {
			c.JSON(400, gin.H{"error": "Requirement cannot be empty"})
			return
		}

		// 2. Fetch all waiters from Supabase (to give to the AI)
		var allWaiters []models.Profile
		err := sbClient.DB.From("profiles").Select("*").Eq("role", "waiter").Execute(&allWaiters)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch waiters: " + err.Error()})
			return
		}

		// Check if we have any waiters
		if len(allWaiters) == 0 {
			c.JSON(404, gin.H{"error": "No waiters found in database"})
			return
		}

		log.Printf("Processing request for: %s", input.Requirement)
		log.Printf("Found %d waiters in database", len(allWaiters))

		// 3. Ask Gemini to match them
		recommendation, err := ai.MatchWaiters(input.Requirement, allWaiters)
		if err != nil {
			log.Printf("AI Error: %v", err)
			c.JSON(500, gin.H{"error": "AI processing failed: " + err.Error()})
			return
		}

		c.JSON(200, gin.H{"recommendation": recommendation})
	})

	// 6. Start the engine
	log.Println("========================================")
	log.Println("🚀 Server starting on http://localhost:8080")
	log.Println("🔓 CORS enabled for all origins (development mode)")
	log.Println("📋 Available endpoints:")
	log.Println("   GET  http://localhost:8080/api/health")
	log.Println("   GET  http://localhost:8080/ping")
	log.Println("   GET  http://localhost:8080/api/waiters")
	log.Println("   POST http://localhost:8080/api/recruit")
	log.Println("========================================")
	
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}