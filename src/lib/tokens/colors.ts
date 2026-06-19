export const colors = {
  bg: "#FDF8F6",
  surface: "#FFFFFF",
  roseDeep: "#C4647A",
  roseMid: "#D9899A",
  roseSoft: "#EDB8C2",
  rosePale: "#F9EDF0",
  blush: "#FAF0F2",
  ink: "#2A1A1F",
  inkMid: "#6B4451",
  inkFaint: "#B89AA2",
  gold: "#C9956A",
} as const;

export type ColorToken = keyof typeof colors;
