import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a472a 0%, #2d5a27 100%)",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "40px 32px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 12 }}>🦟</div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#1a472a",
            marginBottom: 8,
          }}
        >
          Patton Pest Control
        </h1>
        <p style={{ color: "#555", marginBottom: 28, lineHeight: 1.6 }}>
          Try your luck with our virtual scratch-off ticket! One free play per
          month. Win discounts on pest control services.
        </p>
        <Link
          href="/scratch"
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #1a472a, #2d5a27)",
            color: "#fff",
            padding: "14px 36px",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 17,
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            transition: "opacity 0.2s",
          }}
        >
          🎟 Play Now
        </Link>
      </div>
    </main>
  );
}
