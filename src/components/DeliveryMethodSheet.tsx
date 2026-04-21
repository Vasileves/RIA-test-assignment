"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bank, Coins, CurrencyBtc, CaretRight } from "@phosphor-icons/react";
import type { DeliveryMethod } from "@/lib/sendMoney";

const OPTIONS: {
  id: DeliveryMethod;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: "bank",
    title: "Bank deposit",
    subtitle: "Lands in their account, usually within minutes",
    icon: <Bank size={22} weight="regular" />,
    iconBg: "#fff1eb",
    iconColor: "#ff6a00",
  },
  {
    id: "cash",
    title: "Cash pickup",
    subtitle: "Picked up in person at a partner location",
    icon: <Coins size={22} weight="regular" />,
    iconBg: "#fef3c7",
    iconColor: "#b45309",
  },
  {
    id: "crypto",
    title: "Crypto wallet",
    subtitle: "Send to a verified crypto wallet address",
    icon: <CurrencyBtc size={22} weight="regular" />,
    iconBg: "#ede9fe",
    iconColor: "#6d28d9",
  },
];

export function DeliveryMethodSheet({
  open,
  selected,
  onBack,
  onClose,
  onSelect,
}: {
  open: boolean;
  selected?: DeliveryMethod;
  onBack: () => void;
  onClose: () => void;
  onSelect: (method: DeliveryMethod) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="delivery"
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
          <motion.div
            className="absolute bottom-0 left-0 right-0 flex flex-col overflow-hidden rounded-t-[32px] bg-white"
            style={{ paddingBottom: 36 }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
          >
            <div className="flex items-start justify-center pt-[16px] pb-[8px]">
              <div className="h-[6px] w-[48px] rounded-full bg-[rgba(226,191,176,0.5)]" />
            </div>

            <div className="relative flex h-[60px] items-center px-[16px]">
              <button
                onClick={onBack}
                aria-label="Back"
                className="flex size-[28px] items-center justify-center rounded-full active:bg-black/5"
              >
                <ArrowLeft size={22} weight="regular" color="#111827" />
              </button>
              <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium leading-[28px] tracking-[-0.45px] text-[#111827]">
                Choose how they get it
              </h1>
            </div>

            <div className="flex flex-col gap-[8px] px-[16px] py-[8px]">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSelect(opt.id)}
                  className="flex w-full items-center gap-[12px] rounded-[16px] border border-[#e5e7eb] bg-white px-[14px] py-[14px] text-left active:bg-[#fafafa]"
                  style={{
                    outline: selected === opt.id ? "2px solid #ff6a00" : undefined,
                    outlineOffset: -2,
                  }}
                >
                  <span
                    className="flex size-[40px] items-center justify-center rounded-full"
                    style={{ background: opt.iconBg, color: opt.iconColor }}
                  >
                    {opt.icon}
                  </span>
                  <div className="flex flex-1 flex-col gap-[2px]">
                    <span className="text-[14px] font-bold leading-[20px] text-[#111827]">
                      {opt.title}
                    </span>
                    <span className="text-[12px] leading-[16px] text-[#6b7280]">
                      {opt.subtitle}
                    </span>
                  </div>
                  <CaretRight size={18} weight="regular" color="#9ca3af" />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
