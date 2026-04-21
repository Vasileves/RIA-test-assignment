"use client";

import { motion } from "framer-motion";
import {
  House,
  UsersThree,
  ArrowsLeftRight,
  MapPin,
  PaperPlaneTilt,
} from "@phosphor-icons/react";

type NavKey = "home" | "contacts" | "send" | "track" | "locations";

export function BottomNav({
  active = "home" as NavKey,
  onSendMoney,
}: {
  active?: NavKey;
  onSendMoney?: () => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[84px] bg-[#f8f9fa] border-t border-[#e5e7eb] shadow-[0_-12px_10px_0_rgba(248,249,250,0.5)]">
      <div className="absolute left-0 right-0 top-[7px] flex h-[50px] items-end justify-around px-[10px]">
        <NavItem
          label="Home"
          active={active === "home"}
          icon={<House size={24} weight={active === "home" ? "fill" : "regular"} />}
        />
        <NavItem
          label="Contacts"
          active={active === "contacts"}
          icon={<UsersThree size={24} weight={active === "contacts" ? "fill" : "regular"} />}
        />
        <FabItem label="Send Money" active={active === "send"} onClick={onSendMoney} />
        <NavItem
          label="Track"
          active={active === "track"}
          icon={<ArrowsLeftRight size={24} weight={active === "track" ? "fill" : "regular"} />}
        />
        <NavItem
          label="Locations"
          active={active === "locations"}
          icon={<MapPin size={24} weight={active === "locations" ? "fill" : "regular"} />}
        />
      </div>
    </div>
  );
}

function NavItem({
  label,
  icon,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  // Apple HIG tab bar: icon and label vertically centered as a pair within the
  // bar, with ~4pt air between them.
  return (
    <button className="flex h-full flex-col items-center justify-center gap-[4px]">
      <span
        className="flex h-[24px] items-center justify-center"
        style={{ color: active ? "#111827" : "#9ca3af" }}
      >
        {icon}
      </span>
      <span
        className="text-[10px] leading-[13px] whitespace-nowrap"
        style={{
          fontWeight: active ? 600 : 500,
          color: active ? "#111827" : "#6b7280",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function FabItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex h-full flex-col items-center justify-end pb-[4px]"
      whileTap="tap"
    >
      {/* Halo ring pulse that fires on press */}
      <motion.span
        className="absolute -top-[28px] left-1/2 -translate-x-1/2 size-[56px] rounded-full bg-[#ff6a00]/25 pointer-events-none"
        variants={{
          tap: { scale: [1, 1.6], opacity: [0.55, 0] },
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Main circle with bouncy press */}
      <motion.span
        className="absolute -top-[28px] left-1/2 -translate-x-1/2 flex size-[56px] items-center justify-center rounded-full bg-[#ff6a00] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.2),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
        variants={{
          tap: { scale: 0.9, y: 2 },
        }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
      >
        <motion.span
          className="flex"
          variants={{ tap: { rotate: [-12, 0] } }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <PaperPlaneTilt size={26} weight="fill" color="#ffffff" />
        </motion.span>
      </motion.span>
      <span
        className="text-[10px] leading-[13px] whitespace-nowrap"
        style={{
          fontWeight: active ? 600 : 500,
          color: active ? "#111827" : "#4b5563",
        }}
      >
        {label}
      </span>
    </motion.button>
  );
}
