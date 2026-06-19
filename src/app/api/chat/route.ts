import { NextRequest, NextResponse } from "next/server";
import {
  buildExploreUrl,
  EXPLORE_LABEL,
  findConditionAnswerHybrid,
  matchTopicHint,
  type KnowledgeMatch,
} from "@/lib/knowledge";

const SYSTEM_PROMPT = `You are a warm, knowledgeable, and empathetic women's health companion for women in India, with deep focus on PCOS, PCOD, endometriosis, menstrual disorders, vaginal infections, pelvic pain, and hormonal conditions. Always respond with: clear, compassionate, non-judgmental language | practical, actionable advice for India | evidence-based information | emotional validation | a reminder to consult a gynecologist | 200–400 words | empowering language | cultural sensitivity (Indian foods, herbs, accessibility). Never provide a specific diagnosis or prescribe medications. At the end, briefly suggest the user can explore trusted health sources online for more reading.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponseBody {
  content: string;
  fallback: boolean;
  exploreUrl: string;
  exploreLabel: string;
  matchMethod?: string;
}

function buildResponse(
  content: string,
  question: string,
  fallback: boolean,
  match?: KnowledgeMatch | null,
): ChatResponseBody {
  const topicHint = match?.conditionName ?? matchTopicHint(question) ?? undefined;
  return {
    content,
    fallback,
    exploreUrl: buildExploreUrl(question, topicHint),
    exploreLabel: EXPLORE_LABEL,
    matchMethod: match?.method,
  };
}

function fallbackReply(question: string): { content: string; match: KnowledgeMatch | null } {
  const hybrid = findConditionAnswerHybrid(question);
  if (hybrid) return { content: hybrid.content, match: hybrid };

  const q = question.toLowerCase();
  if (q.includes("pregnant") || q.includes("fertility")) {
    return {
      content:
        "Many women with PCOS do conceive — it may take longer and often benefits from ovulation tracking and metabolic support. Work with a fertility specialist on Myo-inositol, weight management, and medications like Letrozole if needed. Track your cycle consistently and share patterns with your gynecologist. You're not alone in this journey.",
      match: null,
    };
  }
  if (q.includes("food") || q.includes("diet") || q.includes("eat")) {
    return {
      content:
        "Focus on low-GI Indian meals: millets (bajra, jowar) over white rice, dal with vegetables, paneer or eggs for protein, and spearmint tea (2 cups daily). Avoid sugary chai, maida snacks, and deep-fried foods. Eat within an hour of waking and walk 20 minutes after meals. Always discuss major diet changes with your doctor.",
      match: null,
    };
  }
  if (q.includes("exercise") || q.includes("workout")) {
    return {
      content:
        "A balanced mix works best: 20-min walks after meals daily, strength training 2–3× weekly, and gentle yoga (butterfly pose, cat-cow). Avoid over-exercising — excessive cardio can raise cortisol. Consistency beats intensity for PCOS management.",
      match: null,
    };
  }
  if (q.includes("supplement")) {
    return {
      content:
        "Commonly discussed supplements include Myo-inositol (2g/day), Vitamin D3+K2, Omega-3, Magnesium, and NAC. Many women in India are also deficient in Vitamin D and Iron. Always get your levels tested and discuss doses with your doctor before starting anything new.",
      match: null,
    };
  }
  return {
    content:
      "Thank you for sharing. PCOS management is highly individual — what helps most is consistent low-GI eating, regular movement, good sleep, and working with a gynecologist on your specific hormonal profile. I'm here to support you with evidence-based guidance. What aspect would you like to explore — cycle, diet, symptoms, or emotional wellbeing?",
    match: null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const question = lastUser?.content ?? "";
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      const { content, match } = fallbackReply(question);
      return NextResponse.json(buildResponse(content, question, true, match));
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const { content, match } = fallbackReply(question);
      return NextResponse.json(buildResponse(content, question, true, match));
    }

    const data = await response.json();
    const content =
      data.content?.[0]?.text ?? "I'm sorry, I couldn't generate a response. Please try again.";
    const match = findConditionAnswerHybrid(question);
    return NextResponse.json(buildResponse(content, question, false, match));
  } catch {
    return NextResponse.json(
      buildResponse(
        "Something went wrong. Please try again or explore the Learn and Care Plan sections.",
        "",
        true,
      ),
      { status: 500 },
    );
  }
}
