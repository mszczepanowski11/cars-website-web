<script setup lang="ts">

import type { Advert } from '~/components/AdvertCard.vue'

const config = useRuntimeConfig()
const token = useCookie('auth_token')

const { data: adverts, pending, error } = await useFetch<Advert[]>(
    `${config.public.apiBase}api/Advert/user`,
    {
        headers: { Authorization: `Bearer ${token.value}` }
    }
)

</script>


<template>
    <div>
        <NuxtLink to="/">← Wróć</NuxtLink>
        <h1>Moje ogłoszenia</h1>

        <div v-if="pending">Ładowanie ogłoszeń...</div>
        <div v-else-if="error">Coś poszło nie tak...</div>
        <div v-else-if="!adverts?.length">Nie masz jeszcze żadnych ogłoszeń.</div>

        <div v-else>
            <AdvertCard v-for="advert in adverts" :key="advert.id" :advert="advert" />
        </div>

        <NuxtLink to="/add-advert">
            <button>Dodaj ogłoszenie</button>
        </NuxtLink>
    </div>

</template>