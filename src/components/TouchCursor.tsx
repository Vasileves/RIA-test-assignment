"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Replaces the mouse cursor with a soft "fingertip" disc while hovering the
 * iPhone device area. Shrinks on pointer-down to mimic a touch event.
 *
 * Hidden on touch devices and when the pointer leaves the device surface.
 */
export function TouchCursor({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pressing, setPressing] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 700, damping: 45, mass: 0.35 });
  const y = useSpring(rawY, { stiffness: 700, damping: 45, mass: 0.35 });

  useEffect(() => {
    if (!enabled) return;
    const host = hostRef.current?.parentElement;
    if (!host) return;

    function move(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      const rect = host!.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (inside) {
        rawX.set(e.clientX);
        rawY.set(e.clientY);
        setVisible(true);
      } else {
        setVisible(false);
      }
    }
    function down(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      setPressing(true);
    }
    function up() {
      setPressing(false);
    }
    function leave() {
      setVisible(false);
      setPressing(false);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    host.addEventListener("pointerleave", leave);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      host.removeEventListener("pointerleave", leave);
    };
  }, [enabled, rawX, rawY]);

  return (
    <div ref={hostRef} className="hidden">
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full"
        style={{
          x,
          y,
          width: 36,
          height: 36,
          marginLeft: -18,
          marginTop: -18,
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.65) 0%, rgba(255,106,0,0.32) 55%, rgba(255,106,0,0.22) 100%)",
          boxShadow:
            "0 2px 6px 0 rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.45)",
          opacity: visible ? 1 : 0,
        }}
        animate={{
          scale: pressing ? 0.6 : 1,
          opacity: visible ? (pressing ? 0.75 : 1) : 0,
        }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
      />
    </div>
  );
}
