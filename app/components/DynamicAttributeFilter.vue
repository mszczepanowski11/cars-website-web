<template>
    <div v-if="definition.dataType === 'Number' || definition.dataType === 'Decimal'" class="dafl-group">
        <div class="dafl-label">{{ definition.labelPl }}<span v-if="definition.unit"> ({{ definition.unit }})</span></div>
        <div class="dafl-range">
            <input :value="modelValue?.from ?? ''" type="number" class="dafl-range-input" :placeholder="$t('cAttrFilter.rangeFrom')"
                @input="emitRange(($event.target as HTMLInputElement).value, 'from')" />
            <span class="dafl-range-sep">–</span>
            <input :value="modelValue?.to ?? ''" type="number" class="dafl-range-input" :placeholder="$t('cAttrFilter.rangeTo')"
                @input="emitRange(($event.target as HTMLInputElement).value, 'to')" />
        </div>
    </div>

    <div v-else-if="definition.dataType === 'Boolean'" class="dafl-group">
        <label class="dafl-check">
            <input type="checkbox" :checked="modelValue?.bool === true" @change="emitBool" />
            {{ definition.labelPl }}
        </label>
    </div>

    <div v-else-if="definition.dataType === 'Select' || definition.dataType === 'MultiSelect'" class="dafl-group dafl-group--wide">
        <div class="dafl-label">{{ definition.labelPl }}</div>
        <div class="dafl-options">
            <button v-for="o in options" :key="o" class="dafl-opt-btn" :class="{ active: (modelValue?.multi ?? []).includes(o) }"
                type="button" @click="toggleOption(o)">{{ o }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
// Faza 5 of the category/attribute restructure: filter-panel counterpart to DynamicAttributeField.vue.
// Same AttributeDefinition-driven rendering, different semantics - a range for numbers instead of a
// single value, a multi-select checkbox group for both Select and MultiSelect (picking several
// acceptable values to filter by, unlike the single choice a form field writes), no Text/Date/File
// rendering (not useful as filters in this iteration).
interface AttributeDefinitionLite {
    id: number
    key: string
    labelPl: string
    dataType: 'Text' | 'Number' | 'Decimal' | 'Boolean' | 'Select' | 'MultiSelect' | 'Date' | 'File'
    unit?: string | null
    optionsJson?: string | null
}
interface FilterValue {
    bool?: boolean | null
    multi?: string[]
    from?: number | null
    to?: number | null
}

const props = defineProps<{ definition: AttributeDefinitionLite; modelValue: FilterValue | null }>()
const emit = defineEmits<{ 'update:modelValue': [FilterValue | null] }>()

const options = computed<string[]>(() => {
    if (!props.definition.optionsJson) return []
    try { return JSON.parse(props.definition.optionsJson) } catch { return [] }
})

function emitRange(raw: string, side: 'from' | 'to') {
    const n = raw === '' ? null : Number(raw)
    const next: FilterValue = { ...(props.modelValue ?? {}), [side]: (n !== null && !Number.isNaN(n)) ? n : null }
    emit('update:modelValue', (next.from == null && next.to == null) ? null : next)
}
function emitBool() {
    const wasOn = props.modelValue?.bool === true
    emit('update:modelValue', wasOn ? null : { bool: true })
}
function toggleOption(o: string) {
    const current = new Set(props.modelValue?.multi ?? [])
    if (current.has(o)) current.delete(o); else current.add(o)
    emit('update:modelValue', current.size ? { multi: Array.from(current) } : null)
}
</script>

<style lang="scss" scoped>
.dafl-group { display: flex; flex-direction: column; &--wide { grid-column: 1 / -1; } }
.dafl-label {
    font-size: 11px; font-weight: 700; color: $text-dim; text-transform: uppercase;
    letter-spacing: 0.5px; margin-bottom: 8px;
}
.dafl-range {
    display: flex; align-items: center; gap: 6px;
    background: #0d0d0d; border: 1px solid $border; border-radius: $r-sm; padding: 0 10px;
}
.dafl-range-input {
    flex: 1; min-width: 0; background: transparent; border: none; outline: none;
    color: $text; font-size: 13px; font-family: 'Inter', sans-serif; padding: 9px 0;
    &::placeholder { color: $text-faint; }
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
    -moz-appearance: textfield;
}
.dafl-range-sep { color: $text-dim; font-size: 13px; flex-shrink: 0; }
.dafl-check {
    display: flex; align-items: center; gap: 8px; color: $text-muted; font-size: 12px;
    cursor: pointer; user-select: none;
    input[type=checkbox] { accent-color: $red; width: 14px; height: 14px; }
}
.dafl-options { display: flex; flex-wrap: wrap; gap: 6px; }
.dafl-opt-btn {
    background: rgba(255,255,255,0.04); border: 1px solid $border; border-radius: $r-sm;
    color: $text-muted; font-size: 12px; font-weight: 500; padding: 5px 10px; cursor: pointer;
    font-family: 'Inter', sans-serif; transition: all 0.15s;
    &:hover { border-color: rgba($red, 0.3); color: $text; }
    &.active { background: rgba($red, 0.12); border-color: rgba($red, 0.4); color: $red; font-weight: 700; }
}
</style>
