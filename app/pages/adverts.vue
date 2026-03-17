<script setup lang="ts">

import type { Advert } from '~/components/AdvertCard.vue'

const config = useRuntimeConfig()
const token = useCookie('auth_token')
const filter = reactive({
    minPrice: null as number | null,
    maxPrice: null as number | null,
    brand: ''
})

const { data: adverts, pending } = await useFetch<Advert[]>(
    `${config.public.apiBase}api/Advert`,
    {
        headers: { Authorization: `Bearer ${token.value}` }
    }
)

const filteredAdverts = ref<Advert[]>(adverts.value ?? [])

function applyFilters() {
    filteredAdverts.value = (adverts.value ?? []).filter(a => {
        const aboveMin = filter.minPrice === null || a.price >= filter.minPrice
        const belowMax = filter.maxPrice === null || a.price <= filter.maxPrice
        const matchesBrand = filter.brand === '' ||
            a.vehicleDetails?.brand?.toLowerCase().includes(filter.brand.toLowerCase())

        return aboveMin && belowMax && matchesBrand
    })
}

function clearFilters() {
    filter.minPrice = null
    filter.maxPrice = null
    filter.brand = ''
}

</script>
<template>

    <div>
        <h1>Wszystkie ogłoszenia</h1>

        <input v-model.number="filter.minPrice" type="number" placeholder="Cena od" />
        <input v-model.number="filter.maxPrice" type="number" placeholder="Cena do" />
        <input v-model="filter.brand" type="text" placeholder="Marka (np. BMW)" />

        <button @click="applyFilters">Szukaj</button>
        <button @click="clearFilters">Wyczyść</button>

        <p>Znaleziono: {{ filteredAdverts.length }} ogłoszeń</p>

        <div v-if="pending">Ładowanie ogłoszeń...</div>
        <div v-else-if="!adverts?.length">Brak ogłoszeń.</div>

        <div v-else>
            <AdvertCard v-for="advert in filteredAdverts" :key="advert.id" :advert="advert" />
        </div>
    </div>

</template>