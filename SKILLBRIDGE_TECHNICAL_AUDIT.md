# SkillBridge — Complete Technical & Architecture Audit

**Document Version:** 1.0.0  
**Audit Date:** November 11, 2026  
**Status:** Work-in-Progress / Active Pre-Production Development  
**Repository Working Directory:** `/Users/jains/.gemini/antigravity/scratch/academy-industry-portal`  
**Primary Target Remote:** Private GitHub (`skillbridge`)

---

## Executive Summary

SkillBridge is an evolving full-stack tripartite educational-industry ecosystem connecting **Students**, **Academia (Universities & Faculty)**, and **Industry (Recruiters & Engineering Teams)**. 

This document represents an exhaustive, code-verified audit of the current application state, separating production-ready implementations from demo scaffolds, mock stores, and upcoming production requirements.

---

## 1. Project Architecture Overview

```
                          ┌─────────────────────────────┐
                          │   SkillBridge Next.js 16    │
                          │   (React 19 App Router)     │
                          └──────────────┬──────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
 ┌──────▼──────┐                  ┌──────▼──────┐                  ┌──────▼──────┐
 │   Student   │                  │  Academia   │                  │  Industry   │
 │   Portal    │                  │   Portal    │                  │   Portal    │
 └──────┬──────┘                  └──────┬──────┘                  └──────┬──────┘
        │                                │                                │
        └────────────────────────────────┼────────────────────────────────┘
                                         │
                          ┌──────────────▼──────────────┐
                          │    Next.js Route Handlers   │
                          │    (/api/* — 50 Endpoints)  │
                          └──────────────┬──────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
         ┌─────────▼─────────┐                       ┌─────────▼─────────┐
         │ Runtime Data Store│                       │  Prisma 7 Schema  │
         │ (JSON Data Store) │                       │  (PostgreSQL ready│
         │  ./.data/demo-db  │                       │   schema.prisma)  │
         └───────────────────┘                       └───────────────────┘
```

- **Framework:** Next.js 16.3.5 (App Router with Server Components & Client Components)
- **UI & Styling:** Tailwind CSS v4 (`@tailwindcss/postcss: ^4`), Vanilla CSS Tokens (`globals.css`)
- **Graphics & Motion:** Three.js (`^0.186.1`), Custom React Viewport Shaders, Canvas Confetti (`^1.9.4`), Lucide React (`^1.61.0`)
- **State Management:** React Context Providers (`StudentProvider`, `AcademiaProvider`, `IndustryProvider`, `LanguageContext`), URL Query State, Local Storage (Theme Preferences)
- **Data Persistence:** Dual Architecture:
  - *Current Runtime Active:* File-backed JSON data store (`./.data/demo-db.json`) abstracted via `readDb()` and `mutateDb()` in `src/lib/server/db.ts`.
  - *Prepared Relational Schema:* Prisma 7 schema (`prisma/schema.prisma`) targeting PostgreSQL.

---

## 2. Frontend Implementation Status

