const API_KEY = process.env.CREEM_API_KEY || "creem_test_3YZDFbpxRUgNnOp6vFxGhj";
const TEST_MODE = process.env.NEXT_PUBLIC_CREEM_TEST_MODE !== "false";
const BASE_URL = TEST_MODE
  ? "https://test-api.creem.io/v1"
  : "https://api.creem.io/v1";

export interface CreemCheckout {
  id: string;
  checkout_url: string;
  status: string;
}

export interface CreemProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Creem API error (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function createCheckout(productId: string, requestId: string, successUrl: string, email?: string) {
  return request<CreemCheckout>("POST", "/checkouts", {
    product_id: productId,
    request_id: requestId,
    success_url: successUrl,
    customer: email ? { email } : undefined,
  });
}

export interface CreemCheckoutDetails {
  id: string;
  customer?: { id: string; email?: string; name?: string };
  status: string;
  product_id?: string;
  subscription_id?: string;
}

export async function getCheckout(checkoutId: string): Promise<CreemCheckoutDetails | null> {
  try {
    return await request<CreemCheckoutDetails>("GET", `/checkouts/${checkoutId}`);
  } catch {
    try {
      return await request<CreemCheckoutDetails>("GET", `/checkouts?id=${checkoutId}`);
    } catch {
      return null;
    }
  }
}

export async function createCustomerPortal(customerId: string, returnUrl: string) {
  return request<{ portal_url: string }>("POST", "/customer-portal", {
    customer_id: customerId,
    return_url: returnUrl,
  });
}

export async function createProduct(name: string, description: string, price: number) {
  return request<CreemProduct>("POST", "/products", {
    name,
    description,
    price,
    currency: "USD",
    billing_type: "recurring",
    billing_period: "every-year",
    tax_mode: "inclusive",
  });
}
