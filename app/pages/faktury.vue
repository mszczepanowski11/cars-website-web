<template>
    <div class="invoices-page">
        <div class="container">
            <div class="page-header">
                <div>
                    <h1 class="page-title">Faktury i płatności</h1>
                    <p class="page-sub">Historia Twoich zakupów i faktur w CARIZO</p>
                </div>
            </div>

            <div class="inv-tabs">
                <button class="inv-tab" :class="{ active: tab === 'invoices' }" @click="tab = 'invoices'">
                    <v-icon icon="mdi-receipt-outline" size="16" />
                    Faktury ({{ invoicesTotal }})
                </button>
                <button class="inv-tab" :class="{ active: tab === 'payments' }" @click="tab = 'payments'">
                    <v-icon icon="mdi-credit-card-outline" size="16" />
                    Historia płatności ({{ paymentsTotal }})
                </button>
            </div>

            <!-- INVOICES TAB -->
            <div v-if="tab === 'invoices'">
                <div v-if="invoicesLoading" class="loading-state">
                    <v-icon icon="mdi-loading" size="32" class="spin" />
                    Wczytuję faktury...
                </div>

                <div v-else-if="invoices.length === 0" class="empty-state">
                    <v-icon icon="mdi-receipt-text-outline" size="48" />
                    <div class="empty-title">Brak faktur</div>
                    <p class="empty-sub">Faktury pojawiają się tutaj po dokonaniu płatności. Faktury zbiorcze generowane są automatycznie 1-go każdego miesiąca za miesiąc poprzedni.</p>
                    <NuxtLink to="/my-adverts" class="btn-red">
                        <v-icon icon="mdi-car-outline" size="16" />
                        Moje ogłoszenia
                    </NuxtLink>
                </div>

                <div v-else class="invoices-list">
                    <div v-for="inv in invoices" :key="inv.id" class="invoice-card">
                        <div class="inv-card-header">
                            <div class="inv-number">
                                <v-icon icon="mdi-receipt-outline" size="16" class="inv-icon" />
                                {{ inv.invoiceNumber }}
                            </div>
                            <div class="inv-period">{{ monthName(inv.month) }} {{ inv.year }}</div>
                            <div class="inv-status" :class="`status-${inv.status.toLowerCase()}`">
                                <v-icon :icon="statusIcon(inv.status)" size="13" />
                                {{ statusLabel(inv.status) }}
                            </div>
                        </div>

                        <div class="inv-amounts">
                            <div class="inv-amount-item">
                                <span class="ia-label">Netto</span>
                                <span class="ia-val">{{ fmtAmt(inv.netAmount) }} zł</span>
                            </div>
                            <div class="inv-amount-item">
                                <span class="ia-label">VAT ({{ inv.vatRate }}%)</span>
                                <span class="ia-val">{{ fmtAmt(inv.vatAmount) }} zł</span>
                            </div>
                            <div class="inv-amount-item inv-amount-total">
                                <span class="ia-label">Brutto</span>
                                <span class="ia-val-total">{{ fmtAmt(inv.totalAmount) }} zł</span>
                            </div>
                        </div>

                        <div v-if="expandedInv === inv.id" class="inv-items">
                            <div class="inv-items-title">Pozycje faktury ({{ inv.items.length }})</div>
                            <div v-for="item in inv.items" :key="item.id" class="inv-item-row">
                                <div class="iir-desc">
                                    <span class="iir-type">{{ item.serviceDescription || serviceLabel(item.serviceType) }}</span>
                                    <span v-if="item.durationDays" class="iir-dur">{{ item.durationDays }} dni</span>
                                </div>
                                <div class="iir-date">{{ fmtDate(item.createdAt) }}</div>
                                <div class="iir-amount">{{ fmtAmt(item.amount) }} zł</div>
                            </div>
                        </div>

                        <div v-if="expandedInv === inv.id && (inv.companyName || inv.street)" class="inv-billing">
                            <div class="inv-billing-title">Dane nabywcy</div>
                            <div class="inv-billing-data">
                                <template v-if="inv.companyName">
                                    <div>{{ inv.companyName }}</div>
                                    <div v-if="inv.nip">NIP: {{ inv.nip }}</div>
                                </template>
                                <template v-else>
                                    <div>{{ inv.userName }}</div>
                                </template>
                                <div v-if="inv.street">{{ inv.street }}</div>
                                <div v-if="inv.postalCode || inv.city">{{ inv.postalCode }} {{ inv.city }}</div>
                                <div v-if="inv.country">{{ inv.country }}</div>
                                <div>{{ inv.userEmail }}</div>
                            </div>
                        </div>

                        <div class="inv-card-actions">
                            <button class="inv-action-btn" @click="expandedInv = expandedInv === inv.id ? null : inv.id">
                                <v-icon :icon="expandedInv === inv.id ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="15" />
                                {{ expandedInv === inv.id ? 'Zwiń' : 'Szczegóły' }}
                            </button>
                            <button class="inv-action-btn" :disabled="pdfLoadingId === inv.id" @click="downloadPdf(inv)">
                                <v-icon v-if="pdfLoadingId === inv.id" icon="mdi-loading" size="15" class="spin" />
                                <v-icon v-else icon="mdi-file-pdf-box" size="15" style="color:#e53935" />
                                Pobierz PDF
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="invoicesTotalPages > 1" class="pagination">
                    <button class="page-btn" :disabled="invoicesPage === 1" aria-label="Poprzednia strona" @click="invoicesPage--; loadInvoices()">
                        <v-icon icon="mdi-chevron-left" size="18" />
                    </button>
                    <span class="page-info">{{ invoicesPage }} / {{ invoicesTotalPages }}</span>
                    <button class="page-btn" :disabled="invoicesPage === invoicesTotalPages" aria-label="Następna strona" @click="invoicesPage++; loadInvoices()">
                        <v-icon icon="mdi-chevron-right" size="18" />
                    </button>
                </div>
            </div>

            <!-- PAYMENTS TAB -->
            <div v-else-if="tab === 'payments'">
                <div v-if="paymentsLoading" class="loading-state">
                    <v-icon icon="mdi-loading" size="32" class="spin" />
                    Wczytuję płatności...
                </div>

                <div v-else-if="payments.length === 0" class="empty-state">
                    <v-icon icon="mdi-credit-card-off-outline" size="48" />
                    <div class="empty-title">Brak płatności</div>
                    <p class="empty-sub">Historia Twoich płatności pojawi się tutaj po pierwszej transakcji.</p>
                </div>

                <div v-else class="payments-table-wrap">
                    <div class="pt-header">
                        <span>Data</span>
                        <span>Usługa</span>
                        <span>Okres</span>
                        <span>Kwota</span>
                        <span>Status</span>
                        <span>ID transakcji</span>
                    </div>
                    <div v-for="p in payments" :key="p.id" class="pt-row">
                        <span class="pt-date">{{ fmtDate(p.createdAt) }}</span>
                        <span class="pt-service">{{ p.serviceDescription || serviceLabel(p.serviceType) }}</span>
                        <span class="pt-dur">{{ p.durationDays ? p.durationDays + ' dni' : '—' }}</span>
                        <span class="pt-amount">{{ fmtAmt(p.amount) }} zł</span>
                        <span class="pt-status" :class="`pstatus-${p.status.toLowerCase()}`">
                            <v-icon :icon="paymentStatusIcon(p.status)" size="13" />
                            {{ paymentStatusLabel(p.status) }}
                        </span>
                        <span class="pt-txid">{{ p.imojeTransactionId ?? '—' }}</span>
                    </div>
                </div>

                <div v-if="paymentsTotalPages > 1" class="pagination">
                    <button class="page-btn" :disabled="paymentsPage === 1" aria-label="Poprzednia strona" @click="paymentsPage--; loadPayments()">
                        <v-icon icon="mdi-chevron-left" size="18" />
                    </button>
                    <span class="page-info">{{ paymentsPage }} / {{ paymentsTotalPages }}</span>
                    <button class="page-btn" :disabled="paymentsPage === paymentsTotalPages" aria-label="Następna strona" @click="paymentsPage++; loadPayments()">
                        <v-icon icon="mdi-chevron-right" size="18" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { MonthlyInvoice, PaymentRecord, PagedResult } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Faktury i płatności — CARIZO', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const tab = ref<'invoices' | 'payments'>('invoices')

