import 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

/**
 * NOTE: under Vue Router 5 this augmentation no longer reaches `route.meta`. The shipped
 * `.d.ts` declares `RouteMeta` in an internal chunk and re-exports it from `vue-router`, so
 * merging into `vue-router` leaves `RouteLocation.meta` as `Record<PropertyKey, unknown>` and
 * every read comes back `unknown`. The fields below still describe the contract every route
 * here follows — code that needs a `string` has to narrow (see `useShortcuts`).
 */
declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Reachable without a session. Everything is behind the auth guard by default —
     * this is the only opt-out, so a new route is protected unless it says otherwise.
     */
    public?: boolean
    /**
     * Only makes sense while signed out (sign in, password recovery). Implies `public`, and
     * additionally sends signed-in visitors to the home page.
     */
    guestOnly?: boolean
    /** Rendered as the page title in the dashboard navbar. */
    title?: string
    /**
     * Icon standing for this page wherever it is listed outside the sidebar — the shortcuts
     * on the home page today. Declared on the route so the list needs no table of its own.
     */
    icon?: string
    /**
     * Where "up" is from this route. Set it on a route the sidebar cannot reach — a detail
     * page, a nested step — and the dashboard navbar grows a back button pointing here.
     *
     * A destination, not `router.back()`: history could just as well lead to another app,
     * and a control that sometimes leaves is worse than one that always goes to the parent.
     * Routes the sidebar already links leave this unset; they are one click away regardless.
     */
    back?: RouteLocationRaw
  }
}
