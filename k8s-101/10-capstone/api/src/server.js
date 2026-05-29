// Tiny Express API for the capstone.
//
// Endpoints:
//   GET /healthz   → 200 ok            (used by liveness + readiness probes)
//   GET /api/time  → JSON {time, pod}  (queries Postgres + reports hostname)
//
// Everything is read from env vars — never hard-code config.
import express from "express";
import pg from "pg";

const PORT       = parseInt(process.env.PORT || "8080", 10);
const PGHOST     = process.env.PGHOST     || "db";
const PGPORT     = parseInt(process.env.PGPORT || "5432", 10);
const PGUSER     = process.env.PGUSER     || "app";
const PGPASSWORD = process.env.PGPASSWORD || "app";
const PGDATABASE = process.env.PGDATABASE || "app";
const POD_NAME   = process.env.HOSTNAME   || "unknown";

// A single shared pool — pg recommends this over per-request clients.
const pool = new pg.Pool({
  host: PGHOST,
  port: PGPORT,
  user: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
  max: 5,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => {
  // Don't crash on transient connection errors — log and continue.
  console.error("pg pool error:", err.message);
});

const app = express();

// liveness/readiness — fast, no DB call.
// Probes that hit the DB couple your pod's health to the DB's health,
// which causes cascading restarts. Don't do it.
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// Actual business endpoint.
app.get("/api/time", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW() AS now");
    res.json({
      time: rows[0].now,
      pod: POD_NAME,
      message: "served by the api pod above",
    });
  } catch (err) {
    console.error("DB error:", err.message);
    res.status(500).json({ error: "db_unavailable", detail: err.message });
  }
});

// Catch-all under /api for clarity in browser/curl debugging
app.get("/api", (_req, res) => {
  res.json({ ok: true, hint: "try /api/time" });
});

app.listen(PORT, () => {
  console.log(`api listening on :${PORT} (pod=${POD_NAME})`);
  console.log(`db target: ${PGUSER}@${PGHOST}:${PGPORT}/${PGDATABASE}`);
});

// Graceful shutdown — important in K8s; otherwise the pod hangs on SIGTERM.
function shutdown(signal) {
  console.log(`received ${signal}, draining...`);
  pool.end().finally(() => process.exit(0));
  // Force-exit after 10s if pool drain hangs
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
