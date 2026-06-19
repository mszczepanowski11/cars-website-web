<template>
    <div class="admin-page">
        <aside class="admin-sidebar">
            <div class="sidebar-brand">
                <v-icon icon="mdi-shield-crown" size="20" class="brand-icon" />
                Panel Administratora
            </div>
            <nav class="sidebar-nav">
                <NuxtLink to="/admin" class="nav-item"><v-icon icon="mdi-view-dashboard-outline" size="17" />Podsumowanie</NuxtLink>
                <NuxtLink to="/admin/reports" class="nav-item"><v-icon icon="mdi-flag-outline" size="17" />Zgłoszenia</NuxtLink>
                <NuxtLink to="/admin/users" class="nav-item"><v-icon icon="mdi-account-group-outline" size="17" />Użytkownicy</NuxtLink>
                <NuxtLink to="/admin/adverts" class="nav-item"><v-icon icon="mdi-car-outline" size="17" />Ogłoszenia</NuxtLink>
                <NuxtLink to="/admin/events" class="nav-item"><v-icon icon="mdi-calendar-star" size="17" />Wydarzenia</NuxtLink>
                <NuxtLink to="/admin/taxonomy" class="nav-item"><v-icon icon="mdi-tag-multiple-outline" size="17" />Wyposażenie</NuxtLink>
                <div class="nav-divider" />
                <NuxtLink to="/admin/invoices" class="nav-item active"><v-icon icon="mdi-receipt-text-outline" size="17" />Faktury</NuxtLink>
                <div class="nav-divider" />
                <NuxtLink to="/dashboard" class="nav-item"><v-icon icon="mdi-arrow-left" size="17" />Wróć do panelu</NuxtLink>
            </nav>
        </aside>

        <main class="admin-main">
            <div class="admin-topbar">
                <h1 class="page-title">Faktury i płatności</h1>
                <div class="topbar-actions">
                    <div class="generate-form">
                        <select v-model="genMonth" class="gen-select">
                            <option v-for="(m, i) in MONTHS_PL" :key="i" :value="i + 1">{{ m }}</option>
                        </select>
                        <input v-model.number="genYear" type="number" class="gen-input" min="2024" :max="currentYear" />
                        <button class="gen-btn" :disabled="generating" @click="generate">
                            <v-icon v-if="generating" icon="mdi-loading" size="15" class="spin" />
                            <v-icon v-else icon="mdi-cog-outline" size="15" />
                            Generuj faktury
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="genSuccess" class="alert-ok">
                <v-icon icon="mdi-check-circle-outline" size="16" />{{ genSuccess }}
            </div>
            <div v-if="genError" class="alert-err">
                <v-icon icon="mdi-alert-circle-outline" size="16" />{{ genError }}
            </div>
            <div v-if="actionMsg" class="alert-ok">
                <v-icon icon="mdi-check-circle-outline" size="16" />{{ actionMsg }}
            </div>

            <div v-if="!invoicesLoading" class="stats-row">
                <div class="mini-stat">
                    <div class="ms-label">Faktury</div>
                    <div class="ms-val">{{ invoicesTotalCount.toLocaleString('pl') }}</div>
                </div>
                <div class="mini-stat">
                    <div class="ms-label">Płatności</div>
                    <div class="ms-val">{{ paymentsTotalCount.toLocaleString('pl') }}</div>
                </div>
            </div>

            <div class="tabs">
                <button class="tab" :class="{ active: tab === 'invoices' }" @click="tab = 'invoices'">
                    <v-icon icon="mdi-file-document-outline" size="15" />
                    Faktury
                </button>
                <button class="tab" :class="{ active: tab === 'payments' }" @click="tab = 'payments'">
                    <v-icon icon="mdi-credit-card-outline" size="15" />
                    Płatności
                </button>
            </div>

            <!-- Invoices tab -->
            <template v-if="tab === 'invoices'">
                <div v-if="invoicesLoading" class="loading-state">
                    <v-icon icon="mdi-loading" size="28" class="spin" />
                    Ładowanie faktur...
                </div>
                <template v-else>
                    <div v-if="invoices.length" class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nr faktury</th>
                                    <th>Klient</th>
                                    <th>Okres</th>
                                    <th>Netto</th>
                                    <th>VAT</th>
                                    <th>Brutto</th>
                                    <th>Status</th>
                                    <th>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="inv in invoices" :key="inv.id">
                                    <td class="td-invoice-num">{{ inv.invoiceNumber }}</td>
                                    <td>
                                        <div class="user-cell">
                                            <div class="user-name">{{ inv.userName }}</div>
                                            <div class="user-email">{{ inv.userEmail }}</div>
                                            <div v-if="inv.companyName" class="user-company">
                                                <v-icon icon="mdi-domain" size="11" />{{ inv.companyName }}
                                                <span v-if="inv.nip"> · NIP {{ inv.nip }}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="td-date">{{ monthName(inv.month) }} {{ inv.year }}</td>
                                    <td class="td-num">{{ inv.netAmount.toFixed(2) }}</td>
                                    <td class="td-num">{{ inv.vatAmount.toFixed(2) }}</td>
                                    <td class="td-amount">{{ inv.totalAmount.toFixed(2) }} PLN</td>
                                    <td><span class="status-badge" :class="invoiceStatusClass(inv.status)">{{ invoiceStatusLabel(inv.status) }}</span></td>
                                    <td>
                                        <div class="actions">
                                            <button class="act-btn" title="Pobierz PDF" :disabled="pdfLoadingId === inv.id" @click="downloadPdfAdmin(inv)">
                                                <v-icon v-if="pdfLoadingId === inv.id" icon="mdi-loading" size="14" class="spin" />
                                                <v-icon v-else icon="mdi-file-pdf-box" size="14" style="color:#e53935" />
                                            </button>
                                            <button class="act-btn" title="Wyślij ponownie e-mailem" :disabled="sending === inv.id" @click="resend(inv.id)">
                                                <v-icon v-if="sending === inv.id" icon="mdi-loading" size="14" class="spin" />
                                                <v-icon v-else icon="mdi-email-send-outline" size="14" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="empty-state">
                        <v-icon icon="mdi-file-document-outline" size="36" class="empty-icon" />
                        <p>Brak faktur w systemie.</p>
                    </div>

                    <div v-if="invoicesTotalCount > invoicesPageSize" class="pagination">
                        <button class="page-btn" :disabled="invoicesPage === 1" @click="loadInvoices(invoicesPage - 1)">
                            <v-icon icon="mdi-chevron-left" size="18" />
                        </button>
                        <span class="page-info">{{ invoicesPage }} / {{ Math.ceil(invoicesTotalCount / invoicesPageSize) }}</span>
                        <button class="page-btn" :disabled="invoicesPage >= Math.ceil(invoicesTotalCount / invoicesPageSize)" @click="loadInvoices(invoicesPage + 1)">
                            <v-icon icon="mdi-chevron-right" size="18" />
                        </button>
                    </div>
                </template>
            </template>

            <!-- Payments tab -->
            <template v-else>
                <div v-if="paymentsLoading" class="loading-state">
                    <v-icon icon="mdi-loading" size="28" class="spin" />
                    Ładowanie płatności...
                </div>
                <template v-else>
                    <div v-if="payments.length" class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Data</th>
                                    <th>Usługa</th>
                                    <th>Czas</th>
                                    <th>Kwota</th>
                                    <th>Status</th>
                                    <th>Nr transakcji</th>
                                    <th>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="p in payments" :key="p.id">
                                    <td class="td-id">#{{ p.id }}</td>
                                    <td class="td-date">{{ fmtDate(p.createdAt) }}</td>
                                    <td>{{ p.serviceDescription || p.serviceType }}</td>
                                    <td class="td-dim">{{ p.durationDays ? p.durationDays + ' dni' : '—' }}</td>
                                    <td class="td-amount">{{ p.amount.toFixed(2) }} {{ p.currency }}</td>
                                    <td>
                                        <span class="status-badge" :class="paymentStatusClass(p.status)">
                                            {{ paymentStatusLabel(p.status) }}
                                        </span>
                                    </td>
                                    <td class="td-mono">{{ p.imojeTransactionId || '—' }}</td>
                                    <td>
                                        <!-- Status correction dropdown -->
                                        <div class="status-correct-wrap">
                                            <select
                                                class="status-select"
                                                :value="p.status"
                                                :disabled="statusUpdating === p.id"
                                                @change="(e) => correctStatus(p.id, (e.target as HTMLSelectElement).value as PaymentStatusType)"
                                            >
                                                <option value="Pending">Oczekująca</option>
                                                <option value="Completed">Opłacona</option>
                                                <option value="Failed">Nieudana</option>
                                                <option value="Cancelled">Anulowana</option>
                                                <option value="Refunded">Zwrócona</option>
                                            </select>
                                            <v-icon v-if="statusUpdating === p.id" icon="mdi-loading" size="13" class="spin status-updating-icon" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="empty-state">
                        <v-icon icon="mdi-credit-card-outline" size="36" class="empty-icon" />
                        <p>Brak płatności w systemie.</p>
                    </div>

                    <div v-if="paymentsTotalCount > paymentsPageSize" class="pagination">
                        <button class="page-btn" :disabled="paymentsPage === 1" @click="loadPayments(paymentsPage - 1)">
                            <v-icon icon="mdi-chevron-left" size="18" />
                        </button>
                        <span class="page-info">{{ paymentsPage }} / {{ Math.ceil(paymentsTotalCount / paymentsPageSize) }}</span>
                        <button class="page-btn" :disabled="paymentsPage >= Math.ceil(paymentsTotalCount / paymentsPageSize)" @click="loadPayments(paymentsPage + 1)">
                            <v-icon icon="mdi-chevron-right" size="18" />
                        </button>
                    </div>
                </template>
            </template>
        </main>
    </div>
