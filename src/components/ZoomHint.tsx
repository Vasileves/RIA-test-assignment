"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "@phosphor-icons/react";

const STORAGE_KEY = "ria-zoom-hint-dismissed";

/**
 * Small "press ⌘/Ctrl − to fit" nudge anchored to the bottom of the desktop
 * background. Hidden on mobile (no fixed device to fit). Dismissal persists
 * for the session so the hint doesn't nag across navigations.
 */
export function ZoomHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) !== "1") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable — fine, hint just stays dismissed for the tab */
    }
  }

  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
  const modifier = isMac ? "⌘" : "Ctrl";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="zoom-hint"
          className="pointer-events-auto fixed bottom-[18px] left-1/2 -translate-x-1/2 z-[70] hidden md:flex items-center gap-[10px] rounded-full border border-white/10 bg-white/5 px-[14px] py-[8px] text-[12px] leading-[16px] text-white/55 backdrop-blur"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>
            Doesn&apos;t fit? Press{" "}
            <kbd className="rounded-[4px] bg-white/10 px-[5px] py-[1px] font-mono text-[11px] text-white/75">
              {modifier}
            </kbd>{" "}
            <kbd className="rounded-[4px] bg-white/10 px-[5px] py-[1px] font-mono text-[11px] text-white/75">
              −
            </kbd>{" "}
            to zoom out.
          </span>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="flex size-[18px] items-center justify-center rounded-full text-white/55 active:text-white"
          >
            <X size={12} weight="bold" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
