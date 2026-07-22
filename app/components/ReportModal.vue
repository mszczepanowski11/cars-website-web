<template>
    <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
        <div class="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
            <div class="modal-header">
                <div id="report-modal-title" class="modal-title">
                    <v-icon icon="mdi-flag-outline" size="18" class="modal-icon" />
                    {{ targetType === 'Advert' ? $t('cReport.titleAdvert') : $t('cReport.titleUser') }}
                </div>
                <button class="modal-close" :aria-label="$t('cReport.close')" @click="$emit('update:modelValue', false)">
                    <v-icon icon="mdi-close" size="18" />
                </button>
            </div>

            <div class="modal-body">
                <div class="field-group">
                    <label class="field-label">{{ $t('cReport.reasonLabel') }} *</label>
                    <div class="reason-grid">
                        <button
                            v-for="r in reasons"
                            :key="r.value"
                            class="reason-btn"
                            :class="{ active: selectedReason === r.value }"
                            @click="selectedReason = r.value"
                        >
                            <v-icon :icon="r.icon" size="16" class="r-icon" />
                            {{ r.label }}
                        </button>
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label">{{ $t('cReport.descLabel') }}</label>
                    <textarea
                        v-model="content"
                        class="field-textarea"
                        rows="4"
                        maxlength="2000"
                        :placeholder="$t('cReport.descPlaceholder')"
                    />
                    <div class="char-count">{{ content.length }} / 2000</div>
                </div>

                <div v-if="error" class="modal-error">
                    <v-icon icon="mdi-alert-circle-outline" size="15" />
                    {{ error }}
                </div>

                <div v-if="success" class="modal-success">
                    <v-icon icon="mdi-check-circle-outline" size="15" />
                    {{ $t('cReport.successMsg') }}
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-cancel" @click="$emit('update:modelValue', false)">{{ $t('cReport.cancel') }}</button>
                <button
                    class="btn-submit"
                    :disabled="!selectedReason || loading || success"
                    @click="submit"
                >
                    <v-icon v-if="loading" icon="mdi-loading" size="15" class="spin" />
                    <v-icon v-else icon="mdi-flag" size="15" />
                    {{ $t('cReport.submit') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ReportReason, ReportTargetType } from '~/types'

const props = defineProps<{
    modelValue: boolean
    targetType: ReportTargetType
    targetId: number
}>()

defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()

const { submitReport, loading, error } = useReports()
const { t } = useI18n()
const selectedReason = ref<ReportReason | ''>('')
const content = ref('')
const success = ref(false)

const reasons = computed<{ value: ReportReason; label: string; icon: string }[]>(() => [
    { value: 'Fraud', label: t('cReport.reasonFraud'), icon: 'mdi-shield-alert-outline' },
    { value: 'FalseData', label: t('cReport.reasonFalseData'), icon: 'mdi-file-alert-outline' },
    { value: 'InvalidVin', label: t('cReport.reasonInvalidVin'), icon: 'mdi-barcode-off' },
    { value: 'DuplicateAdvert', label: t('cReport.reasonDuplicate'), icon: 'mdi-content-copy' },
    { value: 'InappropriateContent', label: t('cReport.reasonInappropriate'), icon: 'mdi-eye-off-outline' },
    { value: 'Spam', label: t('cReport.reasonSpam'), icon: 'mdi-email-alert-outline' },
    { value: 'Other', label: t('cReport.reasonOther'), icon: 'mdi-dots-horizontal-circle-outline' },
])

async function submit() {
    if (!selectedReason.value) return
    try {
        await submitReport({
            targetType: props.targetType,
            targetAdvertId: props.targetType === 'Advert' ? props.targetId : undefined,
            targetUserId: props.targetType === 'User' ? props.targetId : undefined,
            reason: selectedReason.value,
            content: content.value || undefined
        })
        success.value = true
        setTimeout(() => {
            success.value = false
            selectedReason.value = ''
            content.value = ''
        }, 2000)
    } catch {}
}
</script>

<style lang="scss" scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

.report-modal {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-lg;
    width: 100%;
    max-width: 520px;
    overflow: hidden;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    border-bottom: 1px solid $border;
}

.modal-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    color: $text;
}

.modal-icon { color: $red; }

.modal-close {
    background: transparent;
    border: none;
    color: $text-dim;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 6px;
    transition: color 0.2s, background 0.2s;
    &:hover { color: $text; background: rgba(255,255,255,0.06); }
}

.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 18px; }

.field-group { display: flex; flex-direction: column; gap: 8px; }

.field-label {
    font-size: 12px;
    font-weight: 600;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.reason-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.reason-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
    text-align: left;

    &:hover { border-color: rgba($red, 0.4); color: $text; }
    &.active {
        border-color: $red;
        background: rgba($red, 0.08);
        color: $text;
        .r-icon { color: $red; }
    }
}

.r-icon { color: $text-dim; flex-shrink: 0; }

.field-textarea {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 12px;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;
    &:focus { border-color: rgba($red, 0.4); }
    &::placeholder { color: $text-dark; }
}

.char-count { font-size: 11px; color: $text-dark; text-align: right; }

.modal-error {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: #e55;
    background: rgba(220, 50, 50, 0.08);
    border: 1px solid rgba(220, 50, 50, 0.2);
    border-radius: $r-sm;
    padding: 10px 12px;
}

.modal-success {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: #4caf50;
    background: rgba(76, 175, 80, 0.08);
    border: 1px solid rgba(76, 175, 80, 0.2);
    border-radius: $r-sm;
    padding: 10px 12px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid $border;
}

.btn-cancel {
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    padding: 9px 18px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.btn-submit {
    display: flex;
    align-items: center;
    gap: 7px;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 9px 20px;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
}

.spin { animation: spin 1s linear infinite; }

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>