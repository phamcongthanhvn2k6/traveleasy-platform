# PROJECT_ARCHITECTURE.md — Vexere Clone (Modular Monolith)

> **Status:** Architectural proposal (approved for design, **no application code yet**)
> **Last validated against:** `domain.md`, `SRS_Vexere.md`, `database_design.md`, `class_diagram.md`, `mô tả database/schema.sql`
> **Ownership rules preserved:** This document is a *proposal artifact*. It must never drift from the five canonical documents. When a canonical document changes, this file must be re-synced.

---

## 0. Architecture Decision (ADR-001)

| Decision | Rationale |
|---|---|
| **Modular Monolith** (single deployable Spring Boot app), NOT microservices | MVP/portfolio scope, 36 tables, ~19 aggregate roots, heavy cross-aggregate invariants (booking ↔ seat hold ↔ refund); microservices would add distributed-transaction pain with zero benefit at this scale |
| **Same runtime, physical module boundaries** (Java `module` / strict Maven modules) | Enforces compile-time dependency control; prevents the "ball of mud" that kills monoliths |
| **Clean/Hexagonal within each module** (`domain` · `application` · `infrastructure` · `presentation`) | Isolates business rules; makes modules testable and portable |
| **DDD tactical patterns** | Already the source of truth in `class_diagram.md` — aggregates, VOs, repositories, domain services |
| **Outbox + domain events for cross-cutting concerns** | Decouples Booking ↔ Notification, Payment ↔ Notification, Trip ↔ Search projection, without distributed transactions |
| **React (Vite) + TypeScript feature-first frontend** | Matches the existing `vexere-admin-prototype` stack (React 19, Vite 8, TS, Tailwind, react-router v7) |

> [!NOTE]
> Revisit this decision only if: a real team grows, a hard isolation boundary is demanded by an external consumer (e.g. third-party B2B resellers), or per-module scaling is proven necessary. Document that decision as ADR-002.

---

## 1. Architectural Principles

1. **High cohesion, low coupling.** Every module owns its aggregates end-to-end. No cross-module table access — only calls through the module's public API (ports).
2. **Dependency rule.** Dependencies point *inward*. `domain` depends on nothing; `infrastructure` points at `application`+`domain`; `presentation` is the outermost shell. Never the reverse.
3. **No circular dependencies.** Enforced by Maven module graph + ArchUnit test + `jdeps`.
4. **Aggregate integrity.** One aggregate root = one repository = one transaction root. Cross-aggregate invariants are orchestrated by an application *use-case/saga*, never by one aggregate mutating another directly ([BookingOrchestrationService] in `class_diagram.md`).
5. **Snapshot immutability.** The "snapshot is immutable" pattern already used for `trip_seat_prices`, `trip_points`, `trip_shuttle_services`, `tickets.seat_price`, `cancellation_policy` (Rules A, F, G, D7, FIX 5) **must be encoded in code, not just DB triggers**.
6. **Redis is not a competing source of truth.** Redis holds *temporary* Soft/Hard Hold state; DB `trip_seats.status` is the persistent projection. Eventual consistency is **mandatory, not optional** (see `class_diagram.md` M3 note).
7. **Async by default for side-effects.** Emails/SMS, search projection refresh, audit-of-notifications → outbox → async consumer. Sync only for the money path and read-your-write operations the user awaits.
8. **Fail loudly on money.** Payment/refund/reschedule paths use pessimistic locking + explicit transaction boundaries; never silent swallow.
9. **Observability-first.** Structured logs, correlation/trace IDs, OpenTelemetry, audit via append-only `audit_logs`.
10. **Pragmatism rule.** Avoid "architecture astronaut" behavior: a module earns a place only if it owns real aggregates. No speculative abstraction.

---

## 2. Backend Architecture (Spring Boot, Modular Monolith)

### 2.1 Physical module map

