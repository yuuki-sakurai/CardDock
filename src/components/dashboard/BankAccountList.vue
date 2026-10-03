<script setup lang="ts">
import { computed } from "vue";
import type { BankAccount } from "../../types";
defineEmits<{ edit: [account?: BankAccount] }>();
const props = defineProps<{ accounts: BankAccount[] }>();
const total = computed(() =>
  props.accounts.reduce((sum, account) => sum + Number(account.balance), 0),
);
const yen = (amount: number) => `¥${amount.toLocaleString("ja-JP")}`;
</script>

<template>
  <section class="card panel account-panel">
    <div class="panel-head">
      <div>
        <h3>銀行口座</h3>
        <p>手動で登録・更新した残高</p>
      </div>
      <div class="account-total">
        <small>口座残高合計</small><strong>{{ yen(total) }}</strong>
      </div>
    </div>
    <div class="account-list">
      <button
        v-for="account in accounts"
        :key="account.id"
        class="account-row"
        @click="$emit('edit', account)"
      >
        <span
          class="account-logo"
          :style="{ backgroundColor: account.color }"
          >{{ account.bank_name.slice(0, 1) }}</span
        >
        <span class="account-name"
          ><strong>{{ account.bank_name }}</strong
          ><small
            >{{ account.branch_name }}・{{ account.account_type }}</small
          ></span
        >
        <strong class="account-balance">{{ yen(account.balance) }}</strong
        ><i>›</i>
      </button>
    </div>
    <button class="account-add" @click="$emit('edit')">
      ＋ 銀行口座を登録
    </button>
  </section>
</template>
