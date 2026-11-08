                                                                  
import { config } from "dotenv";
import { Pool } from "pg";

config({ path: ".env.local" });
config({ path: ".env" });

const connectionString = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL (or DATABASE_MIGRATION_URL) in .env.local.");
  process.exit(1);
}

let pool;
try {
  const parsed = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("Database URL must begin with postgresql:// or postgres://");
  }
  if (!parsed.hostname) throw new Error("Database URL does not include a hostname");

  console.log(`Connecting to Neon PostgreSQL host: ${parsed.hostname}`);
  pool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 2_000,
  });

  const identity = await pool.query(
    "SELECT current_database() AS database, current_user AS role, current_schema() AS schema"
  );
  const { database, role, schema } = identity.rows[0];
  console.log(`Connected: database=${database}, role=${role}, schema=${schema}`);

  const objects = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = ANY($1::text[])
  `, [["user", "session", "account", "verification", "scans", "scan_evidence", "provider_checks", "reports", "message_cases", "message_links", "report_commitments"]]);
  const found = new Set(objects.rows.map((row) => row.table_name));
  const authTables = ["user", "session", "account", "verification"];
  const productTables = ["scans", "scan_evidence", "provider_checks", "reports"];
  const intelligenceTables = ["message_cases", "message_links", "report_commitments"];

  console.log("\nBetter Auth tables:");
  for (const table of authTables) {
    console.log(`  ${found.has(table) ? "OK" : "MISSING"}  public.${table}`);
  }
  console.log("\nProduct tables:");
  for (const table of productTables) {
    console.log(`  ${found.has(table) ? "OK" : "MISSING"}  public.${table}`);
  }

  console.log("\nMessage and blockchain tables:");
  for (const table of intelligenceTables) console.log(`  ${found.has(table) ? "OK" : "MISSING"}  public.${table}`);

  if (!authTables.every((table) => found.has(table))) {
    console.log("\nNext: npm run db:migrate:auth");
  } else if (!productTables.every((table) => found.has(table))) {
    console.log("\nNext: npm run db:migrate:product");
  } else if (!intelligenceTables.every((table) => found.has(table))) {
    console.log("\nNext: npm run db:migrate:intelligence");
  } else {
    console.log("\nAll expected core tables exist. No initial migration is required.");
  }
  console.log("\nNote: Table existence does not guarantee every column/constraint is current.");
} catch (error) {
  console.error("\nDatabase check failed:", error.message);
  if (error.code) console.error(`PostgreSQL/network code: ${error.code}`);
  console.error("Check Neon status, DATABASE_URL, SSL options, hostname, role, and network access.");
  process.exitCode = 1;
} finally {
  if (pool) await pool.end();
}
