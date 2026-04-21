"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DeviceFrame } from "@/components/DeviceFrame";
import { HomeScreen } from "@/screens/HomeScreen";
import { ManageCardSheet } from "@/components/ManageCardSheet";
import { ViewPinSheet } from "@/components/ViewPinSheet";
import { ReorderSheet } from "@/components/ReorderSheet";
import { AddCardSheet } from "@/components/AddCardSheet";
import { RecipientFlow } from "@/components/RecipientFlow";
import { SendMoneyScreen } from "@/screens/SendMoneyScreen";
import { TransferResultScreen } from "@/screens/TransferResultScreen";
import { ScenariosPanel, type Scenarios } from "@/components/ScenariosPanel";
import { PaymentMethodSheet, type PaymentMethod } from "@/components/PaymentMethodSheet";
import type { Recipient } from "@/lib/sendMoney";
import { INITIAL_CARDS } from "@/lib/cards";
import type { CardData } from "@/components/WalletCard";

const EASE = [0.32, 0.72, 0, 1] as const;

type ModalState =
  | { kind: "none" }
  | { kind: "manage"; cardId: string; autoReveal?: boolean }
  | { kind: "view-pin"; cardId: string }
  | { kind: "reorder" }
  | { kind: "add-card" }
  | { kind: "recipient" }
  | { kind: "payment-method" };

type FullScreen =
  | { kind: "home" }
  | { kind: "send-amount" }
  | { kind: "send-result"; status: "success" | "fail" | "pending"; amount: number; recipient: Recipient };

