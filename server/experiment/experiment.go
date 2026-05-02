package main

import (
	"context"
	"encoding/csv"
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

type SyntheticStaff struct {
	ID           int
	Name         string
	Role         string
	LoyaltyScore int
	VibeTags     []string
	Category     string
}

type TaskScenario struct {
	ID          int
	Name        string
	Category    string
	Requirement string
	Role        string
}

type WeightConfig struct {
	Name    string
	Loyalty float64
	Vibe    float64
}

type ExperimentResult struct {
	ConfigName      string
	TaskID          int
	TaskCategory    string
	StaffID         int
	StaffName       string
	StaffCategory   string
	StaffLoyalty    int
	StaffVibeTags   string
	MatchScore      float64
	GeminiReasoning string
	RoleMatch       bool
}

func generateSyntheticStaff() []SyntheticStaff {
	staff := []SyntheticStaff{}
	id := 1

	veterans := []struct {
		name string
		tags []string
	}{
		{"Arthur_Veteran", []string{"quiet", "serious", "methodical", "punctual"}},
		{"Beatrice_Veteran", []string{"serious", "professional", "efficient", "reserved"}},
		{"Charles_Veteran", []string{"quiet", "reliable", "organized", "calm"}},
		{"Diana_Veteran", []string{"serious", "dependable", "methodical", "focused"}},
		{"Edward_Veteran", []string{"quiet", "punctual", "professional", "reserved"}},
	}
	for _, v := range veterans {
		staff = append(staff, SyntheticStaff{
			ID:           id,
			Name:         v.name,
			Role:         "waiter",
			LoyaltyScore: 90 + rand.Intn(11),
			VibeTags:     v.tags,
			Category:     "veteran",
		})
		id++
	}

	wildcards := []struct {
		name string
		tags []string
	}{
		{"Sasha_Wildcard", []string{"energetic", "funny", "charismatic", "outgoing"}},
		{"Taylor_Wildcard", []string{"energetic", "talkative", "charming", "vibrant"}},
		{"Jordan_Wildcard", []string{"funny", "enthusiastic", "warm", "engaging"}},
		{"Casey_Wildcard", []string{"energetic", "spontaneous", "creative", "friendly"}},
		{"Riley_Wildcard", []string{"funny", "bubbly", "sociable", "lively"}},
	}
	for _, w := range wildcards {
		staff = append(staff, SyntheticStaff{
			ID:           id,
			Name:         w.name,
			Role:         "host",
			LoyaltyScore: 10 + rand.Intn(21),
			VibeTags:     w.tags,
			Category:     "wildcard",
		})
		id++
	}

	specialists := []struct {
		name string
		role string
		tags []string
	}{
		{"Leo_Tech", "bartender", []string{"technical", "focused", "efficient", "precise"}},
		{"Maya_Tech", "housekeeping", []string{"detail-oriented", "thorough", "patient", "methodical"}},
		{"Felix_Tech", "bartender", []string{"creative", "fast", "organized", "skilled"}},
		{"Zoe_Tech", "housekeeping", []string{"efficient", "careful", "reliable", "professional"}},
		{"Oscar_Tech", "waiter", []string{"organized", "fast", "attentive", "professional"}},
	}
	for _, s := range specialists {
		staff = append(staff, SyntheticStaff{
			ID:           id,
			Name:         s.name,
			Role:         s.role,
			LoyaltyScore: 60 + rand.Intn(11),
			VibeTags:     s.tags,
			Category:     "specialist",
		})
		id++
	}

	controls := []struct {
		name string
		tags []string
	}{
		{"Control_Alpha", []string{"neutral", "helpful", "standard", "normal"}},
		{"Control_Beta", []string{"regular", "average", "typical", "ordinary"}},
		{"Control_Gamma", []string{"normal", "standard", "basic", "usual"}},
		{"Control_Delta", []string{"average", "regular", "standard", "neutral"}},
		{"Control_Epsilon", []string{"typical", "normal", "helpful", "regular"}},
	}
	for _, c := range controls {
		staff = append(staff, SyntheticStaff{
			ID:           id,
			Name:         c.name,
			Role:         "waiter",
			LoyaltyScore: 45 + rand.Intn(11),
			VibeTags:     c.tags,
			Category:     "control",
		})
		id++
	}

	return staff
}

func generateTaskScenarios() []TaskScenario {
	return []TaskScenario{
		{ID: 1, Name: "VIP Lounge Host", Category: "customer-facing",
			Requirement: "Need an energetic and charismatic host for exclusive VIP lounge. Must be funny and engaging to make guests feel special.",
			Role: "host"},
		{ID: 2, Name: "Wedding Event Bartender", Category: "customer-facing",
			Requirement: "Looking for a fun, energetic bartender for a high-energy wedding reception. Personality matters more than experience.",
			Role: "bartender"},
		{ID: 3, Name: "Brunch Server", Category: "customer-facing",
			Requirement: "Need a friendly, outgoing server for busy Sunday brunch. Must be warm and engaging with guests.",
			Role: "waiter"},
		{ID: 4, Name: "Night Shift Cleaner", Category: "back-of-house",
			Requirement: "Need reliable person for overnight cleaning shift. Must be punctual and responsible. Attendance is critical.",
			Role: "housekeeping"},
		{ID: 5, Name: "Kitchen Prep Cook", Category: "back-of-house",
			Requirement: "Looking for dependable kitchen prep cook. Must show up on time consistently. Experience with prep work required.",
			Role: "waiter"},
		{ID: 6, Name: "Inventory Manager", Category: "back-of-house",
			Requirement: "Need organized, reliable person to manage inventory. Must be detail-oriented and trustworthy.",
			Role: "waiter"},
		{ID: 7, Name: "Lunch Shift Server", Category: "general",
			Requirement: "Need a reliable server for weekday lunch shifts. Should be friendly but also responsible.",
			Role: "waiter"},
		{ID: 8, Name: "Hotel Front Desk", Category: "general",
			Requirement: "Looking for professional front desk associate. Must be calm under pressure and reliable.",
			Role: "host"},
		{ID: 9, Name: "Room Service Attendant", Category: "general",
			Requirement: "Need dependable attendant for room service. Must be polite and punctual.",
			Role: "waiter"},
		{ID: 10, Name: "Event Setup Crew", Category: "general",
			Requirement: "Looking for team players for event setup. Must be reliable and able to follow instructions.",
			Role: "waiter"},
	}
}

func calculateMatchScore(staff SyntheticStaff, task TaskScenario, config WeightConfig) float64 {
	score := 0.0

	requirementLower := strings.ToLower(task.Requirement)
	matchCount := 0

	for _, tag := range staff.VibeTags {
		if strings.Contains(requirementLower, strings.ToLower(tag)) {
			matchCount++
		}
	}

	maxMatches := len(staff.VibeTags)
	if maxMatches == 0 {
		maxMatches = 1
	}
	vibeScore := float64(matchCount) / float64(maxMatches)

	score += vibeScore * config.Vibe * 100

	roleMatch := strings.EqualFold(staff.Role, task.Role)
	if roleMatch {
		score += 20 * config.Vibe
	}

	loyaltyScore := float64(staff.LoyaltyScore) / 100.0
	score += loyaltyScore * config.Loyalty * 100

	return score
}

func matchWithGemini(ctx context.Context, staff SyntheticStaff, task TaskScenario, config WeightConfig) (float64, string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return calculateMatchScore(staff, task, config), "No Gemini API key - using mathematical scoring", nil
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return calculateMatchScore(staff, task, config), fmt.Sprintf("Gemini error: %v", err), nil
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")

	prompt := fmt.Sprintf(`You are evaluating a staff member for a hospitality job.

TASK REQUIREMENT: "%s"

STAFF MEMBER:
- Name: %s
- Role: %s
- Loyalty Score: %d/100
- Vibe Tags: %s

MATHEMATICAL WEIGHTS (Priority):
- Vibe Tags importance: %.0f%%
- Loyalty importance: %.0f%%

Evaluate how well this staff member fits the requirement.
Consider: Role match, vibe tags match, and loyalty score.

Respond in this exact format:
SCORE: [number 0-100]
REASON: [one sentence explanation]`,
		task.Requirement, staff.Name, staff.Role, staff.LoyaltyScore,
		strings.Join(staff.VibeTags, ", "), config.Vibe*100, config.Loyalty*100)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return calculateMatchScore(staff, task, config), fmt.Sprintf("Gemini error: %v", err), nil
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return calculateMatchScore(staff, task, config), "No response from Gemini", nil
	}

	responseText := ""
	if txt, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
		responseText = string(txt)
	}

	var score float64 = 50
	lines := strings.Split(responseText, "\n")
	for _, line := range lines {
		if strings.Contains(line, "SCORE:") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				scoreStr := strings.TrimSpace(parts[1])
				scoreStr = strings.TrimSuffix(scoreStr, "%")
				if s, err := strconv.ParseFloat(scoreStr, 64); err == nil {
					score = s
				}
			}
		}
	}

	return score, responseText, nil
}

