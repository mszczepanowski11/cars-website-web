import type { TaxonomyItem, Generation, EngineVersion, Feature } from '~/types'

export const useTaxonomy = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  return {
    fetchBrands: () => $fetch<TaxonomyItem[]>(`${base}api/Taxonomy/brands`),
    fetchModels: (brandId: number) => $fetch<TaxonomyItem[]>(`${base}api/Taxonomy/brands/${brandId}/models`),
    fetchGenerations: (modelId: number) => $fetch<Generation[]>(`${base}api/Taxonomy/models/${modelId}/generations`),
    fetchEngines: (generationId: number) => $fetch<EngineVersion[]>(`${base}api/Taxonomy/generations/${generationId}/engines`),
    fetchFuelTypes: () => $fetch<TaxonomyItem[]>(`${base}api/Taxonomy/fueltypes`),
    fetchGearboxes: () => $fetch<TaxonomyItem[]>(`${base}api/Taxonomy/gearboxes`),
    fetchBodyTypes: () => $fetch<TaxonomyItem[]>(`${base}api/Taxonomy/bodytypes`),
    fetchFeatures: () => $fetch<Feature[]>(`${base}api/Taxonomy/features`),
  }
}