import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import cron from "node-cron";
import pRetry from "p-retry";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// --- Environment Variable Validation ---
function validateEnv(): void {
  const required = [
    "DATABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "CHARGILY_API_KEY",
    "CHARGILY_WEBHOOK_SECRET",
    "JWT_SECRET",
  ] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}
validateEnv();

// --- Zod Schemas (server-side validation) ---
const bookingSchema = z.object({
  provider_id: z.string().min(1),
  package_id: z.string().optional(),
  event_date: z.string().min(1),
  event_time: z.string().optional(),
  guest_count: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
});

const paymentSchema = z.object({
  amount: z.number().min(100),
  metadata: z.record(z.string(), z.unknown()).optional(),
  success_url: z.string().url().optional(),
  failure_url: z.string().url().optional(),
});

const profileUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  business_name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  description: z.string().max(2000).optional(),
});

const adminActionSchema = z.object({
  entityId: z.string().min(1),
  entityType: z.string().min(1),
});

const disputeCreateSchema = z.object({
  booking_id: z.string().min(1),
  reason: z.string().min(10).max(2000),
  evidence_urls: z.array(z.string().url()).max(5).optional(),
});

const disputeResolveSchema = z.object({
  dispute_id: z.string().min(1),
  resolution: z.enum(["RESOLVED", "REJECTED"]),
  resolution_note: z.string().max(1000).optional(),
});

const onboardingSchema = z.object({
  business_name: z.string().min(2).max(100),
  category: z.string().min(1),
  cities: z.array(z.string()).min(1),
  description: z.string().max(2000).optional(),
  document_urls: z.array(z.string().url()).optional(),
});

function formatZodErrors(error: z.ZodError): { field: string; message_fr: string; message_ar: string }[] {
  return error.issues.map((e) => ({
    field: e.path.join("."),
    message_fr: `Le champ "${e.path.join(".")}" est invalide: ${e.message}`,
    message_ar: `الحقل "${e.path.join(".")}" غير صالح: ${e.message}`,
  }));
}

// --- Interfaces ---
interface AuthenticatedRequest extends express.Request {
  uid: string;
  email: string;
  userRole: string;
}

interface WebhookEvent {
  type: string;
  id: string;
  data: {
    id: string;
    metadata: { bookingId?: string; idempotencyKey?: string; packageName?: string };
  };
}

interface BudgetResult {
  salle: number;
  traiteur: number;
  media: number;
  decoration: number;
  musique: number;
  buffer?: number;
}

interface FeatureFlags {
  emailReminders: boolean;
  aiOptimization: boolean;
  escrowRelease: boolean;
  prometheus: boolean;
}

// --- Config ---
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const CHARGILY_SECRET_KEY = process.env.CHARGILY_API_KEY || "";
const CHARGILY_WEBHOOK_SECRET = process.env.CHARGILY_WEBHOOK_SECRET || "";
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const SENTRY_DSN = process.env.SENTRY_DSN || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://zakevents.dz";

const flags: FeatureFlags = {
  emailReminders: process.env.FF_EMAIL_REMINDERS === "true",
  aiOptimization: process.env.ENABLE_AI_FEATURES === "true",
  escrowRelease: process.env.FF_ESCROW_RELEASE !== "false",
  prometheus: process.env.FF_PROMETHEUS !== "false",
};

// Supabase service client (server-side, bypasses RLS)
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Sentry (optional)
let Sentry: { init: (opts: Record<string, unknown>) => void; captureException: (e: unknown) => void } | null = null;
if (SENTRY_DSN) {
  import("@sentry/node").then((s) => {
    Sentry = s;
    s.init({ dsn: SENTRY_DSN, environment: process.env.NODE_ENV || "development" });
    logger.info("Sentry initialized");
  }).catch(() => logger.warn("Sentry module not available"));
}

// --- Metrics ---
const metrics = { requests: 0, errors: 0, startTime: Date.now() };

