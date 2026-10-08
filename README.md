# Dcyde UI

Components from Dcyde, a decision log for product teams that I designed and built. Teams record what they decided and why, so the reasoning is still there months later.

Built with TypeScript, React 19, Base UI, Tailwind CSS 4 and Storybook.

Live Storybook: link coming with the first published build.

## The design idea

- **Tokens first.** Components use semantic tokens only (`bg-surface`, `text-muted`, `border-input`). The default Tailwind palette is switched off, so a raw color can't slip in. Light and dark come from the same tokens.
- **Accessible by default.** Dialogs, the switch, the filter popover, checkboxes and radios are built on [Base UI](https://base-ui.com). Focus is trapped where it should be and returns where it came from. Every text and control color meets WCAG AA, and the Colors page measures it live.
- **All the states.** Stories cover loading, empty, error, disabled, long text and French copy.
- **Reduced motion.** Durations and easings are tokens. With reduced motion turned on, nothing moves.
- **Dates in the reader's language.** Dates and group names come from `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat`.

## What's inside

| Level | Components |
| --- | --- |
| Foundations | Colors, Typography, Spacing, Motion |
| Atoms | Avatar, Badge, Button, IconButton, TagDot, TimeGroupLabel, ToggleSwitch |
| Molecules | ConfirmModal, DecisionPin, FilterChipBar, MentionTextarea |
| Organisms | ComposeOverlay, DecisionFeed |

## Run it

```bash
npm install
npm run storybook   # opens Storybook on localhost:6006
npm test            # runs every story in light and dark: keyboard flows plus an axe accessibility check
npm run lint        # TypeScript and jsx-a11y rules
```
