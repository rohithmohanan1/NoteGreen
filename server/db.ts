import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "@shared/schema";

export const db = drizzle(sql, { schema });