</template>

<script setup lang="ts">
import type { PaymentRecord, MonthlyInvoice, PaymentStatusType, InvoiceStatusType } from '~/types'

definePageMeta({ middleware: 'admin' })

const tab = ref<'invoices' | 'payments'>('invoices')
const { getAdminInvoices, generatePdf, adminGenerate, adminResendInvoice, adminUpdatePaymentStatus } = useInvoices()

const invoices = ref<MonthlyInvoice[]>([])
const invoicesLoading = ref(true)
const invoicesPage = ref(1)
const invoicesPageSize = 50
const invoicesTotalCount = ref(0)

const payments = ref<PaymentRecord[]>([])
const paymentsLoading = ref(true)
const paymentsPage = ref(1)
const paymentsPageSize = 50
const paymentsTotalCount = ref(0)

const generating = ref(false)
const sending = ref<number | null>(null)
const pdfLoadingId = ref<number | null>(null)
const statusUpdating = ref<number | null>(null)
const genSuccess = ref('')
const genError = ref('')
const actionMsg = ref('')

const now = new Date()
const currentYear = now.getFullYear()
const genMonth = ref(now.getMonth() === 0 ? 12 : now.getMonth())
const genYear = ref(now.getMonth() === 0 ? currentYear - 1 : currentYear)

