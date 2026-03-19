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
          "linear-gradient(160deg, #0f2d1a 0%, #1a472a 45%, #2d5a27 100%)",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background circles */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 15% 85%, rgba(45,90,39,0.45) 0%, transparent 45%), " +
            "radial-gradient(circle at 85% 15%, rgba(26,71,42,0.6) 0%, transparent 45%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          padding: "48px 40px 40px",
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.12)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Icon badge */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1a472a 0%, #2d5a27 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 34,
            boxShadow: "0 6px 20px rgba(26,71,42,0.45)",
          }}
        >
          🦟
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#1a472a",
            marginBottom: 4,
            letterSpacing: "-0.5px",
            lineHeight: 1.15,
          }}
        >
          Patton Pest Control
        </h1>

        <p
          style={{
            fontSize: 12,
            color: "#2d7a3a",
            fontWeight: 700,
            marginBottom: 18,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Serving Northeast Ohio
        </p>

        {/* Accent divider */}
        <div
          style={{
            width: 44,
            height: 3,
            background: "linear-gradient(90deg, #1a472a, #4a9a5a)",
            borderRadius: 99,
            margin: "0 auto 22px",
          }}
        />

        <p
          style={{
            color: "#555",
            marginBottom: 32,
            lineHeight: 1.65,
            fontSize: 15,
          }}
        >
          Try your luck with our virtual scratch-off ticket!{" "}
          <strong style={{ color: "#1a472a" }}>One free play per month.</strong>{" "}
          Win discounts on pest control services.
        </p>

        <Link
          href="/scratch"
          style={{
            display: "block",
            background: "linear-gradient(135deg, #1a472a 0%, #2d6a35 100%)",
            color: "#fff",
            padding: "16px 40px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 17,
            boxShadow: "0 6px 20px rgba(26,71,42,0.4)",
            letterSpacing: "0.2px",
          }}
        >
          🎟 Play Now — It&apos;s Free
        </Link>

        <p style={{ marginTop: 22, color: "#aaa", fontSize: 13 }}>
          📞 Questions?{" "}
          <a
            href="tel:4403383101"
            style={{ color: "#1a472a", fontWeight: 600 }}
          >
            440-338-3101
          </a>
        </p>
      </div>
    </main>
  );
}
