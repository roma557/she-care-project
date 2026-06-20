"use client";

import { useEffect, useState } from "react";

/** True on phones, tablets, and other coarse-pointer touch devices. */
export function useIsTouchDevice() {
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse), (max-width: 1024px)");
    const update = () => setTouch(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return touch;
}