func runExperiment(configs []WeightConfig, tasks []TaskScenario, staff []SyntheticStaff) []ExperimentResult {
	var results []ExperimentResult

	for _, config := range configs {
		fmt.Printf("\n📊 Testing Configuration: %s (Loyalty=%.1f, Vibe=%.1f)\n",
			config.Name, config.Loyalty, config.Vibe)

		for _, task := range tasks {
			type staffScore struct {
				staff    SyntheticStaff
				score    float64
				reason   string
				roleMatch bool
			}
			var candidates []staffScore

			for _, s := range staff {
				ctx := context.Background()
				score, reason, err := matchWithGemini(ctx, s, task, config)
				if err != nil {
					score = calculateMatchScore(s, task, config)
					reason = "Fallback to mathematical scoring"
				}

				roleMatch := strings.EqualFold(s.Role, task.Role)
				candidates = append(candidates, staffScore{
					staff:     s,
					score:     score,
					reason:    reason,
					roleMatch: roleMatch,
				})
			}

			for i := 0; i < len(candidates)-1; i++ {
				for j := i + 1; j < len(candidates); j++ {
					if candidates[j].score > candidates[i].score {
						candidates[i], candidates[j] = candidates[j], candidates[i]
					}
				}
			}

			if len(candidates) > 0 {
				best := candidates[0]
				result := ExperimentResult{
					ConfigName:      config.Name,
					TaskID:          task.ID,
					TaskCategory:    task.Category,
					StaffID:         best.staff.ID,
					StaffName:       best.staff.Name,
					StaffCategory:   best.staff.Category,
					StaffLoyalty:    best.staff.LoyaltyScore,
					StaffVibeTags:   strings.Join(best.staff.VibeTags, ", "),
					MatchScore:      best.score,
					GeminiReasoning: best.reason,
					RoleMatch:       best.roleMatch,
				}
				results = append(results, result)
				fmt.Printf("  ├─ Task %d (%s): Best = %s (Score: %.1f) from %s group\n",
					task.ID, task.Name, best.staff.Name, best.score, best.staff.Category)
			}
		}
	}

	return results
}

