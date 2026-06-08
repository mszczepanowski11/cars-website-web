<template>
    <div class="promote-page">

        <div class="promo-topbar">
            <div class="tl-logo">CARI<span>ZO</span></div>
            <div class="promo-steps">
                <span class="ps done"><v-icon icon="mdi-check" size="14" />Ogłoszenie</span>
                <span class="ps-sep" />
                <span class="ps active"><v-icon icon="mdi-star-outline" size="14" />Promocja</span>
                <span class="ps-sep" />
                <span class="ps"><v-icon icon="mdi-check-circle-outline" size="14" />Potwierdzenie</span>
            </div>
            <button class="skip-link" @click="skipPromotion">
                Pomiń i opublikuj bez promocji
                <v-icon icon="mdi-arrow-right" size="15" />
            </button>
        </div>

        <div class="promo-body">
            <div class="promo-hero">
                <h1>Wyróżnij swoje ogłoszenie</h1>
                <p>Wybierz pakiet promocji i sprzedaj szybciej. Możesz też opublikować bez promocji za darmo.</p>
            </div>

            <div class="plans-grid">
                <!-- Free option -->
                <div class="plan-card plan-free" :class="{ selected: selected === 'free' }" @click="selected = 'free'">
                    <div class="plan-header">
                        <div class="plan-icon"><v-icon icon="mdi-car-outline" size="26" /></div>
                        <div class="plan-name">Podstawowe</div>
                        <div class="plan-badge plan-badge-free">DARMOWE</div>
                    </div>
                    <div class="plan-price">0 zł</div>
                    <div class="plan-desc">Standardowe ogłoszenie w wynikach wyszukiwania.</div>
                    <ul class="plan-features">
                        <li><v-icon icon="mdi-check" size="14" />Widoczne w wynikach</li>
                        <li><v-icon icon="mdi-check" size="14" />30 dni aktywności</li>
                        <li class="disabled"><v-icon icon="mdi-close" size="14" />Brak wyróżnienia</li>
                    </ul>
                    <div class="plan-sel-indicator" />
                </div>

                <!-- TOP -->
                <div v-for="plan in plans" :key="plan.key"
                    class="plan-card"
                    :class="[`plan-${plan.key}`, { selected: selected === plan.key, 'plan-popular': plan.popular }]"
                    @click="selected = plan.key; selectedDays = plan.defaultDays">
                    <div v-if="plan.popular" class="popular-badge">NAJPOPULARNIEJSZY</div>
                    <div class="plan-header">
                        <div class="plan-icon"><v-icon :icon="plan.icon" size="26" /></div>
                        <div class="plan-name">{{ plan.name }}</div>
                    </div>
                    <div class="plan-price">
                        od <strong>{{ plan.priceFrom }} zł</strong>
                    </div>
                    <div class="plan-desc">{{ plan.desc }}</div>
                    <ul class="plan-features">
                        <li v-for="f in plan.feats" :key="f"><v-icon icon="mdi-check" size="14" />{{ f }}</li>
                    </ul>
                    <div v-if="selected === plan.key" class="days-select">
                        <button v-for="d in plan.days" :key="d"
                            class="day-btn" :class="{ active: selectedDays === d }"
                            @click.stop="selectedDays = d">
                            {{ d }} dni
                        </button>
                    </div>
                    <div class="plan-sel-indicator" />
                </div>
            </div>

            <!-- Selected summary + CTA -->
            <div class="promo-footer">
                <div v-if="selected === 'free'" class="summary-free">
                    <v-icon icon="mdi-check-circle-outline" size="20" class="sf-icon" />
                    Opublikujesz ogłoszenie bez promocji (darmowe)
                </div>
                <div v-else class="summary-paid">
                    <div class="summary-name">{{ selectedPlan?.name }} – {{ selectedDays }} dni</div>
                    <div class="summary-price">{{ selectedPrice?.toFixed(2) }} zł</div>
                </div>
                <div class="footer-actions">
                    <button class="btn-skip" @click="skipPromotion">
                        <v-icon icon="mdi-arrow-left" size="15" />Wróć
                    </button>
                    <button v-if="selected === 'free'" class="btn-publish" :disabled="publishing" @click="publishFree">
                        <v-icon v-if="publishing" icon="mdi-loading" size="16" class="spin" />
                        <v-icon v-else icon="mdi-check" size="16" />
                        Opublikuj ogłoszenie
                    </button>
                    <button v-else class="btn-pay" :disabled="paying" @click="initiatePayment">
                        <v-icon v-if="paying" icon="mdi-loading" size="16" class="spin" />
                        <v-icon v-else icon="mdi-credit-card-outline" size="16" />
                        Zapłać {{ selectedPrice?.toFixed(2) }} zł
                    </button>
                </div>
                <div v-if="actionError" class="action-error">
                    <v-icon icon="mdi-alert-circle-outline" size="15" />{{ actionError }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const advertId = computed(() => Number(route.params.id))

const selected = ref<string>('free')
const selectedDays = ref(7)
const publishing = ref(false)
const paying = ref(false)
const actionError = ref('')

const plans = [
    {
        key: 'Featured', name: 'Wyróżnienie', icon: 'mdi-star-outline',
        priceFrom: 14.99, popular: false, defaultDays: 7, days: [7, 14, 30],
        desc: 'Ogłoszenie wyróżnione w wynikach wyszukiwania.',
        feats: ['Wyróżniony kolor ramki', 'Oznaczenie WYRÓŻNIONE', '2× więcej wyświetleń'],
        prices: { 7: 14.99, 14: 24.99, 30: 39.99 },
    },
    {
        key: 'Top', name: 'TOP', icon: 'mdi-crown-outline',
        priceFrom: 19.99, popular: true, defaultDays: 7, days: [7, 14, 30],
        desc: 'Ogłoszenie na szczycie wyników wyszukiwania.',
        feats: ['Pozycja TOP w wynikach', 'Baner reklamowy', '5× więcej wyświetleń'],
        prices: { 7: 19.99, 14: 29.99, 30: 49.99 },
    },
    {
        key: 'Premium', name: 'Premium', icon: 'mdi-diamond-outline',
        priceFrom: 29.99, popular: false, defaultDays: 7, days: [7, 14, 30],
        desc: 'Maksymalna widoczność i priorytetowe pozycjonowanie.',
        feats: ['Wszystko z TOP', 'Sekcja polecane ogłoszenia', 'Priorytetowe wsparcie'],
        prices: { 7: 29.99, 14: 44.99, 30: 79.99 },
    },
    {
        key: 'Refresh', name: 'Odświeżenie', icon: 'mdi-refresh',
        priceFrom: 4.99, popular: false, defaultDays: 1, days: [1],
        desc: 'Przesuń ogłoszenie na górę listy – jednorazowo.',
        feats: ['Awans na szczyt listy', 'Nowa data publikacji'],
        prices: { 1: 4.99 },
    },
]

const selectedPlan = computed(() => plans.find(p => p.key === selected.value))
const selectedPrice = computed(() => {
    if (!selectedPlan.value) return null
    return (selectedPlan.value.prices as Record<number, number>)[selectedDays.value] ?? selectedPlan.value.priceFrom
})

async function skipPromotion() {
    await navigateTo('/my-adverts')
}

async function publishFree() {
    publishing.value = true
    actionError.value = ''
    try {
        await navigateTo('/my-adverts')
    } finally {
        publishing.value = false
    }
}

async function initiatePayment() {
    if (!selectedPlan.value || !selectedPrice.value) return
    paying.value = true
    actionError.value = ''
    try {
        const result = await $fetch<{ paymentUrl: string }>('/api/proxy/api/Payment/initiate', {
            method: 'POST',
            body: {
                advertId: advertId.value,
                serviceType: selectedPlan.value.key,
                durationDays: selectedDays.value,
            }
        })
        if (result.paymentUrl) {
            window.location.href = result.paymentUrl
        }
    } catch (e: any) {
        actionError.value = e?.data?.message ?? 'Błąd podczas inicjowania płatności.'
    } finally {
        paying.value = false
    }
}
</script>

<style lang="scss" scoped>
.promote-page { min-height: 100vh; background: $bg; color: $text; font-family: 'Inter', sans-serif; }

.promo-topbar {
    height: 60px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; border-bottom: 1px solid $border; background: #070707; position: sticky; top: 0; z-index: 10;
}

.tl-logo { font-size: 20px; font-weight: 900; color: $text; letter-spacing: 4px; span { color: $red; } }

.promo-steps { display: flex; align-items: center; gap: 10px; font-size: 13px; }

.ps {
    display: flex; align-items: center; gap: 5px; color: $text-dark; font-weight: 500;
    &.done { color: #4caf50; }
    &.active { color: $text; font-weight: 700; }
}

.ps-sep { width: 24px; height: 1px; background: $border; }

.skip-link {
    display: flex; align-items: center; gap: 6px; background: transparent; border: none;
    color: $text-dim; font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif;
    transition: color 0.2s; &:hover { color: $text; }
}

.promo-body { max-width: 1100px; margin: 0 auto; padding: 40px 24px 80px; }

.promo-hero { text-align: center; margin-bottom: 40px; h1 { font-size: 28px; font-weight: 900; margin-bottom: 8px; } p { font-size: 14px; color: $text-dim; } }

.plans-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 32px; @media (max-width: 900px) { grid-template-columns: 1fr 1fr; } @media (max-width: 600px) { grid-template-columns: 1fr; } }

.plan-card {
    background: #0a0a0a; border: 1.5px solid $border; border-radius: 12px; padding: 22px 18px;
    cursor: pointer; position: relative; transition: border-color 0.2s, transform 0.2s;
    display: flex; flex-direction: column; gap: 10px;
    &:hover { border-color: rgba($red, 0.3); transform: translateY(-3px); }
    &.selected { border-color: $red; background: rgba($red, 0.04); }
    &.plan-popular { border-color: rgba($red, 0.4); }
}

.popular-badge {
    position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
    background: $red; color: white; font-size: 10px; font-weight: 800; padding: 3px 10px;
    border-radius: 20px; white-space: nowrap; letter-spacing: 0.5px;
}

.plan-header { display: flex; align-items: center; gap: 10px; }
.plan-icon { color: $red; }
.plan-name { font-size: 16px; font-weight: 800; color: $text; }
.plan-badge-free { font-size: 10px; font-weight: 800; color: #4caf50; background: rgba(76,175,80,0.12); border: 1px solid rgba(76,175,80,0.3); padding: 2px 8px; border-radius: 20px; margin-left: auto; }
.plan-price { font-size: 22px; font-weight: 900; color: $red; strong { font-size: 26px; } }
.plan-desc { font-size: 12px; color: $text-dim; line-height: 1.5; }

.plan-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; flex: 1;
    li { display: flex; align-items: center; gap: 7px; font-size: 12px; color: $text-muted;
        .v-icon { color: #4caf50; }
        &.disabled { color: $text-dark; .v-icon { color: $text-dark; } }
    }
}

.days-select { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }

.day-btn {
    background: transparent; border: 1px solid $border; border-radius: 6px; color: $text-dim;
    font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif; padding: 5px 12px; cursor: pointer;
    transition: all 0.15s;
    &.active { border-color: $red; background: rgba($red, 0.12); color: $text; }
    &:hover:not(.active) { border-color: $text-dim; color: $text; }
}

.plan-sel-indicator {
    height: 3px; border-radius: 3px; background: transparent; margin-top: auto;
    .selected & { background: $red; }
}

.promo-footer {
    background: #0a0a0a; border: 1px solid $border; border-radius: 12px; padding: 20px 24px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}

.summary-free { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #4caf50; font-weight: 500; .sf-icon { flex-shrink: 0; } }
.summary-paid { display: flex; flex-direction: column; gap: 2px; }
.summary-name { font-size: 14px; font-weight: 700; color: $text; }
.summary-price { font-size: 22px; font-weight: 900; color: $red; }

.footer-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }

.btn-skip {
    display: flex; align-items: center; gap: 6px; background: transparent;
    border: 1px solid $border; border-radius: 8px; color: $text-muted; font-size: 13px;
    font-weight: 600; font-family: 'Inter', sans-serif; padding: 11px 20px; cursor: pointer;
    transition: border-color 0.2s, color 0.2s; &:hover { border-color: $text-dim; color: $text; }
}

.btn-publish {
    display: flex; align-items: center; gap: 7px; background: #2d7a3a;
    border: none; border-radius: 8px; color: white; font-size: 14px; font-weight: 700;
    font-family: 'Inter', sans-serif; padding: 11px 24px; cursor: pointer; transition: opacity 0.2s;
    &:hover:not(:disabled) { opacity: 0.9; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-pay {
    display: flex; align-items: center; gap: 7px; background: $red;
    border: none; border-radius: 8px; color: white; font-size: 14px; font-weight: 700;
    font-family: 'Inter', sans-serif; padding: 11px 24px; cursor: pointer; transition: opacity 0.2s;
    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.action-error { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #e55; margin-top: 8px; width: 100%; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
