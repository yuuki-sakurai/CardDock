<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { api } from "./api";
import {
  navigationItems,
  type BankAccount,
  type CreditCard,
  type ImportHistory,
  type Overview,
  type Page,
  type Paginated,
  type Transaction,
  type User,
} from "./types";
import AppSidebar from "./components/layout/AppSidebar.vue";
import AppHeader from "./components/layout/AppHeader.vue";
import AuthForm from "./components/AuthForm.vue";
import SettingsEditor from "./components/SettingsEditor.vue";
import CsvImportModal from "./components/imports/CsvImportModal.vue";
import DashboardView from "./views/DashboardView.vue";
import TransactionsView from "./views/TransactionsView.vue";
import ImportHistoryView from "./views/ImportHistoryView.vue";
import CardSettingsView from "./views/CardSettingsView.vue";
const readPage = (): Page => {
  const key = location.hash.replace(/^#\/?/, "");
  return navigationItems.find((item) => item.key === key)?.key ?? "home";
};
const activePage = ref<Page>(readPage());
const user = ref<User | null>(null);
const ready = ref(false);
const busy = ref(false);
const error = ref("");
const notice = ref("");
const now = new Date();
const month = ref(
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
);
const accounts = ref<BankAccount[]>([]);
const cards = ref<CreditCard[]>([]);
const emptyPage = <T,>(): Paginated<T> => ({
  data: [],
  page: 1,
  per_page: 50,
  total: 0,
});
const transactions = ref(emptyPage<Transaction>());
const imports = ref(emptyPage<ImportHistory>());
const overview = ref<Overview>({
  total: 0,
  count: 0,
  dailyTotals: [],
  categoryTotals: [],
  payments: [],
});
const search = ref("");
const cardId = ref("");
const date = ref("");
const page = ref(1);
const importPage = ref(1);
const uploadOpen = ref(false);
const editor = ref<{
  kind: "card" | "account";
  card?: CreditCard;
  account?: BankAccount;
}>();
const title = computed(
  () => navigationItems.find((item) => item.key === activePage.value)?.label,
);
let generation = 0;
function expire() {
  generation++;
  user.value = null;
  accounts.value = [];
  cards.value = [];
  transactions.value = emptyPage();
  imports.value = emptyPage();
  overview.value = {
    total: 0,
    count: 0,
    dailyTotals: [],
    categoryTotals: [],
    payments: [],
  };
  editor.value = undefined;
  uploadOpen.value = false;
  busy.value = false;
  notice.value = "";
}
function navigate(next: Page) {
  location.hash = `/${next}`;
}
function hashChanged() {
  activePage.value = readPage();
}
async function load() {
  if (!user.value) return;
  const current = ++generation;
  busy.value = true;
  error.value = "";
  try {
    const [nextAccounts, nextCards] = await Promise.all([
      api.accounts(),
      api.cards(),
    ]);
    if (current !== generation) return;
    accounts.value = nextAccounts;
    cards.value = nextCards;
    if (activePage.value === "home") {
      const result = await api.overview(month.value);
      if (current === generation) overview.value = result;
    }
    if (activePage.value === "transactions") {
      const query = new URLSearchParams({
        month: month.value,
        page: String(page.value),
      });
      if (search.value) query.set("search", search.value);
      if (cardId.value) query.set("credit_card_id", cardId.value);
      if (date.value) query.set("date", date.value);
      const result = await api.transactions(query);
      if (current === generation) transactions.value = result;
    }
    if (activePage.value === "imports") {
      const result = await api.imports(importPage.value);
      if (current === generation) imports.value = result;
    }
  } catch (e) {
    if (current === generation)
      error.value = e instanceof Error ? e.message : "読み込みに失敗しました。";
  } finally {
    if (current === generation) busy.value = false;
  }
}
async function init() {
  error.value = "";
  try {
    const session = await api.session();
    user.value = session.user;
    ready.value = true;
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "接続できませんでした。";
  }
}
async function logout() {
  try {
    await api.logout();
    expire();
    error.value = "";
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : "ログアウトできませんでした。";
  }
}
async function authenticated(value: User) {
  user.value = value;
  page.value = 1;
  importPage.value = 1;
  search.value = "";
  cardId.value = "";
  date.value = "";
  await load();
}
function openImport() {
  if (!cards.value.length) {
    notice.value = "先にカードを登録してください。";
    navigate("cards");
    editor.value = { kind: "card" };
  } else uploadOpen.value = true;
}
async function imported(message: string) {
  uploadOpen.value = false;
  notice.value = message;
  importPage.value = 1;
  await load();
}
async function saved() {
  editor.value = undefined;
  notice.value = "設定を保存しました。";
  await load();
}
function filter(nextSearch: string, nextCardId: string) {
  search.value = nextSearch;
  cardId.value = nextCardId;
  page.value = 1;
  load();
}
function selectDate(value: string) {
  date.value = value;
  page.value = 1;
  search.value = "";
  cardId.value = "";
  navigate("transactions");
}
function changeMonth(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  if (/^\d{4}-\d{2}$/.test(value)) {
    month.value = value;
    date.value = "";
    page.value = 1;
    load();
  }
}
watch(activePage, () => {
  notice.value = "";
  load();
});
onMounted(() => {
  window.addEventListener("hashchange", hashChanged);
  window.addEventListener("session-expired", expire);
  init();
});
onUnmounted(() => {
  generation++;
  window.removeEventListener("hashchange", hashChanged);
  window.removeEventListener("session-expired", expire);
});
</script>
<template>
  <div v-if="!ready" class="auth-page">
    <p v-if="!error">接続を確認しています…</p>
    <div v-else>
      <p class="error" role="alert">{{ error }}</p>
      <button class="primary" @click="init">再接続</button>
    </div>
  </div>
  <AuthForm v-else-if="!user" @authenticated="authenticated" />
  <div v-else class="shell">
    <AppSidebar
      :active-page="activePage"
      :user="user"
      @navigate="navigate"
      @logout="logout"
    />
    <main>
      <AppHeader @upload="openImport" @logout="logout" />
      <div class="content">
        <section class="heading">
          <div>
            <small class="eyebrow">CREDIT CARD MANAGER</small>
            <h1>{{ title }}</h1>
          </div>
          <label
            v-if="activePage === 'home' || activePage === 'transactions'"
            class="field"
            >表示月<input
              type="month"
              :value="month"
              min="1900-01"
              max="9998-12"
              @change="changeMonth"
          /></label>
        </section>
        <p v-if="notice" class="info" role="status">{{ notice }}</p>
        <p v-if="error" class="error" role="alert">
          {{ error }} <button @click="load">再読み込み</button>
        </p>
        <p v-if="busy" role="status">読み込み中…</p>
        <template v-else-if="!error"
          ><DashboardView
            v-if="activePage === 'home'"
            :overview="overview"
            :accounts="accounts"
            :month="month"
            @select-date="selectDate"
            @edit-account="
              editor = { kind: 'account', account: $event }
            " /><TransactionsView
            v-else-if="activePage === 'transactions'"
            :result="transactions"
            :cards="cards"
            :search="search"
            :card-id="cardId"
            :date="date"
            @filter="filter"
            @page="
              page = $event;
              load();
            "
            @clear-date="
              date = '';
              page = 1;
              load();
            " /><ImportHistoryView
            v-else-if="activePage === 'imports'"
            :result="imports"
            @page="
              importPage = $event;
              load();
            " /><CardSettingsView
            v-else
            :cards="cards"
            :accounts="accounts"
            @edit-card="editor = { kind: 'card', card: $event }"
            @edit-account="editor = { kind: 'account', account: $event }"
        /></template>
      </div>
    </main>
    <SettingsEditor
      v-if="editor"
      :kind="editor.kind"
      :card="editor.card"
      :account="editor.account"
      :accounts="accounts"
      @close="editor = undefined"
      @saved="saved"
    /><CsvImportModal
      v-if="uploadOpen"
      :cards="cards"
      @close="uploadOpen = false"
      @imported="imported"
    />
  </div>
</template>
