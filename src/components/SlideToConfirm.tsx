"use client";

import { animate, motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CircleNotch } from "@phosphor-icons/react";

export type SliderState =
  | "default"
  | "inactive"
  | "processing"
  | "confirmed"
  | "error";

export function SlideToConfirm({
  state = "default",
  label,
  onConfirm,
}: {
  state?: SliderState;
  label?: string;
  onConfirm?: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [width, setWidth] = useState(0);
  const KNOB = 48;
  const padding = 4;
  const max = Math.max(0, width - KNOB - padding * 2);

  useEffect(() => {
    if (state !== "confirmed") {
      animate(x, 0, { type: "spring", stiffness: 320, damping: 30 });
    }
  }, [state, x]);

  // For default state: knob position fades the label as user drags
  const labelOpacity = useTransform(x, [0, Math.max(1, max * 0.6)], [1, 0]);

  function onLayout(node: HTMLDivElement | null) {
    if (node) {
      trackRef.current = node;
      setWidth(node.clientWidth);
    }
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (state !== "default" && state !== "error") return;
    const v = x.get();
    if (v >= max * 0.92) {
      animate(x, max, {
        type: "spring",
        stiffness: 360,
        damping: 26,
        onComplete: () => onConfirm?.(),
      });
    } else {
      animate(x, 0, { type: "spring", stiffness: 360, damping: 30, velocity: info.velocity.x });
    }
  }

  const tokens = (() => {
    switch (state) {
      case "inactive":
        return {
          trackBg: "#f5f5f7",
          border: "#e5e7eb",
          labelColor: "#9ca3af",
          labelText: label ?? "Slide to confirm",
          showKnob: false as const,
        };
      case "processing":
        return {
          trackBg: "#fff1eb",
          border: "#ff6a00",
          labelColor: "#ff6a00",
          labelText: label ?? "Sending…",
          processing: true as const,
          showKnob: false as const,
        };
      case "confirmed":
        return {
          trackBg: "#ff6a00",
          border: "#ff6a00",
          knobBg: "#ffffff",
          knobIconColor: "#ff6a00",
          labelColor: "#ffffff",
          labelText: "Confirmed",
          confirmed: true as const,
          showKnob: false as const,
        };
      case "error":
        return {
          trackBg: "#ffffff",
          border: "#dc2626",
          knobBg: "#dc2626",
          knobIconColor: "#ffffff",
          labelColor: "#dc2626",
          labelText: label ?? "Retry",
          showKnob: true as const,
        };
      default:
        return {
          trackBg: "#ffffff",
          border: "#ff6a00",
          knobBg: "#ff6a00",
          knobIconColor: "#ffffff",
          labelColor: "#111827",
          labelText: label ?? "Slide to confirm",
          showKnob: true as const,
        };
    }
  })();

  const isDraggable = state === "default" || state === "error";

  // Reserve room for the knob so the label never sits behind it
  const labelLeftPad = tokens.showKnob ? KNOB + padding * 2 : 18;
  const labelRightPad = 18;

  return (
    <div
      ref={onLayout}
      className="relative h-[56px] w-full overflow-hidden rounded-[14px] border-2"
      style={{ background: tokens.trackBg, borderColor: tokens.border }}
    >
      {/* Label — clamped between the knob and the right edge so long strings
          stay legible without clipping the knob. */}
      <motion.div
        style={{
          opacity: state === "confirmed" || state === "processing" ? 1 : labelOpacity,
          color: tokens.labelColor,
          paddingLeft: labelLeftPad,
          paddingRight: tokens.confirmed ? KNOB + padding * 2 : labelRightPad,
        }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span
          className="block truncate text-center text-[14px] font-bold leading-[18px]"
          style={{
            // shrink hint for long localized strings
            fontSize: tokens.labelText.length > 28 ? 12 : 14,
            lineHeight: tokens.labelText.length > 28 ? "16px" : "18px",
            maxWidth: "100%",
          }}
          title={tokens.labelText}
        >
          {tokens.labelText}
        </span>
      </motion.div>

      {/* Confirmed: white check on right */}
      {tokens.confirmed && (
        <div className="absolute right-[4px] top-1/2 -translate-y-1/2 flex size-[48px] items-center justify-center rounded-[10px] bg-white">
          <Check size={22} weight="bold" color="#ff6a00" />
        </div>
      )}

      {/* Processing: spinner pinned at the right end (where the knob would land) */}
      {state === "processing" && (
        <div className="absolute right-[4px] top-1/2 -translate-y-1/2 flex size-[48px] items-center justify-center rounded-[10px] bg-[#ff6a00]">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            className="flex"
          >
            <CircleNotch size={22} weight="bold" color="#ffffff" />
          </motion.span>
        </div>
      )}

      {/* Knob — rendered only for draggable states */}
      {tokens.showKnob && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 flex size-[48px] items-center justify-center rounded-[10px]"
          style={{
            x,
            background: tokens.knobBg,
            left: padding,
            cursor: isDraggable ? "grab" : "default",
          }}
          drag={isDraggable ? "x" : false}
          dragConstraints={{ left: 0, right: max }}
          dragElastic={0}
          dragMomentum={false}
          whileTap={isDraggable ? { cursor: "grabbing" } : undefined}
          onDragEnd={onDragEnd}
        >
          <ArrowRight size={22} weight="bold" color={tokens.knobIconColor} />
        </motion.div>
      )}
    </div>
  );
}
