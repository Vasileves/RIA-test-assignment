"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PaperPlaneTilt, Plus, Wrench } from "@phosphor-icons/react";
import { ASSETS } from "@/lib/assets";
import { ShoppingCartSimple, ForkKnife, Television, ArrowsLeftRight, Wallet, GasPump, Basket } from "@phosphor-icons/react";
import { BottomNav } from "@/components/BottomNav";
import { CardCarousel } from "@/components/CardCarousel";
import { IosPrompt } from "@/components/IosPrompt";
import { OnboardingStories } from "@/components/OnboardingStories";
import { INITIAL_CARDS, TRANSACTIONS_BY_CARD, type Transaction } from "@/lib/cards";

export function HomeScreen({
  cards = INITIAL_CARDS,
  activeCardId,
  onOpenManageCard,
  onOpenCardInfo,
  onOpenReorder,
  onOpenAddCard,
  onOpenSendMoney,
  onSendFromCard,
  onChangeActive,
  onRenameCard,
  removingCardId,
  droppingCardId,
}: {
  cards?: typeof INITIAL_CARDS;
  activeCardId?: string;
  onOpenManageCard?: (cardId: string) => void;
  onOpenCardInfo?: (cardId: string) => void;
  onOpenReorder?: () => void;
  onOpenAddCard?: () => void;
  onOpenSendMoney?: () => void;
  onSendFromCard?: (cardId: string) => void;
  onChangeActive?: (cardId: string) => void;
  onRenameCard?: (cardId: string, newName: string) => void;
  removingCardId?: string | null;
  droppingCardId?: string | null;
} = {}) {
  const [localActive, setLocalActive] = useState<string | undefined>(
    activeCardId ?? cards[1]?.id ?? cards[0]?.id,
  );
  const active = activeCardId ?? localActive ?? cards[0]?.id ?? "";

  const activeIdx = Math.max(
    0,
    cards.findIndex((c) => c.id === active),
  );
  const curr = cards[activeIdx];

  const setActive = (id: string) => {
    setLocalActive(id);
    onChangeActive?.(id);
  };

  // Pencil opens iOS rename prompt directly. Eye is a shortcut to "show card info" —
  // it opens the Manage Card sheet with autoReveal so Face ID + flip happen in sequence.
  const [renamingCardId, setRenamingCardId] = useState<string | null>(null);

  function handleEyeTap(cardId: string) {
    onOpenCardInfo?.(cardId);
  }

  function handlePenTap(cardId: string) {
    setRenamingCardId(cardId);
  }

  const renamingCard = cards.find((c) => c.id === renamingCardId) ?? null;

  // Per-card transactions with a brief loading state when the active card changes
  const [txLoading, setTxLoading] = useState(false);
  useEffect(() => {
    setTxLoading(true);
    const t = setTimeout(() => setTxLoading(false), 420);
    return () => clearTimeout(t);
  }, [active]);
  const activeCardExists = cards.some((c) => c.id === active);
  const txList: Transaction[] = activeCardExists ? TRANSACTIONS_BY_CARD[active] ?? [] : [];

  return (
    <div className="relative h-full w-full bg-[var(--app-bg)] overflow-hidden">
      {/* Scrollable content (header scrolls with content). top-[47px]
          leaves room for the iOS status bar icons. */}
      <div className="absolute inset-x-0 top-[47px] bottom-[84px] overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-[24px] pb-[16px]">
          {/* Header */}
          <div className="flex h-[42px] items-end justify-between px-[12px] pt-[10px]">
            <div className="flex h-[32px] items-center gap-[4px]">
              <Image src={ASSETS.userCircle} alt="" width={28} height={28} />
              <span className="text-[14px] font-semibold tracking-[-0.45px] leading-[28px] text-[#111827]">
                Tiago L.
              </span>
            </div>
            <button className="flex size-[32px] items-center justify-center">
              <Image src={ASSETS.question} alt="Help" width={28} height={28} />
            </button>
          </div>

          {/* Onboarding stories (drag-scrollable) */}
          <div>
            <OnboardingStories />
          </div>

          {/* Wallet section */}
          <div className="flex flex-col gap-[12px]">
            <div className="flex h-[28px] items-center justify-between px-[16px]">
              <h2 className="text-[20px] font-semibold leading-[28px] tracking-[-0.5px] text-[#111827]">
                Your Wallet
              </h2>
              {cards.length > 0 && (
                <div className="flex items-center gap-[24px]">
                  <button onClick={onOpenReorder} className="flex items-center gap-[4px]">
                    <Image src={ASSETS.listNumbers} alt="" width={24} height={24} />
                    <span className="text-[14px] font-medium leading-[20px] text-[var(--brand)]">
                      Reorder
                    </span>
                  </button>
                  <button onClick={onOpenAddCard} className="flex items-center gap-[4px]">
                    <Image src={ASSETS.plusCircle} alt="" width={18} height={18} />
                    <span className="text-[14px] font-medium leading-[20px] text-[var(--brand)]">
                      Add
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Cards carousel — full-width so adjacent cards peek */}
            <CardCarousel
              cards={cards}
              activeId={active}
              onChangeActive={setActive}
              onCardTap={(id) => onOpenManageCard?.(id)}
              onEyeTap={handleEyeTap}
              onPenTap={handlePenTap}
              onRenameCard={onRenameCard}
              removingCardId={removingCardId}
              droppingCardId={droppingCardId}
              onAddCard={onOpenAddCard}
            />
          </div>

          {/* Action buttons — hidden when wallet is empty. All icons rendered
              at identical size + weight for visual rhythm. */}
          {cards.length > 0 && (
            <div className="mx-auto flex h-[53px] w-[366px] items-center justify-center gap-[32px] rounded-[16px] py-[12px]">
              <ActionIconButton
                icon={<Plus size={22} weight="regular" color="#111827" />}
                label="Add Money"
              />
              <ActionIconButton
                icon={<PaperPlaneTilt size={22} weight="regular" color="#111827" />}
                label="Send"
                onClick={() =>
                  curr ? onSendFromCard?.(curr.id) : onOpenSendMoney?.()
                }
              />
              <ActionIconButton
                icon={<Wrench size={22} weight="regular" color="#111827" />}
                label="Manage Card"
                onClick={() => curr && onOpenManageCard?.(curr.id)}
              />
            </div>
          )}

          {/* Recent activity */}
          <div className="mx-auto flex w-[366px] flex-col gap-[16px]">
            <div className="flex items-center justify-between px-[4px]">
              <h2 className="text-[20px] font-semibold leading-[28px] tracking-[-0.5px] text-[#1a1a1a]">
                Recent Activity
              </h2>
              <button className="text-[14px] font-semibold leading-[20px] text-[var(--brand)]">
                See all
              </button>
            </div>
            <div className="relative flex min-h-[182px] flex-col rounded-[16px] border border-[var(--card-border)] bg-white px-[12px] py-[4px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <AnimatePresence mode="wait">
                {txLoading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col"
                  >
                    <SkeletonRow />
                    <Divider />
                    <SkeletonRow />
                    <Divider />
                    <SkeletonRow />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`tx-${active || "empty"}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col"
                  >
                    {!activeCardExists ? (
                      <ActivityEmptyState />
                    ) : txList.length === 0 ? (
                      <div className="py-[24px] text-center text-[12px] text-[#666]">
                        No recent activity for this card.
                      </div>
                    ) : (
                      txList.map((tx, i) => (
                        <div key={tx.id} className="flex flex-col">
                          <ActivityRow tx={tx} />
                          {i < txList.length - 1 && <Divider />}
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="home" onSendMoney={onOpenSendMoney} />

      <IosPrompt
        open={!!renamingCard}
        title="Rename card"
        message="Give this card a nickname you'll recognize."
        initialValue={renamingCard?.title ?? ""}
        placeholder="Card name"
        confirmLabel="Save"
        onConfirm={(newName) => {
          if (renamingCard) onRenameCard?.(renamingCard.id, newName.toUpperCase());
          setRenamingCardId(null);
        }}
        onCancel={() => setRenamingCardId(null)}
      />
    </div>
  );
}

/** Shared action button used by Add Money / Send / Manage Card.
 *  All icons render via Phosphor at size 22 / weight regular so their
 *  visual weight matches. Press state is a soft neutral pulse + scale. */
function ActionIconButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex h-[48px] w-[64px] flex-col items-center"
      whileTap="tap"
    >
      <motion.span
        className="absolute left-1/2 -translate-x-1/2 top-0 size-[28px] rounded-full bg-[#e5e7eb]/0 pointer-events-none"
        variants={{
          tap: { background: "#e5e7eb", scale: [1, 1.4], opacity: [0.9, 0] },
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className="absolute left-1/2 -translate-x-1/2 top-0 flex h-[24px] items-center justify-center"
        variants={{ tap: { scale: 0.88, y: 1 } }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
      >
        {icon}
      </motion.span>
      <span className="absolute bottom-0 text-[12px] font-medium leading-[16px] text-[#111827] whitespace-nowrap">
        {label}
      </span>
    </motion.button>
  );
}

function SendActionButton({ onClick }: { onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex h-[48px] w-[64px] flex-col items-center"
      whileTap="tap"
      whileHover="hover"
    >
      <motion.span
        className="absolute left-1/2 -translate-x-1/2 top-0 flex size-[28px] items-center justify-center rounded-full bg-[#e5e7eb]/0"
        variants={{
          tap: { background: "#e5e7eb", scale: [1, 1.4], opacity: [0.9, 0] },
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-0 flex items-center justify-center"
        variants={{
          hover: { y: -1 },
          tap: { scale: 0.88, rotate: -8 },
        }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
      >
        <PaperPlaneTilt size={23} weight="regular" color="#111827" style={{ transform: "translate(1px, -1px)" }} />
      </motion.div>
      <span className="absolute bottom-0 text-[12px] font-medium leading-[16px] text-[#111827] whitespace-nowrap">
        Send
      </span>
    </motion.button>
  );
}

function ActionButton({
  icon,
  iconW,
  iconH,
  label,
  rotate,
  onClick,
}: {
  icon: string;
  iconW: number;
  iconH: number;
  label: string;
  rotate?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex h-[48px] w-[64px] flex-col items-center"
      whileTap="tap"
    >
      {/* Soft neutral pulse on press (gray, matches monochrome icons) */}
      <motion.span
        className="absolute left-1/2 -translate-x-1/2 top-0 size-[28px] rounded-full bg-[#e5e7eb]/0 pointer-events-none"
        variants={{
          tap: { background: "#e5e7eb", scale: [1, 1.4], opacity: [0.9, 0] },
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: rotate ? 1 : 0 }}
        variants={{
          tap: { scale: 0.88, y: 1 },
        }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
      >
        <div className={rotate ? "-rotate-45" : ""}>
          <Image src={icon} alt="" width={iconW} height={iconH} />
        </div>
      </motion.div>
      <span className="absolute bottom-0 text-[12px] font-medium leading-[16px] text-[#111827] whitespace-nowrap">
        {label}
      </span>
    </motion.button>
  );
}

function Divider() {
  // Full-width divider inside the activity card padding box
  return <div className="h-px bg-[#eeeef0]" />;
}

function txStyle(kind: Transaction["iconKind"]): { bg: string; node: React.ReactNode } {
  switch (kind) {
    case "amazon":
      return { bg: "#eff6ff", node: <ShoppingCartSimple size={18} weight="regular" color="#2563eb" /> };
    case "starbucks":
      return { bg: "#fff7ed", node: <ForkKnife size={18} weight="regular" color="#ea580c" /> };
    case "subscription":
      return { bg: "#eef2ff", node: <Television size={18} weight="regular" color="#4f46e5" /> };
    case "transfer":
      return { bg: "#f1f5f9", node: <ArrowsLeftRight size={18} weight="regular" color="#475569" /> };
    case "salary":
      return { bg: "#ecfdf5", node: <Wallet size={18} weight="regular" color="#16a34a" /> };
    case "fuel":
      return { bg: "#fff1f2", node: <GasPump size={18} weight="regular" color="#e11d48" /> };
    case "groceries":
      return { bg: "#f0fdf4", node: <Basket size={18} weight="regular" color="#15803d" /> };
    default:
      return { bg: "#f5f5f7", node: null };
  }
}

function ActivityRow({ tx }: { tx: Transaction }) {
  const { bg, node } = txStyle(tx.iconKind);
  const isAvatar = tx.iconKind === "avatar";
  return (
    <div className="flex items-center justify-between py-[10px]">

      <div className="flex items-center gap-[12px]">
        {isAvatar ? (
          <div className="relative size-[36px] overflow-hidden rounded-full">
            <Image src={ASSETS.sarahAvatar} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div
            className="flex size-[36px] items-center justify-center rounded-full"
            style={{ background: bg }}
          >
            {node}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[14px] font-bold leading-[20px] text-[#1a1a1a]">{tx.name}</span>
          <span className="text-[12px] leading-[16px] text-[#666]">{tx.sub}</span>
        </div>
      </div>
      <span
        className={`font-mono text-[14px] font-bold leading-[20px] ${
          tx.positive ? "text-[#16a34a]" : "text-[#1a1a1a]"
        }`}
      >
        {tx.amount}
      </span>
    </div>
  );
}

function ActivityEmptyState() {
  return (
    <div className="flex flex-col items-center gap-[8px] py-[28px] text-center">
      <div className="flex flex-col gap-[6px] opacity-60">
        <div className="h-[10px] w-[140px] mx-auto rounded bg-[#eaeaee]" />
        <div className="h-[8px] w-[96px] mx-auto rounded bg-[#eaeaee]" />
      </div>
      <p className="text-[12px] leading-[16px] text-[#666] mt-[6px]">
        Your recent transactions will appear here
      </p>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-[10px]">
      <div className="flex items-center gap-[12px]">
        <div className="size-[36px] rounded-full bg-[#f1f1f4] shimmer" />
        <div className="flex flex-col gap-[6px]">
          <div className="h-[10px] w-[110px] rounded bg-[#f1f1f4] shimmer" />
          <div className="h-[8px] w-[78px] rounded bg-[#f1f1f4] shimmer" />
        </div>
      </div>
      <div className="h-[10px] w-[60px] rounded bg-[#f1f1f4] shimmer" />
    </div>
  );
}
