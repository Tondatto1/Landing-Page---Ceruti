/**
 * Meta Pixel & Conversions API Tracking Helper
 * Implements Meta's recommended Redundant (Dual) Tracking with Event Deduplication
 */

// Simple UUID generator fallback
function generateUUID(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    try {
      return window.crypto.randomUUID();
    } catch {
      // Fallback
    }
  }
  return Math.random().toString(36).substring(2, 15) + "-" + Math.random().toString(36).substring(2, 15);
}

export interface TrackingUserData {
  email?: string;
  phone?: string;
  name?: string;
}

/**
 * Sends a tracking event both client-side (via Meta Pixel fbq) and server-side (via Conversions API)
 * with a matching eventID for deduplication.
 */
export async function trackMetaEvent(
  eventName: string,
  customData: Record<string, any> = {},
  userData: TrackingUserData = {}
) {
  const eventId = generateUUID();
  const eventUrl = typeof window !== "undefined" ? window.location.href : "";

  // 1. Trigger Client-Side Pixel if defined
  if (typeof window !== "undefined") {
    const fbq = (window as any).fbq;
    if (typeof fbq === "function") {
      try {
        fbq("track", eventName, customData, { eventID: eventId });
        console.log(`[Meta Pixel] Tracked "${eventName}" with ID: ${eventId}`);
      } catch (err) {
        console.error("[Meta Pixel Error]", err);
      }
    } else {
      console.warn(`[Meta Pixel] Not loaded yet. Could not track "${eventName}" on client.`);
    }
  }

  // 2. Trigger Server-Side Conversions API
  try {
    const response = await fetch("/api/meta-conversions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName,
        eventUrl,
        eventId,
        userData,
        customData,
      }),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.warn(`[Meta CAPI Proxy Warning] Failed to proxy "${eventName}" to server: ${errorMsg}`);
    } else {
      console.log(`[Meta CAPI Proxy] Successfully proxied "${eventName}" to Conversions API.`);
    }
  } catch (err) {
    console.error(`[Meta CAPI Proxy Error] Error sending event "${eventName}":`, err);
  }
}
