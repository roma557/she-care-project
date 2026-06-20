import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { assertAccess } from "@/lib/permissions";
import { getPartnerInvitesAsync, createPartnerInviteAsync, findUserByPhoneAsync } from "@/lib/db";
import { normalizePhone } from "@/lib/auth-types";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const invites = await getPartnerInvitesAsync(user.id);
  return NextResponse.json({ invites });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    await assertAccess(user.id, "partner_access");
  } catch {
    return NextResponse.json({ error: "upgrade_required", requiredTier: "premium" }, { status: 403 });
  }

  const body = await req.json();
  const phone = normalizePhone(String(body.phone ?? ""));
  if (!phone) return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  if (phone === user.phone) {
    return NextResponse.json({ error: "Cannot invite yourself" }, { status: 400 });
  }

  const invitee = await findUserByPhoneAsync(phone);
  const invite = await createPartnerInviteAsync({
    inviterId: user.id,
    inviteePhone: phone,
    inviteeId: invitee?.id ?? null,
    status: invitee ? "accepted" : "pending",
  });

  return NextResponse.json({ invite });
}