| Module / Area | Route Scope | Verification Status | Implementation Details |
|---|---|---|---|
| **Public Landing Page** | `/` | **Fully Implemented** | Cinematic 3D interactive hero, 4 pathways with hover lighting, 3-track project workbench, 3-word ecosystem switchboard, 5-stage progression milestone bar, and verified outcomes showcase with partner brand grid. |
| **Global Navigation & Search** | Global Header / Modal | **Fully Implemented** | Apple iOS-inspired modal with Spotlight search (`searchIndex.ts` scoring engine), category filters, and keyboard shortcut (`Cmd/Ctrl + K`). |
| **Settings & Accessibility** | Header Controls | **Fully Implemented** | iOS-style theme switch (Dark/Light mode), high-contrast accessibility toggles, motion controls, and multi-language dictionary support (`en`, `hi`, `es`, `fr`, `de`, `zh`, `ja`, `ar`). |
| **Student Portal — Auth** | `/student/login`, `/student/signup`, `/student/forgot-password`, `/student/onboarding` | **Fully Implemented** | Complete client forms with real-time validation, password strength meters, and direct integration with `/api/student/auth/*`. |
| **Student Portal — App** | `/student/*` (10 pages) | **Fully Implemented** | Dashboard, Profile Editor, Skill Radar & Verification, Projects Workspace, Application Tracker, Opportunities Marketplace, Saved Items, Certificates Hub, Settings, and Peer Referral Engine. |
| **Industry Portal — Auth** | `/industry/login`, `/industry/signup`, `/industry/onboarding` | **Fully Implemented** | Recruiter registration, corporate email validation, and company profile onboarding. |
| **Industry Portal — App** | `/industry/*` (11 pages) | **Fully Implemented** | Recruiter Workspace, Job Creation & Management (`/jobs/new`, `/jobs/[jobId]`), ATS Candidate Pipeline, Talent Search, Campus Interviews, Events, Messages, Company Profile, Team Access, and Analytics. |
| **Academia Portal — Auth** | `/academia/login`, `/academia/register`, `/academia/forgot-password`, `/academia/reset-password`, `/academia/onboarding` | **Fully Implemented** | Institutional registration, accreditation verification flow, and faculty staff authentication. |
| **Academia Portal — App** | `/academia/*` (14 pages) | **Fully Implemented** | Institutional Dashboard, Department Management, Faculty Directory, Student Registry, Capstone Tracking, Research Opportunities, Industry Partnerships, Campus Placement Drives, Announcements, and Reports. |
| **Static / Informational** | `/legal`, `/affiliate`, `/not-found` | **Fully Implemented** | Terms of service, privacy policy, 404 error boundaries, and affiliate partner landing. |

---

## 3. Backend Implementation Status

### Verified Working Backend Logic

The backend is organized inside `src/lib/server/` and exposed via 50 Next.js App Router Route Handlers (`src/app/api/**/route.ts`):

1. **Authentication & Session Management (`src/lib/server/auth.ts`)**:
   - Cryptographic password hashing using Node.js native `crypto.scryptSync` with 16-byte random salts.
   - Timing-safe password verification using `crypto.timingSafeEqual`.
   - 32-byte cryptographically secure session tokens hashed with SHA-256 before storage.
   - Distinct cookie boundaries:
     - `sb_session` for Students
     - `sb_industry_session` for Recruiters
     - `sb_academia_session` for Academic Staff
   - Cookies enforced with `httpOnly: true`, `sameSite: "lax"`, and dynamic `secure` flags.
   - Per-process in-memory request throttling to guard against brute-force login attempts.

2. **Domain Service Controllers**:
   - **Student Service (`src/lib/server/student-service.ts`)**: Full CRUD for profiles, application submissions, interview synchronization, bookmarking, and custom student tasks.
   - **Industry Service (`src/lib/server/industry-service.ts`)**: ATS candidate progression, job creation/editing, interview scheduling, campus recruitment drives, and recruiter team invitations.
   - **Academia Service (`src/lib/server/academia-service.ts`)**: Institutional profiles, department hierarchies, faculty registries, student cohort monitoring, and placement drive approvals.
   - **Live Coding Connectors (`src/lib/server/coding-connectors/`)**: Connectors for LeetCode (GraphQL API), GitHub (REST API), and CodeChef (profile scraper) to fetch developer progress.

### Backend Limitations & Areas Not Production-Ready

1. **Storage Concurrency & Scalability**: The current runtime data store uses `./.data/demo-db.json` with file read/write locks. It is not suitable for multi-instance horizontal scaling.
2. **Email Verification**: User registration activates accounts immediately without sending SMTP email confirmation tokens.
3. **Password Reset Delivery**: Password reset routes update hashes directly via tokens; no email transport provider (SendGrid, AWS SES, Resend) is connected.
4. **Binary File Uploads**: Resume attachments are written to local disk (`./.data/resumes/`) rather than S3 / Cloud Storage / Cloudinary.
5. **Role-Based Cross-Portal Guarding**: Permissions are enforced per portal cookie; unified multi-tenant IAM has not been migrated to a centralized database.

---

## 4. API Endpoint Inventory (50 Verified Route Handlers)

