<script setup lang="ts">
import { computed } from "vue";
import { yen, type Overview } from "../../types";
const props = defineProps<{
  month: string;
  dailyTotals: Overview["dailyTotals"];
}>();
defineEmits<{ select: [date: string] }>();
const days = computed(() => {
  const [year, month] = props.month.split("-").map(Number) as [number, number];
  const totals = new Map(
    props.dailyTotals.map((row) => [row.date, row.amount]),
  );
  return [
    ...Array(new Date(year, month - 1, 1).getDay()).fill(null),
    ...Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => {
      const date = `${props.month}-${String(i + 1).padStart(2, "0")}`;
      return { day: i + 1, date, amount: totals.get(date) ?? 0 };
    }),
  ] as ({ day: number; date: string; amount: number } | null)[];
});
</script>
<template>
  <section class="card panel calendar-panel">
    <div class="panel-head">
      <div>
        <h3>利用カレンダー</h3>
        <p>日付を押すと利用明細を表示します</p>
      </div>
    </div>
    <div class="calendar-grid calendar-weekdays">
      <span
        v-for="day in ['日', '月', '火', '水', '木', '金', '土']"
        :key="day"
        >{{ day }}</span
      >
    </div>
    <div class="calendar-grid calendar-days">
      <template v-for="(day, index) in days" :key="day?.date ?? index"
        ><button
          v-if="day"
          class="calendar-day"
          :aria-label="`${day.date} ${yen(day.amount)}の明細`"
          @click="$emit('select', day.date)"
        >
          <b>{{ day.day }}</b
          ><small v-if="day.amount">{{ yen(day.amount) }}</small></button
        ><span v-else class="calendar-day empty"></span
      ></template>
    </div>
  </section>
</template>
