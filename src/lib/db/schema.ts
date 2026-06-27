import { integer, pgTable, text } from "drizzle-orm/pg-core";

/**
 * The leaderboard's source of truth. Benchmark scores are stored flat (one
 * integer column per dimension, 0–100) rather than as JSON so individual
 * dimensions can be queried, sorted, and indexed directly in Postgres.
 */
export const models = pgTable("models", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  vendor: text("vendor").notNull(),
  /** Tailwind gradient classes used for the vendor accent dot. */
  accent: text("accent").notNull(),
  reasoning: integer("reasoning").notNull(),
  coding: integer("coding").notNull(),
  math: integer("math").notNull(),
  speed: integer("speed").notNull(),
});

export type ModelRow = typeof models.$inferSelect;
export type NewModelRow = typeof models.$inferInsert;
