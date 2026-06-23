<template>
    <div class="page-bg">
        <div class="container" style="padding-top: 120px; padding-bottom: 80px;">
            <div class="page-header">
                <h1 class="page-title">Moje ogłoszenia</h1>
                <NuxtLink to="/add-advert" class="btn-add-top">
                    <v-icon icon="mdi-plus" size="17" />
                    Dodaj ogłoszenie
                </NuxtLink>
            </div>

            <div v-if="loading" class="loading-center">
                <v-icon icon="mdi-loading" size="40" class="spin" />
            </div>
            <div v-else-if="!adverts.length" class="empty-block">
                <div class="empty-block-icon">
                    <v-icon icon="mdi-car-outline" size="44" />
                </div>
                <h3 class="empty-block-title">Nie masz jeszcze żadnych ogłoszeń</h3>
                <p class="empty-block-desc">Dodaj swoje pierwsze ogłoszenie i dotrzyj do tysięcy kupujących na CARIZO.</p>
                <NuxtLink to="/add-advert" class="empty-block-btn">
                    <v-icon icon="mdi-plus" size="18" />
                    Dodaj pierwsze ogłoszenie
                </NuxtLink>
            </div>
            <template v-else>
                <div class="my-adverts-list">
                    <div v-for="a in adverts" :key="a.id" class="my-advert-row">
                        <NuxtLink :to="`/advert/${a.id}`" class="row-img-wrap">
                            <img :src="mainImage(a)" :alt="a.title" class="row-img" />
                            <span v-if="a.soldAt" class="overlay-badge sold-badge">SPRZEDANE</span>
                            <span v-else-if="a.badge" class="overlay-badge promo-badge">{{ a.badge }}</span>
                        </NuxtLink>

                        <div class="row-body">
                            <NuxtLink :to="`/advert/${a.id}`" class="row-title">{{ a.title }}</NuxtLink>
                            <div class="row-meta">
                                <span class="row-price">{{ formatPrice(a.price) }} zł</span>
                                <span class="row-sep">·</span>
                                <span class="row-dim">{{ a.year }} · {{ formatMileage(a.mileage) }} km</span>
                                <span class="row-sep">·</span>
                                <span class="row-dim">{{ a.city }}</span>
                            </div>
                            <div class="row-stats">
                                <span v-if="a.viewCount" class="stat-chip">
                                    <v-icon icon="mdi-eye-outline" size="13" />{{ a.viewCount }}
                                </span>
                                <span v-if="a.favoriteCount" class="stat-chip">
                                    <v-icon icon="mdi-heart-outline" size="13" />{{ a.favoriteCount }}
                                </span>
                                <span v-if="a.isActive" class="status-chip status-active">Aktywne</span>
                                <span v-else-if="a.isHidden" class="status-chip status-hidden">Ukryte</span>
                                <span v-else class="status-chip status-inactive">Nieaktywne</span>
                            </div>
                        </div>

                        <div class="row-right">
                            <div v-if="a.expiresAt && !a.soldAt" class="expiry-info" :class="expiryClass(a.expiresAt)">
                                <v-icon icon="mdi-clock-outline" size="14" />
                                {{ expiryText(a.expiresAt) }}
                            </div>

                            <div class="row-actions">
                                <NuxtLink :to="`/advert/${a.id}`" class="act-btn">
                                    <v-icon icon="mdi-eye-outline" size="15" />
                                </NuxtLink>
                                <NuxtLink :to="`/add-advert?edit=${a.id}`" class="act-btn">
                                    <v-icon icon="mdi-pencil-outline" size="15" />
                                </NuxtLink>
                                <NuxtLink
                                    v-if="!a.soldAt && a.isActive"
                                    :to="`/promote-advert/${a.id}`"
                                    class="act-btn act-promote"
                                    title="Wyróżnij ogłoszenie"
                                >
                                    <v-icon icon="mdi-star-outline" size="15" />
                                </NuxtLink>
                                <button
                                    v-if="!a.soldAt && !a.isActive"
                                    class="act-btn act-reactivate"
                                    :disabled="reactivateLoading === a.id"
                                    title="Reaktywuj ogłoszenie"
                                    @click="reactivateAdvert(a)"
                                >
                                    <v-icon v-if="reactivateLoading === a.id" icon="mdi-loading" size="15" class="spin" />
                                    <v-icon v-else icon="mdi-refresh" size="15" />
                                </button>
                                <button
                                    v-if="!a.soldAt && (a.isActive || a.isHidden)"
                                    class="act-btn act-sold"
                                    :disabled="soldLoading === a.id"
                                    title="Oznacz jako sprzedane"
                                    @click="markAsSold(a)"
                                >
                                    <v-icon v-if="soldLoading === a.id" icon="mdi-loading" size="15" class="spin" />
                                    <v-icon v-else icon="mdi-handshake-outline" size="15" />
                                </button>
                                <button
                                    class="act-btn act-delete"
                                    :disabled="deleteLoading === a.id"
                                    title="Usuń ogłoszenie"
                                    @click="openDeleteModal(a)"
                                >
                                    <v-icon v-if="deleteLoading === a.id" icon="mdi-loading" size="15" class="spin" />
                                    <v-icon v-else icon="mdi-trash-can-outline" size="15" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="totalPages > 1" class="pagination">
                    <button class="page-btn" :disabled="page === 1" @click="load(page - 1)">
                        <v-icon icon="mdi-chevron-left" size="18" />
                    </button>
                    <span class="page-info">{{ page }} / {{ totalPages }}</span>
                    <button class="page-btn" :disabled="page >= totalPages" @click="load(page + 1)">
                        <v-icon icon="mdi-chevron-right" size="18" />
                    </button>
                </div>
            </template>
        </div>

        <!-- Confirm sold modal -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="confirmAdvert" class="modal-backdrop" @click.self="confirmAdvert = null">
                    <div class="confirm-modal">
                        <v-icon icon="mdi-handshake-outline" size="36" class="sold-icon" />
                        <h3>Oznacz jako sprzedane</h3>
                        <p>Ogłoszenie „{{ confirmAdvert.title }}" zostanie oznaczone jako sprzedane i ukryte z wyników.</p>
                        <div class="confirm-actions">
                            <button class="btn-cancel" @click="confirmAdvert = null">Anuluj</button>
                            <button class="btn-sold-confirm" :disabled="soldLoading !== null" @click="doMarkSold">
                                <v-icon v-if="soldLoading !== null" icon="mdi-loading" size="14" class="spin" />
                                Oznacz
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- Delete modal -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="deleteAdvert" class="modal-backdrop" @click.self="deleteAdvert = null">
                    <div class="confirm-modal">
                        <v-icon icon="mdi-trash-can-outline" size="36" class="delete-icon" />
                        <h3>Usuń ogłoszenie</h3>
                        <p>Ogłoszenie „{{ deleteAdvert.title }}" zostanie trwale usunięte.</p>
                        <div v-if="!deleteAdvert.soldAt" class="sold-option">
                            <div class="sold-option-label">
                                <v-icon icon="mdi-chart-bar" size="15" class="sold-opt-icon" />
                                Oznaczyć jako sprzedane przed usunięciem?
                            </div>
                            <p class="sold-option-desc">Sprzedane auto zostanie wliczone do Twoich statystyk sprzedaży.</p>
                            <div class="toggle-row">
                                <button
                                    class="toggle-btn"
                                    :class="{ active: markSoldOnDelete }"
                                    @click="markSoldOnDelete = true"
                                >
                                    <v-icon icon="mdi-check-circle" size="15" />
                                    Tak, sprzedałem
                                </button>
                                <button
                                    class="toggle-btn"
                                    :class="{ active: !markSoldOnDelete }"
                                    @click="markSoldOnDelete = false"
                                >
                                    <v-icon icon="mdi-close-circle-outline" size="15" />
                                    Nie, po prostu usuń
                                </button>
                            </div>
                        </div>
                        <div class="confirm-actions">
                            <button class="btn-cancel" @click="deleteAdvert = null">Anuluj</button>
                            <button class="btn-delete-confirm" :disabled="deleteLoading !== null" @click="doDelete">
                                <v-icon v-if="deleteLoading !== null" icon="mdi-loading" size="14" class="spin" />
                                {{ markSoldOnDelete && !deleteAdvert.soldAt ? 'Sprzedaj i usuń' : 'Usuń' }}
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import type { CarAdvert, PagedResult } from '~/types'
import { useImageUrl } from '~/composables/useImageUrl'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Moje ogłoszenia — CARIZO', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { getImageUrl } = useImageUrl()

