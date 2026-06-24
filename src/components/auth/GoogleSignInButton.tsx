"use client";

import { useCallback, useEffect, useRef } from "react";

interface GoogleSignInButtonProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; width?: number; text?: string },
          ) => void;
        };
      };
    };
  }
}

const GSI_SCRIPT = "https://accounts.google.com/gsi/client";

export function GoogleSignInButton({ onSuccess, onError, disabled }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredential = useCallback(
    async (credential: string) => {
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });
        const data = await res.json();
        if (!res.ok) {
          onError(data.error ?? "Google sign-in failed");
          return;
        }
        onSuccess();
      } catch {
        onError("Google sign-in failed");
      }
    },
    [onError, onSuccess],
  );

  useEffect(() => {
    if (!clientId || disabled || !containerRef.current) return;

    const render = () => {
      if (!containerRef.current || !window.google?.accounts?.id) return;
      containerRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          void handleCredential(response.credential);
        },
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: 280,
        text: "signin_with",
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return;
    }

    const existing = document.querySelector(`script[src="${GSI_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", render);
      return () => existing.removeEventListener("load", render);
    }

    const script = document.createElement("script");
    script.src = GSI_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.body.appendChild(script);
  }, [clientId, disabled, handleCredential]);

  if (!clientId) {
    return (
      <p className="text-[10px] text-amber-mid">
        Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google test sign-in.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={disabled ? "pointer-events-none opacity-50" : "flex justify-center"}
    />
  );
}
