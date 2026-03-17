<script setup lang="ts">
interface VehicleDetails {
    vehicleType: string
    brand: string
    model: string
    year: number
    mileage: number
    fuelType: string
    transmission: string
    condition: string
    color: string
    engineSize: number
    horsePower: number
}

interface PartDetails {
    category: string
    partNumber: string
    condition: string
    compatibleBrand: string
    compatibleModel: string
    compatibleYearFrom: number
    compatibleYearTo: number
}

interface Advert {
    id: number
    advertType: string
    title: string
    price: number
    description: string
    location: string
    images: string[]
    createdAt: string
    isActive: boolean
    sellerName: string
    sellerPhone: string
    vehicleDetails: VehicleDetails | null
    partDetails: PartDetails | null
}

interface User {
    id: number
    name: string
}

const config = useRuntimeConfig()
const token = useCookie('auth_token')
const route = useRoute()
const deleteLoading = ref(false)
const deleteError = ref('')

const { data: advert, pending, error } = await useFetch<Advert>(
    `${config.public.apiBase}api/Advert/${route.params.id}`,
    {
        headers: { Authorization: `Bearer ${token.value}` }
    }
)

const { data: currentUser } = await useFetch<User>(
    `${config.public.apiBase}api/User/me`,
    {
        headers: { Authorization: `Bearer ${token.value}` }
    }
)


async function handleDelete() {
    if (!confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) return

    deleteLoading.value = true
    deleteError.value = ''

    try {
        await $fetch(`${config.public.apiBase}api/Advert/${route.params.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token.value}` }
        })

        await navigateTo('/my-adverts')
    } catch (err: any) {
        deleteError.value = 'Nie udało się usunąć ogłoszenia'
    } finally {
        deleteLoading.value = false
    }
}

</script>
<template>
    <div>
        <div v-if="pending">Ładowanie ogłoszenia...</div>
        <div v-else-if="error">Nie znaleziono ogłoszenia.</div>

        <h1>{{ advert.title }}</h1>
        <h2>{{ advert.price }} PLN</h2>
        <p> {{ advert.location }}</p>
        <p>Dodano: {{ new Date(advert.createdAt).toLocaleDateString('pl-PL') }}</p>
        <p>Typ: {{ advert.advertType === 'Vehicle' ? 'Pojazd' : 'Część' }}</p>

        <div v-if="advert.vehicleDetails">
            <h3>Szczegóły pojazdu</h3>
            <table>
                <tr>
                    <td>Typ pojazdu</td>
                    <td>{{ advert.vehicleDetails.vehicleType }}</td>
                </tr>
                <tr>
                    <td>Marka</td>
                    <td>{{ advert.vehicleDetails.brand }}</td>
                </tr>
                <tr>
                    <td>Model</td>
                    <td>{{ advert.vehicleDetails.model }}</td>
                </tr>
                <tr>
                    <td>Rok produkcji</td>
                    <td>{{ advert.vehicleDetails.year }}</td>
                </tr>
                <tr>
                    <td>Przebieg</td>
                    <td>{{ advert.vehicleDetails.mileage }} km</td>
                </tr>
                <tr>
                    <td>Paliwo</td>
                    <td>{{ advert.vehicleDetails.fuelType }}</td>
                </tr>
                <tr>
                    <td>Skrzynia biegów</td>
                    <td>{{ advert.vehicleDetails.transmission }}</td>
                </tr>
                <tr>
                    <td>Stan</td>
                    <td>{{ advert.vehicleDetails.condition }}</td>
                </tr>
                <tr>
                    <td>Kolor</td>
                    <td>{{ advert.vehicleDetails.color }}</td>
                </tr>
                <tr>
                    <td>Pojemność silnika</td>
                    <td>{{ advert.vehicleDetails.engineSize }} cc</td>
                </tr>
                <tr>
                    <td>Moc</td>
                    <td>{{ advert.vehicleDetails.horsePower }} KM</td>
                </tr>
            </table>
        </div>

        <div>
            <h3>Opis</h3>
            <p>{{ advert.description }}</p>
        </div>

        <div>
            <h3>Sprzedający</h3>
            <p>{{ advert.sellerName }}</p>
            <p>{{ advert.sellerPhone }}</p>
        </div>

          <button
                    @click="handleDelete"
                    :disabled="deleteLoading"
                >
                    {{ deleteLoading ? 'Usuwanie...' : 'Usuń ogłoszenie' }}
                </button>
 
                <p v-if="deleteError">{{ deleteError }}</p>
    </div>
</template>