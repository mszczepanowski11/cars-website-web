// Normalizes a raw CarAdvertResponseDto (as returned by the .NET API) into the flat shape the
// ad-card template needs. Every field is derived defensively - adverts entered before the
// taxonomy rebuild (or added manually without a matched EngineVersion) may be missing any of
// these, and the template must still render something reasonable rather than blank cells.
export interface AdCardData {
    brand: string
    model: string
    year: string
    title: string
    priceText: string
    engineLabel: string | null
    powerLabel: string | null
    driveLabel: string | null
    photoUrl: string | null
    ctaUrl: string
}

function formatPrice(advert: any): string {
    const n = typeof advert.price === 'number' ? advert.price : null
    if (n === null) return ''
    const currency = !advert.currency || advert.currency === 'PLN' ? 'zł' : advert.currency
    return `${n.toLocaleString('pl-PL')} ${currency}`
}

function liters(cm3: number): string {
    return `${(cm3 / 1000).toFixed(1)}L`
}

// Prefers the matched EngineVersion's displacement+cylinder count ("5.7L V8"), falls back to
// the advert's own free EngineSize+FuelType ("2.0L Diesel"), then just the fuel type name.
function engineLabel(advert: any): string | null {
    const ev = advert.engineVersion
    if (ev?.displacement && ev?.cylinders) return `${liters(ev.displacement)} V${ev.cylinders}`
    if (ev?.displacement) return liters(ev.displacement)
    if (advert.engineSize) {
        const fuel = advert.fuelType?.name
        return fuel ? `${liters(advert.engineSize)} ${fuel}` : liters(advert.engineSize)
    }
    return advert.fuelType?.name ?? null
}

function powerLabel(advert: any): string | null {
    const hp = advert.powerHP ?? advert.engineVersion?.powerHP ?? advert.engineVersion?.horsepower
    return hp ? `${hp} KM` : null
}

function shortDriveLabel(name?: string | null): string | null {
    if (!name) return null
    const n = name.toLowerCase()
    if (n.includes('4x4') || n.includes('wszystkie')) return '4X4'
    if (n.includes('przedni') || n === 'fwd') return 'FWD'
    if (n.includes('tyln') || n === 'rwd') return 'RWD'
    if (n.includes('awd')) return 'AWD'
    return name.toUpperCase()
}

export function buildAdCardData(advert: any, siteUrl: string): AdCardData {
    const brand = advert.brand?.name ?? ''
    const model = advert.model?.name ?? ''
    const photo = [...(advert.images ?? [])]
        .sort((a: any, b: any) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0))[0]?.url ?? null

    return {
        brand,
        model,
        year: advert.year ? String(advert.year) : '',
        title: [advert.year, brand, model].filter(Boolean).join(' '),
        priceText: formatPrice(advert),
        engineLabel: engineLabel(advert),
        powerLabel: powerLabel(advert),
        driveLabel: shortDriveLabel(advert.driveType?.name),
        photoUrl: photo,
        ctaUrl: `${siteUrl.replace(/\/$/, '')}/advert/${advert.id}`,
    }
}
