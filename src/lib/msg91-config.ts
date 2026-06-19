const MSG91_SCRIPT_URLS = [
  "https://verify.msg91.com/otp-provider.js",
  "https://verify.phone91.com/otp-provider.js",
] as const;

export function isMsg91Configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_MSG91_WIDGET_ID &&
      process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH,
  );
}

export function getMsg91WidgetConfig(handlers?: {
  success?: (data: Msg91OtpSuccessData) => void;
  failure?: (error: unknown) => void;
}): Msg91OtpConfig {
  return {
    widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID ?? "",
    tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH ?? "",
    exposeMethods: true,
    success: handlers?.success,
    failure: handlers?.failure,
  };
}

export function loadMsg91Script(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("MSG91 can only load in the browser"));
  }

  if (typeof window.initSendOTP === "function") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let index = 0;

    function attempt() {
      const script = document.createElement("script");
      script.src = MSG91_SCRIPT_URLS[index];
      script.async = true;
      script.onload = () => {
        if (typeof window.initSendOTP === "function") {
          resolve();
        } else {
          tryNextOrFail();
        }
      };
      script.onerror = tryNextOrFail;
      document.head.appendChild(script);
    }

    function tryNextOrFail() {
      index += 1;
      if (index < MSG91_SCRIPT_URLS.length) {
        attempt();
      } else {
        reject(new Error("Failed to load MSG91 OTP provider"));
      }
    }

    attempt();
  });
}

export function phoneToMsg91Identifier(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return null;
}

export function extractMsg91AccessToken(data: Msg91OtpSuccessData): string | null {
  if (typeof data.accessToken === "string" && data.accessToken) return data.accessToken;
  if (typeof data.token === "string" && data.token) return data.token;
  const legacy = data["access-token"];
  if (typeof legacy === "string" && legacy) return legacy;
  return null;
}

export function msg91FailureMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
  }
  return "OTP request failed. Please try again.";
}
