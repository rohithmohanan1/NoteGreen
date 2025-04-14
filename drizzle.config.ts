import { defineConfig } from "drizzle-kit";
import path from "path";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./migrations",
  driver: "turso",
  dialect: "sqlite",
  dbCredentials: {
    url: path.join(process.cwd(), "local.db"),
  },
});