export default function Page() {
  const [cards, setCards] = useState<CardData[]>(INITIAL_CARDS);
  const [activeCardId, setActiveCardId] = useState<string | null>(
    cards[1]?.id ?? cards[0]?.id ?? null,
  );
  const [modal, setModal] = useState<ModalState>({ kind: "none" });
  const [removingCardId, setRemovingCardId] = useState<string | null>(null);
  const [droppingCardId, setDroppingCardId] = useState<string | null>(null);
  const [fullScreen, setFullScreen] = useState<FullScreen>({ kind: "home" });
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cryptoSplash, setCryptoSplash] = useState(false);
  const [supportSplash, setSupportSplash] = useState<null | "decide" | "learn">(null);
  const [scenarios, setScenarios] = useState<Scenarios>({
    addCard: "success",
    sendMoney: "success",
    sendDelay: "instant",
    promo: "success",
    iban: "valid",
    newContact: "off",
  });

  function openSendMoney(prefillCardId?: string) {
    setRecipient(null);
    setPaymentMethod(prefillCardId ? { kind: "card", cardId: prefillCardId } : null);
    setFullScreen({ kind: "send-amount" });
  }

  const cardForManage =
    modal.kind === "manage" ? cards.find((c) => c.id === modal.cardId) ?? null : null;
  const cardForPin =
    modal.kind === "view-pin" ? cards.find((c) => c.id === modal.cardId) ?? null : null;

  function toggleFreeze(cardId: string, nextFrozen: boolean) {
    setCards((curr) =>
      curr.map((c) => (c.id === cardId ? { ...c, frozen: nextFrozen } : c)),
    );
  }

  function blockCard(cardId: string) {
    setCards((curr) =>
      curr.map((c) =>
        c.id === cardId ? { ...c, blocked: true, frozen: false } : c,
      ),
    );
  }

  function renameCard(cardId: string, newName: string) {
    setCards((curr) => curr.map((c) => (c.id === cardId ? { ...c, title: newName } : c)));
  }

  function reorderCards(orderedIds: string[]) {
    setCards((curr) => {
      const map = new Map(curr.map((c) => [c.id, c]));
      return orderedIds.map((id) => map.get(id)!).filter(Boolean);
    });
  }

  function addCard(card: CardData) {
    setCards((curr) => [...curr, card]);
    setActiveCardId(card.id);
    setModal({ kind: "none" });
    setDroppingCardId(card.id);
    setTimeout(() => setDroppingCardId(null), 900);
  }

  function removeCard(cardId: string) {
    // Mark for spin-away animation; actual removal happens after animation completes.
    setRemovingCardId(cardId);
    setTimeout(() => {
      setCards((curr) => {
        const next = curr.filter((c) => c.id !== cardId);
        // Reassign active to a neighbor — or null when the wallet is empty.
        if (activeCardId === cardId) {
          setActiveCardId(next[0]?.id ?? null);
        }
        return next;
      });
      setRemovingCardId(null);
    }, 700);
  }

  return (
    <DeviceFrame>
      <ScenariosPanel
        scenarios={scenarios}
        onChange={setScenarios}
        onResetCards={(count) => {
          if (count === 0) {
            setCards([]);
            setActiveCardId(null);
          } else {
            const reset = INITIAL_CARDS.slice(0, 3);
            setCards(reset);
            setActiveCardId(reset[0]?.id ?? null);
          }
          setModal({ kind: "none" });
          setFullScreen({ kind: "home" });
        }}
      />
      <div className="absolute inset-0">
        {/* Full-screen router */}
        <AnimatePresence mode="sync" initial={false}>
          {fullScreen.kind === "home" && (
            <motion.div
              key="home"
              className="absolute inset-0"
              initial={{ x: "-30%", opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-30%", opacity: 0.6 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <HomeScreen
                cards={cards}
                activeCardId={activeCardId ?? undefined}
                onChangeActive={setActiveCardId}
                onOpenManageCard={(cardId) => setModal({ kind: "manage", cardId })}
                onOpenCardInfo={(cardId) => setModal({ kind: "manage", cardId, autoReveal: true })}
                onOpenReorder={() => setModal({ kind: "reorder" })}
                onOpenAddCard={() => setModal({ kind: "add-card" })}
                onOpenSendMoney={() => openSendMoney()}
                onSendFromCard={(cardId) => openSendMoney(cardId)}
                onRenameCard={renameCard}
                removingCardId={removingCardId}
                droppingCardId={droppingCardId}
              />
            </motion.div>
          )}
          {fullScreen.kind === "send-amount" && (
            <motion.div
              key="send-amount"
              className="absolute inset-0"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: EASE }}
            >
              <SendMoneyScreen
                cards={cards}
                recipient={recipient}
                paymentMethod={paymentMethod}
                delay={scenarios.sendDelay}
                promoOutcome={scenarios.promo}
                requirePrecheck={scenarios.newContact === "on"}
                onBack={() => {
                  setRecipient(null);
                  setPaymentMethod(null);
                  setFullScreen({ kind: "home" });
                }}
                onPickRecipient={() => setModal({ kind: "recipient" })}
                onPickPaymentMethod={() => setModal({ kind: "payment-method" })}
                onConfirmed={(amount) => {
                  if (!recipient) return;
                  setFullScreen({
                    kind: "send-result",
                    status: scenarios.sendMoney,
                    amount,
                    recipient,
                  });
                }}
                onRequestSupport={(kind) => setSupportSplash(kind)}
              />
            </motion.div>
          )}
          {fullScreen.kind === "send-result" && (
            <motion.div
              key="send-result"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <TransferResultScreen
                status={fullScreen.status}
                amount={fullScreen.amount}
                recipient={fullScreen.recipient}
                onDone={() => setFullScreen({ kind: "home" })}
                onAnother={() => {
                  setRecipient(null);
                  setPaymentMethod(null);
                  setFullScreen({ kind: "send-amount" });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ManageCardSheet
          open={modal.kind === "manage"}
          card={cardForManage}
          autoReveal={modal.kind === "manage" ? modal.autoReveal : false}
          onAutoRevealConsumed={() =>
            setModal((m) =>
              m.kind === "manage" ? { kind: "manage", cardId: m.cardId } : m,
            )
          }
          onClose={() => setModal({ kind: "none" })}
          onSelectViewPin={() => {
            if (modal.kind === "manage") setModal({ kind: "view-pin", cardId: modal.cardId });
          }}
          onToggleFreeze={toggleFreeze}
          onBlockCard={blockCard}
          onRemoveCard={removeCard}
          onRenameCard={renameCard}
        />

        <ViewPinSheet
          open={modal.kind === "view-pin"}
          card={cardForPin}
          onBack={() =>
            setModal((m) =>
              m.kind === "view-pin" ? { kind: "manage", cardId: m.cardId } : m,
            )
          }
          onClose={() => setModal({ kind: "none" })}
        />

        <ReorderSheet
          open={modal.kind === "reorder"}
          cards={cards}
          onSave={(ids) => {
            reorderCards(ids);
            setModal({ kind: "none" });
          }}
          onCancel={() => setModal({ kind: "none" })}
          onRemoveCard={removeCard}
        />

        <RecipientFlow
          open={modal.kind === "recipient"}
          ibanOutcome={scenarios.iban}
          onClose={() => setModal({ kind: "none" })}
          onComplete={(r) => {
            setRecipient(r);
            setModal({ kind: "none" });
          }}
          onCryptoChosen={() => {
            setCryptoSplash(true);
          }}
        />

        <PaymentMethodSheet
          open={modal.kind === "payment-method"}
          cards={cards}
          selected={paymentMethod}
          onClose={() => setModal({ kind: "none" })}
          onConfirm={(m) => {
            setPaymentMethod(m);
            setModal({ kind: "none" });
          }}
        />

        {/* Support splash — simulates what "Help me decide" / "Learn more"
            would open in a real product. Same anchor as the crypto splash
            so only one side-panel message is ever visible at a time. */}
        <AnimatePresence>
          {supportSplash && (
            <motion.div
              key={`support-${supportSplash}`}
              className="pointer-events-auto fixed top-1/2 -translate-y-1/2 z-[60] hidden md:flex w-[260px] flex-col gap-[10px] rounded-[16px] border border-white/10 bg-[#101218]/95 p-[14px] text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur"
              style={{ left: "calc(50% - 480px)" }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[28px] leading-[28px]">
                {supportSplash === "decide" ? "🧭" : "📘"}
              </span>
              <span className="text-[13px] font-semibold leading-[18px] text-white">
                {supportSplash === "decide"
                  ? "Help me decide"
                  : "Learn more"}
              </span>
              <span className="text-[12px] leading-[16px] text-white/70">
                {supportSplash === "decide"
                  ? "Opens a private AI-assisted assessment: a short guided questionnaire that analyzes your case (how you met, what you were asked to pay for, urgency signals) and tells you whether the transfer pattern looks safe or suspicious."
                  : "Opens Ria's fraud-prevention hub: real examples, red flags by scam type, and step-by-step ways to verify a recipient's identity."}
              </span>
              <span className="text-[11px] leading-[14px] text-white/45">
                Simulated for this prototype — the real product would route to live support + educational resources.
              </span>
              <button
                onClick={() => setSupportSplash(null)}
                className="mt-[4px] flex h-[32px] items-center justify-center rounded-[8px] bg-white/10 text-[12px] font-semibold text-white active:bg-white/20"
              >
                Got it
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crypto splash on the desktop side panel */}
        <AnimatePresence>
          {cryptoSplash && (
            <motion.div
              key="crypto-splash"
              className="pointer-events-auto fixed top-1/2 -translate-y-1/2 z-[60] hidden md:flex w-[240px] flex-col gap-[10px] rounded-[16px] border border-white/10 bg-[#101218]/95 p-[14px] text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur"
              style={{ left: "calc(50% - 460px)" }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[28px] leading-[28px]">🙃</span>
              <span className="text-[13px] font-semibold leading-[18px] text-white">
                Sorry, didn't have time to finish this option
              </span>
              <span className="text-[12px] leading-[16px] text-white/65">
                Crypto wallet delivery is on the roadmap. Pick Bank or Cash to keep going.
              </span>
              <button
                onClick={() => setCryptoSplash(false)}
                className="mt-[4px] flex h-[32px] items-center justify-center rounded-[8px] bg-white/10 text-[12px] font-semibold text-white active:bg-white/20"
              >
                Got it
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AddCardSheet
          outcome={scenarios.addCard}
          open={modal.kind === "add-card"}
          onClose={() => setModal({ kind: "none" })}
          onConfirm={addCard}
        />
      </div>
    </DeviceFrame>
  );
}
