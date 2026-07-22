<template>
    <Transition name="cp-slide">
        <div v-if="compared.length > 0" class="compare-panel">
            <div class="cp-inner">
                <div class="cp-items">
                    <div v-for="id in compared" :key="id" class="cp-item">
                        <span class="cp-id">#{{ id }}</span>
                        <button class="cp-remove" :aria-label="$t('cCompare.removeAria', { id })" @click="toggle(id)">
                            <v-icon icon="mdi-close" size="14" />
                        </button>
                    </div>
                    <div v-for="_ in (MAX_COMPARE - compared.length)" :key="'empty' + _" class="cp-item cp-item--empty">
                        <v-icon icon="mdi-plus" size="16" class="cp-plus" />
                        <span>{{ $t('cCompare.addEmpty') }}</span>
                    </div>
                </div>
                <div class="cp-actions">
                    <NuxtLink to="/compare" class="cp-btn-cmp">
                        <v-icon icon="mdi-compare" size="15" />
                        {{ $t('cCompare.compareBtn', { count: compared.length }) }}
                    </NuxtLink>
                    <button class="cp-btn-clear" @click="clear">
                        <v-icon icon="mdi-trash-can-outline" size="14" />
                        {{ $t('cCompare.clear') }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
const { compared, toggle, clear, MAX_COMPARE } = useCompare()
</script>

<style lang="scss" scoped>
.compare-panel {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 900;
    background: #0d0d0d;
    border-top: 1px solid rgba($red, 0.35);
    padding: 12px 20px;
    box-shadow: 0 -4px 24px rgba($red, 0.12);
}

.cp-inner {
    max-width: $container-max;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.cp-items {
    display: flex;
    gap: 10px;
    flex: 1;
}

.cp-item {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #141414;
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 6px 10px;
    font-size: 12px;
    color: $text-muted;

    &--empty {
        border-style: dashed;
        color: $text-dark;
        .cp-plus { color: $text-dark; }
    }
}

.cp-id { font-weight: 600; color: $text; }

.cp-remove {
    background: transparent;
    border: none;
    cursor: pointer;
    color: $text-dark;
    display: flex;
    padding: 0;
    transition: color 0.15s;
    &:hover { color: $red; }
}

.cp-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.cp-btn-cmp {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: $red;
    color: #fff;
    padding: 8px 16px;
    border-radius: $r-sm;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.cp-btn-clear {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-dark;
    font-size: 12px;
    padding: 7px 12px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;
    &:hover { border-color: $red; color: $red; }
}

.cp-slide-enter-active, .cp-slide-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.cp-slide-enter-from, .cp-slide-leave-to { transform: translateY(100%); opacity: 0; }
</style>
