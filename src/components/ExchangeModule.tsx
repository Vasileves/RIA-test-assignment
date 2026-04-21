"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import {
  ArrowCircleRight,
  ArrowsDownUp,
  CaretDown,
  CircleNotch,
} from "@phosphor-icons/react";
import { Flag } from "@/components/Flag";
import { convert, getCurrency, rate } from "@/lib/currencies";

const ROW_OFFSET = 93; // vertical distance each row swaps across

export function ExchangeModule({
  fromCode,
  toCode,
  amount,
  onAmountChange,
  onFromChange,
  onToChange,
  onOpenPicker,
}: {
  fromCode: string;
  toCode: string;
  amount: string;
  onAmountChange: (v: string) => void;
  onFromChange: (code: string) => void;
  onToChange: (code: string) => void;
  onOpenPicker: (side: "from" | "to") => void;
}) {
  const [focused, setFocused] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [swapTick, setSwapTick] = useState(0);

  const sendControls = useAnimation();
  const recvControls = useAnimation();
  const rotateControls = useAnimation();

  const from = getCurrency(fromCode);
  const to = getCurrency(toCode);

  const sendNum = parseFloat(amount) || 0;
  const recvNum = convert(sendNum, fromCode, toCode);
  const r = rate(fromCode, toCode);

  // Display: thousands separator while not focused; raw while editing
  const displayAmount = focused ? amount : amount ? formatAmount(sendNum) : "0";

  function handleAmountInput(raw: string) {
    let cleaned = raw.replace(/[^\d.]/g, "");
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      cleaned =
        cleaned.slice(0, firstDot + 1) +
        cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    const asNum = parseFloat(cleaned);
    if (!Number.isNaN(asNum) && asNum > 1_000_000) return;
    const intPart = cleaned.split(".")[0] ?? "";
    if (intPart.length > 7) return;
    onAmountChange(cleaned);
  }

  // Kick the 300ms loader whenever the rate pair changes
  const prevPair = useRef(`${fromCode}→${toCode}`);
  useEffect(() => {
    const pair = `${fromCode}→${toCode}`;
    if (pair === prevPair.current) return;
    prevPair.current = pair;
    setRecalculating(true);
    const t = window.setTimeout(() => setRecalculating(false), 420);
    return () => window.clearTimeout(t);
  }, [fromCode, toCode]);

  async function flip() {
    // Swap state immediately — new content flashes into the "wrong" positions
    // (send row visually at bottom, receive visually at top). Then animate
    // each row back to their DOM slots so it reads as a real swap, not a
    // boomerang.
    const nextFrom = toCode;
    const nextTo = fromCode;
    const nextAmount = formatAmount(recvNum, true);

    // Pre-position rows at swapped slots (instantly, no transition)
    sendControls.set({ y: ROW_OFFSET, opacity: 1 });
    recvControls.set({ y: -ROW_OFFSET, opacity: 1 });

    onFromChange(nextFrom);
    onToChange(nextTo);
    onAmountChange(nextAmount);
    setSwapTick((t) => t + 1);

    // Rotate swap button while rows slide into place
    rotateControls.start({
      rotate: (swapTick + 1) * 180,
      transition: { duration: 0.42, ease: [0.32, 0.72, 0, 1] },
    });

    await Promise.all([
      sendControls.start({
        y: 0,
        transition: { type: "spring", stiffness: 340, damping: 30 },
      }),
      recvControls.start({
        y: 0,
        transition: { type: "spring", stiffness: 340, damping: 30 },
      }),
    ]);
  }

  return (
    <motion.div
      className="relative flex flex-col rounded-[16px] bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden"
    >
      {/* Send row */}
      <motion.div
        className="flex items-center justify-between px-[16px] py-[14px]"
        animate={sendControls}
        initial={{ y: 0 }}
      >
        <div className="flex flex-col gap-[6px]">
          <span className="text-[12px] leading-[16px] text-[#6b7280]">You send</span>
          <button
            onClick={() => onOpenPicker("from")}
            className="flex h-[32px] items-center gap-[6px] active:opacity-70"
          >
            <Flag countryCode={from.countryCode} emoji={from.flag} size={22} />
            <span className="text-[15px] font-semibold leading-[20px] text-[#111827]">
              {from.code}
            </span>
            <CaretDown size={12} weight="bold" color="#6b7280" />
          </button>
        </div>
        <input
          value={displayAmount}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => handleAmountInput(e.target.value)}
          inputMode="decimal"
          className="w-[170px] bg-transparent text-right font-mono text-[26px] font-bold leading-[32px] tracking-[-0.6px] text-[#111827] outline-none"
        />
      </motion.div>

      {/* Divider with FX pill + flip */}
      <div className="relative h-px bg-[#e5e7eb]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-[26px] items-center gap-[8px] rounded-full border border-[#e5e7eb] bg-white px-[12px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          <AnimatePresence mode="wait" initial={false}>
            {recalculating ? (
              <motion.span
                key="loading"
                className="flex items-center gap-[6px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="flex"
                >
                  <CircleNotch size={12} weight="bold" color="#ff6a00" />
                </motion.span>
                <span className="text-[11px] font-medium leading-[14px] text-[#6b7280]">
                  Updating rate…
                </span>
              </motion.span>
            ) : (
              <motion.span
                key={`rate-${fromCode}-${toCode}`}
                className="flex items-center gap-[8px]"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <span className="text-[11px] font-medium leading-[14px] text-[#374151]">
                  1 {from.code}
                </span>
                <ArrowCircleRight size={14} weight="fill" color="#111827" />
                <span className="text-[11px] font-semibold leading-[14px] text-[#111827]">
                  {formatRate(r)} {to.code}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={flip}
          className="absolute right-[16px] top-1/2 -translate-y-1/2 flex size-[32px] items-center justify-center rounded-full border border-[#e5e7eb] bg-white active:bg-[#fff1eb]"
          aria-label="Swap currencies"
        >
          <motion.span animate={rotateControls} initial={{ rotate: 0 }} className="flex">
            <ArrowsDownUp size={14} weight="bold" color="#ff6a00" />
          </motion.span>
        </button>
      </div>

      {/* Receive row */}
      <motion.div
        className="flex items-center justify-between px-[16px] py-[14px]"
        animate={recvControls}
        initial={{ y: 0 }}
      >
        <div className="flex flex-col gap-[6px]">
          <span className="text-[12px] leading-[16px] text-[#6b7280]">They receive</span>
          <button
            onClick={() => onOpenPicker("to")}
            className="flex h-[32px] items-center gap-[6px] active:opacity-70"
          >
            <Flag countryCode={to.countryCode} emoji={to.flag} size={22} />
            <span className="text-[15px] font-semibold leading-[20px] text-[#111827]">
              {to.code}
            </span>
            <CaretDown size={12} weight="bold" color="#6b7280" />
          </button>
        </div>
        <div className="relative w-[170px] text-right">
          <AnimatePresence mode="wait" initial={false}>
            {recalculating ? (
              <motion.span
                key="recv-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="inline-block h-[32px] w-[120px] rounded-[6px] bg-[#f1f1f4] shimmer align-middle"
              />
            ) : (
              <motion.span
                key={`recv-${fromCode}-${toCode}-${sendNum}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="inline-block font-mono text-[26px] font-bold leading-[32px] tracking-[-0.6px] text-[#111827]"
              >
                {formatAmount(recvNum)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function formatAmount(n: number, plain = false): string {
  if (!isFinite(n)) return "0.00";
  const formatted = n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return plain ? formatted.replace(/,/g, "") : formatted;
}

function formatRate(r: number): string {
  if (r >= 100) return r.toFixed(0);
  if (r >= 10) return r.toFixed(2);
  if (r >= 1) return r.toFixed(3);
  return r.toFixed(4);
}
