import type { TaxonomyItem, Generation, EngineVersion, Feature, DriveType, CarColor } from '~/types'

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
    fetchCategories: () => $fetch('/api/proxy/api/Taxonomy/categories'),
  }
}