import { NextRequest, NextResponse } from "next/server";
import { finalizeGoogleLogin } from "@/lib/auth-server";
import { verifyGoogleIdToken } from "@/lib/google-auth";
import { getTestAccountTier } from "@/lib/test-accounts";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const credential = typeof body.credential === "string" ? body.credential.trim() : "";

  if (!credential) {
    return NextResponse.json({ error: "Missing Google credential" }, { status: 400 });
  }

  try {
    const profile = await verifyGoogleIdToken(credential);
    const testTier = getTestAccountTier(profile.email);
    if (!testTier) {
      return NextResponse.json(
        {
          error:
            "This Google account is not authorized. Use plus@test.com or premium@test.com for testing.",
        },
        { status: 403 },
      );
    }

    const user = await finalizeGoogleLogin(profile.email, profile.name);
    return NextResponse.json({ user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google sign-in failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
