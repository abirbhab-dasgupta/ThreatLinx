                                                                              
import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";
config({ path: ".env.local" });
config({ path: ".env" });
const connectionString = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!connectionString) { console.error("Missing DATABASE_URL or DATABASE_MIGRATION_URL"); process.exit(1); }
const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10000 });
try {
  const client = await pool.connect();
  try {
    const found = await client.query("SELECT to_regclass('public.message_cases') AS messages, to_regclass('public.scans') AS scans, to_regclass('public.reports') AS reports, to_regclass('public.\"user\"') AS auth");
    if (!found.rows[0]?.scans || !found.rows[0]?.reports || !found.rows[0]?.auth) throw Error("First migrate Better Auth and the original product schema.");
    const sql = await readFile(new URL("../db/migrations/0002_intelligence_web3.sql", import.meta.url), "utf8");
    await client.query(sql);
    const checks = await client.query("SELECT to_regclass('public.message_cases') AS messages, to_regclass('public.message_links') AS links, to_regclass('public.report_commitments') AS commitments");
    if (Object.values(checks.rows[0]).some(x => !x)) throw Error("Expected intelligence tables missing after migration");
    console.log("ThreatLinx intelligence tables created/verified. Existing data preserved.");
  } finally { client.release(); }
} catch (error) { console.error("Migration failed:", error instanceof Error ? error.message : error); process.exitCode=1; }
finally { await pool.end(); }
