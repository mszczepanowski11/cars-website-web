<template>
    <div class="faktury-page">
        <div class="page-header">
            <h1 class="page-title">Faktury i płatności</h1>
            <p class="page-sub">Historia transakcji i zbiorczych faktur miesięcznych.</p>
        </div>

        <div class="tabs">
            <button class="tab" :class="{ active: tab === 'payments' }" @click="tab = 'payments'">
                <v-icon icon="mdi-credit-card-outline" size="16" />
                Płatności
            </button>
            <button class="tab" :class="{ active: tab === 'invoices' }" @click="tab = 'invoices'">
                <v-icon icon="mdi-file-document-outline" size="16" />
                Faktury
            </button>
        </div>

        <!-- Payments tab -->
        <template v-if="tab === 'payments'">
            <div v-if="paymentsLoading" class="loading-state">
                <v-icon icon="mdi-loading" size="28" class="spin" />
                Ładowanie płatności...
            </div>
            <template v-else>
                <div v-if="payments.length" class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Usługa</th>
                                <th>Czas</th>
                                <th>Kwota</th>
                                <th>Status</th>
                                <th>Nr transakcji</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="p in payments" :key="p.id">
                                <td class="td-date">{{ fmtDate(p.createdAt) }}</td>
                                <td>{{ p.serviceDescription }}</td>
                                <td class="td-dim">{{ p.durationDays ? p.durationDays + ' dni' : '—' }}</td>
                                <td class="td-amount">{{ p.amount.toFixed(2) }} {{ p.currency }}</td>
                                <td><span class="status-badge" :class="paymentStatusClass(p.status)">{{ paymentStatusLabel(p.status) }}</span></td>
                                <td class="td-dim td-mono">{{ p.imojeTransactionId || '—' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="empty-state">
                    <v-icon icon="mdi-credit-card-outline" size="40" class="empty-icon" />
                    <p>Brak płatności do wyświetlenia.</p>
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

        <!-- Invoices tab -->
        <template v-else>
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
                                <td class="td-date">{{ monthName(inv.month) }} {{ inv.year }}</td>
                                <td>{{ inv.netAmount.toFixed(2) }} PLN</td>
                                <td>{{ inv.vatAmount.toFixed(2) }} PLN</td>
                                <td class="td-amount">{{ inv.totalAmount.toFixed(2) }} PLN</td>
                                <td><span class="status-badge" :class="invoiceStatusClass(inv.status)">{{ invoiceStatusLabel(inv.status) }}</span></td>
                                <td>
                                    <button class="dl-btn" title="Pobierz fakturę (HTML)" @click="downloadHtml(inv.id)">
                                        <v-icon icon="mdi-download" size="16" />
                                        Pobierz
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="empty-state">
                    <v-icon icon="mdi-file-document-outline" size="40" class="empty-icon" />
                    <p>Brak faktur do wyświetlenia.</p>
                    <p class="empty-hint">Faktury zbiorcze generowane są automatycznie 1-go dnia każdego miesiąca za poprzedni miesiąc.</p>
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
    </div>
</template>

<script setup lang="ts">
import type { PaymentRecord, MonthlyInvoice, PaymentStatusType, InvoiceStatusType } from '~/types'

definePageMeta({ middleware: 'auth' })

const tab = ref<'payments' | 'invoices'>('payments')
const { getMyPayments } = usePayment()
const { getMyInvoices, downloadHtml } = useInvoices()

const payments = ref<PaymentRecord[]>([])
const paymentsLoading = ref(true)
const paymentsPage = ref(1)
const paymentsPageSize = 20
const paymentsTotalCount = ref(0)

const invoices = ref<MonthlyInvoice[]>([])
const invoicesLoading = ref(true)
const invoicesPage = ref(1)
const invoicesPageSize = 20
const invoicesTotalCount = ref(0)

async function loadPayments(page = 1) {
    paymentsLoading.value = true
    paymentsPage.value = page
    try {
        const res = await getMyPayments(page, paymentsPageSize)
        payments.value = res.items
        paymentsTotalCount.value = res.totalCount
    } catch {}
    finally { paymentsLoading.value = false }
}

async function loadInvoices(page = 1) {
    invoicesLoading.value = true
    invoicesPage.value = page
    try {
        const res = await getMyInvoices(page, invoicesPageSize)
        invoices.value = res.items
        invoicesTotalCount.value = res.totalCount
    } catch {}
    finally { invoicesLoading.value = false }
}

onMounted(() => {
    loadPayments()
    loadInvoices()
})

const MONTHS_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień']
function monthName(m: number) { return MONTHS_PL[m - 1] ?? m }

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('pl-PL', { dateStyle: 'short' })
}

function paymentStatusLabel(s: PaymentStatusType) {
    const map: Record<PaymentStatusType, string> = {
        Pending: 'Oczekuje', Completed: 'Zaksięgowana', Failed: 'Nieudana',
        Cancelled: 'Anulowana', Refunded: 'Zwrócona'
    }
    return map[s] ?? s
}

function paymentStatusClass(s: PaymentStatusType) {
    if (s === 'Completed') return 'status-ok'
    if (s === 'Pending') return 'status-pending'
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
</script>

<style lang="scss" scoped>
.faktury-page {
    max-width: 900px;
    margin: 0 auto;
    padding: calc(#{$nav-height} + 32px) 24px 48px;
}

.page-header { margin-bottom: 28px; }

.page-title {
    font-size: 26px;
    font-weight: 900;
    color: $text;
    margin: 0 0 6px;
}

.page-sub { font-size: 14px; color: $text-dim; margin: 0; }

.tabs {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid $border;
    margin-bottom: 24px;
}

.tab {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 18px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    margin-bottom: -1px;
    transition: color 0.15s, border-color 0.15s;

    &:hover { color: $text; }
    &.active { color: $text; border-bottom-color: $red; }
}

.loading-state {
    display: flex;
    align-items: center;
    gap: 12px;
    color: $text-dim;
    font-size: 14px;
    padding: 48px 0;
}

.table-wrap {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-md;
    overflow: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;

    th {
        padding: 11px 14px;
        text-align: left;
        font-size: 11px;
        font-weight: 700;
        color: $text-dim;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: rgba(255,255,255,0.02);
        border-bottom: 1px solid $border;
        white-space: nowrap;
    }

    td {
        padding: 12px 14px;
        font-size: 13px;
        color: $text-muted;
        border-bottom: 1px solid rgba($border, 0.5);
        vertical-align: middle;
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,0.02); }
}

.td-date { color: $text-dim; white-space: nowrap; font-size: 12px; }
.td-dim { color: $text-dim; font-size: 12px; }
.td-mono { font-family: monospace; font-size: 11px; }
.td-amount { font-weight: 600; color: $text; white-space: nowrap; }
.td-invoice-num { font-weight: 600; color: $text; white-space: nowrap; font-size: 12px; }

.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;

    &.status-ok { background: rgba(76,175,80,0.12); color: #4caf50; }
    &.status-pending { background: rgba(255,152,0,0.12); color: #ff9800; }
    &.status-generated { background: rgba(33,150,243,0.12); color: #2196f3; }
    &.status-fail { background: rgba($red, 0.12); color: $red; }
}

.dl-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.15s;

    &:hover { border-color: $red; color: $text; }
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: $text-dim;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.empty-icon { color: $border; }

.empty-hint {
    font-size: 12px;
    color: $text-dark;
    max-width: 380px;
    line-height: 1.5;
}

.pagination {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
    margin-top: 20px;
}

.page-btn {
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    padding: 6px 10px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;

    &:hover:not(:disabled) { border-color: $red; color: $text; }
    &:disabled { opacity: 0.3; cursor: not-allowed; }
}

.page-info { font-size: 13px; color: $text-dim; font-weight: 500; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>