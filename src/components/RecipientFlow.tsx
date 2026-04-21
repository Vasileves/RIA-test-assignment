"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bank as BankIcon,
  CaretDown,
  CaretRight,
  Check,
  Coins,
  CurrencyBtc,
  Lock,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  type Bank,
  type Country,
  type DeliveryMethod,
  type Recipient,
  DUMMY_RECIPIENT,
  POPULAR_COUNTRIES,
} from "@/lib/sendMoney";
import {
  POPULAR_BANKS,
  OTHER_BANKS,
  OTHER_COUNTRIES,
} from "@/lib/sendMoney";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Flag } from "@/components/Flag";
import { DeliveryMethodSheet } from "@/components/DeliveryMethodSheet";
import { MapPin, Plus as PlusIcon } from "@phosphor-icons/react";

type RecentRecipient = {
  id: string;
  initials: string;
  short: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  city: string;
  color: string;
};

const RECENT: RecentRecipient[] = [
  {
    id: "sm",
    initials: "SM",
    short: "Sarah M.",
    firstName: "Sarah",
    middleName: "Isabel",
    lastName: "Mendes",
    city: "Porto",
    color: "#fde68a",
  },
  {
    id: "mp",
    initials: "MP",
    short: "Matias P.",
    firstName: "Matias",
    lastName: "Pereira",
    city: "Lisbon",
    color: "#bbf7d0",
  },
  {
    id: "bj",
    initials: "BJ",
    short: "Bohemond J.",
    firstName: "Bohemond",
    middleName: "Alaric",
    lastName: "Jacquelin",
    city: "Marseille",
    color: "#bfdbfe",
  },
  {
    id: "je",
    initials: "JE",
    short: "Jena E.",
    firstName: "Jena",
    lastName: "Eskandari",
    city: "Dubai",
    color: "#fbcfe8",
  },
  {
    id: "ae",
    initials: "AE",
    short: "Alexandra E.",
    firstName: "Alexandra",
    lastName: "Escalante Ruiz",
    city: "Mexico City",
    color: "#ddd6fe",
  },
];

type Step = "identity" | "details" | "bank" | "country" | "city";

