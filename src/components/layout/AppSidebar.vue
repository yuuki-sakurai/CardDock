<script setup lang="ts">
import { navigationItems } from "../../types";
import type { Page, User } from "../../types";
defineProps<{ activePage: Page; user: User }>();
defineEmits<{ navigate: [page: Page]; logout: [] }>();
</script>
<template>
  <aside>
    <button class="brand" @click="$emit('navigate', 'home')">
      <b>¥</b><strong>クレカ管理</strong>
    </button>
    <nav>
      <button
        v-for="item in navigationItems"
        :key="item.key"
        :class="{ active: activePage === item.key }"
        :aria-current="activePage === item.key ? 'page' : undefined"
        @click="$emit('navigate', item.key)"
      >
        <i>{{ item.icon }}</i
        >{{ item.label }}
      </button>
    </nav>
    <div class="profile">
      <span>{{ user.name.slice(0, 1) }}</span>
      <p>
        <strong>{{ user.name }}</strong
        ><small>家計簿と共通のアカウント</small
        ><button @click="$emit('logout')">ログアウト</button>
      </p>
    </div>
  </aside>
</template>
