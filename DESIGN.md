Read design-systems/_base.md and design-systems/<theme>.md.

PROJECT

This is a **plain Vue 3 + Vite SPA, not a Nuxt app**. `@nuxt/ui` is used here as a
standalone Vue component library: `ui()` in vite.config.ts, `app.use(ui)` from
`@nuxt/ui/vue-plugin` in src/main.ts, `<UApp>` in src/App.vue.

Nothing Nuxt-only applies. Concretely:

- there is no app.config.ts and none is to be created — `ui.colors` and every
  component-level theme override go in the `ui` option of the `ui()` plugin in
  **vite.config.ts**, which takes the identical `AppConfigUI` object
- there is no nuxt.config.ts, no `nuxi`, no server/, middleware/ or plugins/
- `@nuxt/fonts` is a Nuxt module and the Vite plugin does not accept it
  (`NuxtUIOptions` omits `fonts`). Theme fonts are self-hosted through
  `@fontsource/*` packages, imported at the top of assets/css/main.css
- `useCookie` is a no-op stub in Nuxt UI's Vue build, so anything that persists
  must be told to use local storage

The layout is feature-based; see CLAUDE.md. Where this file and CLAUDE.md
disagree, CLAUDE.md wins.

PHASE 1 — AUDIT (do not modify any file yet)

Inspect the current Nuxt UI setup and report:
- Nuxt UI version and where theme config currently lives
  (vite.config.ts, assets/css/main.css)
- which colors/fonts/radii are currently hardcoded in components
  instead of coming from tokens
- the list of shared components (layouts/, features/shared/) vs
  feature components (features/*/components/) vs page-specific
  components (pages/)
- anything in _base.md or the theme file that conflicts with the
  existing implementation

Stop and show me this before continuing.

PHASE 2 — APPLY

Token layer first:
- Nuxt UI semantic colors go in vite.config.ts (the `ui.colors` option of the
  `ui()` plugin), together with component-level theme overrides
- custom palette, font-family, radius and shadow scales go in the
  @theme block in assets/css/main.css
- do not create a second parallel token system

Then follow the application order in _base.md:
shell → navigation → shared components → forms → cards → pages → states.

Rules:
- no hardcoded hex values in components; every color references a token
- prefer existing Nuxt UI components over custom ones
- the only new dependency allowed is the theme font (via @fontsource)
- apply the shell variant declared in the theme file — do not leave a
  default white sidebar

CONSTRAINTS

Do not change: routes, composables, stores, API calls, validation
rules, auth, data models, or any business logic. Class and style
changes only. If a visual change appears to require a logic change,
stop and ask.

PHASE 3 — VERIFY (static only)

Run exactly these two commands, nothing else:
npm run type-check
npm run build

(`npm run type-check` is `vue-tsc --build`; never plain `tsc`, it cannot read
`.vue`. `npm run build` runs the build and then repeats the typecheck.)

Do NOT run: e2e tests, Playwright, Cypress, the dev server, or any browser
automation. Do NOT take screenshots. Do NOT open a preview. If a check would
require running the app, skip it and say so instead.

Then prove logic was untouched:
git diff main --stat
Report any changed file under src/features/*/api/, src/features/*/composables/,
src/features/*/query/, src/features/*/schemas/, src/features/*/stores/,
src/features/*/utils/, src/router/ or src/lib/. There should be none.

Report files changed grouped by layer, and anything you could not
convert.
