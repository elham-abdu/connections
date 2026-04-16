Connections AI | AI-Powered Hospitality Staffing
Connections AI is a high-performance, full-stack platform designed for luxury hospitality management. It leverages Artificial Intelligence to match staff members to specific venue requirements based on 'vibe tags,' professional roles, and personality archetypes.
🚀 The Vision
In luxury hospitality, the 'vibe' is as important as the service. Connections AI allows managers to describe an event (e.g., 'A high-energy VIP poolside party') and uses a neural matching engine to suggest the perfect staff members from a private registry.
🛠️ Technical Stack
Frontend
• Next.js 14 (App Router)
• Tailwind CSS (Onyx & Gold Theme)
• Lucide React
• Vercel Deployment
Backend
• Go (Golang)
• Gin Gonic
• Supabase (PostgreSQL)
• JWT Authentication & CORS
• Render Deployment
🧠 Key Features
• AI Recruitment Engine
• Secure Staff Registry
• Responsive Luxury UI
• B2B Decoupled Architecture
⚙️ Installation & Setup
Clone:
 git clone https://github.com/elham-abdu/connections.git
 cd connections

Frontend:
 cd client
 npm install
 npm run dev

Backend:
 cd server
 go run main.go
🔐 Environment Variables
Frontend (.env.local):
 NEXT_PUBLIC_SUPABASE_URL=...
 NEXT_PUBLIC_SUPABASE_ANON_KEY=...

Backend (.env):
 SUPABASE_URL=...
 SUPABASE_KEY=...
 JWT_SECRET=...
📈 Future Roadmap
• Staff Portal
• Availability Calendar
• Messaging
• Notifications
• Analytics Dashboard
👨‍💻 Developer
Elham Abdu
Software Developer | Full-Stack Enthusiast
