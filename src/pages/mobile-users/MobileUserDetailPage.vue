<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { useSessionStore } from '@/features/shared/stores/session'
import { formatDateTime } from '@/features/shared/utils/format'
import { toDisplayMessage } from '@/features/shared/utils/apiErrors'
import { mobileUserPersonalName } from '@/features/mobile-users/schemas/mobileUser'
import { useMobileUserQuery } from '@/features/mobile-users/query/useMobileUserQueries'
import { useMobileUserActions } from '@/features/mobile-users/composables/useMobileUserActions'
import MobileUserAvatar from '@/features/mobile-users/components/MobileUserAvatar.vue'
import MobileUserStatusBadge from '@/features/mobile-users/components/MobileUserStatusBadge.vue'
import MobileUserSignInBadges from '@/features/mobile-users/components/MobileUserSignInBadges.vue'
import MobileUserDevicesTable from '@/features/mobile-users/components/MobileUserDevicesTable.vue'
import BlockMobileUserModal from '@/features/mobile-users/components/BlockMobileUserModal.vue'

const route = useRoute()
const session = useSessionStore()
const { unblock, isLoading: isActing } = useMobileUserActions()

/** The route only matches digits, so this cannot be `NaN`. */
const userId = computed(() => Number(route.params.id))

const { data: user, isLoading, error } = useMobileUserQuery(userId)

const personalName = computed(() => (user.value ? mobileUserPersonalName(user.value) : null))

const isBlockOpen = shallowRef(false)

const LANGUAGES = { sr: 'Srpski', en: 'Engleski' } as const
</script>

<template>
  <div class="space-y-6">
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :description="toDisplayMessage(error)"
      data-testid="mobile-user-error"
    >
      <template #actions>
        <UButton
          :to="{ name: 'mobile-users-list' }"
          label="Nazad na listu"
          color="error"
          variant="outline"
        />
      </template>
    </UAlert>

    <USkeleton v-else-if="isLoading && !user" class="h-40 w-full" />

    <template v-else-if="user">
      <UCard>
        <div class="flex flex-wrap items-start gap-4">
          <MobileUserAvatar :user="user" size="xl" />

          <div class="min-w-0 flex-1">
            <h2 class="text-xl font-semibold text-default">{{ user.username }}</h2>
            <p v-if="personalName" class="text-sm text-default">{{ personalName }}</p>
            <p class="text-sm text-muted">{{ user.email }}</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <MobileUserStatusBadge :user="user" />
              <MobileUserSignInBadges :user="user" />
            </div>
          </div>

          <!-- A courtesy for plain users: the API answers 403 to them regardless. -->
          <div v-if="session.isAdmin">
            <UButton
              v-if="user.blocked_at !== null"
              label="Odblokiraj"
              icon="i-lucide-circle-check"
              color="success"
              variant="outline"
              :loading="isActing"
              data-testid="unblock-mobile-user"
              @click="unblock(user.id)"
            />
            <UButton
              v-else
              label="Blokiraj"
              icon="i-lucide-ban"
              color="error"
              variant="outline"
              data-testid="block-mobile-user"
              @click="isBlockOpen = true"
            />
          </div>
        </div>

        <template #footer>
          <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt class="text-xs text-muted">Registrovan</dt>
              <dd class="text-sm text-default">{{ formatDateTime(user.created_at) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Poslednji put u aplikaciji</dt>
              <dd class="text-sm text-default">{{ formatDateTime(user.last_seen_at) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Jezik</dt>
              <dd class="text-sm text-default">{{ LANGUAGES[user.locale] }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Blokiran</dt>
              <dd class="text-sm text-default">{{ formatDateTime(user.blocked_at) }}</dd>
            </div>
          </dl>
        </template>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-sm font-medium text-default">Uređaji</h3>
        </template>

        <MobileUserDevicesTable :user-id="user.id" />
      </UCard>

      <BlockMobileUserModal v-model:open="isBlockOpen" :user="user" />
    </template>
  </div>
</template>
