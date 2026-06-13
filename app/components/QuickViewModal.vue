<template>
    <Teleport to="body">
        <Transition name="qv-fade">
            <div v-if="modelValue" class="qv-overlay" @click.self="$emit('update:modelValue', false)">
                <div class="qv-modal">
                    <button class="qv-close" @click="$emit('update:modelValue', false)">
                        <v-icon icon="mdi-close" size="20" />
                    </button>

                    <div v-if="loading" class="qv-loading">
                        <v-icon icon="mdi-loading" size="32" class="spin" />
                    </div>

                    <template v-else-if="advert">
                        <div class="qv-img-wrap">
                            <img :src="mainImg" :alt="advert.title" class="qv-img" />
                            <span v-if="resolvedBadge" :class="['qv-badge', `qv-badge--${resolvedBadge.toLowerCase()}`]">
                                <v-icon v-if="resolvedBadge === 'TOP'" icon="mdi-crown" size="10" />
                                {{ badgeLabel }}
                            </span>
                            <span v-if="isNew" class="qv-badge qv-badge--new">NOWE</span>
                        </div>
                        <div class="qv-body">
                            <h2 class="qv-title">{{ advert.title }}</h2>
                            <div class="qv-price">{{ Number(advert.price).toLocaleString('pl') }} zł</div>
                            <div class="qv-chips">
                                <span class="qv-chip"><v-icon icon="mdi-calendar-outline" size="13" />{{ advert.year }}</span>
                                <span class="qv-chip"><v-icon icon="mdi-speedometer" size="13" />{{ Number(advert.mileage).toLocaleString('pl') }} km</span>
                                <span v-if="advert.fuelType" class="qv-chip"><v-icon icon="mdi-gas-station-outline" size="13" />{{ advert.fuelType.name }}</span>
                                <span v-if="advert.gearbox" class="qv-chip"><v-icon icon="mdi-cog-outline" size="13" />{{ advert.gearbox.name }}</span>
                                <span v-if="advert.engineVersion?.horsepower" class="qv-chip"><v-icon icon="mdi-lightning-bolt" size="13" />{{ advert.engineVersion.horsepower }} KM</span>
                            </div>
                            <p v-if="advert.description" class="qv-desc">{{ advert.description.slice(0, 200) }}{{ advert.description.length > 200 ? '…' : '' }}</p>
                            <div class="qv-location" v-if="advert.city">
                                <v-icon icon="mdi-map-marker-outline" size="14" />{{ advert.city }}
                            </div>
                            <div class="qv-actions">
                                <NuxtLink :to="`/advert/${advert.id}`" class="qv-btn-primary" @click="$emit('update:modelValue', false)">
                                    <v-icon icon="mdi-arrow-right-circle-outline" size="16" />
                                    Zobacz ogłoszenie
                                </NuxtLink>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import type { CarAdvert } from '~/types'
const props = defineProps<{ modelValue: boolean; advertId: number | null }>()
defineEmits(['update:modelValue'])

const { getImageUrl, placeholder } = useImageUrl()
const advert = ref<CarAdvert | null>(null)
const loading = ref(false)

const mainImg = computed(() => {
    const img = advert.value?.images?.find(i => i.isMain) ?? advert.value?.images?.[0]
    return getImageUrl(img?.url, placeholder)
})

const resolvedBadge = computed(() => {
    if (!advert.value) return null
    if (advert.value.badge) return advert.value.badge
    if (advert.value.sellerType === 'dealer') return 'DEALER'
    return null
})

const badgeLabel = computed(() => {
    const map: Record<string, string> = { PREMIUM: 'PREMIUM', TOP: 'TOP', FEATURED: 'WYRÓŻNIONE', DEALER: 'DEALER', VERIFIED: 'VERIFIED' }
    return resolvedBadge.value ? (map[resolvedBadge.value] ?? resolvedBadge.value) : null
})

