# Pulse Hospitality Intelligence System – Academic Research Overview


##  Research Problem Statement

Optimization Challenge: How can we model and solve the multi-variable staffing assignment problem in service industries where success depends on both quantifiable metrics (availability, experience) and **qualitative attributes** (personality traits, soft skills)?

Key Research Questions:
1. How can heuristic weighting between subjective (vibe tags) and objective (loyalty scores) variables be optimized for staff-task matching?
2. What is the optimal weighting mechanism for constraint-satisfaction in shift scheduling?
3. How does real-time performance feedback affect heuristic weighting accuracy?

## System Architecture & Optimization Engine

### 1. Heuristic Constraint-Satisfaction Engine

The core matching algorithm solves a multi-variable assignment problem:

| Variable | Type | Weight | Constraint |
|----------|------|--------|------------|
| Role match | Categorical | 20% | Exact or fuzzy match |
| Vibe Tags | Qualitative | 30% | NLP semantic similarity |
| Loyalty Score | Quantitative | Up to 50% | 0-100 scale |
| Availability | Binary | 10% | Temporal constraints |

Matching Formula:

MatchScore = Σ(Role Match × 0.20) + Σ(VibeTags × 0.30) + (LoyaltyScore × 0.50) + (Availability × 0.10)

### 2. AI Integration Layer

- Uses Google's Gemini 1.5 Flash LLM for semantic vibe tag matching
- Fallback deterministic algorithm when AI unavailable
- Response validation ensures output integrity

### 3. Concurrent Systems Architecture
Frontend (Next.js) → Go Backend (Gin) → PostgreSQL (Supabase)
                                    ↓
                         Gemini API (Rate-limited)


Why Go?
- Handles high-concurrency scheduling requests
- Low-latency communication between LLM and database layer
- Native goroutines for parallel constraint evaluation

## Technical Implementation

### Backend (Go/Gin)
- RESTful API with JWT authentication
- Concurrent request handling for batch operations
- Supabase client with custom HTTP wrapper

### Frontend (Next.js 16)
- Server-side rendering for staff portal
- Real-time availability updates
- Role-based route protection

### Database Schema (PostgreSQL)
sql
profiles: id, full_name, role, loyalty_score, vibe_tags[], availability[]
shifts: id, staff_id, date, start_time, end_time, status
notifications: id, staff_id, title, message, created_at

## Research Contributions

### Current Implementation:
1. Novel weighting system for subjective vs. objective variables
2. Hybrid matching architecture (AI + deterministic fallback)
3. Real-time constraint satisfaction with 10-second resolution

### Validation Metrics:
- Match accuracy: Qualitative review of AI recommendations
- Latency: <500ms for constraint evaluation on 100+ staff
- Concurrency: Handle 1000 simultaneous schedule requests

##  Future Research Directions

### Phase 2: Algorithm Optimization (6 months)

 Question and Approach 
What is the optimal heuristic weighting for vibe tags vs. loyalty scores? testing with simulated staffing scenarios
Can reinforcement learning improve match accuracy over time?  Implement RL feedback loop based on assignment success 

### Phase 3: Distributed Systems (12 months)

  Question and Approach 
How does the system scale to multi-property deployments? Implement distributed consensus for cross-property staff sharing 
What is the latency impact of LLM integration at production scale? Benchmark Gemini API vs. local NLP models 

### Phase 4: Human-in-the-Loop (18 months)

 Question and Approach 
How does real-time feedback from managers affect heuristic weights? User study with 50 hospitality managers |
Can the system learn optimal weights through Bayesian optimization? Implement adaptive weight adjustment based on successful assignments 


##  Technical Challenges Solved

1. LLM Response Validation: Verifying Gemini doesn't hallucinate staff names
2. Concurrent Token Verification: Multiple GoTrueClient instances in React Strict Mode
3. PostgreSQL Array Type Handling: Type conversion for vibe_tags and availability
4. Row-Level Security (RLS): Policy configuration for profile access control


##  Technology Stack Justification

Backend : Go (Golang) | High-concurrency scheduling, goroutine parallelism 
Frontend : Next.js | SSR for performance, React for reactive UI 
Database : PostgreSQL (Supabase) | ACID compliance, array type support for tags
AI : Gemini 1.5 Flash | Semantic similarity for qualitative attribute matching
Auth : JWT + Supabase | Stateless, scalable authentication


##  Research Alignment

This project aligns with:

- Systems Research: Concurrent constraint satisfaction
- AI/ML Research: Heuristic weighting optimization, LLM for qualitative matching
- HCI Research: Real-time feedback loops, role-based interfaces


## Conclusion

Pulse Hospitality Intelligence System demonstrates:
1. A novel heuristic weighting mechanism for mixed-variable assignment
2. Production-scale concurrent systems in Go
3. LLM integration with validation for constrained outputs
4. Real-time constraint satisfaction for scheduling problems


## 📧Contact
- 
