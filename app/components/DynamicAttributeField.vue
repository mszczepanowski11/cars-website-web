<template>
    <div class="daf-field" :class="{ 'daf-field--full': definition.dataType === 'MultiSelect' }">
        <label class="daf-label">
            {{ definition.labelPl }}<span v-if="definition.isRequired" class="daf-req">*</span>
            <span v-if="definition.unit" class="daf-unit">({{ definition.unit }})</span>
        </label>

        <input v-if="definition.dataType === 'Text'" :value="modelValue?.valueText ?? ''"
            class="daf-input" type="text" :placeholder="definition.labelPl"
            @input="emitText(($event.target as HTMLInputElement).value)" />

        <input v-else-if="definition.dataType === 'Number'" :value="modelValue?.valueNumber ?? ''"
            class="daf-input" type="number" step="1" :placeholder="definition.labelPl"
            @input="emitNumber(($event.target as HTMLInputElement).value)" />

        <input v-else-if="definition.dataType === 'Decimal'" :value="modelValue?.valueNumber ?? ''"
            class="daf-input" type="number" step="0.01" :placeholder="definition.labelPl"
            @input="emitNumber(($event.target as HTMLInputElement).value)" />

        <label v-else-if="definition.dataType === 'Boolean'" class="daf-check">
            <input type="checkbox" :checked="modelValue?.valueBool ?? false"
                @change="emitBool(($event.target as HTMLInputElement).checked)" />
            {{ definition.labelPl }}
        </label>

        <select v-else-if="definition.dataType === 'Select'" :value="modelValue?.valueText ?? ''"
            class="daf-input" @change="emitText(($event.target as HTMLSelectElement).value)">
            <option value="">— wybierz —</option>
            <option v-for="o in options" :key="o" :value="o">{{ o }}</option>
        </select>

        <div v-else-if="definition.dataType === 'MultiSelect'" class="daf-multiselect">
            <label v-for="o in options" :key="o" class="daf-check">
                <input type="checkbox" :value="o" :checked="selectedMulti.includes(o)" @change="toggleMulti(o)" />
                {{ o }}
            </label>
        </div>

        <input v-else-if="definition.dataType === 'Date'" :value="modelValue?.valueDate?.slice(0, 10) ?? ''"
            class="daf-input" type="date"
            @input="emitDate(($event.target as HTMLInputElement).value)" />

        <input v-else-if="definition.dataType === 'File'" :value="modelValue?.valueText ?? ''"
            class="daf-input" type="text" placeholder="Link do pliku (URL)"
            @input="emitText(($event.target as HTMLInputElement).value)" />

        <div v-if="hint" class="daf-hint">{{ hint }}</div>
    </div>
</template>

<script setup lang="ts">
// Faza 3 of the category/attribute restructure: renders one AttributeDefinition-driven form
// field, replacing the old one-big-template-block-with-manual-type-branching in add-advert.vue.
// Value shape mirrors AdvertAttributeValueDto exactly (attributeDefinitionId + one of
// valueText/valueNumber/valueBool/valueDate) so the parent can post the array straight through.
interface AttributeDefinitionLite {
    id: number
    key: string
    labelPl: string
    dataType: 'Text' | 'Number' | 'Decimal' | 'Boolean' | 'Select' | 'MultiSelect' | 'Date' | 'File'
    unit?: string | null
    optionsJson?: string | null
    isRequired: boolean
}
interface AttributeValue {
    attributeDefinitionId: number
    valueText?: string | null
    valueNumber?: number | null
    valueBool?: boolean | null
    valueDate?: string | null
}

const props = defineProps<{ definition: AttributeDefinitionLite; modelValue: AttributeValue | null; hint?: string }>()
const emit = defineEmits<{ 'update:modelValue': [AttributeValue | null] }>()

const options = computed<string[]>(() => {
    if (!props.definition.optionsJson) return []
    try { return JSON.parse(props.definition.optionsJson) } catch { return [] }
})

// MultiSelect stores its selections as a comma-joined string in valueText (kept as a single
// AdvertAttributeValue row rather than one row per selected option - simplest shape that still
// round-trips cleanly through ValueText).
const selectedMulti = computed<string[]>(() => (props.modelValue?.valueText ?? '').split(',').map(s => s.trim()).filter(Boolean))

function base(): AttributeValue {
    return { attributeDefinitionId: props.definition.id, valueText: null, valueNumber: null, valueBool: null, valueDate: null }
}
function emitText(v: string) {
    emit('update:modelValue', v ? { ...base(), valueText: v } : null)
}
function emitNumber(v: string) {
    const n = v === '' ? null : Number(v)
    emit('update:modelValue', n !== null && !Number.isNaN(n) ? { ...base(), valueNumber: n } : null)
}
function emitBool(v: boolean) {
    emit('update:modelValue', { ...base(), valueBool: v })
}
function emitDate(v: string) {
    emit('update:modelValue', v ? { ...base(), valueDate: v } : null)
}
function toggleMulti(option: string) {
    const current = new Set(selectedMulti.value)
    if (current.has(option)) current.delete(option); else current.add(option)
    emitText(Array.from(current).join(', '))
}
</script>

<style lang="scss" scoped>
.daf-field { display: flex; flex-direction: column; gap: 6px; min-width: 200px; flex: 1; }
.daf-field--full { flex-basis: 100%; }
.daf-label { font-size: 12px; font-weight: 600; color: $text-muted; }
.daf-req { color: $red; margin-left: 2px; }
.daf-unit { color: $text-dim; font-weight: 400; margin-left: 4px; }
.daf-input {
    background: #0d0d0d; border: 1px solid $border; border-radius: $r-sm; color: $text;
    font-size: 13px; padding: 9px 12px; outline: none; font-family: 'Inter', sans-serif;
    &:focus { border-color: rgba($red, 0.4); }
}
.daf-check { display: flex; align-items: center; gap: 8px; font-size: 13px; color: $text-muted; cursor: pointer; }
.daf-multiselect { display: flex; flex-wrap: wrap; gap: 12px; }
.daf-hint { font-size: 11px; color: $text-dim; }
</style>
