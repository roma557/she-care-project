"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useMsg91 } from "@/hooks/useMsg91";
import { normalizePhone } from "@/lib/auth-types";
import { AppIcon } from "@/components/ui/icons";
import { SetPasswordScreen } from "@/components/sections/SetPasswordScreen";

type AuthStep = "phone" | "password" | "otp" | "set-password";

interface AuthScreenProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialName?: string;
}

export function AuthScreen({ onSuccess, onCancel, initialName = "" }: AuthScreenProps) {
  const {
    sendOtp,
    verifyOtp,
    verifyMsg91AccessToken,
    getAuthMethod,
    loginWithPassword,
    setPassword,
  } = useAuth();
  const msg91 = useMsg91();

  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState(initialName);
  const [password, setPasswordValue] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);

  const useMsg91Flow = msg91.enabled;

  async function sendOtpForPhone() {
    if (useMsg91Flow) {
      if (!msg91.ready) {
        setError(msg91.error ?? "MSG91 is loading — please wait a moment");
        return false;
      }
      await msg91.sendOtp(phone);
    } else {
      const result = await sendOtp(phone, name);
      if (result.error) {
        setError(result.error);
        return false;
      }
      if (result.devOtp) setDevOtp(result.devOtp);
    }
    return true;
  }

  async function handleContinuePhone() {
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const authMethod = await getAuthMethod(phone);
      if (authMethod.error) {
        setError(authMethod.error);
        return;
      }
      if (authMethod.name && !name) setName(authMethod.name);

      if (authMethod.method === "password" && !forgotPassword) {
        setStep("password");
        return;
      }

      const sent = await sendOtpForPhone();
      if (sent) setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordLogin() {
    if (!password) {
      setError("Enter your password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await loginWithPassword(phone, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setForgotPassword(true);
    setPasswordValue("");
    setError("");
    setLoading(true);

    try {
      const sent = await sendOtpForPhone();
      if (sent) setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (otp.length !== 4) {
      setError("Enter the 4-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let needsPasswordSetup = false;

      if (useMsg91Flow) {
        const accessToken = await msg91.verifyOtp(otp);
        const result = await verifyMsg91AccessToken(accessToken, name);
        if (result.error) {
          setError(result.error);
          return;
        }
        needsPasswordSetup = Boolean(result.needsPasswordSetup);
      } else {
        const result = await verifyOtp(phone, otp, name);
        if (result.error) {
          setError(result.error);
          return;
        }
        needsPasswordSetup = Boolean(result.needsPasswordSetup);
      }

      if (needsPasswordSetup) {
        setStep("set-password");
        return;
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    setError("");
    try {
      if (useMsg91Flow) {
        await msg91.retryOtp();
      } else {
        const result = await sendOtp(phone, name);
        if (result.error) setError(result.error);
        else if (result.devOtp) setDevOtp(result.devOtp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend OTP");
    } finally {
      setLoading(false);
    }
  }

  if (step === "set-password") {
    return (
      <SetPasswordScreen
        title={forgotPassword ? "Set a new password" : "Create your password"}
        description={
          forgotPassword
            ? "Choose a new password for your paid plan account."
            : "One-time setup — use this password to sign in without OTP next time."
        }
        onSubmit={async (pwd, confirm) => {
          const result = await setPassword(pwd, confirm);
          if (!result.error) onSuccess?.();
          return result;
        }}
      />
    );
  }

  return (
    <AppShell hasNav={false} pullToRefresh={false} className="bg-gradient-to-b from-purple-light/40 to-cream">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mb-4 text-xs text-gray-500"
        >
          ← Back
        </button>
      )}

      <AppIcon name="lock" className="h-10 w-10 text-rose-deep" />
      <h2 className="mt-3 font-serif text-2xl text-purple-dark">
        {step === "phone" && "Sign in with phone"}
        {step === "password" && "Enter your password"}
        {step === "otp" && "Enter OTP"}
      </h2>
      <p className="mt-2 text-xs text-gray-500">
        {step === "phone" &&
          "Your account links your plan, profile & notifications across devices."}
        {step === "password" &&
          `Sign in to +91 ${phone.replace(/\D/g, "").slice(-10)} with your password.`}
        {step === "otp" &&
          `We sent a 4-digit code to +91 ${phone.replace(/\D/g, "").slice(-10)}`}
      </p>

      {useMsg91Flow && !msg91.ready && step === "phone" && (
        <p className="mt-3 rounded-xl bg-purple-light/60 px-3 py-2 text-[10px] text-purple-dark">
          Connecting to MSG91 secure OTP…
        </p>
      )}

      {step === "phone" && (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name"
              maxLength={24}
              className="mt-1 w-full rounded-2xl border border-pink-light bg-white px-4 py-3 text-sm outline-none focus:border-pink-mid"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Mobile number
            </label>
            <div className="mt-1 flex overflow-hidden rounded-2xl border border-pink-light bg-white">
              <span className="flex items-center bg-pink-light/50 px-3 text-sm text-gray-600">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                className="flex-1 px-3 py-3 text-sm outline-none"
                inputMode="numeric"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleContinuePhone}
            disabled={loading || phone.replace(/\D/g, "").length < 10 || (useMsg91Flow && !msg91.ready)}
            className="w-full rounded-full bg-pink-mid py-3 text-sm font-medium text-white disabled:opacity-40"
          >
            {loading ? "Checking…" : "Continue"}
          </button>
        </div>
      )}

      {step === "password" && (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPasswordValue(e.target.value)}
              placeholder="Your account password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-2xl border border-pink-light bg-white px-4 py-3 text-sm outline-none focus:border-pink-mid"
            />
          </div>
          <button
            type="button"
            onClick={handlePasswordLogin}
            disabled={loading || !password}
            className="w-full rounded-full bg-purple-dark py-3 text-sm font-medium text-white disabled:opacity-40"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep("phone"); setPasswordValue(""); setError(""); setForgotPassword(false); }}
              className="flex-1 text-xs text-gray-500"
            >
              Change number
            </button>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="flex-1 text-xs font-medium text-pink-mid disabled:opacity-40"
            >
              Forgot password?
            </button>
          </div>
        </div>
      )}

      {step === "otp" && (
        <div className="mt-6 space-y-4">
          {devOtp && (
            <p className="rounded-xl bg-amber-light/80 px-3 py-2 text-[10px] text-amber-mid">
              Dev mode OTP: <strong>{devOtp}</strong>
            </p>
          )}
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="• • • •"
            className="w-full rounded-2xl border border-pink-light bg-white px-4 py-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-pink-mid"
            inputMode="numeric"
            autoFocus
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || otp.length !== 4}
            className="w-full rounded-full bg-purple-dark py-3 text-sm font-medium text-white disabled:opacity-40"
          >
            {loading ? "Verifying…" : "Verify & sign in"}
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(forgotPassword ? "password" : "phone");
                setOtp("");
                setError("");
                if (!forgotPassword) setForgotPassword(false);
              }}
              className="flex-1 text-xs text-gray-500"
            >
              {forgotPassword ? "Back to password" : "Change number"}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="flex-1 text-xs font-medium text-pink-mid disabled:opacity-40"
            >
              Resend OTP
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-pink-light px-3 py-2 text-xs text-pink-dark">{error}</p>
      )}

      <p className="mt-6 text-[9px] leading-relaxed text-gray-400">
        {step === "password"
          ? "Paid plan members can sign in with password. Use OTP via Forgot password if needed."
          : useMsg91Flow
            ? "OTP is sent securely via MSG91. Paid plans are tied to your verified phone number."
            : "Paid plans are tied to your phone number. Sign in on any device to restore your subscription."}
      </p>
    </AppShell>
  );
}
