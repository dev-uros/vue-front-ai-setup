<script setup lang="ts">
import { useSetPasswordFlow } from '@/features/auth/composables/useSetPasswordFlow'
import SetPasswordForm from '@/features/auth/components/SetPasswordForm.vue'

/**
 * Reached from the activation email: /auth/activate-account?email=…&token=…
 *
 * Same form as a password reset, different endpoint: this one also marks the address as
 * verified, which is what turns an invited account into a usable one.
 */
const { link, submit, isLoading, feedback, isLinkRejected } = useSetPasswordFlow('activate')
</script>

<template>
  <UCard class="shadow-sm">
    <template #header>
      <div class="flex flex-col items-center gap-3 text-center">
        <UAvatar
          :icon="link ? 'i-lucide-user-check' : 'i-lucide-link-2-off'"
          size="lg"
          class="bg-primary/10 text-primary"
        />
        <div>
          <h1 class="text-xl font-semibold text-highlighted">
            {{ link ? 'Aktivirajte nalog' : 'Link nije ispravan' }}
          </h1>
          <p class="mt-1 text-sm text-muted">
            {{
              link
                ? `Postavite lozinku za ${link.email} i nalog je spreman.`
                : 'Link je nepotpun. Zatražite novi od administratora.'
            }}
          </p>
        </div>
      </div>
    </template>

    <SetPasswordForm
      v-if="link"
      :email="link.email"
      submit-label="Aktiviraj nalog"
      :loading="isLoading"
      :feedback="feedback"
      @submit="submit"
    />

    <!--
      Unlike a reset, the user cannot request a new activation link themselves — only an admin
      can resend it (`POST /users/{id}/resend-activation`). So this says who to ask instead of
      linking somewhere that will not help.
    -->
    <UAlert
      v-if="!link || isLinkRejected"
      color="neutral"
      variant="subtle"
      icon="i-lucide-info"
      description="Novi aktivacioni link može da pošalje administrator."
      :class="link ? 'mt-4' : ''"
      data-testid="activation-help"
    />

    <template #footer>
      <ULink :to="{ name: 'auth-login' }" class="text-sm font-medium text-primary">
        Nazad na prijavu
      </ULink>
    </template>
  </UCard>
</template>
