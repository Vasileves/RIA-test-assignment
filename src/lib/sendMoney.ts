export type Country = { code: string; name: string; flag: string };

export type DeliveryMethod = "bank" | "cash" | "crypto";

export type Bank = { id: string; name: string; logoColor: string };

export type Recipient = {
  firstName: string;
  middleName?: string;
  lastName: string;
  country: Country;
  city: string;
  toSelf?: boolean;
  delivery?: DeliveryMethod;
  bank?: Bank;
  account?: string;
  reference?: string;
};

export const POPULAR_COUNTRIES: Country[] = [
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
];

export const OTHER_COUNTRIES: Country[] = [
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
];

export const POPULAR_BANKS: Bank[] = [
  { id: "enbd", name: "Emirates NBD", logoColor: "#0E2A47" },
  { id: "fab", name: "First Abu Dhabi Bank", logoColor: "#A0252C" },
  { id: "adcb", name: "Abu Dhabi Commercial Bank", logoColor: "#0F47A1" },
  { id: "dib", name: "Dubai Islamic Bank", logoColor: "#0E7C42" },
  { id: "rakbank", name: "RAKBANK", logoColor: "#C8102E" },
];

export const OTHER_BANKS: Bank[] = [
  { id: "mashreq", name: "Mashreq Bank", logoColor: "#F37021" },
  { id: "hsbc", name: "HSBC UAE", logoColor: "#DB0011" },
  { id: "cbd", name: "Commercial Bank of Dubai", logoColor: "#003C71" },
  { id: "uab", name: "United Arab Bank", logoColor: "#1F3864" },
  { id: "nbf", name: "National Bank of Fujairah", logoColor: "#1B5E20" },
];

// Realistic dummy data for the recipient form
export const DUMMY_RECIPIENT = {
  firstName: "Julia",
  middleName: "Maria",
  lastName: "Hassan",
  city: "Dubai",
  account: "AE07 0331 2345 6789 0123 456",
  reference: "Family support",
};
