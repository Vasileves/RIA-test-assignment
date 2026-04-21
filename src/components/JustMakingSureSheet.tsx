"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  HandWaving,
  Megaphone,
  Prohibit,
  ShieldCheck,
  Warning,
} from "@phosphor-icons/react";

type Attestation = "met" | "not-met";

export function JustMakingSureSheet({
  open,
  senderFirstName,
  recipientFirstName,
  onAgree,
  onCancel,
  onHelpMeDecide,
  onLearnMore,
}: {
  open: boolean;
  senderFirstName: string;
  recipientFirstName: string;
  onAgree: () => void;
  onCancel: () => void;
  onHelpMeDecide: () => void;
  onLearnMore: () => void;
}) {
  const [choice, setChoice] = useState<Attestation | null>(null);

  // Reset the attestation when the sheet closes so the next opening is clean.
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setChoice(null), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="just-making-sure"
          className="absolute modal-fullbleed z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: "rgba(38,24,18,0.4)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
            }}
            onClick={onCancel}
          />

          <motion.div
            className="absolute bottom-0 left-0 right-0 flex max-h-[92%] flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_-20px_40px_0_rgba(160,65,0,0.06)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
          >
            <div className="flex items-start justify-center pt-[16px] pb-[8px]">
              <div className="h-[6px] w-[48px] rounded-full bg-[rgba(226,191,176,0.5)]" />
            </div>

            <div className="relative flex h-[42px] items-center justify-center">
              <h1 className="text-[18px] font-semibold leading-[28px] tracking-[-0.45px] text-[#261812]">
                Just making sure
              </h1>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <div className="flex flex-col gap-[16px] px-[16px] pt-[8px] pb-[8px]">
                <p className="text-center text-[14px] font-medium leading-[20px] text-[#6b7280]">
                  {senderFirstName}, we noticed that you're sending money to a
                  new contact. Please review carefully:
                </p>

                <AttestationRow
                  label={`I've met ${recipientFirstName} in person`}
                  selected={choice === "met"}
                  onSelect={() => setChoice("met")}
                />
                <AttestationRow
                  label="I haven't met them in person"
                  selected={choice === "not-met"}
                  onSelect={() => setChoice("not-met")}
                />

                <AnimatePresence initial={false}>
                  {choice === "not-met" && (
                    <motion.div
                      key="precautions"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-[16px] rounded-[16px] border border-[#ffdad6] bg-[rgba(255,218,214,0.2)] p-[16px]">
                        <div className="flex items-center gap-[10px]">
                          <Warning size={22} weight="fill" color="#ba1a1a" />
                          <h2 className="text-[16px] font-bold leading-[24px] text-[#ba1a1a]">
                            Important Precautions
                          </h2>
                        </div>

                        <ul className="flex flex-col gap-[12px]">
                          <PrecautionItem
                            icon={<Prohibit size={16} weight="bold" color="#ba1a1a" />}
                          >
                            We cannot recover money sent to scammers.
                          </PrecautionItem>
                          <PrecautionItem
                            icon={<ShieldCheck size={16} weight="fill" color="#ba1a1a" />}
                          >
                            Verify the recipient&apos;s identity through a secondary
                            channel.
                          </PrecautionItem>
                          <PrecautionItem
                            icon={<Megaphone size={16} weight="fill" color="#ba1a1a" />}
                          >
                            Never send money to claim a prize, lottery, or promise of
                            romance.
                          </PrecautionItem>
                        </ul>

                        <button
                          onClick={onLearnMore}
                          className="self-start pl-[26px] text-[14px] font-medium leading-[20px] text-[#5a4136] underline underline-offset-2 active:opacity-70"
                        >
                          Learn more
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col gap-[12px] border-t border-[#fff1eb] px-[12px] pt-[16px] pb-[36px]">
              <button
                onClick={onAgree}
                disabled={!choice}
                className="flex h-[56px] w-full items-center justify-center rounded-[12px] bg-[#ff6a00] text-[14px] font-bold leading-[20px] text-white active:bg-[#e85f00] disabled:bg-[#ffb988]"
              >
                Agree &amp; Continue
              </button>
              <button
                onClick={onHelpMeDecide}
                className="flex h-[44px] w-full items-center justify-center gap-[6px] text-[14px] font-bold leading-[20px] text-[#5a4136] active:opacity-70"
              >
                <HandWaving size={16} weight="fill" color="#5a4136" />
                Help me decide
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AttestationRow({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex h-[56px] w-full items-center gap-[12px] rounded-[12px] border bg-white px-[16px] text-left transition-colors active:bg-[#fafafa]"
      style={{
        borderColor: selected ? "#ff6a00" : "#e5e7eb",
        background: selected ? "#fff7f0" : "#ffffff",
      }}
    >
      <span
        className="flex size-[22px] items-center justify-center rounded-full border-2 transition-colors"
        style={{
          borderColor: selected ? "#ff6a00" : "#d1d5db",
          background: selected ? "#ff6a00" : "#ffffff",
        }}
      >
        {selected && <Check size={14} weight="bold" color="#ffffff" />}
      </span>
      <span className="text-[14px] font-medium leading-[20px] text-[#111827]">
        {label}
      </span>
    </button>
  );
}

function PrecautionItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-[10px]">
      {/* Icon box matches the first line's line-height (20px) and the text's
          width (16px) so the icon is optically centered on the first line
          regardless of how many lines the copy wraps to. */}
      <span className="flex h-[20px] w-[16px] shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="flex-1 text-[14px] font-medium leading-[20px] text-[#5a4136]">
        {children}
      </span>
    </li>
  );
}
