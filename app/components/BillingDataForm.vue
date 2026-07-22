<template>
    <div class="billing-form">
        <div class="bf-type-switch">
            <button :class="['bf-type-btn', { active: form.type === 'personal' }]" @click="setType('personal')">
                <v-icon icon="mdi-account-outline" size="16" />
                {{ $t('cBilling.typePersonal') }}
            </button>
            <button :class="['bf-type-btn', { active: form.type === 'business' }]" @click="setType('business')">
                <v-icon icon="mdi-domain" size="16" />
                {{ $t('cBilling.typeBusiness') }}
            </button>
        </div>

        <div class="bf-fields">
            <!-- Personal -->
            <template v-if="form.type === 'personal'">
                <div class="bf-row">
                    <div class="bf-field">
                        <label class="bf-label">{{ $t('cBilling.firstName') }} <span class="req">*</span></label>
                        <input v-model="form.firstName" class="bf-input" :class="{ error: errors.firstName }" :placeholder="$t('cBilling.placeholderFirstName')" @blur="validate('firstName')" />
                        <span v-if="errors.firstName" class="bf-error">{{ errors.firstName }}</span>
                    </div>
                    <div class="bf-field">
                        <label class="bf-label">{{ $t('cBilling.lastName') }} <span class="req">*</span></label>
                        <input v-model="form.lastName" class="bf-input" :class="{ error: errors.lastName }" :placeholder="$t('cBilling.placeholderLastName')" @blur="validate('lastName')" />
                        <span v-if="errors.lastName" class="bf-error">{{ errors.lastName }}</span>
                    </div>
                </div>
            </template>

            <!-- Business -->
            <template v-else>
                <div class="bf-field">
                    <label class="bf-label">{{ $t('cBilling.companyName') }} <span class="req">*</span></label>
                    <input v-model="form.companyName" class="bf-input" :class="{ error: errors.companyName }" :placeholder="$t('cBilling.placeholderCompany')" @blur="validate('companyName')" />
                    <span v-if="errors.companyName" class="bf-error">{{ errors.companyName }}</span>
                </div>
                <div class="bf-row">
                    <div class="bf-field">
                        <label class="bf-label">{{ $t('cBilling.nip') }} <span class="req">*</span></label>
                        <input v-model="form.nip" class="bf-input" :class="{ error: errors.nip }" placeholder="1234567890" maxlength="13" @blur="validate('nip')" />
                        <span v-if="errors.nip" class="bf-error">{{ errors.nip }}</span>
                    </div>
                    <div class="bf-field">
                        <label class="bf-label">{{ $t('cBilling.country') }} <span class="req">*</span></label>
                        <input v-model="form.country" class="bf-input" :class="{ error: errors.country }" :placeholder="$t('cBilling.placeholderCountry')" @blur="validate('country')" />
                        <span v-if="errors.country" class="bf-error">{{ errors.country }}</span>
                    </div>
                </div>
                <div class="bf-field">
                    <label class="bf-label">{{ $t('cBilling.addressLabel') }} <span class="req">*</span></label>
                    <input v-model="form.street" class="bf-input" :class="{ error: errors.street }" :placeholder="$t('cBilling.placeholderStreet')" @blur="validate('street')" />
                    <span v-if="errors.street" class="bf-error">{{ errors.street }}</span>
                </div>
                <div class="bf-row">
                    <div class="bf-field bf-field--sm">
                        <label class="bf-label">{{ $t('cBilling.postalCode') }} <span class="req">*</span></label>
                        <input v-model="form.postalCode" class="bf-input" :class="{ error: errors.postalCode }" placeholder="00-000" maxlength="6" @blur="validate('postalCode')" />
                        <span v-if="errors.postalCode" class="bf-error">{{ errors.postalCode }}</span>
                    </div>
                    <div class="bf-field">
                        <label class="bf-label">{{ $t('cBilling.city') }} <span class="req">*</span></label>
                        <input v-model="form.city" class="bf-input" :class="{ error: errors.city }" :placeholder="$t('cBilling.placeholderCity')" @blur="validate('city')" />
                        <span v-if="errors.city" class="bf-error">{{ errors.city }}</span>
                    </div>
                </div>
            </template>

            <!-- Email (shared) -->
            <div class="bf-field">
                <label class="bf-label">{{ $t('cBilling.emailLabel') }} <span class="req">*</span></label>
                <input v-model="form.email" class="bf-input" :class="{ error: errors.email }" type="email" placeholder="jan@example.com" @blur="validate('email')" />
                <span v-if="errors.email" class="bf-error">{{ errors.email }}</span>
            </div>
        </div>

        <div class="bf-note">
            <v-icon icon="mdi-information-outline" size="14" />
            {{ $t('cBilling.note') }}
        </div>
    </div>
