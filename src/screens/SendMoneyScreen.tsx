"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CaretRight,
  AppleLogo,
  Bank,
  CreditCard,
  Globe,
  Storefront,
} from "@phosphor-icons/react";
import { SlideToConfirm, type SliderState } from "@/components/SlideToConfirm";
import { PromoCodeBlock } from "@/components/PromoCodeBlock";
import { ExchangeModule } from "@/components/ExchangeModule";
import { CurrencyPickerSheet } from "@/components/CurrencyPickerSheet";
import { Flag } from "@/components/Flag";
import { JustMakingSureSheet } from "@/components/JustMakingSureSheet";
import { MINI_GRADIENTS } from "@/lib/cardThemes";
import { convert, currencyForCountry } from "@/lib/currencies";
import type { Recipient } from "@/lib/sendMoney";
import type { PaymentMethod } from "@/components/PaymentMethodSheet";
import type { CardData } from "@/components/WalletCard";

export function SendMoneyScreen({
  cards,
  recipient,
  paymentMethod,
  delay = "instant",
  promoOutcome = "success",
  requirePrecheck = false,
  onBack,
  onConfirmed,
  onPickRecipient,
  onPickPaymentMethod,
  onRequestSupport,
}: {
  cards: CardData[];
  recipient: Recipient | null;
  paymentMethod: PaymentMethod | null;
  delay?: "instant" | "slow";
  promoOutcome?: "success" | "fail";
  requirePrecheck?: boolean;
  onBack: () => void;
  onConfirmed: (amount: number) => void;
  onPickRecipient: () => void;
  onPickPaymentMethod: () => void;
  onRequestSupport?: (kind: "decide" | "learn") => void;
}) {
  const [sendAmt, setSendAmt] = useState("1250.00");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("AED");
  const [pickerSide, setPickerSide] = useState<null | "from" | "to">(null);
  const [promoLabel, setPromoLabel] = useState<string | null>(null);
  const [sliderState, setSliderState] = useState<SliderState>("inactive");
  const [precheckOpen, setPrecheckOpen] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);

  // Live ref so the in-flight setTimeout reads the current scenario, not a
  // stale closure captured at slide-start.
  const requirePrecheckRef = useRef(requirePrecheck);
  requirePrecheckRef.current = requirePrecheck;

  // Default destination currency to recipient's country whenever it changes
  useEffect(() => {
    if (recipient) setToCurrency(currencyForCountry(recipient.country.code));
  }, [recipient]);

  const sendNum = parseFloat(sendAmt) || 0;

  const missing = !paymentMethod
    ? "Select a payment method to continue"
    : !recipient
      ? "Select a recipient to continue"
      : sendNum <= 0
        ? "Enter an amount to continue"
        : null;

  // Keep slider in sync with form completeness
  useEffect(() => {
    setSliderState((s) => {
      if (s === "processing" || s === "confirmed") return s;
      return missing ? "inactive" : "default";
    });
  }, [missing]);

  function handleConfirm() {
    setSliderState("processing");
    const ms = delay === "slow" ? 4500 : 1400;
    setTimeout(() => {
      if (requirePrecheckRef.current) {
        // New-contact gate: hold the amount, surface the precaution sheet.
        // Slider drops back to default so the sheet owns the next action.
        setPendingAmount(sendNum);
        setPrecheckOpen(true);
        setSliderState("default");
      } else {
        onConfirmed(sendNum);
      }
    }, ms);
  }

  return (
    <div className="relative h-full w-full bg-[var(--app-bg)] overflow-hidden">
      {/* Header — pt offset clears the iOS status bar icons */}
      <div className="relative flex h-[60px] items-center px-[16px] mt-[47px]">
        <button
          onClick={onBack}
          className="flex size-[28px] items-center justify-center rounded-full active:bg-black/5"
          aria-label="Back"
        >
          <ArrowLeft size={22} weight="regular" color="#111827" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium leading-[28px] tracking-[-0.45px] text-[#111827]">
          Send money
        </h1>
      </div>

      {/* Scrollable content (top accounts for status bar + header) */}
      <div className="absolute left-0 right-0 top-[107px] bottom-[112px] overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-[12px] px-[16px] pb-[16px]">
          {/* Exchange module — interactive */}
          <ExchangeModule
            fromCode={fromCurrency}
            toCode={toCurrency}
            amount={sendAmt}
            onAmountChange={setSendAmt}
            onFromChange={setFromCurrency}
            onToChange={setToCurrency}
            onOpenPicker={(side) => setPickerSide(side)}
          />

          {/* From row */}
          <Row
            visual={paymentMethodVisual(paymentMethod, cards)}
            title="From"
            value={paymentMethodLabel(paymentMethod, cards) ?? "Select payment method"}
            placeholder={!paymentMethod}
            onClick={onPickPaymentMethod}
          />

          {/* To row */}
          <Row
            visual={
              recipient ? (
                <Flag countryCode={recipient.country.code} emoji={recipient.country.flag} size={40} />
              ) : (
                <span className="flex size-[40px] items-center justify-center rounded-full bg-[#fff1eb]">
                  <Globe size={20} weight="regular" color="#ff6a00" />
                </span>
              )
            }
            title="To"
            primary={
              recipient
                ? recipient.toSelf
                  ? "Tiago Limone"
                  : `${recipient.firstName} ${recipient.lastName}`
                : "Select recipient"
            }
            secondary={recipient ? deliverySummary(recipient) : undefined}
            placeholder={!recipient}
            onClick={onPickRecipient}
          />

          {/* Promo code */}
          <PromoCodeBlock outcome={promoOutcome} onAppliedChange={setPromoLabel} />

          {/* Fee card */}
          <div className="flex flex-col rounded-[16px] bg-white p-[16px] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <FeeRow
              label="Transfer fee"
              value={
                <span className="rounded-full bg-[#16a34a] px-[8px] py-[2px] text-[11px] font-bold tracking-[0.5px] text-white uppercase">
                  Free
                </span>
              }
            />
            <FeeRow label="Transfer tax" value="$0.00" />
            <FeeRow label="Transfer time" value="Instant" />
            {promoLabel && (
              <FeeRow
                label="Promo discount"
                value={<span className="font-medium text-[#16a34a]">{promoLabel}</span>}
              />
            )}
            <div className="my-[6px] h-px bg-[#e5e7eb]" />
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold leading-[20px] text-[#111827]">
                Total to pay
              </span>
              <span className="font-mono text-[16px] font-bold leading-[20px] text-[#111827]">
                ${sendAmt}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide to confirm — pb matches the home-bar safe-area used in modals */}
      <div
        className="absolute bottom-0 left-0 right-0 px-[16px] pt-[12px] bg-[var(--app-bg)]"
        style={{ paddingBottom: 36 }}
      >
        <SlideToConfirm
          state={sliderState}
          label={
            sliderState === "processing"
              ? delay === "slow"
                ? "Hang tight, this can take a moment…"
                : "Sending your transfer…"
              : missing ?? "Slide to confirm"
          }
          onConfirm={handleConfirm}
        />
      </div>

      {/* Full-page currency picker overlay — sits above everything on this screen */}
      <CurrencyPickerSheet
        open={pickerSide !== null}
        selectedCode={pickerSide === "from" ? fromCurrency : toCurrency}
        onClose={() => setPickerSide(null)}
        onSelect={(code) => {
          if (pickerSide === "from") setFromCurrency(code);
          else if (pickerSide === "to") setToCurrency(code);
          setPickerSide(null);
        }}
      />

      {/* New-contact precaution sheet — gates the actual send when the
          scenario toggle is on. Uses the sender (Tiago) for the greeting and
          the recipient's first name in the attestation. */}
      <JustMakingSureSheet
        open={precheckOpen}
        senderFirstName="Tiago"
        recipientFirstName={
          recipient
            ? recipient.toSelf
              ? "Tiago"
              : recipient.firstName
            : "them"
        }
        onAgree={() => {
          setPrecheckOpen(false);
          if (pendingAmount !== null) onConfirmed(pendingAmount);
          setPendingAmount(null);
        }}
        onCancel={() => {
          setPrecheckOpen(false);
          setPendingAmount(null);
        }}
        onHelpMeDecide={() => onRequestSupport?.("decide")}
        onLearnMore={() => onRequestSupport?.("learn")}
      />
    </div>
  );
}

