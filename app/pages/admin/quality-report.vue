<template>
    <div class="admin-page">
        <aside class="admin-sidebar">
            <div class="sidebar-brand">
                <v-icon icon="mdi-shield-crown" size="20" class="brand-icon" />
                Panel Administratora
            </div>
            <nav class="sidebar-nav">
                <NuxtLink to="/admin" class="nav-item"><v-icon icon="mdi-view-dashboard-outline" size="17" />Podsumowanie</NuxtLink>
                <NuxtLink to="/admin/reports" class="nav-item"><v-icon icon="mdi-flag-outline" size="17" />Zgłoszenia</NuxtLink>
                <NuxtLink to="/admin/users" class="nav-item"><v-icon icon="mdi-account-group-outline" size="17" />Użytkownicy</NuxtLink>
                <NuxtLink to="/admin/adverts" class="nav-item"><v-icon icon="mdi-car-outline" size="17" />Ogłoszenia</NuxtLink>
                <NuxtLink to="/admin/events" class="nav-item"><v-icon icon="mdi-calendar-star" size="17" />Wydarzenia</NuxtLink>
                <NuxtLink to="/admin/taxonomy" class="nav-item"><v-icon icon="mdi-tag-multiple-outline" size="17" />Wyposażenie</NuxtLink>
                <NuxtLink to="/admin/vehicle-data" class="nav-item"><v-icon icon="mdi-car-cog" size="17" />Marki i modele</NuxtLink>
                <NuxtLink to="/admin/quality-report" class="nav-item active"><v-icon icon="mdi-database-check-outline" size="17" />Jakość danych</NuxtLink>
                <NuxtLink to="/dashboard" class="nav-item"><v-icon icon="mdi-arrow-left" size="17" />Wróć do panelu</NuxtLink>
            </nav>
        </aside>

        <main class="admin-main">
            <div class="admin-topbar">
                <h1 class="page-title">Jakość danych</h1>
                <button class="btn-run" :disabled="loading" @click="runReport">
                    <v-icon :icon="loading ? 'mdi-loading' : 'mdi-refresh'" size="16" :class="{ spin: loading }" />
                    {{ loading ? 'Analizowanie...' : 'Uruchom analizę' }}
                </button>
            </div>

            <div v-if="error && !loading" class="error-banner">
                <v-icon icon="mdi-alert-circle-outline" size="16" />
                {{ error }}
            </div>

            <div v-if="!report && !loading && !error" class="empty-state">
                <v-icon icon="mdi-database-search-outline" size="56" class="es-icon" />
                <div class="es-title">Analiza jakości danych</div>
                <div class="es-sub">Kliknij "Uruchom analizę" aby sprawdzić spójność bazy danych.</div>
            </div>

            <div v-if="loading" class="loading-state">
                <v-icon icon="mdi-loading" size="32" class="spin" />
                Analizowanie bazy danych...
            </div>

            <template v-if="report && !loading">
                <!-- Summary cards -->
                <div class="summary-grid">
                    <div v-for="item in summaryItems" :key="item.key" class="summary-card" :class="item.count > 0 ? 'has-issues' : 'ok'">
                        <div class="sc-count">{{ item.count }}</div>
                        <div class="sc-label">{{ item.label }}</div>
                        <v-icon :icon="item.count > 0 ? 'mdi-alert-outline' : 'mdi-check-circle-outline'" size="18" class="sc-icon" />
                    </div>
                </div>

                <!-- Info stats (not issues, just current counts) -->
                <div class="info-stats-row">
                    <div v-for="s in infoStats" :key="s.label" class="info-stat">
                        <span class="is-value">{{ s.value }}</span>
                        <span class="is-label">{{ s.label }}</span>
                    </div>
                </div>

                <!-- Section: Brands without models -->
                <ReportSection
                    title="Marki bez modeli"
                    icon="mdi-car-off"
                    :items="report.brandsWithoutModels"
                    :columns="[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Marka' }]"
                />

                <!-- Section: Models without generations -->
                <ReportSection
                    title="Modele bez generacji"
                    icon="mdi-car-clock"
                    :items="report.modelsWithoutGenerations"
                    :columns="[{ key: 'id', label: 'ID' }, { key: 'brandName', label: 'Marka' }, { key: 'name', label: 'Model' }]"
                />

                <!-- Section: Brands without adverts -->
                <ReportSection
                    title="Marki bez ogłoszeń"
                    icon="mdi-car-off"
                    :items="report.brandsWithoutAdverts"
                    :columns="[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Marka' }]"
                />

                <!-- Section: Models without adverts -->
                <ReportSection
                    title="Modele bez ogłoszeń"
                    icon="mdi-car-search"
                    :items="report.modelsWithoutAdverts"
                    :columns="[{ key: 'id', label: 'ID' }, { key: 'brandName', label: 'Marka' }, { key: 'name', label: 'Model' }]"
                />

                <!-- Section: Empty feature categories -->
                <ReportSection
                    title="Puste kategorie wyposażenia"
                    icon="mdi-tag-off-outline"
                    :items="report.featureCategoriesEmpty"
                    :columns="[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Kategoria' }, { key: 'vehicleCategoryId', label: 'ID kat. pojazdu' }]"
                />

                <!-- Section: Empty generations (no engine versions) -->
                <ReportSection
                    title="Generacje bez wersji silnikowych"
                    icon="mdi-engine-off"
                    :items="report.generationsEmpty"
                    :columns="[{ key: 'id', label: 'ID' }, { key: 'brandName', label: 'Marka' }, { key: 'modelName', label: 'Model' }, { key: 'name', label: 'Generacja' }, { key: 'yearFrom', label: 'Od' }, { key: 'yearTo', label: 'Do' }]"
                />

                <!-- Section: Duplicate brands -->
                <ReportSection
                    v-if="report.duplicateBrands.length"
                    title="Zduplikowane marki"
                    icon="mdi-content-copy"
                    :items="report.duplicateBrands"
                    :columns="[{ key: 'name', label: 'Nazwa (lowercase)' }, { key: 'count', label: 'Liczba duplikatów' }, { key: 'ids', label: 'ID' }]"
                />

                <!-- Section: Duplicate models -->
                <ReportSection
                    v-if="report.duplicateModels.length"
                    title="Zduplikowane modele (w tej samej marce)"
                    icon="mdi-content-copy"
                    :items="report.duplicateModels"
                    :columns="[{ key: 'brandId', label: 'ID marki' }, { key: 'nameLower', label: 'Nazwa (lowercase)' }, { key: 'count', label: 'Duplikaty' }, { key: 'ids', label: 'ID' }]"
                />

                <!-- Section: Adverts with blank title -->
                <ReportSection
                    title="Ogłoszenia bez tytułu"
                    icon="mdi-text-box-remove-outline"
                    :items="report.advertsWithBlankTitle"
                    :columns="[{ key: 'id', label: 'ID' }, { key: 'title', label: 'Tytuł' }, { key: 'createdAt', label: 'Data dodania', type: 'date' }]"
                />

                <!-- Section: Active adverts without images -->
                <ReportSection
                    title="Aktywne ogłoszenia bez zdjęć (max 50)"
                    icon="mdi-image-off-outline"
                    :items="report.advertsNoImages"
                    :columns="[{ key: 'id', label: 'ID' }, { key: 'title', label: 'Tytuł' }, { key: 'createdAt', label: 'Data dodania', type: 'date' }]"
                />

                <!-- Section: Categories without feature categories -->
                <ReportSection
                    title="Kategorie pojazdów bez wyposażenia"
                    icon="mdi-tag-off-outline"
                    :items="report.categoriesWithoutFeatureCategories"
                    :columns="[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Kategoria' }, { key: 'slug', label: 'Slug' }]"
                />

                <!-- Section: Categories without subtypes -->
                <ReportSection
                    title="Kategorie pojazdów bez podtypów"
                    icon="mdi-shape-off-outline"
                    :items="report.categoriesWithoutSubtypes"
                    :columns="[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Kategoria' }, { key: 'slug', label: 'Slug' }]"
                />

                <!-- Section: Part adverts missing structured category -->
                <ReportSection
                    title="Ogłoszenia części bez kategorii części (max 50)"
                    icon="mdi-cog-off-outline"
                    :items="report.partAdvertsMissingStructuredCategory"
                    :columns="[{ key: 'id', label: 'ID' }, { key: 'title', label: 'Tytuł' }, { key: 'createdAt', label: 'Data dodania', type: 'date' }]"
                />
            </template>
        </main>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })

