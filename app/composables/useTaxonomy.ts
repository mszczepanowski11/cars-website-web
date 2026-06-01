import type { TaxonomyItem, Generation, EngineVersion, Feature } from '~/types'

export const useTaxonomy = () => {
  return {
    fetchBrands: () => $fetch<TaxonomyItem[]>('/api/proxy/api/Taxonomy/brands'),
    fetchModels: (brandId: number) => $fetch<TaxonomyItem[]>(`/api/proxy/api/Taxonomy/brands/${brandId}/models`),
    fetchGenerations: (modelId: number) => $fetch<Generation[]>(`/api/proxy/api/Taxonomy/models/${modelId}/generations`),
    fetchEngines: (generationId: number) => $fetch<EngineVersion[]>(`/api/proxy/api/Taxonomy/generations/${generationId}/engines`),
    fetchFuelTypes: () => $fetch<TaxonomyItem[]>('/api/proxy/api/Taxonomy/fueltypes'),
    fetchGearboxes: () => $fetch<TaxonomyItem[]>('/api/proxy/api/Taxonomy/gearboxes'),
    fetchBodyTypes: () => $fetch<TaxonomyItem[]>('/api/proxy/api/Taxonomy/bodytypes'),
    fetchFeatures: () => $fetch<Feature[]>('/api/proxy/api/Taxonomy/features'),
  }
}