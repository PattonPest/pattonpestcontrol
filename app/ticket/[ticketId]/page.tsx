import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ ticketId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticketId } = await params;
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { title: "Ticket Not Found – Patton Pest Control" };
  const isWinner = ticket.outcome !== "No prize";
  return {
    title: isWinner
      ? `🏆 ${ticket.outcome} – Patton Pest Control`
      : "Patton Pest Control – Scratch-Off Ticket",
    description: "View your Patton Pest Control scratch-off ticket result.",
  };
}

export default async function TicketPage({ params }: Props) {
  const { ticketId } = await params;

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) notFound();

  const prize = await prisma.prize.findFirst({
    where: { label: ticket.outcome },
  });
  const description = prize?.description ?? "";
  const isWinner = ticket.outcome !== "No prize";

  const issued = new Date(ticket.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "28px 24px 32px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 6, marginBottom: 8, opacity: 0.7 }}>
          🐛 🐛 🐛
        </div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0f3460",
            margin: "0 0 2px",
          }}
        >
          🎟 Patton Pest Control
        </h1>

        <h2
          style={{
            fontSize: 14,
            color: "#1a5276",
            marginTop: 0,
            marginBottom: 4,
            fontWeight: 700,
          }}
        >
          Scratch-Off Ticket
        </h2>

        <div
          style={{
            background: "#0f3460",
            color: "#fff",
            borderRadius: 20,
            padding: "5px 16px",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.04em",
            display: "inline-block",
            margin: "8px auto 20px",
          }}
        >
          🏆 Everyone is a winner! 🏆
        </div>

        <div
          style={
            isWinner
              ? {
                  background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                  borderRadius: 12,
                  padding: "20px 24px",
                  width: "100%",
                  boxSizing: "border-box",
                }
              : {
                  background: "#f0f0f0",
                  borderRadius: 12,
                  padding: "20px 24px",
                  width: "100%",
                  boxSizing: "border-box",
                }
          }
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: isWinner ? "#7b341e" : "#555",
              marginBottom: 6,
            }}
          >
            {ticket.outcome}
          </div>
          {description && (
            <div style={{ fontSize: 15, color: isWinner ? "#7b341e" : "#555" }}>
              {description}
            </div>
          )}
          {isWinner && (
            <p
              style={{
                marginTop: 12,
                fontSize: 14,
                color: "#7b341e",
                fontWeight: 600,
              }}
            >
              📞 Call us at <strong>(555) 123-4567</strong> to redeem!
            </p>
          )}
        </div>

        <p
          style={{
            color: "#888",
            fontSize: 12,
            marginTop: 16,
            marginBottom: 0,
          }}
        >
          Ticket ID: {ticketId}
          <br />
          Issued: {issued}
        </p>
      </div>
    </main>
  );
}
