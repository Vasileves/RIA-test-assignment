"use client";

import { useState } from "react";

/**
 * Circular flag avatar. Tries to load /flags/{CODE}.svg first, falls back to
 * the emoji glyph rendered inside a tinted circle.
 */
export function Flag({
  countryCode,
  emoji,
  size = 24,
}: {
  countryCode: string;
  emoji: string;
  size?: number;
}) {
  const [errored, setErrored] = useState(false);
  // Flag SVGs are stored lowercase (e.g. "ae.svg")
  const src = `/flags/${countryCode.toLowerCase()}.svg`;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background: "#f1f1f4",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
      }}
    >
      {errored ? (
        <span style={{ fontSize: size * 0.95, lineHeight: 1 }}>{emoji}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          onError={() => setErrored(true)}
          style={{ width: size, height: size, objectFit: "cover" }}
        />
      )}
    </span>
  );
}
