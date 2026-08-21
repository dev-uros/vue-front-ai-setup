<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { userFullName } from '@/features/shared/schemas/user'
import { useSessionStore } from '@/features/shared/stores/session'
import { formatDateTime } from '@/features/shared/utils/format'
import { toDisplayMessage } from '@/features/shared/utils/apiErrors'
import { useUserQuery } from '@/features/users/query/useUserQuery'
import { useUserActions } from '@/features/users/composables/useUserActions'
import UserAvatarField from '@/features/users/components/UserAvatarField.vue'
import UserRoleBadge from '@/features/users/components/UserRoleBadge.vue'
import UserStatusBadge from '@/features/users/components/UserStatusBadge.vue'
import UserFormModal from '@/features/users/components/UserFormModal.vue'
import ChangeRoleModal from '@/features/users/components/ChangeRoleModal.vue'
import DeactivateUserModal from '@/features/users/components/DeactivateUserModal.vue'
import UserLogsTable from '@/features/users/components/UserLogsTable.vue'
import UserLoginsTable from '@/features/users/components/UserLoginsTable.vue'

const route = useRoute()
const session = useSessionStore()
const { resendActivation, reactivate, isLoading: isActing } = useUserActions()

/** The route only matches digits, so this cannot be `NaN`. */
const userId = computed(() => Number(route.params.id))

const { data: user, isLoading, error } = useUserQuery(userId)

const isFormOpen = shallowRef(false)
const isRoleOpen = shallowRef(false)
const isDeactivateOpen = shallowRef(false)

const isSelf = computed(() => session.user?.id === userId.value)
/** Both audit trails are admin-only; a plain user gets the profile without them. */
const canSeeHistory = computed(() => session.isAdmin)
</script>

<template>
  <div class="space-y-6">
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :description="toDisplayMessage(error)"
      data-testid="user-error"
    >
      <template #actions>
        <UButton
          :to="{ name: 'users-list' }"
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
          <UserAvatarField :user="user" size="xl" />

          <div class="min-w-0 flex-1">
            <h2 class="text-h2 font-semibold text-highlighted">{{ userFullName(user) }}</h2>
            <p class="text-sm text-muted">{{ user.email }}</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <UserRoleBadge :role="user.role" />
              <UserStatusBadge :user="user" />
              <UBadge v-if="isSelf" label="Vi" color="info" variant="subtle" size="sm" />
            </div>
          </div>

          <div v-if="session.isAdmin" class="flex flex-wrap gap-2">
            <UButton
              label="Izmeni"
              icon="i-lucide-pencil"
              color="neutral"
              variant="outline"
              data-testid="edit-user"
              @click="isFormOpen = true"
            />

            <!-- An admin may not change their own role; the API answers 403. -->
            <UButton
              v-if="!isSelf"
              label="Promeni ulogu"
              icon="i-lucide-shield"
              color="neutral"
              variant="outline"
              data-testid="change-role"
              @click="isRoleOpen = true"
            />

            <UButton
              v-if="user.email_verified_at === null && user.deactivated_at === null"
              label="Pošalji aktivacioni link"
              icon="i-lucide-mail"
              color="neutral"
              variant="outline"
              :loading="isActing"
              data-testid="resend-activation"
              @click="resendActivation(user.id)"
            />

            <UButton
              v-if="user.deactivated_at !== null"
              label="Uključi nalog"
              icon="i-lucide-circle-check"
              color="success"
              variant="outline"
              :loading="isActing"
              data-testid="reactivate-user"
              @click="reactivate(user.id)"
            />
            <UButton
              v-else-if="!isSelf"
              label="Isključi nalog"
              icon="i-lucide-circle-slash"
              color="error"
              variant="outline"
              data-testid="deactivate-user"
              @click="isDeactivateOpen = true"
            />
          </div>
        </div>

        <template #footer>
          <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt class="text-xs text-muted">Nalog kreiran</dt>
              <dd class="text-sm tabular-nums text-default">
                {{ formatDateTime(user.created_at) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Aktiviran</dt>
              <dd class="text-sm tabular-nums text-default">
                {{ formatDateTime(user.email_verified_at) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Isključen</dt>
              <dd class="text-sm tabular-nums text-default">
                {{ formatDateTime(user.deactivated_at) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Poslednja izmena</dt>
              <dd class="text-sm tabular-nums text-default">
                {{ formatDateTime(user.updated_at) }}
              </dd>
            </div>
          </dl>
        </template>
      </UCard>

      <UCard v-if="canSeeHistory">
        <template #header>
          <h3 class="text-h3 font-semibold text-highlighted">Istorija izmena</h3>
        </template>

        <UserLogsTable :user-id="user.id" :enabled="canSeeHistory" />
      </UCard>

      <UCard v-if="canSeeHistory">
        <template #header>
          <h3 class="text-h3 font-semibold text-highlighted">Istorija prijava</h3>
        </template>

        <UserLoginsTable :user-id="user.id" :enabled="canSeeHistory" />
      </UCard>

      <UserFormModal v-model:open="isFormOpen" :user="user" />
      <ChangeRoleModal v-model:open="isRoleOpen" :user="user" />
      <DeactivateUserModal v-model:open="isDeactivateOpen" :user="user" />
    </template>
  </div>
</template>
