<template>
    <div class="page-bg">
        <div class="container" style="padding-top: 120px; padding-bottom: 80px;">
            <div class="page-header">
                <h1 class="page-title">{{ $t('myAdverts.title') }}</h1>
                <div class="header-actions">
                    <button class="btn-export" :disabled="exporting" @click="exportCsv">
                        <CzIcon v-if="exporting" icon="mdi-loading" size="16" class="spin" />
                        <CzIcon v-else icon="mdi-download-outline" size="16" />
                        {{ $t('myAdverts.exportCsv') }}
                    </button>
                    <NuxtLink to="/add-advert" class="btn-add-top">
                        <CzIcon icon="mdi-plus" size="17" />
                        {{ $t('myAdverts.addAdvert') }}
                    </NuxtLink>
                </div>
            </div>

            <div v-if="adverts.length" class="bulk-bar">
                <label class="bulk-select-all">
                    <input type="checkbox" :checked="allOnPageSelected" @change="toggleSelectAll" />
                    {{ $t('myAdverts.selectAllOnPage') }}
                </label>
                <template v-if="selectedIds.size > 0">
                    <span class="bulk-count">{{ $t('myAdverts.selectedCount', { count: selectedIds.size }) }}</span>
                    <div class="bulk-actions">
                        <button class="bulk-btn" :disabled="bulkLoading" @click="runBulkAction('activate')">{{ $t('myAdverts.bulkActivate') }}</button>
                        <button class="bulk-btn" :disabled="bulkLoading" @click="runBulkAction('deactivate')">{{ $t('myAdverts.bulkDeactivate') }}</button>
                        <button class="bulk-btn" :disabled="bulkLoading" @click="runBulkAction('renew')">{{ $t('myAdverts.bulkRenew') }}</button>
                        <button class="bulk-btn" :disabled="bulkLoading" @click="runBulkAction('markSold')">{{ $t('myAdverts.bulkMarkSold') }}</button>
                        <button class="bulk-btn bulk-btn-danger" :disabled="bulkLoading" @click="runBulkAction('delete')">{{ $t('myAdverts.bulkDelete') }}</button>
                        <button class="bulk-btn-clear" :disabled="bulkLoading" @click="clearSelection">{{ $t('myAdverts.clearSelection') }}</button>
                    </div>
                </template>
            </div>

            <div v-if="loading" class="loading-center">
                <CzIcon icon="mdi-loading" size="40" class="spin" />
            </div>
            <div v-else-if="!adverts.length" class="empty-block">
                <div class="empty-block-icon">
                    <CzIcon icon="mdi-car-outline" size="44" />
                </div>
                <h3 class="empty-block-title">{{ $t('myAdverts.emptyTitle') }}</h3>
                <p class="empty-block-desc">{{ $t('myAdverts.emptyDesc') }}</p>
                <NuxtLink to="/add-advert" class="empty-block-btn">
                    <CzIcon icon="mdi-plus" size="18" />
                    {{ $t('myAdverts.addFirst') }}
                </NuxtLink>
            </div>
            <template v-else>
                <div class="my-adverts-list">
                    <div v-for="a in adverts" :key="a.id" class="my-advert-row" :class="{ 'row-selected': selectedIds.has(a.id) }">
                        <input
                            type="checkbox"
                            class="row-checkbox"
                            :checked="selectedIds.has(a.id)"
                            :aria-label="`Zaznacz: ${a.title}`"
                            @change="toggleSelect(a.id)"
                        />
                        <NuxtLink :to="advertPath(a)" class="row-img-wrap">
                            <img :src="mainImage(a)" :alt="a.title" class="row-img" loading="lazy" decoding="async" />
                            <span v-if="a.soldAt" class="overlay-badge sold-badge">{{ $t('myAdverts.sold') }}</span>
                            <span v-else-if="a.badge" class="overlay-badge promo-badge">{{ a.badge }}</span>
                        </NuxtLink>

                        <div class="row-body">
                            <NuxtLink :to="advertPath(a)" class="row-title">{{ a.title }}</NuxtLink>
                            <div class="row-meta">
                                <span class="row-price">{{ formatPrice(a.price) }} zł</span>
                                <span class="row-sep">·</span>
                                <span class="row-dim">{{ a.year }} · {{ formatMileage(a.mileage) }} km</span>
                                <span class="row-sep">·</span>
                                <span class="row-dim">{{ a.city }}</span>
                            </div>
                            <div class="row-stats">
                                <span v-if="a.viewCount" class="stat-chip">
                                    <CzIcon icon="mdi-eye-outline" size="13" />{{ a.viewCount }}
                                </span>
                                <span v-if="a.favoriteCount" class="stat-chip">
                                    <CzIcon icon="mdi-heart-outline" size="13" />{{ a.favoriteCount }}
                                </span>
                                <span v-if="a.isActive" class="status-chip status-active">{{ $t('myAdverts.statusActive') }}</span>
                                <span v-else-if="a.isHidden" class="status-chip status-hidden">{{ $t('myAdverts.statusHidden') }}</span>
                                <span v-else class="status-chip status-inactive">{{ $t('myAdverts.statusInactive') }}</span>
                            </div>
                        </div>

                        <div class="row-right">
                            <!-- Sam licznik "za 18 dni" nie pozwala zaplanowac odswiezenia ani
                                 sprawdzic, czy emisja skonczy sie w weekend. Dokladna data jest
                                 podana obok, a nie w dymku, bo na telefonie dymki nie dzialaja. -->
                            <div v-if="a.expiresAt && !a.soldAt" class="expiry-info" :class="expiryClass(a.expiresAt)">
                                <CzIcon icon="mdi-clock-outline" size="14" />
                                <span class="expiry-rel">{{ expiryText(a.expiresAt) }}</span>
                                <span class="expiry-abs">{{ expiryDate(a.expiresAt) }}</span>
                            </div>

                            <div class="row-actions">
                                <NuxtLink :to="advertPath(a)" class="act-btn" :aria-label="`Podgląd: ${a.title}`">
                                    <CzIcon icon="mdi-eye-outline" size="15" /><span class="act-label">Podgląd</span>
                                </NuxtLink>
                                <NuxtLink :to="`/add-advert?edit=${a.id}`" class="act-btn" :aria-label="`Edytuj: ${a.title}`">
                                    <CzIcon icon="mdi-pencil-outline" size="15" /><span class="act-label">Edytuj</span>
                                </NuxtLink>
                                <NuxtLink
                                    v-if="!a.soldAt && a.isActive"
                                    :to="`/promote-advert/${a.id}`"
                                    class="act-btn act-promote"
                                    :aria-label="`Wyróżnij: ${a.title}`"
                                >
                                    <CzIcon icon="mdi-star-outline" size="15" /><span class="act-label">Wyróżnij</span>
                                </NuxtLink>
                                <button
                                    v-if="!a.soldAt && !a.isActive"
                                    class="act-btn act-reactivate"
                                    :disabled="reactivateLoading === a.id"
                                    :aria-label="`Reaktywuj: ${a.title}`"
                                    @click="reactivateAdvert(a)"
                                >
                                    <CzIcon v-if="reactivateLoading === a.id" icon="mdi-loading" size="15" class="spin" />
                                    <CzIcon v-else icon="mdi-refresh" size="15" /><span class="act-label">Wznów</span>
                                </button>
                                <button
                                    v-if="!a.soldAt && (a.isActive || a.isHidden)"
                                    class="act-btn act-sold"
                                    :disabled="soldLoading === a.id"
                                    :aria-label="`Oznacz jako sprzedane: ${a.title}`"
                                    @click="markAsSold(a)"
                                >
                                    <CzIcon v-if="soldLoading === a.id" icon="mdi-loading" size="15" class="spin" />
                                    <CzIcon v-else icon="mdi-handshake-outline" size="15" /><span class="act-label">Sprzedane</span>
                                </button>
                                <button
                                    class="act-btn act-delete"
                                    :disabled="deleteLoading === a.id"
                                    :aria-label="`Usuń: ${a.title}`"
                                    @click="openDeleteModal(a)"
                                >
                                    <CzIcon v-if="deleteLoading === a.id" icon="mdi-loading" size="15" class="spin" />
                                    <CzIcon v-else icon="mdi-trash-can-outline" size="15" /><span class="act-label">Usuń</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="totalPages > 1" class="pagination">
                    <button class="page-btn" :disabled="page === 1" aria-label="Poprzednia strona" @click="load(page - 1)">
                        <CzIcon icon="mdi-chevron-left" size="18" />
                    </button>
                    <span class="page-info">{{ page }} / {{ totalPages }}</span>
                    <button class="page-btn" :disabled="page >= totalPages" aria-label="Następna strona" @click="load(page + 1)">
                        <CzIcon icon="mdi-chevron-right" size="18" />
                    </button>
                </div>
            </template>
        </div>

        <!-- Confirm sold modal -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="confirmAdvert" class="modal-backdrop" @click.self="confirmAdvert = null">
                    <div class="confirm-modal">
                        <CzIcon icon="mdi-handshake-outline" size="36" class="sold-icon" />
                        <h3>Oznacz jako sprzedane</h3>
                        <p>Ogłoszenie „{{ confirmAdvert.title }}" zostanie oznaczone jako sprzedane i ukryte z wyników.</p>
                        <div class="confirm-actions">
                            <button class="btn-cancel" @click="confirmAdvert = null">Anuluj</button>
                            <button class="btn-sold-confirm" :disabled="soldLoading !== null" @click="doMarkSold">
                                <CzIcon v-if="soldLoading !== null" icon="mdi-loading" size="14" class="spin" />
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
                        <CzIcon icon="mdi-trash-can-outline" size="36" class="delete-icon" />
                        <h3>Usuń ogłoszenie</h3>
                        <p>Ogłoszenie „{{ deleteAdvert.title }}" zostanie trwale usunięte.</p>
                        <div v-if="!deleteAdvert.soldAt" class="sold-option">
                            <div class="sold-option-label">
                                <CzIcon icon="mdi-chart-bar" size="15" class="sold-opt-icon" />
                                Oznaczyć jako sprzedane przed usunięciem?
                            </div>
                            <p class="sold-option-desc">Sprzedane auto zostanie wliczone do Twoich statystyk sprzedaży.</p>
                            <div class="toggle-row">
                                <button
                                    class="toggle-btn"
                                    :class="{ active: markSoldOnDelete }"
                                    @click="markSoldOnDelete = true"
                                >
                                    <CzIcon icon="mdi-check-circle" size="15" />
                                    Tak, sprzedałem
                                </button>
                                <button
                                    class="toggle-btn"
                                    :class="{ active: !markSoldOnDelete }"
                                    @click="markSoldOnDelete = false"
                                >
                                    <CzIcon icon="mdi-close-circle-outline" size="15" />
                                    Nie, po prostu usuń
                                </button>
                            </div>
                        </div>
                        <div class="confirm-actions">
                            <button class="btn-cancel" @click="deleteAdvert = null">Anuluj</button>
                            <button class="btn-delete-confirm" :disabled="deleteLoading !== null" @click="doDelete">
                                <CzIcon v-if="deleteLoading !== null" icon="mdi-loading" size="14" class="spin" />
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
const { success: toastSuccess, error: toastError } = useToast()

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
const { t } = useI18n()

