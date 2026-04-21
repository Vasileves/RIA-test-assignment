"use client";

import Image from "next/image";
import { motion, useMotionValue } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { ASSETS } from "@/lib/assets";

type Story = {
  icon: string;
  iconW: number;
  iconH: number;
  title: string;
  subtitle: string;
};

const STORIES: Story[] = [
  { icon: ASSETS.faceIdShape, iconW: 32, iconH: 44, title: "Set up Face ID", subtitle: "Log in faster" },
  { icon: ASSETS.walletIcon, iconW: 49, iconH: 42, title: "Unlock transfers", subtitle: "Complete your profile" },
  { icon: ASSETS.shieldIcon, iconW: 33, iconH: 42, title: "Secure your account", subtitle: "Add extra protection" },
];

const CARD_W = 167;
const GAP = 8;

export function OnboardingStories() {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxDrag, setMaxDrag] = useState(0);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const containerW = containerRef.current.offsetWidth;
    const contentW = STORIES.length * CARD_W + (STORIES.length - 1) * GAP;
    setMaxDrag(Math.max(0, contentW - containerW));
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden px-[12px]">
      <motion.div
        className="flex gap-[8px] cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: -maxDrag, right: 0 }}
        dragElastic={0.15}
        style={{ x, width: "max-content" }}
      >
        {STORIES.map((s) => (
          <StoryCard key={s.title} story={s} />
        ))}
      </motion.div>
    </div>
  );
}

function StoryCard({ story }: { story: Story }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] select-none"
      style={{ width: CARD_W, height: 124 }}
    >
      <div className="pointer-events-none absolute left-[9px] top-[12px] flex h-[48px] w-[72px] items-start">
        <Image src={story.icon} alt="" width={story.iconW} height={story.iconH} draggable={false} />
      </div>
      <div className="absolute bottom-[8px] left-[9px] flex w-[149px] flex-col text-[12px] leading-[16px]">
        <span className="font-semibold text-[#111827]">{story.title}</span>
        <span className="font-normal text-black/40">{story.subtitle}</span>
      </div>
      <div className="absolute right-[7px] top-[7px] flex size-[20px] items-center justify-center rounded-full bg-[rgba(118,118,118,0.1)]">
        <Image src={ASSETS.arrowUpRight} alt="" width={8} height={8} draggable={false} />
      </div>
    </div>
  );
}
