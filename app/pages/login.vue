<template>
  <div class="auth-bg">
    <div class="auth-card">
      <div class="auth-logo">CARI<span>ZO</span></div>
      <h2>Zaloguj się</h2>
      <p class="auth-sub">Witaj ponownie w CARIZO</p>

      <v-form @submit.prevent="submit" :disabled="loading">
        <v-text-field v-model="email" label="Adres email" type="email" required class="mb-3" />
        <v-text-field v-model="password" label="Hasło" type="password" required class="mb-4" />
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <v-btn type="submit" color="primary" size="large" block :loading="loading">
          Zaloguj się
        </v-btn>
      </v-form>

      <p class="auth-link">Nie masz konta? <NuxtLink to="/register">Zarejestruj się</NuxtLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login, loading, error } = useAuth()
const email    = ref('')
const password = ref('')

async function submit() {
  await login({ email: email.value, password: password.value })
}
</script>

<style lang="scss" scoped>
.auth-bg {
  background: $bg;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  @include card($r-xl);
  padding: 50px 40px;
  width: 100%;
  max-width: 460px;
}

.auth-logo {
  font-size: 36px;
  font-weight: 900;
  letter-spacing: 6px;
  color: $text;
  margin-bottom: 28px;

  span { color: $red; }
}

h2 { font-size: 28px; font-weight: 800; color: $text; margin-bottom: 8px; }
.auth-sub { color: $text-dim; margin-bottom: 32px; }

.auth-link {
  color: $text-dim;
  text-align: center;
  margin-top: 24px;
  font-size: 14px;

  a { color: $red; }
}
</style>