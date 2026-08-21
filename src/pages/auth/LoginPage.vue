<script setup lang="ts">
import { useLoginFlow } from '@/features/auth/composables/useLoginFlow'
import LoginForm from '@/features/auth/components/LoginForm.vue'

const { submit, isLoading, feedback } = useLoginFlow()
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-col items-center gap-3 text-center">
        <UAvatar icon="i-lucide-gem" size="lg" class="bg-primary/10 text-primary" />
        <div>
          <h1 class="text-lg font-semibold text-default">Dobrodošli nazad</h1>
          <p class="mt-1 text-sm text-muted">Prijavite se na svoj Fifth Guild nalog.</p>
        </div>
      </div>
    </template>

    <LoginForm :loading="isLoading" :feedback="feedback" @submit="submit" />
  </UCard>
</template>
