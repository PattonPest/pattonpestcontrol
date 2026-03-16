"use client";

import { useEffect, useState, useCallback } from "react";

interface Prize {
  id: string;
  label: string;
  description: string;
  weight: number;
  active: boolean;
  sortOrder: number;
}

interface Stats {
  totalTickets: number;
  byPrize: { prize: string; count: number }[];
}

const BLANK_FORM = {
  label: "",
  description: "",
  weight: 10,
  active: true,
};

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Editing state — null means "add new"
  const [editId, setEditId] = useState<string | null | "new">(null);
  const [form, setForm] = useState(BLANK_FORM);

  // Restore token from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) {
      setToken(saved);
      setAuthed(true);
    }
  }, []);

  const loadData = useCallback(
    async (t: string) => {
      setLoadError("");
      try {
        const [prRes, stRes] = await Promise.all([
          fetch("/api/admin/prizes", {
            headers: { "x-admin-token": t },
          }),
          fetch(`/api/admin/stats?token=${encodeURIComponent(t)}`),
        ]);
        if (prRes.status === 401) {
          setAuthed(false);
          sessionStorage.removeItem("admin_token");
          setAuthError("Invalid token. Please try again.");
          return;
        }
        if (!prRes.ok) throw new Error("Failed to load prizes");
        setPrizes(await prRes.json());
        if (stRes.ok) setStats(await stRes.json());
      } catch (e) {
        setLoadError(String(e));
      }
    },
    []
  );

  useEffect(() => {
    if (authed && token) loadData(token);
  }, [authed, token, loadData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    // Quick check: try fetching prizes
    const res = await fetch("/api/admin/prizes", {
      headers: { "x-admin-token": token },
    });
    if (res.status === 401) {
      setAuthError("Wrong token. Check your ADMIN_TOKEN environment variable.");
      return;
    }
    sessionStorage.setItem("admin_token", token);
    setAuthed(true);
  }

  function startEdit(prize: Prize) {
    setEditId(prize.id);
    setForm({
      label: prize.label,
      description: prize.description,
      weight: prize.weight,
      active: prize.active,
    });
    setSaveMsg("");
  }

  function startAdd() {
    setEditId("new");
    setForm(BLANK_FORM);
    setSaveMsg("");
  }

  function cancelEdit() {
    setEditId(null);
    setSaveMsg("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");

    if (!form.label.trim()) {
      setSaveMsg("❌ Prize name is required.");
      setSaving(false);
      return;
    }
    if (form.weight < 0) {
      setSaveMsg("❌ Weight must be 0 or greater.");
      setSaving(false);
      return;
    }

    const method = editId === "new" ? "POST" : "PUT";
    const url =
      editId === "new"
        ? "/api/admin/prizes"
        : `/api/admin/prizes/${editId}`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      setSaveMsg(`❌ ${err.error ?? "Save failed"}`);
      return;
    }

    setSaveMsg("✅ Saved!");
    setEditId(null);
    await loadData(token);
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete prize "${label}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/prizes/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    });
    if (!res.ok) {
      alert("Failed to delete prize.");
      return;
    }
    await loadData(token);
  }

  async function handleToggle(prize: Prize) {
    await fetch(`/api/admin/prizes/${prize.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify({ active: !prize.active }),
    });
    await loadData(token);
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <main style={s.page}>
        <div style={{ ...s.card, maxWidth: 360 }}>
          <h1 style={s.h1}>🔐 Admin Login</h1>
          <p style={s.muted}>Enter your ADMIN_TOKEN to continue.</p>
          <form onSubmit={handleLogin} style={{ marginTop: 20 }}>
            <input
              type="password"
              placeholder="Admin token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={s.input}
              autoFocus
            />
            {authError && <p style={s.error}>{authError}</p>}
            <button type="submit" style={s.btnPrimary}>
              Login
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ── Main admin panel ──────────────────────────────────────────────────────
  const totalWeight = prizes.filter((p) => p.active).reduce((s, p) => s + p.weight, 0);

  return (
    <main style={s.page}>
      <div style={{ ...s.card, maxWidth: 720 }}>
        {/* Header */}
        <div style={s.row}>
          <h1 style={s.h1}>🎟 Prize Manager</h1>
          <button
            style={s.btnSecondary}
            onClick={() => {
              sessionStorage.removeItem("admin_token");
              setAuthed(false);
              setToken("");
            }}
          >
            Log out
          </button>
        </div>

        {loadError && <p style={s.error}>{loadError}</p>}

        {/* Stats banner */}
        {stats && (
          <div style={s.statsBanner}>
            <span>
              <strong>{stats.totalTickets}</strong> total tickets issued
            </span>
            {stats.byPrize.map((b) => (
              <span key={b.prize}>
                <strong>{b.count}</strong> × {b.prize}
              </span>
            ))}
          </div>
        )}

        {/* Prize list */}
        <h2 style={s.h2}>Current Prizes</h2>
        {prizes.length === 0 ? (
          <p style={s.muted}>No prizes yet. Add one below.</p>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Prize Name</th>
                  <th style={s.th}>Description</th>
                  <th style={s.th}>Weight</th>
                  <th style={s.th}>Chance</th>
                  <th style={s.th}>Active</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prizes.map((p) => (
                  <tr key={p.id} style={p.active ? {} : s.inactiveRow}>
                    <td style={s.td}>{p.label}</td>
                    <td style={s.td}>{p.description || <em style={s.muted}>—</em>}</td>
                    <td style={{ ...s.td, textAlign: "center" }}>{p.weight}</td>
                    <td style={{ ...s.td, textAlign: "center" }}>
                      {totalWeight > 0
                        ? ((p.active ? p.weight / totalWeight : 0) * 100).toFixed(1) + "%"
                        : "—"}
                    </td>
                    <td style={{ ...s.td, textAlign: "center" }}>
                      <button
                        onClick={() => handleToggle(p)}
                        style={p.active ? s.btnGreen : s.btnGray}
                        title="Toggle active"
                      >
                        {p.active ? "✓ On" : "Off"}
                      </button>
                    </td>
                    <td style={s.td}>
                      <button
                        style={s.btnSmall}
                        onClick={() => startEdit(p)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        style={s.btnDanger}
                        onClick={() => handleDelete(p.id, p.label)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ ...s.muted, marginTop: 6 }}>
          <em>
            Weights are relative — higher weight = better chance. E.g. weight
            70 + 20 + 9 + 1 = 100 total → 70% / 20% / 9% / 1%.
          </em>
        </p>

        {/* Add / Edit form */}
        <h2 style={{ ...s.h2, marginTop: 28 }}>
          {editId === "new" ? "➕ Add New Prize" : editId ? "✏️ Edit Prize" : ""}
        </h2>

        {editId === null ? (
          <button style={s.btnPrimary} onClick={startAdd}>
            + Add New Prize
          </button>
        ) : (
          <form onSubmit={handleSave} style={s.formGrid}>
            <label style={s.label}>
              Prize Name *
              <input
                style={s.input}
                value={form.label}
                placeholder="e.g. $5 off, Free Inspection, Thank you!"
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                required
              />
            </label>

            <label style={s.label}>
              Description (shown after scratch)
              <input
                style={s.input}
                value={form.description}
                placeholder="e.g. Get $5 off your next service!"
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>

            <label style={s.label}>
              Weight (higher = more common)
              <input
                style={s.input}
                type="number"
                min={0}
                value={form.weight}
                onChange={(e) =>
                  setForm({ ...form, weight: parseInt(e.target.value) || 0 })
                }
              />
            </label>

            <label style={{ ...s.label, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              Active (show this prize in draws)
            </label>

            {saveMsg && (
              <p style={saveMsg.startsWith("✅") ? s.success : s.error}>
                {saveMsg}
              </p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button type="submit" style={s.btnPrimary} disabled={saving}>
                {saving ? "Saving…" : "Save Prize"}
              </button>
              <button type="button" style={s.btnSecondary} onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 16px",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "32px 28px",
    width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  h1: { fontSize: 22, fontWeight: 800, color: "#1a472a", margin: 0 },
  h2: { fontSize: 17, fontWeight: 700, color: "#333", marginBottom: 12 },
  muted: { color: "#888", fontSize: 13 },
  error: { color: "#c0392b", fontSize: 14, margin: "8px 0" },
  success: { color: "#27ae60", fontSize: 14, margin: "8px 0" },
  statsBanner: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 16,
    background: "#eaf3ea",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 20,
    fontSize: 14,
    color: "#2d6a2d",
  },
  tableWrap: { overflowX: "auto" as const },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 14 },
  th: {
    textAlign: "left" as const,
    padding: "8px 10px",
    borderBottom: "2px solid #e0e0e0",
    color: "#555",
    fontWeight: 600,
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "8px 10px",
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "middle" as const,
  },
  inactiveRow: { opacity: 0.5 },
  formGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
    maxWidth: 480,
  },
  label: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
    fontSize: 14,
    color: "#333",
    fontWeight: 500,
  },
  input: {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  btnPrimary: {
    background: "#1a472a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 20px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  btnSecondary: {
    background: "#e0e0e0",
    color: "#333",
    border: "none",
    borderRadius: 6,
    padding: "10px 20px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  btnSmall: {
    background: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "4px 10px",
    fontSize: 13,
    cursor: "pointer",
  },
  btnDanger: {
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "4px 10px",
    fontSize: 13,
    cursor: "pointer",
  },
  btnGreen: {
    background: "#27ae60",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "4px 8px",
    fontSize: 12,
    cursor: "pointer",
  },
  btnGray: {
    background: "#bbb",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "4px 8px",
    fontSize: 12,
    cursor: "pointer",
  },
};
