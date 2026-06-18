"use client";

import { ReactNode, useEffect, useState } from "react";

interface ScreenTransitionProps {
  screenKey: string;
  children: ReactNode;
}

export function ScreenTransition({ screenKey, children }: ScreenTransitionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [screenKey]);

  return (
    <div
      key={screenKey}
      className={`screen-fade h-full ${visible ? "screen-fade-in" : "screen-fade-out"}`}
    >
      {children}
    </div>
  );
}
