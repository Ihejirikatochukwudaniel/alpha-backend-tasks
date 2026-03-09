## Candidate Document Intake & Summary Backend

NestJS/TypeScript backend that ingests candidate documents, queues an LLM summarization job, and stores structured summaries for later retrieval.


### Tech Stack

- **Runtime**: Node.js (TypeScript)
- **Framework**: NestJS
- **Database**: PostgreSQL (TypeORM migrations)
- **Queue**: Bull (Redis)
- **HTTP Client**: Axios
- **LLM Provider**: Google Gemini `gemini-2.0-flash`
- **Testing**: Jest


### Project Structure (High Level)

- `src/main.ts`: Nest bootstrap and global validation pipe
- `src/app.module.ts`: Root module wiring config, database, queues, and candidates
- `src/config`: Environment loading module
- `src/database`: TypeORM root configuration
- `src/data-source.ts`: TypeORM CLI data source (migrations)
- `src/auth`:
  - `auth.guard.ts`: Very simple auth guard that attaches `workspaceId` from `X-Workspace-Id` header
  - `workspace.decorator.ts`: Decorator to access `workspaceId` in controllers
- `src/candidates`:
  - `entities/candidate.entity.ts`: Minimal candidate with `workspaceId`
  - `candidates.module.ts`: Aggregates candidate submodules
  - `documents/*`: Candidate document intake
  - `summaries/*`: Candidate summary generation and retrieval
- `src/providers/summarization`:
  - Summarization interfaces and DI token
  - Gemini provider (production)
  - Fake provider (tests)
- `src/migrations`: TypeORM migrations for candidate documents and summaries


## Getting Started

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL
- Redis (for Bull queues)


### Installation

```bash
npm install
```


### Environment Configuration

Copy `.env.example` to `.env` and fill in appropriate values:

```bash
cp .env.example .env
```

Available variables:

- `DB_HOST` — database host (default `127.0.0.1`)
- `DB_PORT` — database port (default `5432`)
- `DB_USER` — database user (default `postgres`)
- `DB_PASSWORD` — database password (default `postgres`)
- `DB_NAME` — database name (default `ts_version`)
- `REDIS_HOST` — Redis host (default `127.0.0.1`)
- `REDIS_PORT` — Redis port (default `6379`)
- `GEMINI_API_KEY` — required for summary generation in production

The `GEMINI_API_KEY` can be obtained from [Google AI Studio](https://aistudio.google.com/app/apikey).


### Database Migrations

Run migrations after configuring your database:

```bash
npm run migration:run
```

This uses `src/data-source.ts` and applies:

- `CreateCandidateDocumentsTable1710000000000`
- `CreateCandidateSummariesTable1710000001000`


### Running the Application

Development mode (ts-node):

```bash
npm run start:dev
```

Production build and run:

```bash
npm run build
npm start
```

The HTTP server listens on `http://localhost:3000` by default.


### Testing

Run the full Jest test suite:

```bash
npm test
```

Tests include:

- `candidate-documents.controller.spec.ts`
- `candidate-summaries.controller.spec.ts`
- `candidate-summaries.worker.spec.ts` (uses the fake summarization provider and in-memory repositories)

No test performs any real HTTP call to external APIs.


## Domain Model

### Candidate

Minimal representation for ownership and workspace scoping:

- `id: uuid` — primary key
- `workspaceId: uuid` — links candidate to a workspace
- `name: string`
- `email: string` (unique)


### CandidateDocument

Stored in the `candidate_documents` table:

- `id: uuid` — primary key
- `candidateId: uuid` — foreign key to `candidates.id`
- `documentType: 'resume' | 'cover_letter' | 'other'`
- `fileName: string`
- `storageKey: string`
- `rawText: string` (full extracted text)
- `uploadedAt: timestamp` (default `now()`)


### CandidateSummary

Stored in the `candidate_summaries` table:

- `id: uuid` — primary key
- `candidateId: uuid` — foreign key to `candidates.id`
- `status: 'pending' | 'completed' | 'failed'` (default `pending`)
- `score: number | null` (0–100)
- `strengths: string[] | null`
- `concerns: string[] | null`
- `summary: string | null`
- `recommendedDecision: string | null`
- `provider: string | null` (e.g. `gemini`)
- `promptVersion: string | null` (currently `v1`)
- `errorMessage: string | null`
- `createdAt: timestamp`
- `updatedAt: timestamp`


## Auth and Workspace Scoping

This project uses a very simple auth pattern intended for demonstration:

- `AuthGuard` expects an `X-Workspace-Id` header.
- If present, it populates `request.user = { workspaceId }`.
- Controllers use the `WorkspaceId` decorator to read this value.
- Services verify that a candidate belongs to the given workspace before reading or writing related documents or summaries.

This ensures that all candidate resources are scoped by workspace, even though there is no full auth system here.


## API Endpoints

All endpoints require the `X-Workspace-Id` header corresponding to the candidate’s `workspaceId`.

Base URL: `http://localhost:3000`


### Create Candidate Document

`POST /candidates/:candidateId/documents`

Headers:

- `Content-Type: application/json`
- `X-Workspace-Id: {workspaceId}`

Body:

```json
{
  "documentType": "resume",
  "fileName": "resume.pdf",
  "storageKey": "resumes/123.pdf",
  "rawText": "Full resume text here"
}
```

Response `201 Created`:

```json
{
  "id": "doc-uuid",
  "candidateId": "candidate-uuid",
  "documentType": "resume",
  "fileName": "resume.pdf",
  "storageKey": "resumes/123.pdf",
  "rawText": "Full resume text here",
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

Example:

```bash
curl -X POST "http://localhost:3000/candidates/{candidateId}/documents" \
  -H "Content-Type: application/json" \
  -H "X-Workspace-Id: {workspaceId}" \
  -d '{
    "documentType": "resume",
    "fileName": "resume.pdf",
    "storageKey": "resumes/123.pdf",
    "rawText": "Full resume text here"
  }'
