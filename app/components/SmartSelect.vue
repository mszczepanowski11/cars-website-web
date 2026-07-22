<template>
    <div class="ss-wrap" :class="{ open: isOpen }" ref="wrapRef">
        <div class="ss-trigger" @click="toggle" :class="{ disabled, 'ss-trigger--filled': !!modelValue }">
            <v-icon v-if="prefixIcon" :icon="prefixIcon" size="15" class="ss-prefix-icon" />
            <span class="ss-value" :class="{ placeholder: !selectedLabel }">
                {{ selectedLabel || placeholder || $t('cSmartSelect.placeholderDefault') }}
            </span>
            <v-icon :icon="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" class="ss-arrow" />
        </div>

        <Transition name="ss-drop">
            <div v-if="isOpen && !disabled" class="ss-dropdown">
                <div class="ss-search-wrap">
                    <v-icon icon="mdi-magnify" size="15" class="ss-search-icon" />
                    <input
                        ref="searchRef"
                        v-model="query"
                        class="ss-search"
                        :placeholder="$t('cSmartSelect.searchPlaceholder', { hint: searchPlaceholder ?? '' })"
                        @keydown.down.prevent="moveDown"
                        @keydown.up.prevent="moveUp"
                        @keydown.enter.prevent="selectHighlighted"
                        @keydown.esc="close"
                    />
                </div>
                <div class="ss-list" ref="listRef">
                    <div
                        v-if="!filtered.length"
                        class="ss-empty"
                    >{{ $t('cSmartSelect.noResults', { query }) }}</div>
                    <div
                        v-for="(opt, i) in filtered"
                        :key="opt.value"
                        class="ss-option"
                        :class="{
                            'ss-option--selected': opt.value === modelValue,
                            'ss-option--highlighted': i === highlightIdx
                        }"
                        @click="select(opt)"
                        @mouseenter="highlightIdx = i"
                    >
                        <v-icon v-if="opt.icon" :icon="opt.icon" size="14" class="ss-opt-icon" />
                        <span class="ss-opt-label">{{ opt.label }}</span>
                        <span v-if="opt.meta" class="ss-opt-meta">{{ opt.meta }}</span>
                        <v-icon v-if="opt.value === modelValue" icon="mdi-check" size="13" class="ss-opt-check" />
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import type { SelectOption } from '~/types'

const props = withDefaults(defineProps<{
    modelValue: number | string | null
    options: SelectOption[]
    placeholder?: string
    searchPlaceholder?: string
    prefixIcon?: string
    disabled?: boolean
    // Opt-in safety net for brand selects where a raw numeric ID can leak in as the label
    // (see 8543eb4). Must stay opt-in: legitimately numeric labels (door/seat counts, years,
    // etc.) are valid options elsewhere and this filter would silently delete them.
    filterNumericLabels?: boolean
}>(), {
    disabled: false,
    filterNumericLabels: false,
})

const emit = defineEmits<{ 'update:modelValue': [v: number | string | null]; change: [v: number | string | null] }>()

const isOpen = ref(false)
const query = ref('')
const highlightIdx = ref(0)
const wrapRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

const isNumeric = (s: string) => /^\d+$/.test(s)

const safeOptions = computed(() => props.filterNumericLabels
    ? props.options.filter(o => o.label && !isNumeric(String(o.label)))
    : props.options)

const selectedLabel = computed(() => safeOptions.value.find(o => o.value === props.modelValue)?.label ?? '')

const filtered = computed(() => {
    if (!query.value.trim()) return safeOptions.value
    const q = query.value.toLowerCase()
    return safeOptions.value.filter(o => o.label.toLowerCase().includes(q))
})

watch(filtered, () => { highlightIdx.value = 0 })

function toggle() {
    if (props.disabled) return
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        query.value = ''
        highlightIdx.value = 0
        nextTick(() => searchRef.value?.focus())
    }
}

function close() { isOpen.value = false }

function select(opt: SelectOption) {
    emit('update:modelValue', opt.value)
    emit('change', opt.value)
    close()
}

function moveDown() {
    highlightIdx.value = Math.min(highlightIdx.value + 1, filtered.value.length - 1)
    scrollToHighlighted()
}

function moveUp() {
    highlightIdx.value = Math.max(highlightIdx.value - 1, 0)
    scrollToHighlighted()
}

function selectHighlighted() {
    const opt = filtered.value[highlightIdx.value]
    if (opt) select(opt)
}

function scrollToHighlighted() {
    nextTick(() => {
        const list = listRef.value
        if (!list) return
        const item = list.children[highlightIdx.value] as HTMLElement
        if (item) item.scrollIntoView({ block: 'nearest' })
    })
}

const _outsideClickHandler = (e: MouseEvent) => {
    if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) close()
}
onMounted(() => document.addEventListener('click', _outsideClickHandler))
onUnmounted(() => document.removeEventListener('click', _outsideClickHandler))
</script>

<style lang="scss" scoped>
.ss-wrap {
    position: relative;
    width: 100%;
}

.ss-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #0c0c0c;
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 0 12px;
    height: 44px;
    cursor: pointer;
    transition: border-color 0.2s;
    user-select: none;

    &:hover:not(.disabled) { border-color: #333; }
    &.disabled { opacity: 0.45; cursor: not-allowed; }

    .ss-wrap.open & { border-color: #444; }
    &--filled { border-color: #2a2a2a; }
}

.ss-prefix-icon { color: $text-dark; flex-shrink: 0; }

.ss-value {
    flex: 1;
    font-size: 14px;
    color: $text;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.placeholder { color: $text-dark; }
}

.ss-arrow { color: $text-dark; flex-shrink: 0; transition: transform 0.2s; }
.ss-wrap.open .ss-arrow { transform: rotate(180deg); }

.ss-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    background: #101010;
    border: 1px solid $border;
    border-radius: $r-sm;
    z-index: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    overflow: hidden;
}

.ss-search-wrap {
    position: relative;
    border-bottom: 1px solid $border;
}

.ss-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: $text-dark;
    pointer-events: none;
}

.ss-search {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    padding: 10px 12px 10px 34px;
    font-size: 13px;
    color: $text;
    font-family: 'Inter', sans-serif;

    &::placeholder { color: $text-dark; }
}

.ss-list {
    max-height: 240px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #222 transparent;
}

.ss-empty {
    padding: 16px;
    text-align: center;
    font-size: 13px;
    color: $text-dark;
}

.ss-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: $text-muted;
    cursor: pointer;
    transition: background 0.15s;

    &:hover, &--highlighted { background: #1a1a1a; color: $text; }
    &--selected { color: $red; }
}

.ss-opt-icon { color: $text-dark; flex-shrink: 0; }
.ss-opt-label { flex: 1; }
.ss-opt-meta { font-size: 11px; color: $text-dark; }
.ss-opt-check { color: $red; margin-left: auto; }

// Dropdown transition
.ss-drop-enter-active, .ss-drop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.ss-drop-enter-from, .ss-drop-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
