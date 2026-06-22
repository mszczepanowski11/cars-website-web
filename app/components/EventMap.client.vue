<template>
    <div class="event-map-wrap">
        <div v-if="loading" class="map-loading">
            <v-icon icon="mdi-loading" size="22" class="spin" />
            Ładowanie mapy...
        </div>
        <div v-else-if="error" class="map-error">
            <v-icon icon="mdi-map-marker-off-outline" size="20" />
            Nie można wczytać mapy
        </div>
        <div v-else ref="mapContainer" class="map-container" />
    </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import type * as L from 'leaflet'

const props = defineProps<{ address: string; city: string }>()

const mapContainer = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref(false)

let mapInstance: L.Map | null = null

async function geocode(query: string): Promise<[number, number] | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
        const res = await fetch(url, { headers: { 'Accept-Language': 'pl', 'User-Agent': 'Carizo/1.0 (carizo.pl)' } })
        const data = await res.json()
        if (data?.[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    } catch { }
    return null
}

onMounted(async () => {
    const L = await import('leaflet')

    // Fix default marker icons (webpack/vite asset issue)
    const iconDefault = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    })

    const query = [props.address, props.city].filter(Boolean).join(', ')
    const coords = await geocode(query) ?? await geocode(props.city)

    if (!coords) {
        loading.value = false
        error.value = true
        return
    }

    loading.value = false
    await nextTick()

    if (!mapContainer.value) return

    mapInstance = L.map(mapContainer.value, { zoomControl: true, scrollWheelZoom: false }).setView(coords, 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(mapInstance)

    L.marker(coords, { icon: iconDefault })
        .addTo(mapInstance)
        .bindPopup(`<b>${props.city}</b><br>${props.address}`)
        .openPopup()
})

onBeforeUnmount(() => {
    mapInstance?.remove()
    mapInstance = null
})
</script>

<style scoped>
.event-map-wrap {
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #1a1a1a;
}

.map-container {
    width: 100%;
    height: 260px;
}

.map-loading,
.map-error {
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #777;
    font-size: 13px;
    background: #080808;
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
