                                                                             
import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";

config({ path: ".env.local" });
config({ path: ".env" });

const connectionString = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL (or DATABASE_MIGRATION_URL) in .env.local.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  max: 1,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 2_000,
});

try {
  const client = await pool.connect();
  try {
    const authTable = await client.query(
      `SELECT to_regclass('public."user"') AS auth_user`
    );
    if (!authTable.rows[0]?.auth_user) {
      throw new Error(
        'Missing public."user". Run "npm run db:migrate:auth" before the product migration.'
      );
    }

    const sql = await readFile(
      new URL("../db/migrations/0001_product.sql", import.meta.url),
      "utf8"
    );
    if (!sql.trim()) throw new Error("Product SQL migration file is empty.");

                                                                              
    await client.query(sql);

    const expected = ["scans", "scan_evidence", "provider_checks", "reports"];
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
    `, [expected]);
    const found = new Set(tables.rows.map((row) => row.table_name));
    const missing = expected.filter((table) => !found.has(table));
    if (missing.length) throw new Error(`Expected tables missing: ${missing.join(", ")}`);

    console.log("Product schema applied. Verified tables:", expected.join(", "));
    console.log('Better Auth tables were not modified by the product migration.');
  } finally {
    client.release();
  }
} catch (error) {
  console.error("Product migration failed:", error.message);
  if (error.code) console.error(`PostgreSQL/network code: ${error.code}`);
  if (error.code === "28P01") console.error("Check the Neon database role/password.");
  if (error.code === "3D000") console.error("Check the Neon database name.");
  if (["ENOTFOUND", "EAI_AGAIN", "ETIMEDOUT", "ECONNREFUSED"].includes(error.code)) {
    console.error("Check the Neon host, network, and firewall.");
  }
  process.exitCode = 1;
} finally {
  await pool.end();
}
