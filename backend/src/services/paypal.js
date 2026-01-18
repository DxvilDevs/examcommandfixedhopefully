const baseUrl = (mode) =>
  mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

export async function getPayPalAccessToken() {
  const mode = process.env.PAYPAL_MODE || "sandbox";
  const url = `${baseUrl(mode)}/v1/oauth2/token`;

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal token error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function getSubscriptionDetails(subscriptionId) {
  const mode = process.env.PAYPAL_MODE || "sandbox";
  const token = await getPayPalAccessToken();

  const res = await fetch(`${baseUrl(mode)}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!res.ok) {
    throw new Error(`PayPal subscription lookup failed: ${res.status} ${text}`);
  }

  return data;
}
