# Changelog

## 2025-11-05 — Hypothesis service integration

- Connected the web app hypothesis workspace to the live FastAPI service, replacing mock data with API responses.
- Added create/transition flows on the frontend that call the new `/hypotheses` endpoints.
- Normalised API responses for UI consumption (relative timestamps, ROI metrics) and surfaced backend validation errors in the modal.
- Switched Hypothesis persistence to PostgreSQL (docker-compose service, psycopg driver, JSON-backed columns) with updated local setup docs.
