import type { DropdownMenuItem } from '@nuxt/ui'
import type { User } from '@/features/shared/schemas/user'

/**
 * Which actions a row offers, given who is looking.
 *
 * Kept out of the component and free of side effects because the rules are the interesting
 * part and they are not obvious: an admin may not change their own role or switch off their
 * own account, only a never-activated account has an invite worth resending, and a plain user
 * gets nothing but the link to the detail page.
 *
 * None of this is protection — the API answers 403 for every one of these cases whether or not
 * the entry was ever rendered. It is here so a menu does not offer what cannot work.
 */
export interface UserRowHandlers {
  edit: (user: User) => void
  changeRole: (user: User) => void
  deactivate: (user: User) => void
  reactivate: (user: User) => void
  resendActivation: (user: User) => void
}

export interface Viewer {
  id: number | undefined
  isAdmin: boolean
}

export function userRowActions(
  user: User,
  viewer: Viewer,
  handlers: UserRowHandlers,
): DropdownMenuItem[][] {
  const groups: DropdownMenuItem[][] = [
    [
      {
        label: 'Detalji naloga',
        icon: 'i-lucide-eye',
        to: { name: 'users-detail', params: { id: user.id } },
      },
    ],
  ]

  if (!viewer.isAdmin) {
    return groups
  }

  const isSelf = viewer.id === user.id

  const edits: DropdownMenuItem[] = [
    { label: 'Izmeni podatke', icon: 'i-lucide-pencil', onSelect: () => handlers.edit(user) },
  ]

  if (!isSelf) {
    edits.push({
      label: 'Promeni ulogu',
      icon: 'i-lucide-shield',
      onSelect: () => handlers.changeRole(user),
    })
  }

  // Only an account that has never been activated has a link worth resending, and a switched
  // off account should be switched back on before it is invited anywhere.
  if (user.email_verified_at === null && user.deactivated_at === null) {
    edits.push({
      label: 'Pošalji aktivacioni link',
      icon: 'i-lucide-mail',
      onSelect: () => handlers.resendActivation(user),
    })
  }

  groups.push(edits)

  if (user.deactivated_at !== null) {
    groups.push([
      {
        label: 'Uključi nalog',
        icon: 'i-lucide-circle-check',
        onSelect: () => handlers.reactivate(user),
      },
    ])
  } else if (!isSelf) {
    groups.push([
      {
        label: 'Isključi nalog',
        icon: 'i-lucide-circle-slash',
        color: 'error',
        onSelect: () => handlers.deactivate(user),
      },
    ])
  }

  return groups
}