const MONTHS_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień']
function monthName(m: number) { return MONTHS_PL[m - 1] ?? String(m) }

async function loadInvoices(page = 1) {
    invoicesLoading.value = true
    invoicesPage.value = page
    try {
        const res = await getAdminInvoices(page, invoicesPageSize)
        invoices.value = res.items
        invoicesTotalCount.value = res.totalCount
    } catch { invoices.value = [] }
    finally { invoicesLoading.value = false }
}

async function loadPayments(page = 1) {
    paymentsLoading.value = true
    paymentsPage.value = page
    try {
        const res = await $fetch<{ items: PaymentRecord[]; totalCount: number }>('/api/proxy/api/Payment/admin/all', {
            query: { page, pageSize: paymentsPageSize }
        })
        payments.value = res.items
        paymentsTotalCount.value = res.totalCount
    } catch { payments.value = [] }
    finally { paymentsLoading.value = false }
}

async function generate() {
    genSuccess.value = ''; genError.value = ''
    generating.value = true
    try {
        await adminGenerate(genMonth.value, genYear.value)
        genSuccess.value = `Faktury za ${MONTHS_PL[genMonth.value - 1]} ${genYear.value} zostały wygenerowane.`
        await loadInvoices(1)
    } catch (e: any) {
        genError.value = e?.data?.message ?? 'Błąd generowania faktur.'
    } finally { generating.value = false }
}

