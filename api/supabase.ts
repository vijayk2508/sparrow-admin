import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import http from "http";
import https from "https";
import { URL } from "url";

// Load env vars before reading them
dotenv.config();

// ============================================================
// SUPABASE SERVICE-ROLE CLIENT — SERVER ONLY
// Bypasses RLS. Never expose SUPABASE_SERVICE_ROLE_KEY.
// ============================================================

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

console.log(`[supabase] Connecting to: ${supabaseUrl}`);

// Override global fetch to avoid undici fetch issues with localhost
(globalThis as any).fetch = (url: any, init?: any): Promise<Response> => {
  const urlString = typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
  const parsed = new URL(urlString);
  const method = init?.method || url?.method || "GET";

  // Convert Headers object to plain object
  const headers: Record<string, string> = {};
  
  // Extract headers from init.headers (could be Headers object, plain object, or array)
  if (init?.headers) {
    if (typeof init.headers.forEach === "function") {
      // Headers object (Web API)
      init.headers.forEach((value: string, key: string) => {
        headers[key] = value;
      });
    } else if (Array.isArray(init.headers)) {
      // Array of [key, value] pairs
      init.headers.forEach(([key, value]: [string, string]) => {
        headers[key] = value;
      });
    } else {
      // Plain object
      Object.assign(headers, init.headers);
    }
  }

  // Also extract from url.headers if it's a Request object
  if (url?.headers && typeof url.headers.forEach === "function") {
    url.headers.forEach((value: string, key: string) => {
      headers[key] = value;
    });
  }

  console.log(`[fetch] ${method} ${parsed.pathname} - headers:`, Object.keys(headers).join(", "));

  const isHttps = parsed.protocol === "https:";
  const lib = isHttps ? https : http;
  const port = parsed.port || (isHttps ? 443 : 80);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: parsed.hostname,
      port,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };
    const req = lib.request(options, (res: any) => {
      let body = "";
      res.on("data", (chunk: string) => (body += chunk));
      res.on("end", () => {
        // Handle 204 No Content - Response constructor doesn't accept status < 200
        const status = res.statusCode;
        const responseInit: ResponseInit = {
          status: status === 204 ? 200 : status,
          statusText: res.statusMessage || "OK",
          headers: res.headers as any,
        };
        resolve(new Response(status === 204 ? null : body, responseInit));
      });
    });
    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
    if (init?.body) {
      const body = typeof init.body === "string" ? init.body : JSON.stringify(init.body);
      req.write(body);
    }
    req.end();
  });
};

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder-service-role-key",
  { auth: { persistSession: false } }
);

// App-level table allowlist (camelCase API paths → Postgres tables)
const TABLES: Record<string, string> = {
  membershipPlans: "membership_plans",
  contactQueries: "contact_queries",
  siteSettings: "site_settings",
};

export const ALLOWED_TABLES = [
  "coaches",
  "programs",
  "schedule",
  "membershipPlans",
  "testimonials",
  "gallery",
  "events",
  "siteSettings",
  "bookings",
  "payments",
  "memberships",
  "contactQueries",
];

export function tableFor(path: string): string {
  if (!ALLOWED_TABLES.includes(path)) {
    throw new Error(`Table not allowed: ${path}`);
  }
  return TABLES[path] ?? path;
}

// DB stores display order in `sort_order`; app code uses `order`.
export function rowToDoc<T>(row: any): T {
  if (row && Object.prototype.hasOwnProperty.call(row, "sort_order")) {
    const { sort_order, created_at, ...rest } = row;
    return { ...rest, order: sort_order ?? undefined } as T;
  }
  return row as T;
}

export function docToRow(doc: Record<string, any>): Record<string, any> {
  const { order, ...rest } = doc || {};
  const row: Record<string, any> = { ...rest };
  if (order !== undefined && order !== null) row.sort_order = order;
  for (const k of Object.keys(row)) {
    if (row[k] === undefined) delete row[k];
  }
  return row;
}
