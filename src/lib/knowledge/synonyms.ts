/** Lay phrases → condition id (semantic bridge for common questions). */
export const PHRASE_TO_CONDITION: { pattern: RegExp; conditionId: string }[] = [
  {
    pattern: /soak(ing)?\s*(through|pad)|bleed(ing)?\s*heavy|very\s*heavy\s*period|flooding|menorrhagia/i,
    conditionId: "menorrhagia",
  },
  {
    pattern: /period\s*(hurt|pain|cramp|ache)|painful\s*period|bad\s*cramps|dysmenorrhea/i,
    conditionId: "dysmenorrhea",
  },
  {
    pattern: /no\s*period|missed\s*period|period\s*stopped|amenorrhea|haven't\s*had\s*a\s*period/i,
    conditionId: "amenorrhea",
  },
  {
    pattern: /spotting\s*between|bleed(ing)?\s*between\s*period|mid\s*cycle\s*spot/i,
    conditionId: "uterine-polyps",
  },
  {
    pattern: /fishy\s*odor|fishy\s*smell|thin\s*discharge|bacterial\s*vaginosis|\bbv\b/i,
    conditionId: "bacterial-vaginosis",
  },
  {
    pattern: /itch(ing|y)\s*(down|vagina|private)|yeast|candida|white\s*discharge|thick\s*discharge/i,
    conditionId: "yeast-infection",
  },
  {
    pattern: /green\s*discharge|yellow\s*discharge|trichomoniasis|\btrich\b/i,
    conditionId: "trichomoniasis",
  },
  {
    pattern: /pain\s*during\s*sex|painful\s*sex|painful\s*intercourse|dyspareunia/i,
    conditionId: "endometriosis",
  },
  {
    pattern: /pelvic\s*pain|lower\s*belly\s*pain|chronic\s*pain\s*pelvis/i,
    conditionId: "endometriosis",
  },
  {
    pattern: /fibroid|uterine\s*growth|lump\s*in\s*uterus/i,
    conditionId: "fibroids",
  },
  {
    pattern: /pmdd|severe\s*pms|depressed\s*before\s*period|anxious\s*before\s*period/i,
    conditionId: "pmdd",
  },
  {
    pattern: /fever.*pelvic|pelvic.*fever|pid\b|pelvic\s*inflammatory/i,
    conditionId: "pid",
  },
  {
    pattern: /pcos|polycystic|irregular\s*cycle.*weight|facial\s*hair.*period/i,
    conditionId: "pcos-guide",
  },
  {
    pattern: /vaginismus|can't\s*use\s*tampon|tighten\s*down\s*there|painful\s*penetration/i,
    conditionId: "vaginismus",
  },
  {
    pattern: /vulvodynia|burning\s*(vulva|opening)|rawness\s*down\s*there/i,
    conditionId: "vulvodynia",
  },
  {
    pattern: /prolapse|something\s*bulg|bulge\s*down\s*there|uterus\s*dropped/i,
    conditionId: "pelvic-organ-prolapse",
  },
];

/** Topic hints for PCOS lifestyle when no condition matches. */
export const TOPIC_HINTS: { pattern: RegExp; hint: string }[] = [
  { pattern: /food|diet|eat|meal|nutrition|indian\s*food/i, hint: "PCOS diet India low GI" },
  { pattern: /exercise|workout|yoga|walk|fitness/i, hint: "PCOS exercise recommendations" },
  { pattern: /supplement|vitamin|inositol|magnesium/i, hint: "PCOS supplements evidence" },
  { pattern: /pregnant|fertility|conceive|trying\s*to\s*get\s*pregnant/i, hint: "PCOS fertility treatment" },
];

export function matchPhraseSynonym(question: string): string | null {
  for (const { pattern, conditionId } of PHRASE_TO_CONDITION) {
    if (pattern.test(question)) return conditionId;
  }
  return null;
}

export function matchTopicHint(question: string): string | null {
  for (const { pattern, hint } of TOPIC_HINTS) {
    if (pattern.test(question)) return hint;
  }
  return null;
}
