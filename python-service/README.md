# Briefing Report Generator

A FastAPI-based service for generating professional briefing reports from structured input data. The service persists briefing data to a database, formats it into HTML reports using Jinja2 templates, and provides RESTful endpoints for CRUD operations and report generation.

## Tech Stack

- **FastAPI**: Asynchronous web framework for building APIs
- **SQLAlchemy**: ORM with async support for database operations
- **SQLite**: Database for development (easily configurable for PostgreSQL)
- **Alembic**: Database migration tool
- **Pydantic v2**: Data validation and serialization
- **Jinja2**: HTML templating engine
- **aiosqlite**: Async SQLite driver

## Features

- Create briefings with company information, key points, risks, and metrics
- Generate professional HTML reports with custom styling
- RESTful API endpoints for briefing management
- Asynchronous database operations
- Input validation with Pydantic schemas
- Modular architecture with separation of concerns

## Project Structure

```
├── alembic/
│   └── versions/
│       └── 001_initial.py
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models/
│   │   └── briefing.py
│   ├── schemas/
│   │   └── briefing.py
│   ├── routers/
│   │   └── briefings.py
│   ├── services/
│   │   └── briefing_service.py
│   ├── formatters/
│   │   └── report_formatter.py
│   └── templates/
│       └── report.html
├── alembic.ini
├── requirements.txt
├── .env
├── .gitignore
└── README.md
```

## Installation

1. **Clone or download the project**

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up the database**
   ```bash
   alembic upgrade head
   ```

4. **Configure environment variables**
   - Update `.env` file with your database URL if needed
   - Default: `DATABASE_URL=sqlite+aiosqlite:///./briefing.db`

## Running the Application

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### API Documentation

FastAPI automatically generates interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Create Briefing
**POST** `/briefings`

Creates a new briefing with points, risks, and metrics.

**Request Body:**
```json
{
  "companyName": "Acme Holdings",
  "ticker": "ACME",
  "sector": "Industrial Technology",
  "analystName": "Jane Doe",
  "summary": "Company overview...",
  "recommendation": "Buy recommendation...",
  "keyPoints": ["Point 1", "Point 2"],
  "risks": ["Risk 1"],
  "metrics": [
    {"name": "Revenue Growth", "value": "18%"}
  ]
}
```

**Response:** Full briefing object with generated ID

### Get Briefing
**GET** `/briefings/{id}`

Retrieves a briefing by ID.

**Response:** Full briefing object

### Generate Report
**POST** `/briefings/{id}/generate`

Generates an HTML report for the briefing.

**Response:**
```json
{
  "message": "Report generated"
}
```

### Get HTML Report
**GET** `/briefings/{id}/html`

Retrieves the generated HTML report.

**Response:** HTML content

## Validation Rules

- `companyName`: Required
- `ticker`: Required, automatically uppercased
- `summary`: Required
- `recommendation`: Required
- `keyPoints`: Minimum 2 items
- `risks`: Minimum 1 item
- `metrics[].name`: Must be unique within the briefing

## Database Schema

### briefings
- `id` (UUID, Primary Key)
- `company_name` (String)
- `ticker` (String, uppercase)
- `sector` (String, optional)
- `analyst_name` (String, optional)
- `summary` (Text)
- `recommendation` (Text)
- `is_generated` (Boolean, default false)
- `generated_at` (Timestamp, nullable)
- `html_content` (Text, nullable)
- `created_at` (Timestamp)

### briefing_points
- `id` (UUID, Primary Key)
- `briefing_id` (UUID, Foreign Key)
- `type` (Enum: 'key_point' | 'risk')
- `content` (Text)
- `display_order` (Integer)

### briefing_metrics
- `id` (UUID, Primary Key)
- `briefing_id` (UUID, Foreign Key)
- `name` (String)
- `value` (String)
- Unique constraint on (briefing_id, name)

## Development

### Running Tests
```bash
# Add test commands here when implemented
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "migration message"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Configuration

Environment variables in `.env`:
- `DATABASE_URL`: Database connection string

## License

This project is for demonstration purposes.