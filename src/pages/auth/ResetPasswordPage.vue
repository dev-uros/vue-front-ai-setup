<script setup lang="ts">
import { useSetPasswordFlow } from '@/features/auth/composables/useSetPasswordFlow'
import SetPasswordForm from '@/features/auth/components/SetPasswordForm.vue'

/** Reached from the password reset email: /auth/reset-password?email=…&token=… */
const { link, submit, isLoading, feedback, isLinkRejected } = useSetPasswordFlow('reset')
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-col items-center gap-3 text-center">
        <UAvatar
          :icon="link ? 'i-lucide-lock-keyhole' : 'i-lucide-link-2-off'"
          size="lg"
          class="bg-primary/10 text-primary"
        />
        <div>
          <h1 class="text-lg font-semibold text-default">
            {{ link ? 'Nova lozinka' : 'Link nije ispravan' }}
          </h1>
          <p class="mt-1 text-sm text-muted">
            {{
              link
                ? `Postavljate novu lozinku za ${link.email}.`
                : 'Link je nepotpun. Zatražite novi.'
            }}
          </p>
        </div>
      </div>
    </template>

    <SetPasswordForm
      v-if="link"
      :email="link.email"
      submit-label="Sačuvaj lozinku"
      :loading="isLoading"
      :feedback="feedback"
      @submit="submit"
    />

    <!--
      A rejected link cannot be fixed by retyping the password, so the way forward is a new
      link. The API deliberately does not say whether it expired, was already used, or belongs
      to another account — the alert above carries its wording, and this only offers the exit.
    -->
    <UButton
      v-if="!link || isLinkRejected"
      :to="{ name: 'auth-forgot-password' }"
      label="Zatražite novi link"
      size="lg"
      block
      :variant="link ? 'outline' : 'solid'"
      :color="link ? 'neutral' : 'primary'"
      :class="link ? 'mt-4' : ''"
      data-testid="request-new-link"
    />

    <template #footer>
      <ULink :to="{ name: 'auth-login' }" class="text-sm font-medium text-primary">
        Nazad na prijavu
      </ULink>
    </template>
  </UCard>
</template>
