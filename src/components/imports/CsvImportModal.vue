<script setup lang="ts">
import { ref } from "vue";
import ModalShell from "../ModalShell.vue";
import { api } from "../../api";
import type { CreditCard } from "../../types";
const props = defineProps<{ cards: CreditCard[] }>();
const emit = defineEmits<{ close: []; imported: [message: string] }>();
const cardId = ref(props.cards[0]?.id ?? 0);
const file = ref<File>();
const busy = ref(false);
const error = ref("");
async function submit() {
  if (!file.value || !cardId.value || busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    const result = await api.import(file.value, cardId.value);
    emit(
      "imported",
      result.alreadyImported
        ? "同じファイルは取込済みです。重複登録はしませんでした。"
        : `${result.import.imported_count}件の明細を取り込みました。`,
    );
  } catch (e) {
    error.value = e instanceof Error ? e.message : "取込に失敗しました。";
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <ModalShell title="CSV明細の取込" :busy="busy" @close="$emit('close')"
    ><form @submit.prevent="submit">
      <p>
        共通テンプレート形式（UTF-8 /
        Shift_JIS・2MB・5,000件まで）に対応しています。
      </p>
      <a href="/templates/credit-card.csv" download
        >CSVテンプレートをダウンロード</a
      >
      <p>
        カード会社から取得したCSVは、テンプレートの列に合わせて編集してください。
      </p>
      <label class="field"
        >カード<select v-model.number="cardId" required>
          <option v-for="card in cards" :key="card.id" :value="card.id">
            {{ card.name }}
          </option>
        </select></label
      ><label class="field"
        >CSVファイル<input
          type="file"
          accept=".csv,text/csv"
          required
          @change="file = ($event.target as HTMLInputElement).files?.[0]"
      /></label>
      <p>
        カテゴリは家計簿に登録済みの名前、または空欄にしてください。金額は整数円（返金はマイナス）、支払予定月はYYYY-MMです。
      </p>
      <p>
        同じファイル・カードの再送は登録しません。内容を変更したファイルや期間が重なる別のCSVは、重複明細を削除してから取り込んでください。
      </p>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="modal-actions">
        <button
          type="button"
          class="outline"
          :disabled="busy"
          @click="$emit('close')"
        >
          キャンセル</button
        ><button class="primary" :disabled="busy || !file || !cardId">
          {{ busy ? "取込中…" : "取り込む" }}
        </button>
      </div>
    </form></ModalShell
  >
</template>
