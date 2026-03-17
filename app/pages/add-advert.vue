<script setup lang="ts">

const config = useRuntimeConfig()
const token = useCookie('auth_token')

const loading = ref(false)
const error = ref('')

const form = ref({
    advertType: 'Vehicle',
    title: '',
    price: 0,
    description: '',
    location: '',
    images: [] as string[],
    vehicleDetails: {
        vehicleType: '',
        brand: '',
        model: '',
        year: null,
        mileage: null,
        fuelType: '',
        transmission: '',
        condition: '',
        color: '',
        engineSize: null,
        horsePower: null
    },

    partDetails: {
        category: '',
        partNumber: '',
        condition: '',
        compatibleBrand: '',
        compatibleModel: '',
        compatibleYearFrom: null,
        compatibleYearTo: null
    }
})

async function handleSubmit() {
    loading.value = true
    error.value = ''

    try {
        const body = {
            advertType: form.value.advertType,
            title: form.value.title,
            price: form.value.price,
            description: form.value.description,
            location: form.value.location,
            images: form.value.images,
            vehicleDetails: form.value.advertType === 'Vehicle' ? { ...form.value.vehicleDetails } : null,
            partDetails: form.value.advertType === 'Part' ? { ...form.value.partDetails } : null
        }

        await $fetch(`${config.public.apiBase}api/Advert`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.value}`
            }
        })

        await navigateTo('/my-adverts')
    } catch (err: any) {
        error.value = err?.data || 'Nie udało się dodać ogłoszenia'
    } finally {
        loading.value = false
    }
}

</script>

<template>
    <form @submit.prevent="handleSubmit">

        <div>
            <label>Typ ogłoszenia</label>
            <select v-model="form.advertType">
                <option value="Vehicle">Pojazd</option>
                <option value="Part">Część</option>
            </select>
        </div>

        <div>
            <label>Tytuł</label>
            <input v-model="form.title" type="text" placeholder="Tytuł ogłoszenia" required />
        </div>

        <div>
            <label>Cena (PLN)</label>
            <input v-model="form.price" type="number" placeholder="Cena" required />
        </div>

        <div>
            <label>Opis</label>
            <textarea v-model="form.description" placeholder="Opis ogłoszenia" required />
        </div>

        <div>
            <label>Lokalizacja</label>
            <input v-model="form.location" type="text" placeholder="Miasto, region" required />
        </div>



        <div v-if="form.advertType === 'Vehicle'">
            <h3>Szczegóły pojazdu</h3>

            <div>
                <label>Typ pojazdu</label>
                <select v-model="form.vehicleDetails.vehicleType">
                    <option value="Car">Samochód</option>
                    <option value="Motorcycle">Motocykl</option>
                    <option value="Tractor">Traktor</option>
                    <option value="Truck">Ciężarówka</option>
                    <option value="Van">Van</option>
                </select>
            </div>

            <div>
                <label>Marka</label>
                <input v-model="form.vehicleDetails.brand" type="text" placeholder="np. BMW" />
            </div>

            <div>
                <label>Model</label>
                <input v-model="form.vehicleDetails.model" type="text" placeholder="np. 3 Series" />
            </div>

            <div>
                <label>Rok produkcji</label>
                <input v-model="form.vehicleDetails.year" type="number" placeholder="np. 2020" />
            </div>

            <div>
                <label>Przebieg (km)</label>
                <input v-model="form.vehicleDetails.mileage" type="number" placeholder="np. 50000" />
            </div>

            <div>
                <label>Rodzaj paliwa</label>
                <select v-model="form.vehicleDetails.fuelType">
                    <option value="Petrol">Benzyna</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Elektryczny</option>
                    <option value="Hybrid">Hybryda</option>
                    <option value="LPG">LPG</option>
                    <option value="Hydrogen">Wodór</option>
                </select>
            </div>

            <div>
                <label>Skrzynia biegów</label>
                <select v-model="form.vehicleDetails.transmission">
                    <option value="Manual">Manualna</option>
                    <option value="Automatic">Automatyczna</option>
                    <option value="SemiAutomatic">Półautomatyczna</option>
                </select>
            </div>

            <div>
                <label>Stan</label>
                <select v-model="form.vehicleDetails.condition">
                    <option value="New">Nowy</option>
                    <option value="Used">Używany</option>
                    <option value="Damaged">Uszkodzony</option>
                </select>
            </div>

            <div>
                <label>Kolor</label>
                <input v-model="form.vehicleDetails.color" type="text" placeholder="np. Czarny" />
            </div>

            <div>
                <label>Pojemność silnika (cc)</label>
                <input v-model="form.vehicleDetails.engineSize" type="number" placeholder="np. 1998" />
            </div>

            <div>
                <label>Moc (KM)</label>
                <input v-model="form.vehicleDetails.horsePower" type="number" placeholder="np. 150" />
            </div>
        </div>


        <div v-if="form.advertType === 'Part'">
            <h3>Szczegóły części</h3>

            <div>
                <label>Kategoria</label>
                <select v-model="form.partDetails.category">
                    <option value="Engine">Silnik</option>
                    <option value="Brakes">Hamulce</option>
                    <option value="Suspension">Zawieszenie</option>
                    <option value="Body">Nadwozie</option>
                    <option value="Interior">Wnętrze</option>
                    <option value="Electronics">Elektronika</option>
                    <option value="Exhaust">Układ wydechowy</option>
                    <option value="Transmission">Skrzynia biegów</option>
                    <option value="Cooling">Chłodzenie</option>
                    <option value="Lighting">Oświetlenie</option>
                    <option value="Wheels">Koła</option>
                </select>
            </div>

            <div>
                <label>Numer części</label>
                <input v-model="form.partDetails.partNumber" type="text" placeholder="np. OEM-12345" />
            </div>

            <div>
                <label>Stan</label>
                <select v-model="form.partDetails.condition">
                    <option value="New">Nowa</option>
                    <option value="Used">Używana</option>
                    <option value="Damaged">Uszkodzona</option>
                </select>
            </div>

            <div>
                <label>Pasuje do marki</label>
                <input v-model="form.partDetails.compatibleBrand" type="text" placeholder="np. BMW" />
            </div>

            <div>
                <label>Pasuje do modelu</label>
                <input v-model="form.partDetails.compatibleModel" type="text" placeholder="np. 3 Series" />
            </div>

            <div>
                <label>Rocznik od</label>
                <input v-model="form.partDetails.compatibleYearFrom" type="number" placeholder="np. 2015" />
            </div>

            <div>
                <label>Rocznik do</label>
                <input v-model="form.partDetails.compatibleYearTo" type="number" placeholder="np. 2020" />
            </div>
        </div>

        <p v-if="error">{{ error }}</p>

        <button type="submit" :disabled="loading">
            {{ loading ? 'Dodawanie...' : 'Dodaj ogłoszenie' }}
        </button>

    </form>
</template>