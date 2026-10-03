<script setup lang="ts">
import { reactive, ref } from "vue";
import ModalShell from "./ModalShell.vue";
import { api } from "../api";
import type { BankAccount, CreditCard } from "../types";
const props = defineProps<{
  kind: "card" | "account";
  card?: CreditCard;
  account?: BankAccount;
  accounts: BankAccount[];
}>();
const emit = defineEmits<{ close: []; saved: [] }>();
const card = reactive({
  name: props.card?.name ?? "",
  closing_day: props.card?.closing_day ?? 31,
  payment_day: props.card?.payment_day ?? 27,
  payment_month_offset: props.card?.payment_month_offset ?? 1,
  bank_account_id: props.card?.bank_account_id ?? null,
});
const account = reactive({
  bank_name: props.account?.bank_name ?? "",
  branch_name: props.account?.branch_name ?? "",
  account_type: props.account?.account_type ?? "普通",
  balance: props.account?.balance ?? 0,
  color: props.account?.color ?? "#6255d9",
});
const busy = ref(false);
const error = ref("");
async function save() {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    if (props.kind === "card") await api.saveCard(card, props.card?.id);
    else await api.saveAccount(account, props.account?.id);
    emit("saved");
  } catch (e) {
    error.value = e instanceof Error ? e.message : "保存に失敗しました。";
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <ModalShell
    :title="kind === 'card' ? 'カード設定' : '銀行口座の設定'"
    :busy="busy"
    @close="$emit('close')"
    ><form @submit.prevent="save">
      <fieldset :disabled="busy">
        <template v-if="kind === 'card'"
          ><label class="field"
            >カード名<input
              v-model.trim="card.name"
              maxlength="100"
              required
              autofocus /></label
          ><label class="field"
            >締め日<select v-model.number="card.closing_day">
              <option v-for="n in 31" :key="n" :value="n">
                {{ n === 31 ? "末日" : `${n}日` }}
              </option>
            </select></label
          ><label class="field"
            >支払月<select v-model.number="card.payment_month_offset">
              <option :value="0">当月</option>
              <option :value="1">翌月</option>
              <option :value="2">翌々月</option>
            </select></label
          ><label class="field"
            >支払日<select v-model.number="card.payment_day">
              <option v-for="n in 31" :key="n" :value="n">
                {{ n === 31 ? "末日" : `${n}日` }}
              </option>
            </select></label
          ><label class="field"
            >引き落とし口座<select v-model="card.bank_account_id">
              <option :value="null">未設定</option>
              <option v-for="a in accounts" :key="a.id" :value="a.id">
                {{ a.bank_name }} {{ a.branch_name }}
              </option>
            </select></label
          >
          <p>
            カード番号やセキュリティコードは入力しないでください。
          </p></template
        ><template v-else
          ><label class="field"
            >銀行名<input
              v-model.trim="account.bank_name"
              maxlength="100"
              required
              autofocus /></label
          ><label class="field"
            >支店名<input
              v-model.trim="account.branch_name"
              maxlength="100" /></label
          ><label class="field"
            >口座種別<select v-model="account.account_type">
              <option>普通</option>
              <option>当座</option>
              <option>貯蓄</option>
            </select></label
          ><label class="field"
            >手動残高（円）<input
              v-model.number="account.balance"
              type="number"
              step="1"
              min="-999999999999"
              max="999999999999"
              required /></label
          ><label class="field"
            >表示色<input v-model="account.color" type="color"
          /></label>
          <p>
            銀行との自動連携は行いません。口座番号の入力は不要です。
          </p></template
        >
      </fieldset>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="modal-actions">
        <button
          type="button"
          class="outline"
          :disabled="busy"
          @click="$emit('close')"
        >
          キャンセル</button
        ><button class="primary" :disabled="busy">
          {{ busy ? "保存中…" : "保存する" }}
        </button>
      </div>
    </form></ModalShell
  >
</template>
