import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: isProduction ? "pg" : "better-sqlite",
  dbCredentials: isProduction
    ? {
        connectionString: process.env.POSTGRES_URL!,
      }
    : {
        url: "./local.db",
      },
} satisfies Config;
