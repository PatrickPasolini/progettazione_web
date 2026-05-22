# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

---

## Common Commands

Package manager is **npm** (not pnpm).

```bash
# Dev servers
npm run start:api          # NestJS API on port 3333
npm exec nx serve ui       # React UI (Vite dev server)

# Build
npm exec nx build api
npm exec nx build ui

# Test (single project)
npm exec nx test api
npm exec nx test server-users   # libs/server/users

# Lint
npm exec nx lint api

# E2E
npm exec nx e2e api-e2e
npm exec nx e2e ui-e2e

# Typecheck
npm exec nx typecheck api
```

## Architecture

Nx monorepo — **university exam management system** (`appelli_db`).

### Apps
| Project | Tech | Notes |
|---------|------|-------|
| `apps/api` | NestJS + Webpack | All routes under `/api` prefix; Swagger at `/api/docs` |
| `apps/ui` | React 19 + Vite + react-router-dom v6 | Frontend (minimal, mostly scaffold) |
| `apps/api-e2e` | Jest | API integration tests |
| `apps/ui-e2e` | Playwright | UI e2e tests |

### Libraries
| Path | Import | Purpose |
|------|--------|---------|
| `libs/database` | `@org/database` | `DatabaseModule` — TypeORM/PostgreSQL setup, `autoLoadEntities: true`, `synchronize: true` |
| `libs/server/users` | `@server/users` | `UserEntity` base, `UsersModule`, `UserRole` enum |
| `libs/server/auth` | `@server/auth` | JWT + Passport (local + jwt strategies), login/register endpoints |
| `libs/server/security` | `@server/security` | Shared guards (`JwtAuthGuard`, `RolesGuard`) and decorators (`@CurrentUser`, `@Roles`) |
| `libs/server/teacher` | `@server/teacher` | `TeacherEntity` extends `UserEntity` via `@ChildEntity` |
| `libs/server/course` | `@server/course` | Courses; belong to a `TeacherEntity` |
| `libs/server/exam` | `@server/exam` | Exam entities; linked to teacher and course |
| `libs/server/session` | `@server/session` | Exam session scheduling |
| `libs/server/degree` | `@server/degree` | Degree programmes (`DegreeType` enum) |
| `libs/server/books` | `@org/books` | Books with `AuthorEntity`, `CategoryEntity`, `AddressEntity` |

### Key Design Patterns

**Single Table Inheritance (STI)** — `UserEntity` uses `@TableInheritance` on `role` column (enum). `TeacherEntity` uses `@ChildEntity(UserRole.TEACHER)`. Add new user subtypes the same way.

**Auth flow** — local strategy validates email/password → issues JWT → jwt strategy validates Bearer token on protected routes. Guards live in `@server/security`, not in each feature module.

**Roles** — `USER`, `ADMIN`, `TEACHER`, `SECRETARY`. Use `@Roles(UserRole.TEACHER)` + `RolesGuard` from `@server/security`.

### Environment

`.env` required at workspace root:
```
PORT=3333
PG_HOST=127.0.0.1
PG_PORT=5433
PG_USER=postgres
PG_PASSWORD=...
PG_DATABASE=appelli_db
SECRET_KEY=...
```
`DatabaseModule` also accepts `PG_USERNAME` (alias for `PG_USER`).
