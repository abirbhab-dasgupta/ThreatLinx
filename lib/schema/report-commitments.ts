import { pgTable, uuid, text, integer, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { reports } from "./reports";

                                                                                 
export const reportCommitments = pgTable("report_commitments", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  status: text("status").notNull().default("queued"),
  digest: text("digest").notNull(),
  salt: text("salt").notNull(),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  contractAddress: text("contract_address"),
  chainId: integer("chain_id").notNull().default(84532),
  txHash: text("tx_hash"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
}, t => [uniqueIndex("report_commitment_unique").on(t.reportId, t.version)]);