func analyzeResults(results []ExperimentResult, configs []WeightConfig) {
	fmt.Println("\n" + strings.Repeat("=", 80))
	fmt.Println("📊 RESEARCH FINDINGS - WEIGHT SENSITIVITY ANALYSIS")
	fmt.Println(strings.Repeat("=", 80))

	for _, config := range configs {
		fmt.Printf("\n🔬 CONFIGURATION: %s (Loyalty=%.1f, Vibe=%.1f)\n",
			config.Name, config.Loyalty, config.Vibe)

		var customerScores []float64
		var backScores []float64
		var generalScores []float64

		veteranPicks := 0
		wildcardPicks := 0
		specialistPicks := 0
		controlPicks := 0

		for _, r := range results {
			if r.ConfigName != config.Name {
				continue
			}

			switch r.StaffCategory {
			case "veteran":
				veteranPicks++
			case "wildcard":
				wildcardPicks++
			case "specialist":
				specialistPicks++
			case "control":
				controlPicks++
			}

			switch r.TaskCategory {
			case "customer-facing":
				customerScores = append(customerScores, r.MatchScore)
			case "back-of-house":
				backScores = append(backScores, r.MatchScore)
			case "general":
				generalScores = append(generalScores, r.MatchScore)
			}
		}

		avgCustomer := average(customerScores)
		avgBack := average(backScores)
		avgGeneral := average(generalScores)

		fmt.Printf("   ├─ Customer-Facing Tasks (Vibe-Priority): Avg Score = %.1f\n", avgCustomer)
		fmt.Printf("   ├─ Back-of-House Tasks (Loyalty-Priority): Avg Score = %.1f\n", avgBack)
		fmt.Printf("   ├─ General Tasks (Balanced): Avg Score = %.1f\n", avgGeneral)
		fmt.Printf("   └─ Staff Selection Breakdown: Veterans=%d, Wildcards=%d, Specialists=%d, Control=%d\n",
			veteranPicks, wildcardPicks, specialistPicks, controlPicks)
	}

	fmt.Println("\n" + strings.Repeat("=", 80))
	fmt.Println("🎯 RESEARCH CONCLUSIONS")
	fmt.Println(strings.Repeat("=", 80))
	fmt.Println(`
HYPOTHESIS TESTING RESULTS:

H1 (Vibe-weight > 0.6 improves customer-facing matches):
- Compare Config B (Vibe=0.7) vs Config C (Balanced)
- If Config B scores higher for customer-facing tasks → H1 SUPPORTED

H2 (Loyalty-weight > 0.6 improves back-of-house matches):
- Compare Config A (Loyalty=0.7) vs Config C (Balanced)
- If Config A scores higher for back-of-house tasks → H2 SUPPORTED

OPTIMAL CONFIGURATION:
- For VIP/Event staffing: [Config with highest vibe weight]
- For Night/Cleaning shifts: [Config with highest loyalty weight]
- For General staffing: [Config with best average across all categories]
`)
}