const invoices = ref<MonthlyInvoice[]>([])
const invoicesLoading = ref(false)
const invoicesTotal = ref(0)
const invoicesPage = ref(1)
const invoicesTotalPages = computed(() => Math.max(1, Math.ceil(invoicesTotal.value / 20)))
const expandedInv = ref<number | null>(null)
const pdfLoadingId = ref<number | null>(null)

const payments = ref<PaymentRecord[]>([])
const paymentsLoading = ref(false)
const paymentsTotal = ref(0)
const paymentsPage = ref(1)
const paymentsTotalPages = computed(() => Math.max(1, Math.ceil(paymentsTotal.value / 20)))

const { getMyInvoices } = useInvoices()
const { error: toastError } = useToast()

async function loadInvoices() {
    invoicesLoading.value = true
    try {
        const r = await getMyInvoices(invoicesPage.value, 20)
        invoices.value = r.items
        invoicesTotal.value = r.totalCount
    } catch (e: any) {
        invoices.value = []
        toastError(e?.data?.message ?? 'Nie udało się załadować faktur.')
    } finally { invoicesLoading.value = false }
}

async function loadPayments() {
    paymentsLoading.value = true
    try {
        const r = await $fetch<PagedResult<PaymentRecord>>('/api/proxy/api/Payment/my', {
            query: { page: paymentsPage.value, pageSize: 20 }
        })
        payments.value = r.items
        paymentsTotal.value = r.totalCount
    } catch (e: any) {
        payments.value = []
        toastError(e?.data?.message ?? 'Nie udało się załadować płatności.')
    } finally { paymentsLoading.value = false }
}

