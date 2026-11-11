# SkillBridge — Learn, Build & Connect

> An evolving student-academia-industry ecosystem connecting learning, practical projects, mentorship, and career opportunities.

---

> [!NOTE]
> **Active Development Status:** SkillBridge is currently under active pre-production development. Features, database models, and service interfaces are continually evolving and are not yet production-ready.

---

## Overview & Purpose

SkillBridge is a unified web platform engineered to bridge the critical gap between academic education and real-world industry demands. By uniting three distinct core stakeholders onto one synchronized network, the platform accelerates career readiness:

1. **Students**: Learn in-demand engineering tracks, build verified projects, aggregate live coding statistics (GitHub, LeetCode, CodeChef), and apply directly to industry capstones and internships.
2. **Academia**: Oversee university departments, track student cohort competencies, manage research collaborations, and orchestrate placement drives.
3. **Industry**: Recruit pre-vetted developer talent, manage an end-to-end ATS applicant pipeline, sponsor university capstone fellowships, and conduct campus interviews.

---

## Key Platform Modules

- **Cinematic Public Landing Page (`/`)**: Interactive 3D hero experience, 4 pathways to accelerate forward, 3-track real-time project workbench, unified ecosystem switchboard, and partner trust network.
- **Apple iOS Spotlight Search**: Global keyboard-navigable (`Cmd/Ctrl + K`) search indexing all portals, sections, opportunities, and documentation with multi-word scoring.
- **Student Workspace (`/student`)**:
  - Personal profile & academic standing.
  - Skill verification radar & course planner.
  - Active capstone & open-source projects.
  - Application tracker & interview schedule.
  - Global Certificates Hub & badges.
  - Connected coding accounts synchronizer.
- **Industry Recruiter Hub (`/industry`)**:
  - Job & internship creation workflow.
  - Full-featured ATS candidate pipeline.
  - Talent directory with verified skill filtering.
  - Interview scheduling with calendar links.
  - Direct candidate messaging and event hosting.
- **Academia Institution Portal (`/academia`)**:
  - Institutional profile & accreditation status.
  - Department and faculty directories.
  - Cohort skill tracking and curriculum analytics.
  - Campus placement drives and corporate MoUs.
  - Campus announcements and research grants.

---

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (React 19 App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4 & Custom Design Tokens
- **3D Graphics & Animations**: [Three.js](https://threejs.org/), Custom WebGL Shaders, Canvas Confetti
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend Architecture**: Next.js Route Handlers (50 RESTful endpoints)
- **Runtime Data Store**: In-memory JSON file store (`./.data/demo-db.json`)
- **Database Schema**: [Prisma](https://www.prisma.io/) 7 Schema prepared for PostgreSQL (`prisma/schema.prisma`)
- **Type Safety**: TypeScript 5+ (Strict Mode)

---

## Project Structure

```
academy-industry-portal/
├── prisma/                    # Relational schema (PostgreSQL target)
│   └── schema.prisma
├── public/                    # Static assets, official logos, 3D textures
│   ├── hero/
│   ├── logos/
│   └── pathways/
├── scripts/                   # Data curation & utility helpers
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (public)/          # Landing page, legal, affiliate
│   │   ├── academia/          # Academia portal pages & onboarding
│   │   ├── api/               # 50 RESTful API Route Handlers
│   │   │   ├── academia/
│   │   │   ├── industry/
│   │   │   └── student/
│   │   ├── industry/          # Industry recruiter portal pages
│   │   └── student/           # Student portal pages & dashboard
│   ├── components/            # Reusable UI components & layouts
│   │   ├── academia/
│   │   ├── industry/
│   │   ├── landing/           # Cinematic 3D landing sections
│   │   ├── navigation/        # Search modal, settings panel, header
│   │   └── student/
│   └── lib/                   # Shared client & server modules
│       ├── academia/
│       ├── hooks/
│       ├── industry/
│       ├── server/            # DB controllers, Auth, Service layers
│       └── student/
├── .env.example               # Environment template
├── SKILLBRIDGE_TECHNICAL_AUDIT.md # In-depth technical architecture audit
├── start.sh                   # Startup helper script
└── tunnel.sh                  # Optional Cloudflare tunnel utility
```

---

## Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Git**: Installed locally

---

## Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:<YOUR_USERNAME>/skillbridge.git
   cd skillbridge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env.local
   ```
   *Edit `.env.local` to customize the application port or database connection if needed.*

4. **Start the Development Server:**
   ```bash
   # Using the startup script:
   ./start.sh

   # Or using npm directly:
   npm run dev -- -p 3000
   ```

5. **Access the application:**
   - Landing Page: [http://localhost:3000](http://localhost:3000)
   - Student Portal: [http://localhost:3000/student](http://localhost:3000/student)
   - Industry Portal: [http://localhost:3000/industry](http://localhost:3000/industry)
   - Academia Portal: [http://localhost:3000/academia](http://localhost:3000/academia)

---

## Build & Validation Commands

- **Run Type Check**:
  ```bash
  npx tsc --noEmit
  ```
- **Run Linting**:
  ```bash
  npm run lint
  ```
- **Create Production Build**:
  ```bash
  npm run build
  ```

---

## Ongoing Development Workflow

For day-to-day feature development:

```bash
# 1. Check current workspace status
git status

# 2. Stage your changes
git add .

# 3. Commit with a meaningful message
git commit -m "feat(module): description of changes"

# 4. Push directly to your private repository
git push origin main
```

---

## License & Intellectual Property

Private & Confidential. All rights reserved. SkillBridge ecosystem, branding, and platform architecture are proprietary.
