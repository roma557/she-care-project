"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { normalizePhone } from "@/lib/auth-types";

interface AuthScreenProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialName?: string;
}

export function AuthScreen({ onSuccess, onCancel, initialName = "" }: AuthScreenProps) {
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState(initialName);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  async function handleSendOtp() {
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setError("");
    const result = await sendOtp(phone, name);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.devOtp) setDevOtp(result.devOtp);
    setStep("otp");
  }

  async function handleVerify() {
    if (otp.length !== 4) {
      setError("Enter the 4-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    const result = await verifyOtp(phone, otp, name);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess?.();
  }

  return (
    <AppShell hasNav={false} className="bg-gradient-to-b from-purple-light/40 to-cream">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mb-4 text-xs text-gray-500"
        >
          ← Back
        </button>
      )}

      <span className="text-4xl">🔐</span>
      <h2 className="mt-3 font-serif text-2xl text-purple-dark">
        {step === "phone" ? "Sign in with phone" : "Enter OTP"}
      </h2>
      <p className="mt-2 text-xs text-gray-500">
        {step === "phone"
          ? "Your account links your plan, profile & notifications across devices."
          : `We sent a 4-digit code to +91 ${phone.replace(/\D/g, "").slice(-10)}`}
      </p>

      {step === "phone" ? (
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
            onClick={handleSendOtp}
            disabled={loading || phone.replace(/\D/g, "").length < 10}
            className="w-full rounded-full bg-pink-mid py-3 text-sm font-medium text-white disabled:opacity-40"
          >
            {loading ? "Sending…" : "Send OTP"}
          </button>
        </div>
      ) : (
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
          <button
            type="button"
            onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
            className="w-full text-xs text-gray-500"
          >
            Change number
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-pink-light px-3 py-2 text-xs text-pink-dark">{error}</p>
      )}

      <p className="mt-6 text-[9px] leading-relaxed text-gray-400">
        Paid plans are tied to your phone number. Sign in on any device to restore your subscription.
      </p>
    </AppShell>
  );
}
