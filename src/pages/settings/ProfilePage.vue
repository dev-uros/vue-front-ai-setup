<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useSessionStore } from '@/features/shared/stores/session'
import { formatDateTime } from '@/features/shared/utils/format'
import UserAvatarField from '@/features/users/components/UserAvatarField.vue'
import UserRoleBadge from '@/features/users/components/UserRoleBadge.vue'
import UserStatusBadge from '@/features/users/components/UserStatusBadge.vue'
import UserFormModal from '@/features/users/components/UserFormModal.vue'

/**
 * The signed-in account, straight from the session — which is itself `GET /auth/me`, read
 * fresh at every app start.
 *
 * Editing is offered only to admins because that is who the API lets edit a user, oneself
 * included: a plain user may read but not write, so a form here would only produce a 403.
 *
 * The profile picture is the exception, and the reason this page matters to a plain user at
 * all: anyone may set or remove their own.
 *
 * Passwords are not here at all. There is no "change password while signed in" endpoint, and
 * the page that requests a reset link is `guestOnly` — a signed-in visitor is sent home by the
 * auth guard — so a button pointing at it from here could only ever look broken. Changing a
 * password starts from the sign-in form, signed out.
 */
const session = useSessionStore()

const user = computed(() => session.user)
const isFormOpen = shallowRef(false)
</script>

<template>
  <div v-if="user" class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="text-sm font-medium text-default">Podaci naloga</h3>
          <UButton
            v-if="session.isAdmin"
            label="Izmeni"
            icon="i-lucide-pencil"
            color="neutral"
            variant="outline"
            size="sm"
            data-testid="edit-profile"
            @click="isFormOpen = true"
          />
        </div>
      </template>

      <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <UserAvatarField :user="user" size="3xl" />

        <!--
          Names are prose and stay sans; address and timestamps are stored values and are set
          as such. The labels take the same 11px uppercase treatment as a table header.
        -->
        <dl class="grid flex-1 gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs uppercase tracking-wide text-dimmed">Ime</dt>
            <dd class="mt-0.5 text-sm text-default">{{ user.name }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-dimmed">Prezime</dt>
            <dd class="mt-0.5 text-sm text-default">{{ user.surname }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-dimmed">Email</dt>
            <dd class="mt-0.5 font-mono text-xs text-default">{{ user.email }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-dimmed">Uloga</dt>
            <dd class="mt-1 flex gap-2">
              <UserRoleBadge :role="user.role" />
              <UserStatusBadge :user="user" />
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-dimmed">Nalog kreiran</dt>
            <dd class="mt-0.5 font-mono text-xs text-default">
              {{ formatDateTime(user.created_at) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-dimmed">Poslednja izmena</dt>
            <dd class="mt-0.5 font-mono text-xs text-default">
              {{ formatDateTime(user.updated_at) }}
            </dd>
          </div>
        </dl>
      </div>
    </UCard>

    <UserFormModal v-model:open="isFormOpen" :user="user" />
  </div>
</template>
