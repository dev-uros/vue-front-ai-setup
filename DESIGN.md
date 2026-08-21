Read design-systems/_base.md and design-systems/eco-gamification.md.

PHASE 1 — AUDIT (do not modify any file yet)

Inspect the current Nuxt UI setup and report:
- Nuxt UI version and where theme config currently lives
  (app.config.ts, nuxt.config.ts, assets/css/main.css)
- which colors/fonts/radii are currently hardcoded in components
  instead of coming from tokens
- the list of shared components (layouts/, components/) vs
  page-specific components (pages/)
- anything in _base.md or the theme file that conflicts with the
  existing implementation

Stop and show me this before continuing.

PHASE 2 — APPLY

Token layer first:
- Nuxt UI semantic colors go in app.config.ts (ui.colors)
- custom palette, font-family, radius and shadow scales go in the
  @theme block in assets/css/main.css
- do not create a second parallel token system

Then follow the application order in _base.md:
shell → navigation → shared components → forms → cards → pages → states.

Rules:
- no hardcoded hex values in components; every color references a token
- prefer existing Nuxt UI components over custom ones
- the only new dependency allowed is the theme font (via @nuxt/fonts)
- apply the shell variant declared in the theme file — do not leave a
  default white sidebar

CONSTRAINTS

Do not change: routes, composables, stores, API calls, validation
rules, auth, data models, or any business logic. Class and style
changes only. If a visual change appears to require a logic change,
stop and ask.

PHASE 3 — VERIFY (static only)

Run exactly these two commands, nothing else:
npx nuxi typecheck
npm run build

Do NOT run: e2e tests, Playwright, Cypress, unit tests, the dev server,
or any browser automation. Do NOT take screenshots. Do NOT open a
preview. If a check would require running the app, skip it and say so
instead.

Then prove logic was untouched:
git diff main --stat
Report any changed file under composables/, stores/, server/,
middleware/, plugins/ or utils/. There should be none.

Report files changed grouped by layer, and anything you could not
convert.

