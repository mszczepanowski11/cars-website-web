<template>
    <div class="fav-page">
        <div class="container">

            <div class="page-header">
                <div class="page-header-left">
                    <h1 class="page-title">Ulubione ogłoszenia</h1>
                    <p v-if="!loading" class="page-sub">
                        {{ total > 0 ? `${total} zapisanych ogłoszeń` : 'Brak zapisanych ogłoszeń' }}
                    </p>
                </div>
                <div v-if="total > 0" class="page-header-right">
                    <div class="sort-wrap">
                        <v-icon icon="mdi-sort" size="15" class="sort-icon" />
                        <select v-model="sortBy" class="sort-select" @change="load(1)">
                            <option value="">Najnowsze</option>
                            <option value="price_asc">Cena: rosnąco</option>
                            <option value="price_desc">Cena: malejąco</option>
                            <option value="year_desc">Rok: najnowszy</option>
                            <option value="mileage_asc">Przebieg: najmniejszy</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Skeleton loading -->
            <div v-if="loading" class="cars-grid">
                <AdvertCardSkeleton v-for="n in 8" :key="n" />
            </div>

            <template v-else>
                <div v-if="adverts.length" class="cars-grid">
                    <AdvertCard v-for="a in adverts" :key="a.id" :advert="a" />
                </div>

                <div v-else class="empty-state">
                    <div class="empty-icon-wrap">
                        <v-icon icon="mdi-heart-outline" size="40" />
                    </div>
                    <h2 class="empty-title">Nie masz jeszcze ulubionych</h2>
                    <p class="empty-sub">Przeglądaj ogłoszenia i klikaj serce, aby zapisywać te, które Cię interesują.</p>
                    <NuxtLink to="/adverts" class="btn-browse">
                        <v-icon icon="mdi-car-multiple" size="16" />
                        Przeglądaj ogłoszenia
                    </NuxtLink>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="pagination">
                    <button class="page-btn" :disabled="page === 1" @click="load(page - 1)">
                        <v-icon icon="mdi-chevron-left" size="18" />
                    </button>
                    <button
                        v-for="p in paginationPages"
                        :key="p"
                        class="page-btn"
                        :class="{ 'page-btn--active': p === page, 'page-btn--dot': p === '...' }"
                        :disabled="p === '...'"
                        @click="p !== '...' && load(Number(p))"
                    >{{ p }}</button>
                    <button class="page-btn" :disabled="page >= totalPages" @click="load(page + 1)">
                        <v-icon icon="mdi-chevron-right" size="18" />
                    </button>
                </div>
            </template>

        </div>
    </div>
</template>

<script setup lang="ts">
import type { CarAdvert, PagedResult } from '~/types'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow' })
useHead({ title: 'Ulubione — CARIZO' })

const adverts = ref<CarAdvert[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(true)
const sortBy = ref('')
const pageSize = 12
const totalPages = computed(() => Math.ceil(total.value / pageSize))

async function load(p: number = page.value) {
    page.value = p
    loading.value = true
    try {
        const r = await $fetch<PagedResult<CarAdvert>>('/api/proxy/api/Favorite', {
            query: { page: p, pageSize, sortBy: sortBy.value || undefined }
        })
        adverts.value = r.items
        total.value = r.totalCount
    } finally { loading.value = false }
}

const paginationPages = computed(() => {
    const pages: (number | '...')[] = []
    for (let i = 1; i <= totalPages.value; i++) {
        if (i === 1 || i === totalPages.value || (i >= page.value - 1 && i <= page.value + 1)) {
            pages.push(i)
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...')
        }
    }
    return pages
})

onMounted(() => load(1))
</script>

<style lang="scss" scoped>
.fav-page {
    background: $bg;
    min-height: 100vh;
    padding-top: calc(#{$nav-height} + 48px);
    padding-bottom: 80px;
}

.container { @include container; }

.page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 32px;
    gap: 16px;

    @include respond-to(sm) { flex-direction: column; align-items: flex-start; }
}

.page-title {
    font-size: 36px;
    font-weight: 900;
    color: $text;
}

.page-sub {
    color: $text-dim;
    font-size: 14px;
    margin-top: 4px;
}

.sort-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
}

.sort-icon { color: $text-dim; }

.sort-select {
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 8px 12px;
    color: $text-muted;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
    option { background: #111; color: $text; }
    &:focus { border-color: rgba($red, 0.4); }
}

.cars-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 80px 20px;
    text-align: center;
}

.empty-icon-wrap {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba($red, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
    margin-bottom: 4px;
}

.empty-title {
    font-size: 22px;
    font-weight: 700;
    color: $text;
}

.empty-sub {
    color: $text-dim;
    font-size: 14px;
    max-width: 360px;
}

.btn-browse {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: $red;
    color: white;
    padding: 11px 24px;
    border-radius: $r-sm;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    margin-top: 8px;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

// Pagination
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin-top: 48px;
}

.page-btn {
    min-width: 36px;
    height: 36px;
    border-radius: $r-sm;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    color: $text-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    transition: all 0.15s;
    padding: 0 10px;

    &:hover:not(:disabled) { border-color: rgba($red, 0.4); color: $text; }
    &:disabled { opacity: 0.35; cursor: default; }
    &--active { background: $red; border-color: $red; color: white; font-weight: 700; }
    &--dot { cursor: default; background: transparent; border-color: transparent; }
}
</style>
