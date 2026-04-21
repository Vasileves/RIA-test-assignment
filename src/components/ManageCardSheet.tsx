"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CaretRight,
  Eye,
  EyeClosed,
  Lock,
  Prohibit,
  Snowflake,
  Trash,
} from "@phosphor-icons/react";
import { WalletCard, type CardData } from "@/components/WalletCard";
import { IosAlert } from "@/components/IosAlert";
import { IosPrompt } from "@/components/IosPrompt";
import { FaceIdPrompt } from "@/components/FaceIdPrompt";

type FaceIdIntent = null | "reveal" | "block";

export function ManageCardSheet({
  open,
  card,
  autoReveal,
  onAutoRevealConsumed,
  onClose,
  onSelectViewPin,
  onToggleFreeze,
  onBlockCard,
  onRemoveCard,
  onRenameCard,
}: {
  open: boolean;
  card: CardData | null;
  autoReveal?: boolean;
  onAutoRevealConsumed?: () => void;
  onClose: () => void;
  onSelectViewPin: () => void;
  onToggleFreeze: (cardId: string, nextFrozen: boolean) => void;
  onBlockCard: (cardId: string) => void;
  onRemoveCard: (cardId: string) => void;
  onRenameCard: (cardId: string, newName: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [faceIdIntent, setFaceIdIntent] = useState<FaceIdIntent>(null);
  const [freezeConfirm, setFreezeConfirm] = useState<null | { action: "freeze" | "unfreeze" }>(null);
  const [blockConfirm, setBlockConfirm] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [renamingCard, setRenamingCard] = useState(false);

  // Pop Face ID on the fly when the sheet is opened via the card's eye shortcut
  useEffect(() => {
    if (open && autoReveal) {
      setFaceIdIntent("reveal");
      onAutoRevealConsumed?.();
    }
  }, [open, autoReveal, onAutoRevealConsumed]);

  // Reset reveal / face id whenever the sheet fully closes
  function handleClose() {
    setRevealed(false);
    setFaceIdIntent(null);
    setFreezeConfirm(null);
    setBlockConfirm(false);
    setRemoveConfirm(false);
    onClose();
  }

  function requestReveal() {
    if (revealed) {
      setRevealed(false);
    } else {
      setFaceIdIntent("reveal");
    }
  }

  function onFaceIdSuccess() {
    if (faceIdIntent === "reveal") {
      setRevealed(true);
    } else if (faceIdIntent === "block") {
      setBlockConfirm(true);
    }
    setFaceIdIntent(null);
  }

  function commitBlock() {
    if (!card) return;
    const cardId = card.id;
    setBlockConfirm(false);
    handleClose();
    // Defer the block animation to the next frame so the close transition starts first
    setTimeout(() => onBlockCard(cardId), 350);
  }

  function commitRemove() {
    if (!card) return;
    onRemoveCard(card.id);
    setRemoveConfirm(false);
    handleClose();
  }

  const blocked = !!card?.blocked;

  function requestFreezeToggle() {
    if (!card) return;
    setFreezeConfirm({ action: card.frozen ? "unfreeze" : "freeze" });
  }

  function commitFreezeToggle() {
    if (!card || !freezeConfirm) return;
    onToggleFreeze(card.id, freezeConfirm.action === "freeze");
    setFreezeConfirm(null);
  }

  const frozen = !!card?.frozen;

  return (
    <>
      {/* Backdrop — separate AnimatePresence so it fades independently of the card */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
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
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Lifted card — layoutId animates in/out from the carousel position.
          No fade on exit; the card slides back to its home with its frozen state intact. */}
      <AnimatePresence>
        {open && card && (
          <motion.div
            key={`lifted-${card.id}`}
            className="absolute left-1/2 z-50 -translate-x-1/2"
            style={{ top: 100 }}
            layoutId={`card-${card.id}`}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <WalletCard
              card={card}
              width={330}
              height={199}
              flipped={revealed}
              showEye
              showPen
              onEyeTap={(e) => {
                e.stopPropagation();
                requestReveal();
              }}
              onPenTap={(e) => {
                e.stopPropagation();
                setRenamingCard(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && card && (
          <motion.div
            key="sheet"
            className="absolute bottom-0 left-0 right-0 z-40 flex max-h-[80%] flex-col overflow-hidden rounded-t-[32px] bg-white"
            style={{
              boxShadow: "0 -20px 40px 0 rgba(160,65,0,0.06)",
              paddingBottom: 36,
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
          >
            {/* Drag handle */}
            <div className="flex items-start justify-center pt-[16px] pb-[8px]">
              <div className="h-[6px] w-[48px] rounded-full bg-[rgba(226,191,176,0.5)]" />
            </div>

            {/* Header */}
            <div className="flex h-[41px] items-center justify-center py-[2px]">
              <h1 className="text-[18px] font-medium leading-[28px] tracking-[-0.45px] text-[#261812]">
                Manage card
              </h1>
            </div>

            {/* Menu — pb on the outer sheet handles clearance from the home indicator */}
            <div className="flex flex-col px-[12px] py-[8px]">
              {blocked && (
                <div className="mb-[10px] flex items-start gap-[10px] rounded-[12px] bg-[#fef2f2] px-[14px] py-[12px]">
                  <Prohibit size={18} weight="bold" color="#dc2626" />
                  <p className="flex-1 text-[12px] leading-[16px] text-[#7f1d1d]">
                    This card is blocked. It can't be used or reactivated — you can only remove it from your wallet.
                  </p>
                </div>
              )}
              <div className="flex flex-col overflow-hidden rounded-[16px]">
                {blocked ? (
                  // A blocked card can only be removed
                  <MenuRow
                    icon={<Trash size={22} weight="regular" color="#dc2626" />}
                    iconBg="#fef2f2"
                    title="Remove from wallet"
                    subtitle="This card is blocked and can't be reactivated"
                    danger
                    onClick={() => setRemoveConfirm(true)}
                  />
                ) : (
                  <>
                    {revealed ? (
                      <MenuRow
                        icon={<EyeClosed size={24} weight="regular" color="#111827" />}
                        iconBg="#f5f5f7"
                        title="Hide card info"
                        subtitle="Tap again to hide"
                        onClick={requestReveal}
                      />
                    ) : (
                      <MenuRow
                        icon={<Eye size={24} weight="regular" color="#111827" />}
                        iconBg="#f5f5f7"
                        title="Card info"
                        subtitle="Number, expiry and CVV"
                        onClick={requestReveal}
                      />
                    )}
                    <Divider />
                    <MenuRow
                      icon={<Lock size={22} weight="regular" color="#111827" />}
                      iconBg="#f5f5f7"
                      title="View PIN"
                      subtitle="Tap to reveal — use carefully"
                      onClick={onSelectViewPin}
                    />
                    <Divider />
                    <FreezeRow frozen={frozen} onClick={requestFreezeToggle} />
                    <Divider />
                    <MenuRow
                      icon={<Prohibit size={22} weight="regular" color="#dc2626" />}
                      iconBg="#fef2f2"
                      title="Block card"
                      subtitle="Use if the card is lost or stolen"
                      danger
                      onClick={() => setFaceIdIntent("block")}
                    />
                    <Divider />
                    <MenuRow
                      icon={<Trash size={22} weight="regular" color="#dc2626" />}
                      iconBg="#fef2f2"
                      title="Remove from wallet"
                      subtitle="Delete this card from the app"
                      danger
                      onClick={() => setRemoveConfirm(true)}
                    />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Face ID — used by both reveal and block flows */}
      <FaceIdPrompt
        open={!!faceIdIntent}
        label={
          faceIdIntent === "block"
            ? `Confirm to block ${card?.title ?? "card"}`
            : `Show details for ${card?.title ?? "card"}`
        }
        onSuccess={onFaceIdSuccess}
        onCancel={() => setFaceIdIntent(null)}
      />

      {/* Block confirm */}
      <IosAlert
        open={blockConfirm}
        title="Block this card?"
        message="Blocking is permanent. The card can't be unblocked — you'll need to remove it and request a new one."
        actions={[
          { label: "Cancel", style: "cancel", onSelect: () => setBlockConfirm(false) },
          { label: "Block", style: "destructive", onSelect: commitBlock },
        ]}
        onDismiss={() => setBlockConfirm(false)}
      />

      {/* Remove confirm */}
      <IosAlert
        open={removeConfirm}
        title="Remove this card?"
        message="It'll disappear from your wallet. You can re-add it later from your bank."
        actions={[
          { label: "Cancel", style: "cancel", onSelect: () => setRemoveConfirm(false) },
          { label: "Remove", style: "destructive", onSelect: commitRemove },
        ]}
        onDismiss={() => setRemoveConfirm(false)}
      />

      {/* Freeze confirm */}
      <IosAlert
        open={!!freezeConfirm}
        title={freezeConfirm?.action === "freeze" ? "Freeze this card?" : "Unfreeze this card?"}
        message={
          freezeConfirm?.action === "freeze"
            ? "We'll pause new transactions instantly. You can unfreeze it anytime from this menu."
            : "Transactions will resume right away on this card."
        }
        actions={[
          { label: "Cancel", style: "cancel", onSelect: () => setFreezeConfirm(null) },
          {
            label: freezeConfirm?.action === "freeze" ? "Freeze" : "Unfreeze",
            style: "destructive",
            onSelect: commitFreezeToggle,
          },
        ]}
        onDismiss={() => setFreezeConfirm(null)}
      />

      {/* Rename prompt */}
      <IosPrompt
        open={renamingCard && !!card}
        title="Rename card"
        message="Give this card a nickname you'll recognize."
        initialValue={card?.title ?? ""}
        placeholder="Card name"
        confirmLabel="Save"
        onConfirm={(newName) => {
          if (card) onRenameCard(card.id, newName.toUpperCase());
          setRenamingCard(false);
        }}
        onCancel={() => setRenamingCard(false)}
      />
    </>
  );
}

function FreezeRow({ frozen, onClick }: { frozen: boolean; onClick: () => void }) {
  return (
    <MenuRow
      icon={
        <motion.span
          initial={false}
          animate={{ color: frozen ? "#0ea5e9" : "#111827", rotate: frozen ? 30 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Snowflake size={22} weight={frozen ? "fill" : "regular"} />
        </motion.span>
      }
      iconBg={frozen ? "#e0f2fe" : "#f5f5f7"}
      title={frozen ? "Unfreeze card" : "Freeze card"}
      subtitle={frozen ? "Resume all transactions" : "Pause all transactions temporarily"}
      onClick={onClick}
    />
  );
}

function MenuRow({
  icon,
  iconBg,
  title,
  subtitle,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-[12px] px-[16px] py-[14px] text-left active:bg-[#fafafa]"
    >
      <div
        className="flex size-[40px] items-center justify-center overflow-hidden rounded-[8px]"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <p
          className="text-[14px] font-bold leading-[20px] whitespace-nowrap"
          style={{ color: danger ? "#dc2626" : "#111827" }}
        >
          {title}
        </p>
        <p className="text-[12px] font-normal leading-[16px] text-[#6b7280] whitespace-nowrap">
          {subtitle}
        </p>
      </div>
      <CaretRight size={20} weight="regular" color="#9ca3af" />
    </button>
  );
}

function Divider() {
  return (
    <div className="flex h-px items-center pl-[68px]">
      <div className="h-px w-[274px] bg-[#e5e7eb]" />
    </div>
  );
}

export type SheetView = "manage" | "view-card";
