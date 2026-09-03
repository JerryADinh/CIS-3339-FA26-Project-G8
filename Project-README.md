# CIS 3339 Data Platform Project

## Project synopsis

Your team will take ownership of an existing full-stack web application and improve it. The goal is to understand, refactor, secure, extend, test, and prepare the provided application for deployment. You must build on the supplied codebase; do not replace it with a new application.

The application uses the MEVN stack:

- MongoDB for persistent data
- Express and Node.js for the backend REST API
- Vue 3, Vue Router, Pinia, Vite, and Tailwind CSS for the frontend

This is a senior undergraduate group project. Your work should demonstrate more than page creation: it should improve component design, application state, API behavior, security, data integrity, testing, setup, and deployment readiness.

Deadlines, team assignments, and submission links will be provided in Canvas.

## Application background

The Data Platform supports nonprofit organizations and their Community Health Workers (CHWs). A CHW can record clients, create events, maintain services offered by the organization, and register clients for events. The dashboard summarizes operational data such as recent attendance and clients by ZIP code.

The data model supports multiple organizations in one database. Each deployed application instance is configured for one organization with `ORG_ID`. Data belonging to one organization must never be exposed to another organization.

The template already contains client, event, service, organization, login, dashboard, and role-related code. Some functions are incomplete or inconsistent. Finding and improving those areas is part of the project.

## Learning objectives

By completing this project, your team should be able to:

1. Read and explain an unfamiliar full-stack codebase.
2. Refactor a Vue application from the Options API to the Composition API.
3. Design reusable components and composables for real application behavior.
4. Connect frontend state and workflows to a REST API.
5. Enforce authentication, authorization, and tenant isolation on the server.
6. Improve data validation and integrity in MongoDB operations.
7. Automate database initialization and make setup reproducible.
8. Produce, verify, and document a deployable frontend build.
9. Test important user workflows and API security rules.
10. Collaborate through issues, branches, pull requests, reviews, and meaningful commits.

## Template overview

The repository is organized into two applications:

```text
frontend/                 Vue 3 single-page application
  src/api/api.js          Axios API client
  src/components/         Chart components
  src/router/             Routes and navigation guard
  src/store/              Pinia login/session store
  src/views/              Dashboard and CRUD views

backend/                  Express REST API
  app.js                  Application setup and database connection
  auth/                   JWT authentication middleware
  models/                 Mongoose schemas and models
  routes/                 Client, event, service, org, and user routes
```

Before changing code, trace at least one complete workflow from a Vue view, through `frontend/src/api/api.js`, to an Express route and a Mongoose model.

## Required implementation work

The tasks below describe observable functionality. Teams may reorganize files and choose suitable libraries, but every acceptance criterion must still be met.

### F1. Migrate the frontend to the Vue Composition API

Convert all Vue views, components, and `App.vue` from the Options API or mixed API style to the Composition API using `<script setup>`.

The migration must preserve all existing client, event, service, dashboard, login, validation, and role-dependent behavior. Use appropriate Composition API features, including `ref`, `reactive`, `computed`, `watch`, lifecycle hooks, `defineProps`, `defineEmits`, `useRoute`, and `useRouter`.

Acceptance criteria:

- No Vue component under `frontend/src` contains `data()`, `methods`, `created`, or an Options API `export default` component definition.
- Route parameters, form validation, Pinia state, API calls, charts, and CRUD workflows continue to work.
- A page refresh and normal navigation produce no Vue warnings or JavaScript errors.

### F2. Create reusable asynchronous UI and API error handling

Implement a composable, such as `useApi`, that represents the state of an asynchronous operation. It should expose at least loading, success/data, empty, and error states. Use it in the client, event, and service search/list views and on the dashboard.

Centralize Axios response handling so components receive a consistent, human-readable application error. The interface must distinguish validation or server errors from a network failure. A `401` response must clear the invalid session and send the user to the login page.

Acceptance criteria:

