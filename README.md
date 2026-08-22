# frontend

## Backend

This SPA talks to the Laravel API in `../laravel-back-ai-setup`. Start it there with `make up`,
then seed the demo accounts with `make demo`. The contract between the two projects is
`docs/frontend-integration.md` in that repo, and the generated reference is at
<http://localhost:8000/docs/api>.

```sh
cp .env.example .env    # VITE_API_URL=http://localhost:8000/api
```

Nothing else knows the API's address: `src/lib/axios.ts` is the only module that reads it, and
every request in the app goes through the instance it exports.

### Accounts

Every seeded account uses the password `password`.

| Email | Role | State |
| --- | --- | --- |
| `uros.minic@fifthguild.com` | admin | the base account |
| `milica.jovanovic@fifthguild.com` | admin | active |
| `marko.petrovic-ilic@fifthguild.com` | user | changed surname and email, so it has an audit trail |
| `jovana.stankovic@fifthguild.com` | user | never activated |
| `nikola.ilic@fifthguild.com` | user | deactivated |

`admin` may do everything; `user` may only read. The UI hides what a plain user cannot do, but
that is a courtesy — the API answers 403 either way.

## How the session works

Sanctum **personal access tokens**, not cookies. There is no `/sanctum/csrf-cookie`, no CSRF and
no `withCredentials`.

- Signing in returns a token, which `src/lib/axios.ts` stores in `localStorage` under
  `app.auth.token` and replays as `Authorization: Bearer …`.
- The **user is not stored**. On every start `src/features/auth/bootstrap.ts` trades the token for
  fresh account details via `GET /auth/me`, before the router is installed — so the first
  navigation already knows whether anyone is signed in, and a role that changed server-side cannot
  linger in the UI.
- A 401 anywhere means the token is dead — expired, revoked by a logout elsewhere, or invalidated
  by a password reset. The axios interceptor throws it away and the app returns to the login page.
- Signing out revokes only the token this browser holds; other devices stay signed in.

Routing is secure by default — see `src/router/guards.ts`:

- `meta.guestOnly` — sign-in and password recovery. Reachable signed out; a signed-in visitor is
  sent to `/`.
- `meta.public` — reachable either way.
- neither — needs a session; anonymous visitors are sent to the login page and returned afterwards.

## Pages the backend links to

The activation and password-reset emails point at this app, at **fixed paths**. Renaming either
breaks every link already sitting in an inbox.

| Email | Route |
| --- | --- |
| account activation | `/auth/activate-account?email=…&token=…` |
| forgotten password | `/auth/reset-password?email=…&token=…` |

Both read the two values off the query string and parse them before use; an incomplete link
renders a dead-link screen instead of a form. Submitting either signs the user straight in.

The password must be at least 8 characters with an uppercase letter, a lowercase letter, a number
and a symbol — and must not appear in a known breach corpus, which only the API can check, so that
one comes back as a 422 on the field.

`/auth/forgot-password` answers identically whether or not the address has an account, and shows
the API's own wording verbatim. A different answer for unknown addresses would let anyone
enumerate registered accounts.

## Errors

Successful responses share one envelope (`{ message, data }`); errors keep Laravel's shape, so the
client branches on the HTTP status, never on the shape of the body. `message` is written by the
backend **for the end user**, in Serbian, and is shown as it arrives rather than replaced with
wording of our own.

- 422 with field errors → under the fields they name.
- 422 naming a field this form does not render (an expired `token`), or any other failure → an
  alert or a toast, so it cannot go unseen.
- 500 → the message plus the `X-Request-Id`, which is what finds the request in the backend's
  Grafana dashboard.

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

The e2e suite runs against the **live backend**, so `make up` and `make demo` have to have been
run first. It signs in once per run in `e2e/support/global-setup.ts` and seeds the token into
`localStorage`, because `POST /auth/login` allows only ten attempts a minute per IP — a suite that
drove the login form everywhere would spend that budget on setup. A handful of tests that assert
what the API answered are limited to Chromium for the same reason.

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

## Deploy

One command, first time and every time after:

```sh
cp deploy.env.example deploy.env   # once: server, domain, API base URL
npm run deploy
```

It builds the image on the server, releases it behind the Traefik that already runs there, and
verifies the domain answers before reporting success. `npm run deploy -- --local` builds the same
image and serves it on <http://localhost:8080> without touching the server, `-- --status` shows
what is deployed, `-- --ref <sha>` releases an exact commit (that is also the rollback).

Full instructions, including what has to be true on the server first: [`docs/deployment.md`](docs/deployment.md).
