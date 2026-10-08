<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".storybook/public/dcyde.svg">
  <img src=".storybook/public/dcyde-light.svg" alt="Dcyde" width="160">
</picture>

# Dcyde UI

A component library based on Dcyde's decision feed. Dcyde is a decision log for product teams that I designed and built.

See it live: [dcyde-ui.vercel.app](https://dcyde-ui.vercel.app)

Built with TypeScript, React 19, Base UI, Tailwind CSS 4 and Storybook.

## Two decisions

- The default Tailwind palette is switched off. Components can only use the semantic tokens, so a raw color can't slip in.
- Base UI where it fits, plain code where it doesn't. Dialogs, popovers and form controls use Base UI. The mention field is custom, because Base UI has no pattern for mentions in a textarea. "Show details" on a decision is a plain button with `aria-expanded`, because one disclosure didn't need a library part.

## Run it

```bash
npm install
npm run storybook   # opens Storybook on localhost:6006
npm test            # runs every story in light and dark, English and French: keyboard flows plus an axe accessibility check
npm run lint        # TypeScript and jsx-a11y rules
```

Designed and built by [Alex Oprea](https://opreadoru.com). © 2026 Alex Oprea. All rights reserved.
