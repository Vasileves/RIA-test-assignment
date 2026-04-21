"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function IosPrompt({
  open,
  title,
  message,
  initialValue,
  placeholder,
  confirmLabel = "Save",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: string;
  initialValue: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      // Focus + select after transition
      const t = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 180);
      return () => clearTimeout(t);
    }
  }, [open, initialValue]);

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) onConfirm(trimmed);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute modal-fullbleed z-[60] flex items-center justify-center px-[40px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.32)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
            }}
            onClick={onCancel}
          />
          <motion.div
            className="relative w-[270px] overflow-hidden rounded-[14px]"
            style={{
              background: "rgba(247,247,247,0.92)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
            }}
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            <div className="flex flex-col items-stretch gap-[8px] px-[16px] pt-[18px] pb-[16px] text-center">
              <h2 className="text-[17px] font-semibold leading-[22px] tracking-[-0.4px] text-[#1c1c1e]">
                {title}
              </h2>
              {message && (
                <p className="text-[13px] font-normal leading-[18px] text-[#1c1c1e]">
                  {message}
                </p>
              )}
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                  if (e.key === "Escape") onCancel();
                }}
                placeholder={placeholder}
                className="mt-[4px] rounded-[6px] border border-[rgba(60,60,67,0.29)] bg-white/90 px-[8px] py-[6px] text-[14px] font-normal leading-[18px] text-[#1c1c1e] outline-none focus:border-[#007aff]"
                autoComplete="off"
                spellCheck={false}
                maxLength={24}
              />
            </div>

            <div className="h-px w-full bg-[rgba(60,60,67,0.29)]" />

            <div className="flex">
              <button
                onClick={onCancel}
                className="relative flex-1 py-[11px] text-[17px] font-normal leading-[22px] text-[#007aff] active:bg-[rgba(0,0,0,0.06)]"
              >
                {cancelLabel}
                <span className="absolute right-0 top-0 h-full w-px bg-[rgba(60,60,67,0.29)]" />
              </button>
              <button
                onClick={submit}
                disabled={!value.trim()}
                className="flex-1 py-[11px] text-[17px] font-semibold leading-[22px] text-[#007aff] active:bg-[rgba(0,0,0,0.06)] disabled:opacity-40"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
