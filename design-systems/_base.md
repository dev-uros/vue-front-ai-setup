# Base Design System Rules

These rules apply to every theme.

## Nuxt UI

Prefer Nuxt UI components whenever an appropriate component exists:

UButton, UInput, UTextarea, USelect, USelectMenu, UCard, UBadge, UAlert,
UModal, UDrawer, UTabs, UProgress, UAvatar, UTooltip, UPopover,
UDropdownMenu, UTable, UForm, UField.

Do not recreate Nuxt UI components unless the existing component
genuinely cannot support the required interaction.

## Theme tokens

Establish these tokens first:

-   primary
-   primary-dark
-   primary-light
-   background
-   surface
-   surface-muted
-   text
-   text-secondary
-   text-muted
-   border
-   success
-   warning
-   error
-   info
-   font-family
-   radius scale
-   shadow scale
-   spacing scale

Prefer Nuxt UI semantic colors and theme configuration over scattered
hard-coded colors.

## Consistency

Use one spacing scale, one radius scale and a limited shadow system. Do
not mix unrelated visual styles from different themes.

## Responsive

On mobile, preserve comfortable touch targets, avoid horizontal overflow
and prioritize primary actions.

On desktop, use columns where useful, maintain readable line lengths and
avoid excessively wide cards.

## Accessibility

Maintain keyboard accessibility, visible focus states, sufficient
contrast, semantic HTML, accessible labels and sensible disabled/error
states.

## Functional safety

A visual theme change must NOT modify business logic, API behavior,
routes, state management, validation, database behavior, authentication,
authorization or data models unless explicitly requested.

## Application order

1.  global theme tokens
2.  application shell
3.  navigation
4.  shared components
5.  forms and controls
6.  cards/data presentation
7.  page-specific components
8.  empty/loading/error states

## Avoid

Do not automatically add gradients, glassmorphism, excessive animations,
huge shadows, excessive rounding, decorative icons, random colors or
arbitrary spacing.

## Final audit

Check typography, spacing, radius, button hierarchy, inputs, cards,
badges, empty/loading/error states, navigation, mobile and desktop
layouts, and dark mode if supported.
