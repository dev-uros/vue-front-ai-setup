<script setup lang="ts">
import { usePasswordResetFlow } from '@/features/auth/composables/usePasswordResetFlow'
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm.vue'

const { submit, isLoading, errorMessage, submittedEmail, resetUrl } = usePasswordResetFlow()
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-col items-center gap-3 text-center">
        <UAvatar
          :icon="submittedEmail ? 'i-lucide-mail-check' : 'i-lucide-key-round'"
          size="lg"
          class="bg-primary/10 text-primary"
        />
        <div>
          <h1 class="text-lg font-semibold text-default">
            {{ submittedEmail ? 'Check your inbox' : 'Forgot your password?' }}
          </h1>
          <p class="mt-1 text-sm text-muted">
            {{
              submittedEmail
                ? 'If an account exists for that address, a reset link is on its way.'
                : 'Enter your email and we will send you a link to reset it.'
            }}
          </p>
        </div>
      </div>
    </template>

    <div v-if="submittedEmail" class="space-y-4" data-testid="reset-confirmation">
      <UAlert
        color="success"
        variant="subtle"
        icon="i-lucide-mail"
        :description="`We sent the reset link to ${submittedEmail}.`"
      />
      <p class="text-xs text-muted">
        The link expires in 30 minutes. Check your spam folder if it does not arrive.
      </p>

      <!-- Demo build: no mail is sent, so the link the email would carry is shown here. -->
      <UButton
        v-if="resetUrl"
        :to="resetUrl"
        label="Open the reset link"
        icon="i-lucide-external-link"
        color="neutral"
        variant="outline"
        block
        data-testid="demo-reset-link"
      />
    </div>

    <ForgotPasswordForm
      v-else
      :loading="isLoading"
      :error-message="errorMessage"
      @submit="submit"
    />

    <template #footer>
      <div class="space-y-2">
        <ULink :to="{ name: 'auth-login' }" class="text-sm font-medium text-primary">
          Back to sign in
        </ULink>
        <!-- Demo build: no mail is actually sent, see features/auth/api/requestPasswordReset.ts -->
        <p class="text-xs text-muted">Demo build — no email is actually delivered.</p>
      </div>
    </template>
  </UCard>
</template>
