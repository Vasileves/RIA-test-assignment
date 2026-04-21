"use client";

import { ReactNode } from "react";

const STATUS_BAR_HEIGHT = 47;

export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--desktop-bg)] p-6">
      <div
        className="relative"
        style={{
          width: 393,
          height: 852,
        }}
      >
        {/* Device outer shadow */}
        <div
          className="absolute inset-0 rounded-[55px]"
          style={{
            boxShadow:
              "0 50px 100px -20px rgba(0,0,0,0.6), 0 30px 60px -30px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.04)",
          }}
        />
        {/* Bezel */}
        <div
          className="absolute inset-0 rounded-[55px] bg-black"
          style={{ padding: 4 }}
        >
          {/* Screen */}
          <div
            className="relative h-full w-full overflow-hidden rounded-[51px] bg-white"
            style={{ isolation: "isolate" }}
          >
            {/* App viewport is the full screen. Each screen extends its own
                background behind the status bar; the status-bar icons render
                on top at a higher z-index for legibility. */}
            <div className="absolute inset-0">{children}</div>

            {/* Status bar (above all app content) */}
            <StatusBar />

            {/* Dynamic Island */}
            <div
              className="absolute left-1/2 -translate-x-1/2 rounded-[20px] bg-black"
              style={{ top: 11, width: 126, height: 37, zIndex: 60 }}
            />

            {/* Home indicator */}
            <div
              className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black/90"
              style={{ bottom: 8, width: 134, height: 5, zIndex: 60 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div
      className="absolute left-0 right-0 top-0 flex items-center justify-between px-8 text-black pointer-events-none"
      style={{ height: STATUS_BAR_HEIGHT, zIndex: 55, paddingTop: 12 }}
    >
      <span className="text-[17px] font-semibold tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5">
        {/* Signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor" />
          <rect x="5" y="6" width="3" height="6" rx="0.5" fill="currentColor" />
          <rect x="10" y="3" width="3" height="9" rx="0.5" fill="currentColor" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
        </svg>
        {/* Wifi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <path
            d="M8.5 2C11.5 2 14.2 3 16.3 4.7L14.9 6.4C13.1 5 10.9 4.1 8.5 4.1S3.9 5 2.1 6.4L0.7 4.7C2.8 3 5.5 2 8.5 2Z"
            fill="currentColor"
          />
          <path
            d="M8.5 6C10.2 6 11.8 6.6 13 7.6L11.6 9.3C10.7 8.6 9.6 8.2 8.5 8.2S6.3 8.6 5.4 9.3L4 7.6C5.2 6.6 6.8 6 8.5 6Z"
            fill="currentColor"
          />
          <circle cx="8.5" cy="11" r="1.2" fill="currentColor" />
        </svg>
        {/* Battery */}
        <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="11"
            rx="2.5"
            stroke="currentColor"
            strokeOpacity="0.35"
          />
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill="currentColor" />
          <rect
            x="24"
            y="4"
            width="1.5"
            height="4"
            rx="0.75"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}
