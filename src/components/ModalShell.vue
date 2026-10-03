<script setup lang="ts">
import { onMounted, ref } from "vue";
withDefaults(defineProps<{ title: string; busy?: boolean }>(), { busy: false });
defineEmits<{ close: [] }>();
const dialog = ref<HTMLDialogElement>();
onMounted(() => dialog.value?.showModal());
</script>
<template>
  <dialog
    ref="dialog"
    class="edit-dialog"
    aria-labelledby="dialog-title"
    @cancel.prevent="!busy && $emit('close')"
  >
    <div class="modal-head">
      <h2 id="dialog-title">{{ title }}</h2>
      <button
        type="button"
        :disabled="busy"
        aria-label="閉じる"
        @click="$emit('close')"
      >
        ×
      </button>
    </div>
    <slot />
  </dialog>
</template>
