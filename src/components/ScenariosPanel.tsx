"use client";

import { CheckCircle, Circle, Clock, ClockCounterClockwise, Lightning, Shield, XCircle } from "@phosphor-icons/react";

export type Outcome = "success" | "fail";
export type SendOutcome = "success" | "fail" | "pending";
export type SendDelay = "instant" | "slow";
export type OnOff = "off" | "on";

export type Scenarios = {
  addCard: Outcome;
  sendMoney: SendOutcome;
  sendDelay: SendDelay;
  promo: Outcome;
  iban: "valid" | "invalid";
  newContact: OnOff;
};

export function ScenariosPanel({
  scenarios,
  onChange,
  onResetCards,
}: {
  scenarios: Scenarios;
  onChange: (next: Scenarios) => void;
  onResetCards?: (count: 0 | 3) => void;
}) {
  return (
    <div
      // Anchored against the right edge of the iPhone frame (which is centered).
      // calc keeps it close to the device but never crosses the viewport edge.
      className="pointer-events-auto fixed top-1/2 -translate-y-1/2 z-50 hidden md:flex w-[220px] flex-col gap-[14px] rounded-[16px] border border-white/10 bg-[#101218]/92 px-[14px] py-[14px] text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur"
      style={{ left: "calc(50% + 220px)" }}
    >
      <div className="flex flex-col gap-[2px]">
        <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-white/50">
          Demo controls
        </span>
        <span className="text-[12px] leading-[16px] text-white/65">
          Pick which path each flow takes when confirmed.
        </span>
      </div>

      <ScenarioRow
        label="Add card"
        value={scenarios.addCard}
        options={[
          { v: "success", label: "Success", icon: <CheckCircle size={13} weight="fill" />, color: "#16a34a" },
          { v: "fail", label: "Fail", icon: <XCircle size={13} weight="fill" />, color: "#dc2626" },
        ]}
        onChange={(v) => onChange({ ...scenarios, addCard: v })}
      />
      <ScenarioRow
        label="Send money"
        value={scenarios.sendMoney}
        options={[
          { v: "success", label: "Sent", icon: <CheckCircle size={13} weight="fill" />, color: "#16a34a" },
          { v: "pending", label: "Pending", icon: <Clock size={13} weight="fill" />, color: "#f59e0b" },
          { v: "fail", label: "Fail", icon: <XCircle size={13} weight="fill" />, color: "#dc2626" },
        ]}
        onChange={(v) => onChange({ ...scenarios, sendMoney: v })}
      />
      <ScenarioRow
        label="Transfer speed"
        value={scenarios.sendDelay}
        options={[
          { v: "instant", label: "Instant", icon: <Lightning size={13} weight="fill" />, color: "#0ea5e9" },
          { v: "slow", label: "Slow", icon: <ClockCounterClockwise size={13} weight="fill" />, color: "#a855f7" },
        ]}
        onChange={(v) => onChange({ ...scenarios, sendDelay: v })}
      />
      <ScenarioRow
        label="Promo code"
        value={scenarios.promo}
        options={[
          { v: "success", label: "Valid", icon: <CheckCircle size={13} weight="fill" />, color: "#16a34a" },
          { v: "fail", label: "Invalid", icon: <XCircle size={13} weight="fill" />, color: "#dc2626" },
        ]}
        onChange={(v) => onChange({ ...scenarios, promo: v })}
      />
      <ScenarioRow
        label="Recipient IBAN"
        value={scenarios.iban}
        options={[
          { v: "valid", label: "Valid", icon: <CheckCircle size={13} weight="fill" />, color: "#16a34a" },
          { v: "invalid", label: "Invalid", icon: <XCircle size={13} weight="fill" />, color: "#dc2626" },
        ]}
        onChange={(v) => onChange({ ...scenarios, iban: v })}
      />
      <ScenarioRow
        label="New-contact precaution"
        value={scenarios.newContact}
        options={[
          { v: "off", label: "Off", icon: <Circle size={13} weight="bold" />, color: "#475569" },
          { v: "on", label: "On", icon: <Shield size={13} weight="fill" />, color: "#ba1a1a" },
        ]}
        onChange={(v) => onChange({ ...scenarios, newContact: v })}
      />

      <div className="mt-[4px] flex flex-col gap-[6px] border-t border-white/10 pt-[12px]">
        <span className="text-[11px] font-medium uppercase tracking-[0.6px] text-white/55">
          Reset wallet
        </span>
        <div className="flex gap-[6px]">
          <button
            onClick={() => onResetCards?.(3)}
            className="flex flex-1 items-center justify-center gap-[4px] rounded-[8px] bg-white/8 px-[8px] py-[6px] text-[11px] font-semibold leading-[14px] text-white/85 hover:bg-white/14 active:bg-white/20"
          >
            3 cards
          </button>
          <button
            onClick={() => onResetCards?.(0)}
            className="flex flex-1 items-center justify-center gap-[4px] rounded-[8px] bg-white/8 px-[8px] py-[6px] text-[11px] font-semibold leading-[14px] text-white/85 hover:bg-white/14 active:bg-white/20"
          >
            Empty
          </button>
        </div>
      </div>
    </div>
  );
}

function ScenarioRow<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: { v: V; label: string; icon: React.ReactNode; color: string }[];
  onChange: (v: V) => void;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <span className="text-[12px] font-medium leading-[16px] text-white/85">
        {label}
      </span>
      <div className="flex gap-[6px]">
        {options.map((o) => (
          <SegmentedOption
            key={o.v}
            active={value === o.v}
            color={o.color}
            icon={o.icon}
            label={o.label}
            onClick={() => onChange(o.v)}
          />
        ))}
      </div>
    </div>
  );
}

function SegmentedOption({
  active,
  label,
  icon,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-[4px] rounded-[8px] px-[6px] py-[6px] text-[11px] font-semibold leading-[14px] transition-colors"
      style={{
        background: active ? color : "rgba(255,255,255,0.06)",
        color: active ? "#ffffff" : "rgba(255,255,255,0.65)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
