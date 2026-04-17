package main

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/nedpals/supabase-go"
	"github.com/yourusername/pulse-server/internal/ai"
	"github.com/yourusername/pulse-server/internal/models"
)

func verifyToken(c *gin.Context, sbClient *supabase.Client) (bool, string) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return false, ""
	}
	token := strings.TrimPrefix(authHeader, "Bearer ")
	user, err := sbClient.Auth.User(c.Request.Context(), token)
	if err != nil || user == nil {
		return false, ""
	}
	role := "user"
	if userRole, ok := user.UserMetadata["role"]; ok {
		role = userRole.(string)
	}
	return true, role
}

func isAdmin(c *gin.Context, sbClient *supabase.Client) bool {
	authenticated, role := verifyToken(c, sbClient)
	return authenticated && role == "admin"
}

func main() {
	godotenv.Load()
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	sbClient := supabase.CreateClient(supabaseUrl, supabaseKey)

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		allowedOrigins := []string{
			"http://localhost:3000",
			"https://connections-git-main-koniabdu81-7200s-projects.vercel.app",
			"https://connections-koniabdu81-7200s-projects.vercel.app",
		}
		origin := c.Request.Header.Get("Origin")
		for _, allowed := range allowedOrigins {
			if allowed == origin {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
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

	// --- ROUTES ---
	r.GET("/api/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "healthy"}) })

	r.POST("/api/recruit", func(c *gin.Context) {
		var input struct {
			Requirement string `json:"requirement"`
			Role        string `json:"role,omitempty"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		var allStaff []models.Profile
		sbClient.DB.From("profiles").Select("*").Execute(&allStaff)
		recommendation, _ := ai.MatchStaff(input.Requirement, allStaff)
		c.JSON(200, gin.H{"recommendation": recommendation})
	})

	staffGroup := r.Group("/api/staff")
	{
		staffGroup.GET("", func(c *gin.Context) {
			authenticated, _ := verifyToken(c, sbClient)
			if !authenticated {
				c.JSON(401, gin.H{"error": "Unauthorized"})
				return
			}
			var staff []models.Profile
			sbClient.DB.From("profiles").Select("*").Execute(&staff)
			c.JSON(200, staff)
		})

		staffGroup.PATCH("/:id", func(c *gin.Context) {
			authenticated, role := verifyToken(c, sbClient)
			if !authenticated {
				c.JSON(401, gin.H{"error": "Unauthorized"})
				return
			}

			id := c.Param("id")
			var updateData map[string]interface{}
			c.ShouldBindJSON(&updateData)

			// Security: If not admin, check if they own the profile
			if role != "admin" {
				var profiles []models.Profile
				sbClient.DB.From("profiles").Select("*").Eq("id", id).Execute(&profiles)
				
				authHeader := c.GetHeader("Authorization")
				token := strings.TrimPrefix(authHeader, "Bearer ")
				user, _ := sbClient.Auth.User(c.Request.Context(), token)

				if len(profiles) == 0 || profiles[0].Email != user.Email {
					c.JSON(403, gin.H{"error": "Forbidden: Not your profile"})
					return
				}
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
	if port == "" { port = "8080" }
	r.Run(":" + port)
}