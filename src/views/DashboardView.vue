<script setup lang="ts">
import BankAccountList from "../components/dashboard/BankAccountList.vue";
import MonthlySpendingSummary from "../components/dashboard/MonthlySpendingSummary.vue";
import SpendingCalendar from "../components/dashboard/SpendingCalendar.vue";
import { yen, type BankAccount, type Overview } from "../types";
defineProps<{ overview: Overview; accounts: BankAccount[]; month: string }>();
defineEmits<{
  selectDate: [date: string];
  editAccount: [account?: BankAccount];
}>();
function paymentDate(month: string, day: number) {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return `${month.slice(0, 7)}-${String(Math.min(day, new Date(y, m, 0).getDate())).padStart(2, "0")}`;
}
</script>
<template>
  <MonthlySpendingSummary :overview="overview" :month="month" />
  <section class="dashboard-grid">
    <SpendingCalendar
      :month="month"
      :daily-totals="overview.dailyTotals"
      @select="$emit('selectDate', $event)"
    /><BankAccountList
      :accounts="accounts"
      @edit="$emit('editAccount', $event)"
    />
  </section>
  <section class="card panel payment-panel">
    <div class="panel-head">
      <div>
        <h3>支払予定</h3>
        <p>
          表示月から3か月分。CSVの支払予定月と登録した支払日から表示します。銀行休業日は考慮しません。
        </p>
      </div>
    </div>
    <p v-if="!overview.payments.length" class="panel-empty">
      取込済みの支払予定はありません。
    </p>
    <div
      v-for="payment in overview.payments"
      :key="`${payment.card_id}-${payment.payment_month}`"
      class="payment"
    >
      <p>
        <strong>{{ payment.card_name }}</strong
        ><small
          >{{ paymentDate(payment.payment_month, payment.payment_day) }}・{{
            payment.bank_name || "口座未設定"
          }}</small
        >
      </p>
      <div>
        <strong>{{ yen(payment.amount) }}</strong
        ><small>取込済み明細の合計</small>
      </div>
    </div>
  </section>
</template>
