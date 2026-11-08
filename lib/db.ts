import { Pool } from "pg";

   
                                                                           
                                                                                 
                                                    
   
const globalForDatabase = globalThis as unknown as { threatLinxPool?: Pool };

export const pool = globalForDatabase.threatLinxPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 10_000,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require") ? undefined : { rejectUnauthorized: true },
});

if (process.env.NODE_ENV !== "production") globalForDatabase.threatLinxPool = pool;
