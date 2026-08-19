import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/features/shared/stores/session'
import { useResetPasswordMutation } from '@/features/auth/query/useResetPasswordMutation'
import { resetLinkSchema } from '@/features/auth/schemas/passwordReset'
import { HOME_ROUTE } from '@/router/guards'

/**
 * Reads the reset link out of the URL, sets the new password, and signs the user straight in —
 * proving the token is what a real backend would treat as proof of identity.
 */
export function useResetPasswordFlow() {
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()
  const { mutateAsync, isLoading, error } = useResetPasswordMutation()

  /** `null` when the link is missing pieces or malformed — the page shows a dead-link state. */
  const link = computed(() => {
    const parsed = resetLinkSchema.safeParse({
      email: route.query.email,
      token: route.query.token,
    })
    return parsed.success ? parsed.data : null
  })

  const errorMessage = computed(() =>
    error.value ? 'We could not set your new password. Please try again.' : null,
  )

  async function submit(password: string) {
    if (!link.value) {
      return
    }

    let user
    try {
      user = await mutateAsync({ ...link.value, password })
    } catch {
      return
    }

    session.start(user)
    await router.replace({ name: HOME_ROUTE })
  }

  return { link, submit, isLoading, errorMessage }
}
