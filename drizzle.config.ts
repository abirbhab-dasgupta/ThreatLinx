import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

                                                                    
                                                          
config({ path: ".env.local" });
config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing. Set it in .env.local before running Drizzle Kit.");
}

   
                                                                             
                                                                             
  
                                                                           
                                                             
                                                                                 
   
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL },
  schemaFilter: ["public"],
  tablesFilter: ["scans", "scan_evidence", "provider_checks", "reports", "message_cases", "message_links", "report_commitments"],
  strict: true,
  verbose: true,
});
