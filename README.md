# Nexus AI — Intelligence That Evolves With You 🧠✨

**Nexus AI** is a memory-first AI chat platform. Unlike traditional chatbots that forget context between sessions, Nexus stores facts, tech stacks, and preferences you share, and surfaces them back to personalize future replies.

---

## 🚀 Key Features

* **🧠 Persistent Memory Engine:** Save facts and preferences from chats (manually, or via the "Save to memory" action on any AI reply). Memories are referenced by the AI when generating new replies.
* **🔍 Interactive Memory Center:** Browse, search, filter by category, edit, and delete anything stored in memory. Categories: *Preferences, Work & Skills, Projects, Profile, Interests*.
* **📊 Dashboard:** Real counts of conversations, memories, and messages, a 7-day message activity chart, and a recent-activity feed — all computed live from your account's data.
* **🎨 Tunable AI Personality:** Choose between Technical, Collaborative, Direct, and Creative response styles, saved per-user.
* **🔐 Account system:** Email/password registration and login with JWT-based sessions.

---

## 🛠️ Tech Stack

* **Frontend:** Single-page vanilla HTML/CSS/JavaScript (`nexus-ai-chat.html` + `css/` + `js/`) — no build step required.
* **Backend:** Python, [FastAPI](https://fastapi.tiangolo.com/), SQLAlchemy 2.0 ORM
* **Database:** SQLite by default (file-based, zero setup); swappable for PostgreSQL via `DATABASE_URL`
* **Auth:** JWT access tokens (`python-jose`), password hashing with `bcrypt`
* **AI replies:** Deterministic, template-based mock responder (`app/services/ai_service.py`) that incorporates your stored memories into its replies. No external LLM API is called.

---

## 📁 Project Structure

```
Nexus-AI-Chat/
├── nexus-ai-chat.html      # Frontend entry point (markup shell)
├── css/                    # tokens, base, one stylesheet per page, toast, modal, responsive
├── js/
│   ├── core/               # config + state, api client, router, toast
│   ├── features/           # auth, chat, messaging, memory, settings, dashboard
│   └── main.js             # Boot
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI app, CORS, router registration
│   │   ├── config.py       # Settings loaded from .env
│   │   ├── database.py     # SQLAlchemy engine/session setup
│   │   ├── exceptions.py   # Global error handlers
│   │   ├── models/         # SQLAlchemy ORM models (user, chat, message, memory, settings)
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── routers/        # API route handlers (auth, chats, messages, memories, settings, users, dashboard)
│   │   ├── core/           # Security (JWT/password hashing) and auth dependencies
│   │   └── services/       # Seed data + mock AI reply generation
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
Python 3.11+ (no Node.js required — the frontend is plain HTML/CSS/JS).

### 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # adjust values if needed
uvicorn app.main:app --reload --port 8000
```

The API is now running at `http://localhost:8000`. Interactive docs (Swagger UI) are available at `http://localhost:8000/docs`, and ReDoc at `http://localhost:8000/redoc`.

### 2. Frontend setup

In a separate terminal, from the project root:

```bash
python3 -m http.server 8088
```

Open `http://localhost:8088/nexus-ai-chat.html` in your browser. The frontend automatically points to `http://localhost:8000` for API calls.

> The default `CORS_ORIGINS` in `.env.example` already allows `http://localhost:8088`. If you serve the frontend on a different port, add it to `CORS_ORIGINS` in `backend/.env`.

### 3. Try it out

Register a new account from the landing page — a welcome chat and two starter memories are seeded automatically so the Chat, Memory, and Dashboard pages have real data to show immediately.

---

## 📸 Platform Previews

See the `Images/` folder for UI screenshots of the landing page, chat workspace, memory center, and dashboard.
