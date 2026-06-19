interface Msg91VerifyResponse {
  type?: string;
  message?: string;
  identifier?: string;
  mobile?: string;
  email?: string;
}

export async function verifyMsg91AccessToken(accessToken: string): Promise<{
  ok: boolean;
  identifier?: string;
  error?: string;
}> {
  const authkey = process.env.MSG91_AUTH_KEY;
  if (!authkey) {
    return { ok: false, error: "MSG91 server auth key is not configured" };
  }

  try {
    const res = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        authkey,
        "access-token": accessToken,
      }),
    });

    const data = (await res.json()) as Msg91VerifyResponse;

    if (data.type === "success") {
      const identifier = data.identifier ?? data.mobile ?? data.email;
      if (!identifier) {
        return { ok: false, error: "Verified but no identifier returned from MSG91" };
      }
      return { ok: true, identifier };
    }

    return { ok: false, error: data.message ?? "MSG91 token verification failed" };
  } catch {
    return { ok: false, error: "Could not reach MSG91 verification service" };
  }
}
