<template>
    <div class="dash-page">
        <aside class="dash-sidebar">
            <nav class="dash-nav">
                <NuxtLink to="/dashboard" class="dash-nav-item" :class="{ active: activeTab === 'summary' }" @click="activeTab = 'summary'">
                    <v-icon icon="mdi-view-dashboard-outline" size="20" />
                    <span>Podsumowanie</span>
                </NuxtLink>
                <NuxtLink to="/my-adverts" class="dash-nav-item">
                    <v-icon icon="mdi-card-text-outline" size="20" />
                    <span>Moje ogłoszenia</span>
                </NuxtLink>
                <NuxtLink to="/favorites" class="dash-nav-item">
                    <v-icon icon="mdi-heart-outline" size="20" />
                    <span>Ulubione</span>
                </NuxtLink>
                <div class="dash-nav-item">
                    <v-icon icon="mdi-magnify" size="20" />
                    <span>Wyszukiwania</span>
                </div>
                <div class="dash-nav-item">
                    <v-icon icon="mdi-email-outline" size="20" />
                    <span>Wiadomości</span>
                    <span v-if="stats?.unreadMessages" class="nav-badge">{{ stats.unreadMessages }}</span>
                </div>
                <div class="dash-nav-item">
                    <v-icon icon="mdi-bell-outline" size="20" />
                    <span>Powiadomienia</span>
                </div>
                <div class="dash-divider" />
                <div class="dash-nav-item">
                    <v-icon icon="mdi-account-outline" size="20" />
                    <span>Dane osobowe</span>
                </div>
                <div class="dash-nav-item">
                    <v-icon icon="mdi-cog-outline" size="20" />
                    <span>Ustawienia</span>
                </div>
                <div class="dash-nav-item danger" @click="logout">
                    <v-icon icon="mdi-logout" size="20" />
                    <span>Wyloguj się</span>
                </div>
            </nav>

            <div class="dash-promo">
                <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=400&auto=format&fit=crop" alt="" class="promo-img" />
                <p class="promo-title">Sprzedawaj szybciej!</p>
                <p class="promo-sub">Wyróżnij swoje ogłoszenia i dotrzyj do większej liczby kupujących.</p>
                <button class="promo-btn">Dowiedz się więcej</button>
            </div>
        </aside>

        <main class="dash-main">
            <div v-if="loading" class="d-flex justify-center mt-16">
                <v-progress-circular indeterminate color="primary" size="60" />
            </div>

            <template v-else>
                <div class="profile-card">
                    <div class="profile-avatar">
                        {{ initials }}
                    </div>
                    <div class="profile-info">
                        <div class="profile-name-row">
                            <h1 class="profile-name">{{ profile?.name }} {{ profile?.surname }}</h1>
                            <v-icon icon="mdi-check-decagram" color="#8B0D1D" size="24" class="ml-2" />
                        </div>
                        <p class="profile-member">Członek od {{ memberSince }}</p>
                        <div class="profile-contacts">
                            <span><v-icon icon="mdi-email-outline" size="16" class="mr-1" />{{ profile?.email }}</span>
                            <span><v-icon icon="mdi-phone-outline" size="16" class="mr-1" />{{ profile?.phoneNumber }}</span>
                        </div>
                    </div>
                    <button class="edit-btn">
                        <v-icon icon="mdi-pencil-outline" size="16" class="mr-1" />
                        Edytuj profil
                    </button>
                </div>

                <div class="stats-row">
                    <div class="stat-card">
                        <v-icon icon="mdi-car" color="#8B0D1D" size="36" />
                        <div class="stat-num">{{ stats?.totalAdverts ?? 0 }}</div>
                        <div class="stat-label">Moje ogłoszenia</div>
                        <div class="stat-sub green">Aktywne</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-eye-outline" color="#8B0D1D" size="36" />
                        <div class="stat-num">{{ (stats?.totalViews ?? 0).toLocaleString('pl') }}</div>
                        <div class="stat-label">Wyświetlenia ogłoszeń</div>
                        <div class="stat-sub">Wszystkie</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-heart-outline" color="#8B0D1D" size="36" />
                        <div class="stat-num">{{ stats?.favoritesCount ?? 0 }}</div>
                        <div class="stat-label">Ulubione ogłoszenia</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-message-outline" color="#8B0D1D" size="36" />
                        <div class="stat-num">{{ stats?.unreadMessages ?? 0 }}</div>
                        <div class="stat-label">Wiadomości</div>
                        <div v-if="stats?.unreadMessages" class="stat-sub red">Nieprzeczytane</div>
                    </div>
                </div>

                <div class="section-block">
                    <div class="section-hd">
                        <h2>Moje ogłoszenia</h2>
                        <NuxtLink to="/my-adverts" class="see-all">Zobacz wszystkie →</NuxtLink>
                    </div>
                    <div v-if="!myAdverts.length" class="no-ads">Brak ogłoszeń.</div>
                    <div class="my-ads-grid">
                        <DashboardAdvertCard
                            v-for="a in myAdverts.slice(0, 4)"
                            :key="a.id"
                            :advert="a"
                            status="Aktywne"
                        />
                    </div>
                </div>

                <div class="bottom-row">
                    <div class="section-block">
                        <div class="section-hd">
                            <h2>Zapisane wyszukiwania</h2>
                            <span class="see-all">Zobacz wszystkie</span>
                        </div>
                        <div class="saved-search" v-for="s in savedSearches" :key="s.label">
                            <v-icon icon="mdi-magnify" color="#8B0D1D" size="18" />
                            <div class="ss-info">
                                <p class="ss-label">{{ s.label }}</p>
                                <p class="ss-meta">{{ s.meta }}</p>
                            </div>
                            <button class="ss-btn">Zobacz wyniki</button>
                            <v-icon icon="mdi-bell-outline" size="18" color="#666" />
                        </div>
                    </div>

                    <div class="section-block">
                        <div class="section-hd">
                            <h2>Ostatnie wiadomości</h2>
                            <span class="see-all">Zobacz wszystkie</span>
                        </div>
                        <div class="no-ads" style="color: #555; font-size: 14px;">Brak wiadomości.</div>
                        <button class="write-msg-btn">Napisz nową wiadomość</button>
                    </div>
                </div>
            </template>
        </main>
    </div>
