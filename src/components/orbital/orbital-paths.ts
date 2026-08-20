export const orbitalPaths = [
  {
    id: "orange",
    color: "#F3A65A",
    d: "M50 6C76 5 94 25 93 51C92 78 74 95 48 94C22 93 5 75 7 48C9 22 25 7 50 6Z",
  },
  {
    id: "coral",
    color: "#EA735D",
    d: "M48 7C72 4 92 23 94 48C96 73 77 92 52 95C27 98 7 78 6 53C5 28 23 10 48 7Z",
  },
  {
    id: "ochre",
    color: "#C79A45",
    d: "M51 5C77 8 94 27 91 54C88 80 69 96 44 92C19 88 4 68 8 43C12 18 28 3 51 5Z",
  },
  {
    id: "olive",
    color: "#A7BE89",
    d: "M46 8C71 3 91 18 95 43C99 68 83 90 58 94C33 98 11 83 6 58C1 33 21 13 46 8Z",
  },
] as const;

export type OrbitalPathId = (typeof orbitalPaths)[number]["id"];