async function resend(id: number) {
    sending.value = id
    actionMsg.value = ''
    try {
        await adminResendInvoice(id)
        actionMsg.value = 'Faktura wysłana ponownie.'
        setTimeout(() => { actionMsg.value = '' }, 4000)
    } catch (e: any) {
        genError.value = e?.data?.message ?? 'Błąd wysyłki faktury.'
        setTimeout(() => { genError.value = '' }, 4000)
    } finally { sending.value = null }
}

async function downloadPdfAdmin(inv: MonthlyInvoice) {
    pdfLoadingId.value = inv.id
    try { await generatePdf(inv) }
    catch (e) { console.error('PDF error:', e) }
    finally { pdfLoadingId.value = null }
}

async function correctStatus(paymentId: number, newStatus: PaymentStatusType) {
    statusUpdating.value = paymentId
    actionMsg.value = ''
    try {
        await adminUpdatePaymentStatus(paymentId, newStatus, 'Korekta ręczna — admin')
        const p = payments.value.find(x => x.id === paymentId)
        if (p) p.status = newStatus
        actionMsg.value = `Status płatności #${paymentId} zmieniony na: ${paymentStatusLabel(newStatus)}`
        setTimeout(() => { actionMsg.value = '' }, 4000)
    } catch (e: any) {
        genError.value = e?.data?.message ?? 'Błąd zmiany statusu.'
        setTimeout(() => { genError.value = '' }, 4000)
    } finally { statusUpdating.value = null }
}

function fmtDate(d: string) { return new Date(d).toLocaleDateString('pl-PL', { dateStyle: 'short' }) }

function paymentStatusLabel(s: PaymentStatusType | string) {
    const map: Record<string, string> = { Pending: 'Oczekująca', Completed: 'Opłacona', Failed: 'Nieudana', Cancelled: 'Anulowana', Refunded: 'Zwrócona' }
    return map[s] ?? s
}

function paymentStatusClass(s: PaymentStatusType) {
    if (s === 'Completed') return 'status-ok'
    if (s === 'Pending') return 'status-pending'
    if (s === 'Refunded') return 'status-refunded'
    return 'status-fail'
}

function invoiceStatusLabel(s: InvoiceStatusType) {
    const map: Record<InvoiceStatusType, string> = { Draft: 'Szkic', Generated: 'Wygenerowana', Sent: 'Wysłana' }
    return map[s] ?? s
}

function invoiceStatusClass(s: InvoiceStatusType) {
    if (s === 'Sent') return 'status-ok'
    if (s === 'Generated') return 'status-generated'
    return 'status-pending'
}

onMounted(() => { loadInvoices(); loadPayments() })
</script>

