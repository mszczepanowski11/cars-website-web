import type { CompanyMember, MyCompanyContext } from '~/types'

// Owner+Member multi-user company accounts (CTO audit Etap 3). All calls go through the generic
// backend proxy - see server/api/proxy/[...path].ts - same pattern as useUser/useInvoices.
export const useCompany = () => {
    async function getContext(): Promise<MyCompanyContext> {
        return $fetch<MyCompanyContext>('/api/proxy/api/Company/context')
    }

    async function getMembers(): Promise<CompanyMember[]> {
        return $fetch<CompanyMember[]>('/api/proxy/api/Company/members')
    }

    async function inviteMember(email: string): Promise<void> {
        await $fetch('/api/proxy/api/Company/members/invite', { method: 'POST', body: { email } })
    }

    async function cancelInvite(membershipId: number): Promise<void> {
        await $fetch(`/api/proxy/api/Company/members/${membershipId}/invite`, { method: 'DELETE' })
    }

    async function removeMember(membershipId: number): Promise<void> {
        await $fetch(`/api/proxy/api/Company/members/${membershipId}`, { method: 'DELETE' })
    }

    async function acceptInvite(token: string): Promise<void> {
        await $fetch('/api/proxy/api/Company/invites/accept', { method: 'POST', body: { token } })
    }

    async function leaveCompany(): Promise<void> {
        await $fetch('/api/proxy/api/Company/leave', { method: 'POST' })
    }

    return { getContext, getMembers, inviteMember, cancelInvite, removeMember, acceptInvite, leaveCompany }
}
