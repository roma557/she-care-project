import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a warm, knowledgeable, and empathetic PCOS & PCOD health companion for women in India. Always respond with: clear, compassionate, non-judgmental language | practical, actionable advice for India | evidence-based information | emotional validation | a reminder to consult a gynecologist | 200–400 words | empowering language | cultural sensitivity (Indian foods, herbs, accessibility). Never provide a specific diagnosis or prescribe medications.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

function fallbackReply(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("pregnant") || q.includes("fertility")) {
    return "Many women with PCOS do conceive — it may take longer and often benefits from ovulation tracking and metabolic support. Work with a fertility specialist on Myo-inositol, weight management, and medications like Letrozole if needed. Track your cycle consistently and share patterns with your gynecologist. You're not alone in this journey.";
  }
  if (q.includes("food") || q.includes("diet") || q.includes("eat")) {
    return "Focus on low-GI Indian meals: millets (bajra, jowar) over white rice, dal with vegetables, paneer or eggs for protein, and spearmint tea (2 cups daily). Avoid sugary chai, maida snacks, and deep-fried foods. Eat within an hour of waking and walk 20 minutes after meals. Always discuss major diet changes with your doctor.";
  }
  if (q.includes("exercise") || q.includes("workout")) {
    return "A balanced mix works best: 20-min walks after meals daily, strength training 2–3× weekly, and gentle yoga (butterfly pose, cat-cow). Avoid over-exercising — excessive cardio can raise cortisol. Consistency beats intensity for PCOS management.";
  }
  if (q.includes("supplement")) {
    return "Commonly discussed supplements include Myo-inositol (2g/day), Vitamin D3+K2, Omega-3, Magnesium, and NAC. Many women in India are also deficient in Vitamin D and Iron. Always get your levels tested and discuss doses with your doctor before starting anything new.";
  }
  return "Thank you for sharing. PCOS management is highly individual — what helps most is consistent low-GI eating, regular movement, good sleep, and working with a gynecologist on your specific hormonal profile. I'm here to support you with evidence-based guidance. What aspect would you like to explore — cycle, diet, symptoms, or emotional wellbeing?";
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      return NextResponse.json({
        content: fallbackReply(lastUser?.content ?? ""),
        fallback: true,
      });
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
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      return NextResponse.json({
        content: fallbackReply(lastUser?.content ?? ""),
        fallback: true,
      });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? "I'm sorry, I couldn't generate a response. Please try again.";
    return NextResponse.json({ content, fallback: false });
  } catch {
    return NextResponse.json(
      { content: "Something went wrong. Please try again or explore the Learn and Care Plan sections.", fallback: true },
      { status: 500 },
    );
  }
}
