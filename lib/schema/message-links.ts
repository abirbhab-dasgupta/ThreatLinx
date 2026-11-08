import { pgTable, uuid, text, uniqueIndex, index } from "drizzle-orm/pg-core";
import { messageCases } from "./message-cases";
import { scans } from "./scans";

                                                                              
export const messageLinks = pgTable("message_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id").notNull().references(() => messageCases.id, { onDelete: "cascade" }),
  scanId: uuid("scan_id").references(() => scans.id, { onDelete: "set null" }),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
}, t => [uniqueIndex("message_link_unique").on(t.messageId, t.url), index("message_links_domain_idx").on(t.domain)]);
