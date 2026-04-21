"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, MapPin, Plus } from "@phosphor-icons/react";
import type { Country } from "@/lib/sendMoney";

// Representative city/state list per destination country.
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

export function CityPickerSheet({
  open,
  country,
  initialValue,
  onClose,
  onSelect,
}: {
  open: boolean;
  country: Country;
  initialValue: string;
  onClose: () => void;
  onSelect: (city: string) => void;
}) {
  const [query, setQuery] = useState(initialValue);

  // Reset the query whenever the sheet re-opens
  const handleUseTyped = () => {
    const trimmed = query.trim();
    if (trimmed) onSelect(trimmed);
  };

  const suggestions = useMemo(() => {
    const pool = CITIES_BY_COUNTRY[country.code] ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter((c) => c.toLowerCase().includes(q));
  }, [country.code, query]);

  const exactMatch = suggestions.some(
    (c) => c.toLowerCase() === query.trim().toLowerCase(),
  );
  const trimmed = query.trim();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="city"
          // Start below the status bar (47px on the device) and extend to
          // the bottom — works whether mounted under a modal-fullbleed wrapper
          // (RecipientFlow) or under the plain app viewport.
          className="absolute left-0 right-0 bottom-0 z-[60] flex flex-col bg-white"
          style={{ top: 47 }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Header */}
          <div className="relative flex h-[60px] items-center px-[16px]">
            <button
              onClick={onClose}
              aria-label="Back"
              className="flex size-[28px] items-center justify-center rounded-full active:bg-black/5"
            >
              <ArrowLeft size={22} weight="regular" color="#111827" />
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium leading-[28px] tracking-[-0.45px] text-[#111827]">
              City or region
            </h1>
          </div>

          {/* Country context + input */}
          <div className="flex flex-col gap-[10px] px-[16px] pb-[12px]">
            <div className="flex items-center gap-[8px] px-[4px] text-[12px] leading-[16px] text-[#6b7280]">
              <span className="text-[14px] leading-[16px]">{country.flag}</span>
              <span>
                Showing places in <span className="font-semibold text-[#111827]">{country.name}</span>
              </span>
            </div>
            <label className="flex h-[52px] w-full items-center gap-[10px] rounded-[12px] bg-[#f3f4f6] px-[14px]">
              <MapPin size={18} weight="regular" color="#6b7280" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUseTyped();
                  if (e.key === "Escape") onClose();
                }}
                placeholder="Start typing a city or region"
                className="flex-1 bg-transparent text-[14px] leading-[20px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
              />
            </label>
          </div>

          {/* Suggestion list */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-[16px] pb-[16px]">
            {suggestions.length === 0 && !trimmed && (
              <EmptyState country={country.name} />
            )}

            {suggestions.length > 0 && (
              <div className="flex flex-col">
                <span className="px-[4px] pt-[8px] pb-[6px] text-[11px] font-semibold uppercase tracking-[0.6px] text-[#6b7280]">
                  {trimmed ? "Matches" : "Popular places"}
                </span>
                <div className="flex flex-col">
                  {suggestions.map((city, i) => (
                    <button
                      key={city}
                      onClick={() => onSelect(city)}
                      className="flex h-[52px] w-full items-center gap-[12px] px-[8px] text-left active:bg-[#f5f5f7]"
                      style={{
                        borderTop: i > 0 ? "1px solid #f1f1f4" : undefined,
                      }}
                    >
                      <span className="flex size-[32px] items-center justify-center rounded-full bg-[#fff1eb] text-[#ff6a00]">
                        <MapPin size={16} weight="fill" />
                      </span>
                      <span className="flex-1 text-[14px] font-medium leading-[20px] text-[#111827]">
                        <HighlightedMatch text={city} query={trimmed} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {trimmed && !exactMatch && (
              <button
                onClick={handleUseTyped}
                className="mt-[16px] flex w-full items-center gap-[12px] rounded-[12px] border border-dashed border-[#d4cdc4] bg-white px-[12px] py-[12px] text-left active:bg-[#fafafa]"
              >
                <span className="flex size-[32px] items-center justify-center rounded-full bg-[#ff6a00]/10 text-[#ff6a00]">
                  <Plus size={16} weight="bold" />
                </span>
                <div className="flex flex-1 flex-col">
                  <span className="text-[13px] font-semibold leading-[18px] text-[#111827]">
                    Use "{trimmed}"
                  </span>
                  <span className="text-[11px] leading-[14px] text-[#6b7280]">
                    Add a custom city or region
                  </span>
                </div>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ country }: { country: string }) {
  return (
    <div className="flex flex-col items-center gap-[8px] py-[40px] text-center">
      <MapPin size={24} weight="regular" color="#9ca3af" />
      <p className="text-[13px] leading-[18px] text-[#6b7280]">
        Start typing to search cities in {country}
      </p>
    </div>
  );
}

function HighlightedMatch({ text, query }: { text: string; query: string }) {
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
