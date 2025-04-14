import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import * as schema from "@shared/schema";

const sqlite = new Database(path.join(process.cwd(), "local.db"));
export const db = drizzle(sqlite, { schema });
