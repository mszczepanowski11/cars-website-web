<template>
    <div class="page-bg">
        <div class="container" style="padding-top: 120px; padding-bottom: 80px;">
            <div class="page-header">
                <h1 class="page-title">Moje ogłoszenia</h1>
                <v-btn color="primary" to="/add-advert">+ Dodaj ogłoszenie</v-btn>
            </div>

            <div v-if="loading" class="d-flex justify-center mt-16">
                <v-progress-circular indeterminate color="primary" size="60" />
            </div>
            <div v-else-if="!adverts.length" class="no-data">
                Nie masz jeszcze żadnych ogłoszeń.
            </div>
            <template v-else>
                <div class="cars-grid">
                    <AdvertCard v-for="a in adverts" :key="a.id" :advert="a" />
                </div>
                <div class="d-flex justify-center mt-8">
                    <v-pagination v-if="totalPages > 1" v-model="page" :length="totalPages" active-color="primary"
                        rounded="circle" @update:model-value="load" />
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CarAdvert, PagedResult } from '~/types'

definePageMeta({ middleware: 'auth' })

const config = useRuntimeConfig()
const base = config.public.apiBase
const token = useCookie('auth_token')
const adverts = ref<CarAdvert[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(true)
const pageSize = 12
const totalPages = computed(() => Math.ceil(total.value / pageSize))

async function load(p: number = page.value) {
    loading.value = true
    try {
        const r = await $fetch<PagedResult<CarAdvert>>(
            `${base}api/Advert/user?page=${p}&pageSize=${pageSize}`,
            { headers: { Authorization: `Bearer ${token.value}` } }
        )
        adverts.value = r.items
        total.value = r.totalCount
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await load(1)
})
</script>

<style lang="scss" scoped>
.page-bg {
    background: $bg;
    min-height: 100vh;
}

.container {
    @include container;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 35px;
}

.page-title {
    font-size: 40px;
    font-weight: 900;
    color: $text;
}

.no-data {
    text-align: center;
    color: $text-faint;
    font-size: 18px;
    margin-top: 80px;
}

.cars-grid {
    @include cars-grid;
}
</style>