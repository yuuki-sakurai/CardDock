export type Page = "home" | "transactions" | "imports" | "cards";
export interface User {
  id: number;
  name: string;
  email: string;
}
export interface Session {
  user: User | null;
  csrfToken: string;
}
export interface BankAccount {
  id: number;
  bank_name: string;
  branch_name: string;
  account_type: string;
  balance: number;
  color: string;
}
export type AccountInput = Omit<BankAccount, "id">;
export interface CreditCard {
  id: number;
  name: string;
  closing_day: number;
  payment_day: number;
  payment_month_offset: number;
  bank_account_id: number | null;
}
export type CardInput = Omit<CreditCard, "id">;
export interface Transaction {
  id: number;
  date: string;
  merchant: string;
  category_name: string | null;
  amount: number;
  payment_month: string;
  card_name: string;
}
export interface ImportHistory {
  id: number;
  file_name: string;
  created_at: string;
  imported_count: number;
  card_name: string;
}
export interface Paginated<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
}
export interface Overview {
  total: number;
  count: number;
  dailyTotals: { date: string; amount: number }[];
  categoryTotals: { name: string | null; amount: number }[];
  payments: {
    payment_month: string;
    card_id: number;
    card_name: string;
    payment_day: number;
    bank_name: string | null;
    amount: number;
  }[];
}
export const navigationItems: { key: Page; label: string; icon: string }[] = [
  { key: "home", label: "ダッシュボード", icon: "⌂" },
  { key: "transactions", label: "利用明細", icon: "≡" },
  { key: "imports", label: "取込履歴", icon: "↥" },
  { key: "cards", label: "カード・口座設定", icon: "▤" },
];
export const yen = (amount: number) =>
  `¥${Number(amount).toLocaleString("ja-JP")}`;