<style lang="scss" scoped>
.admin-page { display: flex; min-height: 100vh; background: $bg; padding-top: $nav-height; }
.admin-sidebar { width: 220px; min-width: 220px; background: #070707; border-right: 1px solid $border; position: sticky; top: $nav-height; height: calc(100vh - #{$nav-height}); overflow-y: auto; display: flex; flex-direction: column; }
.sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 18px 18px 12px; font-size: 13px; font-weight: 800; color: $text; border-bottom: 1px solid $border; }
.brand-icon { color: $red; }
.sidebar-nav { flex: 1; padding: 12px 0; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 18px; color: $text-muted; font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none; transition: background 0.15s, color 0.15s; &:hover { background: rgba(255,255,255,0.04); color: $text; } &.active { background: rgba($red, 0.1); color: $text; border-left: 2px solid $red; padding-left: 16px; } }
.nav-divider { height: 1px; background: $border; margin: 8px 0; }
.admin-main { flex: 1; min-width: 0; padding: 28px; }
.admin-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 22px; font-weight: 900; color: $text; }
.topbar-actions { display: flex; align-items: center; gap: 12px; }
.loading-state { display: flex; align-items: center; gap: 12px; color: $text-dim; font-size: 14px; padding: 60px 0; }
.empty-state { text-align: center; padding: 60px 20px; color: $text-dim; font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.empty-icon { color: $border; }
.pagination { display: flex; align-items: center; gap: 12px; justify-content: center; margin-top: 24px; }
.page-btn { background: transparent; border: 1px solid $border; border-radius: $r-sm; color: $text-muted; padding: 7px 10px; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; &:hover:not(:disabled) { border-color: $red; color: $text; } &:disabled { opacity: 0.3; cursor: not-allowed; } }
.page-info { font-size: 13px; color: $text-dim; font-weight: 500; }

.tabs { display: flex; gap: 4px; border-bottom: 1px solid $border; margin-bottom: 20px; }
.tab { display: flex; align-items: center; gap: 7px; padding: 9px 16px; background: transparent; border: none; border-bottom: 2px solid transparent; color: $text-muted; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; margin-bottom: -1px; transition: color 0.15s, border-color 0.15s; &:hover { color: $text; } &.active { color: $text; border-bottom-color: $red; } }

.generate-form { display: flex; align-items: center; gap: 8px; }
.gen-select, .gen-input { background: #0d0d0d; border: 1px solid $border; border-radius: $r-sm; color: $text; font-size: 13px; font-family: 'Inter', sans-serif; padding: 7px 10px; outline: none; &:focus { border-color: rgba($red, 0.4); } }
.gen-input { width: 76px; }
.gen-btn { display: flex; align-items: center; gap: 6px; padding: 7px 16px; background: $red; border: none; border-radius: $r-sm; color: white; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; transition: opacity 0.15s; &:hover:not(:disabled) { opacity: 0.85; } &:disabled { opacity: 0.5; cursor: not-allowed; } }

.alert-ok, .alert-err { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: $r-sm; font-size: 13px; margin-bottom: 16px; }
.alert-ok { background: rgba(76,175,80,0.1); color: #4caf50; border: 1px solid rgba(76,175,80,0.2); }
.alert-err { background: rgba($red, 0.1); color: $red; border: 1px solid rgba($red, 0.2); }

.stats-row { display: flex; gap: 12px; margin-bottom: 20px; }
.mini-stat { background: #0a0a0a; border: 1px solid $border; border-radius: $r-md; padding: 14px 20px; min-width: 160px; }
.ms-label { font-size: 11px; color: $text-dim; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.ms-val { font-size: 24px; font-weight: 900; color: $text; }

.table-wrap { background: #0a0a0a; border: 1px solid $border; border-radius: $r-md; overflow: auto; }
.data-table {
    width: 100%; border-collapse: collapse; min-width: 800px;
    th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: $text-dim; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(255,255,255,0.02); border-bottom: 1px solid $border; white-space: nowrap; }
    td { padding: 11px 14px; font-size: 13px; color: $text-muted; border-bottom: 1px solid rgba($border, 0.5); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,0.02); }
}

.td-id { color: $text-dark; font-size: 12px; }
.td-date { color: $text-dim; font-size: 12px; white-space: nowrap; }
.td-dim { color: $text-dim; font-size: 12px; }
.td-num { color: $text-muted; white-space: nowrap; font-size: 12px; }
.td-amount { font-weight: 600; color: $text; white-space: nowrap; }
.td-invoice-num { font-weight: 600; color: $text; font-size: 12px; white-space: nowrap; }
.td-mono { font-family: monospace; font-size: 11px; color: $text-dark; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.user-cell { display: flex; flex-direction: column; gap: 2px; }
.user-name { color: $text; font-size: 13px; font-weight: 500; }
.user-email { color: $text-dim; font-size: 11px; }
.user-company { color: $text-dark; font-size: 11px; display: flex; align-items: center; gap: 3px; }

.status-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; &.status-ok { background: rgba(76,175,80,0.12); color: #4caf50; } &.status-pending { background: rgba(255,152,0,0.12); color: #ff9800; } &.status-generated { background: rgba(33,150,243,0.12); color: #2196f3; } &.status-refunded { background: rgba(41,128,185,0.12); color: #5dade2; } &.status-fail { background: rgba($red, 0.12); color: $red; } }

.actions { display: flex; gap: 4px; }
.act-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; background: transparent; border: 1px solid $border; border-radius: $r-sm; color: $text-muted; cursor: pointer; transition: all 0.15s; &:hover:not(:disabled) { border-color: $red; color: $text; } &:disabled { opacity: 0.4; cursor: not-allowed; } }

// Status correction dropdown
.status-correct-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
}

.status-select {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    padding: 5px 8px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
    &:focus { border-color: rgba($red, 0.5); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.status-updating-icon { color: $text-dim; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
