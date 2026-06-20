"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AppIcon } from "@/components/ui/icons";

interface SetPasswordScreenProps {
  title?: string;
  description?: string;
  submitLabel?: string;
  embedded?: boolean;
  onSubmit: (password: string, confirmPassword: string) => Promise<{ error?: string }>;
  onCancel?: () => void;
}

export function SetPasswordScreen({
  title = "Create your password",
  description = "Use this password to sign in next time — no OTP needed for paid plans.",
  submitLabel = "Save password",
  embedded = false,
  onSubmit,
  onCancel,
}: SetPasswordScreenProps) {
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const result = await onSubmit(password, confirmPassword);
    if (result.error) setError(result.error);
    setLoading(false);
  }

  const form = (
    <>
      {!embedded && (
        <>
          <AppIcon name="lock" className="h-10 w-10 text-rose-deep" />
          <h2 className="mt-3 font-serif text-2xl text-purple-dark">{title}</h2>
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        </>
      )}
      {embedded && (
        <>
          <p className="text-xs text-gray-500">{description}</p>
        </>
      )}

      <div className={`space-y-4 ${embedded ? "mt-4" : "mt-6"}`}>
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            New password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPasswordValue(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className="mt-1 w-full rounded-2xl border border-pink-light bg-white px-4 py-3 text-sm outline-none focus:border-pink-mid"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Confirm password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-2xl border border-pink-light bg-white px-4 py-3 text-sm outline-none focus:border-pink-mid"
          />
        </div>
        <p className="text-[10px] text-gray-400">
          Must be 8+ characters with at least one letter and one number.
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !password || !confirmPassword}
          className="w-full rounded-full bg-purple-dark py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {loading ? "Saving…" : submitLabel}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-pink-light px-3 py-2 text-xs text-pink-dark">{error}</p>
      )}
      {embedded && onCancel && (
        <button type="button" onClick={onCancel} className="mt-2 w-full text-xs text-gray-500">
          Cancel
        </button>
      )}
    </>
  );

  if (embedded) return form;

  return (
    <AppShell hasNav={false} pullToRefresh={false} className="bg-gradient-to-b from-purple-light/40 to-cream">
      {onCancel && (
        <button type="button" onClick={onCancel} className="mb-4 text-xs text-gray-500">
          ← Back
        </button>
      )}
      {form}
    </AppShell>
  );
}

interface ChangePasswordFormProps {
  onSubmit: (currentPassword: string, password: string, confirmPassword: string) => Promise<{ error?: string }>;
  onCancel: () => void;
}

export function ChangePasswordForm({ onSubmit, onCancel }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const result = await onSubmit(currentPassword, password, confirmPassword);
    if (result.error) setError(result.error);
    else onCancel();
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
          Current password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-1 w-full rounded-2xl border border-pink-light bg-white px-4 py-3 text-sm outline-none focus:border-pink-mid"
        />
      </div>
      <div>
        <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
          New password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPasswordValue(e.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full rounded-2xl border border-pink-light bg-white px-4 py-3 text-sm outline-none focus:border-pink-mid"
        />
      </div>
      <div>
        <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
          Confirm new password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full rounded-2xl border border-pink-light bg-white px-4 py-3 text-sm outline-none focus:border-pink-mid"
        />
      </div>
      {error && (
        <p className="rounded-xl bg-pink-light px-3 py-2 text-xs text-pink-dark">{error}</p>
      )}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !currentPassword || !password || !confirmPassword}
        className="w-full rounded-full bg-purple-dark py-2.5 text-xs font-medium text-white disabled:opacity-40"
      >
        {loading ? "Updating…" : "Update password"}
      </button>
      <button type="button" onClick={onCancel} className="w-full text-xs text-gray-500">
        Cancel
      </button>
    </div>
  );
}
