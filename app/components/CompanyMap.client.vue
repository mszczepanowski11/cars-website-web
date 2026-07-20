<template>
  <div class="cmap-wrap">
    <div v-if="loading" class="cmap-msg"><v-icon icon="mdi-loading" size="22" class="spin" /> Ładowanie mapy…</div>
    <div v-else-if="points.length === 0" class="cmap-msg">
      <v-icon icon="mdi-map-marker-off-outline" size="22" />
      Brak firm z lokalizacją na mapie dla wybranych filtrów.
    </div>
    <div v-show="!loading && points.length" ref="mapContainer" class="cmap-container" />
  </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import type * as L from 'leaflet'

interface MapPoint {
  publicId: string; slug: string; name: string; category: string; city?: string | null;
  latitude: number; longitude: number
}

const props = defineProps<{ category?: string | null; country?: string | null }>()

const mapContainer = ref<HTMLElement | null>(null)
const loading = ref(true)
const points = ref<MapPoint[]>([])
let mapInstance: L.Map | null = null
let markerLayer: L.LayerGroup | null = null
let Lref: typeof L | null = null

async function fetchPoints() {
  loading.value = true
  try {
    points.value = await $fetch<MapPoint[]>('/api/proxy/api/directory/map', {
      query: { category: props.category || undefined, country: props.country || undefined },
    })
  } catch { points.value = [] }
  finally { loading.value = false }
}

function renderMarkers() {
  if (!Lref || !mapInstance) return
  markerLayer?.remove()
  markerLayer = Lref.layerGroup().addTo(mapInstance)
  if (points.value.length === 0) return

  const bounds: [number, number][] = []
  for (const p of points.value) {
    const coords: [number, number] = [p.latitude, p.longitude]
    bounds.push(coords)
    Lref.marker(coords, { icon: markerIcon() })
      .addTo(markerLayer)
      .bindPopup(`<b>${escapeHtml(p.name)}</b>${p.city ? '<br>' + escapeHtml(p.city) : ''}<br><a href="/firmy/${p.slug}">Zobacz profil →</a>`)
  }
  if (bounds.length === 1) mapInstance.setView(bounds[0], 12)
  else mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
}

function markerIcon() {
  return Lref!.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  })
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

onMounted(async () => {
  Lref = await import('leaflet')
  await fetchPoints()
  await nextTick()
  if (!mapContainer.value) return
  // Centre on Europe until markers fit the view.
  mapInstance = Lref.map(mapContainer.value, { zoomControl: true, scrollWheelZoom: false }).setView([52, 13], 4)
  Lref.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19,
  }).addTo(mapInstance)
  renderMarkers()
})

// Re-fetch and re-render when filters change.
watch(() => [props.category, props.country], async () => {
  await fetchPoints()
  renderMarkers()
})

onBeforeUnmount(() => { mapInstance?.remove(); mapInstance = null })
</script>

<style scoped>
.cmap-wrap { width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid #1a1a1a; }
.cmap-container { width: 100%; height: 560px; }
.cmap-msg {
  height: 300px; display: flex; align-items: center; justify-content: center; gap: 8px;
  color: #888; font-size: 14px; background: #080808; text-align: center; padding: 20px;
}
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
