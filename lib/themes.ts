// ─────────────────────────────────────────────────────────────────────────────
// Scratch-off ticket themes — one per season / major holiday.
// Each theme carries pest-control branding in its copy so the promotion always
// feels on-brand for Patton Pest Control.
// ─────────────────────────────────────────────────────────────────────────────

export interface Theme {
  id: string;
  name: string;
  /** Emoji shown next to the company name on the ticket */
  emoji: string;
  /** Short seasonal tagline shown under the title on the ticket */
  tagline: string;
  /** Text stamped on the un-scratched canvas overlay */
  canvasLabel: string;

  // ── Page chrome ────────────────────────────────────────────────────────────
  pageBackground: string;

  // ── Card ───────────────────────────────────────────────────────────────────
  cardBackground: string;
  cardBorder: string;
  cardShadow: string;

  // ── Text ───────────────────────────────────────────────────────────────────
  titleColor: string;
  subtitleColor: string;
  bodyTextColor: string;
  mutedTextColor: string;

  // ── Form / button ──────────────────────────────────────────────────────────
  inputBorderColor: string;
  buttonBackground: string;
  buttonColor: string;

  // ── Scratch canvas overlay ─────────────────────────────────────────────────
  canvasFill: string;       // primary fill
  canvasStripe: string;     // diagonal stripe
  canvasTextColor: string;  // text on canvas

