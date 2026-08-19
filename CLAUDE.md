# CLAUDE.md

Project-level rules for this repo. Framework/library know-how lives in the skills and MCP servers —
see [Skill & MCP routing](#skill--mcp-routing). This file never restates skill content; it records
what is specific to **this** codebase.

## Project

Vue 3 single-page app built with Vite. **Plain Vue, not Nuxt** — `@nuxt/ui` is used here as a
standalone Vue component library. TypeScript everywhere, Composition API with `<script setup>` only.

Status: the first vertical slice is in place — mock auth (`features/auth`), a persisted session
(`features/shared`), a dashboard shell (`layouts/`), and two placeholder feature areas. There is no
HTTP layer yet: `features/auth/api/login.ts` is a documented mock, and `src/lib/` is still empty.
Copy the shape of `features/auth` when adding a feature.

## Stack

| Package | Version | Role |
| --- | --- | --- |
| `vue` | 3.5 | framework |
| `vue-router` | 5 | routing |
| `pinia` | 4 | client state |
| `@pinia/colada` | 1 | server state (async data, cache) |
| `@nuxt/ui` | 4 | component library (Reka UI + Tailwind) |
| `tailwindcss` | 4 | styling, CSS-first config |
| `axios` | 1.19 | HTTP client |
| `zod` | 4 | runtime validation + inferred types |
| `@vueuse/core` | 14 | composables |
| `vite` | 8 | build (Rolldown) |
| `vitest` | 4 | unit tests |
| `@playwright/test` | 1.61 | e2e tests |
| `oxlint` + `eslint` | 1.73 / 10 | linting |
| `prettier` | 3.9 | formatting |
| Node | `^22.18.0 \|\| >=24.12.0` | runtime |

Several of these are majors that post-date common training data (Vite 8 / Rolldown, Vue Router 5,
Pinia 4, TypeScript 6, ESLint 10, Tailwind 4). Do not apply older-major patterns from memory — check
the matching skill or MCP first.

## Commands

| Command | Notes |
| --- | --- |
| `npm run dev` | dev server on :5173 |
| `npm run build` | `build-only` + `type-check` |
| `npm run preview` | preview build on :4173 |
| `npm run test:unit` | Vitest |
| `npm run test:e2e` | Playwright — it starts the server itself, do not run `dev` alongside it |
| `npm run type-check` | `vue-tsc --build` — never plain `tsc`, it cannot read `.vue` |
| `npm run lint` | oxlint `--fix`, then eslint `--fix` |
| `npm run format` | Prettier over `src/` |

**Definition of done for any code change:** `npm run type-check` and `npm run lint` pass, and
`npm run test:unit` passes when anything under `src/` changed. Run them before reporting the task
as complete — do not claim it works without having run them.

## Architecture

**Feature-based.** A feature owns everything it needs; nothing belonging to a feature lives outside
its folder. `layouts/` and `pages/` sit outside `features/` and stay thin.

```
src/
  main.ts                 bootstrap: Pinia -> Pinia Colada -> router -> Nuxt UI plugin
  App.vue                 <UApp> shell wrapping <RouterView>
  router/
    index.ts              root router: imports each feature's routes, nests them under layouts
  layouts/                app chrome — feature-independent
    MainLayout.vue        dashboard shell: sidebar + panel + navbar
    AuthLayout.vue        centered card shell for signed-out pages
    components/           chrome-only components (AppSidebar, SidebarUserMenu)
    navigation.ts         sidebar menu definition
  pages/                  the only components the router navigates to; mirrors feature names
    auth/LoginPage.vue
  features/
    auth/
      components/         feature-owned SFCs
      composables/        useX.ts, feature-owned
      api/                typed HTTP calls; responses parsed with this feature's Zod schemas
      query/              Pinia Colada defineQuery/defineMutation + query keys, wrapping api/
      stores/             optional — Pinia store for feature-local client state
      schemas/            Zod schemas + their z.infer types
      types.ts            types not derived from a schema
      routes.ts           exports this feature's RouteRecordRaw[]
    users/                same structure
    shared/               same structure, minus routes.ts — see rules below
  lib/                    configured third-party clients — axios.ts lives here
  assets/css/             main.css — Tailwind + Nuxt UI entry
e2e/                      Playwright specs, one folder per feature
```

Create these directories on demand; do not scatter equivalents elsewhere.

### Feature rules

- The feature folder is the unit of ownership. **No cross-feature imports** — if `users` needs
  something from `auth`, that something moves to `features/shared/` first.
- `features/shared/` uses the same subfolders and holds only what is used in more than two places.
  It never owns routes. Promote code there on the third use, not pre-emptively.
- `pages/` holds route targets only: one component per route, mirroring the feature name
  (`pages/auth/LoginPage.vue`). A page composes feature components and calls feature `query/`
  composables — no business logic, no direct `api/` calls, no markup that belongs in a component.
- `layouts/` holds app chrome and never imports from a feature.
- `api/` returns parsed, typed data. `query/` wraps it in Colada `defineQuery` / `defineMutation`
  and owns the query keys. Components and pages call `query/`, never `api/` directly.
- `src/lib/` is the only place a third-party library gets configured — one module per library. HTTP
  goes through **axios**: `lib/axios.ts` exports the single configured instance (base URL, headers,
  interceptors, auth refresh). It holds no domain knowledge: no endpoints, no schemas, no feature
  types. Feature `api/` folders import that instance and add the endpoints on top — never
  `axios.get()` off the bare package, and no raw `fetch` in feature code.
- Do not confuse the two shared buckets: `lib/` wraps **someone else's** code, `features/shared/`
  holds **our** code used in more than two places. A file that imports from `features/` does not
  belong in `lib/`.
- Import a third-party HTTP/date/i18n library through its `lib/` module, never directly in a feature
  — swapping or reconfiguring it must stay a one-file change.

### Routing

- Each feature exports its routes from `routes.ts` as a named const:
  `export const authRoutes: RouteRecordRaw[]`. Give every route a `name`, prefix names with the
  feature (`auth-login`), and lazy-load with `() => import('@/pages/...')`. Routes point at
  `pages/`, never at feature components.
- `src/router/index.ts` imports those arrays and nests them under layout parent records — layout
  assignment lives in the router alone, so features stay layout-agnostic:

  ```ts
  routes: [
    { path: '/', component: () => import('@/layouts/DefaultLayout.vue'), children: [...usersRoutes] },
    { path: '/auth', component: () => import('@/layouts/AuthLayout.vue'), children: [...authRoutes] },
  ]
  ```

- Global guards stay in `src/router/index.ts`; feature-specific guards go in that feature's
  `routes.ts` as per-route guards.

### Conventions

- Import with the `@/*` alias (→ `./src/*`). No deep `../../` chains.
- `<script setup lang="ts">` in every SFC. Components are `PascalCase.vue`.
- `noUncheckedIndexedAccess` is enabled: indexed access yields `T | undefined`, handle it instead of
  asserting with `!`.
- TypeScript uses project references (`tsconfig.app.json`, `tsconfig.node.json`,
  `tsconfig.vitest.json`). Add new path mappings to `tsconfig.app.json` **and** the Vite alias.

## Library rules

These are project decisions that no skill covers — follow them exactly.

### Pinia vs Pinia Colada

- Anything fetched from a server → `useQuery` / `useMutation` / `useInfiniteQuery` from
  `@pinia/colada`, defined in the feature's `query/` folder via `defineQuery` / `defineMutation`.
- Never hand-roll fetch-and-cache inside a Pinia store, and never mirror query results into store
  state. Pinia is for client-only state: UI state, session, preferences, cross-view coordination.
- Global Colada options live in `src/main.ts` (currently `staleTime: 0`, i.e. always refetch on
  mount). Tune per query at the call site rather than changing the global default.

### Zod

- Every external boundary is parsed, not cast: API responses, form input, route params, env.
- Schemas live in the owning feature's `schemas/` folder (`features/shared/schemas/` when shared);
  derive types with `z.infer` and export them from there. Never hand-write a TS interface that
  duplicates a schema — `types.ts` is only for types no schema produces.
- Nuxt UI `UForm` accepts a Zod schema directly — use that instead of custom validation code.

### Nuxt UI (in plain Vue)

- Wiring is already in place: `ui()` plugin in `vite.config.ts`, `app.use(ui)` in `src/main.ts`,
  `<UApp>` in `src/App.vue`. `<UApp>` must stay — toasts, tooltips and overlays depend on it.
- `U*` components are auto-imported. Do not add manual imports for them.
- Theming is CSS-first in `src/assets/css/main.css` (`@import "tailwindcss"; @import "@nuxt/ui";`).
  There is **no** `tailwind.config.*` and none should be created. `app.config.ts` is Nuxt-only and
  does not apply here.
- Reach for a Nuxt UI component before writing a custom one; hand-roll only when nothing fits.
- Nuxt UI's Vue build stubs Nuxt-only composables. `useCookie` is a **no-op**, so any component
  defaulting to cookie persistence must be switched to local storage — `UDashboardGroup` in
  `MainLayout.vue` passes `storage="local"` for exactly this reason. Check the runtime source under
  `node_modules/@nuxt/ui/dist/runtime/` before trusting a persistence-related default.

### VueUse

Check for an existing VueUse composable before writing a custom one.

## Testing

**Unit / component (Vitest)** — colocated with the code under test, in a folder literally named
`__tests__`:

```
src/features/auth/components/__tests__/LoginForm.spec.ts
src/features/auth/composables/__tests__/useLogin.spec.ts
src/features/auth/query/__tests__/useLoginMutation.spec.ts
src/pages/auth/__tests__/LoginPage.spec.ts
src/layouts/__tests__/DefaultLayout.spec.ts
```

The `__tests__` name is not cosmetic: `tsconfig.app.json` excludes and `tsconfig.vitest.json`
includes exactly `src/**/__tests__/*`, and the ESLint Vitest override keys off the same glob. A spec
outside such a folder gets the wrong tsconfig and no Vitest lint rules.

**E2E (Playwright)** — outside `src/`, one folder per feature:

```
e2e/auth/login.spec.ts
e2e/users/user-list.spec.ts
```

jsdom for unit tests; e2e runs on Chromium + Firefox + WebKit with `baseURL` :5173 locally and
:4173 on CI (against `preview`). Split by purpose: e2e covers user flows across pages, unit tests
cover logic and component behaviour. Do not duplicate the same assertion across both layers.

## Skill & MCP routing

Load the listed skill/MCP for the task instead of working from memory. Their content is deliberately
not repeated here.

| Task | Load |
| --- | --- |
| Any `.vue` / Composition API work | `vue-best-practices`, then `vue` |
| Nuxt UI component, theme or form | `nuxt-ui` skill **+ `nuxt-ui` MCP** — querying the MCP for props/slots/examples is mandatory before writing a `U*` component |
| Pinia store | `pinia` |
| Router, guards, params | `vue-router-best-practices` |
| Unit tests | `vitest` + `vue-testing-best-practices` |
| E2E tests / driving a browser | `playwright-cli` skill; `playwright` MCP for a live browser session |
| `vite.config.ts`, plugins, build | `vite` |
| Looking for a composable | `vueuse-functions` |
| Zod schemas | **`zod` MCP** (`search-zod-v4-docs`, `ask-question-about-zod-v4`) — there is no Zod skill |
| Pinia Colada | no skill or MCP exists — follow [Library rules](#library-rules) and the types in `node_modules/@pinia/colada` |

Rules:

- Do not copy skill content into this file; add a pointer instead.
- If a rule here conflicts with a skill, this file wins — it describes this repo.
- Skills under `.claude/skills/` are vendored and tracked in `skills-lock.json`. Do not hand-edit
  them; update them through their source.
- `.claude/skills/` is the only skill location. A duplicate `.agents/skills/` copy was removed — if
  a skill installer recreates it, delete it again rather than maintaining both.

## House style

Prettier: no semicolons, single quotes, print width 100. Do not fight the formatter — run
`npm run format`. Linting runs oxlint first (correctness) then ESLint, both with `--fix`. Write
comments only where the reason for the code is not obvious from the code.
