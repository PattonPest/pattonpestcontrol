"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { type Theme, THEMES } from "@/lib/themes";

interface TicketResult {
  ticketId: string;
  outcome: string;
  description: string;
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
  const [copied, setCopied] = useState(false);
  const isScratching = useRef(false);
  const hasAutoRevealed = useRef(false);

  /** Returns "YYYY-MM" for the current calendar month. */
  const monthKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // Fetch active theme on mount
  useEffect(() => {
    fetch("/api/theme")
      .then((r) => (r.ok ? r.json() : null))
      .then((t) => {
        if (t) setTheme(t);
      })
      .catch(() => {});
  }, []);

  async function issueTicket(contact: string) {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ISSUE_TIMEOUT_MS);
    try {
      const res = await fetch("/api/scratch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
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
    if (savedMonth === monthKey() && savedId) {
      setContactSubmitted(true);
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), RESTORE_TIMEOUT_MS);

      const clearStale = () => {
        localStorage.removeItem("scratch_month");
        localStorage.removeItem("scratch_id");
        localStorage.removeItem("scratch_contact");
        setContactSubmitted(false);
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
    if (!contactInput.trim()) return;
    setContactSubmitted(true);
    await issueTicket(contactInput.trim());
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

  const isWinner = ticket?.outcome !== "No prize";

  const ticketUrl =
    typeof window !== "undefined" && ticket
      ? `${window.location.origin}/ticket/${ticket.ticketId}`
      : "";

  function handleCopyLink() {
    if (!ticketUrl) return;
    navigator.clipboard.writeText(ticketUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(false);
    });
  }

  const shareableLinkBlock = (
    <div style={{ marginTop: 16, textAlign: "center" }}>
      <p style={{ color: theme.mutedTextColor, fontSize: 12, marginBottom: 6 }}>
        🔗 Your ticket link (share to redeem):
      </p>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          readOnly
          value={ticketUrl}
          style={{
            flex: 1,
            fontSize: 11,
            padding: "6px 8px",
            borderRadius: 6,
            border: `1px solid ${theme.inputBorderColor}`,
            background: "rgba(255,255,255,0.9)",
            color: "#333",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          onFocus={(e) => e.target.select()}
        />
        <button
          onClick={handleCopyLink}
          style={{
            background: theme.buttonBackground,
            color: theme.buttonColor,
            border: "none",
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Dynamic styles built from current theme
  // ─────────────────────────────────────────────────────────────────────────
  const s = buildStyles(theme);

  // ── Contact form ───────────────────────────────────────────────────────────
  if (!contactSubmitted) {
    return (
      <main style={s.main}>
        <div style={s.card}>
          <div style={s.bugStrip}>{theme.emoji} {theme.emoji} {theme.emoji}</div>
          <h1 style={s.title}>🎟 Patton Pest Control</h1>
          <h2 style={s.subtitle}>{theme.name}</h2>
          <div style={s.winnerBanner}>🏆 Everyone is a winner! 🏆</div>
          <p style={s.tagline}>{theme.tagline}</p>
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
          <div style={s.winnerBanner}>🏆 Everyone is a winner! 🏆</div>
          <p style={{ ...s.bodyText, marginBottom: 16 }}>
            You already played this month — come back next month for another
            chance!
          </p>
          <div style={isWinner ? s.prizeBoxWinner : s.prizeBoxLoser}>
            <div style={s.prizeLabel}>{ticket?.outcome}</div>
            <div style={s.prizeDesc}>{ticket?.description}</div>
            {isWinner && (
              <p style={s.callToAction}>
                📞 Call us at <strong>(555) 123-4567</strong> to redeem!
              </p>
            )}
          </div>
          {shareableLinkBlock}
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
        <div style={s.winnerBanner}>🏆 Everyone is a winner! 🏆</div>

        {!revealed && (
          <p style={s.bodyText}>Scratch the card below to reveal your prize!</p>
        )}

        <div style={s.scratchWrapper}>
          <div style={s.prizeRevealArea}>
            {revealed ? (
              <div style={isWinner ? s.prizeBoxWinner : s.prizeBoxLoser}>
                <div style={s.prizeLabel}>{ticket?.outcome}</div>
                <div style={s.prizeDesc}>{ticket?.description}</div>
                {isWinner && (
                  <p style={s.callToAction}>
                    📞 Call us at <strong>(555) 123-4567</strong> to redeem!
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
        {revealed && shareableLinkBlock}
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
      padding: 16,
    },
    card: {
      background: t.cardBackground,
      border: t.cardBorder,
      borderRadius: 16,
      padding: "28px 24px 32px",
      maxWidth: 400,
      width: "100%",
      textAlign: "center",
      boxShadow: t.cardShadow,
    },
    bugStrip: {
      fontSize: 22,
      letterSpacing: 6,
      marginBottom: 8,
      opacity: 0.7,
    },
    title: {
      fontSize: 22,
      fontWeight: 800,
      color: t.titleColor,
      margin: "0 0 2px",
    },
    subtitle: {
      fontSize: 14,
      color: t.subtitleColor,
      marginTop: 0,
      marginBottom: 4,
      fontWeight: 700,
    },
    tagline: {
      fontSize: 13,
      color: t.subtitleColor,
      marginBottom: 14,
      fontStyle: "italic",
    },
    bodyText: {
      color: t.bodyTextColor,
      fontSize: 14,
      marginBottom: 14,
    },
    input: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: 8,
      border: `1px solid ${t.inputBorderColor}`,
      fontSize: 15,
      marginBottom: 12,
      boxSizing: "border-box" as const,
      outline: "none",
      background: "rgba(255,255,255,0.9)",
      color: "#333",
    },
    btnPlay: {
      width: "100%",
      background: t.buttonBackground,
      color: t.buttonColor,
      border: "none",
      borderRadius: 8,
      padding: "12px 0",
      fontSize: 16,
      fontWeight: 700,
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
      borderRadius: 8,
      touchAction: "none",
    },
    hiddenBg: {
      width: "100%",
      height: 170,
      background: t.canvasFill,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    prizeBoxWinner: {
      background: t.winnerGradient,
      borderRadius: 12,
      padding: "20px 24px",
      width: "100%",
      boxSizing: "border-box" as const,
    },
    prizeBoxLoser: {
      background: t.loserBackground,
      borderRadius: 12,
      padding: "20px 24px",
      width: "100%",
      boxSizing: "border-box" as const,
    },
    prizeLabel: {
      fontSize: 28,
      fontWeight: 800,
      color: t.winnerTextColor,
      marginBottom: 6,
    },
    prizeDesc: {
      fontSize: 15,
      color: t.winnerTextColor,
    },
    callToAction: {
      marginTop: 12,
      fontSize: 14,
      color: t.ctaColor,
      fontWeight: 600,
    },
    winnerBanner: {
      background: t.buttonBackground,
      color: t.buttonColor,
      borderRadius: 20,
      padding: "5px 16px",
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: "0.04em",
      display: "inline-block",
      margin: "8px auto 12px",
    },
  };
}
