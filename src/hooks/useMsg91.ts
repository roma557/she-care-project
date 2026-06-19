"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getMsg91WidgetConfig,
  isMsg91Configured,
  loadMsg91Script,
  msg91FailureMessage,
  phoneToMsg91Identifier,
} from "@/lib/msg91-config";

export function useMsg91() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const enabled = isMsg91Configured();

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    loadMsg91Script()
      .then(() => {
        if (cancelled) return;
        window.initSendOTP?.(getMsg91WidgetConfig());
        setReady(typeof window.sendOtp === "function");
        if (typeof window.sendOtp !== "function") {
          setError("MSG91 loaded but OTP methods are unavailable");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load MSG91");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const sendOtp = useCallback(
    (phone: string): Promise<void> =>
      new Promise((resolve, reject) => {
        const identifier = phoneToMsg91Identifier(phone);
        if (!identifier) {
          reject(new Error("Enter a valid 10-digit Indian mobile number"));
          return;
        }
        if (!window.sendOtp) {
          reject(new Error("MSG91 is not ready yet"));
          return;
        }

        window.sendOtp(
          identifier,
          () => resolve(),
          (failure) => reject(new Error(msg91FailureMessage(failure))),
        );
      }),
    [],
  );

  const verifyOtp = useCallback(
    (otp: string): Promise<string> =>
      new Promise((resolve, reject) => {
        if (!window.verifyOtp) {
          reject(new Error("MSG91 is not ready yet"));
          return;
        }

        window.verifyOtp(
          otp,
          (data) => {
            const token =
              (typeof data.accessToken === "string" && data.accessToken) ||
              (typeof data.token === "string" && data.token) ||
              (typeof data["access-token"] === "string" && data["access-token"]);

            if (!token) {
              reject(new Error("OTP verified but no access token was returned"));
              return;
            }
            resolve(token);
          },
          (failure) => reject(new Error(msg91FailureMessage(failure))),
        );
      }),
    [],
  );

  const retryOtp = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!window.retryOtp) {
        reject(new Error("Resend is not available"));
        return;
      }
      window.retryOtp(
        undefined,
        () => resolve(),
        (failure) => reject(new Error(msg91FailureMessage(failure))),
      );
    });
  }, []);

  return { enabled, ready, error, sendOtp, verifyOtp, retryOtp };
}
