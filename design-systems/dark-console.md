# Theme: Dark Console

## Direction

Dark-first technical interface for logs, monitoring, infrastructure and
developer tools. Feel precise, fast, low-noise and machine-adjacent.

This is NOT a dark-mode variant of a light theme. Dark is the only mode.
Do not add a light toggle unless explicitly requested.

Avoid: neon cyberpunk, glow effects, matrix green, purple gradients.

## Colors

Background: #0B0F14
Surface: #12171F
Surface Muted: #1A212B
Surface Raised: #212A36
Primary: #4D9FFF
Primary Dark: #2E7FDD
Primary Light: #1A2C42
Text: #E6EDF3
Text Secondary: #96A3B2
Text Muted: #5F6C7B
Border: #232C38
Border Strong: #313D4C
Success: #3FB950   Success Soft: #12261A
Warning: #D29922   Warning Soft: #2A2010
Error:   #F85149   Error Soft:   #2D1618
Info:    #58A6FF   Info Soft:    #10233A

Semantic colors appear as text or 1px borders on soft backgrounds —
never as large filled blocks.

## Typography

Font: Inter. Mono: JetBrains Mono.

Mono is the default for anything machine-generated: IDs, hashes,
timestamps, durations, status codes, paths, IPs, versions, log lines.
Sans is only for prose labels, headings and buttons.

H1 22/30, H2 18/26, H3 15/22, Body 13/20, Mono 13/20, Small 11/16.

## Spacing

4, 8, 12, 16, 24, 32px. Tight by design — no 48/64.

## Radius

0, 4, 6px. Default 4px. Cards 6px. Inputs/buttons 4px.
Badges 4px, not pills.

## Borders and shadows

Borders do all the work: 1px solid #232C38.
Shadows are nearly invisible on dark surfaces — do not use them for
cards. Use only for popovers/dropdowns: 0 8px 24px rgba(0,0,0,0.5).

Elevation is communicated by surface lightness, not shadow:
Background → Surface → Surface Raised.

## Shell — solid-dark

shell-bg: #0B0F14
sidebar-bg: #0B0F14
sidebar-text: #96A3B2
sidebar-active-bg: #1A2C42
sidebar-active-text: #4D9FFF
sidebar-border: 1px solid #232C38
topbar-bg: #0B0F14
topbar-border: 1px solid #232C38

Sidebar 200px, collapsible to 48px icon rail. Items 30px high,
13px labels, 4px radius. Section labels 10px uppercase, #5F6C7B.
Topbar 44px, holds environment/context switcher and search.

## Components

Tables are the primary component. Rows 34px, 1px separators,
header 11px uppercase #5F6C7B, monospace numeric columns right-aligned.
Row hover #161C24. Selected row: 2px left border in primary.

Status badges: soft background + 1px matching border + mono 11px text.

Log/output blocks: #0B0F14 on #232C38 border, mono 12/18, no radius on
full-width blocks.

Inputs 32px, #12171F background, #313D4C border, focus ring 1px primary.

## Density

Compact everywhere. Never comfortable.

## Nuxt UI mapping

primary → #4D9FFF   neutral → zinc (dark)
success → green   warning → amber   error → red   info → blue

Configure Nuxt UI in dark mode as the default and lock it.