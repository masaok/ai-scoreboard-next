import { type NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";

export const runtime = "nodejs";

const SubmissionSchema = z.object({
  modelName: z.string().trim().min(1).max(80),
  taskSlug: z.enum(["sql-generation", "code-explanation", "doc-extraction"]),
  score: z.number().min(0).max(1),
  sampleSize: z.number().int().min(1).max(100_000),
  notes: z.string().trim().max(500).optional(),
});

/**
 * Best-effort in-memory rate limit. This resets per serverless instance, so it's
 * a guardrail, not a guarantee — production should back this with a shared store
 * (e.g. Upstash Redis via the Vercel Marketplace).
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = SubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 422 },
    );
  }

  const [row] = await db.insert(submissions).values(parsed.data).returning();
  return NextResponse.json({ ok: true, submission: row }, { status: 201 });
}

export async function GET() {
  const recent = await db
    .select()
    .from(submissions)
    .orderBy(desc(submissions.createdAt))
    .limit(20);
  return NextResponse.json({ submissions: recent });
}
