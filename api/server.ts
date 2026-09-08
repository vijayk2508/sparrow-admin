import express from "express";
import dotenv from "dotenv";
import { handleSync, handleMe, handleUpload, handleAdminDb } from "./routes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3002;

app.use(express.json({ limit: "10mb" }));

// CORS — admin panel (localhost:3001) calls these APIs
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// API Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Sparrow Admin API" });
});

// Auth + admin APIs (Firebase ID-token verified — see routes.ts)
app.post("/api/auth/sync", handleSync);
app.get("/api/me", handleMe);
app.patch("/api/me", handleMe);
app.post("/api/upload", handleUpload);
app.post("/api/admin/db", handleAdminDb);

// Verify required tables exist on startup
async function verifySchema() {
  const { supabaseAdmin } = await import("./supabase");
  const requiredTables = ["users", "admins"];
  const missing: string[] = [];
  let connectionOk = false;
  for (const table of requiredTables) {
    const { error } = await supabaseAdmin.from(table).select("*").limit(1);
    if (error) {
      const msg = error.message || "";
      if (msg.includes("fetch failed") || msg.includes("ECONNREFUSED") || msg.includes("ENOTFOUND")) {
        break; // Connection issue, don't report as missing table
      }
      missing.push(table);
    } else {
      connectionOk = true;
    }
  }
  if (missing.length > 0 && connectionOk) {
    console.error(`\n❌ Missing Supabase tables: ${missing.join(", ")}`);
    console.error("   Run the schema in Supabase SQL Editor: ./supabase/schema.sql");
  } else if (!connectionOk && missing.length > 0) {
    console.error(`\n⚠️  Cannot connect to Supabase — check if project is paused or URL/key is wrong`);
    console.error("   Supabase URL: " + (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "NOT SET"));
  } else {
    console.log("✅ Supabase schema verified (users, admins tables present)");
  }
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Sparrow Admin API running on http://0.0.0.0:${PORT}`);
  verifySchema();
});

export default app;
