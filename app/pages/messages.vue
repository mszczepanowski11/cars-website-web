<template>
    <div class="msg-shell">
        <!-- Sidebar -->
        <aside class="msg-sidebar" :class="{ 'sidebar-hidden': activeConvId }">
            <div class="sidebar-head">
                <h1 class="sidebar-title">Wiadomości</h1>
                <div class="search-wrap">
                    <v-icon icon="mdi-magnify" size="18" class="search-icon" />
                    <input
                        v-model="search"
                        class="search-input"
                        placeholder="Szukaj konwersacji..."
                        type="text"
                    />
                    <button v-if="search" class="search-clear" @click="search = ''">
                        <v-icon icon="mdi-close" size="14" />
                    </button>
                </div>
                <div class="filter-tabs">
                    <button
                        v-for="tab in tabs"
                        :key="tab.key"
                        class="filter-tab"
                        :class="{ active: activeTab === tab.key }"
                        @click="activeTab = tab.key"
                    >
                        {{ tab.label }}
                        <span v-if="tab.key === 'all' && totalUnread > 0" class="tab-badge">{{ totalUnread }}</span>
                    </button>
                </div>
            </div>

            <div class="conv-list-wrap">
                <div v-if="loading && !conversations.length" class="list-loading">
                    <div v-for="i in 4" :key="i" class="skel-item">
                        <div class="skel-avatar" />
                        <div class="skel-lines">
                            <div class="skel-line skel-name" />
                            <div class="skel-line skel-preview" />
                        </div>
                    </div>
                </div>

                <div v-else-if="loadError" class="list-empty">
                    <v-icon icon="mdi-wifi-off" size="40" class="empty-icon" />
                    <p>Błąd połączenia</p>
                    <button class="retry-link" @click="load">Spróbuj ponownie</button>
                </div>

                <template v-else>
                    <!-- Pinned -->
                    <template v-if="pinnedList.length && activeTab !== 'archived'">
                        <div class="section-label">
                            <v-icon icon="mdi-pin" size="12" />
                            Przypięte
                        </div>
                        <ConversationItem
                            v-for="conv in pinnedList"
                            :key="conv.id"
                            :conv="conv"
                            :active="conv.id === activeConvId"
                            @click="openConv(conv.id)"
                            @pin="togglePin(conv)"
                            @archive="toggleArchive(conv)"
                            @mark-unread="markUnread(conv)"
                        />
                    </template>

                    <!-- Main list -->
                    <template v-if="filteredList.length">
                        <div v-if="pinnedList.length && activeTab !== 'archived'" class="section-label">
                            Wszystkie
                        </div>
                        <ConversationItem
                            v-for="conv in filteredList"
                            :key="conv.id"
                            :conv="conv"
                            :active="conv.id === activeConvId"
                            @click="openConv(conv.id)"
                            @pin="togglePin(conv)"
                            @archive="toggleArchive(conv)"
                            @mark-unread="markUnread(conv)"
                        />
                    </template>

                    <div v-else-if="!pinnedList.length" class="list-empty">
                        <v-icon icon="mdi-message-outline" size="40" class="empty-icon" />
                        <p v-if="search">Brak wyników dla „{{ search }}"</p>
                        <p v-else-if="activeTab === 'unread'">Brak nieprzeczytanych</p>
                        <p v-else-if="activeTab === 'archived'">Brak zarchiwizowanych</p>
                        <p v-else>Brak wiadomości</p>
                        <NuxtLink v-if="!search && activeTab === 'all'" to="/adverts" class="retry-link">
                            Przeglądaj ogłoszenia
                        </NuxtLink>
                    </div>
                </template>
            </div>
        </aside>

        <!-- Chat panel (desktop split, mobile full) -->
        <main class="msg-main">
            <NuxtPage @conversation-updated="handleConvUpdate" />
            <div v-if="!activeConvId" class="no-chat-placeholder">
                <v-icon icon="mdi-message-text-outline" size="64" class="placeholder-icon" />
                <p class="placeholder-text">Wybierz konwersację</p>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~/types'
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Wiadomości — CARIZO', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const route = useRoute()
const router = useRouter()

const conversations = ref<Conversation[]>([])
const loading = ref(false)
const loadError = ref(false)
const search = ref('')
const activeTab = ref<'all' | 'unread' | 'archived'>('all')
let pollTimer: ReturnType<typeof setInterval> | null = null

const tabs = [
    { key: 'all', label: 'Wszystkie' },
    { key: 'unread', label: 'Nieprzeczytane' },
    { key: 'archived', label: 'Archiwum' },
]

const activeConvId = computed(() => {
    const id = Number(route.params.conversationId)
    return isNaN(id) ? null : id
})

const totalUnread = computed(() =>
    conversations.value.filter(c => !c.isArchived).reduce((s, c) => s + c.unreadCount, 0)
)

const pinnedList = computed(() => {
    if (activeTab.value === 'archived') return []
    return conversations.value.filter(c => c.isPinned && !c.isArchived && matchesSearch(c))
})

const filteredList = computed(() => {
    return conversations.value.filter(c => {
        if (c.isPinned && activeTab.value !== 'archived') return false
        if (activeTab.value === 'unread') return c.unreadCount > 0 && !c.isArchived
        if (activeTab.value === 'archived') return c.isArchived
        return !c.isArchived
    }).filter(c => matchesSearch(c))
})

