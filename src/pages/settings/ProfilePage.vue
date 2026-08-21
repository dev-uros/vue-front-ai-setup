<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useSessionStore } from '@/features/shared/stores/session'
import { formatDateTime } from '@/features/shared/utils/format'
import UserRoleBadge from '@/features/users/components/UserRoleBadge.vue'
import UserStatusBadge from '@/features/users/components/UserStatusBadge.vue'
import UserFormModal from '@/features/users/components/UserFormModal.vue'

/**
 * The signed-in account, straight from the session — which is itself `GET /auth/me`, read
 * fresh at every app start.
 *
 * Editing is offered only to admins because that is who the API lets edit a user, oneself
 * included: a plain user may read but not write, so a form here would only produce a 403.
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

      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs text-muted">Ime</dt>
          <dd class="text-sm text-default">{{ user.name }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted">Prezime</dt>
          <dd class="text-sm text-default">{{ user.surname }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted">Email</dt>
          <dd class="text-sm text-default">{{ user.email }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted">Uloga</dt>
          <dd class="mt-1 flex gap-2">
            <UserRoleBadge :role="user.role" />
            <UserStatusBadge :user="user" />
          </dd>
        </div>
        <div>
          <dt class="text-xs text-muted">Nalog kreiran</dt>
          <dd class="text-sm text-default">{{ formatDateTime(user.created_at) }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted">Poslednja izmena</dt>
          <dd class="text-sm text-default">{{ formatDateTime(user.updated_at) }}</dd>
        </div>
      </dl>
    </UCard>

    <UCard>
      <template #header>
        <h3 class="text-sm font-medium text-default">Lozinka</h3>
      </template>

      <!--
        There is no "change password while signed in" endpoint. The only way to a new password
        is the emailed reset link, which is also what revokes the tokens issued before it.
      -->
      <p class="text-sm text-muted">
        Lozinka se menja preko linka koji stiže na email. Odjavite se i izaberite „Zaboravili ste
        lozinku?“ na formi za prijavu.
      </p>

      <template #footer>
        <UButton
          :to="{ name: 'auth-forgot-password' }"
          label="Zatražite link za promenu lozinke"
          icon="i-lucide-key-round"
          color="neutral"
          variant="outline"
        />
      </template>
    </UCard>

    <UserFormModal v-model:open="isFormOpen" :user="user" />
  </div>
</template>
