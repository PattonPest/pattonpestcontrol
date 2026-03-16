"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TicketResult {
  ticketId: string;
  outcome: string;
  description: string;
}

const SCRATCH_THRESHOLD = 0.6;

export default function ScratchPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ticket, setTicket] = useState<TicketResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const isScratching = useRef(false);
  const hasAutoRevealed = useRef(false);

  const todayKey = () => new Date().toISOString().split("T")[0];

  async function issueTicket(today: string) {
    const res = await fetch("/api/scratch", { method: "POST" });
    if (!res.ok) throw new Error("Failed to issue ticket");
    const data: TicketResult = await res.json();
    setTicket(data);
    localStorage.setItem("scratch_date", today);
    localStorage.setItem("scratch_id", data.ticketId);
  }

  useEffect(() => {
    async function init() {
      try {
        const savedDate = localStorage.getItem("scratch_date");
        const savedId = localStorage.getItem("scratch_id");
        const today = todayKey();

        if (savedDate === today && savedId) {
          const res = await fetch(`/api/scratch/${savedId}`);
          if (res.ok) {
            const data = await res.json();
            setTicket(data);
            setAlreadyPlayed(true);
            setRevealed(true);
          } else {
            localStorage.removeItem("scratch_date");
            localStorage.removeItem("scratch_id");
            await issueTicket(today);
          }
        } else {
          await issueTicket(today);
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw scratch overlay on canvas
  useEffect(() => {
    if (!ticket || alreadyPlayed || revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#B0B0B0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Diagonal stripe texture
    ctx.strokeStyle = "#A0A0A0";
    ctx.lineWidth = 2;
    for (let i = -canvas.height; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }

    ctx.fillStyle = "#888";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("✦ SCRATCH HERE ✦", canvas.width / 2, canvas.height / 2 - 8);
    ctx.font = "13px Arial";
    ctx.fillText("Patton Pest Control", canvas.width / 2, canvas.height / 2 + 14);
  }, [ticket, alreadyPlayed, revealed]);

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
    canvas.addEventListener("touchmove", scratch as EventListener, {
      passive: false,
    });

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

  if (loading) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <p style={{ color: "#555", fontSize: 18 }}>Loading your ticket…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <p style={{ color: "#c0392b", fontSize: 16 }}>{error}</p>
        </div>
      </main>
    );
  }

  const isWinner = ticket?.outcome !== "No prize";

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎟 Patton Pest Control</h1>
        <h2 style={styles.subtitle}>Daily Scratch-Off Ticket</h2>

        {alreadyPlayed ? (
          <div style={styles.section}>
            <p style={{ marginBottom: 16, color: "#888", fontSize: 14 }}>
              You already played today. Come back tomorrow!
            </p>
            <div style={isWinner ? styles.prizeBoxWinner : styles.prizeBoxLoser}>
              <div style={styles.prizeLabel}>{ticket?.outcome}</div>
              <div style={styles.prizeDesc}>{ticket?.description}</div>
              {isWinner && (
                <p style={styles.callToAction}>
                  Call us at <strong>(555) 123-4567</strong> to redeem!
                </p>
              )}
            </div>
          </div>
        ) : (
          <div style={styles.section}>
            {!revealed && (
              <p style={{ marginBottom: 12, color: "#666", fontSize: 14 }}>
                Scratch the card below to reveal your prize!
              </p>
            )}

            <div style={styles.scratchWrapper}>
              {/* Prize displayed behind canvas */}
              <div style={styles.prizeRevealArea}>
                {revealed ? (
                  <div
                    style={isWinner ? styles.prizeBoxWinner : styles.prizeBoxLoser}
                  >
                    <div style={styles.prizeLabel}>{ticket?.outcome}</div>
                    <div style={styles.prizeDesc}>{ticket?.description}</div>
                    {isWinner && (
                      <p style={styles.callToAction}>
                        Call us at <strong>(555) 123-4567</strong> to redeem!
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={styles.hiddenBg}>
                    <span style={{ color: "#bbb", fontSize: 13 }}>
                      Scratch to reveal…
                    </span>
                  </div>
                )}
              </div>

              {/* Canvas overlay — only shown when not yet revealed */}
              {!revealed && (
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={160}
                  style={styles.canvas}
                />
              )}
            </div>

            {revealed && (
              <p style={{ color: "#999", marginTop: 14, fontSize: 13 }}>
                Come back tomorrow for another chance!
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a472a 0%, #2d5a27 100%)",
    padding: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "32px 24px",
    maxWidth: 400,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1a472a",
    margin: 0,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 4,
    marginBottom: 20,
    fontWeight: 500,
  },
  section: {
    width: "100%",
  },
  scratchWrapper: {
    position: "relative",
    display: "inline-block",
    width: "100%",
  },
  prizeRevealArea: {
    width: "100%",
    minHeight: 160,
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
    height: 160,
    background: "#f0f0f0",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  prizeBoxWinner: {
    background: "linear-gradient(135deg, #ffd700, #ff8c00)",
    borderRadius: 12,
    padding: "20px 24px",
    width: "100%",
    boxSizing: "border-box",
  },
  prizeBoxLoser: {
    background: "#f0f0f0",
    borderRadius: 12,
    padding: "20px 24px",
    width: "100%",
    boxSizing: "border-box",
  },
  prizeLabel: {
    fontSize: 28,
    fontWeight: 800,
    color: "#1a1a1a",
    marginBottom: 6,
  },
  prizeDesc: {
    fontSize: 15,
    color: "#333",
  },
  callToAction: {
    marginTop: 12,
    fontSize: 14,
    color: "#1a472a",
  },
};
