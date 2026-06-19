"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";

const suggestions = [
  "Can I get pregnant with PCOS?",
  "What is endometriosis?",
  "Why does my period hurt so much?",
  "Signs of bacterial vaginosis?",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  exploreUrl?: string;
  exploreLabel?: string;
}

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const question = text.trim();
    if (!question || loading) return;

    const userMsg: ChatMessage = { role: "user", content: question };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.content,
          exploreUrl: data.exploreUrl,
          exploreLabel: data.exploreLabel ?? "Explore more online",
        },
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "I couldn't connect right now. Try the Learn or Care Plan sections for evidence-based guidance.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <AppShell className="bg-cream">
      <div className="mb-4 flex items-center justify-between border-b border-pink-light/50 pb-3">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${loading ? "animate-pulse bg-amber-mid" : "bg-teal-mid"}`} />
          <span className="text-sm font-medium text-purple-dark">AI Companion</span>
        </div>
      </div>

      <div className="space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="rounded-2xl bg-purple-light/50 p-4">
            <p className="text-xs leading-relaxed text-gray-600">
              Ask anything about PCOS, cycle health, symptoms, or emotional wellbeing. Every reply
              includes a link to explore trusted sources online.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "flex justify-end" : "max-w-[92%]"}>
            {msg.role === "user" ? (
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-white px-4 py-2.5 shadow-card">
                <p className="text-xs leading-relaxed text-gray-700">{msg.content}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs leading-relaxed text-gray-700">{msg.content}</p>
                {msg.exploreUrl && (
                  <a
                    href={msg.exploreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-teal-mid/40 bg-teal-light/50 px-3 py-1.5 text-[10px] font-medium text-teal-dark transition-colors hover:bg-teal-light"
                  >
                    <span aria-hidden>🌐</span>
                    {msg.exploreLabel ?? "Explore more online"}
                    <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-1 py-2">
            <span className="h-2 w-2 animate-bounce rounded-full bg-pink-mid [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-pink-mid [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-pink-mid [animation-delay:300ms]" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-cream via-cream to-transparent pb-2 pt-4">
        <div className="hide-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="shrink-0 rounded-full border border-pink-light bg-white px-3 py-1.5 text-[9px] text-pink-mid disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-card">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about PCOS, diet, cycle..."
            disabled={loading}
            className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-dark disabled:opacity-40"
            aria-label="Send"
          >
            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </AppShell>
  );
}
