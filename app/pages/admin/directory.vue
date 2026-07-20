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
        <NuxtLink to="/admin/attributes" class="nav-item"><v-icon icon="mdi-form-select" size="17" />Pola kategorii</NuxtLink>
        <NuxtLink to="/admin/partners" class="nav-item"><v-icon icon="mdi-handshake-outline" size="17" />Partnerzy API</NuxtLink>
        <NuxtLink to="/admin/directory" class="nav-item active"><v-icon icon="mdi-domain" size="17" />Katalog firm</NuxtLink>
        <NuxtLink to="/admin/quality-report" class="nav-item"><v-icon icon="mdi-database-check-outline" size="17" />Jakość danych</NuxtLink>
        <div class="nav-divider" />
        <NuxtLink to="/dashboard" class="nav-item"><v-icon icon="mdi-arrow-left" size="17" />Wróć do panelu</NuxtLink>
      </nav>
    </aside>

    <main class="admin-main">
      <div class="admin-topbar">
        <div>
          <h1 class="page-title">Katalog firm (Business Directory)</h1>
          <p class="topbar-count">Publiczna baza firm z globalnym Carizo ID. Zarządzaj wpisami, weryfikuj i importuj nowe źródła.</p>
        </div>
        <div class="topbar-actions">
          <button class="dr-btn dr-btn--ghost" @click="openImport = !openImport"><v-icon icon="mdi-upload" size="16" /> Import</button>
          <button class="dr-btn dr-btn--primary" @click="openCreate()"><v-icon icon="mdi-plus" size="16" /> Dodaj firmę</button>
        </div>
      </div>

      <!-- Import panel -->
      <div v-if="openImport" class="dr-import">
        <h3 class="dr-import-h">Import firm (CSV lub JSON)</h3>
        <p class="dr-import-note">
          Wklej dane. <strong>CSV</strong>: nagłówek <code>name,category,countryCode,city,address,postalCode,phone,email,website</code> (wymagana tylko <code>name</code>).
          <strong>JSON</strong>: tablica obiektów z tymi polami. Deduplikacja po nazwie — ponowny import uzupełnia braki, nie tworzy duplikatów.
        </p>
        <div class="dr-import-row">
          <label>Domyślna kategoria</label>
          <select v-model="importDefaultCat" class="dr-input dr-input--sm">
            <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
          <label>Źródło (tag)</label>
          <input v-model="importSource" class="dr-input dr-input--sm" placeholder="import:manual" />
        </div>
        <textarea v-model="importText" class="dr-textarea" rows="8"
          placeholder="name,category,city,email&#10;Auto Nowak,komisy,Kraków,biuro@autonowak.pl"></textarea>
        <div class="dr-import-actions">
          <span v-if="importPreviewCount !== null" class="dr-import-preview">Rozpoznano wierszy: <strong>{{ importPreviewCount }}</strong></span>
          <button class="dr-btn dr-btn--ghost" @click="previewImport">Podgląd</button>
          <button class="dr-btn dr-btn--primary" :disabled="importing || !importText.trim()" @click="runImport">
            <v-icon v-if="importing" icon="mdi-loading" size="15" class="spin" /> Importuj
          </button>
        </div>
        <div v-if="importResult" class="dr-import-result">
          ✅ Utworzono <strong>{{ importResult.created }}</strong>, uzupełniono <strong>{{ importResult.updated }}</strong>, pominięto <strong>{{ importResult.skipped }}</strong> (z {{ importResult.received }}).
        </div>
      </div>

      <!-- Filters -->
      <div class="dr-filters">
        <div class="search-bar">
          <v-icon icon="mdi-magnify" size="16" class="sb-icon" />
          <input v-model="searchInput" class="sb-input" placeholder="Szukaj firmy…" @keyup.enter="applyFilters" />
        </div>
        <div class="filter-tabs">
          <button v-for="s in STATUSES" :key="s.value" class="filter-tab" :class="{ active: statusFilter === s.value }" @click="statusFilter = s.value; applyFilters()">
            {{ s.label }}
          </button>
        </div>
        <select v-model="categoryFilter" class="dr-input dr-input--sm" @change="applyFilters">
          <option value="">Wszystkie kategorie</option>
          <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
      </div>

      <div v-if="loading" class="loading-state"><v-icon icon="mdi-loading" size="20" class="spin" /> Ładowanie…</div>

      <div v-else-if="items.length === 0" class="empty-state">
        <v-icon icon="mdi-domain" size="40" class="empty-icon" />
        Brak firm dla wybranych filtrów.
      </div>

      <table v-else class="dr-table">
        <thead>
          <tr><th>Nazwa</th><th>Kategoria</th><th>Lokalizacja</th><th>Status</th><th>Źródło</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="co in items" :key="co.publicId">
            <td>
              <div class="dr-name">{{ co.name }}</div>
              <div class="dr-pubid">{{ co.publicId }}</div>
            </td>
            <td>{{ categoryLabel(co.category) }}</td>
            <td>{{ [co.city, co.countryCode].filter(Boolean).join(', ') || '—' }}</td>
            <td><span class="dr-status" :class="`dr-status--${co.status}`">{{ statusLabel(co.status) }}</span></td>
            <td class="dr-source">{{ co.source || '—' }}</td>
            <td class="dr-actions">
              <button v-if="co.status !== 'active'" class="dr-mini dr-mini--ok" title="Zatwierdź" @click="verify(co)"><v-icon icon="mdi-check" size="15" /></button>
              <button class="dr-mini" title="Edytuj" @click="openEdit(co)"><v-icon icon="mdi-pencil" size="15" /></button>
              <button v-if="co.status !== 'closed'" class="dr-mini dr-mini--danger" title="Zamknij" @click="close(co)"><v-icon icon="mdi-close" size="15" /></button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page <= 1" @click="page--; load()"><v-icon icon="mdi-chevron-left" size="18" /></button>
        <span class="page-info">Strona {{ page }} z {{ totalPages }}</span>
        <button class="page-btn" :disabled="page >= totalPages" @click="page++; load()"><v-icon icon="mdi-chevron-right" size="18" /></button>
      </div>
    </main>

    <!-- Edit / create modal -->
    <div v-if="editing" class="dr-modal-overlay" @click.self="editing = null">
      <div class="dr-modal">
        <h3 class="dr-modal-h">{{ editingIsNew ? 'Dodaj firmę' : 'Edytuj firmę' }}</h3>
        <div class="dr-form">
          <label>Nazwa *</label>
          <input v-model="form.name" class="dr-input" />
          <label>Kategoria *</label>
          <select v-model="form.category" class="dr-input">
            <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
          <div class="dr-form-grid">
            <div><label>Kraj (ISO)</label><input v-model="form.countryCode" class="dr-input" placeholder="PL" maxlength="2" /></div>
            <div><label>Miasto</label><input v-model="form.city" class="dr-input" /></div>
          </div>
          <label>Adres</label>
          <input v-model="form.address" class="dr-input" />
          <div class="dr-form-grid">
            <div><label>Kod pocztowy</label><input v-model="form.postalCode" class="dr-input" /></div>
            <div><label>Telefon</label><input v-model="form.phone" class="dr-input" /></div>
          </div>
          <label>E-mail</label>
          <input v-model="form.email" class="dr-input" />
          <label>Strona WWW</label>
          <input v-model="form.website" class="dr-input" />
          <label>Opis (o firmie)</label>
          <textarea v-model="form.description" class="dr-input" rows="3"></textarea>
          <label>Status</label>
          <select v-model="form.status" class="dr-input">
            <option value="active">Zweryfikowana (active)</option>
            <option value="unverified">Niezweryfikowana</option>
            <option value="closed">Zamknięta</option>
          </select>
        </div>
        <div class="dr-modal-actions">
          <button class="dr-btn dr-btn--ghost" @click="editing = null">Anuluj</button>
          <button class="dr-btn dr-btn--primary" :disabled="saving || !form.name.trim() || !form.category" @click="save">
            <v-icon v-if="saving" icon="mdi-loading" size="15" class="spin" /> Zapisz
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useHead({ title: 'Katalog firm — Panel Admina CARIZO' })