function Row({
  visual,
  title,
  value,
  primary,
  secondary,
  placeholder,
  onClick,
}: {
  visual: React.ReactNode;
  title: string;
  value?: string;
  primary?: string;
  secondary?: string;
  placeholder?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[72px] w-full items-center gap-[12px] rounded-[16px] bg-white px-[16px] py-[12px] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] text-left"
    >
      {visual}
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <span className="text-[12px] leading-[16px] text-[#6b7280]">{title}</span>
        {primary ? (
          <>
            <span
              className={`text-[14px] leading-[20px] truncate ${
                placeholder ? "font-medium text-[#9ca3af]" : "font-bold text-[#111827]"
              }`}
            >
              {primary}
            </span>
            {secondary && (
              <span className="text-[12px] leading-[16px] text-[#6b7280] truncate">
                {secondary}
              </span>
            )}
          </>
        ) : (
          <span
            className={`text-[14px] leading-[20px] truncate ${
              placeholder ? "font-medium text-[#9ca3af]" : "font-bold text-[#111827]"
            }`}
          >
            {value}
          </span>
        )}
      </div>
      <CaretRight size={18} weight="regular" color="#9ca3af" />
    </button>
  );
}

function deliverySummary(r: Recipient): string {
  switch (r.delivery) {
    case "bank": {
      if (!r.bank) return "Bank deposit";
      const bankName = truncate(r.bank.name, 22);
      const last4 = extractLast4(r.account);
      return last4 ? `${bankName} · •••• ${last4}` : bankName;
    }
    case "cash":
      return "Cash pickup";
    case "crypto":
      return "Crypto wallet";
    default:
      return r.city ?? "";
  }
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}

