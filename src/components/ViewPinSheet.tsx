"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeClosed,
  ShieldCheck,
} from "@phosphor-icons/react";
import { WalletCard, type CardData } from "@/components/WalletCard";

const FAKE_PIN = "1234";

export function ViewPinSheet({
  open,
  card,
  onBack,
  onClose,
}: {
  open: boolean;
  card: CardData | null;
  onBack: () => void;
  onClose: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const holdTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setRevealed(false);
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
    }
  }, [open]);

  function startHold(e: React.PointerEvent) {
    e.preventDefault();
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      setRevealed(true);
    }, 220);
  }

  function endHold() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setRevealed(false);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="pin-backdrop"
            className="absolute modal-fullbleed z-30"
            style={{
              background: "rgba(15,18,28,0.62)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && card && (
          <motion.div
            key={`pin-card-${card.id}`}
            className="absolute left-1/2 z-50 -translate-x-1/2"
            // Same dimensions and centering as the Manage Card lifted state —
            // layoutId only animates the vertical position change.
            style={{ top: 48 }}
            layoutId={`card-${card.id}`}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <WalletCard card={card} width={330} height={199} showEye={false} showPen={false} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && card && (
          <motion.div
            key="pin-sheet"
            layout
            className="absolute bottom-0 left-0 right-0 z-40 flex max-h-[80%] flex-col overflow-hidden rounded-t-[32px] bg-white"
            style={{
              boxShadow: "0 -20px 40px 0 rgba(160,65,0,0.06)",
              paddingBottom: 36,
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34, layout: { duration: 0.32, ease: [0.32, 0.72, 0, 1] } }}
          >
            {/* Drag handle */}
            <div className="flex items-start justify-center pt-[16px] pb-[8px]">
              <div className="h-[6px] w-[48px] rounded-full bg-[rgba(226,191,176,0.5)]" />
            </div>

            {/* Header */}
            <div className="relative flex h-[41px] items-center justify-center py-[2px]">
              <button
                onClick={onBack}
                aria-label="Back"
                className="absolute left-[16px] top-1/2 -translate-y-1/2 flex size-[28px] items-center justify-center rounded-full active:bg-[#f5f5f7]"
              >
                <ArrowLeft size={22} weight="regular" color="#111827" />
              </button>
              <h1 className="text-[18px] font-medium leading-[28px] tracking-[-0.45px] text-[#261812]">
                Your PIN
              </h1>
            </div>

            <div className="flex flex-col gap-[16px] px-[24px] py-[8px]">
              <p className="text-center text-[12px] font-normal leading-[16px] text-[#6b7280]">
                Use it for ATM withdrawals and in-store card purchases.
              </p>

              {/* PIN digits */}
              <div className="flex items-center justify-center gap-[12px] py-[12px]">
                {FAKE_PIN.split("").map((digit, i) => (
                  <PinBox key={i} digit={digit} revealed={revealed} index={i} />
                ))}
              </div>

              {/* Tap and hold */}
              <button
                onPointerDown={startHold}
                onPointerUp={endHold}
                onPointerLeave={endHold}
                onPointerCancel={endHold}
                className="flex w-full items-center justify-center gap-[8px] rounded-[12px] border border-[#e5e7eb] bg-[#f8f9fa] px-[16px] py-[12px] active:bg-[#eef0f2] select-none touch-none"
              >
                {revealed ? (
                  <EyeClosed size={18} weight="regular" color="#111827" />
                ) : (
                  <Eye size={18} weight="regular" color="#111827" />
                )}
                <span className="text-[14px] font-bold leading-[20px] text-[#111827]">
                  {revealed ? "Release to hide" : "Tap and hold to reveal"}
                </span>
              </button>

              {/* Safety tips */}
              <div className="flex flex-col gap-[10px] rounded-[16px] bg-[#f8f9fa] px-[16px] py-[14px]">
                <div className="flex items-center gap-[8px]">
                  <ShieldCheck size={18} weight="regular" color="#111827" />
                  <span className="text-[14px] font-bold leading-[20px] text-[#111827]">
                    Keep your PIN safe
                  </span>
                </div>
                <Tip>Our team will never ask for your PIN.</Tip>
                <Tip>Don't write it down or store it with your card.</Tip>
                <Tip>Change it if you think someone has seen it.</Tip>
              </div>

              <button className="flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#f5f5f7] px-[24px] py-[14px] active:bg-[#eaeaef]">
                <span className="text-[14px] font-bold leading-[20px] text-[#111827]">
                  Change PIN
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PinBox({
  digit,
  revealed,
  index,
}: {
  digit: string;
  revealed: boolean;
  index: number;
}) {
  return (
    <div className="relative flex h-[72px] w-[60px] items-center justify-center overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-[#f8f9fa]">
      <AnimatePresence mode="wait">
        {revealed ? (
          <motion.span
            key="digit"
            className="font-mono text-[24px] font-bold leading-[40px] tracking-[-0.9px] text-[#111827]"
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.22, delay: index * 0.06 }}
          >
            {digit}
          </motion.span>
        ) : (
          <motion.span
            key="hash"
            className="font-mono text-[24px] font-bold leading-[40px] tracking-[-0.9px] text-[#9ca3af]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            #
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-[10px]">
      <span className="mt-[7px] inline-block size-[4px] shrink-0 rounded-full bg-[#111827]" />
      <span className="text-[12px] leading-[16px] text-[#111827]">{children}</span>
    </div>
  );
}