interface DirCompany {
  publicId: string; slug: string; name: string; category: string;
  countryCode?: string | null; city?: string | null; website?: string | null;
  status: string; source?: string | null;
}

const CATEGORIES = [
  { value: 'komisy', label: 'Komisy samochodowe' }, { value: 'dealerzy', label: 'Dealerzy' },
  { value: 'warsztaty', label: 'Warsztaty' }, { value: 'wulkanizacje', label: 'Wulkanizacje' },
  { value: 'detailing', label: 'Detailing' }, { value: 'transport', label: 'Transport i spedycja' },
  { value: 'leasing', label: 'Leasing' }, { value: 'ubezpieczenia', label: 'Ubezpieczenia' },
  { value: 'skp', label: 'Stacje kontroli' }, { value: 'myjnie', label: 'Myjnie' },
  { value: 'czesci', label: 'Części' }, { value: 'maszyny', label: 'Maszyny' },
  { value: 'jachty', label: 'Jachty i łodzie' }, { value: 'firmy', label: 'Pozostałe firmy' },
]
function categoryLabel(v: string) { return CATEGORIES.find(c => c.value === v)?.label ?? v }

const STATUSES = [
  { value: '', label: 'Wszystkie' }, { value: 'unverified', label: 'Niezweryfikowane' },
  { value: 'active', label: 'Zweryfikowane' }, { value: 'closed', label: 'Zamknięte' },
]
function statusLabel(v: string) {
  return { active: 'zweryfikowana', unverified: 'niezweryfikowana', closed: 'zamknięta' }[v] ?? v
}

