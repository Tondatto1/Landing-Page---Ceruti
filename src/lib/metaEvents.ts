/**
 * Meta Pixel & Conversions API Tracking Utility
 * Handles browser pixel tracking & server-side Conversions API tracking
 * with event deduplication.
 */

// Declare global fbq interface for window to prevent TS errors
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

interface UserData {
  email?: string;
  phone?: string;
  name?: string;
}

interface CustomData {
  currency?: string;
  value?: number;
  [key: string]: any;
}

/**
 * Generates a unique event ID for deduplication
 */
function generateEventId(prefix: string = "evt"): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 11);
  return `${prefix}_${timestamp}_${randomPart}`;
}

/**
 * Main tracking function that sends the event to Meta Pixel (client) and Meta Conversions API (server proxy)
 * 
 * @param eventName The Standard or Custom Meta Event Name (e.g. 'InitiateCheckout', 'Purchase', 'Lead', etc.)
 * @param userData Private user info (not hashed on client; the server will securely format & hash this)
 * @param customData Metadata about the event (value, currency, etc.)
 */
export async function trackMetaEvent(
  eventName: string,
  userData: UserData = {},
  customData: CustomData = {}
): Promise<string> {
  const eventId = generateEventId(eventName.toLowerCase());
  const eventSourceUrl = window.location.href;

  // 1. Client-Side Browser Pixel Tracking
  try {
    if (typeof window !== "undefined" && window.fbq) {
      console.log(`[Meta Pixel] Tracking client-side: "${eventName}"`, customData);
      window.fbq("track", eventName, customData, { eventID: eventId });
    } else {
      console.warn(`[Meta Pixel] Browser fbq function not found. Event "${eventName}" not tracked on client-side.`);
    }
  } catch (err) {
    console.error("[Meta Pixel] Error tracking client-side event:", err);
  }

  // 2. Server-Side Conversions API (CAPI) Proxy Tracking
  try {
    console.log(`[Meta CAPI] Dispatching server-side event: "${eventName}"`, { eventId, userData, customData });
    
    const response = await fetch("/api/meta-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: eventSourceUrl,
        user_data: userData,
        custom_data: customData
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      console.error(`[Meta CAPI] Server proxy returned error for "${eventName}":`, data);
    } else {
      console.log(`[Meta CAPI] Event "${eventName}" successfully proxied via server (Event ID: ${eventId})`);
    }
  } catch (err) {
    console.error(`[Meta CAPI] Network or code error dispatching event "${eventName}":`, err);
  }

  return eventId;
}

/**
 * Tracks the InitiateCheckout event
 */
export function trackInitiateCheckout(userData: UserData = {}, customData: CustomData = {}): Promise<string> {
  return trackMetaEvent("InitiateCheckout", userData, customData);
}

/**
 * Tracks the Purchase event
 */
export function trackPurchase(userData: UserData = {}, customData: CustomData = {}): Promise<string> {
  return trackMetaEvent("Purchase", userData, customData);
}

/**
 * Tracks a custom Lead / Contact event
 */
export function trackLead(userData: UserData = {}, customData: CustomData = {}): Promise<string> {
  return trackMetaEvent("Lead", userData, customData);
}
