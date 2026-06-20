import { NextRequest, NextResponse } from "next/server";
import { razorpayAdapter } from "@/lib/billing/razorpay";
import { applyBillingEvents } from "@/lib/billing/sync";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  try {
    const events = await razorpayAdapter.verifyWebhook(body, signature);
    await applyBillingEvents(events);
    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