onMounted(() => { loadInvoices(); loadPayments() })

async function downloadPdf(inv: MonthlyInvoice) {
    pdfLoadingId.value = inv.id
    try {
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const W = doc.internal.pageSize.getWidth()
        let y = 0

        // Red header bar
        doc.setFillColor(139, 13, 29)
        doc.rect(0, 0, W, 22, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18); doc.setFont('helvetica', 'bold')
        doc.text('CARIZO', 14, 14)
        doc.setFontSize(8); doc.setFont('helvetica', 'normal')
        doc.text('carizo.pl | biuro@carizo.pl', W - 14, 14, { align: 'right' })
        y = 32

        // Invoice title block
        doc.setTextColor(20, 20, 20)
        doc.setFontSize(22); doc.setFont('helvetica', 'bold')
        doc.text('FAKTURA VAT', 14, y); y += 8
        doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100)
        doc.text(`Nr faktury: ${inv.invoiceNumber}`, 14, y)
        doc.text(`Data wystawienia: ${new Date(inv.generatedAt).toLocaleDateString('pl-PL')}`, W - 14, y, { align: 'right' })
        y += 6
        doc.text(`Okres rozliczeniowy: ${monthName(inv.month)} ${inv.year}`, 14, y); y += 14

        // Seller / Buyer boxes
        const boxH = 36
        doc.setFillColor(248, 248, 248)
        doc.roundedRect(12, y - 2, (W - 30) / 2, boxH, 2, 2, 'F')
        doc.roundedRect(W / 2 + 3, y - 2, (W - 30) / 2, boxH, 2, 2, 'F')

        doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(139, 13, 29)
        doc.text('SPRZEDAWCA', 16, y + 4)
        doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40)
        doc.text('CARIZO Sp. z o.o.', 16, y + 10)
        doc.setTextColor(80, 80, 80)
        doc.text('ul. Przykładowa 1', 16, y + 16)
        doc.text('00-000 Warszawa', 16, y + 22)
        doc.text('NIP: 0000000000', 16, y + 28)

        const bx = W / 2 + 7
        doc.setFont('helvetica', 'bold'); doc.setTextColor(139, 13, 29)
        doc.text('NABYWCA', bx, y + 4)
        doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40)
        const buyerLines: string[] = []
        if (inv.companyName) { buyerLines.push(inv.companyName); if (inv.nip) buyerLines.push(`NIP: ${inv.nip}`) }
        else buyerLines.push(inv.userName)
        if (inv.street) buyerLines.push(inv.street)
        if (inv.postalCode || inv.city) buyerLines.push(`${inv.postalCode ?? ''} ${inv.city ?? ''}`.trim())
        buyerLines.push(inv.userEmail)
        buyerLines.forEach((line, i) => {
            if (i === 0) doc.setTextColor(40, 40, 40)
            else doc.setTextColor(80, 80, 80)
            doc.text(line, bx, y + 10 + i * 6)
        })
        y += boxH + 12

        // Items table
        const colX = [14, 24, 110, 138, 158, 175]
        doc.setFillColor(139, 13, 29)
        doc.rect(12, y, W - 24, 8, 'F')
        doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
        doc.text('Lp.', colX[0], y + 5.5)
        doc.text('Nazwa usługi', colX[1], y + 5.5)
        doc.text('Data', colX[2], y + 5.5)
        doc.text('Netto', colX[3], y + 5.5)
        doc.text('VAT', colX[4], y + 5.5)
        doc.text('Brutto', colX[5], y + 5.5)
        y += 9

        doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40)
        inv.items.forEach((item, idx) => {
            if (idx % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(12, y - 1, W - 24, 7, 'F') }
            doc.setFontSize(7.5)
            doc.text(String(idx + 1), colX[0], y + 4.5)
            const lbl = (item.serviceDescription || serviceLabel(item.serviceType)) + (item.durationDays ? ` — ${item.durationDays} dni` : '')
            doc.text(lbl.slice(0, 40), colX[1], y + 4.5)
            doc.text(new Date(item.createdAt).toLocaleDateString('pl-PL'), colX[2], y + 4.5)
            const net = item.amount / (1 + inv.vatRate / 100)
            const vat = item.amount - net
            doc.text(`${net.toFixed(2)} zł`, colX[3], y + 4.5)
            doc.text(`${inv.vatRate}%`, colX[4], y + 4.5)
            doc.text(`${item.amount.toFixed(2)} zł`, colX[5], y + 4.5)
            y += 7
        })

        // Bottom line
        doc.setDrawColor(200, 200, 200); doc.line(12, y + 2, W - 12, y + 2); y += 8

        // Totals
        const tw = 80; const tx = W - 12 - tw
        doc.setFillColor(248, 248, 248); doc.roundedRect(tx, y, tw, 26, 2, 2, 'F')
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80)
        doc.text('Razem netto:', tx + 4, y + 7); doc.text(`${fmtAmt(inv.netAmount)} zł`, tx + tw - 4, y + 7, { align: 'right' })
        doc.text(`VAT (${inv.vatRate}%):`, tx + 4, y + 14); doc.text(`${fmtAmt(inv.vatAmount)} zł`, tx + tw - 4, y + 14, { align: 'right' })
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(139, 13, 29)
        doc.text('RAZEM:', tx + 4, y + 23); doc.text(`${fmtAmt(inv.totalAmount)} zł`, tx + tw - 4, y + 23, { align: 'right' })
        y += 34

        // Payment method
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100)
        doc.text('Forma płatności: płatność elektroniczna (ING IMOJE)', 14, y)
        if (inv.sentAt) { y += 5; doc.text(`Data opłacenia: ${new Date(inv.sentAt).toLocaleDateString('pl-PL')}`, 14, y) }
        y += 10

        // Footer
        doc.setFontSize(7); doc.setTextColor(160, 160, 160)
        doc.text('Dokument wygenerowany przez system CARIZO | carizo.pl | Nie wymaga podpisu ani pieczęci.', W / 2, 289, { align: 'center' })

        doc.save(`faktura-${inv.invoiceNumber.replace(/\//g, '-')}.pdf`)
    } catch {
        toastError('Nie udało się wygenerować PDF. Spróbuj ponownie.')
    } finally {
        pdfLoadingId.value = null
    }
}

