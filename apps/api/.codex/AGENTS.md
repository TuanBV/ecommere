# Codex Instructions — NestJS Prisma API

These instructions apply to this API repository. Follow them whenever Codex adds or changes backend code.

## Project stack

- Framework: NestJS with Express adapter.
- Database access: Prisma through `src/prisma/prisma.service.ts` only.
- Validation: DTO classes in `src/modules/<module>/dto/` using `class-validator` and `class-transformer`.
- Response shape: controllers return `ok(data, meta?)` from `src/common/api-response.ts`.
- Module root: `src/modules/<module>/`.

## Required module flow

Use this direction only:

```txt
controller -> service -> repository -> Prisma
repository -> projector -> public response shape, when mapping is needed
```

Controllers and services must never inject or call `PrismaService` directly.

## Folder convention

```txt
src/modules/<module>/
  <module>.module.ts
  <module>.controller.ts
  <module>.service.ts
  <module>.repo.ts
  <module>.projector.ts        # optional, use for mapped responses
  dto/
    *.dto.ts
```

## Prisma rules

- Edit `prisma/schema.prisma` for model changes.
- Keep the current datasource provider unless the full project is migrated.
- Use `@map`, `@@map`, `@relation`, and `@@index` consistently with existing tables.
- After schema changes, run `npm run prisma:generate` and create/apply the migration using the project workflow.

## DTO and validation rules

- Every request body/query that accepts structured data must have a DTO class.
- Do not use `Record<string, unknown>` in controllers or services for API bodies.
- Use `@IsString`, `@IsOptional`, `@IsInt`, `@Min`, `@Max`, `@IsEmail`, `@IsBoolean`, `@IsEnum`, `@Type(() => Number)`, and similar decorators.
- Defaults belong in DTO classes for optional pagination/sort/status fields.
- Keep DTOs aligned with frontend forms.

## Repository rules

- Repositories are the only layer allowed to access Prisma.
- Constructor should inject `PrismaService`.
- Use `select`/`include` intentionally and never expose sensitive fields such as user passwords.
- Repositories may throw Nest HTTP exceptions for DB-backed business failures.
- Do not catch/rethrow Prisma errors just to log them.

## Service rules

- Services receive validated DTOs from controllers.
- Services orchestrate business rules and call repositories.
- Services should not wrap data with `ok()`; controllers do that.
- Services should not import Prisma types unless only needed for public non-DB enum typing.

## Controller rules

- Controllers only receive DTOs/params, call service, and return `ok(...)`.
- Protected admin routes must use `JwtAuthGuard` and `AdminRoleGuard`.
- Do not place business rules or Prisma queries in controllers.

## Projector rules

Use `<module>.projector.ts` when returning complex Prisma rows.

- Projectors must be pure mapping functions.
- Convert Decimal to number/string consistently.
- Convert BigInt to string.
- Strip sensitive fields.
- No DB calls and no business logic in projectors.

## Frontend readiness checklist

After changing an endpoint, check the frontend/admin screens that consume it:

- List endpoints return all table/card fields and pagination/filter metadata when needed.
- Detail endpoints return nested fields displayed by the UI.
- Create/edit DTOs include every form field.
- Admin endpoints never return passwords.
