# shadcn visual comparison

Before: `f72bbd1d22371e016934c8e68f3e875701e48fc4` (PR merge base).

After UI source: `7359e4fb8127e76c1c07af1c9baef75df2117d1b`. Later commits in this PR only add review evidence.

The Open popover now anchors below its trigger instead of covering the viewport corner. Stock control sizes and menu spacing change; the butr branding remains.

Manually compared matching desktop (1280×800) and mobile (390×844) viewports in Chromium, light theme, reduced motion. No horizontal overflow or unexpected clipping was observed in the sampled after states. This covers the pages/states below, not every screen, authenticated flow, or dark-mode state.

## Introduction, Open popover expanded

App: `docs`. Route: `/`. Same route and state on both commits.

Desktop

| Before                                     | After                                    |
| ------------------------------------------ | ---------------------------------------- |
| ![Before](page-actions-desktop-before.png) | ![After](page-actions-desktop-after.png) |

Mobile

| Before                                    | After                                   |
| ----------------------------------------- | --------------------------------------- |
| ![Before](page-actions-mobile-before.png) | ![After](page-actions-mobile-after.png) |
