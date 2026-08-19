<script setup lang="ts">
import { useLoginFlow } from '@/features/auth/composables/useLoginFlow'
import LoginForm from '@/features/auth/components/LoginForm.vue'

const { submit, isLoading, errorMessage } = useLoginFlow()
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-col items-center gap-3 text-center">
        <UAvatar icon="i-lucide-gem" size="lg" class="bg-primary/10 text-primary" />
        <div>
          <h1 class="text-lg font-semibold text-default">Welcome back</h1>
          <p class="mt-1 text-sm text-muted">Sign in to your Fifth Guild workspace.</p>
        </div>
      </div>
    </template>

    <LoginForm :loading="isLoading" :error-message="errorMessage" @submit="submit" />

    <template #footer>
      <!-- Demo build: the credentials are mocked in features/auth/api/login.ts -->
      <div class="space-y-1 text-xs text-muted">
        <p class="font-medium text-default">Demo credentials</p>
        <p>Works: <code>ana.kovac@fifthguild.dev</code> / <code>Password123!</code></p>
        <p>Fails: <code>ne.postoji@fifthguild.dev</code> / <code>Password123!</code></p>
      </div>
    </template>
  </UCard>
</template>
