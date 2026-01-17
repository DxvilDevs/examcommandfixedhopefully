import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/exam-command-centre/" // <-- CHANGE to "/<your-repo-name>/"
});
