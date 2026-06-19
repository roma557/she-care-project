import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
}

export function BtnRose({ children, fullWidth = true, className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn-rose w-full text-center transition-opacity active:opacity-90 disabled:opacity-40 ${fullWidth ? "" : "w-auto px-8"} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnOutline({ children, fullWidth = true, className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn-outline w-full text-center text-sm transition-opacity active:opacity-80 ${fullWidth ? "" : "w-auto px-8"} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnDark({ children, fullWidth = true, className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`w-full rounded-full bg-ink py-[17px] text-sm font-medium tracking-wide text-bg transition-opacity active:opacity-90 disabled:opacity-40 ${fullWidth ? "" : "w-auto px-8"} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
