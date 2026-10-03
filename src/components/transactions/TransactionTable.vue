<script setup lang="ts">
import type { Transaction } from "../../types";

withDefaults(
  defineProps<{ transactions: Transaction[]; detailed?: boolean }>(),
  { detailed: false },
);
const yen = (amount: number) => `¥${amount.toLocaleString("ja-JP")}`;
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>利用日</th>
          <th>利用場所</th>
          <th v-if="detailed">カード</th>
          <th>カテゴリ</th>
          <th>支払予定月</th>
          <th>金額</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transaction in transactions" :key="transaction.id">
          <td>
            {{ detailed ? transaction.date : transaction.date.slice(5) }}
          </td>
          <td>
            <strong>{{ transaction.merchant }}</strong>
          </td>
          <td v-if="detailed">
            <span class="mini-card">{{ transaction.card_name }}</span>
          </td>
          <td>
            <span class="tag">{{ transaction.category_name || "未分類" }}</span>
          </td>
          <td>{{ transaction.payment_month.slice(0, 7) }}</td>
          <td class="amount">{{ yen(transaction.amount) }}</td>
        </tr>
        <tr v-if="!transactions.length">
          <td :colspan="detailed ? 6 : 5" class="empty">
            条件に一致する明細はありません
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
