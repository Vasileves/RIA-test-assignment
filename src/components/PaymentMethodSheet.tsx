"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppleLogo, Bank, Check, Storefront } from "@phosphor-icons/react";
import type { CardData } from "@/components/WalletCard";
import { MINI_GRADIENTS } from "@/lib/cardThemes";

export type PaymentMethod =
  | { kind: "card"; cardId: string }
  | { kind: "apple-pay" }
  | { kind: "seven-eleven" };

export function PaymentMethodSheet({
  open,
  cards,
  selected,
  onClose,
  onConfirm,
}: {
  open: boolean;
  cards: CardData[];
  selected: PaymentMethod | null;
  onClose: () => void;
  onConfirm: (method: PaymentMethod) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="payment"
          className="absolute modal-fullbleed z-[55]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: "rgba(15,18,28,0.62)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />
          <SheetBody
            cards={cards}
            selected={selected}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SheetBody({
  cards,
  selected,
  onClose,
  onConfirm,
}: {
  cards: CardData[];
  selected: PaymentMethod | null;
  onClose: () => void;
  onConfirm: (m: PaymentMethod) => void;
}) {
  const [pending, setPending] = useState<PaymentMethod | null>(selected);
  useEffect(() => {
    setPending(selected);
  }, [selected]);

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 flex max-h-[88%] flex-col overflow-hidden rounded-t-[32px] bg-white"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 340, damping: 34 }}
    >
      <div className="flex items-start justify-center pt-[16px] pb-[8px]">
        <div className="h-[6px] w-[48px] rounded-full bg-[rgba(226,191,176,0.5)]" />
      </div>

      <div className="flex h-[42px] items-center justify-center">
        <h1 className="text-[18px] font-medium leading-[28px] tracking-[-0.45px] text-[#261812]">
          Select payment method
        </h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <Section title="Your accounts">
          {cards.length === 0 ? (
            <EmptyHint>No linked cards yet — add one from your wallet.</EmptyHint>
          ) : (
            cards.map((c, i) => (
              <Row
                key={c.id}
                active={pending?.kind === "card" && pending.cardId === c.id}
                title={titleCase(c.title)}
                subtitle={`•••• ${c.last4} · ${i === 0 ? "Free" : "1.5%"} · Instant`}
                visual={<MiniCard theme={c.theme} />}
                onClick={() => setPending({ kind: "card", cardId: c.id })}
              />
            ))
          )}
        </Section>

        <Section title="Other ways to pay">
          <Row
            active={pending?.kind === "apple-pay"}
            title="Apple Pay"
            subtitle="1.5% · Instant"
            visual={
              <span className="flex size-[44px] items-center justify-center rounded-[10px] bg-black">
                <AppleLogo size={22} weight="fill" color="#ffffff" />
              </span>
            }
            onClick={() => setPending({ kind: "apple-pay" })}
          />
          <Row
            active={pending?.kind === "seven-eleven"}
            title="7-Eleven Cash"
            subtitle="$1.50 flat · In-person"
            visual={
              <span className="flex size-[44px] items-center justify-center rounded-[10px] bg-[#16a34a]">
                <Storefront size={22} weight="fill" color="#ffffff" />
              </span>
            }
            onClick={() => setPending({ kind: "seven-eleven" })}
          />
        </Section>
      </div>

      <div className="flex flex-col gap-[8px] px-[24px] pb-[36px] pt-[12px]">
        <button
          onClick={() => pending && onConfirm(pending)}
          disabled={!pending}
          className="flex h-[56px] w-full items-center justify-center rounded-[12px] bg-[#ff6a00] text-[14px] font-bold leading-[20px] text-white active:bg-[#e85f00] disabled:bg-[#ffb988] disabled:cursor-not-allowed"
        >
          Continue
        </button>
        <button
          onClick={onClose}
          className="flex h-[40px] w-full items-center justify-center text-[14px] font-bold leading-[20px] text-[#5a4136] active:opacity-60"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

/** Mini card preview matching the visual language of the Reorder list. */
function MiniCard({ theme }: { theme: CardData["theme"] }) {
  const isLight = theme === "sharedGroceries";
  return (
    <div
      className="relative flex h-[44px] w-[64px] items-center justify-end overflow-hidden rounded-[8px] px-[8px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
      style={{
        background: MINI_GRADIENTS[theme],
        border: isLight ? "1px solid rgba(226,191,176,0.5)" : undefined,
      }}
    >
      <span
        className="text-[8px] font-normal leading-[12px] tracking-[0.8px]"
        style={{
          color: isLight ? "rgba(38,24,18,0.8)" : "rgba(255,255,255,0.85)",
        }}
      >
        ••••
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px] px-[24px] pt-[12px] pb-[8px]">
      <h2 className="text-[14px] font-semibold leading-[20px] text-[#111827]">{title}</h2>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function Row({
  active,
  title,
  subtitle,
  visual,
  onClick,
}: {
  active?: boolean;
  title: string;
  subtitle: string;
  visual: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-[12px] py-[12px] text-left"
    >
      {visual}
      <div className="flex flex-1 flex-col gap-[2px]">
        <span className="text-[14px] font-bold leading-[20px] text-[#111827]">{title}</span>
        <span className="text-[12px] leading-[16px] text-[#6b7280]">{subtitle}</span>
      </div>
      {active && (
        <span className="flex size-[20px] items-center justify-center">
          <Check size={18} weight="bold" color="#ff6a00" />
        </span>
      )}
    </button>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[10px] py-[14px] text-[13px] text-[#6b7280]">
      <Bank size={18} weight="regular" />
      <span>{children}</span>
    </div>
  );
}

function titleCase(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}
