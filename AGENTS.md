# Repository Guidelines

## Project Structure & Module Organization
- Keep product specs in `docs/`; existing `initial requirements.md` and `_reserveinfo.md` remain canonical drafts—move refinements into `docs/<domain>.md`.
- Frontend lives in `apps/web` (Next.js + shadcn-ui + Aceternity components). Organize routes by module (`app/(hypotheses)`, `app/(portfolios)`), and keep shared UI in `apps/web/components`.
- Each active service maps to `services/<service>` with `src/`, `api/`, `schemas/`, and `tests/`; prioritize the Hypothesis domain while staging future services under `services/_backlog/`.
- Shared packages go under `packages/` (`packages/contracts` for OpenAPI/JSON schemas, `packages/ui` for design system tokens); assets live in `apps/web/public`.
- Automation and infra scripts belong to `scripts/` and `infra/` (IaC, container definitions).

## Roadmap Focus
- Treat the Hypothesis service as the center of architecture, analytics, and UX decisions; anchor dashboards, experiments, and ROI flows to hypothesis data first.
- Park Onboarding, Readiness, and Voice services in the backlog; document discoveries but defer implementation until the hypothesis core is stable.
- Keep backlog specs in `docs/backlog/` and link open decisions from Hypothesis tickets.

## Build, Test, and Development Commands
- `pnpm install` — bootstrap the monorepo once package manifests are committed; rerun after dependency bumps.
- `pnpm dev --filter app-web` — launch the Next.js client with shadcn-ui theming for local UX validation.
- `pnpm build --filter app-web --silent` — run the production build headlessly; wire it into CI so the app always builds automatically without confirmations.
- `pnpm lint` — run ESLint + Prettier across apps and packages; required before opening a PR.
- `uv sync && uv run pytest` — install Python dependencies for domain services and execute unit tests; add `--maxfail=1` when iterating quickly.
- `docker compose up` — bring up service dependencies (vector DB, message broker) for end-to-end smoke tests.

## Coding Style & Naming Conventions
- Prefer TypeScript for front-end modules; stick to 2-space indentation, camelCase for variables, PascalCase for components, and kebab-case route folders.
- Backend services follow Pydantic/FastAPI patterns with snake_case modules and typed DTOs; keep request/response models versioned in `schemas/v1`.
- Always run `pnpm lint` and format via Prettier; for Python use `ruff format` + `ruff check --fix`.
- Surface human-readable labels everywhere: forms show names and titles instead of raw IDs, provide inline help, and respect accessibility color contrast despite neon theming.

## Testing Guidelines
- Co-locate unit tests under each module’s `tests/` with filenames `<unit>_test.ts` or `<unit>_test.py`.
- Target ≥80% statement coverage for critical services; document gaps in `docs/testing-notes.md`.
- Provide contract tests for each REST endpoint by replaying OpenAPI examples from `packages/contracts`.
- Before merge, run `pnpm test --filter app-web` and `uv run pytest`, plus any relevant integration suites via `docker compose`.

## Commit & Pull Request Guidelines
- Use Conventional Commits (`feat:`, `fix:`, `docs:`); scope by module (`feat(hypothesis): add prioritization matrix`).
- Keep PRs focused: include summary, linked Notion/Jira ticket, screenshots or Loom for UI changes, and test evidence.
- Update `AGENTS.md` when process details change; note any migrations or new env vars in the PR description and `docs/changelog.md`.

## Specification Workflow
- Treat `initial requirements.md` as source of truth; stage updates via PR with context, diagrams, and decision history.
- After each automated build, consult only `initial requirements.md`: mark the relevant items as done and add succinct notes describing the code or configuration changes so the spec and implementation stay aligned.
- When implementation diverges, add a short ADR under `docs/adr/<date>-<topic>.md` and cross-link the relevant spec sections.
