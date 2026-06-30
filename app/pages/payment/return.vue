<template>
    <div class="return-page">
        <div class="return-card">
            <NuxtLink to="/" class="return-logo"><img src="/carizo-logo.svg" alt="CARIZO" /></NuxtLink>

            <!-- ── SUCCESS ── -->
            <template v-if="status === 'success'">
                <div class="confetti-ring">
                    <span v-for="i in 10" :key="i" class="cr-dot" :style="{ '--i': i }" />
                </div>
                <div class="icon-wrap icon-success">
                    <v-icon icon="mdi-check-circle" size="52" />
                </div>
                <h1 class="return-title">Płatność zakończona<br>pomyślnie!</h1>
                <p class="return-desc">
                    <template v-if="eventId">
                        Twoje wydarzenie zostało wyróżnione.<br>
                    </template>
                    <template v-else>
                        Twoje ogłoszenie zostało objęte promocją.<br>
                    </template>
                    Faktura zostanie wysłana na Twój adres e-mail.
                </p>

                <!-- Invoice info -->
                <div class="invoice-status invoice-pending">
                    <v-icon icon="mdi-receipt-outline" size="16" />
                    Faktura zbiorcza zostanie wygenerowana 1. dnia następnego miesiąca i wysłana na Twój e-mail.
                </div>
                <div v-if="latestInvoice" class="invoice-status invoice-ready">
                    <v-icon icon="mdi-receipt-check-outline" size="16" />
                    Faktura {{ latestInvoice.invoiceNumber }} jest gotowa
                    <button class="inv-dl-btn" :disabled="pdfLoading" @click="downloadInvoicePdf">
                        <v-icon v-if="pdfLoading" icon="mdi-loading" size="14" class="spin" />
                        <v-icon v-else icon="mdi-file-pdf-box" size="14" />
                        Pobierz PDF
                    </button>
                </div>

                <div class="return-actions">
                    <NuxtLink v-if="eventId" :to="`/wydarzenie/${eventId}`" class="btn-red">
                        <v-icon icon="mdi-calendar-star" size="17" />
                        Zobacz wydarzenie
                    </NuxtLink>
                    <NuxtLink v-else-if="advertId" :to="`/advert/${advertId}`" class="btn-red">
                        <v-icon icon="mdi-eye-outline" size="17" />
                        Zobacz ogłoszenie
                    </NuxtLink>
                    <NuxtLink v-if="eventId" to="/wydarzenia" class="btn-outline">
                        <v-icon icon="mdi-calendar-outline" size="15" />
                        Wszystkie wydarzenia
                    </NuxtLink>
                    <NuxtLink v-else to="/my-adverts" class="btn-outline">
                        <v-icon icon="mdi-car-outline" size="15" />
                        Moje ogłoszenia
                    </NuxtLink>
                    <NuxtLink to="/faktury" class="btn-ghost">
                        <v-icon icon="mdi-receipt-outline" size="15" />
                        Moje faktury
                    </NuxtLink>
                </div>
            </template>

            <!-- ── CANCEL ── -->
            <template v-else-if="status === 'cancel'">
                <div class="icon-wrap icon-cancel">
                    <v-icon icon="mdi-close-circle" size="52" />
                </div>
                <h1 class="return-title">Płatność anulowana</h1>
                <p class="return-desc">
                    <template v-if="eventId">
                        Płatność została anulowana. Twoje wydarzenie nie zostało wyróżnione.<br>
                    </template>
                    <template v-else>
                        Płatność została anulowana. Twoje ogłoszenie nie zostało objęte promocją.<br>
                    </template>
                    Możesz spróbować ponownie w dowolnym momencie.
                </p>
                <div class="return-actions">
                    <NuxtLink v-if="eventId" :to="`/promote-event/${eventId}`" class="btn-red">
                        <v-icon icon="mdi-refresh" size="17" />
                        Spróbuj ponownie
                    </NuxtLink>
                    <NuxtLink v-else-if="advertId" :to="`/promote-advert/${advertId}`" class="btn-red">
                        <v-icon icon="mdi-refresh" size="17" />
                        Spróbuj ponownie
                    </NuxtLink>
                    <NuxtLink v-if="eventId" to="/wydarzenia" class="btn-outline">
                        Wszystkie wydarzenia
                    </NuxtLink>
                    <NuxtLink v-else to="/my-adverts" class="btn-outline">
                        Moje ogłoszenia
                    </NuxtLink>
                    <NuxtLink to="/" class="btn-ghost">
                        Strona główna
                    </NuxtLink>
                </div>
            </template>

            <!-- ── PENDING ── -->
            <template v-else>
                <div class="icon-wrap icon-pending">
                    <v-icon icon="mdi-clock-outline" size="52" class="pending-spin" />
                </div>
                <h1 class="return-title">Przetwarzamy płatność</h1>
                <p class="return-desc">
                    Potwierdzenie zostanie wysłane na Twój adres e-mail.<br>
                    Może to potrwać kilka minut.
                </p>
                <div class="return-actions">
                    <NuxtLink to="/my-adverts" class="btn-red">
                        <v-icon icon="mdi-car-outline" size="17" />
                        Moje ogłoszenia
                    </NuxtLink>
                </div>
            </template>

            <div class="return-footer">
                Potrzebujesz pomocy? Skontaktuj się z <NuxtLink to="/pomoc" class="footer-link">obsługą CARIZO</NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { MonthlyInvoice } from '~/types'

