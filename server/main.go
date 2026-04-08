package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/nedpals/supabase-go"
	"github.com/yourusername/pulse-server/internal/ai"
	"github.com/yourusername/pulse-server/internal/models"
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

	// 4. CORS MIDDLEWARE
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
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

	// Health Check
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy"})
	})

	// --- STAFF ROUTES ---

	// GET all staff members
	r.GET("/api/staff", func(c *gin.Context) {
		var staff []models.Profile
		err := sbClient.DB.From("profiles").Select("*").Execute(&staff)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, staff)
	})

	// POST create new staff (Hiring)
	r.POST("/api/staff", func(c *gin.Context) {
		var newStaffData map[string]interface{}
		if err := c.ShouldBindJSON(&newStaffData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
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

	// --- RECRUITMENT & SHIFTS ---

	// POST AI Recruitment
	r.POST("/api/recruit", func(c *gin.Context) {
		var input struct {
			Requirement string `json:"requirement"`
			Role        string `json:"role,omitempty"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request"})
			return
		}

		var allStaff []models.Profile
		err := sbClient.DB.From("profiles").Select("*").Execute(&allStaff)
		if err != nil {
			c.JSON(500, gin.H{"error": "Database error"})
			return
		}

		// Filter by role if requested
		if input.Role != "" && input.Role != "all" {
			var filtered []models.Profile
			for _, s := range allStaff {
				if s.Role == input.Role {
					filtered = append(filtered, s)
				}
			}
			allStaff = filtered
		}

		recommendation, err := ai.MatchStaff(input.Requirement, allStaff)
		if err != nil {
			c.JSON(500, gin.H{"error": "AI failed"})
			return
		}
		c.JSON(200, gin.H{"recommendation": recommendation})
	})

	// POST Book a Shift (Assigning Staff)
	r.POST("/api/shifts", func(c *gin.Context) {
		var shiftData map[string]interface{}
		if err := c.ShouldBindJSON(&shiftData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shift data"})
			return
		}

		// Ensure default status
		if _, ok := shiftData["status"]; !ok {
			shiftData["status"] = "scheduled"
		}

		var results []map[string]interface{}
		err := sbClient.DB.From("shifts").Insert(shiftData).Execute(&results)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to book: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, results[0])
	})

	// GET all shifts (For the dashboard)
	r.GET("/api/shifts", func(c *gin.Context) {
		var shifts []map[string]interface{}
		err := sbClient.DB.From("shifts").Select("*").Execute(&shifts)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, shifts)
	})

	// 6. Start the engine
	log.Printf("🚀 Pulse Staffing Server running on http://localhost:8080")
	r.Run(":8080")
}