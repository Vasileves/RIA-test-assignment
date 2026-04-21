import type { CardTheme } from "@/components/WalletCard";

export const MINI_GRADIENTS: Record<CardTheme, string> = {
  chaseDebit: "linear-gradient(147.995deg, #a04100 0%, #ff6b00 100%)",
  salaryChase: "linear-gradient(147.995deg, #1a1a1a 0%, #000000 100%)",
  virtualSubs: "linear-gradient(147.995deg, #516161 0%, #243433 100%)",
  sharedGroceries: "linear-gradient(147.995deg, #f8ddd2 0%, #c9c4b8 100%)",
  indigo: "linear-gradient(147.995deg, #6366f1 0%, #2e2680 100%)",
  emerald: "linear-gradient(147.995deg, #10b981 0%, #064e3b 100%)",
  ruby: "linear-gradient(147.995deg, #f43f5e 0%, #7f1129 100%)",
  amethyst: "linear-gradient(147.995deg, #a78bfa 0%, #4c1d95 100%)",
};

export function isLightTheme(theme: CardTheme): boolean {
  return theme === "sharedGroceries";
}
