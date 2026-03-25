# CLAUDE.md — MentorMatch Internal Web App

## Project Overview

**MentorMatch** is an internal company web application that helps employees find and connect with relevant mentors based on skills, expertise, and availability. Employees can search or receive AI-powered suggestions for mentors, view rich mentor profiles, and send mentorship requests. Mentors can self-register, manage their profiles, and respond to incoming requests.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | MongoDB (via Mongoose) |
| Auth | JWT (email/password) |
| Email | Nodemailer (or SendGrid) |
| AI Suggestions | Claude API (Anthropic) via `/v1/messages` |
| Styling | Tailwind CSS |

---

## User Roles

### 1. Mentee (Employee seeking mentorship)
- Registers and logs in
- Searches for mentors by skill/keyword
- Receives AI-powered mentor suggestions
- Views mentor profiles
- Sends a mentorship request with a message
- Tracks the status of their sent requests

### 2. Mentor (Employee offering mentorship)
- Registers with a mentor-specific flag
- Builds and manages their profile
- Sets availability windows
- Receives mentorship requests via email notification
- Accepts or declines requests (status update triggers email to mentee)

### 3. Admin (HR / Platform Admin)
- Logs in via the same auth system (role = admin)
- Views all users (mentors + mentees)
- Deactivates or removes users
- Views platform usage stats (total mentors, requests sent, requests accepted)

---

## Core Features (MVP)

### Authentication
- Email/password registration with role selection: `mentee` | `mentor`
- JWT-based session stored in localStorage
- Protected routes by role
- Passwords hashed with bcrypt

### Mentor Profile
Each mentor profile contains:
- Full name & profile photo (URL or upload)
- Job title & department
- Bio / About Me (free text, max 500 chars)
- Skills / expertise tags (e.g. "JavaScript", "SQA", "Leadership") — stored as array
- Years of experience
- Availability windows (e.g. "Tuesdays 2–4pm", "Weekday mornings") — free text or structured slots
- Ratings average (derived from past mentee ratings)
- Count of past mentees

### Search & Discovery
- Keyword search bar on homepage that matches against mentor `skills` tags and `bio`
- Filters: Department, Years of Experience (range), Availability
- Results displayed as mentor cards with: name, title, top 3 skills, rating, availability snippet
- Results sorted by: relevance (default), rating, experience

### AI-Powered Suggestions
- A "Find me a mentor" prompt box where the mentee describes what they need in plain English
  - Example: *"I'm an SQA engineer trying to learn JavaScript automation testing"*
- This text is sent to the Claude API with the full list of mentor profiles as context
- Claude returns a ranked shortlist with a one-line reason for each recommendation
- Displayed as a separate "AI Suggested" section above standard search results

### Mentorship Request
- Mentee clicks "Request Mentorship" on any mentor card/profile
- A modal opens with a message field (required, max 300 chars) and a stated goal
- On submit:
  - Request saved to DB with status: `pending`
  - Email notification sent to mentor: "You have a new mentorship request from [Name]"
- Mentor can Accept or Decline from their dashboard
  - On status change: email sent to mentee: "Your request was accepted/declined by [Mentor Name]"

### Request Status Tracking
- Mentee dashboard shows all sent requests with status badges: `Pending` | `Accepted` | `Declined`
- Mentor dashboard shows all incoming requests with Accept/Decline actions

### Admin Dashboard
- Table of all users with role, join date, status (active/inactive)
- Deactivate/reactivate any user
- Stats cards: Total Mentors, Total Mentees, Requests Sent (all time), Requests Accepted

---

## Data Models

### User
```js
{
  _id,
  name: String,
  email: String (unique),
  passwordHash: String,
  role: enum['mentee', 'mentor', 'admin'],
  isActive: Boolean,
  createdAt: Date,
  // Mentor-only fields:
  title: String,
  department: String,
  bio: String,
  skills: [String],
  yearsOfExperience: Number,
  availability: String,
  photoUrl: String,
  ratingsTotal: Number,
  ratingsCount: Number,
}
```

### MentorshipRequest
```js
{
  _id,
  menteeId: ObjectId (ref: User),
  mentorId: ObjectId (ref: User),
  message: String,
  goal: String,
  status: enum['pending', 'accepted', 'declined'],
  createdAt: Date,
  updatedAt: Date,
}
```

---

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Mentors
| Method | Route | Description |
|---|---|---|
| GET | `/api/mentors` | List/search mentors (query params: `q`, `department`, `minExp`, `maxExp`) |
| GET | `/api/mentors/:id` | Get single mentor profile |
| PUT | `/api/mentors/profile` | Update own mentor profile (auth required) |

### AI Suggestions
| Method | Route | Description |
|---|---|---|
| POST | `/api/mentors/suggest` | Send mentee's description, get AI-ranked mentor list |