const loading = ref(false)
const report = ref<any>(null)
const error = ref('')

const summaryItems = computed(() => {
    if (!report.value) return []
    const s = report.value.summary
    return [
        { key: 'brandsWithoutModels',      label: 'Marki bez modeli',              count: s.brandsWithoutModelsCount      },
        { key: 'modelsWithoutGenerations', label: 'Modele bez generacji',          count: s.modelsWithoutGenerationsCount },
        { key: 'brandsWithoutAdverts',     label: 'Marki bez ogłoszeń',            count: s.brandsWithoutAdvertsCount     },
        { key: 'modelsWithoutAdverts',     label: 'Modele bez ogłoszeń',           count: s.modelsWithoutAdvertsCount     },
        { key: 'emptyFeatureCategories',   label: 'Puste kat. wyposażenia',        count: s.emptyFeatureCategoriesCount   },
        { key: 'emptyGenerations',         label: 'Generacje bez silników',        count: s.emptyGenerationsCount         },
        { key: 'duplicateBrands',          label: 'Zduplikowane marki',            count: s.duplicateBrandsCount          },
        { key: 'duplicateModels',          label: 'Zduplikowane modele',           count: s.duplicateModelsCount          },
        { key: 'advertsBlankTitle',        label: 'Ogłoszenia bez tytułu',         count: s.advertsBlankTitleCount        },
        { key: 'advertsNoImages',          label: 'Ogłoszenia bez zdjęć',          count: s.advertsNoImagesCount          },
        { key: 'categoriesWithoutFeatureCategories', label: 'Kategorie bez wyposażenia', count: s.categoriesWithoutFeatureCategoriesCount },
        { key: 'categoriesWithoutSubtypes',          label: 'Kategorie bez podtypów',    count: s.categoriesWithoutSubtypesCount          },
        { key: 'partAdvertsMissingStructuredCategory', label: 'Części bez kategorii', count: s.partAdvertsMissingStructuredCategoryCount },
    ]
})