const items = ref<DirCompany[]>([])
const total = ref(0)
const page = ref(1)
const PAGE_SIZE = 30
const loading = ref(false)
const searchInput = ref('')
const searchQ = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))

async function load() {
  loading.value = true
  try {
    const res = await $fetch<{ items: DirCompany[]; total: number }>('/api/proxy/api/directory', {
      query: {
        q: searchQ.value || undefined,
        status: statusFilter.value || undefined,
        category: categoryFilter.value || undefined,
        page: page.value, pageSize: PAGE_SIZE,
      },
    })
    items.value = res.items
    total.value = res.total
  } catch { useToast().error('Nie udało się wczytać katalogu.') }
  finally { loading.value = false }
}
function applyFilters() { searchQ.value = searchInput.value.trim(); page.value = 1; load() }

// ── Edit / create ─────────────────────────────────────────────
const editing = ref<DirCompany | null>(null)
const editingIsNew = ref(false)
const saving = ref(false)
const form = reactive({
  name: '', category: 'firmy', countryCode: 'PL', city: '', address: '',
  postalCode: '', phone: '', email: '', website: '', description: '', status: 'active',
})
function resetForm() {
  Object.assign(form, { name: '', category: 'firmy', countryCode: 'PL', city: '', address: '', postalCode: '', phone: '', email: '', website: '', description: '', status: 'active' })
}
function openCreate() { resetForm(); editingIsNew.value = true; editing.value = {} as DirCompany }
async function openEdit(co: DirCompany) {
  editingIsNew.value = false
  editing.value = co
  // Pull full detail for the fields the list doesn't carry.
  try {
    const d = await $fetch<any>(`/api/proxy/api/directory/${co.slug}`)
    Object.assign(form, {
      name: d.name ?? '', category: d.category ?? 'firmy', countryCode: d.countryCode ?? '',
      city: d.city ?? '', address: d.address ?? '', postalCode: d.postalCode ?? '',
      phone: d.phone ?? '', email: d.email ?? '', website: d.website ?? '',
      description: d.description ?? '', status: d.status ?? 'active',
    })
  } catch { /* keep whatever the list gave us */ }
}
async function save() {
  saving.value = true
  try {
    if (editingIsNew.value) {
      await $fetch('/api/proxy/api/directory', { method: 'POST', body: { ...form } })
      useToast().success('Firma dodana.')
    } else {
      await $fetch(`/api/proxy/api/directory/${(editing.value as DirCompany).slug}`, { method: 'PUT', body: { ...form } })
      useToast().success('Zapisano zmiany.')
    }
    editing.value = null
    load()
  } catch { useToast().error('Nie udało się zapisać.') }
  finally { saving.value = false }
}

async function verify(co: DirCompany) {
  try {
    const d = await $fetch<any>(`/api/proxy/api/directory/${co.slug}`)
    await $fetch(`/api/proxy/api/directory/${co.slug}`, { method: 'PUT', body: { ...d, status: 'active' } })
    useToast().success(`Zatwierdzono: ${co.name}`)
    load()
  } catch { useToast().error('Nie udało się zatwierdzić.') }
}
async function close(co: DirCompany) {
  if (!confirm(`Zamknąć wpis „${co.name}"? Zniknie z publicznego katalogu (Carizo ID zostaje).`)) return
  try {
    await $fetch(`/api/proxy/api/directory/${co.slug}`, { method: 'DELETE' })
    useToast().success('Wpis zamknięty.')
    load()
  } catch { useToast().error('Nie udało się zamknąć.') }
}

// ── Import ─────────────────────────────────────────────────────
const openImport = ref(false)
const importText = ref('')
const importDefaultCat = ref('firmy')
const importSource = ref('import:manual')
const importing = ref(false)
const importPreviewCount = ref<number | null>(null)
const importResult = ref<{ received: number; created: number; updated: number; skipped: number } | null>(null)

