import type {
  AccountInput,
  BankAccount,
  CardInput,
  CreditCard,
  ImportHistory,
  Overview,
  Paginated,
  Session,
  Transaction,
} from "./types";
const base = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(
  /\/$/,
  "",
);
let csrfToken = "";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
async function request<T>(
  path: string,
  method = "GET",
  body?: object | FormData,
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (method !== "GET") headers["X-CSRF-TOKEN"] = csrfToken;
  if (body && !(body instanceof FormData))
    headers["Content-Type"] = "application/json";
  const response = await fetch(`${base}/${path}`, {
    method,
    credentials: "include",
    headers,
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    errors?: Record<string, string[]>;
  };
  if (!response.ok) {
    if (response.status === 401)
      window.dispatchEvent(new Event("session-expired"));
    if (response.status === 419)
      throw new ApiError(
        "セッションの有効期限が切れました。ページを再読み込みしてください。",
        419,
      );
    throw new ApiError(
      Object.values(data.errors ?? {})
        .flat()
        .join("\n") ||
        data.message ||
        "通信に失敗しました。",
      response.status,
    );
  }
  return data as T;
}
async function session(path = "auth/session", body?: object) {
  const result = await request<Session>(path, body ? "POST" : "GET", body);
  csrfToken = result.csrfToken;
  return result;
}
export const api = {
  session: () => session(),
  login: (body: object) => session("auth/login", body),
  register: (body: object) => session("auth/register", body),
  logout: () => session("auth/logout", {}),
  accounts: () => request<BankAccount[]>("bank-accounts"),
  cards: () => request<CreditCard[]>("credit-cards"),
  saveAccount: (body: AccountInput, id?: number) =>
    request<BankAccount>(
      `bank-accounts${id ? `/${id}` : ""}`,
      id ? "PUT" : "POST",
      body,
    ),
  saveCard: (body: CardInput, id?: number) =>
    request<CreditCard>(
      `credit-cards${id ? `/${id}` : ""}`,
      id ? "PUT" : "POST",
      body,
    ),
  transactions: (query: URLSearchParams) =>
    request<Paginated<Transaction>>(`credit-card-transactions?${query}`),
  overview: (month: string) =>
    request<Overview>(
      `credit-card-overview?month=${encodeURIComponent(month)}`,
    ),
  imports: (page: number) =>
    request<Paginated<ImportHistory>>(`statement-imports?page=${page}`),
  import: (file: File, cardId: number) => {
    const body = new FormData();
    body.set("file", file);
    body.set("credit_card_id", String(cardId));
    return request<{ import: ImportHistory; alreadyImported: boolean }>(
      "statement-imports",
      "POST",
      body,
    );
  },
};
