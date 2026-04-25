import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
const dbPath = join(dataDir, "db.sqlite3");
mkdirSync(dataDir, { recursive: true });

/** Single file-backed DB; `node:sqlite` has no native addon (works on Windows without MSVC). */
export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON;");