- Each list visibly distinguishes loading, empty results, request failure, and loaded data.
- The backend being unavailable produces a useful message rather than a `TypeError` or `[object Object]`.
- Repeated pass-through `try/catch` blocks are removed from the API module.
- Errors are not silently discarded, and users can retry failed read operations.
- At least one automated frontend test covers success and failure behavior of the composable or API client.

### F3. Implement a reusable data browsing component

Replace the duplicated client, event, and service list markup with a reusable component, such as `DataTable`. It must support configurable columns and custom cell rendering without containing domain-specific client, event, or service rules.

Add useful data-browsing functions:

- ascending and descending column sorting;
- pagination with a visible result count;
- row activation by mouse and keyboard;
- a consistent empty state; and
- search reset/clear behavior.

Search criteria may be implemented in a separate reusable `SearchBar` component.

Acceptance criteria:

- The client, event, and service list views use the shared component.
- Sorting and pagination operate on the complete result set returned by the API, or use the server-side query contract implemented in B3.
- A row can be reached with the Tab key and opened with Enter or Space.
- Focus is visible, table headers are meaningful, and form controls have associated labels.
- Changing pages or clearing a search never displays stale results.

### F4. Improve session restoration and frontend access control

Restore a valid login session when the application reloads. Read the saved token during application startup, validate its structure and expiration, restore the Axios authorization header, and restore the user's Pinia state. Invalid, malformed, or expired tokens must be removed safely.

Use route metadata and a global router guard to restrict editor-only routes. Use an allowlist: only the exact `editor` role may access editor functions. Hiding a menu item is not sufficient security and does not replace backend authorization in task S1.

Acceptance criteria:

- A logged-in user remains logged in after a browser refresh while the token is valid.
- An invalid or expired token results in a clean logged-out state without an application crash.
- A viewer who enters an editor-only URL is redirected to an appropriate page.
- Roles other than the exact supported `editor` role do not receive editor UI permissions.
- Logout clears both stored and in-memory authentication state.

### F5. Improve destructive workflows, responsiveness, and accessibility

Create a reusable confirmation dialog for destructive or irreversible actions. Use it before client, event, and service deletion. The dialog must be keyboard accessible and manage focus correctly.

Make the application usable on a small screen. The current navigation should collapse behind a clearly labeled control at mobile widths, and data pages should remain usable without horizontal page overflow.

Acceptance criteria:

- Canceling a confirmation causes no API request; confirming causes exactly one request.
- The dialog traps focus, closes on Escape, restores focus to its trigger, and provides an accessible name.
- The application is usable with keyboard-only navigation.
- All informative images have meaningful alternative text; decorative images use empty alternative text.
- The primary workflows work at a 375-pixel viewport width.
- The team submits before-and-after Lighthouse or axe results and explains any unresolved accessibility findings.

### F6. Make dashboard visualizations reactive and reusable

Refactor the Chart.js components with the Composition API. A chart must update when its input props change and must destroy its Chart.js instance before unmounting. Use a shared chart wrapper or composable to remove duplicated lifecycle code.

Connect the dashboard charts to backend data rather than hard-coded values. Include clear loading, empty, and error states and a text/table alternative for the chart values.

Acceptance criteria:

- Changing chart data updates the chart without reloading the page.
- Navigating away destroys the chart instance and does not accumulate detached canvases or listeners.
- Dashboard data is scoped to the configured organization.
- Chart labels, legends, colors, and a nonvisual data alternative make the information understandable.

### S1. Security: enforce roles and organization isolation in the backend

Authentication alone is not authorization. Add server-side role-based access control and consistently scope every database operation to the configured organization.

Required policy:

| Operation | Unauthenticated | Viewer | Editor |
| --- | --- | --- | --- |
| Public organization/dashboard information approved by the team | As documented | Read | Read |
| Read clients, events, and services | Denied | Allowed for own organization | Allowed for own organization |
| Create, update, delete, register, or deregister | Denied | Denied | Allowed for own organization |

