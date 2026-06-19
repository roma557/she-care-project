import { CONDITIONS } from "./conditions";
import { findSemanticMatch } from "./semantic";
import { matchPhraseSynonym } from "./synonyms";

export type MatchMethod = "keyword" | "synonym" | "semantic";

export interface KnowledgeMatch {
  conditionId: string;
  conditionName: string;
  content: string;
  method: MatchMethod;
  score: number;
}

const KEYWORD_MIN_SCORE = 3;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function formatConditionReply(condition: (typeof CONDITIONS)[number]): string {
  let reply = `${condition.name}\n\n${condition.description}`;
  if (condition.seeDoctor) {
    reply += `\n\nWhen to see a doctor: ${condition.seeDoctor}`;
  }
  reply +=
    "\n\nThis is general education, not a diagnosis. Please consult your gynecologist for personal advice.";
  return reply;
}

function getConditionById(id: string): (typeof CONDITIONS)[number] | undefined {
  if (id === "pcos-guide") return undefined;
  return CONDITIONS.find((c) => c.id === id);
}

function keywordSearch(question: string): KnowledgeMatch | null {
  const q = question.toLowerCase();
  const tokens = tokenize(question);

  let best: { condition: (typeof CONDITIONS)[number]; score: number } | null = null;

  for (const condition of CONDITIONS) {
    let score = 0;
    const nameLower = condition.name.toLowerCase();

    if (
      q.includes(nameLower) ||
      nameLower
        .split("(")[0]
        .trim()
        .split(/\s+/)
        .some((w) => w.length > 3 && q.includes(w))
    ) {
      score += 10;
    }

    for (const keyword of condition.keywords) {
      if (q.includes(keyword.toLowerCase())) score += 5;
    }

    for (const token of tokens) {
      if (condition.keywords.some((k) => k.includes(token) || token.includes(k))) score += 2;
      if (condition.name.toLowerCase().includes(token)) score += 1;
    }

    if (score > 0 && (!best || score > best.score)) {
      best = { condition, score };
    }
  }

  if (!best || best.score < KEYWORD_MIN_SCORE) return null;

  return {
    conditionId: best.condition.id,
    conditionName: best.condition.name,
    content: formatConditionReply(best.condition),
    method: "keyword",
    score: best.score,
  };
}

function pcosGuideMatch(): KnowledgeMatch {
  return {
    conditionId: "pcos-guide",
    conditionName: "PCOS & PCOD",
    content:
      "PCOS (Polycystic Ovarian Syndrome) is a hormonal condition with irregular cycles, excess androgens, and metabolic features. PCOD often refers to polycystic ovaries on ultrasound with a broader symptom picture.\n\n" +
      "Helpful steps: low-GI Indian meals (millets, dal, vegetables), daily movement, cycle tracking, and a full hormonal panel with your gynecologist.\n\n" +
      "Explore Learn → PCOS Guide and Conditions for detailed, evidence-based information.",
    method: "synonym",
    score: 5,
  };
}

/**
 * Hybrid offline search: keyword → phrase synonyms → TF-IDF semantic similarity.
 */
export function findConditionAnswerHybrid(question: string): KnowledgeMatch | null {
  const keyword = keywordSearch(question);
  if (keyword) return keyword;

  const phraseId = matchPhraseSynonym(question);
  if (phraseId === "pcos-guide") return pcosGuideMatch();

  if (phraseId) {
    const condition = getConditionById(phraseId);
    if (condition) {
      return {
        conditionId: condition.id,
        conditionName: condition.name,
        content: formatConditionReply(condition),
        method: "synonym",
        score: 6,
      };
    }
  }

  const semantic = findSemanticMatch(question);
  if (semantic) {
    const condition = getConditionById(semantic.conditionId);
    if (condition) {
      return {
        conditionId: condition.id,
        conditionName: condition.name,
        content: formatConditionReply(condition),
        method: "semantic",
        score: semantic.score,
      };
    }
  }

  return null;
}

/** @deprecated Use findConditionAnswerHybrid */
export function findConditionAnswer(question: string): string | null {
  return findConditionAnswerHybrid(question)?.content ?? null;
}