const selectedIds = ref<Set<number>>(new Set())
const bulkLoading = ref(false)
const exporting = ref(false)

const allOnPageSelected = computed(() =>
    adverts.value.length > 0 && adverts.value.every(a => selectedIds.value.has(a.id))
)

function toggleSelect(id: number) {
    const next = new Set(selectedIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedIds.value = next
}

function toggleSelectAll() {
    if (allOnPageSelected.value) {
        selectedIds.value = new Set()
    } else {
        selectedIds.value = new Set(adverts.value.map(a => a.id))
    }
}

function clearSelection() {
    selectedIds.value = new Set()
}

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

// Dokladna data zakonczenia emisji. Wlasciciel prosil o nia wprost obok licznika
// dni - "Pozostalo 18 dni" nie mowi, KIEDY dokladnie ogloszenie zniknie.
function expiryDate(dateStr: string): string {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
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
    selectedIds.value = new Set()
    try {
        const r = await $fetch<PagedResult<CarAdvert>>(
            `/api/proxy/api/listings/user?page=${p}&pageSize=${pageSize}`
        )
        adverts.value = r?.items ?? []
        total.value = r.totalCount
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się załadować ogłoszeń.')
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
        await $fetch(`/api/proxy/api/listings/${confirmAdvert.value.id}/sold`, { method: 'POST', body: {} })
        const a = adverts.value.find(x => x.id === confirmAdvert.value?.id)
        if (a) a.soldAt = new Date().toISOString()
        confirmAdvert.value = null
        toastSuccess('Ogłoszenie zostało oznaczone jako sprzedane.')
    } catch (err: any) {
        toastError(err?.data?.message || err?.message || 'Wystąpił błąd. Spróbuj ponownie.')
    }
    finally { soldLoading.value = null }
}

async function reactivateAdvert(a: CarAdvert) {
    reactivateLoading.value = a.id
    try {
        await $fetch(`/api/proxy/api/listings/${a.id}/publish`, { method: 'POST', body: {} })
        const found = adverts.value.find(x => x.id === a.id)
        if (found) {
            found.isActive = true
            found.isHidden = false
            const thirtyDays = new Date()
            thirtyDays.setDate(thirtyDays.getDate() + 30)
            found.expiresAt = thirtyDays.toISOString()
        }
        toastSuccess('Ogłoszenie zostało opublikowane.')
    } catch (err: any) {
        toastError(err?.data?.message || err?.message || 'Wystąpił błąd. Spróbuj ponownie.')
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
            await $fetch(`/api/proxy/api/listings/${a.id}/sold`, { method: 'POST', body: {} }).catch(() => {})
        }
        await $fetch(`/api/proxy/api/listings/${a.id}`, { method: 'DELETE' })
        adverts.value = adverts.value.filter(x => x.id !== a.id)
        total.value = Math.max(0, total.value - 1)
        deleteAdvert.value = null
        toastSuccess('Ogłoszenie zostało usunięte.')
    } catch (err: any) {
        toastError(err?.data?.message || err?.message || 'Wystąpił błąd. Spróbuj ponownie.')
    }
    finally { deleteLoading.value = null }
}

