<script setup lang="ts">
const props = defineProps<{
    vinVerified?: boolean
    phoneVerified?: boolean
    serviceHistory?: boolean
    mileageVerified?: boolean
    sellerVerified?: boolean
    compact?: boolean
}>()

const items = computed(() => [
    { key: 'vin',     label: 'VIN zweryfikowany',        icon: 'mdi-identifier',             verified: props.vinVerified },
    { key: 'phone',   label: 'Numer telefonu',            icon: 'mdi-phone-check-outline',    verified: props.phoneVerified },
    { key: 'service', label: 'Historia serwisowa',        icon: 'mdi-clipboard-check-outline',verified: props.serviceHistory },
    { key: 'mileage', label: 'Przebieg zweryfikowany',    icon: 'mdi-speedometer-medium',     verified: props.mileageVerified },
    { key: 'seller',  label: 'Sprzedawca zweryfikowany',  icon: 'mdi-account-check-outline',  verified: props.sellerVerified },
])

const anyVerified = computed(() => items.value.some(i => i.verified))
const allVerified = computed(() => items.value.every(i => i.verified))
</script>

<template>
    <div v-if="anyVerified" class="cv" :class="{ 'cv--compact': compact }">
        <div class="cv-header">
            <v-icon icon="mdi-shield-check" size="16" class="cv-shield" />
            <span class="cv-title">CARIZO VERIFIED</span>
            <span v-if="allVerified" class="cv-all-badge">PREMIUM</span>
        </div>
        <div class="cv-items">
            <div
                v-for="item in items"
                :key="item.key"
                class="cv-item"
                :class="{ 'cv-item--on': item.verified, 'cv-item--off': !item.verified }"
            >
                <v-icon :icon="item.icon" size="14" class="cv-item-icon" />
                <span class="cv-item-label">{{ item.label }}</span>
                <v-icon
                    v-if="item.verified"
                    icon="mdi-check-circle"
                    size="13"
                    class="cv-item-check"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.cv {
    background: rgba(34, 197, 94, 0.06);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: $r-md;
    padding: 14px 16px;

    &--compact {
        padding: 10px 12px;
    }
}

.cv-header {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 12px;

    .cv--compact & { margin-bottom: 8px; }
}

.cv-shield { color: #22c55e; flex-shrink: 0; }

.cv-title {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #22c55e;
    flex: 1;
}

.cv-all-badge {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.8px;
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.35);
    border-radius: 4px;
    padding: 2px 7px;
}

.cv-items {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .cv--compact & { gap: 4px; }
}

.cv-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;

    &--on {
        color: $text-muted;
        .cv-item-icon { color: #22c55e; }
    }

    &--off {
        color: $text-dark;
        opacity: 0.5;
        .cv-item-icon { color: $text-dark; }
    }

    .cv--compact & { font-size: 11px; }
}

.cv-item-label { flex: 1; }

.cv-item-check { color: #22c55e; flex-shrink: 0; }
</style>
