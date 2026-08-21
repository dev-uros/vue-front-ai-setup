<template>
  <div class="flex min-h-dvh items-center justify-center p-4 sm:p-6">
    <div class="w-full max-w-sm">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>
