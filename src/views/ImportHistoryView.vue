<script setup lang="ts">
import type { ImportHistory, Paginated } from "../types";
defineProps<{ result: Paginated<ImportHistory> }>();
defineEmits<{ page: [page: number] }>();
</script>
<template>
  <section class="card panel">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ファイル名</th>
            <th>カード</th>
            <th>取込日時</th>
            <th>登録件数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in result.data" :key="item.id">
            <td>{{ item.file_name }}</td>
            <td>{{ item.card_name }}</td>
            <td>{{ item.created_at }} (UTC)</td>
            <td>{{ item.imported_count }}件</td>
          </tr>
          <tr v-if="!result.total">
            <td colspan="4">取込履歴はありません。</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button
        :disabled="result.page <= 1"
        @click="$emit('page', result.page - 1)"
      >
        前へ</button
      ><span>{{ result.total }}件・{{ result.page }}ページ</span
      ><button
        :disabled="result.page * result.per_page >= result.total"
        @click="$emit('page', result.page + 1)"
      >
        次へ
      </button>
    </div>
  </section>
</template>
