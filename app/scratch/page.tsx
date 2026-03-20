"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { type Theme, THEMES } from "@/lib/themes";

interface TicketResult {
  ticketId: string;
  outcome: string;
  description: string;
}

type ServiceType = "recurring" | "onetime";

interface PrizeOddsEntry {
  label: string;
  description: string;
  odds: string;
}

interface PrizeOddsData {
  season: string;
  differentiated: boolean;
  recurring: PrizeOddsEntry[];
  onetime: PrizeOddsEntry[];
}

const SCRATCH_THRESHOLD = 0.6;
/** Milliseconds before a ticket-issuance POST request is aborted. */
const ISSUE_TIMEOUT_MS = 15_000;
/** Milliseconds before a ticket-restoration GET request is aborted. */
const RESTORE_TIMEOUT_MS = 10_000;

export default function ScratchPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<Theme>(THEMES.default);
  const [ticket, setTicket] = useState<TicketResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [contactInput, setContactInput] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [prizeOdds, setPrizeOdds] = useState<PrizeOddsData | null>(null);
  const isScratching = useRef(false);
  const hasAutoRevealed = useRef(false);

  /** Returns "YYYY-MM" for the current calendar month. */
  const monthKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // Fetch active theme and prize odds on mount
  useEffect(() => {
    fetch("/api/theme")
      .then((r) => (r.ok ? r.json() : null))
      .then((t) => {
        if (t) setTheme(t);
      })
      .catch(() => {});

    fetch("/api/prizes/odds")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setPrizeOdds(data);
      })
      .catch(() => {});
  }, []);

  async function issueTicket(contact: string, svcType: ServiceType) {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ISSUE_TIMEOUT_MS);
    try {
      const res = await fetch("/api/scratch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, serviceType: svcType }),
        signal: controller.signal,
      });

      if (res.status === 409) {
        const data = await res.json();
        setTicket({ ticketId: data.ticketId, outcome: data.outcome, description: "" });
        const full = await fetch(`/api/scratch/${data.ticketId}`);
        if (full.ok) setTicket(await full.json());
        setAlreadyPlayed(true);
        setRevealed(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to issue ticket");
      }

      const data: TicketResult = await res.json();
      setTicket(data);
      localStorage.setItem("scratch_month", monthKey());
      localStorage.setItem("scratch_id", data.ticketId);
      localStorage.setItem("scratch_contact", contact.trim().toLowerCase());
      localStorage.setItem("scratch_service_type", svcType);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        setError("Request timed out. Please check your connection and try again.");
      } else {
        setError(String(e instanceof Error ? e.message : e));
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  // On mount: fast-path if already played this month
  useEffect(() => {
    const savedMonth = localStorage.getItem("scratch_month");
    const savedId = localStorage.getItem("scratch_id");
    const savedSvcRaw = localStorage.getItem("scratch_service_type");
    const savedSvcType: ServiceType | null =
      savedSvcRaw === "recurring" || savedSvcRaw === "onetime" ? savedSvcRaw : null;
    if (savedMonth === monthKey() && savedId) {
      if (savedSvcType) setServiceType(savedSvcType);
      setContactSubmitted(true);
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), RESTORE_TIMEOUT_MS);

      const clearStale = () => {
        localStorage.removeItem("scratch_month");
        localStorage.removeItem("scratch_id");
        localStorage.removeItem("scratch_contact");
        localStorage.removeItem("scratch_service_type");
        setContactSubmitted(false);
        setServiceType(null);
      };

      fetch(`/api/scratch/${savedId}`, { signal: controller.signal })
        .then(async (r) => {
          if (r.ok) {
            setTicket(await r.json());
            setAlreadyPlayed(true);
            setRevealed(true);
          } else {
            // Ticket not found (e.g. ephemeral DB reset on Vercel) — let user play fresh
            clearStale();
          }
        })
        .catch(() => {
          // Network error or timeout — clear stale data so user can try again
          clearStale();
        })
        .finally(() => {
          clearTimeout(timeoutId);
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactInput.trim() || !serviceType) return;
    setContactSubmitted(true);
    await issueTicket(contactInput.trim(), serviceType);
  }

  // Draw themed scratch overlay on canvas
  useEffect(() => {
    if (!ticket || alreadyPlayed || revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = theme.canvasFill;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Diagonal stripe texture
    ctx.strokeStyle = theme.canvasStripe;
    ctx.lineWidth = 2;
    for (let i = -canvas.height; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }

    ctx.fillStyle = theme.canvasTextColor;
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "center";
    ctx.fillText("✦ SCRATCH HERE ✦", canvas.width / 2, canvas.height / 2 - 14);
    ctx.font = "13px Arial";
    ctx.fillText(theme.canvasLabel, canvas.width / 2, canvas.height / 2 + 10);
    ctx.font = "11px Arial";
    ctx.fillText("Patton Pest Control", canvas.width / 2, canvas.height / 2 + 28);
  }, [ticket, alreadyPlayed, revealed, theme]);

  const getPos = (
    e: MouseEvent | TouchEvent,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const checkScratchPercent = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || hasAutoRevealed.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    const percent = transparent / (canvas.width * canvas.height);
    if (percent >= SCRATCH_THRESHOLD) {
      hasAutoRevealed.current = true;
      setRevealed(true);
    }
  }, []);

  const scratch = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isScratching.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      e.preventDefault();
      const pos = getPos(e, canvas);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 26, 0, Math.PI * 2);
      ctx.fill();
      checkScratchPercent();
    },
    [checkScratchPercent]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || alreadyPlayed || revealed || !ticket) return;

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isScratching.current = true;
    };
    const stop = () => {
      isScratching.current = false;
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("mouseleave", stop);
    canvas.addEventListener("mousemove", scratch as EventListener);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchend", stop);
    canvas.addEventListener("touchmove", scratch as EventListener, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mouseup", stop);
      canvas.removeEventListener("mouseleave", stop);
      canvas.removeEventListener("mousemove", scratch as EventListener);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchend", stop);
      canvas.removeEventListener("touchmove", scratch as EventListener);
    };
  }, [ticket, alreadyPlayed, revealed, scratch]);

  const isWinner =
    ticket?.outcome !== "No prize" && ticket?.outcome !== "Better Luck Next Time";

  // ─────────────────────────────────────────────────────────────────────────
  // Dynamic styles built from current theme
  // ─────────────────────────────────────────────────────────────────────────
  const s = buildStyles(theme);

  // ── Service type selection ─────────────────────────────────────────────────
  if (!serviceType) {
    return (
      <main style={s.main}>
        <div style={s.card}>
          <div style={s.bugStrip}>{theme.emoji} {theme.emoji} {theme.emoji}</div>
          <h1 style={s.title}>🎟 Patton Pest Control</h1>
          <h2 style={s.subtitle}>{theme.name}</h2>
          <p style={s.tagline}>{theme.tagline}</p>
          <p style={s.bodyText}>
            Before we get started — do you currently have a recurring service
            with us, or are you a one-time service customer?
          </p>

          {/* Prize previews for each service type */}
          {prizeOdds && (
            <div style={s.oddsGrid}>
              <div style={s.oddsColumn}>
                <div style={s.oddsHeader}>🔁 Recurring Service</div>
                {prizeOdds.recurring.map((p) => (
                  <div key={p.label} style={s.oddsRow}>
                    <span style={s.oddsLabel}>{p.label}</span>
                    <span style={s.oddsBadge}>{p.odds}</span>
                  </div>
                ))}
              </div>
              <div style={s.oddsColumn}>
                <div style={s.oddsHeader}>1️⃣ One-Time Service</div>
                {prizeOdds.onetime.map((p) => (
                  <div key={p.label} style={s.oddsRow}>
                    <span style={s.oddsLabel}>{p.label}</span>
                    <span style={s.oddsBadge}>{p.odds}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            style={{ ...s.btnPlay, marginBottom: 12 }}
            onClick={() => setServiceType("recurring")}
          >
            🔁 I have a Recurring Service
          </button>
          <button
            style={{ ...s.btnPlay, background: theme.subtitleColor }}
            onClick={() => setServiceType("onetime")}
          >
            1️⃣ I have a One-Time Service
          </button>
        </div>
      </main>
    );
  }

  // ── Contact form ───────────────────────────────────────────────────────────
  if (!contactSubmitted) {
    const selectedPrizes =
      prizeOdds && (serviceType === "recurring" ? prizeOdds.recurring : prizeOdds.onetime);
    return (
      <main style={s.main}>
        <div style={s.card}>
          <div style={s.bugStrip}>{theme.emoji} {theme.emoji} {theme.emoji}</div>
          <h1 style={s.title}>🎟 Patton Pest Control</h1>
          <h2 style={s.subtitle}>{theme.name}</h2>
          <p style={s.tagline}>{theme.tagline}</p>

          {/* Prize odds for the selected service type */}
          {selectedPrizes && (
            <div style={s.oddsBox}>
              <div style={s.oddsBoxTitle}>
                🎁 Possible prizes ({serviceType === "recurring" ? "Recurring" : "One-Time"} customer)
              </div>
              {selectedPrizes.map((p) => (
                <div key={p.label} style={s.oddsRow}>
                  <span style={s.oddsLabel}>{p.label}</span>
                  <span style={s.oddsBadge}>{p.odds}</span>
                </div>
              ))}
            </div>
          )}

          <p style={s.bodyText}>
            Enter your phone number or email to get your free scratch-off
            ticket. <strong>One ticket per person per month.</strong>
          </p>
          <form onSubmit={handleContactSubmit} style={{ width: "100%" }}>
            <input
              type="text"
              placeholder="Phone number or email address"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              style={s.input}
              required
              autoFocus
            />
            <button type="submit" style={s.btnPlay}>
              Get My Ticket {theme.emoji}
            </button>
          </form>
          <button
            style={{ ...s.btnBack, marginTop: 12 }}
            onClick={() => setServiceType(null)}
          >
            ← Back
          </button>
        </div>
      </main>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main style={s.main}>
        <div style={s.card}>
          <p style={{ color: theme.bodyTextColor, fontSize: 18 }}>
            Loading your ticket…
          </p>
        </div>
      </main>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <main style={s.main}>
        <div style={s.card}>
          <p style={{ color: "#c0392b", fontSize: 16, marginBottom: 16 }}>
            {error}
          </p>
          <button
            style={s.btnPlay}
            onClick={() => {
              setContactSubmitted(false);
              setError(null);
            }}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  // ── Already played this month ──────────────────────────────────────────────
  if (alreadyPlayed) {
    return (
      <main style={s.main}>
        <div style={s.card}>
          <div style={s.bugStrip}>{theme.emoji} {theme.emoji} {theme.emoji}</div>
          <h1 style={s.title}>🎟 Patton Pest Control</h1>
          <h2 style={s.subtitle}>{theme.name}</h2>
          <p style={{ ...s.bodyText, marginBottom: 16 }}>
            You already played this month — come back next month for another
            chance!
          </p>
          <div style={isWinner ? s.prizeBoxWinner : s.prizeBoxLoser}>
            <div style={isWinner ? s.prizeLabel : s.prizeLabelLoser}>{ticket?.outcome}</div>
            <div style={isWinner ? s.prizeDesc : s.prizeDescLoser}>{ticket?.description}</div>
            {isWinner && (
              <p style={s.callToAction}>
                📞 Call us at <strong>440-338-3101</strong> to redeem!
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ── Scratch card ───────────────────────────────────────────────────────────
  return (
    <main style={s.main}>
      <div style={s.card}>
        <div style={s.bugStrip}>{theme.emoji} {theme.emoji} {theme.emoji}</div>
        <h1 style={s.title}>🎟 Patton Pest Control</h1>
        <h2 style={s.subtitle}>{theme.name}</h2>

        {!revealed && (
          <p style={s.bodyText}>Scratch the card below to reveal your prize!</p>
        )}

        <div style={s.scratchWrapper}>
          <div style={s.prizeRevealArea}>
            {revealed ? (
              <div style={isWinner ? s.prizeBoxWinner : s.prizeBoxLoser}>
                <div style={isWinner ? s.prizeLabel : s.prizeLabelLoser}>{ticket?.outcome}</div>
                <div style={isWinner ? s.prizeDesc : s.prizeDescLoser}>{ticket?.description}</div>
                {isWinner && (
                  <p style={s.callToAction}>
                    📞 Call us at <strong>440-338-3101</strong> to redeem!
                  </p>
                )}
              </div>
            ) : (
              <div style={s.hiddenBg}>
                <span style={{ color: theme.mutedTextColor, fontSize: 13 }}>
                  Scratch to reveal…
                </span>
              </div>
            )}
          </div>

          {!revealed && (
            <canvas
              ref={canvasRef}
              width={340}
              height={170}
              style={s.canvas}
            />
          )}
        </div>

        {revealed && (
          <p style={{ color: theme.mutedTextColor, marginTop: 14, fontSize: 13 }}>
            Come back next month for another chance!
          </p>
        )}
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Style factory — builds all style objects from the active theme
// ─────────────────────────────────────────────────────────────────────────────
function buildStyles(t: Theme): Record<string, React.CSSProperties> {
  return {
    main: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: t.pageBackground,
      padding: "24px 16px",
    },
    card: {
      background: t.cardBackground,
      border: t.cardBorder,
      borderRadius: 20,
      padding: "32px 28px 36px",
      maxWidth: 420,
      width: "100%",
      textAlign: "center",
      boxShadow: t.cardShadow,
    },
    bugStrip: {
      fontSize: 20,
      letterSpacing: 8,
      marginBottom: 10,
      opacity: 0.65,
    },
    title: {
      fontSize: 23,
      fontWeight: 800,
      color: t.titleColor,
      margin: "0 0 3px",
      letterSpacing: "-0.3px",
    },
    subtitle: {
      fontSize: 13,
      color: t.subtitleColor,
      marginTop: 0,
      marginBottom: 4,
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    },
    tagline: {
      fontSize: 13,
      color: t.subtitleColor,
      marginBottom: 16,
      fontStyle: "italic",
      opacity: 0.85,
    },
    bodyText: {
      color: t.bodyTextColor,
      fontSize: 14,
      marginBottom: 16,
      lineHeight: 1.6,
    },
    input: {
      width: "100%",
      padding: "11px 14px",
      borderRadius: 10,
      border: `1.5px solid ${t.inputBorderColor}`,
      fontSize: 15,
      marginBottom: 12,
      boxSizing: "border-box" as const,
      outline: "none",
      background: "rgba(255,255,255,0.95)",
      color: "#333",
    },
    btnPlay: {
      width: "100%",
      background: t.buttonBackground,
      color: t.buttonColor,
      border: "none",
      borderRadius: 10,
      padding: "14px 0",
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      letterSpacing: "0.2px",
      boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
    },
    btnBack: {
      width: "100%",
      background: "transparent",
      color: t.subtitleColor,
      border: `1.5px solid ${t.inputBorderColor}`,
      borderRadius: 10,
      padding: "10px 0",
      fontSize: 14,
      cursor: "pointer",
    },
    scratchWrapper: {
      position: "relative",
      display: "inline-block",
      width: "100%",
    },
    prizeRevealArea: {
      width: "100%",
      minHeight: 170,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    canvas: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      cursor: "crosshair",
      borderRadius: 10,
      touchAction: "none",
    },
    hiddenBg: {
      width: "100%",
      height: 170,
      background: t.canvasFill,
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    prizeBoxWinner: {
      background: t.winnerGradient,
      borderRadius: 14,
      padding: "22px 24px",
      width: "100%",
      boxSizing: "border-box" as const,
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    },
    prizeBoxLoser: {
      background: t.loserBackground,
      borderRadius: 14,
      padding: "22px 24px",
      width: "100%",
      boxSizing: "border-box" as const,
    },
    prizeLabel: {
      fontSize: 28,
      fontWeight: 800,
      color: t.winnerTextColor,
      marginBottom: 6,
      letterSpacing: "-0.5px",
    },
    prizeLabelLoser: {
      fontSize: 28,
      fontWeight: 800,
      color: t.loserTextColor,
      marginBottom: 6,
    },
    prizeDesc: {
      fontSize: 15,
      color: t.winnerTextColor,
    },
    prizeDescLoser: {
      fontSize: 15,
      color: t.loserTextColor,
    },
    callToAction: {
      marginTop: 12,
      fontSize: 14,
      color: t.ctaColor,
      fontWeight: 600,
    },
    oddsGrid: {
      display: "flex",
      gap: 10,
      marginBottom: 20,
      textAlign: "left" as const,
      fontSize: 12,
    },
    oddsColumn: {
      flex: 1,
      background: "rgba(0,0,0,0.04)",
      borderRadius: 10,
      padding: "10px 10px 8px",
    },
    oddsHeader: {
      fontWeight: 700,
      fontSize: 11,
      color: t.titleColor,
      marginBottom: 6,
      textTransform: "uppercase" as const,
      letterSpacing: "0.4px",
    },
    oddsBox: {
      background: "rgba(0,0,0,0.04)",
      borderRadius: 10,
      padding: "10px 12px 8px",
      marginBottom: 14,
      textAlign: "left" as const,
      fontSize: 12,
    },
    oddsBoxTitle: {
      fontWeight: 700,
      fontSize: 11,
      color: t.titleColor,
      marginBottom: 6,
      textTransform: "uppercase" as const,
      letterSpacing: "0.4px",
    },
    oddsRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "3px 0",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
    },
    oddsLabel: {
      color: t.bodyTextColor,
      fontSize: 11,
      lineHeight: 1.3,
      paddingRight: 6,
    },
    oddsBadge: {
      fontWeight: 700,
      fontSize: 11,
      color: t.titleColor,
      whiteSpace: "nowrap" as const,
    },
  };
}
