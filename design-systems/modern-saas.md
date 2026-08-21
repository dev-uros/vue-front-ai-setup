# Theme: Modern SaaS

## Direction

Contemporary startup SaaS: modern, energetic, premium, optimistic and
polished. Expressive but not noisy.

## Colors

Primary: #6D5DFB Primary Dark: #5145CD Primary Light: #EEECFF Accent:
#22C55E Background: #FAFAFF Surface: #FFFFFF Text: #18181B Text
Secondary: #71717A Text Muted: #A1A1AA Border: #E4E4E7 Success: #22C55E
Warning: #F59E0B Error: #EF4444 Info: #3B82F6

## Typography
Font: Plus Jakarta Sans. Weights 400, 500, 600, 700, 800.
H1 32/40 weight 800, H2 24/32 weight 700, H3 18/26, Body 15/23.

## Spacing

4, 8, 12, 16, 24, 32, 40, 48, 64px.

## Radius
Inputs/buttons 12px. Cards 16px. Featured 20px. Shell 24px. Pills 9999px.
Generous rounding is the identity.


## Shadows

Card: 0 4px 20px rgba(0,0,0,0.05) Floating: 0 8px 30px rgba(0,0,0,0.08)

Keep shadows soft.

## Components

Cards use white surfaces, soft borders, subtle shadows and generous
padding. Featured cards may use subtle gradients.

Primary CTA: purple + white. Secondary: light purple + purple. Ghost:
transparent.

Subtle gradients, blurred background shapes and soft accent surfaces are
allowed, but decoration must never reduce readability.

Dashboards can use large metric cards, visual charts, prominent CTAs and
clear empty states.

## Nuxt UI mapping

primary → #6D5DFB success → #22C55E warning → #F59E0B error → #EF4444
info → #3B82F6 neutral → neutral gray scale

## Avoid

Generic Bootstrap styling, excessive gradients, excessive glassmorphism,
giant typography everywhere and random colorful cards.


## Shell — floating
shell-bg: #F4F2FF
sidebar-bg: #FFFFFF
sidebar-text: #71717A
sidebar-active-bg: #EEECFF
sidebar-active-text: #5145CD
sidebar-border: none
topbar-bg: transparent

Sidebar is a detached panel: 16px margin on all sides, 20px radius,
shadow 0 4px 24px rgba(109,93,251,0.08). Content area is a second
floating white panel with the same radius. The tinted background stays
visible between them.

Active item: filled light-purple pill, 10px radius, 40px high.