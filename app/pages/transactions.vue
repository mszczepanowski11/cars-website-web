<template>
    <div class="page-bg">
        <div class="container" style="padding-top: 120px; padding-bottom: 80px;">
            <div class="page-header">
                <div>
                    <h1 class="page-title">Moje transakcje</h1>
                    <p class="page-sub">Rezerwacje, oględziny i zakupy</p>
                </div>
                <NuxtLink to="/dashboard" class="back-link">
                    <v-icon icon="mdi-arrow-left" size="16" />Powrót do panelu
                </NuxtLink>
            </div>

            <div v-if="loading" class="loading-row">
                <v-icon icon="mdi-loading" size="36" class="spin" />
            </div>

            <div v-else-if="!transactions.length" class="empty-state">
                <v-icon icon="mdi-handshake-outline" size="48" class="empty-icon" />
                <p>Brak transakcji.</p>
            </div>

            <template v-else>
                <div class="tx-list">
                    <div v-for="tx in transactions" :key="tx.id" class="tx-row">
                        <div class="tx-type-icon" :class="`tx-${tx.type.toLowerCase()}`">
                            <v-icon :icon="typeIcon(tx.type)" size="18" />
                        </div>
                        <div class="tx-body">
                            <div class="tx-title">
                                <NuxtLink :to="`/advert/${tx.advertId}`" class="tx-advert-link">{{ tx.advertTitle }}</NuxtLink>
                            </div>
                            <div class="tx-meta">
                                <span class="tx-type-label">{{ typeLabel(tx.type) }}</span>
                                <span class="tx-sep">·</span>
                                <span class="tx-price">{{ Number(tx.advertPrice).toLocaleString('pl') }} zł</span>
                                <span v-if="tx.scheduledAt" class="tx-sep">·</span>
                                <span v-if="tx.scheduledAt" class="tx-date">{{ fmtDate(tx.scheduledAt) }}</span>
                            </div>
                            <div v-if="tx.notes" class="tx-notes">{{ tx.notes }}</div>
                            <div v-if="tx.sellerPhone" class="tx-phone">
                                <v-icon icon="mdi-phone-outline" size="13" />{{ tx.sellerPhone }}
                            </div>
                        </div>
                        <div class="tx-right">
                            <span class="tx-status" :class="`status-${tx.status.toLowerCase()}`">{{ statusLabel(tx.status) }}</span>
                            <button
                                v-if="tx.status === 'Pending' || tx.status === 'Confirmed'"
                                class="tx-cancel-btn"
                                :disabled="cancelLoading === tx.id"
                                @click="doCancel(tx)"
                            >
                                <v-icon v-if="cancelLoading === tx.id" icon="mdi-loading" size="13" class="spin" />
                                <span v-else>Anuluj</span>
                            </button>
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
    </div>
</template>

<script setup lang="ts">
import type { Transaction, PagedResult } from '~/types'

definePageMeta({ middleware: 'auth' })

const { getMyTransactions, cancelTransaction } = useTransactions()

const transactions = ref<Transaction[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(true)
const pageSize = 20
const cancelLoading = ref<number | null>(null)

const totalPages = computed(() => Math.ceil(total.value / pageSize))

function typeIcon(t: string): string {
    if (t === 'Reservation') return 'mdi-bookmark-outline'
    if (t === 'Viewing') return 'mdi-calendar-outline'
    return 'mdi-handshake-outline'
}

function typeLabel(t: string): string {
    const map: Record<string, string> = { Reservation: 'Rezerwacja', Viewing: 'Oględziny', Purchase: 'Zakup' }
    return map[t] ?? t
}

function statusLabel(s: string): string {
    const map: Record<string, string> = { Pending: 'Oczekuje', Confirmed: 'Potwierdzone', Cancelled: 'Anulowane', Completed: 'Zakończone' }
    return map[s] ?? s
}

function fmtDate(d: string): string {
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function load(p: number = page.value) {
    page.value = p
    loading.value = true
    try {
        const r = await getMyTransactions(p, pageSize)
        transactions.value = r.items
        total.value = r.totalCount
    } catch { transactions.value = [] }
    finally { loading.value = false }
}

async function doCancel(tx: Transaction) {
    cancelLoading.value = tx.id
    try {
        await cancelTransaction(tx.id)
        tx.status = 'Cancelled'
    } catch {}
    finally { cancelLoading.value = null }
}

onMounted(() => load(1))
</script>

<style lang="scss" scoped>
.page-bg { background: $bg; min-height: 100vh; }
.container { @include container; }

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 12px;
}

.page-title { font-size: 36px; font-weight: 900; color: $text; margin-bottom: 4px; }
.page-sub { font-size: 14px; color: $text-dim; }

.back-link {
    display: flex;
    align-items: center;
    gap: 6px;
    color: $text-muted;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    transition: color 0.15s;
    &:hover { color: $text; }
}

.empty-state {
    text-align: center;
    padding: 80px 20px;
    color: $text-dim;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
}
.empty-icon { color: $border; }

.tx-list { display: flex; flex-direction: column; gap: 10px; }

.tx-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 16px;
    transition: border-color 0.2s;
    &:hover { border-color: rgba($red, 0.2); }
}

.tx-type-icon {
    width: 38px;
    height: 38px;
    border-radius: $r-md;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;

    &.tx-reservation { background: rgba(33,150,243,0.1); color: #2196f3; }
    &.tx-viewing { background: rgba(255,152,0,0.1); color: #ff9800; }
    &.tx-purchase { background: rgba(76,175,80,0.1); color: #4caf50; }
}

.tx-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }

.tx-advert-link {
    font-size: 14px;
    font-weight: 700;
    color: $text;
    text-decoration: none;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &:hover { color: $red; }
}

.tx-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.tx-type-label { font-size: 12px; color: $text-muted; font-weight: 500; }
.tx-sep { color: $text-dark; font-size: 11px; }
.tx-price { font-size: 13px; font-weight: 700; color: $red; }
.tx-date { font-size: 12px; color: $text-dim; }
.tx-notes { font-size: 12px; color: $text-dim; font-style: italic; }
.tx-phone { display: flex; align-items: center; gap: 4px; font-size: 12px; color: $text-dim; }

.tx-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }

.tx-status {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    white-space: nowrap;

    &.status-pending { background: rgba(255,152,0,0.1); color: #ff9800; border: 1px solid rgba(255,152,0,0.2); }
    &.status-confirmed { background: rgba(33,150,243,0.1); color: #2196f3; border: 1px solid rgba(33,150,243,0.2); }
    &.status-completed { background: rgba(76,175,80,0.1); color: #4caf50; border: 1px solid rgba(76,175,80,0.2); }
    &.status-cancelled { background: rgba(255,255,255,0.05); color: $text-dim; border: 1px solid $border; }
}

.tx-cancel-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-dim;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 5px 12px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    white-space: nowrap;
    &:hover:not(:disabled) { border-color: #e55; color: #e55; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.loading-row {
    display: flex;
    justify-content: center;
    padding: 80px 0;
    color: $red;
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
</style>