type BulkAction = 'activate' | 'deactivate' | 'delete' | 'markSold' | 'renew'

async function runBulkAction(action: BulkAction) {
    const ids = Array.from(selectedIds.value)
    if (ids.length === 0) return

    if (action === 'delete' && !confirm(t('myAdverts.bulkDeleteConfirm', { count: ids.length }))) return
    if (action === 'markSold' && !confirm(t('myAdverts.bulkMarkSoldConfirm', { count: ids.length }))) return

    bulkLoading.value = true
    try {
        const result = await $fetch<{ succeeded: number[]; failed: { id: number; error: string }[] }>(
            '/api/proxy/api/Advert/bulk',
            { method: 'POST', body: { ids, action } }
        )
        if (result.failed.length === 0) {
            toastSuccess(t('myAdverts.bulkResultSuccess', { count: result.succeeded.length }))
        } else {
            toastError(t('myAdverts.bulkResultPartial', {
                succeeded: result.succeeded.length,
                total: ids.length,
                failed: result.failed.length,
            }))
        }
        await load(page.value)
    } catch (err: any) {
        toastError(err?.data?.message ?? t('myAdverts.bulkError'))
    } finally {
        bulkLoading.value = false
    }
}

async function exportCsv() {
    exporting.value = true
    try {
        const blob = await $fetch<Blob>('/api/proxy/api/Advert/export/csv', { responseType: 'blob' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ogloszenia-${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    } catch {
        toastError(t('myAdverts.exportCsvError'))
    } finally {
        exporting.value = false
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

.header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
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

.btn-export {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: transparent;
    color: $text-muted;
    border: 1px solid $border;
    border-radius: $r-md;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 11px 18px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    &:hover:not(:disabled) { border-color: $text-dim; color: $text; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.bulk-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    background: $card;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 12px 16px;
    margin-bottom: 16px;
}

.bulk-select-all {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: $text-dim;
    cursor: pointer;
    white-space: nowrap;
    input { cursor: pointer; }
}

.bulk-count {
    font-size: 13px;
    font-weight: 700;
    color: $text;
    white-space: nowrap;
}

.bulk-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.bulk-btn {
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 7px 14px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    &:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: $text; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.bulk-btn-danger {
    color: $danger;
    border-color: rgba(220,50,50,0.3);
    &:hover:not(:disabled) { background: rgba(220,50,50,0.12); color: $danger; }
}

.bulk-btn-clear {
    background: transparent;
    border: none;
    color: $text-dark;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 7px 4px;
    text-decoration: underline;
    &:hover:not(:disabled) { color: $text-dim; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
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
    background: $card;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 14px;
    transition: border-color 0.2s;

    &:hover { border-color: rgba($red, 0.2); }

    &.row-selected { border-color: rgba($red, 0.4); background: #0d0808; }

    @include respond-to(sm) {
        flex-wrap: wrap;
    }
}

.row-checkbox {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: $red;
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

    &:hover { color: $red-text; }
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
    color: $red-text;
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

// Same ikony zmuszaly uzytkownika do zgadywania, co robi kazdy przycisk.
// Etykieta jest widoczna od tabletu w gore; na waskim telefonie zostaje sama
// ikona (z aria-label), zeby rzad akcji nie zawijal sie w kilka linii.
.act-label {
    margin-left: $s-1;
    font-size: $fs-xs;
    font-weight: $fw-semibold;
    letter-spacing: .01em;
}

@media (max-width: $bp-mobile) {
    .act-label { display: none; }
}

.expiry-rel { font-weight: $fw-semibold; }

.expiry-abs {
    display: block;
    font-size: $fs-xs;
    color: $text-dim;
    font-weight: $fw-normal;
    margin-top: 2px;
}

.status-chip {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
}

.status-active { background: rgba(76,175,80,0.1); color: $success; border: 1px solid rgba(76,175,80,0.2); }
.status-hidden { background: rgba(255,152,0,0.1); color: $warning; border: 1px solid rgba(255,152,0,0.2); }
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
.expiry-warn { background: rgba(255,152,0,0.1); color: $warning; }
.expiry-urgent { background: rgba(220,50,50,0.1); color: $danger; }
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
    &:hover { border-color: rgba($red, 0.5); color: $red-text; }
}

.act-reactivate {
    &:hover:not(:disabled) { border-color: #42a5f5; color: #42a5f5; }
}

.act-sold {
    &:hover:not(:disabled) { border-color: $success; color: $success; }
}

.act-delete {
    &:hover:not(:disabled) { border-color: $danger; color: $danger; }
}

// Modal
.modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px); z-index: 2000;
    display: flex; align-items: center; justify-content: center; padding: 16px;
}

.confirm-modal {
    background: $card; border: 1px solid $border; border-radius: $r-lg;
    padding: 32px 28px; width: 100%; max-width: 360px;
    text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
}

.sold-icon { color: $success; opacity: 0.7; }
.delete-icon { color: $danger; opacity: 0.8; }
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

.sold-opt-icon { color: $red-text; }

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
        color: $red-text;
    }
}

.btn-delete-confirm {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    background: rgba(220,50,50,0.12); border: 1px solid rgba(220,50,50,0.3);
    border-radius: $r-sm; color: $danger; font-size: 13px; font-weight: 700;
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
    border-radius: $r-sm; color: $success; font-size: 13px; font-weight: 700;
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
    background: $card;
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