Implement reusable middleware, for example `requireAuth` and `requireRole('editor')`. Do not rely on the frontend to enforce this policy.

Review all queries, including list, detail, update, delete, aggregation, attendee, and dashboard queries. Operations such as `find({})`, `findByIdAndUpdate(id, ...)`, or `findByIdAndDelete(id)` are unsafe in a multi-organization application unless organization ownership is also verified.

Additional security requirements:

- Validate required environment variables at startup and fail with a useful message if configuration is missing.
- Restrict CORS to configured allowed origins instead of `*` in the deployable configuration.
- Validate identifiers and request data; malformed input must receive a `400` response rather than a server crash.
- Login failures must not reveal whether a username exists.
- For this course project, commit the grading `.env` files described in D1 so the instructor can run the project without receiving configuration separately. These values must belong to this project only and must never be reused for another system.

Acceptance criteria:

- Direct API tests show that a viewer receives `403` for every mutation endpoint.
- Missing or invalid authentication receives `401`; insufficient permission receives `403`.
- A valid user cannot read or mutate a resource belonging only to another organization.
- List and dashboard endpoints never mix data from multiple organizations.
- Automated backend tests cover at least one allowed and one denied request for every resource type.

### B1. Implement service lifecycle management with soft deletion

The service schema has a status field, but the current delete route performs a hard delete. Replace this behavior with a clear service lifecycle such as an `active` Boolean or a validated status enum.

Inactive services must remain available when displaying historical events, but they must not be offered when creating a new event. Editors can activate or deactivate services; viewers can only read them.

Acceptance criteria:

- Deactivating a service does not remove the document or break historical event data.
- The create-event form shows only active services for the configured organization.
- Existing events continue to display inactive services already associated with them.
- Status values are validated, and invalid transitions receive a `400` response.
- The behavior is covered by an API integration test and a frontend workflow test.

### B2. Make event registration consistent and safe

Improve the functions that register and deregister a client for an event. Validate that both records exist, belong to the configured organization, and are in a valid state. Make repeated requests safe: a client must not be registered twice, and deregistering a client who is not registered must return a consistent documented result.

Use a single source of truth for the relationship unless the team implements an atomic transaction that reliably maintains both sides.

Acceptance criteria:

- Cross-organization registration and deregistration are rejected.
- Concurrent or repeated requests cannot create duplicate attendees.
- Invalid event and client IDs produce consistent `400` or `404` responses.
- The response contains a documented JSON shape rather than an unrelated plain-text message.
- Integration tests cover success, duplicate registration, missing records, unauthorized role, and cross-organization attempts.

### B3. Add a validated server-side query contract

Enhance the client, event, and service list endpoints with a consistent query contract for search, pagination, and sorting. This task should support the reusable frontend table from F3 and prevent unnecessarily loading every record.

A suggested contract is:

```http
GET /clients?page=1&limit=20&sort=lastName&order=asc&search=smith
```