// Helpers
function fmtDate(d: string) { return new Date(d).toLocaleDateString('pl-PL') }
function fmtAmt(n: number) { return n.toFixed(2).replace('.', ',') }

const MONTHS = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień']
function monthName(m: number) { return MONTHS[(m - 1) % 12] ?? String(m) }

function statusIcon(s: string) {
    if (s === 'Sent') return 'mdi-email-check-outline'
    if (s === 'Generated') return 'mdi-check-circle-outline'
    return 'mdi-clock-outline'
}
function statusLabel(s: string) {
    if (s === 'Sent') return 'Wysłana'
    if (s === 'Generated') return 'Wygenerowana'
    return 'Szkic'
}
function paymentStatusIcon(s: string) {
    if (s === 'Completed') return 'mdi-check-circle-outline'
    if (s === 'Failed') return 'mdi-close-circle-outline'
    if (s === 'Refunded') return 'mdi-cash-refund'
    if (s === 'Cancelled') return 'mdi-cancel'
    return 'mdi-clock-outline'
}
function paymentStatusLabel(s: string) {
    const m: Record<string, string> = { Pending: 'Oczekująca', Completed: 'Opłacona', Failed: 'Nieudana', Cancelled: 'Anulowana', Refunded: 'Zwrócona' }
    return m[s] ?? s
}
function serviceLabel(t: string) {
    const m: Record<string, string> = { Top: 'Pozycja TOP', Premium: 'Premium', Featured: 'Wyróżnienie', Refresh: 'Odświeżenie', Other: 'Inna usługa' }
    return m[t] ?? t
}
</script>

