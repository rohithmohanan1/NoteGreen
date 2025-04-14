import { mkdir, access, constants, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "sqlite.db");

async function ensureDbDirectory() {
  try {
    // Create directory
    await mkdir(DB_DIR, { recursive: true, mode: 0o777 });
    console.log("✓ Database directory created:", DB_DIR);

    // Ensure database file exists
    if (!existsSync(DB_FILE)) {
      await writeFile(DB_FILE, "", { mode: 0o666 });
      console.log("✓ Database file created:", DB_FILE);
    }

    // Verify permissions
    await Promise.all([
      access(DB_DIR, constants.R_OK | constants.W_OK),
      access(DB_FILE, constants.R_OK | constants.W_OK),
    ]);

    console.log({
      cwd: process.cwd(),
      dbDir: DB_DIR,
      dbFile: DB_FILE,
      env: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL,
    });

    console.log("✓ All permissions verified");
  } catch (error) {
    console.error("‼ Database setup failed:", {
      error: error.message,
      code: error.code,
      stack: error.stack,
    });
    process.exit(1);
  }
}

ensureDbDirectory().catch(console.error);
