"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Eye, PencilSimple, Prohibit, Snowflake } from "@phosphor-icons/react";
import { ASSETS } from "@/lib/assets";

export type CardTheme =
  | "chaseDebit"
  | "salaryChase"
  | "virtualSubs"
  | "sharedGroceries"
  | "indigo"
  | "emerald"
  | "ruby"
  | "amethyst";

export type CardData = {
  id: string;
  theme: CardTheme;
  title: string;
  last4: string;
  balance: string;
  balanceMasked?: boolean;
  frozen?: boolean;
  blocked?: boolean;
  // Full info (shown on back face after Face ID)
  fullNumber: string;
  expiry: string;
  cvv: string;
  holder: string;
};

const THEME_BG: Record<CardTheme, string> = {
  chaseDebit: "#ff6a00",
  salaryChase: "#000000",
  virtualSubs: "#1f2937",
  sharedGroceries: "#c9c4b8",
  indigo: "linear-gradient(135deg, #4f46e5 0%, #2e2680 100%)",
  emerald: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
  ruby: "linear-gradient(135deg, #e11d48 0%, #7f1129 100%)",
  amethyst: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
};

export function WalletCard({
  card,
  width = 295,
  height = 178,
  onClick,
  layoutId,
  disableLayoutAnim,
  flipped = false,
  onEyeTap,
  onPenTap,
  showEye = true,
  showPen = true,
}: {
  card: CardData;
  width?: number;
  height?: number;
  onClick?: () => void;
  layoutId?: string;
  /** When true, layoutId only enables shared layout (modal lift) — not own-position animations */
  disableLayoutAnim?: boolean;
  flipped?: boolean;
  onEyeTap?: (e: React.MouseEvent) => void;
  onPenTap?: (e: React.MouseEvent) => void;
  showEye?: boolean;
  showPen?: boolean;
}) {
  const bg = THEME_BG[card.theme];
  const dark = card.theme !== "sharedGroceries";

  return (
    <motion.div
      layoutId={layoutId}
      layout={disableLayoutAnim ? false : undefined}
      onClick={onClick}
      className="relative shrink-0"
      style={{
        width,
        height,
        cursor: onClick ? "pointer" : undefined,
        perspective: 1200,
      }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <motion.div
        className="relative size-full preserve-3d"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <CardFront
          card={card}
          bg={bg}
          dark={dark}
          onEyeTap={onEyeTap}
          onPenTap={onPenTap}
          showEye={showEye}
          showPen={showPen}
        />
        <CardBack card={card} bg={bg} dark={dark} />
      </motion.div>
    </motion.div>
  );
}

function CardFront({
  card,
  bg,
  dark,
  onEyeTap,
  onPenTap,
  showEye,
  showPen,
}: {
  card: CardData;
  bg: string;
  dark: boolean;
  onEyeTap?: (e: React.MouseEvent) => void;
  onPenTap?: (e: React.MouseEvent) => void;
  showEye: boolean;
  showPen: boolean;
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[16px] backface-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
      style={{ background: bg, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
    >
      {/* Chase logo */}
      <div className="absolute right-[7px] top-[7px] size-[41px] pointer-events-none">
        <Image src={ASSETS.chaseLogo} alt="" width={41} height={41} />
      </div>

      {/* Frost layer (rendered behind title/name so title stays readable) */}
      <AnimatePresence>
        {card.frozen && !card.blocked && <FrostLayer key="frost" dark={dark} />}
      </AnimatePresence>

      {/* Blocked overlay */}
      <AnimatePresence>
        {card.blocked && <BlockedLayer key="blocked" />}
      </AnimatePresence>

      {/* Title row */}
      <div className="absolute left-[20px] right-[20px] top-[14.75px] z-20 flex items-center gap-[8px]">
        <span
          className={`text-[14px] font-semibold leading-[20px] tracking-[1.4px] whitespace-nowrap ${
            dark ? "text-white" : "text-black/80"
          }`}
        >
          {card.title}
        </span>
        {showPen && (
          <button
            onClick={onPenTap}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            aria-label="Rename card"
            className="flex size-[20px] items-center justify-center rounded hover:bg-white/10"
          >
            <PencilSimple size={14} weight="regular" color={dark ? "#ffffff" : "#1f2937"} />
          </button>
        )}
      </div>

      {/* Balance */}
      <div className="absolute left-[20px] right-[20px] top-[65.75px] flex flex-col gap-[4px] pointer-events-none">
        <span className={`text-[14px] font-medium leading-[20px] ${dark ? "text-white/80" : "text-black/60"}`}>
          Available Balance
        </span>
        <div
          className={`flex items-baseline gap-[4px] text-[24px] ${dark ? "text-white" : "text-black"} whitespace-nowrap`}
        >
          <span className="font-medium leading-[32px]">$</span>
          <span className="font-mono font-bold leading-[40px] tracking-[-0.9px]">
            {card.balance}
          </span>
        </div>
      </div>

      {/* Last 4 + eye row */}
      <div className="absolute left-[20px] right-[20px] bottom-[16px] flex items-center gap-[8px]">
        <span
          className={`text-[12px] font-normal leading-[16px] ${
            dark ? "text-white/80" : "text-black/70"
          }`}
        >
          •••• {card.last4}
        </span>
        {showEye && (
          <button
            onClick={onEyeTap}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            aria-label="Show card details"
            className="flex size-[20px] items-center justify-center"
          >
            <Eye size={16} weight="regular" color={dark ? "#ffffff" : "#1f2937"} />
          </button>
        )}
      </div>
    </div>
  );
}

function CardBack({
  card,
  bg,
  dark,
}: {
  card: CardData;
  bg: string;
  dark: boolean;
}) {
  const textColor = dark ? "text-white" : "text-black";
  const labelColor = dark ? "text-white/60" : "text-black/50";
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[16px] backface-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
      style={{
        background: bg,
        transform: "rotateY(180deg)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      {/* Chase logo */}
      <div className="absolute right-[7px] top-[7px] size-[41px] pointer-events-none">
        <Image src={ASSETS.chaseLogo} alt="" width={41} height={41} />
      </div>

      {/* Title (no pen on back) */}
      <div className="absolute left-[20px] top-[14.75px]">
        <span
          className={`text-[14px] font-semibold leading-[20px] tracking-[1.4px] whitespace-nowrap ${textColor}`}
        >
          {card.title}
        </span>
      </div>

      {/* Card number */}
      <div className="absolute left-[20px] top-[50px]">
        <div className={`text-[9px] font-medium uppercase leading-[12px] tracking-[1px] ${labelColor}`}>
          Card number
        </div>
        <div className={`mt-[2px] flex items-center gap-[8px] ${textColor}`}>
          <span className="font-mono text-[16px] font-semibold tracking-[0.5px]">
            {card.fullNumber}
          </span>
          <Copy size={14} weight="regular" className="opacity-70" />
        </div>
      </div>

      {/* Expiry + CVV */}
      <div className="absolute left-[20px] bottom-[44px] flex gap-[36px]">
        <div>
          <div className={`text-[9px] font-medium uppercase leading-[12px] tracking-[1px] ${labelColor}`}>
            Expires
          </div>
          <div className={`mt-[2px] flex items-center gap-[6px] ${textColor}`}>
            <span className="font-mono text-[14px] font-semibold">{card.expiry}</span>
            <Copy size={12} weight="regular" className="opacity-70" />
          </div>
        </div>
        <div>
          <div className={`text-[9px] font-medium uppercase leading-[12px] tracking-[1px] ${labelColor}`}>
            CVV
          </div>
          <div className={`mt-[2px] flex items-center gap-[6px] ${textColor}`}>
            <span className="font-mono text-[14px] font-semibold">{card.cvv}</span>
            <Copy size={12} weight="regular" className="opacity-70" />
          </div>
        </div>
      </div>

      {/* Holder */}
      <div className="absolute left-[20px] bottom-[12px]">
        <div className={`text-[9px] font-medium uppercase leading-[12px] tracking-[1px] ${labelColor}`}>
          Holder
        </div>
        <div className={`mt-[2px] flex items-center gap-[6px] ${textColor}`}>
          <span className="text-[12px] font-semibold tracking-[0.5px]">
            {card.holder}
          </span>
          <Copy size={12} weight="regular" className="opacity-70" />
        </div>
      </div>
    </div>
  );
}

function BlockedLayer() {
  return (
    <>
      {/* Base wash — deep red with vignette toward edges */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background:
            "radial-gradient(120% 120% at 50% 40%, rgba(190,18,60,0.62) 0%, rgba(120,10,40,0.78) 60%, rgba(60,5,20,0.88) 100%)",
        }}
      />

      {/* Diagonal warning-stripe texture (subtle) */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.18 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.6) 0 2px, transparent 2px 18px)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Crack-style noise highlights mirroring the frost ice spots */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        style={{
          background: `
            radial-gradient(circle at 22% 28%, rgba(255,200,210,0.32) 0%, transparent 22%),
            radial-gradient(circle at 78% 18%, rgba(255,210,220,0.22) 0%, transparent 18%),
            radial-gradient(circle at 38% 72%, rgba(255,200,210,0.28) 0%, transparent 20%),
            radial-gradient(circle at 85% 78%, rgba(255,200,210,0.2) 0%, transparent 16%)
          `,
          mixBlendMode: "screen",
        }}
      />

      {/* Ghost prohibit symbol */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.55, rotate: -15 }}
        animate={{ opacity: 0.32, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.08 }}
      >
        <Prohibit
          size={150}
          weight="bold"
          color="#ffffff"
          style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.45))" }}
        />
      </motion.div>

      {/* One-time sweep highlight */}
      <motion.div
        className="absolute inset-y-0 z-10 pointer-events-none"
        initial={{ x: "-60%", opacity: 0 }}
        animate={{ x: "160%", opacity: [0, 0.85, 0] }}
        transition={{ duration: 0.95, ease: [0.32, 0.72, 0, 1] }}
        style={{
          width: "40%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
          filter: "blur(2px)",
        }}
      />

      {/* Blocked badge — same anatomy as the Frozen badge for visual consistency */}
      <motion.div
        className="absolute right-[12px] bottom-[12px] z-20 flex items-center gap-[6px] rounded-full px-[10px] py-[5px] pointer-events-none"
        initial={{ opacity: 0, scale: 0.7, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.22 }}
        style={{
          background: "rgba(127,29,29,0.92)",
          boxShadow:
            "0 1px 6px 0 rgba(239,68,68,0.45), inset 0 1px 0 0 rgba(255,255,255,0.16)",
        }}
      >
        <Prohibit size={13} weight="bold" color="#fecaca" />
        <span
          className="text-[11px] font-bold tracking-[0.6px] uppercase"
          style={{ color: "#fecaca" }}
        >
          Blocked
        </span>
      </motion.div>
    </>
  );
}

