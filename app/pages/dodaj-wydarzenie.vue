<template>
    <div class="add-event-page">
        <div class="page-hero">
            <div class="container">
                <div class="hero-eyebrow">{{ isEdit ? $t('addEvent.hero.eyebrowEdit') : $t('addEvent.hero.eyebrowNew') }}</div>
                <h1>{{ isEdit ? $t('addEvent.hero.titleEdit') : $t('addEvent.hero.titleNew') }} <span>{{ $t('addEvent.hero.titleAccent') }}</span></h1>
                <p>{{ $t('addEvent.hero.sub') }}</p>
            </div>
        </div>

        <div class="container page-body">
            <form @submit.prevent="submit" class="event-form">

                <div class="form-grid">

                    <!-- Name -->
                    <div class="form-group full">
                        <label class="form-label">{{ $t('addEvent.form.name') }}</label>
                        <input v-model="form.name" class="form-input" required maxlength="200" :placeholder="$t('addEvent.form.namePlaceholder')" />
                    </div>

                    <!-- Description -->
                    <div class="form-group full">
                        <label class="form-label">{{ $t('addEvent.form.description') }}</label>
                        <textarea v-model="form.description" class="form-textarea" required rows="6" :placeholder="$t('addEvent.form.descriptionPlaceholder')" />
                    </div>

                    <!-- Dates -->
                    <div class="form-group">
                        <label class="form-label">{{ $t('addEvent.form.startDate') }}</label>
                        <input type="datetime-local" v-model="form.startDate" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">{{ $t('addEvent.form.endDate') }}</label>
                        <input type="datetime-local" v-model="form.endDate" class="form-input" required />
                    </div>

                    <!-- Location -->
                    <div class="form-group">
                        <label class="form-label">{{ $t('addEvent.form.city') }}</label>
                        <input v-model="form.city" class="form-input" required :placeholder="$t('addEvent.form.cityPlaceholder')" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">{{ $t('addEvent.form.address') }}</label>
                        <input v-model="form.address" class="form-input" required :placeholder="$t('addEvent.form.addressPlaceholder')" />
                    </div>

                    <!-- Organizer -->
                    <div class="form-group">
                        <label class="form-label">{{ $t('addEvent.form.organizerName') }}</label>
                        <input v-model="form.organizerName" class="form-input" :placeholder="$t('addEvent.form.organizerNamePlaceholder')" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">{{ $t('addEvent.form.organizerEmail') }}</label>
                        <input type="email" v-model="form.organizerEmail" class="form-input" :placeholder="$t('addEvent.form.organizerEmailPlaceholder')" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">{{ $t('addEvent.form.organizerPhone') }}</label>
                        <input type="tel" v-model="form.organizerPhone" class="form-input" placeholder="+48 000 000 000" />
                    </div>

                    <!-- Links -->
                    <div class="form-group">
                        <label class="form-label">{{ $t('addEvent.form.ticketsUrl') }}</label>
                        <input type="url" v-model="form.ticketsUrl" class="form-input" placeholder="https://bilety.pl/..." />
                    </div>
                    <div class="form-group">
                        <label class="form-label">{{ $t('addEvent.form.websiteUrl') }}</label>
                        <input type="url" v-model="form.websiteUrl" class="form-input" placeholder="https://wydarzenie.pl" />
                    </div>

                    <!-- Image upload -->
                    <div class="form-group full">
                        <label class="form-label">{{ $t('addEvent.form.mainImage') }}</label>
                        <div class="upload-area" :class="{ 'has-img': previewUrl }" @click="triggerUpload">
                            <img v-if="previewUrl" :src="previewUrl" class="img-preview" :alt="$t('addEvent.form.imagePreviewAlt')" />
                            <div v-else class="upload-placeholder">
                                <v-icon icon="mdi-image-plus-outline" size="40" class="upload-icon" />
                                <span>{{ $t('addEvent.form.uploadClick') }}</span>
                                <small>{{ $t('addEvent.form.uploadHint') }}</small>
                            </div>
                        </div>
                        <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="onFileChange" />
                    </div>

                </div>

                <div class="notice">
                    <v-icon icon="mdi-information-outline" size="16" />
                    {{ isEdit ? $t('addEvent.notice.edit') : $t('addEvent.notice.new') }}
                </div>

                <div v-if="error" class="error-msg">
                    <v-icon icon="mdi-alert-circle-outline" size="15" />
                    {{ error }}
                </div>

                <div class="form-actions">
                    <NuxtLink to="/moje-wydarzenia" class="btn-cancel">{{ $t('addEvent.actions.cancel') }}</NuxtLink>
                    <button type="submit" class="btn-submit" :disabled="loading">
                        <v-icon v-if="loading" icon="mdi-loading" size="16" class="spin" />
                        {{ loading ? $t('addEvent.actions.saving') : (isEdit ? $t('addEvent.actions.saveChanges') : $t('addEvent.actions.add')) }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CreateEventDto } from '~/types'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const { t } = useI18n()
