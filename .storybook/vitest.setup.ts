import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as projectAnnotations from "./preview";

// Gives the test runner the same decorators and a11y settings as Storybook.
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
