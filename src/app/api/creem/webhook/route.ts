import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET ?? "";
const SKIP_VERIFICATION = !WEBHOOK_SECRET || process.env.NEXT_PUBLIC_CREEM_TEST_MODE === "true";

function planFromProductId(pid: string) {
  if (pid === process.env.CREEM_PRODUCT_PRO_YEARLY || pid === process.env.CREEM_PRODUCT_PRO_MONTHLY) return "pro";
  if (pid === process.env.CREEM_PRODUCT_PREMIUM_YEARLY || pid === process.env.CREEM_PRODUCT_PREMIUM_MONTHLY) return "premium";
  return "free";
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    if (!SKIP_VERIFICATION) {
      const signature = request.headers.get("creem-signature") ?? "";
      const expected = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (signature !== expected) {
        return NextResponse.json({ error: "Geçersiz imza" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const event = body?.event ?? body?.type ?? "";
    const data = body?.data ?? body ?? {};

    switch (event) {
      case "checkout.completed": {
        const customerId = data.customer?.id ?? data.customer_id ?? "";
        const subscriptionId = data.subscription?.id ?? data.subscription_id ?? "";
        const requestId = data.request_id ?? data.requestId ?? "";
        const productId = data.product?.id ?? data.product_id ?? "";
        const uid = requestId;

        if (!uid) break;

        const plan = planFromProductId(productId);
        const currentPeriodEnd = data.subscription?.current_period_end
          ? new Date(data.subscription.current_period_end * 1000)
          : null;

        await adminDb.collection("users").doc(uid).set({
          email: data.customer?.email ?? "",
          displayName: data.customer?.name ?? "",
          subscription: {
            plan,
            creemCustomerId: customerId,
            creemSubscriptionId: subscriptionId,
            status: "active",
            currentPeriodEnd,
            updatedAt: new Date(),
          },
        }, { merge: true });
        break;
      }

      case "subscription.active": {
        const subId = data.id ?? data.subscription_id ?? "";
        const custId = data.customer_id ?? data.customer?.id ?? "";
        const prodId = data.product_id ?? data.product?.id ?? "";

        const plan = planFromProductId(prodId);
        const currentPeriodEnd = data.current_period_end
          ? new Date(data.current_period_end * 1000)
          : null;

        const usersSnap = await adminDb.collection("users")
          .where("subscription.creemSubscriptionId", "==", subId)
          .get();

        if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];
          await userDoc.ref.update({
            "subscription.plan": plan,
            "subscription.status": "active",
            "subscription.currentPeriodEnd": currentPeriodEnd,
            "subscription.updatedAt": new Date(),
          });
        } else if (custId) {
          const userByCustSnap = await adminDb.collection("users")
            .where("subscription.creemCustomerId", "==", custId)
            .get();

          if (!userByCustSnap.empty) {
            const userDoc = userByCustSnap.docs[0];
            await userDoc.ref.update({
              "subscription.plan": plan,
              "subscription.creemSubscriptionId": subId,
              "subscription.status": "active",
              "subscription.currentPeriodEnd": currentPeriodEnd,
              "subscription.updatedAt": new Date(),
            });
          }
        }
        break;
      }

      case "subscription.canceled": {
        const cancelSubId = data.id ?? data.subscription_id ?? "";
        const cancelCustId = data.customer_id ?? data.customer?.id ?? "";

        const cancelUsersSnap = cancelSubId
          ? await adminDb.collection("users")
              .where("subscription.creemSubscriptionId", "==", cancelSubId)
              .get()
          : null;

        const matchedSnap = cancelUsersSnap ?? (cancelCustId
          ? await adminDb.collection("users")
              .where("subscription.creemCustomerId", "==", cancelCustId)
              .get()
          : null);

        if (matchedSnap && !matchedSnap.empty) {
          await matchedSnap.docs[0].ref.update({
            "subscription.plan": "free",
            "subscription.status": "canceled",
            "subscription.updatedAt": new Date(),
          });
        }
        break;
      }

      case "subscription.past_due": {
        const pastDueSubId = data.id ?? data.subscription_id ?? "";

        const pastDueSnap = await adminDb.collection("users")
          .where("subscription.creemSubscriptionId", "==", pastDueSubId)
          .get();

        if (!pastDueSnap.empty) {
          await pastDueSnap.docs[0].ref.update({
            "subscription.status": "past_due",
            "subscription.updatedAt": new Date(),
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("Creem webhook error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
