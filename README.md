AI-Assisted Therapy Session & Progress Management System

A web application that helps a therapist keep clinical documentation for the people they see, and answer the question that written notes alone cannot answer: is this person getting better?

Built with the MERN stack and the Groq API.

Live demo

App: https://YOUR-VERCEL-URL.vercel.app API: https://therapy-management-system-9rz9.onrender.com


Note: the backend runs on Render's free tier, which sleeps after inactivity. The first request may take up to a minute while the server wakes up. Every request after that is fast.

What it does

A therapist logs in, creates a named entry for each person they are treating, and writes a free-text session note after each session. Notes accumulate over time.

The distinguishing feature is two-level AI summarisation:

Level 1 — Combined session summary. The therapist clicks Generate Summary. The system collects every session note for that person that has not yet been summarised, sends them to the AI as one batch, and receives a single combined summary along with structured details: a mood rating from 1 to 10, the themes discussed, the goals covered, and the points needing follow-up. The therapist reviews this summary and approves it.

Level 2 — Progress report. The therapist clicks Generate Progress Report. The system takes all approved summaries for that person, in chronological order, and produces one consolidated report covering overall progress, recurring themes, movement against goals, and recommended next steps.

In short: a summary for a batch of sessions, then a summary of those summaries.

session notes  ──►  session summaries  ──►  progress report
 (what the           (AI level 1,            (AI level 2)
  therapist          therapist
  wrote)             approves)
Why two levels

Sending fifty raw session notes to a language model in a single request is slow, expensive, and eventually exceeds what the model can hold at once. Summarising in two stages keeps the amount of text sent at each stage small, no matter how long treatment runs. The final report is built from the stored summaries — it never re-reads the original notes.

The approval step between the two levels matters for a second reason. AI output is not always correct. Requiring the therapist to approve a summary before it can reach the final report means an inaccurate summary cannot silently propagate.

Tech stack
Layer	Technology
Frontend	React 18, Vite, React Router v6, Axios, plain CSS
Backend	Node.js, Express 4
Database	MongoDB Atlas with Mongoose 8
Auth	JWT with bcrypt password hashing
AI	Groq API, reached through a single adapter file
Hosting	Vercel (frontend), Render (backend), Atlas (database)
How to try it
Open the live app and log in with the credentials above
Click Ravi Kumar in the appointment list
Scroll down — you will see the existing session notes, the approved AI summary with its mood rating and themes, and the progress report
Write a new session note (at least 20 characters) and click Save note
The AI Level 1 section now shows 1 note waiting to be summarised. Click Generate summary
A new summary appears marked Pending, showing which notes it was built from — only the new one, because the earlier notes were already used
Click Approve — the badge turns green
Click Generate progress report — the new report is built from both approved summaries

Step 6 is the point worth watching: notes are consumed in batches and marked as used, so generating again never re-summarises the same notes twice.

Running it locally

You need Node.js 18 or later.

1. Backend
bash
cd Backend
npm install

Create a .env file in the Backend folder. Copy .env.example and fill in the values:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string
GROQ_API_KEY=your_groq_api_key

Then start it:

bash
npm run dev

You should see:

Server is running on port 5000
MongoDB connected
2. Frontend

Open a second terminal:

bash
cd Frontend
npm install
npm run dev

Open http://localhost:5173

Both terminals need to stay running. With no VITE_API_URL set, the frontend automatically points at http://localhost:5000/api.

Where to get the keys

MongoDB Atlas — free account at mongodb.com/cloud/atlas. Create a free M0 cluster, add a database user, then under Network Access click Add IP Address → Allow Access From Anywhere. Copy the connection string from Connect → Drivers and add your database name before the ?.

Groq — free API key at console.groq.com under API Keys.

API endpoints

Base path: /api

Method	Endpoint	Auth	Purpose
POST	/register	No	Create a therapist account, returns a token
POST	/login	No	Log in, returns a token
GET	/me	Yes	Logged-in therapist's details
POST	/appointments	Yes	Create a named appointment
GET	/appointments	Yes	List own appointments
GET	/appointments/:id	Yes	Get one appointment
PATCH	/appointments/:id/status	Yes	Toggle between Active and Closed
POST	/notes	Yes	Write a session note
GET	/notes/appointment/:id	Yes	List notes for an appointment
POST	/summaries/generate	Yes	Generate the combined AI summary (Level 1)
GET	/summaries/appointment/:id	Yes	List summaries
PATCH	/summaries/:id/approve	Yes	Approve a summary
POST	/reports/generate	Yes	Generate the progress report (Level 2)
GET	/reports/appointment/:id	Yes	List reports

Protected endpoints expect an Authorization: Bearer <token> header.

Project structure
therapy-management-system/
│
├── Backend/
│   ├── ai/              AI adapter and prompt definitions
│   ├── config/          Database connection
│   ├── controllers/     Request handling and business logic
│   ├── middleware/      JWT verification
│   ├── models/          Mongoose schemas
│   ├── routes/          API endpoint definitions
│   ├── utils/           Token generation
│   └── server.js        Entry point
│
├── Frontend/
│   └── src/
│       ├── pages/       Login, Register, Appointments, AppointmentDetail
│       ├── services/    Axios instance with token interceptor
│       └── App.jsx      Routing
│
└── README.md
Design decisions

Password hashing lives in the model, not the controller. A mongoose pre("save") hook hashes the password before any therapist document is written. Because it sits on the schema, it applies to every save from anywhere in the codebase — it cannot be forgotten by a new route.

Access control comes from the token, never the request body. The auth middleware verifies the JWT, loads the therapist, and attaches them to req.therapist. Every query then filters on req.therapist._id. Records are fetched by matching both their own ID and the therapist ID, so a therapist requesting someone else's record receives 404 rather than the record. The data is not hidden in the interface; it is never retrieved.

Notes carry a summarised flag. Each session note starts unsummarised. Level 1 picks up only unsummarised notes and marks them as used afterwards, in that order. This prevents the same notes being summarised twice, which would otherwise double-count sessions in the final report.

Summaries are not consumed. Unlike notes, summaries have no "used" flag. Every progress report reads all approved summaries, so each report is a fresh snapshot of the whole journey rather than a summary of only the newest sessions.

Each AI output records its sources. A summary stores the IDs of the notes it was built from; a report stores the IDs of the summaries. Any generated output can be traced back to its exact source material.

The AI provider sits behind one adapter. ai/aiAdapter.js is the only file that knows Groq exists. Switching providers means changing that one file.

Structured JSON from the model. The adapter requests response_format: json_object and the system prompt specifies the exact keys required, so the AI's output maps directly onto the Mongoose schema without a translation step. Temperature is set low (0.3) for consistency rather than creativity.

Soft deletes, not hard deletes. Closing an appointment sets its status to Closed rather than removing it. Clinical records should stay intact and auditable, and the action is reversible. The endpoint is a PATCH on the status field rather than a DELETE, because nothing is actually removed.

Separate hosting for frontend and backend. A React build is static files, which suits a CDN — hence Vercel. An Express server is a long-running process holding a database connection, which needs a container — hence Render. The frontend reads its API address from VITE_API_URL at build time and falls back to localhost, so the same code runs in both environments.

Notes
.env is not committed. Use .env.example as a template.
The AI takes 3–6 seconds to respond for each generation step.
Session notes must be at least 20 characters — very short notes give the AI too little to work with and produce generic summaries.