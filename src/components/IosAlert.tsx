"use client";

import { AnimatePresence, motion } from "framer-motion";

export type AlertAction = {
  label: string;
  style?: "default" | "destructive" | "cancel";
  onSelect: () => void;
};

export function IosAlert({
  open,
  title,
  message,
  actions,
  onDismiss,
}: {
  open: boolean;
  title: string;
  message?: string;
  actions: AlertAction[];
  onDismiss?: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute modal-fullbleed z-[60] flex items-center justify-center px-[40px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.32)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
            }}
            onClick={onDismiss}
          />
          {/* Dialog */}
          <motion.div
            className="relative w-[270px] overflow-hidden rounded-[14px]"
            style={{
              background: "rgba(247,247,247,0.88)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
            }}
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            {/* Content */}
            <div className="flex flex-col items-center gap-[4px] px-[16px] pt-[19px] pb-[20px] text-center">
              <h2 className="text-[17px] font-semibold leading-[22px] tracking-[-0.4px] text-[#1c1c1e]">
                {title}
              </h2>
              {message && (
                <p className="text-[13px] font-normal leading-[18px] text-[#1c1c1e]">
                  {message}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-[rgba(60,60,67,0.29)]" />

            {/* Actions row */}
            <div className="flex">
              {actions.map((action, idx) => (
                <AlertButton
                  key={action.label}
                  action={action}
                  isLast={idx === actions.length - 1}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AlertButton({
  action,
  isLast,
}: {
  action: AlertAction;
  isLast: boolean;
}) {
  const color =
    action.style === "destructive" ? "#ff3b30" : "#007aff";
  const weight = action.style === "cancel" ? "font-normal" : "font-semibold";

  return (
    <button
      onClick={action.onSelect}
      className={`relative flex-1 py-[11px] text-[17px] leading-[22px] active:bg-[rgba(0,0,0,0.06)] ${weight}`}
      style={{ color }}
    >
      {action.label}
      {!isLast && (
        <span className="absolute right-0 top-0 h-full w-px bg-[rgba(60,60,67,0.29)]" />
      )}
    </button>
  );
}
