import "dotenv/config";
import { db } from "./index";
import { models } from "./schema";
import { MODELS } from "../models";

/**
 * Seed the leaderboard from the bundled sample data. Idempotent: re-running
 * upserts each row by id, so it's safe to run repeatedly as sample data changes.
 */
async function seed() {
  const rows = MODELS.map((m) => ({
    id: m.id,
    name: m.name,
    vendor: m.vendor,
    accent: m.accent,
    ...m.scores,
  }));

  for (const row of rows) {
    await db
      .insert(models)
      .values(row)
      .onConflictDoUpdate({ target: models.id, set: row });
  }

  console.log(`Seeded ${rows.length} models.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
