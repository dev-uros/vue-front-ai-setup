import type { User } from '@/features/shared/schemas/user'
import type { Viewer } from '@/features/users/utils/rowActions'

/**
 * Who may set or remove a profile picture: an admin for anybody, everyone else only for their
 * own account.
 *
 * This is the one write a plain user is allowed at all — every other endpoint under `/users`
 * refuses them. As with the row actions, hiding the control is a courtesy; the API answers
 * 403 for somebody else's account whether or not the button was ever rendered.
 */
export function canManageAvatar(viewer: Viewer, user: Pick<User, 'id'>): boolean {
  return viewer.isAdmin || (viewer.id !== undefined && viewer.id === user.id)
}
