<script setup lang="ts">
import { useAppTheme, type ThemePreference } from '@/features/shared/composables/useAppTheme'

const { preference, resolved } = useAppTheme()

const options: { label: string; value: ThemePreference; icon: string }[] = [
  { label: 'Svetla', value: 'light', icon: 'i-lucide-sun' },
  { label: 'Tamna', value: 'dark', icon: 'i-lucide-moon' },
  { label: 'Sistemska', value: 'auto', icon: 'i-lucide-monitor' },
]
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <div>
        <h3 class="text-h3 font-semibold text-highlighted">Tema</h3>
        <p class="text-xs text-muted">
          Trenutno je uključena {{ resolved === 'dark' ? 'tamna' : 'svetla' }} tema.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="option in options"
          :key="option.value"
          :icon="option.icon"
          :label="option.label"
          :color="preference === option.value ? 'primary' : 'neutral'"
          :variant="preference === option.value ? 'solid' : 'outline'"
          @click="preference = option.value"
        />
      </div>
    </div>
  </UCard>
</template>
