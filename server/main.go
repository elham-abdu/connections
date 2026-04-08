package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/nedpals/supabase-go"
	"github.com/yourusername/pulse-server/internal/models"
	"github.com/yourusername/pulse-server/internal/ai"
)

// Helper function to verify JWT token from Supabase
func verifyToken(c *gin.Context, sbClient *supabase.Client) (bool, string) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return false, ""
	}
	
	// Extract Bearer token
	token := strings.TrimPrefix(authHeader, "Bearer ")
	if token == authHeader {
		return false, "" // No Bearer prefix
	}
	
	// Verify token with Supabase
	user, err := sbClient.Auth.User(c.Request.Context(), token)
	if err != nil || user == nil {
		return false, ""
	}
	
	// Get user role from user metadata or custom claims
	role := "user"
	if userRole, ok := user.UserMetadata["role"]; ok {
		role = userRole.(string)
	}
	
	return true, role
}

// Helper to check if user is admin
func isAdmin(c *gin.Context, sbClient *supabase.Client) bool {
	authenticated, role := verifyToken(c, sbClient)
	return authenticated && role == "admin"
}

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

	// 4. CORS MIDDLEWARE
	r.Use(func(c *gin.Context) {
		allowedOrigins := []string{
			"http://localhost:3000",
			"https://connections-git-main-koniabdu81-7200s-projects.vercel.app",
			"https://connections-koniabdu81-7200s-projects.vercel.app",
		}
		
		origin := c.Request.Header.Get("Origin")
		for _, allowedOrigin := range allowedOrigins {
			if allowedOrigin == origin {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}
		
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
	
	// Public routes (no auth required)
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy", "message": "Server is running"})
	})

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	// Public AI recruitment (anyone can use)
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

		var allStaff []models.Profile
		err := sbClient.DB.From("profiles").Select("*").Execute(&allStaff)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch staff: " + err.Error()})
			return
		}

		if input.Role != "" && input.Role != "all" {
			filteredStaff := []models.Profile{}
			for _, staff := range allStaff {
				if staff.Role == input.Role {
					filteredStaff = append(filteredStaff, staff)
				}
			}
			allStaff = filteredStaff
		}

		if len(allStaff) == 0 {
			c.JSON(404, gin.H{"error": "No staff found"})
			return
		}

		log.Printf("Processing request for: %s", input.Requirement)
		log.Printf("Found %d staff members to consider", len(allStaff))

		recommendation, err := ai.MatchStaff(input.Requirement, allStaff)
		if err != nil {
			log.Printf("AI Error: %v", err)
			c.JSON(500, gin.H{"error": "AI processing failed: " + err.Error()})
			return
		}

		c.JSON(200, gin.H{"recommendation": recommendation})
	})

	// Protected routes (require authentication)
	
	// GET all staff (requires auth)
	r.GET("/api/staff", func(c *gin.Context) {
		authenticated, _ := verifyToken(c, sbClient)
		if !authenticated {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}
		
		var staff []models.Profile
		err := sbClient.DB.From("profiles").Select("*").Execute(&staff)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, staff)
	})

	// CREATE new staff (requires admin)
	r.POST("/api/staff", func(c *gin.Context) {
		if !isAdmin(c, sbClient) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			return
		}
		
		var newStaffData map[string]interface{}
		if err := c.ShouldBindJSON(&newStaffData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data: " + err.Error()})
			return
		}

		if _, ok := newStaffData["loyalty_score"]; !ok {
			newStaffData["loyalty_score"] = 100
		}

		var results []map[string]interface{}
		err := sbClient.DB.From("profiles").Insert(newStaffData).Execute(&results)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, results[0])
	})

	// DELETE staff member (requires admin)
	r.DELETE("/api/staff/:id", func(c *gin.Context) {
		if !isAdmin(c, sbClient) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			return
		}
		
		id := c.Param("id")
		err := sbClient.DB.From("profiles").Delete().Eq("id", id).Execute(nil)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Staff member removed successfully"})
	})

	// GET waiters only (requires auth)
	r.GET("/api/waiters", func(c *gin.Context) {
		authenticated, _ := verifyToken(c, sbClient)
		if !authenticated {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}
		
		var profiles []models.Profile
		err := sbClient.DB.From("profiles").Select("*").Eq("role", "waiter").Execute(&profiles)
		
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, profiles)
	})

	// 6. Start the engine
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Println("========================================")
	log.Println("🚀 Server starting on port:", port)
	log.Println("📋 Available endpoints:")
	log.Println("   Public:")
	log.Println("     GET  /api/health")
	log.Println("     GET  /ping")
	log.Println("     POST /api/recruit")
	log.Println("   Protected (Auth required):")
	log.Println("     GET  /api/staff")
	log.Println("     GET  /api/waiters")
	log.Println("   Admin only:")
	log.Println("     POST /api/staff")
	log.Println("     DELETE /api/staff/:id")
	log.Println("========================================")
	
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}