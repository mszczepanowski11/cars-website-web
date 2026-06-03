<script setup lang="ts">
const { isPremiereActive, isPremiereUpcoming, remainingToEnd, remainingToStart, pad } = usePromotion()

const countdown = computed(() =>
    isPremiereActive.value ? remainingToEnd.value : remainingToStart.value
)
</script>

<template>
    <div v-if="isPremiereActive || isPremiereUpcoming" class="ann-bar" :class="{ 'ann-bar--upcoming': isPremiereUpcoming }">
        <div class="ann-inner">
            <span class="ann-badge">
                <v-icon icon="mdi-rocket-launch-outline" size="14" />
                {{ isPremiereUpcoming ? 'NADCHODZI PREMIERA' : 'PREMIERA CARIZO' }}
            </span>
            <span class="ann-text">
                {{ isPremiereUpcoming
                    ? 'Promowanie ofert za darmo 12–14 czerwca!'
                    : 'Promowanie ofert za darmo przez czas trwania premiery!' }}
            </span>
            <span class="ann-countdown">
                {{ isPremiereUpcoming ? 'Premiera za:' : 'Pozostało:' }}
                <strong>{{ countdown.d }} {{ countdown.d === 1 ? 'dzień' : 'dni' }}</strong>
                <strong>{{ pad(countdown.h) }} godz.</strong>
                <strong>{{ pad(countdown.m) }} min.</strong>
                <strong>{{ pad(countdown.s) }} sek.</strong>
            </span>
            <NuxtLink to="/promote" class="ann-link">
                Dowiedz się więcej
                <v-icon icon="mdi-chevron-right" size="14" />
            </NuxtLink>
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

    &--upcoming {
        background: #04040a;
        border-bottom-color: rgba($red, 0.25);
    }
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

    .ann-bar--upcoming & {
        background: rgba($red, 0.15);
        border-color: rgba($red, 0.35);
        color: $red;
    }
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

.ann-link {
    display: flex;
    align-items: center;
    gap: 3px;
    color: $red;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    transition: opacity 0.2s;

    &:hover { opacity: 0.8; }

    .ann-bar--upcoming & { color: $red; }

    @include respond-to(sm) { display: none; }
}
</style>
