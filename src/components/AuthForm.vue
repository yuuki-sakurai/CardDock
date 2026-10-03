<script setup lang="ts">
import { reactive, ref } from "vue";
import { api } from "../api";
import type { User } from "../types";
const emit = defineEmits<{ authenticated: [user: User] }>();
const register = ref(false);
const busy = ref(false);
const error = ref("");
const form = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});
async function submit() {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    await api.session();
    const result = await (register.value
      ? api.register(form)
      : api.login({ email: form.email, password: form.password }));
    if (result.user) emit("authenticated", result.user);
    form.password = "";
    form.password_confirmation = "";
  } catch (e) {
    error.value = e instanceof Error ? e.message : "ログインに失敗しました。";
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <main class="auth-page">
    <section class="card auth-card">
      <span class="eyebrow">CREDIT CARD MANAGER</span>
      <h1>{{ register ? "アカウント作成" : "ログイン" }}</h1>
      <p>家計簿と同じアカウントで利用できます。</p>
      <form @submit.prevent="submit">
        <fieldset :disabled="busy">
          <label v-if="register" class="field"
            >お名前<input
              v-model.trim="form.name"
              autocomplete="name"
              maxlength="100"
              required /></label
          ><label class="field"
            >メールアドレス<input
              v-model.trim="form.email"
              type="email"
              autocomplete="username"
              maxlength="255"
              required /></label
          ><label class="field"
            >パスワード<input
              v-model="form.password"
              type="password"
              :autocomplete="register ? 'new-password' : 'current-password'"
              :minlength="register ? 12 : undefined"
              maxlength="72"
              required /></label
          ><template v-if="register"
            ><p>パスワードは12文字以上・72バイト以内です。</p>
            <label class="field"
              >パスワード（確認）<input
                v-model="form.password_confirmation"
                type="password"
                autocomplete="new-password"
                minlength="12"
                maxlength="72"
                required /></label
          ></template>
        </fieldset>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <button class="primary" :disabled="busy">
          {{ busy ? "確認中…" : register ? "登録する" : "ログイン" }}
        </button>
      </form>
      <button
        class="auth-switch"
        :disabled="busy"
        @click="
          register = !register;
          error = '';
        "
      >
        {{ register ? "登録済みの方はログイン" : "アカウントを新規作成" }}
      </button>
    </section>
  </main>
</template>
