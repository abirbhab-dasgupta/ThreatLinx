import { pgTable, uuid, text, timestamp, integer, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { scans } from "./scans";

                                                      
export const evidence = pgTable("scan_evidence", {
  id: uuid("id").defaultRandom().primaryKey(),
  scanId: uuid("scan_id").notNull().references(() => scans.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  source: text("source").notNull(),
  scoreImpact: integer("score_impact").notNull().default(0),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => [
  uniqueIndex("scan_evidence_unique").on(table.scanId, table.code, table.source),
]);