```
vexere-backend/
├── pom.xml                        (parent BOM: versions, pluginManagement)
├── vexere-common/                 (shared, dependency-light)
├── vexere-identity/               (authN/authZ, users, roles)
├── vexere-fleet/                  (vehicles, layout, seats)
├── vexere-scheduling/             (routes, trips, inventory, seat hold)
├── vexere-booking/                (booking, ticket, reschedule)
├── vexere-payment/                (payment, refund, gateway adapter)
├── vexere-rating/                 (review, review report, moderation)
├── vexere-tenant/                 (bus company, admin config, banner, audit)
├── vexere-notification/           (email/SMS dispatch)
├── vexere-search/                 (read model / search projection)
├── vexere-bootstrap/              (Spring Boot runnable: wires all modules)
└── vexere-integration-tests/      (end-to-end)
```

### 2.2 Why these modules (traceability to tables / class diagram)

| Module | Owning aggregates (from `class_diagram.md`) | Owning tables (from `schema.sql`) |
|---|---|---|
| `identity` | User, RefreshToken | `users`, `refresh_tokens` |
| `fleet` | Vehicle, SeatLayoutTemplate, VehicleSeatLayout, SeatType | `vehicles`, `vehicle_images`, `seat_layout_templates`, `template_seat_slots`, `seat_types`, `vehicle_seat_layouts`, `seat_position_assignments` |
| `scheduling` | Location, BusCompanyLocationConfig, RouteTemplate, Trip, CancellationPolicy | `administrative_provinces`, `administrative_communes`, `locations`, `bus_company_location_configs`, `route_templates`, `route_template_stops`, `route_template_seat_prices`, `route_template_shuttle_services`, `cancellation_policies`, `cancellation_rules`, `trips`, `trip_points`, `trip_seats`, `trip_seat_prices`, `trip_shuttle_services` |
| `booking` | Booking, Ticket, RescheduleRecord | `bookings`, `tickets`, `ticket_reschedule_histories` |
| `payment` | PaymentTransaction, RefundTransaction | `payment_transactions`, `refund_transactions` |
| `rating` | Review, ReviewReport | `reviews`, `review_reports` |
| `tenant` | BusCompany, Banner, PaymentGatewayConfig, NotificationGatewayConfig, AuditLog | `bus_companies`, `banners`, `payment_gateway_configs`, `notification_gateway_configs`, `audit_logs` |
| `notification` | (no table) — dispatcher only | — |
| `search` | (no table) — read model | — |

> The six "system" tables with no direct aggregate owner (`refresh_tokens`, `audit_logs`) live in `identity` and `tenant` respectively as cross-cutting infrastructure owning those persistence concerns.

### 2.3 Inside each module (Hexagonal / Clean vertical slice)

```
vexere-booking/
├── domain/
│   ├── model/            (aggregate roots: Booking, Ticket; entities; VOs: Money, QRCode, PassengerInfo)
│   ├── service/          (domain services, e.g. BookingOrchestrationService)
│   ├── event/            (domain events: BookingConfirmed, TicketCancelled, ...)
│   └── repository/       (Java interfaces, e.g. BookingRepository)
├── application/
│   ├── port/in/          (use-case interfaces: CreateBookingUseCase, RescheduleUseCase)
│   ├── port/out/         (secondary ports: SeatHoldClient, NotificationPort, PaymentPort, IdGenerator)
│   ├── service/          (use-case impls → orchestration, transactions)
│   └── query/            (read-only services for queries)
├── infrastructure/
│   ├── persistence/      (JPA entities mapping domain, repository impls, mappers)
│   ├── adapter/          (Redis hold client, Kafka/MQ producer, web client)
│   └── config/           (module-local beans)
└── presentation/
    ├── rest/             (@RestController, request/response DTOs)
    └── dto/              (API contracts)
```

**Rule:** `presentation`, `infrastructure`, `application` may all read `domain`. `application` defines ports and depends on `domain`. `infrastructure` implements ports. `presentation` depends on `application`. **`domain` imports nothing external.**

---

## 3. Backend Module Structure (dependency graph)

```
vexere-common ──► (no one imports upward into it)
   ▲
   │
identity ──► common
fleet     ──► common
tenant    ──► common
scheduling ─► common, fleet (reads layout for trip arrangement)
booking    ─► common, scheduling, payment (ports: seat hold, payment)
payment    ─► common, booking? NO → payment owns its own transactions; booking calls payment via port
rating     ─► common, booking (reads ticket for review eligibility)
notification ─► common
search     ─► common, scheduling (event-sourced projection)
bootstrap  ─► (all)
```

