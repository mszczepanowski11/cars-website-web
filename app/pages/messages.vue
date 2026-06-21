<template>
    <div class="page-bg">
        <div class="container" style="padding-top: 120px; padding-bottom: 80px;">
            <h1 class="page-title">Wiadomości</h1>
            <div v-if="loading" class="loading-row">
                <v-icon icon="mdi-loading" size="36" class="spin" />
            </div>
            <template v-else>
                <div v-if="!conversations.length" class="no-results">
                    <v-icon icon="mdi-message-outline" size="64" class="no-results-icon" />
                    <p>Nie masz jeszcze żadnych wiadomości.</p>
                    <NuxtLink to="/adverts" class="browse-link">Przeglądaj ogłoszenia</NuxtLink>
                </div>
                <div v-else class="conversations-list">
                    <NuxtLink
                        v-for="conv in conversations"
                        :key="conv.id"
                        :to="`/messages/${conv.id}`"
                        class="conversation-item"
                    >
                        <div class="conv-avatar">
                            <v-icon icon="mdi-account-circle" size="48" />
                        </div>
                        <div class="conv-body">
                            <div class="conv-header">
                                <span class="conv-name">{{ conv.otherUserName }}</span>
                                <span class="conv-time">{{ formatDate(conv.lastMessageAt) }}</span>
                            </div>
                            <div class="conv-advert">{{ conv.advertTitle }}</div>
                            <div class="conv-preview">{{ conv.lastMessageContent || 'Brak wiadomości' }}</div>
                        </div>
                        <div v-if="conv.unreadCount > 0" class="conv-badge">
                            {{ conv.unreadCount }}
                        </div>
                    </NuxtLink>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~/types'
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Wiadomości — CARIZO', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const conversations = ref<Conversation[]>([])
const loading = ref(false)

async function load() {
    loading.value = true
    try {
        conversations.value = await $fetch<Conversation[]>('/api/proxy/api/Message/conversations')
    } finally {
        loading.value = false
    }
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    const diff = Date.now() - d.getTime()
    if (diff < 86400000) return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('pl-PL')
}

onMounted(() => load())
</script>

<style lang="scss" scoped>
.page-bg { background: $bg; min-height: 100vh; }
.container { @include container; }
.page-title { font-size: 40px; font-weight: 900; color: $text; margin-bottom: 32px; }

.loading-row { display: flex; justify-content: center; padding: 80px 0; color: $red; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.no-results {
    text-align: center;
    padding: 60px 20px;
    color: $text-dim;
    p { margin-top: 12px; font-size: 16px; }
}
.no-results-icon { color: $text-dark; display: block; margin: 0 auto; }
.browse-link {
    display: inline-block;
    margin-top: 16px;
    color: $red;
    font-weight: 600;
    font-size: 14px;
    &:hover { opacity: 0.8; }
}

.conversations-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 720px;
}

.conversation-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-md;
    text-decoration: none;
    transition: border-color 0.15s, background 0.15s;
    &:hover { background: #0d0d0d; border-color: rgba($red, 0.3); }
}

.conv-avatar { flex-shrink: 0; color: $text-dim; }
.conv-body { flex: 1; min-width: 0; }

.conv-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.conv-name { font-weight: 700; color: $text; font-size: 15px; }
.conv-time { font-size: 12px; color: $text-dim; flex-shrink: 0; margin-left: 8px; }

.conv-advert {
    font-size: 12px;
    color: $red;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.conv-preview {
    font-size: 13px;
    color: $text-dim;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.conv-badge {
    background: $red;
    color: white;
    border-radius: 50%;
    min-width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
    padding: 0 4px;
}
</style>