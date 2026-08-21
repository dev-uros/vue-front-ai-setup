<script setup lang="ts">
import { useForgotPasswordFlow } from '@/features/auth/composables/useForgotPasswordFlow'
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm.vue'

const { submit, isLoading, feedback, confirmation, submittedEmail } = useForgotPasswordFlow()
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-col items-center gap-3 text-center">
        <UAvatar
          :icon="confirmation ? 'i-lucide-mail-check' : 'i-lucide-key-round'"
          size="lg"
          class="bg-primary/10 text-primary"
        />
        <div>
          <h1 class="text-h2 font-semibold text-highlighted">
            {{ confirmation ? 'Proverite poštu' : 'Zaboravljena lozinka' }}
          </h1>
          <p class="mt-1 text-sm text-muted">
            {{
              confirmation
                ? `Poslato na ${submittedEmail}.`
                : 'Unesite email adresu i poslaćemo vam link za promenu lozinke.'
            }}
          </p>
        </div>
      </div>
    </template>

    <!--
      The API's own wording, shown verbatim. It answers the same way whether or not the address
      has an account, and is phrased for that; replacing it with something more definite would
      turn this form into a way to check who is registered.
    -->
    <div v-if="confirmation" class="space-y-4" data-testid="reset-confirmation">
      <UAlert color="success" variant="subtle" icon="i-lucide-mail" :description="confirmation" />
      <p class="text-xs text-muted">
        Ako link ne stigne za nekoliko minuta, proverite i neželjenu poštu.
      </p>
    </div>

    <ForgotPasswordForm v-else :loading="isLoading" :feedback="feedback" @submit="submit" />

    <template #footer>
      <ULink :to="{ name: 'auth-login' }" class="text-sm font-medium text-primary">
        Nazad na prijavu
      </ULink>
    </template>
  </UCard>
</template>