function matchesSearch(c: Conversation) {
    if (!search.value) return true
    const q = search.value.toLowerCase()
    return (
        c.otherUserName.toLowerCase().includes(q) ||
        c.advertTitle.toLowerCase().includes(q) ||
        (c.lastMessageContent ?? '').toLowerCase().includes(q)
    )
}

async function load() {
    loading.value = true
    loadError.value = false
    try {
        conversations.value = await $fetch<Conversation[]>('/api/proxy/api/Message/conversations')
    } catch {
        loadError.value = true
    } finally {
        loading.value = false
    }
}

function openConv(id: number) {
    router.push(`/messages/${id}`)
}

async function togglePin(conv: Conversation) {
    try {
        const updated = await $fetch<Conversation>(`/api/proxy/api/Message/conversation/${conv.id}/pin`, { method: 'PUT' })
        const idx = conversations.value.findIndex(c => c.id === conv.id)
        if (idx !== -1) conversations.value[idx] = updated
    } catch {}
}

async function toggleArchive(conv: Conversation) {
    try {
        const updated = await $fetch<Conversation>(`/api/proxy/api/Message/conversation/${conv.id}/archive`, { method: 'PUT' })
        const idx = conversations.value.findIndex(c => c.id === conv.id)
        if (idx !== -1) conversations.value[idx] = updated
    } catch {}
}

async function markUnread(conv: Conversation) {
    try {
        await $fetch(`/api/proxy/api/Message/conversation/${conv.id}/mark-unread`, { method: 'PUT' })
        const idx = conversations.value.findIndex(c => c.id === conv.id)
        if (idx !== -1) conversations.value[idx] = { ...conversations.value[idx], unreadCount: 1 }
    } catch {}
}

function handleConvUpdate() {
    load()
}

onMounted(() => {
    load()
    pollTimer = setInterval(load, 20_000)
})

onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer)
})
</script>

<style lang="scss" scoped>
.msg-shell {
    display: flex;
    height: 100vh;
    background: $bg;
    padding-top: $nav-height;
    box-sizing: border-box;
    overflow: hidden;
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
.msg-sidebar {
    width: 360px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: #050505;
    border-right: 1px solid $border;
    overflow: hidden;
}

.sidebar-head {
    padding: 20px 16px 0;
    flex-shrink: 0;
}

.sidebar-title {
    font-size: 22px;
    font-weight: 900;
    color: $text;
    margin-bottom: 14px;
    letter-spacing: -0.5px;
}

// Search
.search-wrap {
    position: relative;
    margin-bottom: 12px;
}

.search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: $text-dark;
    pointer-events: none;
}

.search-input {
    width: 100%;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-lg;
    color: $text;
    font-size: 13px;
    padding: 9px 32px 9px 34px;
    outline: none;
    transition: border-color 0.2s;

    &::placeholder { color: $text-dark; }
    &:focus { border-color: rgba($red, 0.4); }
}

.search-clear {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: $text-dim;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 2px;
    &:hover { color: $text; }
}

// Filter tabs
.filter-tabs {
    display: flex;
    gap: 2px;
    border-bottom: 1px solid $border;
    margin: 0 -16px;
    padding: 0 16px;
}

.filter-tab {
    position: relative;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: $text-dim;
    font-size: 13px;
    font-weight: 500;
    padding: 10px 12px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: -1px;

    &.active {
        color: $text;
        border-bottom-color: $red;
    }

    &:hover:not(.active) { color: $text; }
}

.tab-badge {
    background: $red;
    color: white;
    font-size: 10px;
    font-weight: 700;
    border-radius: 8px;
    padding: 1px 5px;
    line-height: 1.4;
}

// Conversation list
.conv-list-wrap {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 2px; }
}

// Section label
.section-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 600;
    color: $text-dark;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 8px 16px 4px;
}

// Loading skeleton
.list-loading { padding: 8px 0; }
.skel-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
}
.skel-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #1a1a1a;
    flex-shrink: 0;
    animation: shimmer 1.4s infinite;
}
.skel-lines { flex: 1; }
.skel-line {
    height: 10px;
    background: #1a1a1a;
    border-radius: 5px;
    animation: shimmer 1.4s infinite;
    margin-bottom: 8px;
}
.skel-name { width: 60%; }
.skel-preview { width: 85%; opacity: 0.6; }

@keyframes shimmer {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
}

// Empty state
.list-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    color: $text-dim;
    text-align: center;

    p { margin-top: 10px; font-size: 14px; }
}

.empty-icon { color: #222; display: block; }
.retry-link {
    margin-top: 12px;
    color: $red;
    font-size: 13px;
    font-weight: 600;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    &:hover { opacity: 0.8; }
}

// ── Main area ──────────────────────────────────────────────────────────────────
.msg-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.no-chat-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: $text-dark;
    gap: 12px;
}

.placeholder-icon { color: #1a1a1a; }
.placeholder-text { font-size: 15px; color: $text-dark; }

// ── Mobile ──────────────────────────────────────────────────────────────────
@media (max-width: 768px) {
    .msg-shell { display: block; overflow-y: auto; height: auto; min-height: 100vh; }
    .msg-sidebar {
        width: 100%;
        height: auto;
        border-right: none;

        &.sidebar-hidden { display: none; }
    }
    .msg-main {
        display: block;
    }
    .no-chat-placeholder { display: none; }
}
</style>
