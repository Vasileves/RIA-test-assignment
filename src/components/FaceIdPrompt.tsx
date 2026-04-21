"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export function FaceIdPrompt({
  open,
  label,
  onSuccess,
  onCancel,
}: {
  open: boolean;
  label: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  // Simulate Face ID scan — success after 900ms
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onSuccess(), 1100);
    return () => clearTimeout(t);
  }, [open, onSuccess]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute modal-fullbleed z-[70] flex items-start justify-center pt-[80px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Dim the screen */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={onCancel}
          />
          {/* Panel */}
          <motion.div
            className="relative flex w-[260px] flex-col items-center gap-[14px] rounded-[16px] px-[24px] py-[22px]"
            style={{
              background: "rgba(28,28,30,0.92)",
              color: "white",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
            }}
            initial={{ scale: 0.92, y: -8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
          >
            <FaceIdIcon />
            <div className="flex flex-col items-center gap-[2px]">
              <div className="text-[15px] font-semibold leading-[20px]">Face ID</div>
              <div className="text-[13px] font-normal leading-[18px] text-white/75">
                {label}
              </div>
            </div>
            <button
              onClick={onCancel}
              className="mt-[2px] text-[14px] font-medium text-[#0a84ff] active:opacity-60"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FaceIdIcon() {
  return (
    <div className="relative flex size-[60px] items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-[14px] border-2 border-[#0a84ff]"
        initial={{ opacity: 0.6, scale: 0.95 }}
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1, 0.95] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        {/* Face outline */}
        <path
          d="M4 9C4 6.24 6.24 4 9 4M27 4C29.76 4 32 6.24 32 9M9 32C6.24 32 4 29.76 4 27M32 27C32 29.76 29.76 32 27 32"
          stroke="#0a84ff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Eyes */}
        <circle cx="13" cy="16" r="1.6" fill="#0a84ff" />
        <circle cx="23" cy="16" r="1.6" fill="#0a84ff" />
        {/* Nose */}
        <path
          d="M18 15V21H16"
          stroke="#0a84ff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Mouth */}
        <path
          d="M14 24C15.2 25.2 16.5 25.8 18 25.8C19.5 25.8 20.8 25.2 22 24"
          stroke="#0a84ff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
