import type { TaxonomyItem, Generation, EngineVersion, Feature, DriveType, CarColor, VehicleSubtype, PartCategory, PartSubcategory } from '~/types'

export const useTaxonomy = () => {
  return {
    fetchBrands: () => $fetch<TaxonomyItem[]>('/api/proxy/api/Taxonomy/brands'),
    fetchBrandsByCategory: (categoryId: number) => $fetch<TaxonomyItem[]>(`/api/proxy/api/Taxonomy/brands/category/${categoryId}`),
    fetchModels: (brandId: number) => $fetch<TaxonomyItem[]>(`/api/proxy/api/Taxonomy/brands/${brandId}/models`),
    fetchGenerations: (modelId: number) => $fetch<Generation[]>(`/api/proxy/api/Taxonomy/models/${modelId}/generations`),
    fetchEngines: (generationId: number) => $fetch<EngineVersion[]>(`/api/proxy/api/Taxonomy/generations/${generationId}/engines`),
    fetchTrims: (generationId: number) => $fetch<TaxonomyItem[]>(`/api/proxy/api/Taxonomy/trims/generation/${generationId}`),
    fetchEnginesByTrim: (trimId: number) => $fetch<EngineVersion[]>(`/api/proxy/api/Taxonomy/engines/trim/${trimId}`),
    fetchFuelTypes: () => $fetch<TaxonomyItem[]>('/api/proxy/api/Taxonomy/fueltypes'),
    fetchGearboxes: () => $fetch<TaxonomyItem[]>('/api/proxy/api/Taxonomy/gearboxes'),
    fetchBodyTypes: () => $fetch<TaxonomyItem[]>('/api/proxy/api/Taxonomy/bodytypes'),
    fetchDriveTypes: () => $fetch<DriveType[]>('/api/proxy/api/Taxonomy/drive-types'),
    fetchColors: () => $fetch<CarColor[]>('/api/proxy/api/Taxonomy/colors'),
    fetchFeatures: () => $fetch<Feature[]>('/api/proxy/api/Taxonomy/features'),
    fetchFeatureCategories: () => $fetch('/api/proxy/api/Taxonomy/feature-categories'),
    fetchFeatureCategoriesByVehicle: (vehicleCategoryId: number) => $fetch(`/api/proxy/api/Taxonomy/feature-categories/by-vehicle/${vehicleCategoryId}`),
    fetchFeatureCategoriesByContext: (vehicleCategoryId?: number | null, brandId?: number | null, modelId?: number | null) => {
        const q: Record<string, string> = {}
        if (vehicleCategoryId) q.vehicleCategoryId = String(vehicleCategoryId)
        if (brandId) q.brandId = String(brandId)
        if (modelId) q.modelId = String(modelId)
        return $fetch<{ id: number; name: string; vehicleCategoryId?: number | null; brandId?: number | null; modelId?: number | null; features: { id: number; name: string }[] }[]>('/api/proxy/api/Taxonomy/feature-categories/by-context', { query: q })
    },
    fetchCategories: () => $fetch('/api/proxy/api/Taxonomy/categories'),
    fetchVehicleSubtypes: (categoryId: number) => $fetch<VehicleSubtype[]>(`/api/proxy/api/Taxonomy/vehicle-subtypes/category/${categoryId}`),
    fetchPartCategories: () => $fetch<PartCategory[]>('/api/proxy/api/Taxonomy/part-categories'),
    fetchPartSubcategories: (partCategoryId: number) => $fetch<PartSubcategory[]>(`/api/proxy/api/Taxonomy/part-subcategories/category/${partCategoryId}`),
    fetchEngineSpecs: (engineVersionId: number) => $fetch<EngineVersion>(`/api/proxy/api/Taxonomy/engines/${engineVersionId}/specs`).catch(() => null),
  }
}