<script setup lang="ts">
defineEmits<{ upload: []; logout: [] }>();
</script>
<template>
  <header>
    <span class="mobile-brand">¥ クレカ管理</span
    ><button class="mobile-logout" @click="$emit('logout')">ログアウト</button
    ><button class="primary top" @click="$emit('upload')">
      ＋ CSVを取り込む
    </button>
  </header>
</template>
