export type Currency = {
  code: string;
  name: string;
  countryCode: string; // ISO-2 for flag asset lookup
  flag: string; // emoji fallback
};

// Mock spot rates relative to USD (realistic-ish)
export const RATES_USD: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.673,
  INR: 83.2,
  MXN: 17.1,
  PHP: 58.4,
  COP: 4150,
  BRL: 5.06,
  EGP: 48.9,
  NGN: 1450,
};

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", countryCode: "US", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", countryCode: "EU", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", countryCode: "GB", flag: "🇬🇧" },
  { code: "AED", name: "UAE Dirham", countryCode: "AE", flag: "🇦🇪" },
  { code: "INR", name: "Indian Rupee", countryCode: "IN", flag: "🇮🇳" },
  { code: "MXN", name: "Mexican Peso", countryCode: "MX", flag: "🇲🇽" },
  { code: "PHP", name: "Philippine Peso", countryCode: "PH", flag: "🇵🇭" },
  { code: "COP", name: "Colombian Peso", countryCode: "CO", flag: "🇨🇴" },
  { code: "BRL", name: "Brazilian Real", countryCode: "BR", flag: "🇧🇷" },
  { code: "EGP", name: "Egyptian Pound", countryCode: "EG", flag: "🇪🇬" },
  { code: "NGN", name: "Nigerian Naira", countryCode: "NG", flag: "🇳🇬" },
];

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

// Convert amount across currencies via USD pivot
export function convert(amount: number, from: string, to: string): number {
  const fr = RATES_USD[from] ?? 1;
  const tr = RATES_USD[to] ?? 1;
  return (amount / fr) * tr;
}

// Returns "1 USD = 3.673 AED" style rate
export function rate(from: string, to: string): number {
  return convert(1, from, to);
}

// Default destination per country code
export function currencyForCountry(countryCode: string): string {
  switch (countryCode) {
    case "AE":
      return "AED";
    case "PH":
      return "PHP";
    case "MX":
      return "MXN";
    case "IN":
      return "INR";
    case "CO":
      return "COP";
    case "BR":
      return "BRL";
    case "PT":
    case "ES":
      return "EUR";
    case "EG":
      return "EGP";
    case "NG":
      return "NGN";
    case "GB":
      return "GBP";
    default:
      return "USD";
  }
}