</template>

<script setup lang="ts">
import { useUser } from '~/composables/useUser'
import type { CarAdvert, UserProfile, UserStats } from '~/types'

definePageMeta({ middleware: 'auth' })

const { fetchProfile, fetchStats } = useUser()
const { logout: authLogout } = useAuth()
const config = useRuntimeConfig()
const base = config.public.apiBase
const token = useCookie('auth_token')

const profile = ref<UserProfile | null>(null)
const stats = ref<UserStats | null>(null)
const myAdverts = ref<CarAdvert[]>([])
const loading = ref(true)
const activeTab = ref('summary')

const initials = computed(() => {
    if (!profile.value) return '?'
    return (profile.value.name[0] ?? '') + (profile.value.surname[0] ?? '')
})

const memberSince = computed(() => {
    if (!profile.value?.createdAt) return ''
    return new Date(profile.value.createdAt).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
})

const savedSearches = [
    { label: 'BMW serii 3', meta: 'Warszawa, +50 km • Od 2015 • Diesel • Do 100 000 zł' },
    { label: 'Audi A4', meta: 'Polska • Od 2016 • Benzyna • Do 80 000 zł' },
    { label: 'Mercedes C klasa', meta: 'Warszawa, +30 km • Od 2014 • Diesel' },
]

function logout() {
    authLogout()
}

onMounted(async () => {
    try {
        ;[profile.value, stats.value] = await Promise.all([fetchProfile(), fetchStats()])
        const r = await $fetch<{ items: CarAdvert[] }>(`${base}api/Advert/user?page=1&pageSize=4`, {
            headers: { Authorization: `Bearer ${token.value}` }
        })
        myAdverts.value = r.items
    } catch { }
    finally { loading.value = false }
})
</script>

<style lang="scss" scoped>
.dash-page {
    display: flex;
    min-height: 100vh;
    background: $bg;
    padding-top: $nav-height;
}

