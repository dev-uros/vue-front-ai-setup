<script setup lang="ts">
import type { Shortcut } from '@/features/shortcuts/composables/useShortcuts'

/**
 * The shortcuts, or an explanation of why there are none yet.
 *
 * The empty state is the normal state on a fresh account, so it says what will happen rather
 * than apologising: nothing is broken, the list simply has nothing to rank yet.
 */
const props = defineProps<{
  shortcuts: Shortcut[]
}>()

/**
 * Forgetting is offered because the history is kept on the machine: whoever is at a shared
 * computer can wipe their own trail without waiting for someone to clear the browser.
 */
const emit = defineEmits<{
  clear: []
}>()

/** 1 poseta, 2–4 posete, 5+ poseta — and 12 to 14 stay `poseta` despite ending in 2, 3, 4. */
function visitLabel(visits: number): string {
  const last = visits % 10
  const lastTwo = visits % 100
  const isFew = last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)

  return `${visits} ${isFew ? 'posete' : 'poseta'}`
}
</script>

<template>
  <UCard data-testid="shortcuts">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="text-sm font-medium text-default">Prečice</h3>
          <p class="mt-1 text-xs text-muted">Stranice na koje se najčešće vraćate.</p>
        </div>

        <UButton
          v-if="props.shortcuts.length > 0"
          label="Obriši prečice"
          icon="i-lucide-eraser"
          color="neutral"
          variant="ghost"
          size="xs"
          data-testid="shortcuts-clear"
          @click="emit('clear')"
        />
      </div>
    </template>

    <p v-if="props.shortcuts.length === 0" class="text-sm text-muted" data-testid="shortcuts-empty">
      Ovde se same skupljaju stranice koje najčešće otvarate — koristite aplikaciju i prečice će se
      pojaviti.
    </p>

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <!--
        The wrapper carries the test hook on purpose: `UPageCard` binds attributes onto the
        overlay link it lays over the card, which holds no text of its own.
      -->
      <div v-for="shortcut in props.shortcuts" :key="shortcut.key" data-testid="shortcut">
        <UPageCard
          :to="shortcut.to"
          :icon="shortcut.icon"
          :title="shortcut.label"
          :description="visitLabel(shortcut.visits)"
          variant="outline"
          class="h-full"
          :ui="{ container: 'p-4 sm:p-4', title: 'text-sm', description: 'text-xs' }"
        />
      </div>
    </div>
  </UCard>
</template>
