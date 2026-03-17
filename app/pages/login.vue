<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';


const { login, loading, error } = useAuth()
const form = ref({ email: '', password: '' })

</script>

<template>
    <form @submit.prevent="login(form)">
        <input v-model="form.email" type="email" placeholder="Email" />
        <input v-model="form.password" type="password" placeholder="Password" />
        <button type="submit" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p v-if="error">{{ error }}</p>
    </form>
</template>