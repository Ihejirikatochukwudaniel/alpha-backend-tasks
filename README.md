# Backend Engineering Take-Home Assessment

## Overview

This repository contains two standalone services built as part of the backend engineering assessment:

- `python-service/` — FastAPI + Python: Mini Briefing Report Generator
- `ts-service/` — NestJS + TypeScript: Candidate Document Intake + Summary Workflow

---

## Repository Structure

```
.
├── python-service/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── templates/
│   │   └── main.py
│   ├── alembic/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
└── ts-service/
    ├── src/
    │   ├── candidates/
    │   │   ├── documents/
    │   │   └── summaries/
    │   ├── providers/
    │   │   └── summarization/
    │   └── main.ts
    ├── migrations/
    ├── package.json
    └── .env.example
```

---

## Part A — FastAPI Briefing Report Generator

### What Was Built

- `POST /briefings` — Creates a briefing from structured JSON input with full validation
- `GET /briefings/{id}` — Retrieves stored briefing data
- `POST /briefings/{id}/generate` — Transforms stored data into a report view model, renders HTML via Jinja2, and marks the briefing as generated
- `GET /briefings/{id}/html` — Returns the rendered HTML report

### Data Model

- `briefings` — main briefing record (company info, analyst, summary, recommendation, status, generated_at)
- `briefing_points` — normalized key points and risks with a `point_type` discriminator column and `display_order`
- `briefing_metrics` — optional metrics with a unique constraint on `(briefing_id, name)`

### Validation

- `companyName`, `ticker`, `summary`, `recommendation` are required
- `ticker` is normalized to uppercase on input
- At least 2 key points are required
- At least 1 risk is required
- Metric names must be unique within the same briefing

### Report Generation

A dedicated formatter/service layer transforms database records into a clean view model before passing anything to the Jinja2 template. The template handles semantic HTML structure, basic CSS styling, safe escaping, and graceful handling of missing metrics.

### Setup

```bash
cd python-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/briefings_db
```

### Run Migrations

```bash
alembic upgrade head
```

### Run the Service

```bash
uvicorn app.main:app --reload --port 8000
```

### API Examples

```bash
curl -X POST http://localhost:8000/briefings \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Acme Holdings",
    "ticker": "acme",
    "sector": "Industrial Technology",
    "analystName": "Jane Doe",
    "summary": "Acme is benefiting from strong enterprise demand.",
    "recommendation": "Monitor for margin expansion.",
    "keyPoints": ["Revenue grew 18% YoY.", "Management raised guidance."],
    "risks": ["Top two customers account for 41% of revenue."],
    "metrics": [{ "name": "Revenue Growth", "value": "18%" }]
  }'

curl http://localhost:8000/briefings/1

curl -X POST http://localhost:8000/briefings/1/generate

curl http://localhost:8000/briefings/1/html
```

---

## Part B — NestJS Candidate Document Intake + Summary Workflow

### What Was Built

- `POST /candidates/:candidateId/documents` — Stores a candidate document (type, filename, storage key, raw text)
- `POST /candidates/:candidateId/summaries/generate` — Creates a pending summary record and enqueues background processing, returns 202 Accepted
- `GET /candidates/:candidateId/summaries` — Lists all summaries for a candidate
- `GET /candidates/:candidateId/summaries/:summaryId` — Retrieves a single summary

### Data Model

- `candidate_documents` — document records with foreign key to candidates, indexed on `candidateId`
- `candidate_summaries` — summary records with status enum (`pending`, `completed`, `failed`), all LLM output fields, and indexes on `candidateId` and `status`

### Async Workflow

Summary generation is fully asynchronous via BullMQ + Redis. The controller creates a `pending` record and enqueues a job immediately. The worker picks up the job, fetches documents, calls the summarization provider, and transitions the record to `completed` or `failed`. The API request cycle never waits on the LLM.

### Summarization Provider

An injectable `SummarizationProvider` interface abstracts all LLM logic. The production implementation (`GeminiSummarizationProvider`) calls the Google Gemini API (`gemini-2.0-flash`), instructs the model to return raw JSON only, validates the parsed response shape, and throws a typed `InvalidProviderResponseError` on malformed output. A `FakeSummarizationProvider` returning hardcoded data is used exclusively in tests.

The provider is wired via a DI injection token (`SUMMARIZATION_PROVIDER`) so it can be swapped without touching business logic.

### LLM Provider Configuration

- Provider: Google Gemini (`gemini-2.0-flash`)
- Get a free API key at: https://aistudio.google.com/app/apikey
- Set `GEMINI_API_KEY` in your `.env` file

### Access Control

Recruiters belong to a workspace. All endpoints verify that the target candidate belongs to the authenticated recruiter's workspace before proceeding. Requests to candidates outside the workspace return a 403 or 404 consistent with existing project patterns.

### Setup

```bash
cd ts-service
npm install
cp .env.example .env
```

### Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/candidates_db
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run Migrations

```bash
npm run migration:run
```

### Run the Service

```bash
npm run start:dev
```

### Run Tests

```bash
npm run test
```

### API Examples

```bash
curl -X POST http://localhost:3000/candidates/abc-123/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "documentType": "resume",
    "fileName": "john_doe_resume.pdf",
    "storageKey": "/storage/candidates/abc-123/resume.pdf",
    "rawText": "John Doe — Senior Software Engineer with 8 years experience..."
  }'

curl -X POST http://localhost:3000/candidates/abc-123/summaries/generate \
  -H "Authorization: Bearer <token>"

curl http://localhost:3000/candidates/abc-123/summaries \
  -H "Authorization: Bearer <token>"

curl http://localhost:3000/candidates/abc-123/summaries/sum-456 \
  -H "Authorization: Bearer <token>"
```

---

## Design Decisions

### Python Service

- Chose a normalized table design (`briefing_points` with a `point_type` column) over separate `key_points` and `risks` tables to avoid schema duplication while keeping queries clean
- The formatter service is a pure transformation layer — it receives ORM model instances and returns a typed view model dict, keeping template logic and database logic fully separated
- Jinja2 autoescape is enabled globally so all user content is safe by default
- Ticker normalization happens in the Pydantic schema layer (validator), not in the route handler or service, so the data is always clean before it reaches the database

### NestJS Service

- Used an injection token pattern for the summarization provider so tests never need to touch the real Gemini client
- The worker catches all errors and writes them to `errorMessage` rather than rethrowing — this prevents BullMQ from entering retry loops on expected failure conditions like malformed LLM output
- Prompt version is stored as a constant exported from the provider file and persisted on every summary record, making it possible to trace which prompt produced which output
- Access control is enforced at the service layer, not just the controller, so it applies regardless of how the service is called

---

## Assumptions

- Candidate records are assumed to be pre-existing in the database; this assessment covers documents and summaries only
- File content is provided as raw text in the request body; actual file upload/parsing is out of scope
- Auth token validation and workspace resolution follow the patterns already present in the starter — no custom auth implementation was introduced
- The Gemini API is assumed to be accessible from the local machine running the service

---

## What I Would Improve With More Time

- Add pagination to list endpoints
- Add retry logic with exponential backoff for transient Gemini API failures
- Store the full raw LLM response alongside the parsed output for debugging
- Add an event/webhook mechanism to notify callers when async summary generation completes
- Expand test coverage to include end-to-end database integration tests using a test database
- Add request-level rate limiting on the summary generation endpoint to prevent queue flooding
