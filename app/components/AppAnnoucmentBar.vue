<script setup lang="ts">
const PROMO_DURATION_HOURS = 72
const LAUNCH_KEY = 'carizo_launch_ts'

function getLaunchTs(): number {
    if (import.meta.server) return Date.now()
    const stored = localStorage.getItem(LAUNCH_KEY)
    if (stored) return Number(stored)
    const ts = Date.now()
    localStorage.setItem(LAUNCH_KEY, String(ts))
    return ts
}

const remaining = ref({ d: 0, h: 0, m: 0, s: 0 })
const expired = ref(false)

function tick() {
    const end = getLaunchTs() + PROMO_DURATION_HOURS * 3600 * 1000
    const diff = Math.max(0, end - Date.now())
    if (diff === 0) { expired.value = true; return }
    remaining.value = {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
    }
}

let timer: ReturnType<typeof setInterval>
onMounted(() => { tick(); timer = setInterval(tick, 1000) })
onUnmounted(() => clearInterval(timer))

const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
    <div v-if="!expired" class="ann-bar">
        <div class="ann-inner">
            <span class="ann-badge">
                <v-icon icon="mdi-rocket-launch-outline" size="14" />
                PREMIERA CARIZO
            </span>
            <span class="ann-text">Promowanie ofert za darmo przez pierwsze 72 godziny!</span>
            <span class="ann-countdown">
                Pozostało:
                <strong>{{ remaining.d }} dni</strong>
                <strong>{{ pad(remaining.h) }} godz.</strong>
                <strong>{{ pad(remaining.m) }} min.</strong>
                <strong>{{ pad(remaining.s) }} sek.</strong>
            </span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.ann-bar {
    width: 100%;
    background: #0a0000;
    border-bottom: 1px solid rgba($red, 0.25);
    padding: 9px 0;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
}
.ann-inner {
    @include container;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
    @include respond-to(sm) { gap: 8px; font-size: 11px; }
}
.ann-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba($red, 0.2);
    border: 1px solid rgba($red, 0.4);
    color: $red;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    padding: 3px 10px;
    border-radius: 20px;
    white-space: nowrap;
}
.ann-text {
    color: $text-muted;
    font-size: 13px;
    @include respond-to(sm) { display: none; }
}
.ann-countdown {
    color: $text-muted;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    strong { color: $text; font-weight: 600; }
}
</style>