// --- Helpers ---
const ENTITY_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

function sanitizeEntityId(id: string): string | null {
  return ENTITY_ID_REGEX.test(id) ? id : null;
}

async function sendBrevoEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!BREVO_API_KEY) return false;
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "ZAKEVENTS", email: "noreply@zakevents.dz" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    return res.ok;
  } catch (err) {
    logger.error({ err }, "Brevo email failed");
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Request ID correlation
  app.use((req, res, next) => {
    const requestId = (req.headers["x-request-id"] as string) || crypto.randomUUID();
    res.setHeader("X-Request-Id", requestId);
    (req as unknown as Record<string, string>).requestId = requestId;
    next();
  });

  // CORS whitelist
  app.use(cors({
    origin: [FRONTEND_URL, "http://localhost:3000", "http://localhost:5173", "https://pay.chargily.net"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Idempotency-Key", "X-Request-Id"],
  }));

  // CSP nonce
  app.use((_req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
    next();
  });

  // Helmet
  app.use((req, res, next) => {
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", `'nonce-${res.locals.cspNonce}'`, "https://pay.chargily.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.supabase.co"],
          connectSrc: ["'self'", "https://pay.chargily.net", "https://*.supabase.co", "https://generativelanguage.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    })(req, res, next);
  });

  app.set("trust proxy", 1);
  app.use(pinoHttp({ logger, genReqId: (req) => (req as unknown as Record<string, string>).requestId }));

  // Metrics middleware
  app.use((_req, _res, next) => { metrics.requests++; next(); });

  // Raw body for webhook
  app.use("/api/webhooks/chargily", express.raw({ type: "application/json" }));
  app.use(express.json());

  // Rate limiting
  const apiLimiter = rateLimit({ windowMs: 60_000, limit: 100, message: { error: "Trop de requêtes." }, standardHeaders: "draft-7", legacyHeaders: false });
  const authLimiter = rateLimit({ windowMs: 60_000, limit: 20, message: { error: "Trop de tentatives." } });
  app.use("/api/", apiLimiter);
  app.use("/api/auth/", authLimiter);

  // Auth middleware (Supabase JWT verification)
  async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Token manquant" });
    try {
      const token = authHeader.split("Bearer ")[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return res.status(401).json({ error: "Token invalide" });
      const { data: profile } = await supabase.from("users").select("id, role").eq("auth_id", user.id).single();
      (req as unknown as AuthenticatedRequest).uid = profile?.id || user.id;
      (req as unknown as AuthenticatedRequest).email = user.email || "";
      (req as unknown as AuthenticatedRequest).userRole = profile?.role || "CLIENT";
      next();
    } catch { return res.status(401).json({ error: "Token invalide" }); }
  }

  async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    if ((req as unknown as AuthenticatedRequest).userRole !== "ADMIN") return res.status(403).json({ error: "Accès refusé" });
    next();
  }

  // --- Routes ---

  // CSRF token
  const csrfTokens = new Map<string, number>();
  app.get("/api/csrf-token", (_req, res) => {
    const token = crypto.randomBytes(32).toString("hex");
    csrfTokens.set(token, Date.now() + 3600_000);
    res.json({ csrfToken: token });
  });

  function validateCsrf(req: express.Request, res: express.Response, next: express.NextFunction) {
    const token = req.headers["x-csrf-token"] as string;
    if (!token || !csrfTokens.has(token)) return res.status(403).json({ error: "CSRF token invalide" });
    const expiry = csrfTokens.get(token)!;
    if (Date.now() > expiry) { csrfTokens.delete(token); return res.status(403).json({ error: "CSRF token expiré" }); }
    csrfTokens.delete(token);
    next();
  }

  // Health check
  app.get("/api/health", async (_req, res) => {
    let dbOk = false;
    try { const { error } = await supabase.from("feature_flags").select("name").limit(1); dbOk = !error; } catch {}
    let chargilyOk = false;
    try { const r = await fetch("https://pay.chargily.net/test/api/v2/balance", { headers: { Authorization: `Bearer ${CHARGILY_SECRET_KEY}` } }); chargilyOk = r.ok; } catch {}
    res.json({ status: dbOk ? "ok" : "degraded", version: "3.0.0", db: dbOk, chargily: chargilyOk, uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // Prometheus metrics
  app.get("/metrics", (_req, res) => {
    if (!flags.prometheus) return res.status(404).end();
    const uptime = (Date.now() - metrics.startTime) / 1000;
    res.type("text/plain").send(
      `# HELP zakevents_requests_total Total HTTP requests\n# TYPE zakevents_requests_total counter\nzakevents_requests_total ${metrics.requests}\n` +
      `# HELP zakevents_errors_total Total errors\n# TYPE zakevents_errors_total counter\nzakevents_errors_total ${metrics.errors}\n` +
      `# HELP zakevents_uptime_seconds Server uptime\n# TYPE zakevents_uptime_seconds gauge\nzakevents_uptime_seconds ${uptime}\n`
    );
  });

  // Search API
  app.get("/api/search", async (req, res) => {
    const { category, city, q, minRating, maxPrice, onlyVerified } = req.query;
    try {
      let query = supabase.from("providers").select("*").eq("status", "APPROVED").is("deleted_at", null);

      if (category && String(category).length > 0) {
        const cats = String(category).split(",").filter(Boolean);
        if (cats.length > 0 && cats.length <= 10) query = query.in("category", cats);
      }
      if (city && String(city).length > 0) {
        const cities = String(city).split(",").filter(Boolean);
        if (cities.length === 1) query = query.contains("cities", [cities[0]]);
      }
      if (minRating && Number(minRating) > 0) query = query.gte("rating_average", Number(minRating));
      if (maxPrice && Number(maxPrice) < 2000000) query = query.lte("min_price", Number(maxPrice));
      if (onlyVerified === "true") query = query.eq("is_premium", true);

      const { data, error } = await query.order("rating_average", { ascending: false }).limit(50);
      if (error) throw error;

      let results = data || [];
      if (q && String(q).length > 0) {
        const term = String(q).toLowerCase();
        results = results.filter((r) => r.business_name?.toLowerCase().includes(term) || r.category?.toLowerCase().includes(term));
      }

      res.json({ results });
    } catch (err) {
      logger.error({ err }, "Search failed");
      metrics.errors++;
      res.status(500).json({ error: "Erreur de recherche" });
    }
  });

  // Get single provider
  app.get("/api/providers/:id", async (req, res) => {
    const id = sanitizeEntityId(req.params.id);
    if (!id) return res.status(400).json({ error: "ID invalide" });
    try {
      const { data, error } = await supabase.from("providers").select("*").eq("id", id).is("deleted_at", null).single();
      if (error || !data) return res.status(404).json({ error: "Prestataire introuvable" });
      const { data: packages } = await supabase.from("service_packages").select("*").eq("provider_id", id).eq("is_active", true);
      res.json({ provider: data, packages: packages || [] });
    } catch { res.status(500).json({ error: "Erreur serveur" }); }
  });

  // Create booking
  app.post("/api/bookings", requireAuth, async (req, res) => {
    const parsed = bookingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation échouée", details: formatZodErrors(parsed.error) });
    const { provider_id, package_id, event_date, event_time, guest_count, notes } = parsed.data;
    const uid = (req as unknown as AuthenticatedRequest).uid;
    try {
      const { data: provider } = await supabase.from("providers").select("min_price").eq("id", provider_id).single();
      const basePrice = provider?.min_price || 0;
      const commission = basePrice * 0.1;
      const { data, error } = await supabase.from("bookings").insert({
        client_id: uid, provider_id, package_id: package_id || null,
        event_date, event_time: event_time || null, guest_count: guest_count || null,
        total_amount: basePrice + commission, commission_amount: commission,
        status: "PENDING", payment_status: "NONE", notes: notes || null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (err) { logger.error({ err }, "Booking creation failed"); res.status(500).json({ error: "Échec de la réservation" }); }
  });

  // TODO: MVP-2 — AI budget optimization will integrate Gemini API
  // MVP-1: Returns static allocation percentages (40% venue, 25% catering, etc.)
  // Do not remove — placeholder for post-launch enhancement
  app.post("/api/ai/optimize-budget", requireAuth, async (req, res) => {
    if (!flags.aiOptimization) return res.status(503).json({ error: "Fonctionnalité désactivée" });
    const { totalBudget, guests, category } = req.body;
    if (!totalBudget || !guests || !category) return res.status(400).json({ error: "Paramètres manquants" });

    const fallback: BudgetResult = {
      salle: totalBudget * 0.40, traiteur: totalBudget * 0.25,
      media: totalBudget * 0.15, decoration: totalBudget * 0.10, musique: totalBudget * 0.05,
      buffer: totalBudget * 0.05,
    };
    res.json(fallback);
  });

  // Soft Delete
  app.post("/api/admin/soft-delete", requireAuth, requireAdmin, async (req, res) => {
    const parsed = adminActionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation échouée", details: formatZodErrors(parsed.error) });
    const { entityId, entityType } = parsed.data;
    const sanitizedId = sanitizeEntityId(entityId);
    if (!sanitizedId) return res.status(400).json({ error: "ID invalide" });

    const validTables = ["providers", "bookings", "users", "service_packages"];
    if (!validTables.includes(entityType)) return res.status(400).json({ error: "Type d'entité invalide" });

    try {
      const { error } = await supabase.from(entityType).update({ deleted_at: new Date().toISOString(), status: "DELETED" }).eq("id", sanitizedId);
      if (error) throw error;

      await supabase.from("audit_log").insert({ actor_id: (req as unknown as AuthenticatedRequest).uid, action: "soft_delete", entity_type: entityType, entity_id: sanitizedId });
      res.json({ success: true });
    } catch (err) {
      logger.error({ err, entityId: sanitizedId, entityType }, "Soft delete failed");
      metrics.errors++;
      res.status(500).json({ error: "Échec de la suppression" });
    }
  });

  // Payment: Create Checkout
  app.post("/api/payments/create-checkout", requireAuth, async (req, res) => {
    const parsed = paymentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation échouée", details: formatZodErrors(parsed.error) });
    const { amount, metadata, success_url, failure_url } = parsed.data;
    const idempotencyKey = req.headers["x-idempotency-key"] as string;

    if (!CHARGILY_SECRET_KEY) return res.status(503).json({ error: "Service de paiement non configuré" });

    // Check idempotency
    if (idempotencyKey) {
      const { data: existing } = await supabase.from("idempotency_keys").select("response").eq("key", idempotencyKey).single();
      if (existing) return res.json(existing.response);
    }

    const runPayment = async () => {
      const response = await fetch("https://pay.chargily.net/test/api/v2/checkouts", {
        method: "POST",
        headers: { Authorization: `Bearer ${CHARGILY_SECRET_KEY}`, "Content-Type": "application/json", ...(idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : {}) },
        body: JSON.stringify({ amount, currency: "dzd", success_url: success_url || `${FRONTEND_URL}/payment-success`, failure_url: failure_url || `${FRONTEND_URL}/payment-failure`, metadata: { ...metadata, idempotencyKey } }),
      });
      if (!response.ok) throw new Error(`Chargily error: ${response.status}`);
      return response.json();
    };

    try {
      const result = await pRetry(runPayment, { retries: 3 });
      if (idempotencyKey) await supabase.from("idempotency_keys").insert({ key: idempotencyKey, response: result });
      res.json(result);
    } catch (err) {
      logger.error({ err }, "Chargily checkout failed");
      metrics.errors++;
      Sentry?.captureException(err);
      res.status(500).json({ error: "Service momentanément indisponible" });
    }
  });

  // Webhook: Chargily (transactional update)
  app.post("/api/webhooks/chargily", (req, res) => {
    const signature = req.headers["chargily-signature"] as string;
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));

    if (!signature || !CHARGILY_WEBHOOK_SECRET) return res.status(401).json({ error: "Signature manquante" });

    const expected = crypto.createHmac("sha256", CHARGILY_WEBHOOK_SECRET).update(body).digest("hex");
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      logger.warn("Invalid webhook signature");
      return res.status(401).json({ error: "Signature invalide" });
    }

    const event: WebhookEvent = JSON.parse(body.toString());
    logger.info({ type: event.type, id: event.id }, "Webhook verified");

    // Transactional update via RPC
    if (event.data?.metadata?.bookingId) {
      const bookingId = sanitizeEntityId(event.data.metadata.bookingId);
      if (bookingId) {
        supabase.rpc("update_booking_payment", {
          p_booking_id: bookingId,
          p_payment_status: event.type === "checkout.paid" ? "HELD" : "FAILED",
          p_transaction_id: event.data.id || "",
        }).then(({ error }) => { if (error) { logger.error({ error }, "Webhook DB update failed"); metrics.errors++; } });
      }
    }

    res.status(200).json({ received: true });
  });

  // Disputes: Create
  app.post("/api/disputes/create", requireAuth, async (req, res) => {
    const parsed = disputeCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation échouée", details: formatZodErrors(parsed.error) });
    const { booking_id, reason, evidence_urls } = parsed.data;
    const uid = (req as unknown as AuthenticatedRequest).uid;
    try {
      const { data: booking } = await supabase.from("bookings").select("client_id, provider_id").eq("id", booking_id).single();
      if (!booking) return res.status(404).json({ error: "Réservation introuvable" });
      const { data, error } = await supabase.from("disputes").insert({
        booking_id, client_id: booking.client_id, provider_id: booking.provider_id,
        filed_by: uid, reason, evidence_urls: evidence_urls || [], status: "PENDING",
        created_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (err) { logger.error({ err }, "Dispute creation failed"); res.status(500).json({ error: "Échec de la création du litige" }); }
  });

  // Disputes: Resolve (admin)
  app.post("/api/disputes/resolve", requireAuth, requireAdmin, async (req, res) => {
    const parsed = disputeResolveSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation échouée", details: formatZodErrors(parsed.error) });
    const { dispute_id, resolution, resolution_note } = parsed.data;
    try {
      const { data: dispute, error: fetchErr } = await supabase.from("disputes").select("*").eq("id", dispute_id).single();
      if (fetchErr || !dispute) return res.status(404).json({ error: "Litige introuvable" });
      const { error } = await supabase.from("disputes").update({ status: resolution, resolution: resolution_note || "", resolved_at: new Date().toISOString() }).eq("id", dispute_id);
      if (error) throw error;
      const newBookingStatus = resolution === "RESOLVED" ? "CANCELLED" : "CONFIRMED";
      await supabase.from("bookings").update({ status: newBookingStatus, updated_at: new Date().toISOString() }).eq("id", dispute.booking_id);
      // Notify both parties
      const notif = { type: "dispute_resolved", is_read: false, created_at: new Date().toISOString(), metadata: { dispute_id, resolution } };
      await supabase.from("notifications").insert([
        { ...notif, user_id: dispute.client_id, title: "Litige résolu", body: resolution_note || "" },
        { ...notif, user_id: dispute.provider_id, title: "Litige résolu", body: resolution_note || "" },
      ]);
      res.json({ success: true });
    } catch (err) { logger.error({ err }, "Dispute resolution failed"); res.status(500).json({ error: "Échec de la résolution" }); }
  });

  // Disputes: List (admin)
  app.get("/api/disputes", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const { data, error } = await supabase.from("disputes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      res.json({ disputes: data || [] });
    } catch { res.status(500).json({ error: "Erreur serveur" }); }
  });

  // Onboarding: Complete
  app.post("/api/providers/onboarding/complete", requireAuth, async (req, res) => {
    const parsed = onboardingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation échouée", details: formatZodErrors(parsed.error) });
    const { business_name, category, cities, description, document_urls } = parsed.data;
    const uid = (req as unknown as AuthenticatedRequest).uid;
    try {
      const { data, error } = await supabase.from("providers").insert({
        user_id: uid, business_name, category, cities, description: description || "",
        document_urls: document_urls || [], status: "PENDING", min_price: 0,
        rating_average: 0, review_count: 0, is_premium: false, response_time_hours: 24,
        portfolio_urls: [], created_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (err) { logger.error({ err }, "Onboarding failed"); res.status(500).json({ error: "Échec de l'inscription" }); }
  });

  // Profile: Update
  app.put("/api/profile/update", requireAuth, async (req, res) => {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation échouée", details: formatZodErrors(parsed.error) });
    const uid = (req as unknown as AuthenticatedRequest).uid;
    try {
      const { error } = await supabase.from("users").update({ ...parsed.data, updated_at: new Date().toISOString() }).eq("id", uid);
      if (error) throw error;
      res.json({ success: true });
    } catch (err) { logger.error({ err }, "Profile update failed"); res.status(500).json({ error: "Échec de la mise à jour" }); }
  });

  // SEO
  app.get("/robots.txt", (_req, res) => { res.type("text/plain").send("User-agent: *\nAllow: /\nSitemap: https://zakevents.dz/sitemap.xml"); });
  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://zakevents.dz/</loc><changefreq>daily</changefreq></url><url><loc>https://zakevents.dz/search</loc><changefreq>daily</changefreq></url><url><loc>https://zakevents.dz/calculator</loc></url><url><loc>https://zakevents.dz/classements</loc></url><url><loc>https://zakevents.dz/inspiration</loc></url></urlset>`);
  });

  // Cron: Escrow release
  cron.schedule("0 0 * * *", async () => {
    if (!flags.escrowRelease) return;
    logger.info("CRON: Releasing escrows...");
    try {
      const cutoff = new Date(Date.now() - 48 * 3600_000).toISOString();
      const { data: bookings } = await supabase.from("bookings").select("id").eq("status", "COMPLETED").eq("payment_status", "HELD").lt("event_date", cutoff);
      for (const b of bookings || []) {
        await supabase.from("bookings").update({ payment_status: "RELEASED", updated_at: new Date().toISOString() }).eq("id", b.id);
        logger.info({ bookingId: b.id }, "Escrow released");
      }
    } catch (err) { logger.error({ err }, "Escrow cron failed"); Sentry?.captureException(err); }
  });

  // Cron: Event reminders with email
  cron.schedule("0 9 * * *", async () => {
    if (!flags.emailReminders) return;
    logger.info("CRON: Sending reminders...");
    try {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];
      const { data: bookings } = await supabase.from("bookings").select("id, client_id, provider_id, event_date").eq("status", "CONFIRMED").eq("event_date", dateStr);
      for (const b of bookings || []) {
        const { data: client } = await supabase.from("users").select("email, full_name").eq("id", b.client_id).single();
        if (client?.email) {
          await sendBrevoEmail(client.email, "Rappel: Votre événement est demain!", `<p>Bonjour ${client.full_name},</p><p>Votre événement est prévu pour demain (${b.event_date}). Tout est prêt!</p><p>— ZAKEVENTS</p>`);
        }
      }
    } catch (err) { logger.error({ err }, "Reminder cron failed"); }
  });

  // Vite / Static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      const fs = require("fs");
      const html = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
      res.send(html.replace(/<script/g, `<script nonce="${res.locals.cspNonce}"`));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => logger.info(`Server on http://0.0.0.0:${PORT}`));

  // Graceful shutdown
  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
