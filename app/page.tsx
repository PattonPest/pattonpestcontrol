import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(160deg, #0a1f10 0%, #1a472a 50%, #2d5a27 100%)",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background accents */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 12% 88%, rgba(45,90,39,0.35) 0%, transparent 55%), " +
            "radial-gradient(circle at 88% 12%, rgba(26,71,42,0.5) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 24,
          maxWidth: 460,
          width: "100%",
          overflow: "hidden",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.18)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Green header band */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a472a 0%, #2d6a35 100%)",
            padding: "28px 32px 24px",
            textAlign: "center",
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              fontSize: 30,
            }}
          >
            🦟
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 4px",
              letterSpacing: "-0.3px",
            }}
          >
            Patton Pest Control
          </h1>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.72)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              margin: 0,
            }}
          >
            Serving Northeast Ohio
          </p>
        </div>

        {/* Card body */}
        <div style={{ padding: "28px 32px 32px" }}>
          {/* Promo badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#f0faf0",
              border: "1px solid #c8e6c9",
              borderRadius: 20,
              padding: "5px 12px",
              marginBottom: 16,
              fontSize: 12,
              color: "#2e7d32",
              fontWeight: 600,
            }}
          >
            🎟 Monthly Scratch-Off Contest
          </div>

          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#1a1a1a",
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            Win Discounts on Pest Control Services!
          </h2>

          <p
            style={{
              color: "#555",
              marginBottom: 24,
              lineHeight: 1.7,
              fontSize: 14.5,
            }}
          >
            Play our virtual scratch-off for a chance to win exclusive
            discounts.{" "}
            <strong style={{ color: "#1a472a" }}>
              One free play per person per month.
            </strong>
          </p>

          {/* How it works steps */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {(
              [
                { n: "1", label: "Select\nService" },
                { n: "2", label: "Enter\nContact" },
                { n: "3", label: "Scratch\n& Win!" },
              ] as { n: string; label: string }[]
            ).map((step) => (
              <div
                key={step.n}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "12px 6px",
                  background: "#f8fafb",
                  borderRadius: 12,
                  border: "1px solid #e8ecf0",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1a472a, #2d6a35)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                    boxShadow: "0 2px 6px rgba(26,71,42,0.3)",
                  }}
                >
                  {step.n}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#444",
                    fontWeight: 600,
                    lineHeight: 1.4,
                    whiteSpace: "pre-line",
                  }}
                >
                  {step.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <Link
            href="/scratch"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "linear-gradient(135deg, #1a472a 0%, #2d6a35 100%)",
              color: "#fff",
              padding: "15px 32px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: "0 6px 20px rgba(26,71,42,0.35)",
              marginBottom: 20,
              letterSpacing: "0.1px",
            }}
          >
            🎟 Play Now — It&apos;s Free
            <span style={{ fontSize: 16, opacity: 0.8 }}>→</span>
          </Link>

          {/* Contact footer */}
          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              paddingTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              color: "#999",
              fontSize: 13,
            }}
          >
            Questions?{" "}
            <a
              href="tel:4403383101"
              style={{
                color: "#1a472a",
                fontWeight: 700,
              }}
            >
              📞 440-338-3101
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

