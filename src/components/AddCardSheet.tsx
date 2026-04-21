"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CircleNotch, WarningCircle, WifiHigh } from "@phosphor-icons/react";
import type { CardData, CardTheme } from "@/components/WalletCard";

const DUMMY = {
  number: "4532 8901 2345 6789",
  holder: "ALEX MORGAN",
  expiry: "11/29",
  cvv: "814",
};

const RANDOM_THEMES: CardTheme[] = [
  "chaseDebit",
  "salaryChase",
  "virtualSubs",
  "sharedGroceries",
  "indigo",
  "emerald",
  "ruby",
  "amethyst",
];

const RANDOM_TITLES = [
  "PERSONAL CARD",
  "TRAVEL CARD",
  "BACKUP CARD",
  "DAILY SPEND",
  "FAMILY CARD",
  "SAVINGS CARD",
];

type Status = "idle" | "loading" | "error";

export function AddCardSheet({
  open,
  outcome = "success",
  onClose,
  onConfirm,
}: {
  open: boolean;
  outcome?: "success" | "fail";
  onClose: () => void;
  onConfirm: (card: CardData) => void;
}) {
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // Live ref so the timeout sees the latest outcome (prevents stale-closure bug)
  const outcomeRef = useRef(outcome);
  useEffect(() => {
    outcomeRef.current = outcome;
  }, [outcome]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStatus("idle");
    }
  }, [open]);

  function fillDummy() {
    setNumber(DUMMY.number);
    setHolder(DUMMY.holder);
    setExpiry(DUMMY.expiry);
    setCvv(DUMMY.cvv);
    setStatus("idle");
  }

  function reset() {
    setNumber("");
    setHolder("");
    setExpiry("");
    setCvv("");
    setStatus("idle");
  }

  function handleClose() {
    if (status === "loading") return;
    reset();
    onClose();
  }

  const allFilled = number && holder && expiry && cvv;

  function handleAdd() {
    if (!allFilled || status === "loading") return;
    setStatus("loading");
    setTimeout(() => {
      if (outcomeRef.current === "fail") {
        setStatus("error");
        return;
      }
      const last4 = number.replace(/\s+/g, "").slice(-4);
      const theme = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)];
      const title = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
      const newCard: CardData = {
        id: `c-${Date.now()}`,
        theme,
        title,
        last4,
        balance: "0.00",
        fullNumber: number,
        expiry,
        cvv,
        holder,
      };
      onConfirm(newCard);
      reset();
    }, 1300);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="addcard"
          className="absolute modal-fullbleed z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.55)" }}
            onClick={handleClose}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 flex max-h-[88%] flex-col overflow-hidden rounded-t-[24px] bg-white"
            style={{
              boxShadow:
                "0 4px 6px -4px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.1)",
              paddingBottom: 36,
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {/* Drag handle */}
            <div className="flex items-center justify-center pt-[10px]">
              <div className="h-[4px] w-[36px] rounded-full bg-[#cccccc]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-center py-[10px]">
              <h1 className="text-[18px] font-medium leading-[28px] tracking-[-0.45px] text-[#111827]">
                Add Card
              </h1>
            </div>

            {/* Mockup */}
            <div className="flex items-center justify-center py-[6px] px-[24px]">
              <MockupCard number={number} holder={holder} expiry={expiry} cvv={cvv} />
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-[12px] px-[24px] pt-[16px]">
              <BigInput
                label="Card number"
                placeholder="0000 0000 0000 0000"
                value={number || "0000 0000 0000 0000"}
                empty={!number}
                onTap={fillDummy}
                trailingIcon={<Camera size={22} weight="fill" color="#ff6a00" />}
                upperLabel
              />
              <SmallInput
                label="Cardholder name"
                placeholder="CHLOE SMITH"
                value={holder || "CHLOE SMITH"}
                empty={!holder}
                onTap={fillDummy}
              />
              <div className="flex gap-[12px]">
                <SmallInput
                  label="Expiry date"
                  placeholder="MM/YY"
                  value={expiry || "MM/YY"}
                  empty={!expiry}
                  onTap={fillDummy}
                />
                <SmallInput
                  label="CVV"
                  placeholder="000"
                  value={cvv || "000"}
                  empty={!cvv}
                  onTap={fillDummy}
                />
              </div>

              <AnimatePresence>
                {status === "error" && (
                  <motion.div
                    key="err"
                    className="flex items-start gap-[8px] rounded-[10px] bg-[#fef2f2] px-[12px] py-[10px]"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <WarningCircle size={16} weight="fill" color="#dc2626" />
                    <p className="flex-1 text-[12px] leading-[16px] text-[#7f1d1d]">
                      We couldn't link this card. Double-check the details and try again.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleAdd}
                disabled={!allFilled || status === "loading"}
                className="mt-[4px] flex h-[52px] w-full items-center justify-center gap-[8px] rounded-[12px] bg-[#ff6a00] px-[24px] py-[14px] text-[14px] font-bold leading-[20px] text-white disabled:bg-[#ffb988] disabled:cursor-not-allowed active:bg-[#e85f00] transition-colors"
              >
                {status === "loading" ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                      className="flex"
                    >
                      <CircleNotch size={18} weight="bold" color="#ffffff" />
                    </motion.span>
                    Linking card…
                  </>
                ) : status === "error" ? (
                  "Try again"
                ) : (
                  "Add Card"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MockupCard({
  number,
  holder,
  expiry,
  cvv,
}: {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}) {
  return (
    <div
      className="relative flex h-[192px] w-[320px] flex-col justify-between overflow-hidden rounded-[24px] p-[20px]"
      style={{
        background:
          "linear-gradient(135deg, #456ee0 0%, #294fad 100%)",
      }}
    >
      <div className="flex size-[36px] items-center justify-center rounded-full bg-white/[0.18]">
        <WifiHigh size={20} weight="bold" color="#ffffff" style={{ transform: "rotate(90deg)" }} />
      </div>
      <p className="font-mono text-[20px] font-bold leading-[26px] tracking-[1.6px] text-white whitespace-nowrap">
        {number || "0000 0000 0000 0000"}
      </p>
      <div className="flex w-full items-start gap-[20px] whitespace-nowrap">
        <div className="flex flex-1 flex-col gap-[4px]">
          <p className="text-[9px] font-medium leading-[12px] uppercase tracking-[0.9px] text-white/70">
            Cardholder name
          </p>
          <p className="text-[13px] font-semibold leading-[18px] text-white">
            {holder || "CHLOE SMITH"}
          </p>
        </div>
        <div className="flex flex-col gap-[4px]">
          <p className="text-[9px] font-medium leading-[12px] uppercase tracking-[0.9px] text-white/70">
            Expiry
          </p>
          <p className="font-mono text-[13px] font-bold leading-[18px] text-white">
            {expiry || "MM/YY"}
          </p>
        </div>
        <div className="flex flex-col gap-[4px]">
          <p className="text-[9px] font-medium leading-[12px] uppercase tracking-[0.9px] text-white/70">
            CVV
          </p>
          <p className="font-mono text-[13px] font-bold leading-[18px] text-white">
            {cvv || "123"}
          </p>
        </div>
      </div>
    </div>
  );
}

function BigInput({
  label,
  value,
  empty,
  onTap,
  trailingIcon,
  upperLabel,
}: {
  label: string;
  placeholder?: string;
  value: string;
  empty: boolean;
  onTap: () => void;
  trailingIcon?: React.ReactNode;
  upperLabel?: boolean;
}) {
  return (
    <button
      onClick={onTap}
      className="flex h-[56px] w-full items-center gap-[12px] rounded-[12px] border border-[#e5e7eb] bg-[#f8f9fa] px-[16px] py-[10px] text-left active:bg-[#eef0f2]"
    >
      <div className="flex flex-1 flex-col gap-[2px] min-w-0">
        <p
          className={`text-[11px] font-medium leading-[14px] uppercase tracking-[0.66px] text-[#6b7280] ${
            upperLabel ? "" : ""
          }`}
        >
          {label}
        </p>
        <p
          className={`text-[14px] leading-[20px] whitespace-nowrap ${
            empty ? "text-[#9ca3af]" : "text-black font-medium"
          }`}
        >
          {value}
        </p>
      </div>
      {trailingIcon}
    </button>
  );
}

function SmallInput({
  label,
  value,
  empty,
  onTap,
}: {
  label: string;
  placeholder?: string;
  value: string;
  empty: boolean;
  onTap: () => void;
}) {
  return (
    <button
      onClick={onTap}
      className="flex h-[56px] flex-1 min-w-0 flex-col items-start gap-[2px] rounded-[12px] border border-[#e5e7eb] bg-[#f8f9fa] px-[16px] py-[10px] text-left active:bg-[#eef0f2]"
    >
      <p className="text-[12px] font-normal leading-[16px] text-[#6b7280]">{label}</p>
      <p
        className={`text-[14px] leading-[20px] whitespace-nowrap ${
          empty ? "text-[#9ca3af]" : "text-[#111827] font-medium"
        }`}
      >
        {value}
      </p>
    </button>
  );
}
