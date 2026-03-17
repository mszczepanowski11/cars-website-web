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

export interface Advert {
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

defineProps<{ advert: Advert }>()

</script>

<template>
    <div>

        <h3>{{ advert.title }}</h3>
        <p>{{ advert.price }} PLN</p>
        <p>{{ advert.location }}</p>
        <p>{{ advert.advertType }}</p>

        <div v-if="advert.vehicleDetails">
            <p>
                {{ advert.vehicleDetails.brand }}
                {{ advert.vehicleDetails.model }}
                ({{ advert.vehicleDetails.year }})
            </p>
            <p>
                {{ advert.vehicleDetails.mileage }} km •
                {{ advert.vehicleDetails.fuelType }} •
                {{ advert.vehicleDetails.transmission }}
            </p>
            <p>{{ advert.vehicleDetails.horsePower }} KM • {{ advert.vehicleDetails.engineSize }} cc</p>
            <p>Kolor: {{ advert.vehicleDetails.color }}</p>
            <p>Stan: {{ advert.vehicleDetails.condition }}</p>
        </div>

        <p>Sprzedający: {{ advert.sellerName }}</p>
        <p>Tel: {{ advert.sellerPhone }}</p>

        <NuxtLink :to="`/advert/${advert.id}`">Zobacz ogłoszenie →</NuxtLink>


    </div>
</template>