<style lang="scss" scoped>
.invoices-page {
    background: $bg;
    min-height: 100vh;
    padding-top: $nav-height;
    padding-bottom: 60px;
}

.container { @include container; }

.page-header {
    padding: 32px 0 20px;
}

.page-title { font-size: 26px; font-weight: 900; color: $text; margin: 0 0 6px; }
.page-sub { font-size: 14px; color: $text-dim; margin: 0; }

.inv-tabs {
    display: flex;
    border-bottom: 1px solid $border;
    margin-bottom: 24px;
    gap: 4px;
}

.inv-tab {
    display: flex;
    align-items: center;
    gap: 7px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: $text-dim;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 12px 16px;
    cursor: pointer;
    margin-bottom: -1px;
    transition: color 0.2s;
    &:hover { color: $text; }
    &.active { color: $text; border-bottom-color: $red; }
}

.invoices-list { display: flex; flex-direction: column; gap: 12px; }

.invoice-card {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    overflow: hidden;
    transition: border-color 0.2s;
    &:hover { border-color: #2a2a2a; }
}

.inv-card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid $border;
    flex-wrap: wrap;
}

.inv-number {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 15px;
    font-weight: 700;
    color: $text;
    flex: 1;
    min-width: 0;
}

.inv-icon { color: $red; flex-shrink: 0; }
.inv-period { font-size: 13px; color: $text-dim; white-space: nowrap; }