**Allowed cross-module access:**
- Only through **application ports** (interfaces) defined in the consuming module, implemented by the producing module's infrastructure, wired in `bootstrap`.
- `scheduling` exposes `TripQueryPort`, `SeatHoldPort` (used by booking).
- `payment` exposes `PaymentPort`, `RefundPort` (used by booking).
- `booking` emits domain events consumed by `notification` and `search`.

**Forbidden:**
- No module may `@EntityScan`, `@ComponentScan`, or read another module's `infrastructure`.persistence directly.
- No module may import another module's `domain.repository` impl.
- No `@Autowired` across module internals except through ports.

> This is the single most important rule to keep the monolith modular. Enforce with ArchUnit `noClassDependencies()`.

---

## 4. Frontend Architecture (React 19 + Vite + TypeScript)

Two React apps sharing a design system and feature slices, matching the existing `vexere-admin-prototype` stack:

```
vexere-web/            (customer-facing)
vexere-admin/          (rename/extend existing vexere-admin-prototype → admin & operator)
vexere-frontend-packages/  (optional: shared UI kit / API client)
```

### 4.1 Common conventions (both apps)

| Concern | Choice |
|---|---|
| Build | Vite 8, React 19, TypeScript strict |
| Styling | Tailwind 3 + design tokens (consistent with prototype's `tailwind.config.js`) |
| Routing | react-router v7 (route-based code splitting via `lazy`) |
| Data fetching | TanStack Query (server state) + lightweight fetch client |
| Global state | Minimal: module-scoped contexts; React Query for server cache |
| Forms | react-hook-form + zod |
| API contract | Generated TS types from OpenAPI (single source of truth shared with backend) |
| Env | `.env` with typed `ImportMetaEnv` (Vite) |

### 4.2 Feature-based structure (per app)

```
src/
├── app/                 (App.tsx, router, providers, error boundary)
├── features/
│   ├── auth/
│   ├── search/          (trip search + results card)
│   ├── booking/         (hold, select seat, passenger info, confirm)
│   ├── checkin/         (QR)
│   ├── trips/           (operator: schedule, delay, seat map)
│   ├── fleet/           (operator: vehicles, layouts)
│   ├── reviews/         (customer: write; company: report)
│   ├── payments/        (status, history)
│   └── admin/
│       ├── moderation/  (review report SLA)
│       └── config/      (gateways, banners, cancellation policies)
├── shared/
│   ├── ui/              (design-system components: Button, Card, Modal, ...)
│   ├── lib/             (api client, auth guard, query hooks)
│   ├── types/           (OpenAPI-generated types)
│   └── utils/
├── layouts/
└── mock/                (existing prototype uses mock data → stays until API is ready)
```

Each **feature** is independently loaded: `feature/routes.tsx`, `feature/api.ts`, `feature/components/`, `feature/hooks.ts`. A feature never imports another feature's internals — only `shared/`.

---

## 5. Shared / Common Rules

- **Package naming:** `com.vexere.<module>.<layer>.<sub>` (e.g. `com.vexere.booking.application.service`).
- **One repository per aggregate root** (from `class_diagram.md` §6.1). No repository for child entities (`ReviewReport`, `Ticket` queried only through their aggregate).
- **Cross-aggregate reference by ID only** (never by object graph).
- **Value objects are immutable** (`Money` with currency, `SeatCode`, `QRCode`, `PassengerInfo`).
- **Money:** store `amount DECIMAL ` + `currency`; use `BigDecimal`; never `double`/`float`. Compare with `compareTo`.
- **IDs:** `UUID`/`CHAR(36)` strings in the domain model; surrogate numeric only for `audit_logs`.
- **Date/time:** `java.time`, UTC for storage, convert for display; MySQL `DATETIME(3)`.
- **Soft delete discouraged:** use explicit status transitions; the schema uses status enums + immutability triggers instead.
- **DTOs vs entities:** never expose JPA entities over REST. `presentation` ⇄ DTOs; `infrastructure.persistence` ⇄ JPA entities; `domain` ⇄ model objects. Mappers live in `infrastructure` layers.
- **Generated columns & trigger invariants in DB are a *second* line of defense**, never the first; enforce invariants in domain first.

---

## 6. Exception Handling Architecture

> **Informed by the legacy `job-portal-system` and extended for this domain.**

### 6.1 What to keep / improve from the legacy implementation
The legacy `GlobalExceptionHandler` (package `exception/`), `AppException` carrying an `ErrorCode`, and an `ApiResponse{code,message,data}` envelope are a **sound foundation**. Reuse the pattern but:

- Replace the legacy ad-hoc `ErrorCodeResolver` static-matching (fragile, string-based) with a **typed enum hierarchy**.
- Avoid capturing *generic* `RuntimeException` → 400 (legacy bug: leaks internal messages, hides real 500s). Map known exceptions explicitly; let unexpected ones bubble to a catch-all 500.
- Settle the legacy ambiguity (two `ApiResponse` envelope opinions commented out) by defining **one** canonical envelope.

### 6.2 Canonical error model

```json
{
  "timestamp": "2026-09-27T23:35:00+07:00",
  "traceId": "7f2a...",
  "code": "BOOKING_SEAT_NOT_AVAILABLE",
  "status": 409,
  "message": "Seat A12 is no longer available on this trip.",
  "errors": [ { "field": "seatCode", "message": "..." } ],
  "path": "/api/v1/bookings"
}
```

### 6.3 Central pieces (in `vexere-common`)

| Component | Responsibility |
|---|---|
| `AppException extends RuntimeException` | Carries a typed `ErrorCode` (kept from legacy). |
| `ErrorCode` (enum-style, one per module or a sealed group) | `code`, `httpStatus`, `message`. Reserved numeric or slug codes per module (e.g. `AUTH_*`, `TRIP_*`, `BOOKING_*`, `PAY_*`, `REFUND_*`, `RATE_*`). |
| `ErrorCodeLookup` | Structured resolution instead of legacy `ErrorCodeResolver`. |
| `GlobalExceptionHandler extends ResponseEntityExceptionHandler` | `@RestControllerAdvice`; one handler per known type + catch-all. |
| `ApiResponse<T>` envelope | `{code, message, data, timestamp, traceId}` — canonical, single definition in `common`. |

Handlers: `AppException` → its `ErrorCode`; `MethodArgumentNotValidException`/`ConstraintViolationException` → field-map errors; `HttpMessageNotReadableException` → 400 + friendly message; `DataIntegrityViolationException` → 409 (map known constraint/trigger names, incl. the schema's immutability/ownership triggers); `Exception` → 500 generic (`traceId` logged).

> [!IMPORTANT]
> **Domain-invariant failures are business responses, not programming errors.** Seat-hold expiry, refund-limit exceeded, reschedule-once (PBD-04), review-report pending (Issue #4) → throw `AppException` with the right `ErrorCode`/HTTP status (409/422). Never fall through to 500.

---

## 7. Security Architecture

### 7.1 Authentication
- **Firebase Auth** (per schema: `users.firebase_uid`) for end-user and operator customers of the platform.
- Custom backend session: **JWT access token** (short TTL) + **rotation refresh token** (`refresh_tokens` table; opaque, hashed-at-rest, device/revocation-aware).
- Local dev fallback (Firebase emulator / seeded admin layer) only in non-prod profile.

### 7.2 Authorization (RBAC + ownership)
- Roles: `CUSTOMER`, `OPERATOR` (bus-company staff), `ADMIN` (platform).
- Operator is **scoped to a `bus_company_id`** (schema immutability trigger `tg_users_bus_company_immutable`). All operator queries/filters must enforce `busCompanyId = currentUser.busCompanyId` (Rule O3 — Application-enforced; the DB does NOT enforce it, so code MUST).
- Method + resource-level `@PreAuthorize` (Spring Security) backed by a permission matrix; ownership checks in application layer, not just annotations.
- Sensitive endpoints (gateway config) restricted to `ADMIN`; gateway secrets **encrypted at rest (AES-256)** before insert (Rule 32), decrypted only in `infrastructure.adapter`.

### 7.3 Other
- Passwordless account for Firebase path; local password path only if Firebase declined → use BCrypt (Argon2id preferred), never plain.
- IPN/webhook endpoints validate signature + idempotency key; treat as unauthenticated but cryptographically verified.
- Audit (append-only) on admin/operator mutations.
- HTTPS, CORS allow-list, rate limiting on public booking/payment endpoints, input validation at the boundary.

---

## 8. AI Architecture Placement

**No AI capabilities are defined in the five canonical documents.** Consequently the proposal is: provide a **plug-in seam**, do NOT force AI into the domain.

- Create module `vexere-ai` (or a feature folder in `vexere-common` / `vexere-bootstrap`) that is **fully optional and off by default**.
- Its only integration points are:
  - **Ports** defined by consumers (e.g. `SearchRankingPort`, `ReviewContentClassifier`, `SupportAssistantPort`) with **no-op/rule-based default implementations** when AI is disabled.
- Keep the domain models (Trip search, Review) purpose-built; AI becomes an *adapter* behind these ports so enabling it later does not touch business logic.
- Frontend: co-locate any future AI interactions in the relevant feature (`search/` for ranking UI, `reviews/` for moderation assist) behind a feature flag.
- This avoids gold-plating while leaving a clean, decoupled AI home.

---

## 9. Infrastructure / External Integrations

| Integration | Placement | Notes |
|---|---|---|
| MySQL 8 | `infrastructure.persistence` (all modules) | Source of truth; triggers/constraints in `schema.sql` already deployed |
| Redis | `infrastructure.adapter` (scheduling holds + caching) | **Soft/Hard Hold** atomics with TTL; source of truth for *temporary* holds only; sync back to `trip_seats` (eventual consistency, M3 invariant) |
| Kafka (or RabbitMQ) | `bootstrap`/`notification`/`search` | Handles outbox → event bus → consumers |
| VNPay / MoMo / ZaloPay | `payment.infrastructure.adapter.gateway` | IPN endpoint; idempotent; never inside a DB transaction |
| Routing API (duration) | `scheduling.infrastructure.adapter` | Called at RouteTemplate config time only; result stored in `route_template_stops.estimated_travel_duration_from_previous_stop_minutes` (Rule F/G) |
| Email / SMS providers | `notification.infrastructure.adapter` | Backed by `notification_gateway_configs` |
| Object storage (banners, vehicle images) | `tenant`/`fleet` adapters | Presigned URLs; never store large blobs in DB |
| Firebase Auth | `identity.infrastructure.adapter` | |

---

## 10. Dependency Direction (summary diagram)

```
presentation  (HTTP, DTOs)
     ↓
application   (use-cases, ports, transactions, orchestration)
   ↙    ↘
domain        infrastructure (persistence, adapters)
 (pure,      ↘
self-contained)   ↘
          common (error model, envelope, base types)
                      (nothing for common to import)
```

- **Vertical:** each module is a closed architectural layer set (presentation → application → domain/infrastructure).
- **Horizontal (module→module):** only through application ports, wired in `bootstrap`. No imports into another module's internals.
- **Enforcement:** Maven reactor module graph + `ArchUnit` `noDependency()` rules + build-time `jdeps`. A dependency resolution in the "wrong" direction fails the build.

---

## 11. Transaction Boundaries

### 11.1 Rules
- **One DB transaction = one aggregate root mutation**, scoped in the application use-case (`@Transactional` at application.service boundary, never in a domain method).
- **Cross-aggregate orchestration** happens in the same use-case *if the invariant must be atomic*; otherwise decompose into two transactions + outbox event.
- **Money-mutation is additive-friendly,** inspired by `RefundProcessingService` (HIGH-2): begin TX → `SELECT ... FOR UPDATE` on affected `payment_transactions` rows → validate cumulative refund ≤ original → write → commit. Always pessimistic-lock financial sources.

### 11.2 Documented long-running flows (from `class_diagram.md`)
- **Reschedule** (HIGH-2, 3 branches): Phase 1 TX (validate/hold/create PENDING_PAYMENT + PaymentTransaction/RefundTransaction + RescheduleRecord) → commit; **Phase 2 TX** (finalize on IPN success OR rollback on failure). Never rollback a finished reschedule because refund is slow. Refund completion is async and does not gate finalization.
- **Payment/IPN:** `PaymentProcessingService.handleIPN` runs outside the DB TX, idempotent by `txnRef`, then a short confirming TX.
- **Seat Hold release on expiry:** consumer reads Redis TTL, nothing persists on expiry automatically — a **mandatory reconcile job** (eventual consistency, M3) synchronizes `trip_seats.status → AVAILABLE`.

### 11.3 Optimistic concurrency
- `version` columns exist on `payment_gateway_configs`, `notification_gateway_configs`, `reviews` → use `@Version`. Seat availability uses Redis atomic + DB row-level lock to avoid overbooking.

---

## 12. Events / Messaging Placement

- **Domain events defined in `domain.event`** purely (e.g. `BookingConfirmed`, `TicketCancelled`, `SeatHardHoldExpired`, `RefundCompleted`, `TripDelayed`, `ReviewReportPending`).
- **Outbox** lives in the module that raises the event (same DB TX as the aggregate write) → an outbox table per module or a shared one owned by `common`; an outbox relay (in `bootstrap`) publishes to Kafka.
- **Consumers:**
  - `notification` consumes `BookingConfirmed`, `TicketIssued`, `RefundCompleted`, `SeatRemapped`, `TripDelayed`, `ReviewDecision`.
  - `search` consumes scheduling/booking events to refresh its read-model projection.
  - `scheduling` consumes `TicketCancelled` to release a seat — **via a port/saga**, not a direct DB write into booking tables.
- **Event sourcing is explicitly NOT used** for aggregates; events are for integration (`notification`, `search`) and audit, not the system of record.
- **Idempotent consumers:** every consumer keys off the aggregate ID + event ID to tolerate at-least-once delivery.
- **Dead letter queue + replay** for poison events.

---

## 13. Testing Structure

| Test type | Where | Notes |
|---|---|---|
| Unit (domain) | `*/*/src/test` (module-local) | Pure domain rules: refund calc, seat remap, reschedule-once, immutability invariants |
| Unit (application) | module `application` tests | Ports mocked; use-case orchestration, transaction boundaries |
| Integration (persistence) | module `infrastructure` + `testcontainers` MySQL | JPA mapping, repository contracts, trigger behavior |
| Contract / API (slice) | `@WebMvcTest` + REST Docs/OpenAPI per module | Controller ↔ DTO ↔ error envelope |
| **ArchUnit** | `vexere-architecture-tests` | Enforce dependency direction mod-ules & layers; one-repo-per-aggregate |
| End-to-end | `vexere-integration-tests` | Booking→hold→pay→issue→refund happy & sad paths against real MySQL+Redis+Kafka (Testcontainers) |
| Frontend | Vitest + React Testing Library (unit), Playwright (E2E) | Per-feature |

Naming: mirror source paths (`src/test/java/com/vexere/booking/...`). Property-based tests (jqwik) for Money/refund math.

---

## 14. Configuration Structure

- **Spring profiles:** `dev`, `test`, `prod`. Secrets only via env vars / secret manager, never in `application.yml`.
- Externalized per-module: `application-<module>.yml` merged by Spring Boot (`spring.config.import`).
- Config classes grouped per module: `infrastructure/config/*Config.java`.
- Feature flags (incl. AI on/off) via `@ConfigurationProperties` (e.g. `vexere.ai.enabled`).
- Encrypted gateway credentials resolved at runtime from a KMS/vault-backed store; local dev uses AES bytes injected via env.

```
vexere-backend/
  vexere-bootstrap/src/main/resources/
    application.yml
    application-dev.yml / -prod.yml
  vexere-booking/src/main/resources/application-booking.yml
  ...
```

---

## 15. Observability

- **Structured logging** (JSON) with `traceId`/`spanId` via Micrometer Tracing; context propagated through the async outbox consumers.
- **Metrics (Micrometer / Prometheus):** booking latency & rate, seat-hold expiry, payment IPN success/fail, outbox lag, refund failures.
- **Health endpoints** per module (`actuator`), including Redis connection & Kafka consumer lag.
- **Distributed tracing** across: HTTP → use-case → DB/Redis → outbox → consumer.
- **Audit:** append-only `audit_logs` for admin/operator actions (immutable at DB: REVOKE UPDATE/DELETE as noted in schema).
- **Alerting:** reconcile-jobs drift (seat held too long), payment/reconciliation mismatches.

---

## 16. Naming Conventions

| Topic | Convention |
|---|---|
| Packages | `com.vexere.<module>.<layer>` |
| Aggregates | singular noun, e.g. `Booking`, `PaymentTransaction` (match `class_diagram.md`) |
| Repositories | `<Aggregate>Repository` (interface in domain, impl in infrastructure) |
| Use-cases | `CreateBookingUseCase`, `ConfirmPaymentUseCase`, `RescheduleUseCase` |
| Domain services | `<Verb><Noun>Service` (keep `*Service` names from `class_diagram.md`) |
| Controllers | `XxxController` in `presentation.rest` |
| DTOs | `XxxRequest` / `XxxResponse` |
| Tables | snake_case (already set in `schema.sql`) |
| Columns | snake_case (already set) |
| Frontend dirs | `kebab-case`, components `PascalCase.tsx` |
| Database triggers/constraints | as defined in `schema.sql` (keep exact names so the app can map `DataIntegrityViolationException` → user error) |
| Git branches | `feature/*`, `bugfix/*`, `refactor/*` |

---

## 17. Recommended Implementation Order (MVP)

**Phase 0 — Foundation**
1. Maven parent + `vexere-common` (error model, `ApiResponse`, `AppException`, `GlobalExceptionHandler`, base VOs).
2. `vexere-identity` (Firebase/JWT, RBAC, user).
3. Architecture-tests scaffold (ArchUnit) — enforce dependency rules from day one.

**Phase 1 — Core catalog**
4. `vexere-fleet` (vehicles, layouts, seats).
5. `vexere-scheduling` (routes, route templates, trips, points, seat prices, cancellation policies, seat inventory + Redis hold).
6. Admin/operator config CRUD driven through `vexere-tenant` where shared (banners, gateway configs).

**Phase 2 — Money path (highest business risk, do early)**
7. `vexere-booking` (booking, ticket, issue).
8. `vexere-payment` (payment, IPN, reconciliation) + `vexere-rating` basics if time.
9. Reschedule (HIGH-2 saga) + refund lineage.

**Phase 3 — Cross-cutting**
10. `vexere-notification` (outbox consumers).
11. `vexere-search` (read-model projection).
12. `vexere-rating` moderation + `vexere-tenant` audit consumption.

**Phase 4 — Frontend**
13. Port `vexere-admin-prototype` → finalized feature structure; `vexere-web` customer app.
14. Wire both to real APIs (remove `mock/` last).

**Phase 5 — Hardening**
15. Observability, reconciliation jobs, load/concurrency tests, IPN/RUBIX corner cases, docs sync.

> Each phase ends with a **buildable, testable vertical slice** (not a horizontal dump), so the portfolio can be demoed incrementally.

---

## 18. Appendix — Known Constraints & Decisions Log

- Legacy `job-portal-system` exception handling reviewed (scoped). Reused: `AppException`+`ErrorCode`+`ApiResponse`+`@RestControllerAdvice`. Replaced: string-based `ErrorCodeResolver` with typed enum; generic `RuntimeException→400` mapping.
- Filesystem permissions blocked direct reads to the legacy project files; access was obtained through the scoped shell inspection instead. No other modules of the legacy codebase were evaluated (out of scope).
- AI is out of canonical scope — provided as an optional, disabled-by-default port seam (§8). No AI tables/aggregates invented.
- All DB-imposed immutability/ownership invariants (schema triggers) are duplicated as domain rules; the DB remains the safety net, the code is the source of truth for behavior.
