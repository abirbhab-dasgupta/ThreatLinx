import { pgTable, uuid, text, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";

                                                                                            
export const messageCases = pgTable("message_cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  sourceType: text("source_type").notNull(),
  redactedText: text("redacted_text").notNull(),
  signals: jsonb("signals").$type<Array<{ code: string; label: string; detail: string; weight: number }>>().notNull().default([]),
  status: text("status").notNull().default("queued"),
  phase: text("phase").notNull().default("Queued for evidence analysis"),
  verdict: text("verdict"),
  riskScore: integer("risk_score"),
  confidence: text("confidence"),
  explanation: text("explanation"),
  recommendations: jsonb("recommendations").$type<string[]>().notNull().default([]),
  aiObservations: jsonb("ai_observations").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, t => [index("message_cases_user_recent_idx").on(t.userId, t.createdAt)]);