const adverts = ref<CarAdvert[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(true)
const pageSize = 12
const totalPages = computed(() => Math.ceil(total.value / pageSize))
const soldLoading = ref<number | null>(null)
const confirmAdvert = ref<CarAdvert | null>(null)
const deleteAdvert = ref<CarAdvert | null>(null)
const deleteLoading = ref<number | null>(null)
const markSoldOnDelete = ref(true)
const reactivateLoading = ref<number | null>(null)

function mainImage(a: CarAdvert): string {
    const img = a.images?.find(i => i.isMain) ?? a.images?.[0]
    return getImageUrl(img?.url)
}

function formatPrice(n: number): string {
    return Number(n).toLocaleString('pl')
}

function formatMileage(n: number): string {
    return Number(n).toLocaleString('pl')
}

function expiryText(dateStr: string): string {
    const diff = new Date(dateStr).getTime() - Date.now()
    if (diff < 0) return 'Wygasło'
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Wygasa dziś'
    if (days === 1) return 'Wygasa jutro'
    return `Wygasa za ${days} dni`
}

function expiryClass(dateStr: string): string {
    const diff = new Date(dateStr).getTime() - Date.now()
    if (diff < 0) return 'expiry-expired'
    const days = Math.floor(diff / 86400000)
    if (days <= 3) return 'expiry-urgent'
    if (days <= 7) return 'expiry-warn'
    return 'expiry-ok'
}

async function load(p: number = page.value) {
    page.value = p
    loading.value = true
    try {
        const r = await $fetch<PagedResult<CarAdvert>>(
            `/api/proxy/api/Advert/user?page=${p}&pageSize=${pageSize}`
        )
        adverts.value = r.items
        total.value = r.totalCount
    } finally {
        loading.value = false
    }
}

function markAsSold(a: CarAdvert) {
    confirmAdvert.value = a
}

async function doMarkSold() {
    if (!confirmAdvert.value) return
    soldLoading.value = confirmAdvert.value.id
    try {
        await $fetch(`/api/proxy/api/Advert/${confirmAdvert.value.id}/sold`, { method: 'POST', body: {} })
        const a = adverts.value.find(x => x.id === confirmAdvert.value?.id)
        if (a) a.soldAt = new Date().toISOString()
        confirmAdvert.value = null
    } catch (err: any) {
        console.error(err)
        alert(err?.data?.message || err?.message || 'Wystąpił błąd. Spróbuj ponownie.')
    }
    finally { soldLoading.value = null }
}

async function reactivateAdvert(a: CarAdvert) {
    reactivateLoading.value = a.id
    try {
        await $fetch(`/api/proxy/api/Advert/${a.id}/publish`, { method: 'POST', body: {} })
        const found = adverts.value.find(x => x.id === a.id)
        if (found) {
            found.isActive = true
            found.isHidden = false
            const thirtyDays = new Date()
            thirtyDays.setDate(thirtyDays.getDate() + 30)
            found.expiresAt = thirtyDays.toISOString()
        }
    } catch (err: any) {
        console.error(err)
        alert(err?.data?.message || err?.message || 'Wystąpił błąd. Spróbuj ponownie.')
    }
    finally { reactivateLoading.value = null }
}

function openDeleteModal(a: CarAdvert) {
    deleteAdvert.value = a
    markSoldOnDelete.value = !a.soldAt
}

async function doDelete() {
    if (!deleteAdvert.value) return
    const a = deleteAdvert.value
    deleteLoading.value = a.id
    try {
        if (markSoldOnDelete.value && !a.soldAt) {
            await $fetch(`/api/proxy/api/Advert/${a.id}/sold`, { method: 'POST', body: {} }).catch(() => {})
        }
        await $fetch(`/api/proxy/api/Advert/${a.id}`, { method: 'DELETE' })
        adverts.value = adverts.value.filter(x => x.id !== a.id)
        total.value = Math.max(0, total.value - 1)
        deleteAdvert.value = null
    } catch (err: any) {
        console.error(err)
        alert(err?.data?.message || err?.message || 'Wystąpił błąd. Spróbuj ponownie.')
    }
    finally { deleteLoading.value = null }
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

.btn-add-top {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: $red;
    color: white;
    border: none;
    border-radius: $r-md;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 11px 20px;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.loading-center {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80px 0;
    color: $text-dim;
}

.empty-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    padding: 80px 24px;
}

.empty-block-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba($red, 0.08);
    border: 1px solid rgba($red, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba($red, 0.7);
    margin-bottom: 4px;
}

.empty-block-title {
    font-size: 22px;
    font-weight: 800;
    color: $text;
}

.empty-block-desc {
    font-size: 14px;
    color: $text-dim;
    max-width: 360px;
    line-height: 1.7;
}

.empty-block-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: $red;
    color: white;
    border: none;
    border-radius: $r-md;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 12px 24px;
    text-decoration: none;
    margin-top: 8px;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.my-adverts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.my-advert-row {
    display: flex;
    align-items: center;
    gap: 16px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 14px;
    transition: border-color 0.2s;

    &:hover { border-color: rgba($red, 0.2); }

    @include respond-to(sm) {
        flex-wrap: wrap;
    }
}

.row-img-wrap {
    position: relative;
    flex-shrink: 0;
    width: 130px;
    height: 88px;
    border-radius: $r-md;
    overflow: hidden;
    display: block;
}

.row-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.overlay-badge {
    position: absolute;
    top: 6px;
    left: 6px;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 4px;
    letter-spacing: 0.5px;
}

.sold-badge { background: rgba(76,175,80,0.85); color: white; }
.promo-badge { background: rgba($red, 0.85); color: white; }

.row-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.row-title {
    font-size: 15px;
    font-weight: 700;
    color: $text;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;

    &:hover { color: $red; }
}

.row-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.row-price {
    font-size: 15px;
    font-weight: 800;
    color: $red;
}

.row-sep { color: $text-dark; font-size: 12px; }
.row-dim { font-size: 12px; color: $text-dim; }

.row-stats {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.stat-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: $text-dim;
}

.status-chip {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
}

.status-active { background: rgba(76,175,80,0.1); color: #4caf50; border: 1px solid rgba(76,175,80,0.2); }
.status-hidden { background: rgba(255,152,0,0.1); color: #ff9800; border: 1px solid rgba(255,152,0,0.2); }
.status-inactive { background: rgba(255,255,255,0.05); color: $text-dim; border: 1px solid $border; }

.row-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    flex-shrink: 0;
}

.expiry-info {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 20px;
    white-space: nowrap;
}

.expiry-ok { background: rgba(255,255,255,0.05); color: $text-dim; }
.expiry-warn { background: rgba(255,152,0,0.1); color: #ff9800; }
.expiry-urgent { background: rgba(220,50,50,0.1); color: #e55; }
.expiry-expired { background: rgba(255,255,255,0.04); color: $text-dark; }

.row-actions {
    display: flex;
    gap: 6px;
}

.act-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    cursor: pointer;
    text-decoration: none;
    transition: border-color 0.15s, color 0.15s;

    &:hover:not(:disabled) { border-color: $red; color: $text; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.act-promote {
    &:hover { border-color: rgba($red, 0.5); color: $red; }
}

.act-reactivate {
    &:hover:not(:disabled) { border-color: #42a5f5; color: #42a5f5; }
}

.act-sold {
    &:hover:not(:disabled) { border-color: #4caf50; color: #4caf50; }
}

.act-delete {
    &:hover:not(:disabled) { border-color: #e55; color: #e55; }
}

// Modal
.modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px); z-index: 2000;
    display: flex; align-items: center; justify-content: center; padding: 16px;
}

.confirm-modal {
    background: #0e0e0e; border: 1px solid $border; border-radius: $r-lg;
    padding: 32px 28px; width: 100%; max-width: 360px;
    text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
}

.sold-icon { color: #4caf50; opacity: 0.7; }
.delete-icon { color: #e55; opacity: 0.8; }
.confirm-modal h3 { font-size: 18px; font-weight: 800; color: $text; margin: 0; }
.confirm-modal p { font-size: 13px; color: $text-dim; margin: 0; }

.sold-option {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 14px;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.sold-option-label {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 700;
    color: $text;
}

.sold-opt-icon { color: $red; }

.sold-option-desc {
    font-size: 12px;
    color: $text-dim;
    margin: 0;
}

.toggle-row {
    display: flex;
    gap: 8px;
}

.toggle-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: $r-sm;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    border: 1px solid $border;
    background: transparent;
    color: $text-dim;
    transition: all 0.15s;

    &:hover { border-color: rgba($red, 0.3); color: $text; }

    &.active {
        background: rgba($red, 0.1);
        border-color: rgba($red, 0.4);
        color: $red;
    }
}

.btn-delete-confirm {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    background: rgba(220,50,50,0.12); border: 1px solid rgba(220,50,50,0.3);
    border-radius: $r-sm; color: #e55; font-size: 13px; font-weight: 700;
    font-family: 'Inter', sans-serif; padding: 10px; cursor: pointer;
    &:hover:not(:disabled) { background: rgba(220,50,50,0.22); }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
}

.confirm-actions {
    display: flex; gap: 10px; width: 100%; margin-top: 4px;
}

.btn-cancel {
    flex: 1; background: transparent; border: 1px solid $border; border-radius: $r-sm;
    color: $text-muted; font-size: 13px; font-weight: 500; font-family: 'Inter', sans-serif;
    padding: 10px; cursor: pointer;
    &:hover { border-color: $text-dim; color: $text; }
}

.btn-sold-confirm {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    background: rgba(76,175,80,0.15); border: 1px solid rgba(76,175,80,0.35);
    border-radius: $r-sm; color: #4caf50; font-size: 13px; font-weight: 700;
    font-family: 'Inter', sans-serif; padding: 10px; cursor: pointer;
    &:hover:not(:disabled) { background: rgba(76,175,80,0.25); }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 32px;
}

.page-btn {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: #0d0d0d;
    border: 1px solid $border;
    color: $text-muted;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    &:hover:not(:disabled) { border-color: $text-dim; color: $text; }
    &:disabled { opacity: 0.3; cursor: not-allowed; }
}

.page-info { font-size: 14px; font-weight: 600; color: $text-muted; min-width: 60px; text-align: center; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
