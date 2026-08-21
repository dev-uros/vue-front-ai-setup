<template>
  <div class="relative flex min-h-dvh items-center justify-center overflow-hidden p-4 sm:p-6">
    <!--
      The theme's soft accent surface: one blurred brand-tinted shape behind the card, at an
      opacity low enough that nothing on top of it loses contrast.
    -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
    />

    <div class="relative w-full max-w-sm">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>
