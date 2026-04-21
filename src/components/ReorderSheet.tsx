"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { DotsSixVertical, X } from "@phosphor-icons/react";
import { type CardData } from "@/components/WalletCard";
import { IosAlert } from "@/components/IosAlert";
import { MINI_GRADIENTS } from "@/lib/cardThemes";

export function ReorderSheet({
  open,
  cards,
  onSave,
  onCancel,
  onRemoveCard,
}: {
  open: boolean;
  cards: CardData[];
  onSave: (orderedIds: string[]) => void;
  onCancel: () => void;
  onRemoveCard: (cardId: string) => void;
}) {
  const [order, setOrder] = useState<CardData[]>(cards);
  const [pendingRemove, setPendingRemove] = useState<CardData | null>(null);

  useEffect(() => {
    if (open) setOrder(cards);
  }, [open, cards]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="reorder-backdrop"
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
            onClick={onCancel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="reorder-sheet"
            layout
            className="absolute bottom-0 left-0 right-0 z-40 flex max-h-[88%] flex-col overflow-hidden rounded-t-[32px] bg-white"
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
            <div className="flex h-[41px] items-center justify-center py-[2px]">
              <h1 className="text-[20px] font-semibold leading-[28px] tracking-[-0.5px] text-[#261812]">
                Reorder
              </h1>
            </div>

            {/* List — scrollable when there are many cards */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <Reorder.Group
                axis="y"
                values={order}
                onReorder={setOrder}
                className="flex flex-col px-[12px] py-[8px]"
              >
                {order.map((card, idx) => (
                  <ReorderRow
                    key={card.id}
                    card={card}
                    isLast={idx === order.length - 1}
                    onRemove={() => setPendingRemove(card)}
                  />
                ))}
              </Reorder.Group>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-[16px] border-t border-[#fff1eb] px-[12px] pt-[20px]">
              <button
                onClick={() => onSave(order.map((c) => c.id))}
                className="flex h-[56px] w-full items-center justify-center rounded-[12px] bg-[#ff6a00] px-[24px] py-[14px] text-[14px] font-bold leading-[20px] text-white active:bg-[#e85f00]"
              >
                Continue
              </button>
              <button
                onClick={onCancel}
                className="flex w-full items-center justify-center py-[8px] text-[16px] font-bold leading-[24px] text-[#5a4136] active:opacity-60"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <IosAlert
        open={!!pendingRemove}
        title="Remove this card?"
        message={
          pendingRemove
            ? `${pendingRemove.title.charAt(0) + pendingRemove.title.slice(1).toLowerCase()} will disappear from your wallet. You can re-add it later from your bank.`
            : ""
        }
        actions={[
          { label: "Cancel", style: "cancel", onSelect: () => setPendingRemove(null) },
          {
            label: "Remove",
            style: "destructive",
            onSelect: () => {
              if (pendingRemove) {
                onRemoveCard(pendingRemove.id);
                setOrder((curr) => {
                  const next = curr.filter((c) => c.id !== pendingRemove.id);
                  // Close the sheet automatically once the wallet is empty
                  if (next.length === 0) onCancel();
                  return next;
                });
              }
              setPendingRemove(null);
            },
          },
        ]}
        onDismiss={() => setPendingRemove(null)}
      />
    </>
  );
}

function ReorderRow({
  card,
  isLast,
  onRemove,
}: {
  card: CardData;
  isLast: boolean;
  onRemove: () => void;
}) {
  return (
    <Reorder.Item
      value={card}
      className={`flex items-center gap-[16px] py-[16px] cursor-grab active:cursor-grabbing select-none ${
        isLast ? "" : "border-b border-[#fff1eb]"
      }`}
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 12px 24px -4px rgba(0,0,0,0.15)",
        zIndex: 10,
      }}
    >
      <button
        onClick={onRemove}
        onPointerDownCapture={(e) => e.stopPropagation()}
        aria-label={`Remove ${card.title}`}
        className="flex size-[24px] items-center justify-center rounded-full text-[#9ca3af] active:text-[#dc2626]"
      >
        <X size={20} weight="bold" />
      </button>

      <div
        className="relative flex h-[40px] w-[64px] items-center justify-end overflow-hidden rounded-[8px] px-[8px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
        style={{
          background: MINI_GRADIENTS[card.theme],
          border:
            card.theme === "sharedGroceries"
              ? "1px solid rgba(226,191,176,0.5)"
              : undefined,
        }}
      >
        <span
          className="text-[8px] font-normal leading-[12px] tracking-[0.8px]"
          style={{
            color:
              card.theme === "sharedGroceries"
                ? "rgba(38,24,18,0.8)"
                : "rgba(255,255,255,0.8)",
          }}
        >
          ••••
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <span className="text-[14px] font-semibold leading-[20px] text-[#261812] truncate">
          {card.title.charAt(0) + card.title.slice(1).toLowerCase()}
        </span>
        <span className="text-[14px] font-medium leading-[20px] text-[#5a4136]">
          •••• {card.last4}
        </span>
      </div>

      <div className="flex h-[32px] w-[26px] items-center justify-center text-[#9ca3af]">
        <DotsSixVertical size={20} weight="bold" />
      </div>
    </Reorder.Item>
  );
}