const route = useRoute()
const editId = route.query.id ? Number(route.query.id) : null
const isEdit = computed(() => editId !== null)

const { createEvent, updateMyEvent, getEvent } = useEvents()

const loading = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const form = reactive<CreateEventDto>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    city: '',
    address: '',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    ticketsUrl: '',
    websiteUrl: '',
})

function triggerUpload() {
    fileInput.value?.click()
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE_MB = 10

function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        error.value = t('addEvent.errors.imageFormat')
        return
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        error.value = t('addEvent.errors.imageSize', { max: MAX_IMAGE_SIZE_MB })
        return
    }
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
}

function formatDate(val: string): string {
    if (!val) return val
    return val.length === 16 ? val + ':00' : val
}

function validateDates(): string | null {
    if (!form.startDate) return t('addEvent.errors.startRequired')
    if (!form.endDate) return t('addEvent.errors.endRequired')
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    if (isNaN(start.getTime())) return t('addEvent.errors.startInvalid')
    if (isNaN(end.getTime())) return t('addEvent.errors.endInvalid')
    if (start.getFullYear() < 2020 || start.getFullYear() > 2100) return t('addEvent.errors.startYearInvalid')
    if (end.getFullYear() < 2020 || end.getFullYear() > 2100) return t('addEvent.errors.endYearInvalid')
    if (!isEdit.value && start < new Date()) return t('addEvent.errors.startInPast')
    if (end < start) return t('addEvent.errors.endBeforeStart')
    return null
}

function validateForm(): string | null {
    if (!form.name?.trim()) return t('addEvent.errors.nameRequired')
    if (form.name.trim().length < 5) return t('addEvent.errors.nameTooShort')
    if (form.name.trim().length > 200) return t('addEvent.errors.nameTooLong')
    if (!form.description?.trim()) return t('addEvent.errors.descRequired')
    if (form.description.trim().length < 20) return t('addEvent.errors.descTooShort')
    if (!form.city?.trim()) return t('addEvent.errors.cityRequired')
    if (!form.address?.trim()) return t('addEvent.errors.addressRequired')
    return validateDates()
}

