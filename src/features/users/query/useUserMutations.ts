import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import type { User } from '@/features/shared/schemas/user'
import { useSessionStore } from '@/features/shared/stores/session'
import {
  createUser,
  deactivateUser,
  reactivateUser,
  resendActivation,
  updateUser,
  updateUserRole,
} from '@/features/users/api/users'
import { usersKeys } from '@/features/users/query/keys'
import type {
  ChangeRoleForm,
  CreateUserForm,
  UpdateUserForm,
} from '@/features/users/schemas/userForm'

/**
 * Every write to a user account.
 *
 * None of them toast: what to say and where to say it differs per call site — a form shows a
 * 422 under its fields, a row action shows the same failure as a toast — so that decision
 * stays with the caller. What they all owe is cache correctness, which is handled here.
 */

/**
 * A write can change what a row shows, who is in the list, and what the audit trail says, so
 * the whole feature prefix is invalidated rather than a hand-picked set of keys.
 *
 * The signed-in user is a special case: an admin editing their own account would otherwise
 * keep seeing their old name in the sidebar until the next reload, because the session store
 * is client state that no query owns.
 */
function useWriteEffects() {
  const cache = useQueryCache()
  const session = useSessionStore()

  return function afterWrite(user: User) {
    cache.invalidateQueries({ key: usersKeys.root })

    if (session.user?.id === user.id) {
      session.setUser(user)
    }
  }
}

export const useCreateUserMutation = defineMutation(() => {
  const afterWrite = useWriteEffects()

  return useMutation({
    mutation: (form: CreateUserForm) => createUser(form),
    onSuccess: (result) => afterWrite(result.data),
  })
})

export interface UpdateUserVars {
  id: number
  form: UpdateUserForm
}

export const useUpdateUserMutation = defineMutation(() => {
  const afterWrite = useWriteEffects()

  return useMutation({
    mutation: ({ id, form }: UpdateUserVars) => updateUser(id, form),
    onSuccess: (result) => afterWrite(result.data),
  })
})

export interface ChangeRoleVars {
  id: number
  form: ChangeRoleForm
}

export const useChangeRoleMutation = defineMutation(() => {
  const afterWrite = useWriteEffects()

  return useMutation({
    mutation: ({ id, form }: ChangeRoleVars) => updateUserRole(id, form),
    onSuccess: (result) => afterWrite(result.data),
  })
})

export const useDeactivateUserMutation = defineMutation(() => {
  const afterWrite = useWriteEffects()

  return useMutation({
    mutation: (id: number) => deactivateUser(id),
    onSuccess: (result) => afterWrite(result.data),
  })
})

export const useReactivateUserMutation = defineMutation(() => {
  const afterWrite = useWriteEffects()

  return useMutation({
    mutation: (id: number) => reactivateUser(id),
    onSuccess: (result) => afterWrite(result.data),
  })
})

/**
 * Resending an invite changes nothing about the account itself, but it does append to the
 * audit trail (`user.activation_link_sent`), so the cache still has to be told.
 */
export const useResendActivationMutation = defineMutation(() => {
  const cache = useQueryCache()

  return useMutation({
    mutation: (id: number) => resendActivation(id),
    onSuccess: () => cache.invalidateQueries({ key: usersKeys.root }),
  })
})
