# Admin Panel Refactor Rule

## Folder structure

- `admin/admin-panel.tsx`: route-level shell only. It handles session guard, logout, and selects the active view.
- `admin/common/`: shared admin code only.
  - `types.ts`: shared admin DTO/type definitions.
  - `api.ts`: authenticated request helpers and error handling.
  - `session.ts`: localStorage keys and session/role helpers.
  - `ui.tsx`: shared form/list/notice UI primitives.
- `admin/auth/`: login screen and auth UI.
- `admin/dashboard/`: dashboard source.
- `admin/products/`: product admin source.
- `admin/orders/`: order admin source.
- `admin/media/`: shared banner/slider admin source.
- `admin/news/`: news admin source.
- `admin/contacts/`: contact admin source.
- `admin/users/`: user admin source.
- `admin/settings/`: setting admin source.

## Codex rule

When adding an admin feature, do not add new feature logic to `admin-panel.tsx`.
Create a source folder for the feature and keep shared UI/API/types in `admin/common`.
