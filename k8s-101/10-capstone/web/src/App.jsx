import { useEffect, useState } from "react";

const styles = {
  page: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    background: "#0d1117",
    color: "#e6edf3",
    minHeight: "100vh",
    padding: "60px 24px",
    margin: 0,
  },
  container: {
    maxWidth: 720,
    margin: "0 auto",
  },
  h1: {
    fontSize: 36,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  sub: {
    color: "#8b949e",
    marginTop: 8,
    marginBottom: 32,
  },
  card: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 10,
    padding: 24,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    letterSpacing: "0.12em",
    color: "#6e7681",
    textTransform: "uppercase",
    margin: 0,
  },
  value: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 16,
    color: "#79c0ff",
    margin: "6px 0 0",
    wordBreak: "break-all",
  },
  err: { color: "#ff7b72" },
  button: {
    background: "transparent",
    color: "#7ee787",
    border: "1px solid #7ee787",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 14,
  },
  log: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 12,
    color: "#8b949e",
    background: "#010409",
    border: "1px solid #21262d",
    borderRadius: 6,
    padding: 12,
    marginTop: 16,
    maxHeight: 200,
    overflowY: "auto",
    whiteSpace: "pre-wrap",
  },
};

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchTime() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/time");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setData(j);
      setHistory((h) => [`${new Date().toLocaleTimeString()}  pod=${j.pod}`, ...h].slice(0, 20));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTime();
    const id = setInterval(fetchTime, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>K8s 101 — Capstone</h1>
        <p style={styles.sub}>
          React frontend → Ingress → API → Postgres. All running on your
          local kind cluster. Refreshing every 3 seconds.
        </p>

        <div style={styles.card}>
          <p style={styles.label}>DB time</p>
          <p style={styles.value}>{data ? data.time : loading ? "loading…" : "—"}</p>
        </div>

        <div style={styles.card}>
          <p style={styles.label}>Served by pod</p>
          <p style={styles.value}>{data ? data.pod : "—"}</p>
        </div>

        {error && (
          <div style={{ ...styles.card, borderColor: "#ff7b72" }}>
            <p style={{ ...styles.label, color: "#ff7b72" }}>Error</p>
            <p style={{ ...styles.value, ...styles.err }}>{error}</p>
          </div>
        )}

        <button style={styles.button} onClick={fetchTime} disabled={loading}>
          {loading ? "..." : "Refresh now"}
        </button>

        <div style={styles.log}>{history.join("\n") || "// history will appear here"}</div>
      </div>
    </div>
  );
}
