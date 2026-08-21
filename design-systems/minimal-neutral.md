# Theme: Minimal Neutral

## Direction

Restrained, premium minimalism: calm, elegant, precise, timeless and
highly readable. Color mainly communicates actions and states.

## Colors

Primary: #18181B Primary Light: #F4F4F5 Background: #FAFAFA Surface:
#FFFFFF Text: #18181B Text Secondary: #71717A Text Muted: #A1A1AA
Border: #E4E4E7 Success: #16A34A Warning: #D97706 Error: #DC2626 Info:
#2563EB

## Typography
Font: Geist (fallback Inter). Weights 400, 500, 600.
H1 30/38 weight 500, H2 22/30, H3 17/24, Body 15/23, Small 13/18.
Never use 700 — restraint is the point.


## Spacing

4, 8, 12, 16, 24, 32, 48, 64px.

Whitespace is a major part of the design.

## Radius
0, 2, 4px. Default 2px. Cards 2px. Buttons 2px.
No pills anywhere except avatars.

## Borders and shadows

Default border: 1px solid #E4E4E7.

Default shadow: none. Use shadows only for dropdowns, popovers, modals
and floating elements.

## Components

Keep components visually quiet. Avoid decorative backgrounds, excessive
gradients, unnecessary icons and unnecessary borders.

Primary button: near-black + white. Secondary: white + border. Ghost:
transparent.

## Nuxt UI

Prefer UButton, UCard, UInput, UForm, UTable, UBadge, UModal,
UDropdownMenu and UTabs.

Use neutral as the dominant Nuxt UI color. Primary actions use
near-black. Semantic states retain semantic colors.

## Visual goal

Premium simplicity. The interface looks expensive because it is
restrained, not because it contains many effects.

## Shell — flat
shell-bg: #FAFAFA
sidebar-bg: #FAFAFA (identical to content)
sidebar-text: #71717A
sidebar-active-bg: transparent
sidebar-active-text: #18181B (weight 500 only)
sidebar-border: 1px solid #E4E4E7

Text-only navigation. No icons. No active pill, no background fill —
active state is weight + color only. Sidebar width 200px.

## Surfaces
Content sits directly on the background. Use a white card only when the
content is genuinely elevated (modal, popover, floating panel).
Sections separate with whitespace and hairlines, not with boxes.
