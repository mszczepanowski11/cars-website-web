export interface SubscriptionPlan {
    tier: string
    name: string
    nettoPrice: number
    bruttoPrice: number
    maxActiveAds: number
    emissionDays: number
    featuredQuotaPerMonth: number
    features: string[]
    isCustom: boolean
}

export interface SubscriptionStatus {
    tier: string
    tierName: string
    isActive: boolean
    expiresAt: string | null
    startedAt: string | null
    isStartProgram: boolean
    isVerifiedDealer: boolean
    maxActiveAds: number
    emissionDays: number
    featuredQuotaPerMonth: number
    featuredQuotaUsed: number
    featuredQuotaRemaining: number
    featuredQuotaResetAt: string | null
}

export const useSubscription = () => {
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function getPlans(): Promise<SubscriptionPlan[]> {
        return $fetch('/api/proxy/api/Subscription/plans')
    }

    async function getMySubscription(): Promise<SubscriptionStatus> {
        return $fetch('/api/proxy/api/Subscription/my')
    }

    async function activateStartProgram(): Promise<{ message: string }> {
        loading.value = true
        error.value = null
        try {
            return await $fetch('/api/proxy/api/Subscription/activate-start-program', { method: 'POST' })
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Nie udało się aktywować Programu Start.'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function buySubscription(tier: string, billing?: { billingName?: string; billingNip?: string; billingStreet?: string; billingPostalCode?: string; billingCity?: string }) {
        loading.value = true
        error.value = null
        try {
            return await $fetch('/api/proxy/api/Payment/initiate', {
                method: 'POST',
                body: {
                    serviceType: 'Subscription',
                    subscriptionTier: tier,
                    durationDays: 30,
                    ...billing,
                },
            })
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Nie udało się zainicjować płatności.'
            throw e
        } finally {
            loading.value = false
        }
    }

    return { loading, error, getPlans, getMySubscription, activateStartProgram, buySubscription }
}
