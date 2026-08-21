# Design Systems for Nuxt UI

A visual theme library for Claude Code / AI-assisted Nuxt + Vue
development.

## Files

-   `_base.md` --- shared implementation rules
-   `eco-gamification.md` --- friendly ecological product
-   `business-navy.md` --- professional B2B SaaS
-   `modern-saas.md` --- polished startup SaaS
-   `minimal-neutral.md` --- restrained premium minimalism
-   `tech-blue.md` --- technical data-heavy dashboard
-   `warm-editorial.md` --- warm content/editorial product

## Usage

Tell Claude:

> Apply `design-systems/eco-gamification.md` to the current application.
> Use `_base.md` as the global implementation rules. Do not change
> functionality.

Or:

> Switch the current application to `design-systems/business-navy.md`.
> Keep functionality and information architecture unchanged.

## Workflow

Read `_base.md`, then the selected theme. Inspect the existing Nuxt UI
implementation, establish global tokens first, update shared components
before page-specific components, preserve functionality, and check
mobile and desktop layouts.
