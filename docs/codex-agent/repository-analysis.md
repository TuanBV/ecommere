# Repository Analysis

## Tech stack and architecture

This is an npm-workspaces TypeScript ecommerce monorepo. `apps/web` is Next.js 15 App Router with
React 19, Tailwind CSS, Zustand, React Hook Form, and Zod. `apps/api` is NestJS 10 on Express with
Prisma 6 and MariaDB 10.11. API modules follow `controller -> service -> repository -> Prisma`;
only repositories may access `PrismaService`. The frontend separates public `(site)` routes from
the `(admin)` admin panel and prefers React Server Components.

## Commands

- Install: `npm ci` in CI; `npm install` for local workspace setup.
- Build: `npm run build` (API, then web).
- Lint: `npm run lint`; currently API ESLint 9 has no flat config and the web script uses unavailable
  `next lint`, so both fail/unavailable and must be reported rather than silently skipped.
- Format: `npm run format:check -w apps/web`; write formatting is `npm run format -w apps/web`.
- Type check: `npx tsc --noEmit -p apps/api/tsconfig.json` and
  `npx tsc --noEmit -p apps/web/tsconfig.json`.
- Tests: no unit, integration, or end-to-end test script/runner is configured.
- Prisma generation: `npm run prisma:generate`.
- Runtime: `docker compose up -d --build`.

## Database and migrations

`apps/api/prisma/schema.prisma` models a MySQL-compatible MariaDB database. Initialization uses
`scripts/dump-core.sql` plus `database/init/*.sql`. Incremental migrations are reviewed raw SQL in
`database/migrations/` and are applied by the Docker `db-init` service; Prisma Migrate is not the
current mechanism. The dump and local admin seed contain sensitive/local data and are denied to
automation by default.

## Deployment

Docker Compose builds MariaDB, API, and web services. `scripts/deploy-vps.sh` performs a VPS Docker
deployment. There is no identified cloud provider, GitHub CD workflow, or protected environment;
the Agent Kit therefore adds no deployment behavior.

## Git strategy and CI/CD

The checked-out/default remote branch is `main`; no `develop` ref exists. Existing commits use
short imperative messages. No `.github/workflows` existed at audit time. The kit defaults to the
repository variable `CODEX_BASE_BRANCH`, then an existing `develop`, then the GitHub default branch.
Agent branches are stable per Issue: `codex/issue-<number>-<slug>`. Draft PRs require human review;
no automation merges.

## Security-sensitive areas

- JWT authentication, admin role guards, password hashes, and local admin seed data.
- Checkout customer name, phone, email, and address (PII).
- Upload handling and the bind-mounted `uploads/` tree.
- `FacebookPost.pageAccessToken`, application secrets, `.env*`, SQL dumps, and VPS scripts.
- GitHub workflows, Codex prompts/rules/skills, and scripts are control-plane code.
- Lockfiles, migrations, schema changes, and GitHub permission changes affect the supply chain.

## Assumptions

- GitHub-hosted Ubuntu runners provide Bash, Git, Node, npm, Python 3, and `gh`.
- `GITHUB_TOKEN` is the default write identity; a GitHub App token is optional.
- No automated test can be claimed until a test script is added.
- Action major tags are used because this repository had no SHA-pinning policy; owners may pin
  audited commit SHAs later.
- The Codex Action accepts `prompt-file`, `output-file`, `output-schema-file`, and sandbox inputs as
  documented by its official repository.

## Agent Kit disposition

Create root Codex agents/rules, discoverable `.agents/skills`, Issue form, prompts/schema, isolated
Issue and PR-review workflows, baseline CI, deterministic scripts, and operational documentation.
Keep nested app `AGENTS.md`, existing `.claude` automation, Docker deployment, database files, and
all business code unchanged.
