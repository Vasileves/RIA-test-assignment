"use client";

import { animate, motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { WalletCard, type CardData } from "@/components/WalletCard";

const CARD_W = 295;
const CARD_H = 178;
const STEP = CARD_W + 6;
const VELOCITY_THRESHOLD = 500;
const OFFSET_THRESHOLD = STEP / 4;

export function CardCarousel({
  cards,
  activeId,
  onChangeActive,
  onCardTap,
  onEyeTap,
  onPenTap,
  flippedCardId,
  removingCardId,
  droppingCardId,
  suppressLayoutIdFor,
  onAddCard,
}: {
  cards: CardData[];
  activeId: string;
  onChangeActive: (id: string) => void;
  onCardTap: (id: string) => void;
  onEyeTap?: (id: string) => void;
  onPenTap?: (id: string) => void;
  onRenameCard?: (cardId: string, newName: string) => void;
  flippedCardId?: string | null;
  removingCardId?: string | null;
  droppingCardId?: string | null;
  suppressLayoutIdFor?: string | null;
  onAddCard?: () => void;
}) {
  const activeIndex = Math.max(
    0,
    cards.findIndex((c) => c.id === activeId),
  );

  // Single strip transform. Each card sits at cardIndex * STEP within the strip.
  // The strip is translated so that the active card aligns to viewport center.
  // stripX target = -activeIndex * STEP. This makes activeIndex updates and
  // visual position stay in sync — no atomicity glitch.
  const stripX = useMotionValue(-activeIndex * STEP);
  const [dragging, setDragging] = useState(false);
  const skipNextEffectRef = useRef(false);

  // Reflect external activeIndex changes (taps on peek cards, removal) with a
  // smooth spring. Skipped right after a swipe-driven change because the strip
  // is already animating to the same target.
  useEffect(() => {
    if (skipNextEffectRef.current) {
      skipNextEffectRef.current = false;
      return;
    }
    const target = -activeIndex * STEP;
    animate(stripX, target, { type: "spring", stiffness: 280, damping: 32 });
  }, [activeIndex, stripX]);

  function onDragEnd(_: unknown, info: PanInfo) {
    setDragging(false);
    const { offset, velocity } = info;
    const crossedThreshold =
      Math.abs(offset.x) > OFFSET_THRESHOLD ||
      Math.abs(velocity.x) > VELOCITY_THRESHOLD;

    let nextIndex = activeIndex;
    if (crossedThreshold) {
      if (offset.x < 0 && activeIndex < cards.length - 1) nextIndex = activeIndex + 1;
      else if (offset.x > 0 && activeIndex > 0) nextIndex = activeIndex - 1;
    }

    const target = -nextIndex * STEP;
    animate(stripX, target, {
      type: "spring",
      stiffness: 320,
      damping: 34,
      velocity: velocity.x,
      onComplete: () => {
        if (nextIndex !== activeIndex) {
          // Strip is already at the new target — skip the useEffect re-animate.
          skipNextEffectRef.current = true;
          onChangeActive(cards[nextIndex].id);
        }
      },
    });
  }

  if (cards.length === 0) {
    return <EmptyCardSlot onAdd={onAddCard} />;
  }

  return (
    // clipPath clips horizontally (so peek cards don't leak past viewport edges)
    // but leaves vertical room so drop / lift / blur animations can extend.
    <div
      className="relative w-full"
      style={{ height: CARD_H, clipPath: "inset(-200% 0px)" }}
    >
      <motion.div
        className="absolute top-0 bottom-0 left-1/2 flex items-center select-none"
        // Position the strip's origin at viewport center; cards positioned with -CARD_W/2 offset.
        // gap matches `STEP - CARD_W` so each card slot truly equals STEP.
        style={{
          x: stripX,
          touchAction: "pan-y",
          marginLeft: -CARD_W / 2,
          gap: STEP - CARD_W,
        }}
        drag="x"
        dragDirectionLock
        dragElastic={0.2}
        dragMomentum={false}
        onDragStart={() => setDragging(true)}
        onDragEnd={onDragEnd}
      >
        {cards.map((card, i) => (
          <CarouselItem
            key={card.id}
            card={card}
            cardIndex={i}
            stripX={stripX}
            flipped={flippedCardId === card.id}
            removing={removingCardId === card.id}
            dropping={droppingCardId === card.id}
            isActive={i === activeIndex}
            suppressLayoutId={
              i === activeIndex && suppressLayoutIdFor === card.id
            }
            onTap={() => {
              if (dragging) return;
              if (i === activeIndex) onCardTap(card.id);
              else onChangeActive(card.id);
            }}
            onEyeTap={() => i === activeIndex && onEyeTap?.(card.id)}
            onPenTap={() => i === activeIndex && onPenTap?.(card.id)}
          />
        ))}
      </motion.div>
    </div>
  );
}

function CarouselItem({
  card,
  cardIndex,
  stripX,
  flipped,
  removing,
  dropping,
  isActive,
  suppressLayoutId,
  onTap,
  onEyeTap,
  onPenTap,
}: {
  card: CardData;
  cardIndex: number;
  stripX: ReturnType<typeof useMotionValue<number>>;
  flipped?: boolean;
  removing?: boolean;
  dropping?: boolean;
  isActive: boolean;
  suppressLayoutId?: boolean;
  onTap: () => void;
  onEyeTap?: () => void;
  onPenTap?: () => void;
}) {
  // Each card sits at cardIndex * STEP within the strip
  const slotX = cardIndex * STEP;

  // Distance from screen center → drives opacity and scale
  const opacity = useTransform(stripX, (sx) => {
    const distance = Math.abs(slotX + sx);
    return Math.max(0, Math.min(1, 1 - distance / 720));
  });
  const scale = useTransform(stripX, (sx) => {
    const distance = Math.abs(slotX + sx);
    return Math.max(0.9, 1 - distance / 2200);
  });

  // Outer wrapper handles removing/dropping animations.
  // Inner div carries the stripX-driven parallax (opacity/scale) so the two
  // motion systems don't fight each other and the remove transition actually plays.
  return (
    <div
      className="shrink-0 relative"
      style={{
        width: CARD_W,
        height: CARD_H,
        zIndex: removing ? 40 : dropping ? 30 : isActive ? 10 : 1,
        pointerEvents: isActive ? "auto" : "none",
      }}
      onClick={onTap}
    >
      <motion.div
        className="absolute inset-0"
        initial={dropping ? { y: -340, scale: 1.18, opacity: 0, rotate: -10 } : false}
        animate={
          removing
            ? { y: -50, scale: 0.4, opacity: 0, filter: "blur(20px)" }
            : dropping
              ? { y: 0, scale: 1, opacity: 1, rotate: 0 }
              : { opacity: 1, scale: 1, y: 0, rotate: 0, filter: "blur(0px)" }
        }
        transition={
          removing
            ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
            : dropping
              ? {
                  type: "spring",
                  stiffness: 240,
                  damping: 16,
                  mass: 0.9,
                  opacity: { duration: 0.18, ease: "easeOut" },
                }
              : { duration: 0 }
        }
      >
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: removing || dropping ? 1 : opacity,
            scale: removing || dropping ? 1 : scale,
          }}
        >
          <WalletCard
        card={card}
        width={CARD_W}
        height={CARD_H}
        flipped={!!flipped}
        layoutId={suppressLayoutId ? undefined : `card-${card.id}`}
        disableLayoutAnim
        onEyeTap={(e) => {
          e.stopPropagation();
          if (isActive) onEyeTap?.();
        }}
        onPenTap={(e) => {
          e.stopPropagation();
          if (isActive) onPenTap?.();
        }}
      />
        </motion.div>
      </motion.div>
    </div>
  );
}

function EmptyCardSlot({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="relative w-full" style={{ height: CARD_H }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={onAdd}
          className="group relative flex w-[295px] h-[178px] flex-col items-center justify-center gap-[10px] rounded-[16px] border-2 border-dashed border-[#d4cdc4] bg-white/40 transition-colors active:bg-white/70"
        >
          <span className="flex size-[44px] items-center justify-center rounded-full bg-[#ff6a00]/10 text-[#ff6a00] transition-transform group-active:scale-95">
            <Plus size={24} weight="bold" />
          </span>
          <div className="flex flex-col items-center gap-[2px]">
            <span className="text-[14px] font-semibold leading-[20px] text-[#1a1a1a]">
              Add your first card
            </span>
            <span className="text-[12px] leading-[16px] text-[#6b7280]">
              Link a debit, credit or virtual card
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
