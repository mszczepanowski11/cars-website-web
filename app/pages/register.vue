<script setup>

const { register, loading, error } = useAuth()
const form = ref({
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    password: ''
})

</script>
<template>
    <div>
        <h1>Rejestracja</h1>
         <form @submit.prevent="register({...form})">
            <input v-model="form.name" placeholder="Name" />
            <input v-model="form.surname" placeholder="Surname" />
            <input v-model="form.email" type="email" placeholder="Email" />
            <input v-model="form.phoneNumber" placeholder="Phone Number" />
            <input v-model="form.password" type="password" placeholder="Password" />
            <button type="submit" :disabled="loading">Register</button>
            <p v-if="error">{{ error }}</p>
        </form>
    </div>
</template>