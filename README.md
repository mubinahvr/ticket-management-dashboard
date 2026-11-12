# SupportDesk – Ticket Management Dashboard

A responsive React + TypeScript customer-support ticket dashboard built as an interview/training project. It includes mock login, role-based UI permissions, protected routing, ticket CRUD, search, filters, sorting, pagination, RTK Query API caching, optimistic bulk status updates with rollback, bulk assignment, a service layer, local persistence, reusable components, tests and GitHub Actions CI.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Administrator | admin@demo.com | admin123 |
| Support Manager | manager@demo.com | manager123 |
| Support Agent | agent@demo.com | agent123 |\n| Support Agent | agent2@demo.com | agent123 |

The first demo agent sees tickets assigned to Taylor Smith. Morgan Chen is also available as an assignment target. The manager sees all seeded tickets but cannot delete. The administrator can create, edit, assign and delete.

## Scripts

```bash
npm run dev        # development server
npm run typecheck  # TypeScript validation
npm run lint       # ESLint
npm test           # Vitest tests
npm run build      # production build
npm run preview    # preview production build
```

## Architecture

- `src/context`: mock authentication context and current session.
- `src/features/tickets/services/ticketApi.ts`: RTK Query endpoints, generated hooks, cache tags, mutations and optimistic updates.
- `src/hooks/useTicketSelection.ts`: selection state kept on the client, independent of cached server data.
- `src/services`: isolated authentication and ticket data access.
- `src/components`: reusable ticket table, form, modal and statistic card.
- `src/hooks`: typed Redux hooks and debounced value hook.
- `src/utils`: permission checks, filtering, sorting and statistics.
- `.github/workflows/frontend-ci.yml`: lint, typecheck, test and build checks.

## Data and API notes

This exercise uses a mock service backed by browser `localStorage`; it does not call a real backend. `VITE_API_BASE_URL` is provided as environment configuration groundwork. The RTK Query API is configured with `fetchBaseQuery` and `VITE_API_BASE_URL`; the current endpoints use `queryFn` to call the local mock service because this project has no backend. Replace those `queryFn` implementations with `query` endpoint definitions when the backend contract is available. The demo bulk service validates all selected IDs before writing, so its simulated operation is all-or-nothing; partial success must be implemented only if the real backend returns per-ticket outcomes.

## Security notes

Authentication and role checks are intentionally mocked for learning. Client-side route guards and hidden controls are not security boundaries. A production backend must authenticate each request and enforce ticket visibility, per-ticket authorization and assignment permissions server-side. Frontend role checks are only a usability layer. Demo passwords are not production credentials. Never put secrets in `VITE_*` variables because they are exposed in the browser bundle.

## Suggested interview walkthrough

1. Sign in as each role and compare ticket visibility/actions.
2. Search by ticket ID, customer or subject; combine status and priority filters.
3. Create, edit, change status and delete a ticket as administrator.
4. Explain the service → RTK Query endpoint → cache/tag invalidation → generated hook → component data flow. Bulk status updates optimistically patch the list and detail caches and undo those patches if the request fails.
5. Explain why the UI permission checks must be repeated by the backend in production.
