/** Build a web search URL for exploring a topic further online. */
export function buildExploreUrl(question: string, topicHint?: string): string {
  const trimmed = question.trim();
  const hint = topicHint?.trim();

  const query = hint
    ? `${hint} women's health site:nih.gov OR site:who.int OR site:mayoclinic.org`
    : `${trimmed} women's gynecology health site:nih.gov OR site:who.int OR site:mayoclinic.org`;

  return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
}

export const EXPLORE_LABEL = "Explore more online";
