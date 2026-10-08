import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// The Storybook frame (sidebar and toolbar) follows the system theme and shows
// the matching logo. The components inside follow the Theme switch in the toolbar.
const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;

addons.setConfig({
  theme: create({
    base: dark ? "dark" : "light",
    brandTitle: "Dcyde UI",
    brandImage: dark ? "./dcyde.svg" : "./dcyde-light.svg",
    brandUrl: "https://github.com/opreadoru/dcyde-ui",
    brandTarget: "_blank",
  }),
});