useHead({ title: 'Status płatności — CARIZO', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
const route = useRoute()
const { getMyInvoices, generatePdf } = useInvoices()

const status = computed(() => {
    const s = route.query.status as string | undefined
    if (s === 'success') return 'success'
    if (s === 'cancel' || s === 'failure') return 'cancel'
    return 'pending'
})

const advertId = computed(() => route.query.advertId ? Number(route.query.advertId) : null)
const eventId = computed(() => route.query.eventId ? Number(route.query.eventId) : null)

const latestInvoice = ref<MonthlyInvoice | null>(null)
const pdfLoading = ref(false)
const invoicePolling = ref(false)
const pollTimerRef = ref<ReturnType<typeof setTimeout> | null>(null)

onUnmounted(() => { if (pollTimerRef.value) clearTimeout(pollTimerRef.value) })

async function pollForInvoice(attempts = 0) {
    if (attempts >= 6) { invoicePolling.value = false; return }
    try {
        const res = await getMyInvoices(1, 1)
        if (res.items.length > 0 && res.items[0].status !== 'Draft') {
            latestInvoice.value = res.items[0]
            invoicePolling.value = false
            return
        }
    } catch { /* polling failure — retry silently; max 6 attempts */ }
    pollTimerRef.value = setTimeout(() => pollForInvoice(attempts + 1), 3000)
}

async function downloadInvoicePdf() {
    if (!latestInvoice.value) return
    pdfLoading.value = true
    try { await generatePdf(latestInvoice.value) }
    catch { useToast().error('Nie udało się pobrać faktury PDF. Spróbuj ponownie.') }
    finally { pdfLoading.value = false }
}

onMounted(async () => {
    if (status.value === 'success') {
        invoicePolling.value = true
        pollForInvoice()
    }
})
</script>

<style lang="scss" scoped>
.return-page {
    min-height: 100vh;
    background: $bg;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    padding-top: calc(#{$nav-height} + 40px);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse 50% 40% at 50% 0%, rgba($red, 0.05) 0%, transparent 65%);
        pointer-events: none;
    }
}

.return-card {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-xl;
    padding: 48px 40px 32px;
    max-width: 500px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    position: relative;
    animation: card-appear 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) both;

    @include respond-to(sm) { padding: 36px 20px 24px; }
}

@keyframes card-appear {
    from { opacity: 0; transform: scale(0.94) translateY(16px); }
    to   { opacity: 1; transform: scale(1)   translateY(0); }
}

.return-logo {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 5px;
    color: $text;
    text-decoration: none;
    margin-bottom: 4px;
    span { color: $red; }
}

// Confetti ring for success
.confetti-ring {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    width: 140px;
    height: 140px;
    pointer-events: none;
}

.cr-dot {
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    animation: cr-fly 1.4s ease-out calc(var(--i) * 0.07s) both;

    &:nth-child(1)  { background: $red;    --angle: 0deg;   }
    &:nth-child(2)  { background: #ffd700; --angle: 36deg;  }
    &:nth-child(3)  { background: #4caf50; --angle: 72deg;  }
    &:nth-child(4)  { background: #2196f3; --angle: 108deg; }
    &:nth-child(5)  { background: #e91e63; --angle: 144deg; }
    &:nth-child(6)  { background: $red;    --angle: 180deg; }
    &:nth-child(7)  { background: #ffd700; --angle: 216deg; }
    &:nth-child(8)  { background: #4caf50; --angle: 252deg; }
    &:nth-child(9)  { background: #2196f3; --angle: 288deg; }
    &:nth-child(10) { background: #ff5722; --angle: 324deg; }
}

@keyframes cr-fly {
    0%   { opacity: 1; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-70px) scale(0.4); }
}

.icon-wrap {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
}

.icon-success {
    background: rgba(76,175,80,0.1);
    border: 2px solid rgba(76,175,80,0.3);
    color: #4caf50;
    animation: success-pulse 2s ease-in-out infinite;
}

@keyframes success-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(76,175,80,0.2); }
    50%       { box-shadow: 0 0 0 12px rgba(76,175,80,0); }
}

.icon-cancel {
    background: rgba(220,60,60,0.1);
    border: 2px solid rgba(220,60,60,0.25);
    color: #e55;
}

.icon-pending {
    background: rgba(255,152,0,0.1);
    border: 2px solid rgba(255,152,0,0.25);
    color: #ff9800;
}

.pending-spin {
    animation: slow-spin 3s linear infinite;
}

@keyframes slow-spin {
    to { transform: rotate(360deg); }
}

.return-title {
    font-size: 24px;
    font-weight: 900;
    color: $text;
    margin: 0;
    line-height: 1.25;
}

.return-desc {
    font-size: 14px;
    color: $text-dim;
    line-height: 1.8;
    margin: 0;
}

// Invoice status bar
.invoice-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 16px;
    border-radius: $r-sm;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
}

.invoice-pending {
    background: rgba(255,152,0,0.08);
    border: 1px solid rgba(255,152,0,0.2);
    color: #ff9800;
}

.invoice-ready {
    background: rgba(76,175,80,0.08);
    border: 1px solid rgba(76,175,80,0.2);
    color: #4caf50;
}

.inv-dl-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(76,175,80,0.12);
    border: 1px solid rgba(76,175,80,0.3);
    border-radius: $r-sm;
    color: #4caf50;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 5px 12px;
    cursor: pointer;
    transition: background 0.2s;
    margin-left: 6px;
    &:hover { background: rgba(76,175,80,0.2); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.return-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    margin-top: 8px;
}

.btn-red {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: $red;
    border: none;
    border-radius: $r-md;
    color: white;
    font-size: 14px;
    font-weight: 700;
    padding: 14px 24px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.btn-outline {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: $r-md;
    color: $text-muted;
    font-size: 14px;
    font-weight: 500;
    padding: 12px 20px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: rgba(255,255,255,0.25); color: $text; }
}

.btn-ghost {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: transparent;
    border: none;
    color: $text-dark;
    font-size: 13px;
    font-weight: 500;
    padding: 8px 16px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    text-decoration: none;
    transition: color 0.2s;
    &:hover { color: $text-muted; }
}

.return-footer {
    font-size: 12px;
    color: $text-dark;
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
    width: 100%;
}

.footer-link {
    color: $red;
    &:hover { text-decoration: underline; }
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
