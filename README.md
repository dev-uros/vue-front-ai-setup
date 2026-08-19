# frontend

## Demo credentials

Auth is mocked in `src/features/auth/api/login.ts` — no backend is involved yet.

| Email | Password | Result |
| --- | --- | --- |
| `ana.kovac@fifthguild.dev` | `Password123!` | signs in |
| `nikola.peric@fifthguild.dev` | `Password123!` | signs in |
| `ne.postoji@fifthguild.dev` | anything | "No account exists for …" |
| `ana.kovac@fifthguild.dev` | anything else | "That password does not match this account." |

The session is kept in `localStorage` under `app.session.user`, so it survives a refresh. Every
route is behind the auth guard unless it sets `meta.public` — see `src/router/guards.ts`.

`/auth/forgot-password` accepts any syntactically valid address and always answers the same way,
on purpose: a different answer for unknown addresses would let anyone enumerate registered
accounts. Nothing is emailed — the mock lives in `src/features/auth/api/requestPasswordReset.ts`.
Because no mail is sent, the confirmation screen shows the link the email would have carried, so
the flow stays clickable.

`/auth/reset-password?email=…&token=…` reads both values off the URL and parses them before use;
an incomplete or malformed link renders a dead-link screen instead of a form. The new password
must be at least 8 characters with an uppercase letter, a lowercase letter, a number and a symbol,
and must match the confirmation. Submitting signs the user in and lands them on `/` — in the mock
any valid link is accepted, and an address without an account gets a user synthesised from it.

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