</template>

<script setup lang="ts">
import type { BillingData, BillingType, UserProfile } from '~/types'

const props = defineProps<{
    modelValue: BillingData
    userProfile?: UserProfile | null
}>()

const emit = defineEmits<{
    'update:modelValue': [v: BillingData]
    'valid': [v: boolean]
}>()

const { t } = useI18n()

const form = reactive<BillingData>({ ...props.modelValue })

const errors = reactive<Record<string, string>>({})

function setType(t: BillingType) {
    form.type = t
    Object.keys(errors).forEach(k => delete errors[k])
    emit('update:modelValue', { ...form })
}

function validate(field: string): boolean {
    delete errors[field]
    if (field === 'email') {
        if (!form.email?.trim()) errors.email = t('cBilling.required')
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = t('cBilling.invalidEmail')
    }
    if (form.type === 'personal') {
        if (field === 'firstName' && !form.firstName?.trim()) errors.firstName = t('cBilling.required')
        if (field === 'lastName' && !form.lastName?.trim()) errors.lastName = t('cBilling.required')
    } else {
        if (field === 'companyName' && !form.companyName?.trim()) errors.companyName = t('cBilling.required')
        if (field === 'nip') {
            const nip = (form.nip ?? '').replace(/[-\s]/g, '')
            if (!nip) errors.nip = t('cBilling.required')
            else if (!/^\d{10}$/.test(nip)) errors.nip = t('cBilling.nipLength')
        }
        if (field === 'street' && !form.street?.trim()) errors.street = t('cBilling.required')
        if (field === 'postalCode' && !form.postalCode?.trim()) errors.postalCode = t('cBilling.required')
        if (field === 'city' && !form.city?.trim()) errors.city = t('cBilling.required')
        if (field === 'country' && !form.country?.trim()) errors.country = t('cBilling.required')
    }
    return !errors[field]
}

function validateAll(): boolean {
    const fields = form.type === 'personal'
        ? ['firstName', 'lastName', 'email']
        : ['companyName', 'nip', 'street', 'postalCode', 'city', 'country', 'email']
    fields.forEach(f => validate(f))
    return Object.keys(errors).length === 0
}

function isValid() { return validateAll() }

watch(form, (v) => {
    emit('update:modelValue', { ...v })
    const allFilled = form.type === 'personal'
        ? !!(form.firstName && form.lastName && form.email)
        : !!(form.companyName && form.nip && form.street && form.postalCode && form.city && form.country && form.email)
    emit('valid', allFilled)
}, { deep: true })

// Pre-fill from user profile
watch(() => props.userProfile, (profile) => {
    if (!profile) return
    if (!form.email && profile.email) form.email = profile.email
    if (profile.accountType === 'Business') {
        form.type = 'business'
        if (!form.companyName && profile.companyName) form.companyName = profile.companyName
        if (!form.nip && profile.nip) form.nip = profile.nip
        if (!form.street && profile.street) form.street = profile.street
        if (!form.postalCode && profile.postalCode) form.postalCode = profile.postalCode
        if (!form.city && profile.city) form.city = profile.city
        if (!form.country && profile.country) form.country = profile.country
    } else {
        form.type = 'personal'
        if (!form.firstName && profile.name) form.firstName = profile.name
        if (!form.lastName && profile.surname) form.lastName = profile.surname
    }
}, { immediate: true })

defineExpose({ validateAll, isValid })
</script>

<style lang="scss" scoped>
.billing-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.bf-type-switch {
    display: flex;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    overflow: hidden;
}

.bf-type-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: transparent;
    border: none;
    color: $text-dim;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 11px;
    cursor: pointer;
    transition: all 0.2s;
    &.active {
        background: rgba($red, 0.1);
        color: $text;
        .v-icon { color: $red; }
    }
    &:not(.active):hover { color: $text; }
}

.bf-fields {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.bf-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    @media (max-width: 480px) { grid-template-columns: 1fr; }
}

.bf-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    &--sm { max-width: 140px; @media (max-width: 480px) { max-width: 100%; } }
}

.bf-label {
    font-size: 12px;
    font-weight: 600;
    color: $text-dim;
    .req { color: $red; }
}

.bf-input {
    background: #111;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 10px 12px;
    outline: none;
    transition: border-color 0.2s;
    &:focus { border-color: $red; }
    &::placeholder { color: $text-dark; }
    &.error { border-color: #e74c3c; }
}

.bf-error {
    font-size: 11px;
    color: #e74c3c;
}

.bf-note {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    font-size: 11px;
    color: $text-dark;
    line-height: 1.5;
    background: rgba(255,255,255,0.02);
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 10px 12px;
    .v-icon { flex-shrink: 0; margin-top: 1px; color: $text-dim; }
}
</style>
