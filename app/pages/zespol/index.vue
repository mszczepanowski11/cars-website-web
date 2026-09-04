<template>
    <div class="team-page">
        <div class="container">
            <div class="page-header">
                <div>
                    <h1 class="page-title">{{ $t('team.title') }}</h1>
                    <p class="page-sub">{{ $t('team.subtitle') }}</p>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <CzIcon icon="mdi-loading" size="32" class="spin" />
                {{ $t('team.loading') }}
            </div>

            <!-- MEMBER VIEW: acting on behalf of someone else's company -->
            <div v-else-if="context?.isMember" class="member-view">
                <div class="member-card">
                    <CzIcon icon="mdi-domain" size="28" class="member-icon" />
                    <div class="member-text">
                        <div class="member-title">{{ $t('team.memberOfTitle') }}</div>
                        <div class="member-company">{{ context.ownerCompanyName }}</div>
                        <p class="member-desc">{{ $t('team.memberDesc') }}</p>
                    </div>
                </div>
                <button class="btn-outline-danger" :disabled="leaving" @click="onLeave">
                    <CzIcon v-if="leaving" icon="mdi-loading" size="15" class="spin" />
                    <CzIcon v-else icon="mdi-exit-run" size="15" />
                    {{ $t('team.leaveTeam') }}
                </button>
            </div>

            <!-- NOT A BUSINESS ACCOUNT -->
            <div v-else-if="profile?.accountType !== 'Business'" class="empty-state">
                <CzIcon icon="mdi-account-group-outline" size="48" />
                <div class="empty-title">{{ $t('team.businessOnlyTitle') }}</div>
                <p class="empty-sub">{{ $t('team.businessOnlySub') }}</p>
            </div>

            <!-- OWNER VIEW -->
            <div v-else class="owner-view">
                <form class="invite-form" @submit.prevent="onInvite">
                    <input v-model="inviteEmail" type="email" required :placeholder="$t('team.invitePlaceholder')" class="invite-input" />
                    <button type="submit" class="btn-red" :disabled="inviting">
                        <CzIcon v-if="inviting" icon="mdi-loading" size="16" class="spin" />
                        <CzIcon v-else icon="mdi-account-plus-outline" size="16" />
                        {{ $t('team.inviteButton') }}
                    </button>
                </form>

                <div v-if="membersLoading" class="loading-state">
                    <CzIcon icon="mdi-loading" size="32" class="spin" />
                    {{ $t('team.loadingMembers') }}
                </div>

                <div v-else-if="members.length === 0" class="empty-state">
                    <CzIcon icon="mdi-account-group-outline" size="48" />
                    <div class="empty-title">{{ $t('team.noMembersTitle') }}</div>
                    <p class="empty-sub">{{ $t('team.noMembersSub') }}</p>
                </div>

                <div v-else class="members-list">
                    <div v-for="m in members" :key="m.membershipId" class="member-row">
                        <div class="mr-info">
                            <div class="mr-name">{{ m.name ? `${m.name} ${m.surname ?? ''}`.trim() : m.email }}</div>
                            <div class="mr-email">{{ m.email }}</div>
                        </div>
                        <div class="mr-status" :class="`status-${m.status.toLowerCase()}`">
                            <CzIcon :icon="m.status === 'Active' ? 'mdi-check-circle-outline' : 'mdi-clock-outline'" size="13" />
                            {{ m.status === 'Active' ? $t('team.statusActive') : $t('team.statusPending') }}
                        </div>
                        <button class="mr-remove" :disabled="removingId === m.membershipId" @click="onRemove(m)">
                            <CzIcon v-if="removingId === m.membershipId" icon="mdi-loading" size="15" class="spin" />
                            <CzIcon v-else icon="mdi-close" size="15" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CompanyMember, MyCompanyContext, UserProfile } from '~/types'

definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
useHead({ title: t('team.metaTitle'), meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { getContext, getMembers, inviteMember, removeMember, cancelInvite, leaveCompany } = useCompany()
const { fetchProfile } = useUser()
const { success: toastSuccess, error: toastError } = useToast()

const profile = ref<UserProfile | null>(null)
const context = ref<MyCompanyContext | null>(null)
const members = ref<CompanyMember[]>([])
const loading = ref(true)
const membersLoading = ref(false)
const inviteEmail = ref('')
const inviting = ref(false)
const removingId = ref<number | null>(null)
const leaving = ref(false)

async function loadMembers() {
    membersLoading.value = true
    try {
        members.value = await getMembers()
    } catch {
        members.value = []
    } finally {
        membersLoading.value = false
    }
}

onMounted(async () => {
    try {
        const [p, c] = await Promise.all([fetchProfile(), getContext()])
        profile.value = p
        context.value = c
        if (p?.accountType === 'Business' && !c.isMember) {
            await loadMembers()
        }
    } catch {
        toastError(t('team.loadError'))
    } finally {
        loading.value = false
    }
})

async function onInvite() {
    if (!inviteEmail.value) return
    inviting.value = true
    try {
        await inviteMember(inviteEmail.value)
        toastSuccess(t('team.inviteSent'))
        inviteEmail.value = ''
        await loadMembers()
    } catch (e: any) {
        toastError(e?.data?.message ?? t('team.inviteError'))
    } finally {
        inviting.value = false
    }
}

async function onRemove(m: CompanyMember) {
    removingId.value = m.membershipId
    try {
        if (m.status === 'Pending') await cancelInvite(m.membershipId)
        else await removeMember(m.membershipId)
        toastSuccess(t('team.memberRemoved'))
        await loadMembers()
    } catch (e: any) {
        toastError(e?.data?.message ?? t('team.removeError'))
    } finally {
        removingId.value = null
    }
}

async function onLeave() {
    if (!confirm(t('team.leaveConfirm'))) return
    leaving.value = true
    try {
        await leaveCompany()
        toastSuccess(t('team.leftTeam'))
        context.value = { isOwner: false, isMember: false }
    } catch (e: any) {
        toastError(e?.data?.message ?? t('team.leaveError'))
    } finally {
        leaving.value = false
    }
}
</script>

<style lang="scss" scoped>
.team-page {
    background: $bg;
    min-height: 100vh;
    padding-top: var(--nav-h);
    padding-bottom: 60px;
}

.container { @include container; }

.page-header { padding: 32px 0 20px; }
.page-title { font-size: 26px; font-weight: 900; color: $text; margin: 0 0 6px; }
.page-sub { font-size: 14px; color: $text-dim; margin: 0; }

.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px;
    color: $text-dim;
    font-size: 14px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 60px 20px;
    gap: 14px;
    .cz-icon { color: $text-dark; }
}

.empty-title { font-size: 18px; font-weight: 700; color: $text-muted; }
.empty-sub { font-size: 14px; color: $text-dim; max-width: 420px; line-height: 1.6; margin: 0; }

// Member view
.member-view { display: flex; flex-direction: column; gap: 20px; align-items: flex-start; }

.member-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    background: $bg;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 20px;
    width: 100%;
}

.member-icon { color: $red-text; flex-shrink: 0; margin-top: 2px; }
.member-title { font-size: 12px; color: $text-dim; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
.member-company { font-size: 18px; font-weight: 800; color: $text; margin: 4px 0 8px; }
.member-desc { font-size: 13px; color: $text-dim; line-height: 1.6; margin: 0; }

.btn-outline-danger {
    display: flex;
    align-items: center;
    gap: 7px;
    background: transparent;
    border: 1px solid rgba(231,76,60,0.4);
    border-radius: $r-sm;
    color: $danger;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 10px 18px;
    cursor: pointer;
    transition: background 0.2s;
    &:hover:not(:disabled) { background: rgba(231,76,60,0.1); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// Owner view
.owner-view { display: flex; flex-direction: column; gap: 24px; }

.invite-form {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.invite-input {
    flex: 1;
    min-width: 240px;
    background: $bg;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 12px 16px;
    &:focus { outline: none; border-color: $red; }
    &::placeholder { color: $text-dark; }
}

.btn-red {
    display: flex;
    align-items: center;
    gap: 7px;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 13px;
    font-weight: 700;
    padding: 11px 22px;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.2s;
    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.members-list { display: flex; flex-direction: column; gap: 10px; }

.member-row {
    display: flex;
    align-items: center;
    gap: 14px;
    background: $bg;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 14px 18px;
}

.mr-info { flex: 1; min-width: 0; }
.mr-name { font-size: 14px; font-weight: 700; color: $text; }
.mr-email { font-size: 12px; color: $text-dim; }

.mr-status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    white-space: nowrap;
    &.status-active { background: rgba(45,122,58,0.12); color: $success; }
    &.status-pending { background: rgba(255,152,0,0.12); color: $warning; }
}

.mr-remove {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    color: $text-dim;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.2s, color 0.2s;
    &:hover:not(:disabled) { background: rgba(231,76,60,0.12); color: $danger; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