function FrostLayer({ dark }: { dark: boolean }) {
  // Stronger, more opaque blue-tinted frost
  const frostBg = dark
    ? "linear-gradient(135deg, rgba(135,195,245,0.55) 0%, rgba(180,225,255,0.45) 45%, rgba(110,175,235,0.55) 100%)"
    : "linear-gradient(135deg, rgba(170,215,245,0.72) 0%, rgba(220,240,255,0.55) 45%, rgba(140,195,235,0.72) 100%)";
  const badgeFg = dark ? "#e0f2fe" : "#0c4a6e";
  const badgeBg = dark ? "rgba(12,74,110,0.55)" : "rgba(224,242,254,0.9)";

  return (
    <>
      {/* Frost gradient (no backdrop-filter so text above stays crisp) */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45 }}
        style={{ background: frostBg }}
      />

      {/* Ice crystal texture overlay */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          background: `
            radial-gradient(circle at 22% 28%, rgba(255,255,255,0.5) 0%, transparent 22%),
            radial-gradient(circle at 78% 18%, rgba(255,255,255,0.35) 0%, transparent 18%),
            radial-gradient(circle at 38% 72%, rgba(255,255,255,0.42) 0%, transparent 20%),
            radial-gradient(circle at 85% 78%, rgba(255,255,255,0.3) 0%, transparent 16%),
            radial-gradient(circle at 8% 55%, rgba(255,255,255,0.38) 0%, transparent 14%)
          `,
          mixBlendMode: "screen",
        }}
      />

      {/* Ghost snowflake on the card face */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
        animate={{ opacity: 0.22, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.08 }}
      >
        <Snowflake
          size={160}
          weight="light"
          color="#ffffff"
          style={{ filter: "drop-shadow(0 2px 8px rgba(14,165,233,0.4))" }}
        />
      </motion.div>

      {/* One-time sweep highlight */}
      <motion.div
        className="absolute inset-y-0 z-10 pointer-events-none"
        initial={{ x: "-60%", opacity: 0 }}
        animate={{ x: "160%", opacity: [0, 1, 0] }}
        transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
        style={{
          width: "40%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
          filter: "blur(2px)",
        }}
      />

      {/* Frozen badge — bigger, more prominent */}
      <motion.div
        className="absolute right-[12px] bottom-[12px] z-20 flex items-center gap-[6px] rounded-full px-[10px] py-[5px] pointer-events-none"
        initial={{ opacity: 0, scale: 0.7, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.2 }}
        style={{
          background: badgeBg,
          boxShadow: "0 1px 6px 0 rgba(14,165,233,0.35)",
        }}
      >
        <motion.span
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity }}
        >
          <Snowflake size={13} weight="fill" color={badgeFg} />
        </motion.span>
        <span
          className="text-[11px] font-bold tracking-[0.6px] uppercase"
          style={{ color: badgeFg }}
        >
          Frozen
        </span>
      </motion.div>
    </>
  );
}