### Health & Monitoring (1)
- `GET /api/health` — System uptime, node environment, memory, and data store health.

### Student Portal APIs (19)
- `POST /api/student/auth/signup` — Student registration with scrypt hashing.
- `POST /api/student/auth/login` — Authentication and session cookie issuance.
- `POST /api/student/auth/logout` — Session termination and cookie invalidation.
- `POST /api/student/auth/password` — Password updates with current password check.
- `GET /api/student/me` — Fetches current authenticated student payload.
- `PATCH /api/student/me` — Updates profile, skills, projects, and certifications.
- `GET /api/student/opportunities` — Search and filter capstones, internships, and fellowships.
- `GET, POST /api/student/applications` — Fetch applicant submissions or submit a new project application.
- `GET, POST, DELETE /api/student/saved` — Bookmark opportunities and capstones.
- `GET, POST /api/student/tasks` — Task manager for coursework and application milestones.
- `PATCH, DELETE /api/student/tasks/[taskId]` — Update or delete specific tasks.
- `GET /api/student/certificates` — Verified credentials, badges, and completion milestones.
- `GET /api/student/learning` — Structured learning tracks and course completion metrics.
- `GET /api/student/learning-path` — Personalized AI-recommended career roadmap.
- `GET, POST /api/student/resume` — Resume metadata and parsing information.
- `GET, PATCH /api/student/academic-sharing` — Privacy toggles for sharing data with universities.
- `GET, POST /api/student/coding-accounts` — Connected coding profiles (GitHub, LeetCode, CodeChef).
- `POST /api/student/coding-accounts/connect` — Connect new developer account handle.
- `POST /api/student/coding-accounts/sync` — Synchronize public problems solved, commits, and streaks.
- `POST /api/student/coding-accounts/disconnect` — Unlink developer profile.

### Industry Portal APIs (13)
- `POST /api/industry/auth/signup` — Recruiter and corporate onboarding.
- `POST /api/industry/auth/login` — Recruiter sign-in and session generation.
- `POST /api/industry/auth/logout` — Corporate session invalidation.
- `POST /api/industry/auth/password` — Recruiter password update.
- `GET, PATCH /api/industry/me` — Recruiter personal and corporate profile management.
- `GET, POST /api/industry/jobs` — Retrieve job postings or draft new opportunities.
- `GET, PATCH, DELETE /api/industry/jobs/[jobId]` — Manage individual job postings.
- `GET, PATCH /api/industry/applicants` — ATS candidate progression (Applied, Screen, Interview, Offer, Rejected).
- `GET /api/industry/talent` — Searchable candidate directory with verified skill filters.
- `GET, POST /api/industry/interviews` — Schedule interviews with meeting links and timezones.
- `GET, POST /api/industry/events` — Campus recruitment drives, tech talks, and hackathons.
- `GET, POST /api/industry/team` — Manage team permissions and recruiter invites.
- `GET, POST /api/industry/messages` — Conversation threads between recruiters and candidates.

### Academia Portal APIs (17)
- `POST /api/academia/auth/register` — Academic staff and faculty account creation.
- `POST /api/academia/auth/login` — Academic portal authentication.
- `POST /api/academia/auth/logout` — Academic session clearance.
- `POST /api/academia/auth/password` — Academic staff password management.
- `POST /api/academia/auth/forgot-password` — Password reset token generation.
- `POST /api/academia/auth/reset-password` — Password reset fulfillment.
- `GET, PATCH /api/academia/me` — Institution profile and administrative settings.
- `GET, POST, PATCH /api/academia/departments` — Department hierarchy and academic units.
- `GET, POST, DELETE /api/academia/faculty` — Faculty roster, credentials, and course allocations.
- `GET, POST /api/academia/students` — Enrolled student registry and academic standing.
- `GET /api/academia/student-learning` — Cross-cohort skill acquisition metrics.
- `GET, POST /api/academia/opportunities` — Faculty-led research projects and student grants.
- `GET, POST /api/academia/partnerships` — Corporate MoUs, sponsored labs, and enterprise partnerships.
- `GET, POST, PATCH /api/academia/placements` — Campus placement drives and company visits.
- `GET, POST /api/academia/announcements` — Campus notices and student/faculty bulletins.
- `GET, POST /api/academia/events` — Academic symposiums, thesis defences, and workshops.
- `GET, POST /api/academia/team` — Academic administration team members and roles.