async function submit() {
    loading.value = true
    error.value = ''
    const formErr = validateForm()
    if (formErr) {
        error.value = formErr
        loading.value = false
        return
    }
    try {
        const dto: CreateEventDto = {
            name: form.name,
            description: form.description,
            startDate: formatDate(form.startDate),
            endDate: formatDate(form.endDate),
            city: form.city,
            address: form.address,
            organizerName: form.organizerName || undefined,
            organizerEmail: form.organizerEmail || undefined,
            organizerPhone: form.organizerPhone || undefined,
            ticketsUrl: form.ticketsUrl || undefined,
            websiteUrl: form.websiteUrl || undefined,
        }
        if (isEdit.value && editId) {
            await updateMyEvent(editId, dto, selectedFile.value ?? undefined)
        } else {
            await createEvent(dto, selectedFile.value ?? undefined)
        }
        await navigateTo('/moje-wydarzenia')
    } catch (e: any) {
        const errs = e?.data?.errors
        if (errs) {
            const msgs = Object.entries(errs).map(([field, arr]) => `${field}: ${(arr as string[]).join(', ')}`)
            error.value = msgs.join(' | ')
        } else {
            error.value = e?.data?.message ?? e?.data?.title ?? t('addEvent.errors.generic')
        }
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    if (isEdit.value && editId) {
        try {
            const ev = await getEvent(editId)
            form.name = ev.name
            form.description = ev.description
            form.startDate = ev.startDate?.slice(0, 16) ?? ''
            form.endDate = ev.endDate?.slice(0, 16) ?? ''
            form.city = ev.city
            form.address = ev.address
            form.organizerName = ev.organizerName ?? ''
            form.organizerEmail = ev.organizerEmail ?? ''
            form.organizerPhone = ev.organizerPhone ?? ''
            form.ticketsUrl = ev.ticketsUrl ?? ''
            form.websiteUrl = ev.websiteUrl ?? ''
        } catch {
            error.value = t('addEvent.errors.loadFailed')
        }
    }
})
</script>

<style lang="scss" scoped>
.add-event-page {
    background: $bg;
    min-height: 100vh;
    padding-top: $nav-height;
}

.container { @include container; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

// Hero
.page-hero {
    padding: 56px 0 48px;
    border-bottom: 1px solid $border;
    background: linear-gradient(180deg, #0d0005 0%, $bg 100%);
}

.hero-eyebrow {
    font-size: 11px;
    font-weight: 700;
    color: $red;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 14px;
}

.page-hero h1 {
    font-size: 48px;
    font-weight: 900;
    color: $text;
    margin-bottom: 14px;

    span { color: $red; }

    @include respond-to(sm) { font-size: 34px; }
}

.page-hero p {
    font-size: 15px;
    color: $text-muted;
}

// Body
.page-body {
    padding-top: 40px;
    padding-bottom: 80px;
}

.event-form { max-width: 820px; }

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;

    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.form-group { display: flex; flex-direction: column; gap: 7px; }
.form-group.full { grid-column: 1 / -1; }

.form-label {
    font-size: 12px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

.form-input,
.form-textarea {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 12px 16px;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.2s;

    &::placeholder { color: $text-dark; }
    &:focus { border-color: rgba($red, 0.5); }
}

.form-textarea { resize: vertical; min-height: 130px; }

// Upload
.upload-area {
    border: 2px dashed $border;
    border-radius: $r-lg;
    min-height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.2s;

    &:hover { border-color: rgba($red, 0.4); }
    &.has-img { border-style: solid; }
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: $text-dim;
    font-size: 14px;
    padding: 24px;
    text-align: center;

    small { font-size: 12px; color: $text-dark; }
}

.upload-icon { color: $text-dark; }

.img-preview {
    width: 100%;
    max-height: 360px;
    object-fit: cover;
    display: block;
}

.hidden-input { display: none; }

// Notice & error
.notice {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba($red, 0.06);
    border: 1px solid rgba($red, 0.15);
    border-radius: $r-sm;
    padding: 12px 16px;
    font-size: 13px;
    color: $text-dim;
    margin-bottom: 16px;

    .v-icon { color: $red; flex-shrink: 0; }
}

.error-msg {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(220,50,50,0.08);
    border: 1px solid rgba(220,50,50,0.2);
    border-radius: $r-sm;
    padding: 12px 16px;
    font-size: 13px;
    color: #e55;
    margin-bottom: 16px;

    .v-icon { flex-shrink: 0; }
}

// Actions
.form-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
}

.btn-cancel {
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 24px;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;

    &:hover { border-color: $text-dim; color: $text; }
}

.btn-submit {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: $red;
    color: white;
    border: none;
    border-radius: $r-sm;
    font-size: 14px;
    font-weight: 700;
    padding: 12px 28px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;

    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}
</style>
