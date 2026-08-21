# Theme: Dense Admin

## Direction

High-density internal admin / ERP interface. Optimized for operators who
use it all day and need maximum rows and fields per screen.

Information density beats visual comfort. Whitespace is a cost, not a
feature.

Avoid: cards as containers, generous padding, large headings, hero
sections, decorative icons, marketing polish.

## Colors

Background: #FFFFFF
Surface: #FFFFFF
Surface Muted: #F5F6F8
Surface Header: #EDEFF2
Primary: #1F4E8C
Primary Dark: #163A69
Primary Light: #E8F0FA
Text: #1A1D21
Text Secondary: #5A6270
Text Muted: #8B93A1
Border: #D6DAE0
Border Strong: #B4BAC4
Success: #1E7A3C   Success Soft: #E3F5E8
Warning: #A66A00   Warning Soft: #FDF3DF
Error:   #B3261E   Error Soft:   #FBE6E4
Info:    #1F4E8C   Info Soft:    #E8F0FA

Color is reserved for status and actions only. The interface is
predominantly white and gray.

## Typography

Font: Inter. Mono: Roboto Mono for codes, quantities and amounts.
Tabular numerals mandatory everywhere numbers align.

H1 18/24, H2 15/20, H3 13/18, Body 13/18, Small 11/15, Micro 10/14.

Headings are barely larger than body text. Hierarchy comes from weight
and color, not size.

## Spacing

2, 4, 6, 8, 12, 16, 24px. Nothing above 24px.

Page padding 12px. Section gap 12px. Field gap 8px.

## Radius

0, 2, 3px. Default 2px. Buttons 2px. Inputs 2px.
No pills, no rounded cards.

## Borders and shadows

1px solid #D6DAE0 everywhere. No shadows except dropdowns and modals:
0 2px 8px rgba(0,0,0,0.15).

## Shell — flat

shell-bg: #FFFFFF
sidebar-bg: #F5F6F8
sidebar-text: #1A1D21
sidebar-active-bg: #E8F0FA
sidebar-active-text: #1F4E8C
sidebar-border: 1px solid #D6DAE0
topbar-bg: #FFFFFF
topbar-border: 1px solid #D6DAE0

Sidebar 208px, items 26px high, 13px labels, 2px radius, no icons unless
the module genuinely needs one. Nested groups indent by 12px.
Topbar 40px: breadcrumb left, global search center, user menu right.

## Components

No cards. Content sits in bordered regions with a 28px header strip
(#EDEFF2, 12px uppercase label) and flush content below.

Tables: rows 28px, header 26px, 1px separators, no zebra,
hover #F5F6F8. Numeric and date columns right-aligned, monospace.
Sticky header and sticky first column on wide tables.
Row actions are icon-only, 20px, revealed on hover.

Forms: label above input, 11px #5A6270. Inputs 28px high, 13px text.
Multi-column by default — 3 or 4 fields per row on desktop.
Never one field per row unless the field is full-width by nature.

Buttons 28px high, 13px, 2px radius. Toolbar buttons may be 24px.

Status badges: 18px high, 11px, soft background, 2px radius, no border.

## Density

Compact only. This theme has no comfortable mode.

## Responsive

Below 1024px the table switches to a horizontally scrollable region with
a sticky first column. Do not convert rows into stacked cards —
the operator needs the columns.

## Nuxt UI mapping

primary → #1F4E8C   neutral → gray
success → green   warning → amber   error → red   info → blue

Prefer UTable, UInput, USelect, USelectMenu, UButton, UBadge, UPopover,
UModal, UDropdownMenu, UTabs. Avoid UCard.