const isNew = computed(() => {
    if (!advert.value?.createdAt) return false
    return Date.now() - new Date(advert.value.createdAt).getTime() < 24 * 60 * 60 * 1000
})

watch(() => props.advertId, async (id) => {
    if (!id || !props.modelValue) return
    loading.value = true
    advert.value = null
    try {
        advert.value = await $fetch<CarAdvert>(`/api/proxy/api/Advert/${id}`)
    } finally {
        loading.value = false
    }
}, { immediate: true })

watch(() => props.modelValue, (open) => {
    if (open && props.advertId && !advert.value) {
        // trigger re-fetch if needed
    }
})

onMounted(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') defineEmits['update:modelValue']?.(false) }
    window.addEventListener('keydown', onKey)
    onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
})
</script>

<style lang="scss" scoped>
.qv-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.72);
    backdrop-filter: blur(6px);
    z-index: 1200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.qv-modal {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-xl;
    width: 100%;
    max-width: 780px;
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    gap: 0;
    position: relative;

    @include respond-to(sm) {
        flex-direction: column;
        max-height: 92vh;
    }
}

.qv-close {
    position: absolute;
    top: 14px; right: 14px;
    width: 32px; height: 32px;
    border-radius: 50%;
    border: 1px solid $border;
    background: rgba(0,0,0,0.6);
    color: $text-muted;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    z-index: 2;
    transition: all 0.2s;
    &:hover { background: rgba($red, 0.15); color: $red; border-color: $red; }
}

.qv-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
    width: 100%;
    .v-icon { color: $red; }
}

.qv-img-wrap {
    position: relative;
    flex-shrink: 0;
    width: 340px;

    @include respond-to(sm) { width: 100%; }
}

.qv-img {
    width: 100%;
    height: 100%;
    min-height: 260px;
    object-fit: cover;
    border-radius: $r-xl 0 0 $r-xl;

    @include respond-to(sm) {
        height: 220px;
        border-radius: $r-xl $r-xl 0 0;
    }
}

.qv-badge {
    position: absolute;
    top: 12px; left: 12px;
    font-size: 10px; font-weight: 800; letter-spacing: 0.8px;
    padding: 4px 10px;
    border-radius: 6px;
    display: inline-flex; align-items: center; gap: 4px;

    &--top    { background: rgba(#f5a623,0.18); color: #f5a623; border: 1px solid rgba(#f5a623,0.4); }
    &--premium { background: $red; color: #fff; }
    &--new    { background: #14532d; color: #4ade80; border: 1px solid rgba(#4ade80,0.3); top: auto; bottom: 12px; }
    &--dealer { background: rgba(#3b82f6,0.15); color: #60a5fa; border: 1px solid rgba(#60a5fa,0.3); }
    &--featured { background: rgba($red,0.18); color: #ff6b6b; border: 1px solid rgba($red,0.45); }
}

.qv-body {
    flex: 1;
    padding: 28px 28px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    @include respond-to(sm) { padding: 20px; }
}

.qv-title {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.3;
    padding-right: 32px;
}

.qv-price {
    font-size: 26px;
    font-weight: 800;
    color: $red;
}

.qv-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.qv-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #141414;
    border: 1px solid $border;
    border-radius: 8px;
    font-size: 12px;
    color: $text-muted;
    padding: 4px 10px;
    .v-icon { color: $text-dark; }
}

.qv-desc {
    font-size: 13px;
    color: $text-dim;
    line-height: 1.5;
    margin: 0;
    flex: 1;
}

.qv-location {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: $text-dark;
}

.qv-actions { margin-top: auto; }

.qv-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: $red;
    color: #fff;
    padding: 10px 20px;
    border-radius: $r-sm;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

// Transition
.qv-fade-enter-active, .qv-fade-leave-active { transition: opacity 0.2s ease; }
.qv-fade-enter-from, .qv-fade-leave-to { opacity: 0; }

.spin { animation: spin 1s linear infinite; color: $red; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
