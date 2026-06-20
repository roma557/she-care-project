import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { getProvider } from "@/lib/billing/provider";
import { getBillingCustomerAsync } from "@/lib/billing/sync";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const providerName = req.nextUrl.searchParams.get("provider") ?? "stripe";
  const customer = await getBillingCustomerAsync(user.id, providerName as "stripe" | "razorpay");
  if (!customer) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const provider = getProvider(providerName);

  if (!provider.createPortalSession) {
    return NextResponse.json({ error: "Portal not supported for this provider" }, { status: 400 });
  }

  const url = await provider.createPortalSession(customer.providerCustomerId, `${origin}/?screen=profile`);
  return NextResponse.json({ url });
}
