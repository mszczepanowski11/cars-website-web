export interface TaxonomyItem { id: number; name: string }

export interface Generation extends TaxonomyItem { yearFrom: number; yearTo: number }
export interface EngineVersion extends TaxonomyItem { displacement: number; horsepower: number }
export interface AdvertImage { id: number; url: string; isMain: boolean }
export interface Feature { id: number; name: string; category: { id: number; name: string } }

export interface CarAdvert {
    id: number; userId: number; title: string; description: string
    price: number; year: number; mileage: number
    brand: TaxonomyItem | null; model: TaxonomyItem | null
    generation: Generation | null; engineVersion: EngineVersion | null
    fuelType: TaxonomyItem | null; gearbox: TaxonomyItem | null; bodyType: TaxonomyItem | null
    features: Feature[]; images: AdvertImage[]; createdAt: string
}

export interface PagedResult<T> { items: T[]; totalCount: number }

export interface SearchAdvertDto {
    brandId?: number | null; modelId?: number | null
    generationId?: number | null; engineVersionId?: number | null
    fuelTypeId?: number | null; gearboxId?: number | null; bodyTypeId?: number | null
    yearFrom?: number | null; yearTo?: number | null
    mileageFrom?: number | null; mileageTo?: number | null
    priceFrom?: number | null; priceTo?: number | null
    featureIds?: number[]; sortBy?: string; page?: number; pageSize?: number
}