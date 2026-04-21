"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react";
import { CURRENCIES } from "@/lib/currencies";
import { Flag } from "@/components/Flag";

export function CurrencyPickerSheet({
  open,
  selectedCode,
  onClose,
  onSelect,
}: {
  open: boolean;
  selectedCode: string;
  onClose: () => void;
  onSelect: (code: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = CURRENCIES.filter((c) =>
    `${c.code} ${c.name}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="curr"
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
              Select currency
            </h1>
          </div>

          <div className="px-[16px] pb-[12px]">
            <label className="flex h-[44px] w-full items-center gap-[8px] rounded-[12px] bg-[#f3f4f6] px-[12px]">
              <MagnifyingGlass size={18} weight="regular" color="#6b7280" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search currency"
                className="flex-1 bg-transparent text-[14px] leading-[20px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
              />
            </label>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-[16px] pb-[16px]">
            {filtered.map((c, i) => (
              <button
                key={c.code}
                onClick={() => onSelect(c.code)}
                className="flex h-[60px] w-full items-center gap-[12px] px-[8px] text-left active:bg-[#f5f5f7]"
                style={{
                  borderTop: i > 0 ? "1px solid #f1f1f4" : undefined,
                }}
              >
                <Flag countryCode={c.countryCode} emoji={c.flag} size={28} />
                <div className="flex flex-1 flex-col">
                  <span className="text-[14px] font-bold leading-[20px] text-[#111827]">
                    {c.code}
                  </span>
                  <span className="text-[12px] leading-[16px] text-[#6b7280]">
                    {c.name}
                  </span>
                </div>
                {selectedCode === c.code && (
                  <span className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#ff6a00]">
                    Selected
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
