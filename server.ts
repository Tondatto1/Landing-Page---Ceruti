import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Meta API Credentials
const META_PIXEL_ID = process.env.META_PIXEL_ID || "1531474608383640";
const META_API_TOKEN = process.env.META_API_TOKEN || "EAASXB6whuN8BSDXR9zhJdLqW77SBlVs9NpQaPTTLNcdPxuq3A7nXQGJjqPtveZA5k17yT5G1pULLDFDymnG2DrXcg99JZCR7c7rbYfBuh58ab51VZCnqZB0JvyWtSREEcPMSVL1lT25dY6LC029azIt691Rc1pPYY4OMWFniFl2Jj6foDOYet3iDFVYDD0GW7QZDZD";

// SHA-256 Hashing helper
function sha256(value: string | undefined | null): string | null {
  if (!value) return null;
  const clean = value.trim().toLowerCase();
  return crypto.createHash("sha256").update(clean).digest("hex");
}

// Clean phone number to E.164 digits for Meta matching
function cleanPhone(value: string | undefined | null): string | null {
  if (!value) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }
  return digits;
}

// Meta Conversions API Route
app.post("/api/meta-conversions", async (req, res) => {
  try {
    const { eventName, eventUrl, eventId, userData, customData } = req.body;

    if (!eventName || !eventId) {
      return res.status(400).json({ error: "Missing eventName or eventId" });
    }

    const clientIpAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const clientIpStr = Array.isArray(clientIpAddress) ? clientIpAddress[0] : clientIpAddress.split(",")[0].trim();
    const clientUserAgent = req.headers["user-agent"] || "";

    const metaUserData: Record<string, any> = {
      client_ip_address: clientIpStr,
      client_user_agent: clientUserAgent,
    };

    if (userData) {
      if (userData.email) {
        metaUserData.em = sha256(userData.email);
      }
      if (userData.phone) {
        const cleaned = cleanPhone(userData.phone);
        if (cleaned) {
          metaUserData.ph = sha256(cleaned);
        }
      }
      if (userData.name) {
        const parts = userData.name.trim().split(/\s+/);
        if (parts[0]) {
          metaUserData.fn = sha256(parts[0]);
        }
        if (parts.length > 1) {
          metaUserData.ln = sha256(parts[parts.length - 1]);
        }
      }
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: eventUrl || req.headers.referer || "",
          action_source: "website",
          user_data: metaUserData,
          custom_data: customData || {},
        },
      ],
    };

    const targetUrl = `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_API_TOKEN}`;

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(`[Meta CAPI] Event "${eventName}" sent. Status: ${response.status}`, JSON.stringify(result));

    return res.status(response.status).json(result);
  } catch (error: any) {
    console.error("[Meta CAPI ERROR]", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
