import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.NEON_URL) {
  throw new Error("NEON_URL is not set — add it to .env");
}

/**
 * Drizzle client backed by Neon's HTTP driver. The HTTP driver issues each
 * query over a stateless fetch, so there are no long-lived TCP pools to manage
 * across serverless invocations.
 */
const sql = neon(process.env.NEON_URL);
export const db = drizzle(sql, { schema });
