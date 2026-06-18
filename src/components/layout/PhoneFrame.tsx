import { ReactNode } from "react";
import { PHONE } from "@/lib/phone";
import { StatusBarClock } from "@/components/ui/StatusBarClock";

interface PhoneFrameProps {
  children: ReactNode;
}

/**
 * iPhone Pro mockup shell — 393 × 852 logical viewport.
 * All app content renders inside `children`.
 */
export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div
      className="relative rounded-[3rem] bg-[#1a1a1a] p-[10px] shadow-phone"
      style={{ width: PHONE.width + 20 }}
    >
      <div className="absolute -left-[3px] top-32 h-10 w-[3px] rounded-l bg-[#2a2a2a]" />
      <div className="absolute -left-[3px] top-48 h-14 w-[3px] rounded-l bg-[#2a2a2a]" />
      <div className="absolute -left-[3px] top-64 h-14 w-[3px] rounded-l bg-[#2a2a2a]" />
      <div className="absolute -right-[3px] top-40 h-16 w-[3px] rounded-r bg-[#2a2a2a]" />

      <div className="relative overflow-hidden rounded-[2.35rem] bg-cream">
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-6 text-[12px] font-medium text-[#2d2a26]"
          style={{ height: PHONE.safeTop, paddingTop: 12 }}
        >
          <StatusBarClock />
          <div className="absolute left-1/2 top-[10px] h-[28px] w-[108px] -translate-x-1/2 rounded-full bg-[#1a1a1a]" />
          <div className="flex items-center gap-1">
            <SignalIcon />
            <WifiIcon />
            <BatteryIcon />
          </div>
        </div>

        <div
          className="relative overflow-hidden bg-cream"
          style={{ width: PHONE.width, height: PHONE.height }}
        >
          {children}
        </div>

        <div
          className="pointer-events-none absolute bottom-[6px] left-1/2 z-30 h-[5px] -translate-x-1/2 rounded-full bg-[#2d2a26]/25"
          style={{ width: 134 }}
        />
      </div>
    </div>
  );
}

function SignalIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 12h2v2H1v-2zm4-3h2v5H5V9zm4-3h2v8H9V6zm4-3h2v11h-2V3z" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2C5.5 2 3.3 3.1 2 5l1.5 1.5C4.5 5.2 6.1 4.5 8 4.5s3.5.7 4.5 2L14 5C12.7 3.1 10.5 2 8 2zm0 4c-1.5 0-2.8.7-3.7 1.8L6.8 9.5C7.2 9.2 7.6 9 8 9s.8.2 1.2.5l2.5-1.7C10.8 6.7 9.5 6 8 6zm0 4c-.6 0-1.1.2-1.5.6l1.5 1.5 1.5-1.5c-.4-.4-.9-.6-1.5-.6z" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg className="h-3.5 w-5" viewBox="0 0 24 12" fill="currentColor">
      <rect x="0" y="1" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="2" y="3" width="14" height="6" rx="1" />
      <rect x="21" y="4" width="2" height="4" rx="0.5" />
    </svg>
  );
}
