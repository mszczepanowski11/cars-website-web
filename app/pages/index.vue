<script setup lang="ts">

    const config = useRuntimeConfig()
    const token = useCookie('auth_token')
    const { logout } = useAuth()

    const {data:user, error, pending} = await useFetch(
        `${config.public.apiBase}api/User/me`,
        {
            headers:{
                Authorization:`Bearer ${token.value}`
            }
        }
    )

</script>

<template>
   <div>
    <div v-if="pending">Ładowanie...</div>
    <div v-else-if="error">
        <h1>Zaloguj się lub zarejestruj</h1>
         <li><NuxtLink to="/login">Logowanie</NuxtLink></li>
         <li><NuxtLink to="/register">Rejestracja</NuxtLink></li>
    </div>
     <div v-else-if="user">
        
            <h1>Witaj, {{ user.name }}!</h1>
            
            <NuxtLink to="/adverts">
                <button>Przeglądaj</button>
            </NuxtLink>
 
            <NuxtLink to="/my-adverts">
                <button>Moje ogłoszenia</button>
            </NuxtLink>
 
            <button @click="logout">Wyloguj</button>
        </div>
   </div>
</template>