const infoStats = computed(() => {
    if (!report.value) return []
    return [
        { label: 'Kategorie pojazdów', value: report.value.vehicleCategoryCount },
        { label: 'Reguły wiarygodności silnika', value: report.value.enginePlausibilityRuleCount },
        { label: 'Oczekujące wnioski o kategorię', value: report.value.pendingCustomCategoryRequestCount },
    ]
})

async function runReport() {
    loading.value = true
    error.value = ''
    try {
        report.value = await $fetch('/api/proxy/api/Admin/quality-report')
    } catch (e: any) {
        error.value = e?.data?.message ?? 'Błąd podczas analizy bazy danych.'
    } finally {
        loading.value = false
    }
}
</script>

<!-- Inline ReportSection component -->
<script lang="ts">
const ReportSection = defineComponent({
    props: {
        title: String,
        icon: String,
        items: { type: Array as () => any[], default: () => [] },
        columns: { type: Array as () => { key: string; label: string; type?: string }[], default: () => [] },
    },
    template: `
        <div class="report-section">
            <div class="rs-header">
                <v-icon :icon="icon" size="16" class="rs-icon" />
                <span class="rs-title">{{ title }}</span>
                <span class="rs-count" :class="items.length > 0 ? 'has-issues' : 'ok'">{{ items.length }}</span>
            </div>
            <div v-if="items.length === 0" class="rs-empty">
                <v-icon icon="mdi-check" size="14" /> Brak problemów
            </div>
            <div v-else class="rs-table-wrap">
                <table class="rs-table">
                    <thead>
                        <tr>
                            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, i) in items" :key="i">
                            <td v-for="col in columns" :key="col.key">
                                <span v-if="col.type === 'date'">{{ item[col.key] ? new Date(item[col.key]).toLocaleDateString('pl') : '—' }}</span>
                                <span v-else-if="Array.isArray(item[col.key])">{{ item[col.key].join(', ') }}</span>
                                <span v-else>{{ item[col.key] ?? '—' }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
})
</script>

<style lang="scss" scoped>
@import '../admin/shared-admin.scss';

.admin-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 28px;
}

.btn-run {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: $red;
    color: white;
    border: none;
    border-radius: $r-md;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: opacity 0.18s;

    &:hover:not(:disabled) { opacity: 0.85; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.error-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.3);
    border-radius: $r-md;
    color: $red;
    font-size: 13px;
    padding: 12px 16px;
    margin-bottom: 24px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 80px 32px;
    text-align: center;
    color: $text-dim;
}
.es-icon { color: $text-dark; }
.es-title { font-size: 18px; font-weight: 700; color: $text; }
.es-sub { font-size: 14px; color: $text-dim; }

.summary-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 32px;

    @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
    @media (max-width: 768px)  { grid-template-columns: repeat(2, 1fr); }
}

.summary-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;

    &.has-issues { border-color: rgba($red, 0.4); background: rgba($red, 0.05); }
    &.ok { border-color: rgba(34, 197, 94, 0.3); background: rgba(34, 197, 94, 0.04); }
}

.sc-count { font-size: 26px; font-weight: 800; color: $text; }
.sc-label { font-size: 11px; font-weight: 600; color: $text-dim; text-transform: uppercase; letter-spacing: 0.5px; }
.sc-icon {
    position: absolute;
    top: 12px;
    right: 12px;
    .has-issues & { color: $red; }
    .ok & { color: rgb(34, 197, 94); }
}

.info-stats-row {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.info-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid $border;
    border-radius: $r-md;
}

.is-value { font-size: 18px; font-weight: 800; color: $text; }
.is-label { font-size: 11px; color: $text-dim; }

.report-section {
    background: rgba(255,255,255,0.02);
    border: 1px solid $border;
    border-radius: $r-lg;
    margin-bottom: 16px;
    overflow: hidden;
}

.rs-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-bottom: 1px solid $border;
}
.rs-icon { color: $text-dim; }
.rs-title { flex: 1; font-size: 13px; font-weight: 700; color: $text; }
.rs-count {
    font-size: 12px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 50px;

    &.has-issues { background: rgba($red, 0.15); color: $red; }
    &.ok { background: rgba(34, 197, 94, 0.12); color: rgb(34, 197, 94); }
}

.rs-empty {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 14px 18px;
    font-size: 13px;
    color: rgb(34, 197, 94);
}

.rs-table-wrap {
    overflow-x: auto;
}

.rs-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;

    th {
        padding: 8px 12px;
        text-align: left;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: $text-dim;
        border-bottom: 1px solid $border;
        white-space: nowrap;
    }

    td {
        padding: 8px 12px;
        color: $text-muted;
        border-bottom: 1px solid rgba(255,255,255,0.03);
        white-space: nowrap;
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,0.02); }
}

.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px;
    color: $text-dim;
    font-size: 14px;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
