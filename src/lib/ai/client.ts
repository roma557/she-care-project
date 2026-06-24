import type { SubscriptionTier } from "@/lib/subscription/types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL_STARTER = "anthropic/claude-sonnet-4";
const OPENROUTER_MODEL_PLUS_PREMIUM = "openai/gpt-oss-120b:free";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

type ChatMessage = { role: "user" | "assistant"; content: string };

function getOpenRouterConfig(tier?: SubscriptionTier): { apiKey: string; model: string } | null {
  if (tier === "plus" || tier === "premium") {
    const apiKey = process.env.OPENROUTER_API_KEY_PLUS_PREMIUM;
    if (apiKey) return { apiKey, model: OPENROUTER_MODEL_PLUS_PREMIUM };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (apiKey) return { apiKey, model: OPENROUTER_MODEL_STARTER };

  return null;
}

function getAnthropicApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY;
}

export async function chatCompletion(options: {
  system?: string;
  messages: ChatMessage[];
  maxTokens?: number;
  tier?: SubscriptionTier;
}): Promise<string | null> {
  const openRouter = getOpenRouterConfig(options.tier);
  if (openRouter) {
    const messages = options.system
      ? [{ role: "system" as const, content: options.system }, ...options.messages]
      : options.messages;

    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouter.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "She Care",
      },
      body: JSON.stringify({
        model: openRouter.model,
        max_tokens: options.maxTokens ?? 1000,
        messages,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  }

  const apiKey = getAnthropicApiKey();
  if (!apiKey) return null;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: options.maxTokens ?? 1000,
      system: options.system,
      messages: options.messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.content?.[0]?.text ?? null;
}
