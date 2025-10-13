# B2B Marketplace — Developer Guide

This repository contains the backend (FastAPI + PostgreSQL) and mobile frontend (React Native / Expo).

## Quickstart (backend)

1. Create Python virtualenv and install dependencies

```pwsh
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Set up environment variables — copy `.env.example` to `.env` and edit values.

```pwsh
copy .env.example .env
# Edit .env to set SECRET_KEY and other values
```

3. Run the app locally

```pwsh
uvicorn app.main:app --reload
```

## Code Quality

We use black, isort and flake8 for formatting and linting, enforced via pre-commit.

Install and enable pre-commit hooks:

```pwsh
pip install pre-commit
pre-commit install
pre-commit run --all-files
```

Run tests with coverage (80% minimum enforced):

```pwsh
pytest
```

## Docker

Build and run with Docker Compose:

```pwsh
docker compose build
docker compose up -d
```

Backups are written to the `backups` volume. See `BACKUP_README.md` for details.

## Observability

- Metrics: `/metrics` (Prometheus) — enabled when `starlette-exporter` is installed.
- Error tracking: Sentry — set `SENTRY_DSN` in env to enable.
- Structured JSON logs: uses `structlog` and includes `X-Request-ID` headers for tracing.

## API docs export

A small script `scripts/export_openapi.py` can generate `docs/export.md` from the running app's OpenAPI schema.

```pwsh
python scripts/export_openapi.py
```

*** End Patch