<script setup lang="ts">
import TransactionTable from "../components/transactions/TransactionTable.vue";
import type { CreditCard, Paginated, Transaction } from "../types";
defineProps<{
  result: Paginated<Transaction>;
  cards: CreditCard[];
  search: string;
  cardId: string;
  date: string;
}>();
defineEmits<{
  filter: [search: string, cardId: string];
  page: [page: number];
  clearDate: [];
}>();
</script>
<template>
  <section class="card panel">
    <form
      class="filter-bar"
      @submit.prevent="
        $emit(
          'filter',
          ($refs.search as HTMLInputElement).value,
          ($refs.card as HTMLSelectElement).value,
        )
      "
    >
      <label
        >利用場所<input
          ref="search"
          :value="search"
          maxlength="100"
          placeholder="利用場所を検索" /></label
      ><label
        >カード<select ref="card" :value="cardId">
          <option value="">すべてのカード</option>
          <option v-for="card in cards" :key="card.id" :value="card.id">
            {{ card.name }}
          </option>
        </select></label
      ><button class="primary">検索</button>
    </form>
    <p v-if="date">
      {{ date }} の明細
      <button @click="$emit('clearDate')">日付の絞り込みを解除</button>
    </p>
    <TransactionTable :transactions="result.data" detailed />
    <div class="pagination">
      <button
        :disabled="result.page <= 1"
        @click="$emit('page', result.page - 1)"
      >
        前へ</button
      ><span
        >{{ result.total }}件・{{ result.page }} /
        {{ Math.max(1, Math.ceil(result.total / result.per_page)) }}ページ</span
      ><button
        :disabled="result.page * result.per_page >= result.total"
        @click="$emit('page', result.page + 1)"
      >
        次へ
      </button>
    </div>
  </section>
</template>
