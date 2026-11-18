"use client";

import { useEffect } from "react";

/**
 * Works around a WebKit bug in home-screen apps: after the app returns from the background (or the
 * keyboard closes), iOS can leave the visual viewport offset from the layout viewport, and bars with
 * `position: fixed; bottom: 0` then ride up the screen while scrolling. iOS reports that offset in
 * `visualViewport`, so this measures how far the screen's bottom edge is from the layout viewport's
 * and publishes it as --viewport-shift; `.pin-bottom` (globals.css) moves bottom chrome by it.
 * Normally the shift is 0 and nothing is written.
 */
export function useViewportPin() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || !window.matchMedia("(display-mode: standalone)").matches) return;
    const root = document.documentElement;
    let frame = 0;
    let current = 0;

    function measure() {
      frame = 0;
      // Pinch zoom and the open keyboard move the visual viewport on purpose; leave the bars alone then.
      const typing = document.activeElement?.matches("input, textarea, select, [contenteditable=''], [contenteditable='true']");
      const shift = vv!.scale > 1.01 || typing ? 0 : Math.round(vv!.offsetTop + vv!.height - root.clientHeight);
      const next = Math.abs(shift) < 1 ? 0 : shift;
      if (next === current) return;
      current = next;
      if (next) root.style.setProperty("--viewport-shift", `${next}px`);
      else root.style.removeProperty("--viewport-shift");
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    // The keyboard finishes closing a moment after focus leaves the field.
    const afterBlur = () => setTimeout(schedule, 300);

    measure();
    vv.addEventListener("resize", schedule);
    vv.addEventListener("scroll", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("pageshow", schedule);
    document.addEventListener("visibilitychange", schedule);
    document.addEventListener("focusin", schedule);
    document.addEventListener("focusout", afterBlur);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener("resize", schedule);
      vv.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("pageshow", schedule);
      document.removeEventListener("visibilitychange", schedule);
      document.removeEventListener("focusin", schedule);
      document.removeEventListener("focusout", afterBlur);
      root.style.removeProperty("--viewport-shift");
    };
  }, []);
}
