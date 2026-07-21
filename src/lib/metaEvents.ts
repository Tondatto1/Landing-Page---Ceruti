/**
 * Meta Pixel & Conversions API Tracking Utility
 * Implements Meta's recommended best practices:
 * 1. Redundant Tracking (Pixel + Conversions API)
 * 2. Proper Event Deduplication using matching event_id
 * 3. Advanced Matching (Hashed customer data)
 */

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
}

interface CustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_type?: string;
  num_items?: number;
  [key: string]: any;
}

/**
 * Gets a cookie value by name
 */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

/**
 * Generates a unique Event ID for deduplication
 */
export function generateEventId(eventName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `evt_${eventName.toLowerCase()}_${timestamp}_${random}`;
}

/**
 * Unified dispatch helper to track with both Pixel and Conversions API
 */
async function dispatchMetaEvent(
  eventName: string,
  userData: UserData = {},
  customData: CustomData = {}
) {
  const eventId = generateEventId(eventName);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // 1. Client-side Track (Meta Pixel)
  if (typeof window !== "undefined" && (window as any).fbq) {
    console.log(`[Meta Pixel] Tracking "${eventName}" (Event ID: ${eventId})`, customData);
    (window as any).fbq("track", eventName, customData, { eventID: eventId });
  } else {
    console.warn(`[Meta Pixel] fbq not available for "${eventName}". Make sure Pixel is initialized.`);
  }

  // 2. Server-side Track (Conversions API via local server proxy)
  try {
    const fbp = getCookie("_fbp");
    const fbc = getCookie("_fbc");

    const payload = {
      event_name: eventName,
      event_id: eventId,
      event_source_url: currentUrl,
      user_data: {
        email: userData.email,
        phone: userData.phone,
        name: userData.name,
        fbp,
        fbc,
      },
      custom_data: customData,
    };

    console.log(`[Meta CAPI] Dispatching server event: "${eventName}"`, payload);

    const response = await fetch("/api/meta-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[Meta CAPI] Proxy returned error for "${eventName}":`, data);
    } else {
      console.log(`[Meta CAPI] Event "${eventName}" successfully proxied to server.`);
    }
  } catch (err) {
    console.error(`[Meta CAPI] Network error dispatching event "${eventName}":`, err);
  }

  return eventId;
}

/**
 * Standard Events
 */

export async function trackPageView(customData: CustomData = {}) {
  return dispatchMetaEvent("PageView", {}, customData);
}

export async function trackLead(userData: UserData, customData: CustomData = {}) {
  return dispatchMetaEvent("Lead", userData, customData);
}

export async function trackInitiateCheckout(userData: UserData, customData: CustomData = {}) {
  return dispatchMetaEvent("InitiateCheckout", userData, customData);
}

export async function trackPurchase(userData: UserData, customData: CustomData = {}) {
  return dispatchMetaEvent("Purchase", userData, customData);
}
