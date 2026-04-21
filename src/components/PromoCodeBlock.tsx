"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleNotch, Tag, X, XCircle } from "@phosphor-icons/react";

type State =
  | { kind: "collapsed" }
  | { kind: "expanded"; value: string }
  | { kind: "validating"; value: string }
  | { kind: "applied"; code: string; label: string }
  | { kind: "error"; value: string };

export function PromoCodeBlock({
  outcome = "success",
  onAppliedChange,
}: {
  outcome?: "success" | "fail";
  onAppliedChange?: (label: string | null) => void;
}) {
  const [state, setState] = useState<State>({ kind: "collapsed" });
  const outcomeRef = useRef(outcome);
  outcomeRef.current = outcome;

  function apply(value: string) {
    const norm = value.trim().toUpperCase();
    if (!norm) return;
    setState({ kind: "validating", value: norm });
    // Simulate a realistic server validation (1.2s)
    window.setTimeout(() => {
      if (outcomeRef.current === "success") {
        setState({ kind: "applied", code: norm, label: "10% off applied" });
        onAppliedChange?.("10% off applied");
      } else {
        setState({ kind: "error", value: norm });
        onAppliedChange?.(null);
      }
    }, 1200);
  }

  function remove() {
    setState({ kind: "collapsed" });
    onAppliedChange?.(null);
  }

  return (
    <div className="flex flex-col">
      <AnimatePresence mode="wait" initial={false}>
        {state.kind === "collapsed" && (
          <motion.button
            key="add"
            onClick={() =>
              setState({
                kind: "expanded",
                // Autopaste a demo code so evaluators don't have to type it
                value: outcomeRef.current === "success" ? "WELCOME50" : "WRONGCODE",
              })
            }
            className="flex items-center gap-[6px] px-[4px] py-[8px] text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Tag size={16} weight="fill" color="#ff6a00" />
            <span className="text-[14px] font-bold leading-[20px] text-[#ff6a00]">
              Add promo code
            </span>
          </motion.button>
        )}

        {state.kind === "expanded" && (
          <motion.div
            key="exp"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-[8px]"
          >
            <input
              autoFocus
              value={state.value}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setState({ kind: "expanded", value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") apply(state.value);
                if (e.key === "Escape") setState({ kind: "collapsed" });
              }}
              placeholder="Promo code"
              className="flex-1 h-[44px] rounded-[10px] border border-[#e5e7eb] bg-white px-[12px] text-[14px] font-medium leading-[20px] text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#ff6a00]"
            />
            <button
              onClick={() => apply(state.value)}
              disabled={!state.value.trim()}
              className="h-[44px] rounded-[10px] bg-[#ff6a00] px-[18px] text-[14px] font-bold leading-[20px] text-white active:bg-[#e85f00] disabled:bg-[#ffb988]"
            >
              Apply
            </button>
            <button
              onClick={() => setState({ kind: "collapsed" })}
              aria-label="Close"
              className="flex size-[28px] items-center justify-center rounded-full active:bg-black/5"
            >
              <X size={18} weight="bold" color="#6b7280" />
            </button>
          </motion.div>
        )}

        {state.kind === "validating" && (
          <motion.div
            key="validating"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-[8px]"
          >
            <div className="flex flex-1 h-[44px] items-center gap-[10px] rounded-[10px] border border-[#e5e7eb] bg-white px-[12px]">
              <span className="flex-1 text-[14px] font-medium leading-[20px] text-[#111827]">
                {state.value}
              </span>
            </div>
            <button
              disabled
              className="flex h-[44px] items-center justify-center gap-[6px] rounded-[10px] bg-[#ffb988] px-[18px] text-[14px] font-bold leading-[20px] text-white cursor-not-allowed"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className="flex"
              >
                <CircleNotch size={14} weight="bold" color="#ffffff" />
              </motion.span>
              Checking
            </button>
          </motion.div>
        )}

        {state.kind === "applied" && (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-[6px]"
          >
            <div className="flex items-center gap-[8px]">
              <div className="flex h-[44px] flex-1 items-center gap-[8px] rounded-[10px] border border-[#16a34a] bg-white px-[12px]">
                <span className="flex-1 text-[14px] font-bold leading-[20px] text-[#111827]">
                  {state.code}
                </span>
                <Check size={18} weight="bold" color="#16a34a" />
              </div>
              <button
                onClick={remove}
                className="h-[44px] rounded-[10px] bg-[#f3f4f6] px-[16px] text-[14px] font-bold leading-[20px] text-[#1a1a1a] active:bg-[#e5e7eb]"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center gap-[6px] px-[4px]">
              <Check size={14} weight="bold" color="#16a34a" />
              <span className="text-[12px] font-medium leading-[16px] text-[#16a34a]">
                {state.label}
              </span>
            </div>
          </motion.div>
        )}

        {state.kind === "error" && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-[6px]"
          >
            <div className="flex items-center gap-[8px]">
              <input
                value={state.value}
                onChange={(e) => setState({ kind: "expanded", value: e.target.value })}
                className="flex-1 h-[44px] rounded-[10px] border border-[#dc2626] bg-white px-[12px] text-[14px] font-medium leading-[20px] text-[#111827] outline-none focus:border-[#ff6a00]"
              />
              <button
                onClick={() => apply(state.value)}
                className="h-[44px] rounded-[10px] bg-[#ff6a00] px-[18px] text-[14px] font-bold leading-[20px] text-white active:bg-[#e85f00]"
              >
                Apply
              </button>
            </div>
            <div className="flex items-center gap-[6px] px-[4px]">
              <XCircle size={14} weight="fill" color="#dc2626" />
              <span className="text-[12px] font-medium leading-[16px] text-[#dc2626]">
                Code invalid or expired
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