.dash-sidebar {
    width: 240px;
    min-width: 240px;
    background: $card;
    border-right: 1px solid $border;
    display: flex;
    flex-direction: column;
    padding: 24px 0;
    position: sticky;
    top: $nav-height;
    height: calc(100vh - $nav-height);
    overflow-y: auto;

    @include respond-to(md) { display: none; }
}

.dash-nav { flex: 1; }

.dash-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 20px;
    color: $text-muted;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    text-decoration: none;
    position: relative;

    &:hover { background: rgba(255,255,255,0.04); color: $text; }
    &.active { background: rgba(139,13,29,0.12); color: $text; border-left: 3px solid $red; }
    &.danger:hover { color: #e55; }
}

.nav-badge {
    margin-left: auto;
    background: $red;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 20px;
}

.dash-divider { height: 1px; background: $border; margin: 12px 0; }

.dash-promo {
    margin: 16px;
    background: linear-gradient(135deg, #0d0d0d, #110006);
    border: 1px solid $border;
    border-radius: $r-md;
    overflow: hidden;
    padding-bottom: 16px;
}

.promo-img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    display: block;
    opacity: 0.6;
}

.promo-title { font-size: 13px; font-weight: 700; color: $text; padding: 12px 14px 4px; }
.promo-sub { font-size: 11px; color: $text-dim; padding: 0 14px 12px; line-height: 1.5; }
.promo-btn {
    margin: 0 14px;
    width: calc(100% - 28px);
    background: $red;
    color: #fff;
    border: none;
    border-radius: $r-sm;
    padding: 9px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}

.dash-main {
    flex: 1;
    padding: 36px 40px;
    max-width: 1100px;

    @include respond-to(md) { padding: 24px 16px; }
}

.profile-card {
    @include card($r-xl);
    padding: 28px;
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 24px;

    @include respond-to(sm) { flex-direction: column; align-items: flex-start; }
}

.profile-avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: linear-gradient(135deg, $red, #3a0008);
    border: 3px solid $red-fade;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
}

.profile-info { flex: 1; }

.profile-name-row { display: flex; align-items: center; }
.profile-name { font-size: 26px; font-weight: 800; color: $text; }
.profile-member { color: $text-dim; font-size: 13px; margin-top: 4px; margin-bottom: 10px; }

.profile-contacts {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    color: $text-muted;
    font-size: 13px;

    span { display: flex; align-items: center; }
}

.edit-btn {
    display: flex;
    align-items: center;
    padding: 10px 18px;
    border: 1px solid $border;
    border-radius: $r-sm;
    background: transparent;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.2s, color 0.2s;

    &:hover { border-color: $red-fade; color: $text; }
}

.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
    @include card($r-lg);
    padding: 22px;
    text-align: center;
}

.stat-num { font-size: 32px; font-weight: 800; color: $text; margin-top: 10px; }
.stat-label { color: $text-dim; font-size: 13px; margin-top: 4px; }
.stat-sub { font-size: 12px; margin-top: 4px; color: $text-faint; }
.stat-sub.green { color: #4caf50; }
.stat-sub.red { color: $red; }

.section-block { @include card($r-xl); padding: 26px; margin-bottom: 24px; }

.section-hd {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 { font-size: 20px; font-weight: 700; color: $text; }
}

.see-all { color: $red; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; }

.my-ads-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.no-ads { color: $text-faint; font-size: 14px; }

.bottom-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @include respond-to(md) { grid-template-columns: 1fr; }
}

.saved-search {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid $border;

    &:last-child { border-bottom: none; }
}

.ss-info { flex: 1; }
.ss-label { font-size: 14px; font-weight: 600; color: $text; }
.ss-meta { font-size: 12px; color: $text-dim; margin-top: 2px; }

.ss-btn {
    font-size: 12px;
    font-weight: 600;
    color: $red;
    background: none;
    border: 1px solid $red-fade;
    border-radius: $r-sm;
    padding: 6px 12px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
    &:hover { background: $red-fade; }
}

.write-msg-btn {
    margin-top: 16px;
    padding: 11px 20px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $red-fade; color: $text; }
}
</style>