export function RecipientFlow({
  open,
  ibanOutcome = "valid",
  onClose,
  onComplete,
  onCryptoChosen,
}: {
  open: boolean;
  ibanOutcome?: "valid" | "invalid";
  onClose: () => void;
  onComplete: (r: Recipient) => void;
  onCryptoChosen: () => void;
}) {
  const [step, setStep] = useState<Step>("identity");

  // Identity state
  const [recentId, setRecentId] = useState<string | null>(null);
  const [first, setFirst] = useState("");
  const [middle, setMiddle] = useState("");
  const [last, setLast] = useState("");
  const [country, setCountry] = useState<Country>(POPULAR_COUNTRIES[0]);
  const [city, setCity] = useState("");
  const [toSelf, setToSelf] = useState(false);

  // Details state
  const [delivery, setDelivery] = useState<DeliveryMethod | null>(null);
  const [bank, setBank] = useState<Bank | null>(null);
  const [account, setAccount] = useState("");
  const [reference, setReference] = useState("");

  // Sub-pickers
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [bankQuery, setBankQuery] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  useEffect(() => {
    if (!open) {
      // Defer reset until exit animation completes
      const t = setTimeout(() => {
        setStep("identity");
        setRecentId(null);
        setFirst("");
        setMiddle("");
        setLast("");
        setCity("");
        setToSelf(false);
        setDelivery(null);
        setBank(null);
        setAccount("");
        setReference("");
      }, 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  function fillIdentityDummy() {
    setFirst(DUMMY_RECIPIENT.firstName);
    setMiddle(DUMMY_RECIPIENT.middleName ?? "");
    setLast(DUMMY_RECIPIENT.lastName);
    setCity(DUMMY_RECIPIENT.city);
  }

  function fillDetailsDummy() {
    // "invalid" scenario drops an obviously malformed IBAN so the error state
    // can be demoed. Valid scenario fills the well-formed UAE IBAN.
    setAccount(
      ibanOutcome === "invalid"
        ? "AE99 XXXX 0000"
        : DUMMY_RECIPIENT.account,
    );
    setReference(DUMMY_RECIPIENT.reference);
  }

  // Light-weight IBAN check: 2 letter country + 2 digits + at least 11 more
  // alphanumeric chars, allowing single spaces between groups.
  const ibanInvalid = (() => {
    if (!account.trim()) return false; // empty is not an error state
    const norm = account.replace(/\s+/g, "").toUpperCase();
    return !/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(norm);
  })();

  function pickRecent(id: string) {
    if (toSelf) return; // recents disabled while sending to myself
    if (recentId === id) {
      // Tap again to deselect — clear the auto-filled name fields
      setRecentId(null);
      setFirst("");
      setMiddle("");
      setLast("");
      setCity("");
      return;
    }
    const r = RECENT.find((x) => x.id === id);
    if (!r) return;
    setRecentId(id);
    setFirst(r.firstName);
    setMiddle(r.middleName ?? "");
    setLast(r.lastName);
    setCity(r.city);
  }

  function toggleSelf() {
    const next = !toSelf;
    setToSelf(next);
    if (next) {
      // Lock-fill with Tiago's preset
      setRecentId(null);
      setFirst("Tiago");
      setMiddle("");
      setLast("Limone");
      setCity("Lisbon");
    } else {
      setFirst("");
      setMiddle("");
      setLast("");
      setCity("");
    }
  }

  const identityValid = toSelf || (first.trim() && last.trim() && city.trim());

  function continueToDetails() {
    if (!identityValid) return;
    setStep("details");
  }

  const detailsValid =
    delivery === "cash" ||
    (delivery === "bank" && bank && account.trim() && !ibanInvalid) ||
    (delivery === "crypto"); // crypto opens splash externally

  function commitDetails() {
    if (!delivery) return;
    if (delivery === "crypto") {
      onCryptoChosen();
      return;
    }
    if (!detailsValid) return;
    onComplete({
      firstName: first || (toSelf ? "Tiago" : ""),
      middleName: middle || undefined,
      lastName: last || (toSelf ? "Limone" : ""),
      country,
      city,
      toSelf,
      delivery,
      bank: bank || undefined,
      account: account || undefined,
      reference: reference || undefined,
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="recipient-flow"
          className="absolute modal-fullbleed z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "rgba(15,18,28,0.62)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />

          {/* Sheet — height driven by measuring the inner body so the curtain
              grows/shrinks smoothly without FLIP-scaling its content.
              (Yango-style: sheet is a fluid container, content stays static.) */}
          <AutoHeightSheet step={step}>
            <div className="flex items-start justify-center pt-[16px] pb-[8px]">
              <div className="h-[6px] w-[48px] rounded-full bg-[rgba(226,191,176,0.5)]" />
            </div>

            {/* Header */}
            <div className="relative flex h-[42px] items-center justify-center">
              {step !== "identity" && (
                <button
                  onClick={() =>
                    setStep(
                      step === "bank"
                        ? "details"
                        : step === "country" || step === "city"
                          ? "identity"
                          : "identity",
                    )
                  }
                  className="absolute left-[16px] top-1/2 -translate-y-1/2 flex size-[28px] items-center justify-center rounded-full active:bg-black/5"
                  aria-label="Back"
                >
                  <ArrowLeft size={22} weight="regular" color="#111827" />
                </button>
              )}
              <h1 className="text-[18px] font-medium leading-[28px] tracking-[-0.45px] text-[#261812]">
                {step === "bank"
                  ? "Select bank"
                  : step === "country"
                    ? "Select country"
                    : step === "city"
                      ? "City or region"
                      : "Sending to"}
              </h1>
            </div>

            {/* Animated step body — popLayout lets the exiting child drop
                out of flow so the sheet's `layout` animation can measure the
                incoming step's size and smoothly resize the curtain. */}
            <AnimatePresence mode="popLayout" initial={false}>
              {step === "identity" && (
                <motion.div
                  key="identity"
                  className="flex flex-1 min-h-0 flex-col"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                >
                  <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
                    <div className="flex flex-col gap-[20px] px-[16px] pb-[12px] pt-[12px]">
                      {/* Recents */}
                      <div className="flex flex-col gap-[12px]">
                        <h2 className="px-[4px] text-[16px] font-semibold leading-[20px] text-[#111827]">
                          Recent
                        </h2>
                        <div
                          className="flex justify-between gap-[6px] pb-[2px]"
                          style={{
                            opacity: toSelf ? 0.4 : 1,
                            pointerEvents: toSelf ? "none" : "auto",
                          }}
                        >
                          {RECENT.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => pickRecent(r.id)}
                              className="flex flex-1 min-w-0 flex-col items-center gap-[6px]"
                            >
                              <div
                                className="flex size-[52px] items-center justify-center rounded-full text-[16px] font-bold text-[#5a4136]"
                                style={{
                                  background: r.color,
                                  outline:
                                    recentId === r.id ? "2px solid #ff6a00" : undefined,
                                  outlineOffset: 2,
                                }}
                              >
                                {r.initials}
                              </div>
                              <span className="w-full text-center text-[11px] leading-[14px] text-[#1a1a1a] truncate">
                                {r.short}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={toggleSelf}
                        className="flex h-[52px] w-full items-center gap-[12px] rounded-[12px] border border-[#e5e7eb] bg-white px-[16px]"
                      >
                        <span
                          className="flex size-[20px] items-center justify-center rounded-[6px] border-2"
                          style={{
                            borderColor: toSelf ? "#ff6a00" : "#d1d5db",
                            background: toSelf ? "#ff6a00" : "transparent",
                          }}
                        >
                          {toSelf && <Check size={14} weight="bold" color="#ffffff" />}
                        </span>
                        <span className="text-[14px] font-medium leading-[20px] text-[#111827]">
                          Sending to myself
                        </span>
                      </button>

                      <div className="flex flex-col gap-[12px]">
                        <PresetField
                          label="First name"
                          value={first}
                          onTap={fillIdentityDummy}
                          locked={toSelf}
                        />
                        <PresetField
                          label="Middle name (optional)"
                          value={middle}
                          onTap={fillIdentityDummy}
                          locked={toSelf}
                        />
                        <PresetField
                          label="Last name (s)"
                          value={last}
                          onTap={fillIdentityDummy}
                          locked={toSelf}
                        />
                        <CountryButton
                          country={country}
                          onTap={() => setStep("country")}
                          locked={toSelf}
                        />
                        <CityField
                          label="City / State / Territory"
                          value={city}
                          onTap={() => setStep("city")}
                          locked={toSelf}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col px-[16px] pb-[36px] pt-[12px]">
                    <button
                      onClick={continueToDetails}
                      disabled={!identityValid}
                      className="flex h-[56px] w-full items-center justify-center rounded-[12px] bg-[#ff6a00] text-[14px] font-bold leading-[20px] text-white active:bg-[#e85f00] disabled:bg-[#ffb988]"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}
              {step === "details" && (
                <motion.div
                  key="details"
                  className="flex flex-1 min-h-0 flex-col"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                >
                  <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
                    <div className="flex flex-col gap-[12px] px-[16px] pb-[12px] pt-[12px]">
                      {/* Recipient field readonly */}
                      <div className="flex h-[56px] w-full items-center gap-[12px] rounded-[12px] border border-[#e5e7eb] bg-[#f8f9fa] px-[16px]">
                        <div className="flex size-[28px] items-center justify-center rounded-full bg-[#ddd6fe] text-[12px] font-bold text-[#5b21b6]">
                          {(first[0] || "T") + (last[0] || "L")}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <span className="text-[12px] leading-[16px] text-[#6b7280]">
                            Recipient
                          </span>
                          <span className="text-[14px] font-medium leading-[20px] text-[#111827]">
                            {toSelf
                              ? "Tiago Limone"
                              : `${first} ${middle ? middle + " " : ""}${last}`.trim()}
                          </span>
                        </div>
                      </div>

                      {/* Delivery method picker */}
                      <button
                        onClick={() => setDeliveryOpen(true)}
                        className="flex h-[56px] w-full items-center gap-[12px] rounded-[12px] border border-[#e5e7eb] bg-[#f8f9fa] px-[16px] text-left"
                      >
                        <DeliveryIcon method={delivery} />
                        <div className="flex flex-1 flex-col">
                          <span className="text-[12px] leading-[16px] text-[#6b7280]">
                            How they get it
                          </span>
                          <span className="text-[14px] font-medium leading-[20px] text-[#111827]">
                            {delivery
                              ? delivery === "bank"
                                ? "Bank deposit"
                                : delivery === "cash"
                                  ? "Cash pickup"
                                  : "Crypto wallet"
                              : "Choose a delivery method"}
                          </span>
                        </div>
                        <CaretRight size={16} weight="regular" color="#9ca3af" />
                      </button>

                      {/* Bank picker (only if bank chosen) */}
                      <AnimatePresence initial={false}>
                        {delivery === "bank" && (
                          <motion.button
                            key="bank-pick"
                            onClick={() => setStep("bank")}
                            initial={{ opacity: 0, y: -4, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 56 }}
                            exit={{ opacity: 0, y: -4, height: 0 }}
                            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                            className="flex w-full items-center gap-[12px] overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-[#f8f9fa] px-[16px] text-left"
                          >
                            <span
                              className="flex size-[28px] items-center justify-center rounded-[8px] text-white"
                              style={{ background: bank?.logoColor ?? "#4b5563" }}
                            >
                              <BankIcon size={16} weight="bold" />
                            </span>
                            <div className="flex flex-1 flex-col">
                              <span className="text-[12px] leading-[16px] text-[#6b7280]">
                                Recipient's bank
                              </span>
                              <span className="text-[14px] font-medium leading-[20px] text-[#111827]">
                                {bank?.name ?? "Choose a bank"}
                              </span>
                            </div>
                            <CaretRight size={16} weight="regular" color="#9ca3af" />
                          </motion.button>
                        )}
                      </AnimatePresence>

                      {/* Linear inputs (account + reference) — appear once delivery is bank/cash */}
                      <AnimatePresence initial={false}>
                        {(delivery === "bank" || delivery === "cash") && (
                          <motion.div
                            key="extra-fields"
                            className="flex flex-col gap-[12px] overflow-hidden"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
                          >
                            {delivery === "bank" && (
                              <IbanField
                                value={account}
                                invalid={ibanInvalid}
                                onTap={fillDetailsDummy}
                              />
                            )}
                            <TapField
                              label="Reference (optional)"
                              value={reference}
                              onTap={fillDetailsDummy}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex flex-col px-[16px] pb-[36px] pt-[12px]">
                    <button
                      onClick={commitDetails}
                      disabled={!delivery || (delivery !== "crypto" && !detailsValid)}
                      className="flex h-[56px] w-full items-center justify-center rounded-[12px] bg-[#ff6a00] text-[14px] font-bold leading-[20px] text-white active:bg-[#e85f00] disabled:bg-[#ffb988]"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}
              {step === "country" && (
                <motion.div
                  key="country"
                  className="flex flex-1 min-h-0 flex-col"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                >
                  <div className="px-[16px] pb-[8px] pt-[4px]">
                    <label className="flex h-[44px] w-full items-center gap-[8px] rounded-[12px] bg-[#f3f4f6] px-[12px]">
                      <MagnifyingGlass size={18} weight="regular" color="#6b7280" />
                      <input
                        value={countryQuery}
                        onChange={(e) => setCountryQuery(e.target.value)}
                        placeholder="Search country"
                        className="flex-1 bg-transparent text-[14px] leading-[20px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
                      />
                    </label>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-[16px] pb-[16px]">
                    <CountryList
                      title="POPULAR"
                      countries={filterCountries(POPULAR_COUNTRIES, countryQuery)}
                      selectedCode={country.code}
                      onSelect={(c) => {
                        setCountry(c);
                        setStep("identity");
                      }}
                    />
                    <CountryList
                      title="OTHER COUNTRIES"
                      countries={filterCountries(OTHER_COUNTRIES, countryQuery)}
                      selectedCode={country.code}
                      onSelect={(c) => {
                        setCountry(c);
                        setStep("identity");
                      }}
                    />
                  </div>
                </motion.div>
              )}
              {step === "bank" && (
                <motion.div
                  key="bank"
                  className="flex flex-1 min-h-0 flex-col"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                >
                  {/* Search */}
                  <div className="px-[16px] pb-[8px] pt-[4px]">
                    <label className="flex h-[44px] w-full items-center gap-[8px] rounded-[12px] bg-[#f3f4f6] px-[12px]">
                      <MagnifyingGlass size={18} weight="regular" color="#6b7280" />
                      <input
                        value={bankQuery}
                        onChange={(e) => setBankQuery(e.target.value)}
                        placeholder="Search bank"
                        className="flex-1 bg-transparent text-[14px] leading-[20px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
                      />
                    </label>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-[16px] pb-[16px]">
                    <BankList
                      title="POPULAR"
                      banks={filterBanks(POPULAR_BANKS, bankQuery)}
                      selectedId={bank?.id}
                      onSelect={(b) => {
                        setBank(b);
                        setStep("details");
                      }}
                    />
                    <BankList
                      title="OTHER BANKS"
                      banks={filterBanks(OTHER_BANKS, bankQuery)}
                      selectedId={bank?.id}
                      onSelect={(b) => {
                        setBank(b);
                        setStep("details");
                      }}
                    />
                  </div>
                </motion.div>
              )}
              {step === "city" && (
                <motion.div
                  key="city"
                  className="flex flex-1 min-h-0 flex-col"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                >
                  <CityStep
                    countryCode={country.code}
                    countryName={country.name}
                    countryFlag={country.flag}
                    query={cityQuery}
                    onQueryChange={setCityQuery}
                    initialCity={city}
                    onConfirm={(c) => {
                      setCity(c);
                      setStep("identity");
                      setCityQuery("");
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </AutoHeightSheet>

          {/* Sub-pickers */}
          <DeliveryMethodSheet
            open={deliveryOpen}
            selected={delivery ?? undefined}
            onBack={() => setDeliveryOpen(false)}
            onClose={() => setDeliveryOpen(false)}
            onSelect={(m) => {
              setDelivery(m);
              setDeliveryOpen(false);
              if (m === "crypto") onCryptoChosen();
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Yango-style curtain. Measures inner content with ResizeObserver and
 * springs the sheet's CSS height to match. Step bodies stay at their natural
 * layout — no FLIP scaling, no gum-stretch.
 */
function AutoHeightSheet({
  step,
  children,
}: {
  step: Step;
  children: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const firstMeasure = useRef(true);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? el.offsetHeight;
      setHeight(h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Once we have a real measurement, stop being "auto"
  useEffect(() => {
    if (typeof height === "number") firstMeasure.current = false;
  }, [height]);

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 flex max-h-[92%] flex-col overflow-hidden rounded-t-[32px] bg-white"
      initial={{ y: "100%" }}
      animate={{
        y: 0,
        height: typeof height === "number" ? height : undefined,
      }}
      exit={{ y: "100%" }}
      transition={{
        y: { type: "spring", stiffness: 340, damping: 34 },
        height: firstMeasure.current
          ? { duration: 0 }
          : { type: "spring", stiffness: 300, damping: 34, mass: 0.9 },
      }}
    >
      <div ref={innerRef} data-step={step} className="flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  AE: ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah"],
  PH: ["Manila", "Quezon City", "Cebu City", "Davao", "Taguig", "Makati", "Pasig"],
  MX: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Cancún", "Tijuana", "Mérida"],
  IN: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune"],
  CO: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"],
  BR: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte"],
  PT: ["Lisbon", "Porto", "Braga", "Coimbra", "Faro"],
  ES: ["Madrid", "Barcelona", "Valencia", "Seville", "Málaga"],
  EG: ["Cairo", "Alexandria", "Giza", "Sharm El Sheikh", "Luxor"],
  NG: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt"],
};

function CityStep({
  countryCode,
  countryName,
  countryFlag,
  query,
  onQueryChange,
  initialCity,
  onConfirm,
}: {
  countryCode: string;
  countryName: string;
  countryFlag: string;
  query: string;
  onQueryChange: (v: string) => void;
  initialCity: string;
  onConfirm: (city: string) => void;
}) {
  const [pending, setPending] = useState(initialCity);

  const pool = CITIES_BY_COUNTRY[countryCode] ?? [];
  const q = query.trim().toLowerCase();
  const filtered = q ? pool.filter((c) => c.toLowerCase().includes(q)) : pool;
  const exactMatch = filtered.some((c) => c.toLowerCase() === q);
  const trimmed = query.trim();

  // Typing a new custom value clears a prior "Use …" selection if it no
  // longer matches what's in the input.
  const pendingIsCustom = pending && !pool.some((c) => c === pending);
  const effectivePending =
    pendingIsCustom && pending !== trimmed ? "" : pending;

  return (
    <>
      <div className="flex flex-col gap-[10px] px-[16px] pb-[8px] pt-[4px]">
        <div className="flex items-center gap-[8px] px-[4px] text-[12px] leading-[16px] text-[#6b7280]">
          <span className="text-[14px] leading-[16px]">{countryFlag}</span>
          <span>
            Showing places in{" "}
            <span className="font-semibold text-[#111827]">{countryName}</span>
          </span>
        </div>
        <label className="flex h-[44px] w-full items-center gap-[10px] rounded-[12px] bg-[#f3f4f6] px-[12px]">
          <MapPin size={18} weight="regular" color="#6b7280" />
          <input
            autoFocus
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Start typing a city or region"
            className="flex-1 bg-transparent text-[14px] leading-[20px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
          />
        </label>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-[16px] pb-[8px]">
        {filtered.length > 0 && (
          <div className="flex flex-col pt-[8px]">
            <span className="px-[4px] pb-[6px] text-[11px] font-semibold uppercase tracking-[0.6px] text-[#6b7280]">
              {trimmed ? "Matches" : "Popular places"}
            </span>
            <div className="flex flex-col">
              {filtered.map((city, i) => {
                const selected = effectivePending === city;
                return (
                  <button
                    key={city}
                    onClick={() => setPending(city)}
                    className="flex h-[52px] w-full items-center gap-[12px] px-[8px] text-left active:bg-[#f5f5f7]"
                    style={{
                      borderTop: i > 0 ? "1px solid #f1f1f4" : undefined,
                    }}
                  >
                    <span className="flex size-[32px] items-center justify-center rounded-full bg-[#fff1eb] text-[#ff6a00]">
                      <MapPin size={16} weight="fill" />
                    </span>
                    <span className="flex-1 text-[14px] font-medium leading-[20px] text-[#111827]">
                      <CityHighlight text={city} query={trimmed} />
                    </span>
                    {selected && (
                      <span className="flex size-[22px] items-center justify-center rounded-full bg-[#ff6a00]">
                        <Check size={14} weight="bold" color="#ffffff" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {trimmed && !exactMatch && (
          <button
            onClick={() => setPending(trimmed)}
            className="mt-[14px] flex w-full items-center gap-[12px] rounded-[12px] border border-dashed px-[12px] py-[12px] text-left active:bg-[#fafafa]"
            style={{
              borderColor: effectivePending === trimmed ? "#ff6a00" : "#d4cdc4",
              background: effectivePending === trimmed ? "#fff7f0" : "#ffffff",
            }}
          >
            <span className="flex size-[32px] items-center justify-center rounded-full bg-[#ff6a00]/10 text-[#ff6a00]">
              <PlusIcon size={16} weight="bold" />
            </span>
            <div className="flex flex-1 flex-col">
              <span className="text-[13px] font-semibold leading-[18px] text-[#111827]">
                Use &ldquo;{trimmed}&rdquo;
              </span>
              <span className="text-[11px] leading-[14px] text-[#6b7280]">
                Add a custom city or region in {countryName}
              </span>
            </div>
            {effectivePending === trimmed && (
              <span className="flex size-[22px] items-center justify-center rounded-full bg-[#ff6a00]">
                <Check size={14} weight="bold" color="#ffffff" />
              </span>
            )}
          </button>
        )}

        {filtered.length === 0 && !trimmed && (
          <div className="flex flex-col items-center gap-[8px] py-[40px] text-center">
            <MapPin size={22} weight="regular" color="#9ca3af" />
            <p className="text-[13px] leading-[18px] text-[#6b7280]">
              Start typing to search places in {countryName}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col px-[16px] pb-[36px] pt-[12px]">
        <button
          onClick={() => effectivePending && onConfirm(effectivePending)}
          disabled={!effectivePending}
          className="flex h-[56px] w-full items-center justify-center rounded-[12px] bg-[#ff6a00] text-[14px] font-bold leading-[20px] text-white active:bg-[#e85f00] disabled:bg-[#ffb988]"
        >
          {effectivePending ? `Confirm ${effectivePending}` : "Select a place"}
        </button>
      </div>
    </>
  );
}

function CityHighlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[#ff6a00]">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

function filterCountries(list: Country[], q: string) {
  const n = q.trim().toLowerCase();
  if (!n) return list;
  return list.filter((c) => c.name.toLowerCase().includes(n));
}

function CountryList({
  title,
  countries,
  selectedCode,
  onSelect,
}: {
  title: string;
  countries: Country[];
  selectedCode?: string;
  onSelect: (c: Country) => void;
}) {
  if (countries.length === 0) return null;
  return (
    <div className="flex flex-col py-[12px]">
      <span className="px-[4px] pb-[8px] text-[11px] font-semibold uppercase tracking-[0.6px] text-[#6b7280]">
        {title}
      </span>
      <div className="flex flex-col">
        {countries.map((c, i) => (
          <button
            key={c.code}
            onClick={() => onSelect(c)}
            className="flex h-[56px] w-full items-center gap-[12px] px-[8px] text-left active:bg-[#f5f5f7]"
            style={{
              borderTop: i > 0 ? "1px solid #f1f1f4" : undefined,
            }}
          >
            <Flag countryCode={c.code} emoji={c.flag} size={28} />
            <span className="flex-1 text-[14px] font-medium leading-[20px] text-[#111827]">
              {c.name}
            </span>
            {selectedCode === c.code && (
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

function filterBanks(list: Bank[], q: string) {
  const n = q.trim().toLowerCase();
  if (!n) return list;
  return list.filter((b) => b.name.toLowerCase().includes(n));
}

function BankList({
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

function IbanField({
  value,
  invalid,
  onTap,
}: {
  value: string;
  invalid: boolean;
  onTap: () => void;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <button
        onClick={onTap}
        className="flex h-[56px] w-full flex-col items-start justify-center rounded-[12px] border px-[16px] text-left transition-colors active:bg-[#eef0f2]"
        style={{
          background: "#f8f9fa",
          borderColor: invalid ? "#dc2626" : "#e5e7eb",
        }}
      >
        <span
          className="text-[12px] leading-[16px]"
          style={{ color: invalid ? "#dc2626" : "#6b7280" }}
        >
          Account / IBAN
        </span>
        <span
          className={`text-[14px] leading-[20px] font-mono ${
            value ? "text-[#111827] font-medium" : "text-[#9ca3af]"
          }`}
        >
          {value || "Tap to fill"}
        </span>
      </button>
      {invalid && (
        <div className="flex items-center gap-[6px] px-[4px]">
          <WarningCircle size={14} weight="fill" color="#dc2626" />
          <span className="text-[12px] font-medium leading-[16px] text-[#dc2626]">
            This IBAN doesn't look right. Double-check the recipient's number.
          </span>
        </div>
      )}
    </div>
  );
}

function CityField({
  label,
  value,
  onTap,
  locked,
}: {
  label: string;
  value: string;
  onTap: () => void;
  locked?: boolean;
}) {
  return (
    <button
      onClick={locked ? undefined : onTap}
      disabled={locked}
      className="flex h-[56px] w-full items-center gap-[8px] rounded-[12px] border border-[#e5e7eb] bg-[#f8f9fa] px-[16px] text-left active:bg-[#eef0f2] disabled:active:bg-[#f8f9fa]"
      style={{ cursor: locked ? "not-allowed" : "pointer" }}
    >
      <div className="flex flex-1 flex-col">
        <span className="text-[12px] leading-[16px] text-[#6b7280]">{label}</span>
        <span
          className={`text-[14px] leading-[20px] ${
            value ? "text-[#111827] font-medium" : "text-[#9ca3af]"
          }`}
        >
          {value || "Start typing"}
        </span>
      </div>
      {locked ? (
        <Lock size={14} weight="fill" color="#9ca3af" />
      ) : (
        <CaretRight size={14} weight="regular" color="#9ca3af" />
      )}
    </button>
  );
}

function TapField({
  label,
  value,
  onTap,
}: {
  label: string;
  value: string;
  onTap: () => void;
}) {
  return (
    <button
      onClick={onTap}
      className="flex h-[56px] w-full flex-col items-start justify-center rounded-[12px] border border-[#e5e7eb] bg-[#f8f9fa] px-[16px] text-left active:bg-[#eef0f2]"
    >
      <span className="text-[12px] leading-[16px] text-[#6b7280]">{label}</span>
      <span
        className={`text-[14px] leading-[20px] ${
          value ? "text-[#111827] font-medium" : "text-[#9ca3af]"
        }`}
      >
        {value || "Tap to fill"}
      </span>
    </button>
  );
}

function PresetField({
  label,
  value,
  onTap,
  locked,
}: {
  label: string;
  value: string;
  onTap: () => void;
  locked?: boolean;
}) {
  const placeholder = "Tap to fill";
  return (
    <button
      onClick={locked ? undefined : onTap}
      disabled={locked}
      className="flex h-[56px] w-full items-center gap-[8px] rounded-[12px] border border-[#e5e7eb] bg-[#f8f9fa] px-[16px] text-left active:bg-[#eef0f2] disabled:active:bg-[#f8f9fa]"
      style={{ cursor: locked ? "not-allowed" : "pointer" }}
    >
      <div className="flex flex-1 flex-col">
        <span className="text-[12px] leading-[16px] text-[#6b7280]">{label}</span>
        <span
          className={`text-[14px] leading-[20px] ${
            value ? "text-[#111827] font-medium" : "text-[#9ca3af]"
          }`}
        >
          {value || placeholder}
        </span>
      </div>
      {locked && <Lock size={14} weight="fill" color="#9ca3af" />}
    </button>
  );
}

function CountryButton({
  country,
  onTap,
  locked,
}: {
  country: Country;
  onTap: () => void;
  locked?: boolean;
}) {
  return (
    <button
      onClick={locked ? undefined : onTap}
      disabled={locked}
      className="flex h-[56px] w-full items-center justify-between rounded-[12px] border border-[#e5e7eb] bg-[#f8f9fa] px-[16px] text-left"
      style={{ cursor: locked ? "not-allowed" : "pointer" }}
    >
      <div className="flex flex-col gap-[2px]">
        <span className="text-[12px] leading-[16px] text-[#6b7280]">
          Destination country
        </span>
        <div className="flex items-center gap-[6px]">
          <span className="text-[18px] leading-[20px]">{country.flag}</span>
          <span className="text-[14px] font-medium leading-[20px] text-[#111827]">
            {country.name}
          </span>
        </div>
      </div>
      {locked ? (
        <Lock size={14} weight="fill" color="#9ca3af" />
      ) : (
        <CaretDown size={18} weight="regular" color="#6b7280" />
      )}
    </button>
  );
}

function DeliveryIcon({ method }: { method: DeliveryMethod | null }) {
  // Standardized 28px rounded-[8px] tiles. Dark tinted backgrounds with
  // light icons so the orange reads as the strong anchor (matches the
  // bank tile pattern shown in the list/picker).
  const base =
    "flex size-[28px] items-center justify-center rounded-[8px]";
  if (method === "bank")
    return (
      <span className={base} style={{ background: "#ff6a00", color: "#ffffff" }}>
        <BankIcon size={16} weight="bold" />
      </span>
    );
  if (method === "cash")
    return (
      <span className={base} style={{ background: "#b45309", color: "#ffffff" }}>
        <Coins size={16} weight="bold" />
      </span>
    );
  if (method === "crypto")
    return (
      <span className={base} style={{ background: "#6d28d9", color: "#ffffff" }}>
        <CurrencyBtc size={16} weight="bold" />
      </span>
    );
  return (
    <span className={base} style={{ background: "#4b5563", color: "#ffffff" }}>
      <BankIcon size={16} weight="bold" />
    </span>
  );
}
