import { integer, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";

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

/**
 * Community-submitted eval runs (Phase 5). Others run the harness with their own
 * keys and submit a score; this turns the static board into a living benchmark.
 */
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  modelName: text("model_name").notNull(),
  taskSlug: text("task_slug").notNull(),
  score: real("score").notNull(),
  sampleSize: integer("sample_size").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SubmissionRow = typeof submissions.$inferSelect;
export type NewSubmissionRow = typeof submissions.$inferInsert;