A suggested response is:

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "totalItems": 0,
  "totalPages": 0
}
```

Acceptance criteria:

- Page and limit values are bounded and validated.
- Sort fields are selected from an allowlist; arbitrary object fields cannot be supplied.
- User search text is escaped or otherwise handled safely before use in a regular expression.
- Every query includes organization scope and returns stable ordering.
- Client, event, and service endpoints use a consistent metadata shape.
- The frontend preserves query state when navigating to a detail page and back.

### B4. Standardize validation, errors, and health reporting

Add centralized Express error handling and a consistent JSON error response. Validate bodies, query parameters, and route parameters at the API boundary. Add a health endpoint suitable for deployment checks.

Suggested error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

Acceptance criteria:

- Common errors use consistent HTTP status codes and JSON bodies.
- Internal stack traces, secrets, and database details are not returned to clients.
- `GET /health` reports whether the process is running and whether MongoDB is ready, without exposing credentials.
- The process handles database startup failure predictably rather than reporting a successful server startup.
- Tests cover validation errors, not-found errors, authorization errors, and an unexpected server error.

### D1. Automate database initialization and seed data

Replace manual collection creation and the one-off password hash utility with a database initialization script. Add an npm command such as:

```powershell
cd backend
npm run db:init
```

The script must create or update the minimum development data needed to run and grade the application:

- one organization whose ID is compatible with `ORG_ID`;
- the required viewer account with username `user` and password `user`;
- the required editor account with username `admin` and password `admin`;
- representative clients, services, and events, including at least one event registration; and
- any indexes or constraints required by the implementation.

The following demonstration accounts are mandatory and must work immediately after database initialization:

| Role | Username | Password |
| --- | --- | --- |
| Viewer | `user` | `user` |
| Editor | `admin` | `admin` |

The database initialization script may read these initial values from environment variables, but it must hash the passwords with bcrypt before writing user documents. The MongoDB `users` collection must never contain plaintext passwords.

For grading convenience, commit `backend/.env` and `frontend/.env` with a complete working grading configuration. The backend file must include the database connection information, organization ID, JWT secret, CORS origin, and the two seed-account credentials. A suitable structure is:

```env
MONGO_URL=<working course-project MongoDB connection string>
PORT=3000
ORG_ID=<course-project organization ID>
JWT_SECRET=<course-project-only JWT secret>
CORS_ORIGIN=http://localhost:5173
SEED_VIEWER_USERNAME=user
SEED_VIEWER_PASSWORD=user
SEED_EDITOR_USERNAME=admin
SEED_EDITOR_PASSWORD=admin
```

The frontend file must contain the backend URL used for grading:

```env
VITE_ROOT_API=http://localhost:3000
```

These committed credentials are a course-project exception intended to make grading reproducible. Use a dedicated database and least-privilege database user, do not reuse personal or production credentials, and rotate or disable the committed database credentials after grading.

Acceptance criteria:

- Running `npm run db:init` on an empty configured database creates all required data.
- Running it a second time does not create duplicate organizations, users, or sample records.
- The script validates configuration, prints a useful summary, and returns a nonzero exit code on failure.
- The normal command is non-destructive. If a reset option is provided, it requires an explicit flag and is clearly documented.
- Both grading `.env` files are committed and contain a complete working configuration, including the required `user`/`user` and `admin`/`admin` seed credentials.
- A grader can initialize the database and log in without manually editing MongoDB.

### D2. Deliver and verify a deployable frontend build

The project must produce a deployable static frontend with Vite:

```powershell
cd frontend
npm install
npm run build
```

The generated `frontend/dist` directory must be usable by a static web host. Runtime API configuration, router history fallback, asset paths, and cross-platform path handling must be documented and tested.

Acceptance criteria:

- `npm run build` completes with exit code 0 and without unresolved imports.
- `npm run serve` (or `npm run preview`) can serve the production build locally for verification.
- Refreshing a nested route such as `/clientdetails/:id` works when the documented SPA fallback is enabled.
- The build uses the documented `VITE_ROOT_API` value and contains no hard-coded localhost dependency.
- The deployed frontend can reach the deployed backend through the configured CORS policy.
- The README identifies the hosting configuration and exact deployment steps.
- The final demonstration uses the production build, not the Vite development server.

## Testing requirements

Add test commands to both applications. A submission is not complete if `npm test` is only a placeholder.

At minimum, tests must cover:

- Composition API form validation and submission;
- loading, empty, error, and success states;
- frontend role routing and session restoration;
- one complete client, event, and service workflow;
- backend authentication and editor/viewer authorization;
- organization isolation;
- service soft deletion;
- event registration integrity; and
- database initialization.

Document the exact commands used to run tests. Test data must not depend on the team's production database.

## Documentation requirements

Update the repository documentation so that a new developer or grader can reproduce the project. Include:

- prerequisites and supported Node.js version;
- frontend and backend installation commands;
- committed `backend/.env` and `frontend/.env` files with a working grading configuration and descriptions of every variable;
- database initialization instructions;
- development startup commands;
- test, lint, and build commands;
- demonstration users and roles;
- API documentation with request, response, authentication, and error examples;
- deployment instructions, including SPA fallback and CORS configuration;
- an architecture diagram; and
- known limitations that remain after the project.

The committed `.env` values must be dedicated to this course project. Never include personal credentials, credentials reused by another system, production secrets, or unrelated access tokens in the repository, screenshots, reports, or presentation.

## Sprint deliverables

### Sprint 1: functional specification and project plan

Submit one PDF through Canvas. It must contain:

1. A high-level explanation of the frontend, backend, database, and their interactions.
2. At least two visual user-flow diagrams based on the current template.
3. A trace of one existing request from the Vue view to the database and back.
4. A gap analysis mapping every required task in this guideline to current code.
5. A testable functional specification for the proposed changes.
6. A timeline with owners, dependencies, review assignments, and expected completion dates.
7. An appendix describing AI tools used, prompts or questions asked, how outputs were verified, and which decisions were made by the team.

AI tools may help the team understand or explain the template. Team members remain responsible for verifying all generated analysis and code.

### Sprint 2: frontend implementation

Implement F1 through F6, D2, and the frontend behavior and API contracts needed by S1, B1, and B3. Backend responses may be mocked where a Sprint 3 endpoint does not yet exist, but mocks must use the agreed API response shapes and be easy to remove.

Submit the GitHub repository link through Canvas. The main branch must build and run. Include frontend test results and a short demonstration of the required workflows.

### Sprint 3: integrated backend, database, security, and deployment

Complete S1, B1 through B4, D1, D2, integration tests, API documentation, and deployment documentation. Replace all frontend mocks with real API integration.

Submit through Canvas:

- the GitHub repository link;
- the required technical report as a PDF;
- the committed grading `.env` files, including the working course-project database connection and the required demonstration-account configuration;
- the deployed application URLs, if deployment is required by the instructor; and
- a 10-15 minute group presentation video at the location specified in Canvas.

The video must show database initialization, login as both roles, a denied viewer action, organization isolation tests, client/event/service workflows, `npm run build`, and the locally served or deployed production build.

Frontend corrections are allowed during Sprint 3 when needed for integration.

### Sprint 4: individual peer evaluation

Complete the peer evaluation in Canvas. Evaluation details and the deadline will be provided by the instructor.

## Repository and teamwork expectations

- Use the GitHub repository for your team project.
- Agree on a branch, review, and merge process before implementation begins.
- Track required work with issues or an equivalent project board.
- Use pull requests and peer review for substantial changes.
- Each member must make multiple meaningful commits that reflect their own implementation and testing work.
- Comments, formatting-only changes, generated build output, and commits made on another person's behalf do not demonstrate an equal code contribution.
- Only the default branch will be graded unless the instructor states otherwise.
- Do not submit a ZIP archive unless Canvas explicitly asks for one.

## Suggested evaluation rubric

| Area | Points |
| --- | ---: |
| Sprint 1 specification, analysis, flows, and plan | 10 |
| Composition API migration and component/composable design | 15 |
| Frontend functional enhancements, UX, and accessibility | 15 |
| Backend data functions and API quality | 15 |
| Security: roles, authentication behavior, and organization isolation | 15 |
| Database initialization and reproducible setup | 10 |
| Tests and evidence of verification | 10 |
| Deployable production build and documentation | 10 |
| **Total** | **100** |

The instructor may adjust this rubric or apply submission deductions in Canvas. A project that cannot be installed, initialized, tested, or built using its documented commands may receive no credit for the affected deliverable.

## Definition of done

The project is complete only when another person can clone the repository and, using only the committed documentation and their own environment values:

1. install frontend and backend dependencies;
2. initialize an empty database with `npm run db:init`;
3. start the backend and frontend;
4. log in as a viewer and as an editor;
5. verify the documented authorization and organization-isolation rules;
6. complete the client, event, and service workflows;
7. run the automated tests successfully; and
8. create and serve the production frontend with `npm run build`.
