import express from "express";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON request body
app.use(express.json());

// Meta Credentials from environment or provided fallback
const META_PIXEL_ID = process.env.META_PIXEL_ID || "1531474608383640";
const META_CAPI_TOKEN = process.env.META_CAPI_TOKEN || "EAASXB6whuN8BSDXR9zhJdLqW77SBlVs9NpQaPTTLNcdPxuq3A7nXQGJjqPtveZA5k17yT5G1pULLDFDymnG2DrXcg99JZCR7c7rbYfBuh58ab51VZCnqZB0JvyWtSREEcPMSVL1lT25dY6LC029azIt691Rc1pPYY4OMWFniFl2Jj6foDOYet3iDFVYDD0GW7QZDZD";

/**
 * SHA256 helper for Meta Conversions API
 */
function sha256(value: string | undefined | null): string {
  if (!value) return "";
  const cleaned = value.trim().toLowerCase();
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

/**
 * Normalizes and hashes phone numbers according to Meta CAPI specification
 */
function hashPhone(value: string | undefined | null): string {
  if (!value) return "";
  // Keep only digits
  let digits = value.replace(/\D/g, "");
  // If it doesn't have a country code, prepend '55' (Brazil)
  if (digits.length >= 10 && !digits.startsWith("55")) {
    digits = "55" + digits;
  }
  return crypto.createHash("sha256").update(digits).digest("hex");
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
});

// Meta Conversions API Proxy Endpoint
app.post("/api/meta-events", async (req, res) => {
  try {
    const { event_name, event_id, event_source_url, user_data = {}, custom_data = {} } = req.body;

    if (!event_name) {
      return res.status(400).json({ error: "Missing event_name parameter" });
    }

    // Capture client IP and User Agent server-side for maximum accuracy
    const client_ip_address = 
      (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || 
      req.socket.remoteAddress || 
      "";
    const client_user_agent = req.headers["user-agent"] || "";

    // Prepare hashed user data
    const payloadUserData: Record<string, any> = {
      client_ip_address,
      client_user_agent,
    };

    if (user_data.email) {
      payloadUserData.em = [sha256(user_data.email)];
    }
    if (user_data.phone) {
      payloadUserData.ph = [hashPhone(user_data.phone)];
    }
    if (user_data.name) {
      // Split name to first name and last name
      const nameParts = user_data.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      
      if (firstName) {
        payloadUserData.fn = [sha256(firstName)];
      }
      if (lastName) {
        payloadUserData.ln = [sha256(lastName)];
      }
    }

    // Build the Meta Conversions API event object
    const eventObject = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_id: event_id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event_source_url: event_source_url || "",
      user_data: payloadUserData,
      custom_data: {
        currency: custom_data.currency || "BRL",
        value: custom_data.value ? parseFloat(custom_data.value) : undefined,
        ...custom_data
      }
    };

    const capiUrl = `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events`;

    const requestBody = {
      data: [eventObject],
      access_token: META_CAPI_TOKEN
    };

    console.log(`[CAPI] Dispatching event: "${event_name}" (Event ID: ${eventObject.event_id}) to Meta`);

    const response = await fetch(capiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json() as any;

    if (!response.ok) {
      console.error("[CAPI] Meta API returned an error:", result);
      return res.status(response.status).json({ success: false, error: result });
    }

    console.log(`[CAPI] Event "${event_name}" successfully delivered to Meta`);
    return res.json({ success: true, event_id: eventObject.event_id, result });
  } catch (err: any) {
    console.error("[CAPI] Failed to proxy Meta event:", err);
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
});

// Setup Vite Dev Server / Static Asset Hosting
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode: Use Vite Dev Server Middleware
    console.log("[Server] Booting in Development Mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode: Serve Compiled SPA from /dist
    console.log("[Server] Booting in Production Mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Express running at http://localhost:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("[Server] Boot failed:", err);
  process.exit(1);
});
