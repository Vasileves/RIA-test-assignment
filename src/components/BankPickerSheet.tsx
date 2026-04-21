"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bank as BankIcon, MagnifyingGlass } from "@phosphor-icons/react";
import { type Bank, POPULAR_BANKS, OTHER_BANKS } from "@/lib/sendMoney";

export function BankPickerSheet({
  open,
  selectedId,
  onClose,
  onSelect,
}: {
  open: boolean;
  selectedId?: string;
  onClose: () => void;
  onSelect: (bank: Bank) => void;
}) {
  const [query, setQuery] = useState("");

  const filt = (list: Bank[]) =>
    list.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="bank"
          className="absolute left-0 right-0 bottom-0 z-[60] flex flex-col bg-white"
          style={{ top: 47 }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="relative flex h-[60px] items-center px-[16px]">
            <button
              onClick={onClose}
              aria-label="Back"
              className="flex size-[28px] items-center justify-center rounded-full active:bg-black/5"
            >
              <ArrowLeft size={22} weight="regular" color="#111827" />
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium leading-[28px] tracking-[-0.45px] text-[#111827]">
              Select bank
            </h1>
          </div>

          <div className="px-[16px] pb-[12px]">
            <label className="flex h-[44px] w-full items-center gap-[8px] rounded-[12px] bg-[#f3f4f6] px-[12px]">
              <MagnifyingGlass size={18} weight="regular" color="#6b7280" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bank"
                className="flex-1 bg-transparent text-[14px] leading-[20px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
              />
            </label>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-[16px] pb-[16px]">
            <Section title="POPULAR" banks={filt(POPULAR_BANKS)} selectedId={selectedId} onSelect={onSelect} />
            <Section title="OTHER BANKS" banks={filt(OTHER_BANKS)} selectedId={selectedId} onSelect={onSelect} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  banks,
  selectedId,
  onSelect,
}: {
  title: string;
  banks: Bank[];
  selectedId?: string;
  onSelect: (b: Bank) => void;
}) {
  if (banks.length === 0) return null;
  return (
    <div className="flex flex-col py-[12px]">
      <span className="px-[4px] pb-[8px] text-[11px] font-semibold uppercase tracking-[0.6px] text-[#6b7280]">
        {title}
      </span>
      <div className="flex flex-col">
        {banks.map((b, i) => (
          <button
            key={b.id}
            onClick={() => onSelect(b)}
            className="flex h-[56px] w-full items-center gap-[12px] px-[8px] text-left active:bg-[#f5f5f7]"
            style={{
              borderTop: i > 0 ? "1px solid #f1f1f4" : undefined,
            }}
          >
            <span
              className="flex size-[36px] items-center justify-center rounded-[8px] text-white"
              style={{ background: b.logoColor }}
            >
              <BankIcon size={18} weight="bold" />
            </span>
            <span className="flex-1 text-[14px] font-medium leading-[20px] text-[#111827]">
              {b.name}
            </span>
            {selectedId === b.id && (
              <span className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#ff6a00]">
                Selected
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