function parseRows(): any[] {
  const text = importText.value.trim()
  if (!text) return []
  if (text.startsWith('[')) {
    try { const a = JSON.parse(text); return Array.isArray(a) ? a : [] } catch { return [] }
  }
  // CSV: first line = header
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = splitCsv(lines[0]).map(h => h.trim())
  return lines.slice(1).map(line => {
    const cells = splitCsv(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { if (h && cells[i] !== undefined) obj[h] = cells[i].trim() })
    return obj
  }).filter(o => o.name)
}
function splitCsv(line: string): string[] {
  const out: string[] = []; let cur = ''; let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++ } else inQ = !inQ }
    else if (ch === ',' && !inQ) { out.push(cur); cur = '' }
    else cur += ch
  }
  out.push(cur)
  return out
}
function previewImport() { importPreviewCount.value = parseRows().length }
async function runImport() {
  const rows = parseRows()
  if (rows.length === 0) { useToast().error('Nie rozpoznano żadnych wierszy.'); return }
  importing.value = true
  importResult.value = null
  try {
    const res = await $fetch<any>('/api/proxy/api/directory/import', {
      method: 'POST',
      body: { rows, source: importSource.value || 'import:manual', defaultCategory: importDefaultCat.value },
    })
    importResult.value = res
    useToast().success(`Import: +${res.created} nowych, ${res.updated} uzupełnionych.`)
    load()
  } catch { useToast().error('Import nie powiódł się.') }
  finally { importing.value = false }
}

onMounted(load)
</script>

<style lang="scss" scoped>
@import './shared-admin.scss';

.dr-btn {
  display: inline-flex; align-items: center; gap: 6px; border-radius: $r-sm; padding: 8px 14px;
  font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid $border; transition: all .2s;
  &--primary { background: $red; color: #fff; border-color: $red; &:hover:not(:disabled) { filter: brightness(1.1); } }
  &--ghost { background: transparent; color: $text-muted; &:hover { border-color: rgba($red,.4); color: $text; } }
  &:disabled { opacity: .5; cursor: not-allowed; }
}

.dr-filters { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
.dr-input {
  background: #0d0d0d; border: 1px solid $border; border-radius: $r-sm; color: $text; padding: 9px 12px;
  font-size: 13px; width: 100%; outline: none;
  &:focus { border-color: rgba($red,.4); }
  &--sm { width: auto; padding: 8px 10px; }
}

.dr-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.dr-table th { text-align: left; padding: 10px 12px; color: $text-dim; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid $border; }
.dr-table td { padding: 12px; border-bottom: 1px solid $border; color: $text-muted; vertical-align: middle; }
.dr-name { color: $text; font-weight: 600; }
.dr-pubid { font-family: monospace; font-size: 10.5px; color: $text-dark; margin-top: 2px; }
.dr-source { font-family: monospace; font-size: 11px; color: $text-dim; }
.dr-status { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; text-transform: uppercase; letter-spacing: .3px;
  &--active { color: #2e9d5b; background: rgba(#2e9d5b,.14); }
  &--unverified { color: #b6791b; background: rgba(#b6791b,.14); }
  &--closed { color: $text-dark; background: rgba(#888,.14); }
}
.dr-actions { display: flex; gap: 6px; justify-content: flex-end; }
.dr-mini {
  display: grid; place-items: center; width: 30px; height: 30px; border-radius: 7px; cursor: pointer;
  background: transparent; border: 1px solid $border; color: $text-muted;
  &:hover { border-color: rgba($red,.4); color: $text; }
  &--ok:hover { border-color: #2e9d5b; color: #2e9d5b; }
  &--danger:hover { border-color: #c23a34; color: #c23a34; }
}

.dr-import { background: #0d0d0d; border: 1px solid $border; border-radius: $r-md; padding: 18px; margin-bottom: 20px; }
.dr-import-h { color: $text; font-size: 15px; margin: 0 0 8px; }
.dr-import-note { color: $text-dim; font-size: 12.5px; margin: 0 0 14px; line-height: 1.5; code { background: #1a1a1a; padding: 1px 5px; border-radius: 3px; font-size: 11px; } }
.dr-import-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; label { font-size: 12px; color: $text-dim; } }
.dr-textarea { width: 100%; background: #080808; border: 1px solid $border; border-radius: $r-sm; color: $text; padding: 12px; font-family: monospace; font-size: 12px; resize: vertical; outline: none; &:focus { border-color: rgba($red,.4); } }
.dr-import-actions { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
.dr-import-preview { font-size: 13px; color: $text-muted; margin-right: auto; }
.dr-import-result { margin-top: 12px; color: $text; font-size: 13px; background: rgba(#2e9d5b,.1); border: 1px solid rgba(#2e9d5b,.3); border-radius: $r-sm; padding: 10px 14px; }

.dr-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); display: grid; place-items: center; z-index: 100; padding: 20px; }
.dr-modal { background: #0d0d0d; border: 1px solid $border; border-radius: $r-md; padding: 24px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
.dr-modal-h { color: $text; font-size: 18px; margin: 0 0 18px; }
.dr-form { display: flex; flex-direction: column; gap: 6px; label { font-size: 12px; color: $text-dim; margin-top: 6px; } }
.dr-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dr-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