function extractLast4(account?: string): string | null {
  if (!account) return null;
  const digits = account.replace(/\D/g, "");
  return digits.length >= 4 ? digits.slice(-4) : null;
}

function FeeRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-[6px]">
      <span className="text-[13px] leading-[18px] text-[#6b7280]">{label}</span>
      {typeof value === "string" ? (
        <span className="text-[14px] font-medium leading-[20px] text-[#111827]">{value}</span>
      ) : (
        value
      )}
    </div>
  );
}

function paymentMethodLabel(m: PaymentMethod | null, cards: CardData[]): string | null {
  if (!m) return null;
  if (m.kind === "apple-pay") return "Apple Pay · Instant";
  if (m.kind === "seven-eleven") return "7-Eleven Cash · In-person";
  const c = cards.find((c) => c.id === m.cardId);
  if (!c) return "Card · Instant";
  return `${titleCase(c.title)} · •••• ${c.last4}`;
}

function paymentMethodVisual(m: PaymentMethod | null, cards: CardData[]) {
  if (!m) {
    return (
      <span className="flex size-[40px] items-center justify-center rounded-full bg-[#fff1eb]">
        <Bank size={20} weight="regular" color="#ff6a00" />
      </span>
    );
  }
  if (m.kind === "apple-pay")
    return (
      <span className="flex size-[40px] items-center justify-center rounded-[10px] bg-black">
        <AppleLogo size={20} weight="fill" color="#ffffff" />
      </span>
    );
  if (m.kind === "seven-eleven")
    return (
      <span className="flex size-[40px] items-center justify-center rounded-[10px] bg-[#16a34a]">
        <Storefront size={20} weight="fill" color="#ffffff" />
      </span>
    );
  const c = cards.find((c) => c.id === m.cardId);
  if (!c)
    return (
      <span className="flex size-[40px] items-center justify-center rounded-[10px] bg-[#ff6a00]">
        <CreditCard size={20} weight="regular" color="#ffffff" />
      </span>
    );
  const isLight = c.theme === "sharedGroceries";
  return (
    <div
      className="relative flex h-[40px] w-[58px] items-center justify-end overflow-hidden rounded-[8px] px-[6px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
      style={{
        background: MINI_GRADIENTS[c.theme],
        border: isLight ? "1px solid rgba(226,191,176,0.5)" : undefined,
      }}
    >
      <span
        className="text-[7px] font-normal leading-[10px] tracking-[0.6px]"
        style={{ color: isLight ? "rgba(38,24,18,0.8)" : "rgba(255,255,255,0.85)" }}
      >
        ••••
      </span>
    </div>
  );
}

function titleCase(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}
