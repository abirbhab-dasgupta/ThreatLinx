import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "@/lib/db";
import * as schema from "@/lib/schema";

                                                                
export const db = drizzle({ client: pool, schema });
export function getDb() { return db; }
