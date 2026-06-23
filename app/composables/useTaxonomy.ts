import type { TaxonomyItem, Generation, EngineVersion, Feature, DriveType, CarColor, TrimItem, VehicleSubtype, PartCategory, PartSubcategory } from '~/types'

export const useTaxonomy = () => {
  return {
    fetchBrands: () => $fetch<TaxonomyItem[]>('/api/proxy/api/Taxonomy/brands'),
    fetchBrandsByCategory: (categoryId: number) => $fetch<TaxonomyItem[]>(`/api/proxy/api/Taxonomy/brands/category/${categoryId}`),
    fetchModels: (brandId: number) => $fetch<TaxonomyItem[]>(`/api/proxy/api/Taxonomy/brands/${brandId}/models`),
    fetchGenerations: (modelId: number) => $fetch<Generation[]>(`/api/proxy/api/Taxonomy/models/${modelId}/generations`),
    fetchEngines: (generationId: number) => $fetch<EngineVersion[]>(`/api/proxy/api/Taxonomy/generations/${generationId}/engines`),
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

    // New taxonomy endpoints
    fetchTrims: async (generationId: number): Promise<TrimItem[]> => {
      if (!generationId) return []
      try {
        return await $fetch<TrimItem[]>(`/api/taxonomy/trims/generation/${generationId}`)
      } catch { return [] }
    },
    fetchEnginesByTrim: async (trimId: number): Promise<EngineVersion[]> => {
      if (!trimId) return []
      try {
        return await $fetch<EngineVersion[]>(`/api/taxonomy/engines/trim/${trimId}`)
      } catch { return [] }
    },
    fetchEngineSpecs: async (engineVersionId: number): Promise<any> => {
      if (!engineVersionId) return null
      try {
        return await $fetch(`/api/taxonomy/engines/${engineVersionId}/specs`)
      } catch { return null }
    },
    fetchVehicleSubtypes: async (vehicleCategoryId: number): Promise<VehicleSubtype[]> => {
      if (!vehicleCategoryId) return []
      try {
        return await $fetch<VehicleSubtype[]>(`/api/taxonomy/vehicle-subtypes/category/${vehicleCategoryId}`)
      } catch { return [] }
    },
    fetchPartCategories: async (): Promise<PartCategory[]> => {
      try {
        return await $fetch<PartCategory[]>('/api/taxonomy/part-categories')
      } catch { return [] }
    },
    fetchPartSubcategories: async (partCategoryId: number): Promise<PartSubcategory[]> => {
      if (!partCategoryId) return []
      try {
        return await $fetch<PartSubcategory[]>(`/api/taxonomy/part-subcategories/category/${partCategoryId}`)
      } catch { return [] }
    },
  }
}