```


### Request Candidate Summary Generation

`POST /candidates/:candidateId/summaries/generate`

Headers:

- `X-Workspace-Id: {workspaceId}`

Body:

```json
{}
```

Response `202 Accepted`:

```json
{
  "summaryId": "summary-uuid",
  "status": "pending"
}
```

The Bull worker (`CandidateSummariesWorker`) will later process this job, call the Gemini API, and update the summary record.

Example:

```bash
curl -X POST "http://localhost:3000/candidates/{candidateId}/summaries/generate" \
  -H "X-Workspace-Id: {workspaceId}"
```


### List Candidate Summaries

`GET /candidates/:candidateId/summaries`

Headers:

- `X-Workspace-Id: {workspaceId}`

Response `200 OK`:

```json
[
  {
    "id": "summary-uuid",
    "candidateId": "candidate-uuid",
    "status": "completed",
    "score": 92,
    "strengths": ["Strong communication", "Relevant experience"],
    "concerns": ["Limited leadership experience"],
    "summary": "Short natural language summary here",
    "recommendedDecision": "advance_to_next_round",
    "provider": "gemini",
    "promptVersion": "v1",
    "errorMessage": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:05:00.000Z"
  }
]
```

Example:

```bash
curl -X GET "http://localhost:3000/candidates/{candidateId}/summaries" \
  -H "X-Workspace-Id: {workspaceId}"
```


### Get Single Candidate Summary

`GET /candidates/:candidateId/summaries/:summaryId`

Headers:

- `X-Workspace-Id: {workspaceId}`

Response `200 OK` (same shape as list item) or `404 Not Found` if the summary does not exist or does not belong to the candidate/workspace.

Example:

```bash
curl -X GET "http://localhost:3000/candidates/{candidateId}/summaries/{summaryId}" \
  -H "X-Workspace-Id: {workspaceId}"
```


## LLM Provider Details

- Provider: **Google Gemini** (`gemini-2.0-flash`)
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Authentication: `GEMINI_API_KEY` passed as a query parameter
- The prompt instructs the model to return only raw JSON in the shape:

```json
{
  "score": 0,
  "strengths": [],
  "concerns": [],
  "summary": "",
  "recommendedDecision": ""
}
```

The Gemini provider validates the JSON structure and types and throws a typed error if the response is malformed, which is captured by the worker and stored in `errorMessage` with status `failed`.


## Development Notes

- Validation is handled via `class-validator` DTOs and Nest’s global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform` enabled.
- All summarization logic is accessed through the `SUMMARIZATION_PROVIDER` token; the Gemini provider is used in production modules, while the fake provider is used only in tests.
- Queue processing is handled by `CandidateSummariesWorker` via Bull and Redis.


## Assumptions

- The original project structure was not present, so a minimal NestJS and TypeORM setup was created from scratch following the requested workflow.
- Workspace ownership is represented by the `workspaceId` column on the `candidates` table and by the `X-Workspace-Id` request header.
- PostgreSQL is used as the primary database and Redis is used for the Bull queue.
- UUID generation in migrations relies on the `uuid-ossp` extension being available in PostgreSQL.
- Candidates are assumed to be managed elsewhere; only their documents and summaries are modeled in this service.
