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

interface ThemeOption {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  pageBackground: string;
  cardBackground: string;
  titleColor: string;
  buttonBackground: string;
}

interface Stats {
  totalTickets: number;
  uniquePlayers: number;
  byPrize: { prize: string; count: number }[];
}

interface SeasonalPrizeOdds {
  label: string;
  description: string;
  weight: number;
  odds: string;
}

interface SeasonalPrizesData {
  spring: {
    recurring: SeasonalPrizeOdds[];
    onetime: SeasonalPrizeOdds[];
  };
}

interface ContactEntry {
  id: string;
  contact: string;
  serviceType: string;
  outcome: string;
  createdAt: string;
}

interface ContactsData {
  total: number;
  since: string;
  contacts: ContactEntry[];
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
  const [seasonalPrizes, setSeasonalPrizes] = useState<SeasonalPrizesData | null>(null);
  const [contacts, setContacts] = useState<ContactsData | null>(null);
  const [contactSearch, setContactSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Theme state
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [activeTheme, setActiveTheme] = useState("auto");
  const [autoDetected, setAutoDetected] = useState("default");
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeMsg, setThemeMsg] = useState("");

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
        const [prRes, stRes, thRes, spRes, ctRes] = await Promise.all([
          fetch("/api/admin/prizes", {
            headers: { "x-admin-token": t },
          }),
          fetch(`/api/admin/stats?token=${encodeURIComponent(t)}`),
          fetch("/api/admin/theme", {
            headers: { "x-admin-token": t },
          }),
          fetch("/api/admin/seasonal-prizes", {
            headers: { "x-admin-token": t },
          }),
          fetch("/api/admin/contacts", {
            headers: { "x-admin-token": t },
          }),
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
        if (thRes.ok) {
          const thData = await thRes.json();
          setThemes(thData.themes ?? []);
          setActiveTheme(thData.activeTheme ?? "auto");
          setAutoDetected(thData.autoDetected ?? "default");
        }
        if (spRes.ok) setSeasonalPrizes(await spRes.json());
        if (ctRes.ok) setContacts(await ctRes.json());
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

  async function handleSaveTheme() {
    setThemeSaving(true);
    setThemeMsg("");
    const res = await fetch("/api/admin/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ themeId: activeTheme }),
    });
    setThemeSaving(false);
    setThemeMsg(res.ok ? "✅ Theme saved!" : "❌ Failed to save theme.");
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
              <strong>{stats.totalTickets}</strong> total tickets
            </span>
            <span>
              <strong>{stats.uniquePlayers}</strong> unique players
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

        {/* ── Spring Seasonal Prize Odds ─────────────────────────────────── */}
        {seasonalPrizes && (
          <>
            <h2 style={{ ...s.h2, marginTop: 32 }}>
              🌸 Spring Seasonal Prize Odds (March–May)
            </h2>
            <p style={s.muted}>
              During March, April, and May, the standard prize pool is replaced
              by these seasonal prizes. Odds are fixed and determined by the
              weights below.
            </p>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" as const, marginTop: 14 }}>
              {/* Recurring customers */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={s.h3}>🔁 Recurring Service Customers</h3>
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Prize</th>
                        <th style={{ ...s.th, textAlign: "center" as const }}>Weight</th>
                        <th style={{ ...s.th, textAlign: "center" as const }}>Odds</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonalPrizes.spring.recurring.map((p) => (
                        <tr key={p.label}>
                          <td style={s.td}>
                            <div style={{ fontWeight: 600 }}>{p.label}</div>
                            {p.description && (
                              <div style={{ ...s.muted, marginTop: 2 }}>{p.description}</div>
                            )}
                          </td>
                          <td style={{ ...s.td, textAlign: "center" as const }}>{p.weight}</td>
                          <td style={{ ...s.td, textAlign: "center" as const, fontWeight: 700 }}>
                            {p.odds}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* One-time service customers */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={s.h3}>1️⃣ One-Time Service Customers</h3>
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Prize</th>
                        <th style={{ ...s.th, textAlign: "center" as const }}>Weight</th>
                        <th style={{ ...s.th, textAlign: "center" as const }}>Odds</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonalPrizes.spring.onetime.map((p) => (
                        <tr key={p.label}>
                          <td style={s.td}>
                            <div style={{ fontWeight: 600 }}>{p.label}</div>
                            {p.description && (
                              <div style={{ ...s.muted, marginTop: 2 }}>{p.description}</div>
                            )}
                          </td>
                          <td style={{ ...s.td, textAlign: "center" as const }}>{p.weight}</td>
                          <td style={{ ...s.td, textAlign: "center" as const, fontWeight: 700 }}>
                            {p.odds}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

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

        {/* ── Theme Settings ────────────────────────────────────────────── */}
        <h2 style={{ ...s.h2, marginTop: 36 }}>🎨 Theme Settings</h2>
        <p style={s.muted}>
          Choose the ticket theme. <strong>Auto</strong> selects the best theme
          for today&apos;s date (season / holiday). You can override it any time.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14 }}>
          {/* Auto option */}
          <button
            type="button"
            onClick={() => setActiveTheme("auto")}
            style={{
              ...s.themeCard,
              background: activeTheme === "auto" ? "#1a472a" : "#f4f6f8",
              color: activeTheme === "auto" ? "#fff" : "#333",
              border: activeTheme === "auto" ? "2px solid #1a472a" : "2px solid #ddd",
            }}
          >
            <div style={{ fontSize: 22 }}>🗓️</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Auto</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>
              Today: {themes.find((t) => t.id === autoDetected)?.name ?? autoDetected}
            </div>
          </button>

          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTheme(t.id)}
              style={{
                ...s.themeCard,
                background: t.cardBackground,
                border:
                  activeTheme === t.id
                    ? `3px solid ${t.titleColor}`
                    : "2px solid #ddd",
                boxShadow:
                  activeTheme === t.id
                    ? `0 0 0 2px ${t.titleColor}40`
                    : "none",
              }}
            >
              <div
                style={{
                  borderRadius: 6,
                  background: t.pageBackground,
                  height: 28,
                  width: "100%",
                  marginBottom: 6,
                }}
              />
              <div style={{ fontSize: 20 }}>{t.emoji}</div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: t.titleColor,
                  lineHeight: 1.3,
                }}
              >
                {t.name}
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <button
            style={s.btnPrimary}
            onClick={handleSaveTheme}
            disabled={themeSaving}
          >
            {themeSaving ? "Saving…" : "Save Theme"}
          </button>
          {themeMsg && (
            <span
              style={themeMsg.startsWith("✅") ? s.success : s.error}
            >
              {themeMsg}
            </span>
          )}
        </div>

        {/* ── Contact & Player Log ──────────────────────────────────────── */}
        <h2 style={{ ...s.h2, marginTop: 36 }}>📋 Contact &amp; Player Log</h2>
        <p style={s.muted}>
          Every email address and phone number entered over the last 6 months,
          newest first. Phone numbers are stored as digits only (e.g.
          4403383101).
        </p>

        {contacts && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0 10px" }}>
              <input
                style={{ ...s.input, maxWidth: 280, marginBottom: 0 }}
                placeholder="Search contact…"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
              />
              <span style={s.muted}>
                {(() => {
                  const filtered = contacts.contacts.filter((c) =>
                    c.contact.toLowerCase().includes(contactSearch.toLowerCase().trim())
                  );
                  return `${filtered.length} of ${contacts.total} entries`;
                })()}
              </span>
            </div>

            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Contact (email / phone)</th>
                    <th style={s.th}>Service Type</th>
                    <th style={s.th}>Prize Won</th>
                    <th style={{ ...s.th, whiteSpace: "nowrap" as const }}>Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.contacts
                    .filter((c) =>
                      c.contact.toLowerCase().includes(contactSearch.toLowerCase().trim())
                    )
                    .map((c) => (
                      <tr key={c.id}>
                        <td style={{ ...s.td, fontFamily: "monospace", fontSize: 13 }}>
                          {c.contact}
                        </td>
                        <td style={{ ...s.td, whiteSpace: "nowrap" as const }}>
                          {c.serviceType === "recurring"
                            ? "🔁 Recurring"
                            : c.serviceType === "onetime"
                            ? "1️⃣ One-Time"
                            : <em style={s.muted}>—</em>}
                        </td>
                        <td style={s.td}>{c.outcome}</td>
                        <td style={{ ...s.td, whiteSpace: "nowrap" as const, fontSize: 13 }}>
                          {new Date(c.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {contacts.total === 0 && (
              <p style={{ ...s.muted, marginTop: 8 }}>No entries yet.</p>
            )}
          </>
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
  h3: { fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 },
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
  themeCard: {
    borderRadius: 10,
    padding: "10px 10px 8px",
    width: 110,
    cursor: "pointer",
    textAlign: "center" as const,
    fontSize: 13,
    transition: "box-shadow 0.15s",
  },
};