  // ── Prize reveal ───────────────────────────────────────────────────────────
  winnerGradient: string;
  winnerTextColor: string;
  loserBackground: string;
  loserTextColor: string;
  ctaColor: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme definitions
// ─────────────────────────────────────────────────────────────────────────────

export const THEMES: Record<string, Theme> = {
  // ── Default (year-round brand) ─────────────────────────────────────────────
  default: {
    id: "default",
    name: "Patton Pest Control",
    emoji: "🐛",
    tagline: "Your local pest experts — scratch to save!",
    canvasLabel: "Patton Pest Control",
    pageBackground: "linear-gradient(135deg, #1a472a 0%, #2d5a27 100%)",
    cardBackground: "#ffffff",
    cardBorder: "2px solid #e0e0e0",
    cardShadow: "0 20px 60px rgba(0,0,0,0.4)",
    titleColor: "#1a472a",
    subtitleColor: "#2d5a27",
    bodyTextColor: "#444444",
    mutedTextColor: "#888888",
    inputBorderColor: "#cccccc",
    buttonBackground: "#1a472a",
    buttonColor: "#ffffff",
    canvasFill: "#B0B0B0",
    canvasStripe: "#9A9A9A",
    canvasTextColor: "#444444",
    winnerGradient: "linear-gradient(135deg, #ffd700, #ff8c00)",
    winnerTextColor: "#1a1a1a",
    loserBackground: "#f0f0f0",
    loserTextColor: "#333333",
    ctaColor: "#1a472a",
  },

  // ── Summer ─────────────────────────────────────────────────────────────────
  summer: {
    id: "summer",
    name: "Summer Bug Blast",
    emoji: "🦟",
    tagline: "Keep mosquitoes & ants OUT of your summer fun!",
    canvasLabel: "🦟 Scratch to Beat the Bugs!",
    pageBackground: "linear-gradient(135deg, #0077b6 0%, #00b4d8 60%, #90e0ef 100%)",
    cardBackground: "#fffef5",
    cardBorder: "2px solid #f77f00",
    cardShadow: "0 20px 60px rgba(0,119,182,0.4)",
    titleColor: "#005f99",
    subtitleColor: "#0077b6",
    bodyTextColor: "#333333",
    mutedTextColor: "#777777",
    inputBorderColor: "#00b4d8",
    buttonBackground: "#f77f00",
    buttonColor: "#ffffff",
    canvasFill: "#f4a261",
    canvasStripe: "#e76f51",
    canvasTextColor: "#fffef5",
    winnerGradient: "linear-gradient(135deg, #f77f00, #fcbf49)",
    winnerTextColor: "#1a1a1a",
    loserBackground: "#caf0f8",
    loserTextColor: "#023e8a",
    ctaColor: "#005f99",
  },

  // ── Spring ─────────────────────────────────────────────────────────────────
  spring: {
    id: "spring",
    name: "Spring Clean Sweep",
    emoji: "🐝",
    tagline: "Spring bugs checking in? We check them out!",
    canvasLabel: "🐝 Scratch to Spring Into Savings!",
    pageBackground: "linear-gradient(135deg, #b39ddb 0%, #80cbc4 100%)",
    cardBackground: "#fffaf8",
    cardBorder: "2px solid #ce93d8",
    cardShadow: "0 20px 60px rgba(179,157,219,0.5)",
    titleColor: "#6a1b9a",
    subtitleColor: "#8e24aa",
    bodyTextColor: "#3a3a3a",
    mutedTextColor: "#7a7a7a",
    inputBorderColor: "#ce93d8",
    buttonBackground: "#8e24aa",
    buttonColor: "#ffffff",
    canvasFill: "#f3b8ee",
    canvasStripe: "#df7ada",
    canvasTextColor: "#4a0072",
    winnerGradient: "linear-gradient(135deg, #f8c8dc, #e573a0)",
    winnerTextColor: "#1a1a1a",
    loserBackground: "#f3e5f5",
    loserTextColor: "#6a1b9a",
    ctaColor: "#6a1b9a",
  },

  // ── Christmas ──────────────────────────────────────────────────────────────
  christmas: {
    id: "christmas",
    name: "Holiday Pest-Free Guarantee",
    emoji: "🎄",
    tagline: "Don't let pests crash your holiday gathering!",
    canvasLabel: "🎄 Scratch for a Holiday Gift!",
    pageBackground: "linear-gradient(135deg, #a50000 0%, #0d3b0d 100%)",
    cardBackground: "#fffef8",
    cardBorder: "2px solid #a50000",
    cardShadow: "0 20px 60px rgba(165,0,0,0.45)",
    titleColor: "#a50000",
    subtitleColor: "#1c5e1c",
    bodyTextColor: "#2a2a2a",
    mutedTextColor: "#777777",
    inputBorderColor: "#a50000",
    buttonBackground: "#a50000",
    buttonColor: "#ffffff",
    canvasFill: "#1c5e1c",
    canvasStripe: "#a50000",
    canvasTextColor: "#fffef8",
    winnerGradient: "linear-gradient(135deg, #a50000, #d4af37)",
    winnerTextColor: "#fffef8",
    loserBackground: "#e8f5e9",
    loserTextColor: "#1c5e1c",
    ctaColor: "#1c5e1c",
  },

  // ── Halloween ──────────────────────────────────────────────────────────────
  halloween: {
    id: "halloween",
    name: "Scare the Pests Away",
    emoji: "🕷️",
    tagline: "These are the only creepy crawlies we want you to find!",
    canvasLabel: "🕷️ Scratch If You Dare…",
    pageBackground: "linear-gradient(135deg, #0d0d0d 0%, #4a1500 100%)",
    cardBackground: "#1c0d00",
    cardBorder: "2px solid #e65c00",
    cardShadow: "0 20px 60px rgba(230,92,0,0.5)",
    titleColor: "#ff6b00",
    subtitleColor: "#cc5500",
    bodyTextColor: "#f0c090",
    mutedTextColor: "#a07040",
    inputBorderColor: "#e65c00",
    buttonBackground: "#e65c00",
    buttonColor: "#ffffff",
    canvasFill: "#e65c00",
    canvasStripe: "#1c0d00",
    canvasTextColor: "#ffffff",
    winnerGradient: "linear-gradient(135deg, #e65c00, #f9d423)",
    winnerTextColor: "#1a0a00",
    loserBackground: "#2d1500",
    loserTextColor: "#f0c090",
    ctaColor: "#f9d423",
  },

  // ── Thanksgiving ───────────────────────────────────────────────────────────
  thanksgiving: {
    id: "thanksgiving",
    name: "Feast Without the Pests",
    emoji: "🦃",
    tagline: "Don't let rodents & roaches ruin Thanksgiving dinner!",
    canvasLabel: "🦃 Scratch to Give Thanks (Bug-Free)!",
    pageBackground: "linear-gradient(135deg, #4a1f06 0%, #b5540b 100%)",
    cardBackground: "#fffaf5",
    cardBorder: "2px solid #c4681a",
    cardShadow: "0 20px 60px rgba(74,31,6,0.45)",
    titleColor: "#5c2c0a",
    subtitleColor: "#8b4513",
    bodyTextColor: "#3a2010",
    mutedTextColor: "#8a6040",
    inputBorderColor: "#c4681a",
    buttonBackground: "#8b4513",
    buttonColor: "#ffffff",
    canvasFill: "#c4681a",
    canvasStripe: "#8b4513",
    canvasTextColor: "#fffaf5",
    winnerGradient: "linear-gradient(135deg, #d4762c, #e8a830)",
    winnerTextColor: "#1a0a00",
    loserBackground: "#fff3e0",
    loserTextColor: "#5c2c0a",
    ctaColor: "#5c2c0a",
  },

  // ── Valentine's Day ────────────────────────────────────────────────────────
  valentines: {
    id: "valentines",
    name: "Love Your Pest-Free Home",
    emoji: "💝",
    tagline: "Fall in love with a bug-free home this Valentine's Day!",
    canvasLabel: "💝 Scratch to Show Bugs Some Tough Love!",
    pageBackground: "linear-gradient(135deg, #880e4f 0%, #e91e8c 100%)",
    cardBackground: "#fff5f9",
    cardBorder: "2px solid #f48fb1",
    cardShadow: "0 20px 60px rgba(233,30,140,0.4)",
    titleColor: "#880e4f",
    subtitleColor: "#c2185b",
    bodyTextColor: "#3a1020",
    mutedTextColor: "#9a6070",
    inputBorderColor: "#f48fb1",
    buttonBackground: "#c2185b",
    buttonColor: "#ffffff",
    canvasFill: "#e91e8c",
    canvasStripe: "#880e4f",
    canvasTextColor: "#ffffff",
    winnerGradient: "linear-gradient(135deg, #f48fb1, #e91e8c)",
    winnerTextColor: "#ffffff",
    loserBackground: "#fce4ec",
    loserTextColor: "#880e4f",
    ctaColor: "#880e4f",
  },

  // ── New Year ───────────────────────────────────────────────────────────────
  newyear: {
    id: "newyear",
    name: "New Year, No Pests",
    emoji: "🎉",
    tagline: "Start the new year with a pest-free home — your resolution made easy!",
    canvasLabel: "🎉 Scratch to Ring in Savings!",
    pageBackground: "linear-gradient(135deg, #0d0d2b 0%, #0a3d62 100%)",
    cardBackground: "#0d0d2b",
    cardBorder: "2px solid #c9a84c",
    cardShadow: "0 20px 60px rgba(201,168,76,0.4)",
    titleColor: "#c9a84c",
    subtitleColor: "#a8924e",
    bodyTextColor: "#e0d0a0",
    mutedTextColor: "#9a8a60",
    inputBorderColor: "#c9a84c",
    buttonBackground: "#c9a84c",
    buttonColor: "#0d0d2b",
    canvasFill: "#c9a84c",
    canvasStripe: "#0d0d2b",
    canvasTextColor: "#0d0d2b",
    winnerGradient: "linear-gradient(135deg, #c9a84c, #f5d06e)",
    winnerTextColor: "#0d0d2b",
    loserBackground: "#1a1a3e",
    loserTextColor: "#c9a84c",
    ctaColor: "#f5d06e",
  },

  // ── 4th of July ────────────────────────────────────────────────────────────
  july4: {
    id: "july4",
    name: "Firecracker Pest Control",
    emoji: "🎆",
    tagline: "Fireworks: yes. Ants at the cookout: absolutely not.",
    canvasLabel: "🎆 Scratch for Red, White & Bug-Free!",
    pageBackground: "linear-gradient(135deg, #b22234 0%, #3c3b6e 100%)",
    cardBackground: "#ffffff",
    cardBorder: "3px solid #b22234",
    cardShadow: "0 20px 60px rgba(0,0,0,0.4)",
    titleColor: "#b22234",
    subtitleColor: "#3c3b6e",
    bodyTextColor: "#1a1a3a",
    mutedTextColor: "#888888",
    inputBorderColor: "#b22234",
    buttonBackground: "#3c3b6e",
    buttonColor: "#ffffff",
    canvasFill: "#b22234",
    canvasStripe: "#3c3b6e",
    canvasTextColor: "#ffffff",
    winnerGradient: "linear-gradient(135deg, #b22234, #d4af37)",
    winnerTextColor: "#1a1a1a",
    loserBackground: "#e8eaf6",
    loserTextColor: "#3c3b6e",
    ctaColor: "#3c3b6e",
  },

  // ── St. Patrick's Day ──────────────────────────────────────────────────────
  stpatricks: {
    id: "stpatricks",
    name: "Lucky You Found Us",
    emoji: "🍀",
    tagline: "Lucky you — a pest-free home is just a scratch away!",
    canvasLabel: "🍀 Scratch for Your Luck o' the Irish!",
    pageBackground: "linear-gradient(135deg, #003d00 0%, #1a8a1a 100%)",
    cardBackground: "#f0fff0",
    cardBorder: "2px solid #1a8a1a",
    cardShadow: "0 20px 60px rgba(0,61,0,0.4)",
    titleColor: "#003d00",
    subtitleColor: "#1a6b1a",
    bodyTextColor: "#1a2a1a",
    mutedTextColor: "#5a7a5a",
    inputBorderColor: "#1a8a1a",
    buttonBackground: "#005500",
    buttonColor: "#ffffff",
    canvasFill: "#1a8a1a",
    canvasStripe: "#003d00",
    canvasTextColor: "#f0fff0",
    winnerGradient: "linear-gradient(135deg, #ffd700, #ff8c00)",
    winnerTextColor: "#1a1a1a",
    loserBackground: "#c8e6c9",
    loserTextColor: "#1b5e20",
    ctaColor: "#003d00",
  },

  // ── Easter ─────────────────────────────────────────────────────────────────
  easter: {
    id: "easter",
    name: "Hoppy Pest-Free Spring",
    emoji: "🐣",
    tagline: "No bugs allowed in your Easter basket — or your home!",
    canvasLabel: "🐣 Scratch to Hatch Your Savings!",
    pageBackground: "linear-gradient(135deg, #b3e5fc 0%, #f8bbd0 50%, #e1bee7 100%)",
    cardBackground: "#fffdf9",
    cardBorder: "2px solid #ce93d8",
    cardShadow: "0 20px 60px rgba(0,0,0,0.2)",
    titleColor: "#6a1b9a",
    subtitleColor: "#ad1457",
    bodyTextColor: "#333333",
    mutedTextColor: "#888888",
    inputBorderColor: "#ce93d8",
    buttonBackground: "#7b1fa2",
    buttonColor: "#ffffff",
    canvasFill: "#f3d0f8",
    canvasStripe: "#c5a0e5",
    canvasTextColor: "#6a1b9a",
    winnerGradient: "linear-gradient(135deg, #f8bbd0, #ce93d8)",
    winnerTextColor: "#1a1a1a",
    loserBackground: "#f3e5f5",
    loserTextColor: "#6a1b9a",
    ctaColor: "#6a1b9a",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Date-based auto-detection helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Anonymous Gregorian algorithm for Easter Sunday. */
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** 4th Thursday of November (US Thanksgiving). */
function getThanksgivingDate(year: number): Date {
  const nov1 = new Date(year, 10, 1);
  const dow = nov1.getDay(); // 0 = Sun, 4 = Thu
  const firstThu = dow <= 4 ? 1 + (4 - dow) : 1 + (11 - dow);
  return new Date(year, 10, firstThu + 21);
}

/**
 * Returns the theme ID that best matches today's date.
 * Priority (highest first): New Year → Valentine's → St. Patrick's →
 * Easter → 4th of July → Summer → Halloween → Thanksgiving →
 * Christmas → Spring → default.
 */
export function autoDetectTheme(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  const year = now.getFullYear();

  // New Year's Day (Jan 1)
  if (month === 1 && day === 1) return "newyear";

  // Valentine's Day window (Feb 1–14)
  if (month === 2 && day <= 14) return "valentines";

  // St. Patrick's Day window (Mar 10–17)
  if (month === 3 && day >= 10 && day <= 17) return "stpatricks";

  // Easter ± 7 days
  const easter = getEasterDate(year);
  const easterStart = new Date(easter);
  easterStart.setDate(easter.getDate() - 7);
  const easterEnd = new Date(easter);
  easterEnd.setDate(easter.getDate() + 7);
  if (now >= easterStart && now <= easterEnd) return "easter";

  // 4th of July window (Jun 28 – Jul 7)
  if ((month === 6 && day >= 28) || (month === 7 && day <= 7)) return "july4";

  // Summer (Jun 15 – Sep 7, excluding 4th-of-July window above)
  if (
    (month === 6 && day >= 15) ||
    (month === 7 && day >= 8) ||
    month === 8 ||
    (month === 9 && day <= 7)
  )
    return "summer";

  // Halloween (Oct 1–31)
  if (month === 10) return "halloween";

  // Thanksgiving window (2 weeks before through Thanksgiving Day)
  const thanksgiving = getThanksgivingDate(year);
  const thanksgivingStart = new Date(thanksgiving);
  thanksgivingStart.setDate(thanksgiving.getDate() - 14);
  if (month === 11 && now >= thanksgivingStart && now <= thanksgiving)
    return "thanksgiving";

  // Christmas / Holiday season (after Thanksgiving through Dec 31)
  if (month === 12 || (month === 11 && now > thanksgiving)) return "christmas";

  // Spring (Mar 18 – Jun 14, excluding Easter window already handled)
  if (
    (month === 3 && day >= 18) ||
    month === 4 ||
    month === 5 ||
    (month === 6 && day <= 14)
  )
    return "spring";

  return "default";
}

export function getTheme(id: string): Theme {
  return THEMES[id] ?? THEMES.default;
}