### Requests
| Method | Route | Description |
|---|---|---|
| POST | `/api/requests` | Mentee sends a request |
| GET | `/api/requests/sent` | Mentee views their sent requests |
| GET | `/api/requests/received` | Mentor views received requests |
| PATCH | `/api/requests/:id/status` | Mentor accepts or declines |

### Admin
| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users |
| PATCH | `/api/admin/users/:id/status` | Activate/deactivate user |
| GET | `/api/admin/stats` | Platform usage stats |

---

## Frontend Pages & Routes

| Route | Page | Role |
|---|---|---|
| `/` | Landing / Search homepage | Public / Mentee |
| `/login` | Login page | Public |
| `/register` | Register page | Public |
| `/mentors/:id` | Mentor profile detail | Mentee |
| `/dashboard` | Mentee dashboard (sent requests) | Mentee |
| `/mentor/dashboard` | Mentor dashboard (received requests + profile edit) | Mentor |
| `/admin` | Admin dashboard | Admin |

---

## AI Suggestion Logic (Backend)

**Route**: `POST /api/mentors/suggest`

**Flow**:
1. Receive `{ query: "I need help with JavaScript test automation" }` from frontend
2. Fetch all active mentors from MongoDB (name, title, skills, bio, yearsOfExperience)
3. Build a prompt:

```
You are a mentor matching assistant. Given a mentee's goal, recommend the top 3 mentors from the list below. 
Return a JSON array of { mentorId, name, reason } sorted by best fit.

Mentee goal: "{query}"

Mentors:
{JSON.stringify(mentors)}
```

4. Call Claude API (`claude-sonnet-4-20250514`) with the prompt
5. Parse JSON response, return to frontend
6. Frontend renders results in "AI Suggested" section

---

## Email Notifications

Use Nodemailer with SMTP (or SendGrid). Two triggers:

1. **New request → Mentor**
   - Subject: `New Mentorship Request from {menteeName}`
   - Body: mentee name, goal, message, link to mentor dashboard

2. **Request accepted/declined → Mentee**
   - Subject: `Your mentorship request was {status}`
   - Body: mentor name, status, link to mentee dashboard

Store SMTP credentials in `.env`.

---

## Environment Variables

```
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
ANTHROPIC_API_KEY=
CLIENT_URL=http://localhost:5173
PORT=5000
```

---

## Project Structure

```
mentormatch/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── MentorProfile.jsx
│   │   │   ├── MenteeDashboard.jsx
│   │   │   ├── MentorDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── components/
│   │   │   ├── MentorCard.jsx
│   │   │   ├── RequestModal.jsx
│   │   │   ├── AISuggestBox.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── Navbar.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── api/              # Axios service functions
│   │   └── App.jsx
│
├── server/                   # Node.js + Express backend
│   ├── models/
│   │   ├── User.js
│   │   └── MentorshipRequest.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── mentors.js
│   │   ├── requests.js
│   │   └── admin.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── services/
│   │   ├── emailService.js
│   │   └── aiService.js
│   └── server.js
│
├── .env
└── CLAUDE.md                 # This file
```

---

## Build Phases

### Phase 1 — Foundation
- Project scaffolding (Vite + Express)
- MongoDB connection
- Auth (register, login, JWT)
- User model

### Phase 2 — Mentor Profiles
- Mentor self-registration flow
- Profile creation and edit
- Mentor listing + search API
- Mentor cards + profile page (frontend)

### Phase 3 — Matching
- Search with filters (frontend)
- AI suggestion endpoint + UI

### Phase 4 — Requests
- Request modal + POST endpoint
- Mentor dashboard (accept/decline)
- Mentee dashboard (status tracking)
- Email notifications

### Phase 5 — Admin
- Admin dashboard page
- User management (activate/deactivate)
- Stats endpoint + cards

### Phase 6 — Polish
- Form validation + error handling
- Loading states + empty states
- Mobile responsiveness
- Seed script with mock mentor data

---

## Out of Scope (Post-MVP)

- In-app messaging / chat
- Calendar integration for booking sessions
- Video call integration
- Mentor ratings submission by mentees (data model supports it; UI deferred)
- Company SSO / OAuth
- Bulk mentor import by HR

---

## Notes for Claude Code

- Always use async/await with proper try/catch in all Express routes
- Use Mongoose validation at the schema level, not just in routes
- Protect all non-public routes with `authMiddleware` + `roleMiddleware` where applicable
- The AI suggestion endpoint should gracefully degrade — if Claude API fails, return an empty suggestions array with a `{ aiError: true }` flag so the frontend can show a fallback message
- Seed file should create: 1 admin, 3 mentees, 8 mentors with varied skills/departments
- Keep `.env.example` updated with all required keys