.inv-status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    white-space: nowrap;

    &.status-sent { background: rgba(45,122,58,0.12); color: #4caf50; }
    &.status-generated { background: rgba(41,128,185,0.12); color: #5dade2; }
    &.status-draft { background: rgba(255,152,0,0.12); color: #ff9800; }
}

.inv-amounts {
    display: flex;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    gap: 0;
}

.inv-amount-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding-right: 16px;
    border-right: 1px solid $border;
    &:last-child {
        border-right: none;
        padding-right: 0;
        padding-left: 16px;
        flex: initial;
        align-items: flex-end;
    }
}

.ia-label { font-size: 11px; color: $text-dark; }
.ia-val { font-size: 14px; font-weight: 600; color: $text; }
.ia-val-total { font-size: 18px; font-weight: 900; color: $red; }

.inv-items {
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
}

.inv-items-title {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
}

.inv-item-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    font-size: 13px;
    &:last-child { border-bottom: none; }
}

.iir-desc { flex: 1; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.iir-type { color: $text; font-weight: 600; }
.iir-dur { font-size: 11px; color: $text-dark; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; }
.iir-date { color: $text-dim; font-size: 12px; white-space: nowrap; }
.iir-amount { color: $text; font-weight: 700; white-space: nowrap; }

.inv-billing {
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
}

.inv-billing-title {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}

.inv-billing-data {
    font-size: 12px;
    color: $text-muted;
    line-height: 1.7;
}

.inv-card-actions {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
}

.inv-action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
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
    &:hover { background: rgba(255,255,255,0.08); color: $text; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// Payments table
.payments-table-wrap {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    overflow: hidden;
    overflow-x: auto;
}

.pt-header {
    display: grid;
    grid-template-columns: 100px 1fr 80px 90px 130px 1fr;
    gap: 8px;
    padding: 12px 16px;
    background: #0d0d0d;
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid $border;
    min-width: 640px;
}

.pt-row {
    display: grid;
    grid-template-columns: 100px 1fr 80px 90px 130px 1fr;
    gap: 8px;
    padding: 12px 16px;
    font-size: 13px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    align-items: center;
    min-width: 640px;
    &:last-child { border-bottom: none; }
    &:hover { background: rgba(255,255,255,0.02); }
}

.pt-date { color: $text-dim; font-size: 12px; }
.pt-service { color: $text; font-weight: 600; }
.pt-dur { color: $text-dim; font-size: 12px; }
.pt-amount { color: $text; font-weight: 700; }

.pt-status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 20px;
    width: fit-content;

    &.pstatus-completed { background: rgba(45,122,58,0.12); color: #4caf50; }
    &.pstatus-pending { background: rgba(255,152,0,0.12); color: #ff9800; }
    &.pstatus-failed { background: rgba(231,76,60,0.12); color: #e74c3c; }
    &.pstatus-cancelled { background: rgba(100,100,100,0.12); color: $text-dim; }
    &.pstatus-refunded { background: rgba(41,128,185,0.12); color: #5dade2; }
}

.pt-txid { font-size: 11px; color: $text-dark; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

// States
.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px;
    color: $text-dim;
    font-size: 14px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 60px 20px;
    gap: 14px;
    .v-icon { color: $text-dark; }
}

.empty-title { font-size: 18px; font-weight: 700; color: $text-muted; }
.empty-sub { font-size: 14px; color: $text-dim; max-width: 380px; line-height: 1.6; margin: 0; }

.btn-red {
    display: flex;
    align-items: center;
    gap: 7px;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 13px;
    font-weight: 700;
    padding: 11px 22px;
    cursor: pointer;
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 20px;
}

.page-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #080808;
    border: 1px solid $border;
    color: $text-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
    &:hover:not(:disabled) { background: #111; color: $text; }
    &:disabled { opacity: 0.3; cursor: default; }
}

.page-info { font-size: 13px; color: $text-dim; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