func average(scores []float64) float64 {
	if len(scores) == 0 {
		return 0
	}
	sum := 0.0
	for _, s := range scores {
		sum += s
	}
	return sum / float64(len(scores))
}

func exportToCSV(results []ExperimentResult, filename string) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	headers := []string{
		"ConfigName", "TaskID", "TaskCategory", "StaffID", "StaffName",
		"StaffCategory", "StaffLoyalty", "StaffVibeTags", "MatchScore",
		"RoleMatch", "GeminiReasoning",
	}
	writer.Write(headers)

	for _, r := range results {
		row := []string{
			r.ConfigName,
			strconv.Itoa(r.TaskID),
			r.TaskCategory,
			strconv.Itoa(r.StaffID),
			r.StaffName,
			r.StaffCategory,
			strconv.Itoa(r.StaffLoyalty),
			r.StaffVibeTags,
			fmt.Sprintf("%.2f", r.MatchScore),
			strconv.FormatBool(r.RoleMatch),
			r.GeminiReasoning,
		}
		writer.Write(row)
	}

	fmt.Printf("\n📁 Results exported to: %s\n", filename)
	return nil
}

func countByCategory(staff []SyntheticStaff, category string) int {
	count := 0
	for _, s := range staff {
		if s.Category == category {
			count++
		}
	}
	return count
}

func countByTaskCategory(tasks []TaskScenario, category string) int {
	count := 0
	for _, t := range tasks {
		if t.Category == category {
			count++
		}
	}
	return count
}

func main() {
	godotenv.Load()

	rand.Seed(42)

	fmt.Println(strings.Repeat("=", 80))
	fmt.Println("🧪 PULSE HOSPITALITY - RESEARCH EXPERIMENT FRAMEWORK")
	fmt.Println(strings.Repeat("=", 80))
	fmt.Println("\n📋 EXPERIMENT DESIGN:")
	fmt.Println("   ├─ Independent Variable: Weight configurations (Loyalty vs Vibe)")
	fmt.Println("   ├─ Dependent Variable: Match Score (0-100)")
	fmt.Println("   ├─ Control: Same staff pool, same tasks, same AI model")
	fmt.Println("   └─ Sample Size: 4 configs × 10 tasks × 20 staff = 800 evaluations")

	configs := []WeightConfig{
		{Name: "Loyalty-Focused", Loyalty: 0.7, Vibe: 0.3},
		{Name: "Vibe-Focused", Loyalty: 0.3, Vibe: 0.7},
		{Name: "Balanced", Loyalty: 0.5, Vibe: 0.5},
		{Name: "Extreme-Loyalty", Loyalty: 0.9, Vibe: 0.1},
	}

	fmt.Println("\n🔬 GENERATING SYNTHETIC DATA:")
	fmt.Println("   ├─ Creating 20 fake staff members with intentional biases...")
	staff := generateSyntheticStaff()
	fmt.Printf("   │  ├─ Veterans (High Loyalty, Low Vibe): %d\n", countByCategory(staff, "veteran"))
	fmt.Printf("   │  ├─ Wildcards (Low Loyalty, High Vibe): %d\n", countByCategory(staff, "wildcard"))
	fmt.Printf("   │  ├─ Specialists (Niche Skills): %d\n", countByCategory(staff, "specialist"))
	fmt.Printf("   │  └─ Control Group (Average): %d\n", countByCategory(staff, "control"))

	fmt.Println("   ├─ Creating 10 task scenarios...")
	tasks := generateTaskScenarios()
	fmt.Printf("   │  ├─ Customer-Facing: %d\n", countByTaskCategory(tasks, "customer-facing"))
	fmt.Printf("   │  ├─ Back-of-House: %d\n", countByTaskCategory(tasks, "back-of-house"))
	fmt.Printf("   │  └─ General: %d\n", countByTaskCategory(tasks, "general"))

	fmt.Println("\n⚙️ RUNNING EXPERIMENT...")
	fmt.Println("   (This may take 1-2 minutes depending on API speed)")

	results := runExperiment(configs, tasks, staff)

	analyzeResults(results, configs)

	err := exportToCSV(results, "experiment_results.csv")
	if err != nil {
		fmt.Printf("❌ Error exporting CSV: %v\n", err)
	} else {
		fmt.Println("\n✅ Experiment complete! Check experiment_results.csv for raw data.")
	}

	fmt.Println("\n" + strings.Repeat("=", 80))
	fmt.Println("📝 NEXT STEPS FOR RESEARCH PAPER:")
	fmt.Println("   1. Import experiment_results.csv into Excel/Google Sheets")
	fmt.Println("   2. Create charts showing weight sensitivity")
	fmt.Println("   3. Document which config performed best for each scenario type")
	fmt.Println("   4. Use findings to support your scholarship application")
	fmt.Println(strings.Repeat("=", 80))
}