import './assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import router from './router'
import { onUnauthorized } from '@/lib/axios'
import { useSessionStore } from '@/features/shared/stores/session'
import { restoreSession } from '@/features/auth/bootstrap'
import { LOGIN_ROUTE } from '@/router/guards'

const app = createApp(App)

app.use(createPinia())
app.use(PiniaColada, {
  queryOptions: {
    // Always refetch on mount. The screens here are administrative: a stale role or an
    // account that was switched off a minute ago is worse than an extra request.
    staleTime: 0,
  },
})
app.use(ui)

/**
 * The router is installed only after the stored token has been traded for an account, because
 * the auth guard has to answer "is anyone signed in" for the very first navigation and cannot
 * wait for a request to land.
 */
restoreSession().then(() => {
  // From here on a 401 means the token died mid-session — revoked elsewhere, or invalidated
  // by a password reset. `lib/axios` has already thrown it away; this is the other half.
  onUnauthorized(() => {
    useSessionStore().end()
    void router.push({ name: LOGIN_ROUTE })
  })

  app.use(router)
  app.mount('#app')
})
