"use client";

import { motion } from "framer-motion";
import { Check, Clock, X } from "@phosphor-icons/react";
import type { Recipient } from "@/lib/sendMoney";

export type ResultStatus = "success" | "fail" | "pending";

export function TransferResultScreen({
  status,
  amount,
  recipient,
  reference = "TX-102838472",
  onDone,
  onAnother,
}: {
  status: ResultStatus;
  amount: number;
  recipient: Recipient;
  reference?: string;
  onDone: () => void;
  onAnother: () => void;
}) {
  const recipientName = recipient.toSelf
    ? "yourself"
    : `${recipient.firstName} ${recipient.lastName.charAt(0)}.`;
  const amountStr = `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const config = {
    success: {
      bg: "#16a34a",
      icon: <Check size={48} weight="bold" color="#ffffff" />,
      title: "Transfer sent",
      copy: `${amountStr} sent to ${recipientName}`,
    },
    pending: {
      bg: "#f59e0b",
      icon: <Clock size={48} weight="fill" color="#ffffff" />,
      title: "Transfer pending",
      copy: `Your bank is still processing this transfer. We'll notify you when ${amountStr} reaches ${recipientName}.`,
    },
    fail: {
      bg: "#dc2626",
      icon: <X size={48} weight="bold" color="#ffffff" />,
      title: "Transfer failed",
      copy: "Your bank declined the transfer. No money has been taken from your account.",
    },
  }[status];

  return (
    <div className="relative h-full w-full bg-[var(--app-bg)] overflow-hidden">
      <div className="flex h-full w-full flex-col px-[24px] pb-[36px] pt-[120px]">
        {/* Hero */}
        <div className="flex flex-col items-center gap-[24px]">
          <motion.div
            className="flex size-[96px] items-center justify-center rounded-full"
            style={{ background: config.bg }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
          >
            {config.icon}
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-[8px]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[28px] font-bold leading-[36px] tracking-[-0.7px] text-[#111827]">
              {config.title}
            </h1>
            <p className="text-center text-[14px] leading-[20px] text-[#6b7280] max-w-[300px]">
              {config.copy}
            </p>
          </motion.div>
        </div>

        {/* Detail card */}
        <motion.div
          className="mt-[32px] flex flex-col gap-[12px] rounded-[16px] bg-white p-[16px] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          {status === "success" && (
            <>
              <DetailRow label="Amount" value={amountStr} bold />
              <DetailRow label="To" value={recipientName} bold />
              <DetailRow label="Arrives" value="Instant" bold />
              <DetailRow label="Reference" value={reference} bold />
            </>
          )}
          {status === "pending" && (
            <>
              <DetailRow label="Amount" value={amountStr} bold />
              <DetailRow label="To" value={recipientName} bold />
              <DetailRow label="Estimated" value="1–3 business days" bold />
              <DetailRow label="Reference" value={reference} bold />
            </>
          )}
          {status === "fail" && (
            <>
              <DetailRow label="Reason" value="Insufficient funds" bold />
              <DetailRow label="Amount attempted" value={amountStr} bold />
              <DetailRow label="Error code" value="E-1047" bold />
            </>
          )}
        </motion.div>

        <div className="flex-1" />

        {/* Footer actions */}
        <motion.div
          className="flex flex-col gap-[8px]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={onDone}
            className="flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#ff6a00] text-[14px] font-bold leading-[20px] text-white active:bg-[#e85f00]"
          >
            Done
          </button>
          <button
            onClick={onAnother}
            className="flex h-[48px] w-full items-center justify-center text-[14px] font-bold leading-[20px] text-[#111827] active:opacity-60"
          >
            {status === "fail" ? "Try again" : "Send another transfer"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] leading-[18px] text-[#6b7280]">{label}</span>
      <span
        className={`text-[14px] leading-[20px] text-[#111827] ${
          bold ? "font-bold font-mono" : "font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
