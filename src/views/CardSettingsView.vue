<script setup lang="ts">
import BankAccountList from "../components/dashboard/BankAccountList.vue";
import type { BankAccount, CreditCard } from "../types";
defineProps<{ cards: CreditCard[]; accounts: BankAccount[] }>();
defineEmits<{
  editCard: [card?: CreditCard];
  editAccount: [account?: BankAccount];
}>();
const day = (day: number) => (day === 31 ? "末日" : `${day}日`);
</script>
<template>
  <section class="settings">
    <article v-for="card in cards" :key="card.id" class="card card-setting">
      <h2>{{ card.name }}</h2>
      <dl>
        <div>
          <dt>締め日</dt>
          <dd>毎月{{ day(card.closing_day) }}</dd>
        </div>
        <div>
          <dt>支払日</dt>
          <dd>
            {{ ["当月", "翌月", "翌々月"][card.payment_month_offset]
            }}{{ day(card.payment_day) }}
          </dd>
        </div>
        <div>
          <dt>引き落とし口座</dt>
          <dd>
            {{
              accounts.find((a) => a.id === card.bank_account_id)?.bank_name ||
              "未設定"
            }}
          </dd>
        </div>
      </dl>
      <button class="outline" @click="$emit('editCard', card)">
        設定を編集
      </button>
    </article>
    <button class="add-card" @click="$emit('editCard')">
      <b>＋</b><strong>カードを追加</strong
      ><small>カード番号の入力は不要です</small>
    </button>
  </section>
  <BankAccountList :accounts="accounts" @edit="$emit('editAccount', $event)" />
  <p class="info">
    締め日・支払月の設定は管理用です。明細の支払予定月にはCSVに記載した値を使います。
  </p>
</template>
