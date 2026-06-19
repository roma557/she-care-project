import { CONDITIONS } from "./conditions";

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was",
  "one", "our", "out", "day", "get", "has", "him", "his", "how", "its", "may", "new",
  "now", "old", "see", "two", "way", "who", "boy", "did", "she", "use", "your", "what",
  "when", "where", "which", "with", "have", "this", "that", "from", "they", "been", "would",
  "there", "their", "about", "into", "just", "like", "make", "over", "such", "take", "than",
  "them", "very", "some", "could", "other", "after", "most", "also", "back", "being", "come",
  "does", "going", "help", "know", "much", "need", "should", "tell", "want", "why", "will",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }
  const max = Math.max(...tf.values(), 1);
  for (const [k, v] of tf) {
    tf.set(k, v / max);
  }
  return tf;
}

function corpusDocument(condition: (typeof CONDITIONS)[number]): string {
  return [condition.name, condition.description, ...condition.keywords].join(" ");
}

/** Pre-built TF-IDF index — lightweight offline semantic layer. */
const CORPUS = CONDITIONS.map((c) => ({
  id: c.id,
  tokens: tokenize(corpusDocument(c)),
}));

const DOC_COUNT = CORPUS.length;
const IDF = new Map<string, number>();

for (const doc of CORPUS) {
  const unique = new Set(doc.tokens);
  for (const term of unique) {
    IDF.set(term, (IDF.get(term) ?? 0) + 1);
  }
}
for (const [term, df] of IDF) {
  IDF.set(term, Math.log((DOC_COUNT + 1) / (df + 1)) + 1);
}

function toTfidfVector(tokens: string[]): Map<string, number> {
  const tf = termFrequency(tokens);
  const vec = new Map<string, number>();
  for (const [term, weight] of tf) {
    vec.set(term, weight * (IDF.get(term) ?? 1));
  }
  return vec;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const val of a.values()) normA += val * val;
  for (const val of b.values()) normB += val * val;
  const smaller = a.size < b.size ? a : b;
  const other = a.size < b.size ? b : a;
  for (const [term, val] of smaller) {
    const o = other.get(term);
    if (o !== undefined) dot += val * o;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dot / denom : 0;
}

/** Minimum cosine score to accept a semantic match. */
export const SEMANTIC_MIN_SCORE = 0.12;

export interface SemanticMatch {
  conditionId: string;
  score: number;
}

/** TF-IDF cosine similarity over condition corpus. */
export function findSemanticMatch(question: string): SemanticMatch | null {
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0) return null;

  const queryVec = toTfidfVector(queryTokens);
  let best: SemanticMatch | null = null;

  for (const doc of CORPUS) {
    const docVec = toTfidfVector(doc.tokens);
    const score = cosineSimilarity(queryVec, docVec);
    if (score >= SEMANTIC_MIN_SCORE && (!best || score > best.score)) {
      best = { conditionId: doc.id, score };
    }
  }

  return best;
}
