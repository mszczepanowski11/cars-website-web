import type { FollowedAdvert, FollowedSeller, PagedResult } from '~/types'

export const useFollow = () => {
    const loading = ref(false)

    async function getFollowedAdverts(page = 1, pageSize = 12): Promise<PagedResult<FollowedAdvert>> {
        return $fetch('/api/proxy/api/Follow/adverts', { query: { page, pageSize } })
    }

    async function getFollowedSellers(page = 1, pageSize = 12): Promise<PagedResult<FollowedSeller>> {
        return $fetch('/api/proxy/api/Follow/sellers', { query: { page, pageSize } })
    }

    async function getFollowers(page = 1, pageSize = 12): Promise<PagedResult<{ id: number; followerId: number; followerName: string; createdAt: string }>> {
        return $fetch('/api/proxy/api/Follow/followers', { query: { page, pageSize } })
    }

    async function isFollowingAdvert(advertId: number): Promise<boolean> {
        try {
            const r = await $fetch<{ isFollowing: boolean }>(`/api/proxy/api/Follow/advert/${advertId}/status`)
            return r.isFollowing
        } catch { return false }
    }

    async function isFollowingSeller(sellerId: number): Promise<boolean> {
        try {
            const r = await $fetch<{ isFollowing: boolean }>(`/api/proxy/api/Follow/seller/${sellerId}/status`)
            return r.isFollowing
        } catch { return false }
    }

    async function followAdvert(advertId: number): Promise<void> {
        loading.value = true
        try { await $fetch(`/api/proxy/api/Follow/advert/${advertId}`, { method: 'POST', body: {} }) }
        finally { loading.value = false }
    }

    async function unfollowAdvert(advertId: number): Promise<void> {
        loading.value = true
        try { await $fetch(`/api/proxy/api/Follow/advert/${advertId}`, { method: 'DELETE' }) }
        finally { loading.value = false }
    }

    async function followSeller(sellerId: number): Promise<void> {
        loading.value = true
        try { await $fetch(`/api/proxy/api/Follow/seller/${sellerId}`, { method: 'POST', body: {} }) }
        finally { loading.value = false }
    }

    async function unfollowSeller(sellerId: number): Promise<void> {
        loading.value = true
        try { await $fetch(`/api/proxy/api/Follow/seller/${sellerId}`, { method: 'DELETE' }) }
        finally { loading.value = false }
    }

    return {
        loading,
        getFollowedAdverts, getFollowedSellers, getFollowers,
        isFollowingAdvert, isFollowingSeller,
        followAdvert, unfollowAdvert, followSeller, unfollowSeller,
    }
}
