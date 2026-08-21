<template>
  <div
    class="app-canvas flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center"
  >
    <UAvatar icon="i-lucide-compass" size="lg" class="bg-primary/10 text-primary" />
    <div>
      <h1 class="text-xl font-semibold text-highlighted">Stranica ne postoji</h1>
      <p class="mt-1 text-sm text-muted">Adresa koju ste otvorili ne vodi nigde.</p>
    </div>
    <UButton :to="{ name: 'home' }" label="Nazad na početnu" />
  </div>
</template>
