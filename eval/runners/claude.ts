/**
 * Live runner via the Anthropic Messages API. Requires ANTHROPIC_API_KEY.
 *
 * The default `pnpm eval:run` replays committed fixtures so results are
 * reproducible without keys. Swap this in to generate fresh outputs once a key
 * is available, then re-commit the fixtures + regenerated results.
 */

interface TextBlock {
  type: string;
  text?: string;
}
interface MessagesResponse {
  content?: TextBlock[];
}

export async function runClaude(model: string, prompt: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set — required for the live Claude runner");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as MessagesResponse;
  return (data.content ?? [])
    .map((b) => b.text ?? "")
    .join("")
    .trim();
}
