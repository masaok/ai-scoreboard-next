import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs as a standalone CLI (not through Next.js), so it must load
// .env itself — hence the `dotenv/config` import above.
if (!process.env.NEON_URL) {
  throw new Error("NEON_URL is not set — add it to .env");
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.NEON_URL },
});
