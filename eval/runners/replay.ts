import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, "..", "fixtures");

export interface FixtureEntry {
  /** The recorded model answer for a case. */
  output: string;
  /** Authored "why it failed" note, shown when the case fails. */
  analysis?: string;
}

export type Fixture = Record<string, FixtureEntry>;

/**
 * Default runner: replays committed model outputs from
 * `eval/fixtures/<task>/<model>.json`. Deterministic and key-free, so anyone
 * can reproduce the exact scores without API access.
 */
export function loadFixture(taskSlug: string, modelId: string): Fixture {
  const p = join(fixturesDir, taskSlug, `${modelId}.json`);
  if (!existsSync(p)) return {};
  return JSON.parse(readFileSync(p, "utf8")) as Fixture;
}
