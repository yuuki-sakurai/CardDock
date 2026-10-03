<script setup lang="ts">
import { yen, type Overview } from "../../types";
defineProps<{ overview: Overview; month: string }>();
</script>
<template>
  <article class="card spending-hero">
    <div class="spending-hero__main">
      <div class="section-label"><span>¥</span>{{ month }} のカード利用</div>
      <h2>{{ yen(overview.total) }}</h2>
      <p>{{ overview.count }}件の取込済み明細の合計（返金を含む）</p>
      <small>家計簿の支出とは別に集計します。</small>
    </div>
    <div class="spending-hero__categories">
      <p>カテゴリ別の利用額</p>
      <div
        v-for="(category, index) in overview.categoryTotals.slice(0, 5)"
        :key="category.name ?? ''"
        class="category-rank"
      >
        <span>{{ index + 1 }}</span
        ><strong>{{ category.name || "未分類" }}</strong
        ><b>{{ yen(category.amount) }}</b>
      </div>
      <p v-if="!overview.count">明細を取り込むと集計を表示します。</p>
    </div>
  </article>
</template>
