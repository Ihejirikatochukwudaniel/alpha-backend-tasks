# 📊 Briefing Report Generator

> A FastAPI service that creates and renders professional HTML briefing reports from structured JSON input.

---

## 📋 Table of Contents

- [What This Project Does](#-what-this-project-does)
- [Before You Begin — Prerequisites](#-before-you-begin--prerequisites)
- [Step 1 — Get the Code](#-step-1--get-the-code)
- [Step 2 — Create a Virtual Environment](#-step-2--create-a-virtual-environment)
- [Step 3 — Install Dependencies](#-step-3--install-dependencies)
- [Step 4 — Configure Environment Variables](#-step-4--configure-environment-variables)
- [Step 5 — Run Database Migrations](#-step-5--run-database-migrations)
- [Step 6 — Start the Server](#-step-6--start-the-server)
- [Step 7 — Test the API](#-step-7--test-the-api)
- [API Reference](#-api-reference)
- [Database Migrations](#-database-migrations)
- [Troubleshooting](#-troubleshooting)

---

## 🧠 What This Project Does

This service lets you:

1. **Create a briefing** — submit company data, key points, risks, and metrics via JSON
2. **Generate a report** — transform that data into a formatted HTML report
3. **Retrieve the HTML** — serve the rendered report as a real web page

It uses **SQLite** by default (no database installation required), with optional PostgreSQL support.

---

## ✅ Before You Begin — Prerequisites

You need the following installed on your machine before starting.

### Python 3.10 or higher

Check if you have it:
```bash
python --version
# or
python3 --version
```

If you see `Python 3.10.x` or higher, you're good. If not, download it from:
👉 https://www.python.org/downloads/

> **Windows users:** During installation, check the box that says **"Add Python to PATH"**

### Git (to clone the repo)

Check if you have it:
```bash
git --version
```

If not installed, download it from: 👉 https://git-scm.com/downloads

---

## 📁 Step 1 — Get the Code

Open your terminal (Command Prompt / PowerShell on Windows, Terminal on Mac/Linux) and run:

```bash
git clone <your-repository-url>
cd python-service
```

Replace `<your-repository-url>` with the actual GitHub URL of the project.

Your folder structure should look like this:

```
python-service/
├── alembic/
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── schemas/
│   ├── routers/
│   ├── services/
│   ├── formatters/
│   └── templates/
├── alembic.ini
├── requirements.txt
└── .env
```

---

## 🐍 Step 2 — Create a Virtual Environment

A virtual environment keeps this project's dependencies isolated from the rest of your system. Think of it as a clean container just for this project.

### Create the environment

```bash
# Mac / Linux
python3 -m venv venv

# Windows
python -m venv venv
```

This creates a folder called `venv/` inside your project directory.

### Activate the environment

```bash
# Mac / Linux
source venv/bin/activate

# Windows (Command Prompt)
venv\Scripts\activate.bat

# Windows (PowerShell)
venv\Scripts\Activate.ps1
```

✅ When activated, your terminal prompt will change to show `(venv)` at the beginning:

```
(venv) your-computer:python-service $
```

> **Important:** Every time you open a new terminal session to work on this project, you need to activate the virtual environment again.

### Deactivating (when you're done working)

```bash
deactivate
```

---

## 📦 Step 3 — Install Dependencies

With your virtual environment **activated**, install all required packages:

```bash
pip install -r requirements.txt
```

This will install FastAPI, SQLAlchemy, Alembic, Jinja2, and everything else the project needs.

You should see output ending with something like:
```
Successfully installed fastapi-x.x.x uvicorn-x.x.x sqlalchemy-x.x.x ...
```

---

## ⚙️ Step 4 — Configure Environment Variables

The project uses a `.env` file for configuration. A default one should already exist in the project. Open it and verify it looks like this:

```env
DATABASE_URL=sqlite+aiosqlite:///./briefing.db
```

This tells the app to use **SQLite** — a simple file-based database that requires zero setup. A file called `briefing.db` will be created automatically in your project folder when you run migrations.

### Optional: Use PostgreSQL instead

If you have PostgreSQL installed and prefer to use it, change the line to:

```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/briefing_db
```

Replace `username`, `password`, and `briefing_db` with your actual PostgreSQL credentials.

> **Not sure?** Stick with SQLite. It works perfectly for development and requires nothing extra.

---

## 🗄️ Step 5 — Run Database Migrations

Migrations create the database tables your app needs. Run this once before starting the server:

```bash
alembic upgrade head
```

You should see output like:
```
INFO  [alembic.runtime.migration] Running upgrade  -> 001, initial
```

✅ This creates three tables: `briefings`, `briefing_points`, and `briefing_metrics`.

If you're using SQLite, you'll notice a new file `briefing.db` has appeared in your folder — that's your database.

---

## 🚀 Step 6 — Start the Server

```bash
uvicorn app.main:app --reload
```

You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

🎉 Your server is running! Open your browser and go to:

| URL | What you'll see |
|-----|----------------|
| `http://localhost:8000/docs` | Interactive Swagger UI — test all endpoints visually |
| `http://localhost:8000/redoc` | Alternative API documentation |

> The `--reload` flag means the server automatically restarts when you make code changes. Great for development.

To stop the server, press `CTRL + C` in your terminal.

---

## 🧪 Step 7 — Test the API

The easiest way to test is using the Swagger UI at `http://localhost:8000/docs`. You can also use `curl` from the terminal.

### Create a briefing

```bash
curl -X POST http://localhost:8000/briefings \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Acme Holdings",
    "ticker": "ACME",
    "sector": "Industrial Technology",
    "analystName": "Jane Doe",
    "summary": "Acme is benefiting from strong enterprise demand and improving operating leverage.",
    "recommendation": "Monitor for margin expansion before increasing exposure.",
    "keyPoints": [
      "Revenue grew 18% year-over-year in the latest quarter.",
      "Management raised full-year guidance."
    ],
    "risks": [
      "Top two customers account for 41% of total revenue."
    ],
    "metrics": [
      { "name": "Revenue Growth", "value": "18%" },
      { "name": "Operating Margin", "value": "22.4%" }
    ]
  }'
```

The response will include an `id` — copy it. You'll use it in the next steps.

```json
{
  "id": "3f7a1c2e-...",
  "companyName": "Acme Holdings",
  ...
}
```

### Generate the report

Replace `{id}` with the actual ID from the previous step:

```bash
curl -X POST http://localhost:8000/briefings/{id}/generate
```

### View the HTML report in your browser

Open this URL in your browser (replace `{id}`):

```
http://localhost:8000/briefings/{id}/html
```

You should see a professionally styled HTML briefing report.

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/briefings` | Create a new briefing |
| `GET` | `/briefings/{id}` | Retrieve a briefing by ID |
| `POST` | `/briefings/{id}/generate` | Generate the HTML report |
| `GET` | `/briefings/{id}/html` | View the rendered HTML report |

### Validation Rules

| Field | Rule |
|-------|------|
| `companyName` | Required |
| `ticker` | Required — auto-converted to uppercase |
| `summary` | Required |
| `recommendation` | Required |
| `keyPoints` | Minimum **2** items |
| `risks` | Minimum **1** item |
| `metrics[].name` | Must be unique within the same briefing |

---

## 🔄 Database Migrations

### Apply all pending migrations
```bash
alembic upgrade head
```

### Roll back the last migration
```bash
alembic downgrade -1
```

### Create a new migration after changing models
```bash
alembic revision --autogenerate -m "describe your change here"
```

---

## 🛠️ Troubleshooting

### `command not found: python3`
→ Python is not installed or not in your PATH. Reinstall from https://python.org and ensure you check "Add to PATH" during installation.

### `(venv)` is not showing in my terminal
→ You forgot to activate the virtual environment. Run the activate command for your OS from [Step 2](#-step-2--create-a-virtual-environment).

### `ModuleNotFoundError` when starting the server
→ Your virtual environment is not activated, or you haven't run `pip install -r requirements.txt` yet.

### `alembic: command not found`
→ Make sure your virtual environment is activated. Alembic is installed inside `venv/`, not globally.

### Port 8000 is already in use
→ Run the server on a different port:
```bash
uvicorn app.main:app --reload --port 8001
```

### SQLite file not created after migrations
→ Make sure you are running `alembic upgrade head` from inside the `python-service/` directory where `alembic.ini` lives.

### PostgreSQL connection error
→ Fall back to SQLite by setting your `.env` to:
```env
DATABASE_URL=sqlite+aiosqlite:///./briefing.db
```

---

## 📐 Project Architecture

```
Request → Router → Service Layer → Database (SQLAlchemy)
                ↓
           Formatter → ReportViewModel → Jinja2 Template → HTML
```

- **Routers** handle HTTP requests and responses only
- **Services** contain all database operations
- **Formatters** transform raw DB records into display-ready view models
- **Templates** render HTML — no logic, only presentation

---

*Built with FastAPI · SQLAlchemy · Jinja2 · Alembic*
