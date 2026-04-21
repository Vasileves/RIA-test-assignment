import { CardData } from "@/components/WalletCard";

export type Transaction = {
  id: string;
  name: string;
  sub: string;
  amount: string;
  positive?: boolean;
  iconKind: "amazon" | "starbucks" | "avatar" | "subscription" | "transfer" | "groceries" | "fuel" | "salary";
};

export const TRANSACTIONS_BY_CARD: Record<string, Transaction[]> = {
  primary: [
    { id: "p1", name: "Amazon", sub: "Today, 10:42 AM", amount: "-$84.50", iconKind: "amazon" },
    { id: "p2", name: "Starbucks", sub: "Oct 5, 3:17 PM", amount: "-$4.75", iconKind: "starbucks" },
    { id: "p3", name: "Sarah Connor", sub: "Yesterday", amount: "+$120.00", positive: true, iconKind: "avatar" },
  ],
  salary: [
    { id: "s1", name: "Acme Corp Payroll", sub: "Oct 1, 9:00 AM", amount: "+$3,200.00", positive: true, iconKind: "salary" },
    { id: "s2", name: "Rent — Heritage Mgmt", sub: "Oct 1, 9:14 AM", amount: "-$1,450.00", iconKind: "transfer" },
    { id: "s3", name: "Vanguard Transfer", sub: "Sep 28, 4:20 PM", amount: "-$500.00", iconKind: "transfer" },
  ],
  virtual: [
    { id: "v1", name: "Netflix", sub: "Today, 6:00 AM", amount: "-$15.49", iconKind: "subscription" },
    { id: "v2", name: "Spotify Family", sub: "Oct 4, 6:00 AM", amount: "-$16.99", iconKind: "subscription" },
    { id: "v3", name: "iCloud+ 200GB", sub: "Oct 2, 1:11 AM", amount: "-$2.99", iconKind: "subscription" },
  ],
  groceries: [
    { id: "g1", name: "Whole Foods", sub: "Today, 7:18 PM", amount: "-$62.30", iconKind: "groceries" },
    { id: "g2", name: "Trader Joe's", sub: "Oct 3, 11:02 AM", amount: "-$48.91", iconKind: "groceries" },
    { id: "g3", name: "Maya Chen", sub: "Oct 3, 11:14 AM", amount: "+$24.45", positive: true, iconKind: "avatar" },
  ],
};

export const INITIAL_CARDS: CardData[] = [
  {
    id: "primary",
    theme: "chaseDebit",
    title: "CHASE DEBIT",
    last4: "4892",
    balance: "1,250.00",
    fullNumber: "4892 1234 5678 9012",
    expiry: "09/28",
    cvv: "412",
    holder: "TIAGO LIMONE",
  },
  {
    id: "salary",
    theme: "salaryChase",
    title: "SALARY CHASE",
    last4: "4289",
    balance: "1,250.00",
    fullNumber: "4289 1234 5678 9012",
    expiry: "12/27",
    cvv: "123",
    holder: "TIAGO LIMONE",
  },
  {
    id: "virtual",
    theme: "virtualSubs",
    title: "VIRTUAL SUBS",
    last4: "9932",
    balance: "42.00",
    fullNumber: "9932 1234 5678 9012",
    expiry: "03/29",
    cvv: "891",
    holder: "TIAGO LIMONE",
  },
  {
    id: "groceries",
    theme: "sharedGroceries",
    title: "SHARED GROCERIES",
    last4: "5521",
    balance: "318.50",
    fullNumber: "5521 1234 5678 9012",
    expiry: "07/28",
    cvv: "204",
    holder: "TIAGO LIMONE",
  },
];
