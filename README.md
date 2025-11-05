# K2Tech AI Lab EVO

Hypothesis-centric platform scaffolding for corporate AI labs. This snapshot includes the production modules for the first release while deferring Onboarding, Readiness, and Voice services to a backlog stream.

## Structure

- `apps/web` — Next.js 13 app with neon dark theme inspired by shadcn-ui + Aceternity.
- `services/*` — FastAPI microservices per domain (hypothesis, experiments, value, analytics, workflow, etc.).
- `packages/ui` — shared frontend primitives.
- `packages/contracts` — JSON schemas for service contracts.
- `docs/*` — specifications and backlog notes.
- `scripts/`, `infra/` — reserved for automation and deployment assets.

## Getting Started

1. Install dependencies with `pnpm install` (front end) and `uv sync` per service directory when backend dependencies are declared.
2. Start shared infrastructure with `docker compose up postgres -d` (PostgreSQL 16, exposed on `localhost:5433`).
3. Launch the web app using `pnpm dev --filter app-web`.
4. Run FastAPI services locally via `uv run --project services/hypothesis dev` (and analogous commands for other services).
5. Build the UI headlessly in CI with `pnpm build --filter app-web --silent`.

Refer to `AGENTS.md` for full contributor guidance and operational expectations.
