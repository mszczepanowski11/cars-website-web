// Global geo cascade client (Faza 0). Talks to the public /api/geo/* endpoints that replaced the
// hardcoded Polish voivodeships and the free-text city field. Continents/countries/currencies/
// languages are cached in module scope (they change ~never); regions and cities are fetched on
// demand for the selected country.

export interface GeoCountry {
  id: number; iso2: string; iso3: string; name: string; nativeName: string;
  phonePrefix: string | null; measurementSystem: string; drivingSide: string;
  defaultCurrency: string | null; defaultLanguage: string | null; hasRegions: boolean;
}
export interface GeoRegion { id: number; code: string | null; name: string; type: string }
export interface GeoCity { id: number; name: string; regionId: number | null; latitude: number | null; longitude: number | null }
export interface GeoContinent { id: number; code: string; name: string }
export interface GeoCurrency { id: number; iso: string; symbol: string; name: string; decimals: number; symbolPosition: string }
export interface GeoLanguage { id: number; iso1: string; endonym: string; englishName: string; isRtl: boolean }

const _continents = ref<GeoContinent[]>([])
const _countries = ref<GeoCountry[]>([])
const _currencies = ref<GeoCurrency[]>([])
const _languages = ref<GeoLanguage[]>([])

export function useGeo() {
  const base = '/api/proxy/api/geo'

  async function loadContinents() {
    if (_continents.value.length) return _continents.value
    _continents.value = await $fetch<GeoContinent[]>(`${base}/continents`).catch(() => [])
    return _continents.value
  }

  async function loadCountries(continent?: string) {
    if (!continent && _countries.value.length) return _countries.value
    const list = await $fetch<GeoCountry[]>(`${base}/countries`, { query: continent ? { continent } : {} }).catch(() => [])
    if (!continent) _countries.value = list
    return list
  }

  async function loadCurrencies() {
    if (_currencies.value.length) return _currencies.value
    _currencies.value = await $fetch<GeoCurrency[]>(`${base}/currencies`).catch(() => [])
    return _currencies.value
  }

  async function loadLanguages() {
    if (_languages.value.length) return _languages.value
    _languages.value = await $fetch<GeoLanguage[]>(`${base}/languages`).catch(() => [])
    return _languages.value
  }

  // country = ISO2 ("PL") or numeric id
  async function loadRegions(country: string | number): Promise<GeoRegion[]> {
    if (!country) return []
    return await $fetch<GeoRegion[]>(`${base}/regions`, { query: { country } }).catch(() => [])
  }

  // Typeahead: pass q to filter; region narrows within a country. Sorted by population server-side.
  async function loadCities(country: string | number, opts: { region?: number | null; q?: string; limit?: number } = {}): Promise<GeoCity[]> {
    if (!country) return []
    const query: Record<string, any> = { country }
    if (opts.region) query.region = opts.region
    if (opts.q) query.q = opts.q
    if (opts.limit) query.limit = opts.limit
    return await $fetch<GeoCity[]>(`${base}/cities`, { query }).catch(() => [])
  }

  return {
    continents: _continents, countries: _countries, currencies: _currencies, languages: _languages,
    loadContinents, loadCountries, loadCurrencies, loadLanguages, loadRegions, loadCities,
  }
}
