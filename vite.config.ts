import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Pre-bundle these up front, so the first test run doesn't reload halfway
  optimizeDeps: {
    include: ["@base-ui/react/alert-dialog", "@base-ui/react/dialog", "@base-ui/react/switch", "@base-ui/react/popover", "@base-ui/react/checkbox", "@base-ui/react/radio", "@base-ui/react/radio-group", "@base-ui/react/toggle", "react-i18next", "i18next"],
  },
});