---

## 5. Database Architecture

### Active File-Based Store (`./.data/demo-db.json`)
The application currently runs on an in-memory cached JSON file backend with atomic write semantics:
- **Collections Present:** `users`, `sessions`, `students`, `companies`, `recruiters`, `jobs`, `atsMeta`, `interviews`, `conversations`, `events`, `team`, `activities`, `institutions`, `academiaStaff`, `academiaDepartments`, `academiaFaculty`, `academiaStudents`, `placementDrives`, `industryPartnerships`, `academicOpportunities`, `academiaEvents`, `academiaAnnouncements`, `academiaTeam`, `academiaAudit`, `sharedJobEndorsements`.
- **Strengths:** Zero external setup required for local development; enables immediate testing of full user workflows.
- **Vulnerabilities:** No ACID transaction guarantees under multi-thread concurrency; no point-in-time recovery; unbounded JSON file growth.

### Target Relational Database (Prisma 7 / PostgreSQL)
A Prisma schema (`prisma/schema.prisma`) is defined with the following entities:
- `User`: Handles identity and portal roles (`STUDENT`, `FACULTY`, `INDUSTRY_PARTNER`, `RECRUITER`).
- `Skill`: Standardized skill taxonomy mapped to courses and roadmaps.
- `Course`: Academic and industry training modules.
- `Roadmap`: Step-by-step skill acquisition pathways.
- `Feedback`: Bi-directional peer and faculty review records.

---

## 6. Security & Credential Audit

| Check | Result | Severity | Remediation Taken / Required |
|---|---|---|---|
| **Hardcoded API Secrets** | **PASS** | None | Scanned `src/`, `prisma/`, and `public/`. No leaked AWS keys, Google API keys, or GitHub Personal Access Tokens. |
| **Password Storage** | **PASS** | Low | Passwords hashed using `scrypt` with 16-byte random salt. Timing-safe comparison implemented. |
| **Session Cookie Security** | **PASS** | Low | Tokens stored as SHA-256 hashes server-side. Cookies set with `httpOnly`, `sameSite: "lax"`. |
| **Local Data Exclusion** | **RESOLVED** | High | `.data/` and `.backup_checkpoint/` contain user records and credentials. Updated `.gitignore` to strictly exclude them. |
| **Environment Variables** | **RESOLVED** | Medium | `.env` contains local database credentials. Verified not committed in git history. Provided sanitized `.env.example`. |
| **CSRF Defense** | **PARTIAL** | Medium | Relying on `SameSite=Lax`. Recommended to add explicit anti-CSRF token headers on mutating endpoints. |
| **Rate Limiting** | **PARTIAL** | Medium | Per-process in-memory throttling exists; should transition to Redis / Upstash in clustered production. |

---

## 7. Build & Dependency Status

- **TypeScript Compilation (`npx tsc --noEmit`)**: **PASSED (0 errors)**.
- **Dependencies**: Cleanly installed via npm; locked in `package-lock.json`.
- **Linting (`npm run lint`)**: Flagged strict `@typescript-eslint/no-explicit-any` and unused variables in development scratch scripts. Production code compiles cleanly.

---

## 8. Recommended Next Development Priorities

1. **Database Migration to PostgreSQL**:
   - Expand `prisma/schema.prisma` to cover all 25 collections currently in `demo-db.json`.
   - Implement repository pattern in `src/lib/server/db.ts` to seamlessly swap JSON file operations with Prisma client queries.
2. **Email Delivery Provider Integration**:
   - Integrate Resend or SendGrid for account verification emails, interview invites, and password reset workflows.
3. **Cloud Storage for Resumes & Portfolios**:
   - Replace local disk storage (`./.data/resumes/`) with S3-compatible pre-signed upload URLs.
4. **Centralized Role-Based Access Control (RBAC)**:
   - Unify student, recruiter, and academic session validation into standard middleware.
