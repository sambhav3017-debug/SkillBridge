# SkillBridge REST API Specification

## 1. Global Conventions & Standards

All SkillBridge API routes adhere to RESTful conventions, returning standardized JSON payloads:

### 1.1 Success Response Schema
```json
{
  "ok": true,
  "data": { ... },
  "timestamp": "2026-11-11T12:00:00.000Z"
}
```

### 1.2 Error Response Schema
```json
{
  "ok": false,
  "error": "Human-readable error description",
  "fieldErrors": {
    "email": "Invalid college email domain."
  },
  "code": "VALIDATION_FAILED",
  "status": 422
}
```

### 1.3 HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Malformed JSON or invalid parameter syntax.
- `401 Unauthorized`: Authentication missing or session expired.
- `403 Forbidden`: Authenticated identity lacks permission for requested role.
- `404 Not Found`: Resource does not exist.
- `422 Unprocessable Entity`: Field validation failed.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Unhandled server exception.

---

## 2. System & Health Endpoints

### `GET /api/health`
Performs live health inspection of the application runtime and data store connectivity.
- **Access**: Public
- **Response**:
```json
{
  "ok": true,
  "status": "healthy",
  "uptimeSeconds": 34821,
  "timestamp": "2026-11-11T12:45:00.000Z",
  "checks": {
    "database": {
      "status": "connected",
      "latencyMs": 8,
      "records": {
        "users": 93,
        "jobs": 11
      }
    }
  }
}
```

---

## 3. Student Portal API Endpoints

### 3.1 Authentication
- **`POST /api/student/auth/signup`**: Registers a new student account.
  - Body: `{ email, password, name, collegeName, graduationYear }`
  - Returns: `{ ok: true, data: { user, studentProfile } }` + Sets `sb_session` cookie.
- **`POST /api/student/auth/login`**: Authenticates a student.
  - Body: `{ email, password }`
  - Returns: `{ ok: true, data: { onboarded: true } }` + Sets `sb_session` cookie.
- **`POST /api/student/auth/logout`**: Clears `sb_session` cookie and invalidates session token.

### 3.2 Student Profile & Learning
- **`GET /api/student/me`**: Fetches the authenticated student's full profile, skills, projects, and active applications.
- **`PUT /api/student/me`**: Updates headline, bio, portfolio links, and preferences.
- **`GET /api/student/learning`**: Returns skill progress matrix across verified categories (Languages, Cloud, AI/ML, Systems).
- **`PUT /api/student/learning`**: Updates self-assessed proficiency or logs practice module completion.
- **`GET /api/student/learning-path`**: Returns dynamically calculated milestone roadmap tailored to student target roles.
- **`GET /api/student/certificates`**: Returns completed and in-progress certifications with badge verification URLs.

### 3.3 Opportunities & Applications
- **`GET /api/student/opportunities`**: Returns filtered list of active internships, capstones, and fellowships.
  - Query Params: `?search=react&type=INTERNSHIP&workMode=REMOTE&page=1&limit=20`
- **`POST /api/student/applications`**: Submits an application for a specified opportunity.
  - Body: `{ opportunityId, resumeUrl, coverLetter }`
- **`GET /api/student/saved`**: Lists saved/bookmarked opportunity IDs.
- **`POST /api/student/saved`**: Toggles save status for an opportunity.

### 3.4 Student Planner & Tasks
- **`GET /api/student/tasks`**: Returns active, upcoming, and completed task milestones.
- **`POST /api/student/tasks`**: Creates a new task (e.g., "Submit Capstone Proposal").
- **`PATCH /api/student/tasks/[taskId]`**: Toggles task completion status or updates due dates.
- **`DELETE /api/student/tasks/[taskId]`**: Removes a task.

### 3.5 External Coding Connectors
- **`POST /api/student/coding-accounts/connect`**: Links external developer profile (`github`, `leetcode`, `codeforces`).
- **`POST /api/student/coding-accounts/sync`**: Triggers immediate synchronization of problems solved and commit streaks.
- **`POST /api/student/coding-accounts/disconnect`**: Unlinks an external account.

---

## 4. Industry Portal API Endpoints

### 4.1 Authentication & Recruiter Profile
- **`POST /api/industry/auth/signup`**: Registers a corporate recruiter account linked to a company domain.
- **`POST /api/industry/auth/login`**: Authenticates recruiter and sets `sb_industry_session` cookie.
- **`GET /api/industry/me`**: Retrieves recruiter profile, company metadata, and team permissions.

### 4.2 Job & Capstone Management
- **`GET /api/industry/jobs`**: Lists all opportunities posted by the recruiter's company.
- **`POST /api/industry/jobs`**: Publishes a new internship or capstone listing.
- **`GET /api/industry/jobs/[jobId]`**: Fetches detailed listing information and applicant statistics.
- **`PATCH /api/industry/jobs/[jobId]`**: Updates listing criteria, stipend, deadline, or active status.

### 4.3 ATS Pipeline & Talent Discovery
- **`GET /api/industry/applicants`**: Returns all candidate applications across company jobs.
  - Query Params: `?jobId=xyz&stage=REVIEWING&minCgpa=8.0`
- **`PATCH /api/industry/applicants`**: Transitions candidate through ATS stages (`REVIEWING` -> `INTERVIEW_SCHEDULED` -> `OFFER_EXTENDED`).
- **`GET /api/industry/talent`**: Search candidate database matching specific skill tags and verified credentials.
- **`POST /api/industry/interviews`**: Schedules an interview with calendar invitation and meeting link.

---

## 5. Academia Portal API Endpoints

### 5.1 Institutional Management
- **`POST /api/academia/auth/register`**: Registers an accredited educational institution account.
- **`POST /api/academia/auth/login`**: Authenticates faculty/TPO and sets `sb_academia_session` cookie.
- **`GET /api/academia/departments`**: Lists university faculties and departmental breakdowns.
- **`GET /api/academia/students`**: Queries enrolled students, academic standing, and placement readiness.
- **`GET /api/academia/placements`**: Aggregates batch placement metrics, average packages, and top recruiter partners.
- **`GET /api/academia/partnerships`**: Manages industry MoUs and campus drive authorizations.
