<template>
    <div class="page-bg">
        <div class="container" style="padding-top: 120px; padding-bottom: 80px;">
            <h1 class="page-title">Ulubione ogłoszenia</h1>
            <div v-if="loading" class="d-flex justify-center mt-16">
                <v-progress-circular indeterminate color="primary" size="60" />
            </div>
            <template v-else>
                <p class="result-count">Zapisane: <strong style="color:#8B0D1D">{{ total }}</strong> ogłoszeń</p>
                <div class="cars-grid">
                    <AdvertCard v-for="a in adverts" :key="a.id" :advert="a" />
                </div>
                <div v-if="!adverts.length" class="no-results">Brak ulubionych ogłoszeń.</div>
                <div class="d-flex justify-center mt-8">
                    <v-pagination v-if="totalPages > 1" v-model="page" :length="totalPages"
                        active-color="primary" rounded="circle" @update:model-value="load" />
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
const loading = ref(false)
const pageSize = 12
const totalPages = computed(() => Math.ceil(total.value / pageSize))

async function load(p: number = page.value) {
    page.value = p
    loading.value = true
    try {
        const r = await $fetch<PagedResult<CarAdvert>>(`${base}api/Favorite?page=${p}&pageSize=${pageSize}`, {
            headers: { Authorization: `Bearer ${token.value}` }
        })
        adverts.value = r.items
        total.value = r.totalCount
    } finally { loading.value = false }
}

onMounted(() => load(1))
</script>

<style lang="scss" scoped>
.page-bg { background: $bg; min-height: 100vh; }
.container { @include container; }
.page-title { font-size: 40px; font-weight: 900; color: $text; margin-bottom: 24px; }
.result-count { color: $text-dim; margin-bottom: 24px; }
.cars-grid { @include cars-grid; }
.no-results { text-align: center; color: $text-faint; font-size: 18px; margin-top: 60px; }
</style>