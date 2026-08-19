import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Reachable without a session. Everything is behind the auth guard by default —
     * this is the only opt-out, so a new route is protected unless it says otherwise.
     */
    public?: boolean
    /** Rendered as the page title in the dashboard navbar. */
    title?: string
  }
}
