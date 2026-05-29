<template>
    <div class="chat-page">
        <div class="chat-header">
            <div class="chat-header-inner">
                <NuxtLink to="/messages" class="back-btn">
                    <v-icon icon="mdi-arrow-left" size="20" />
                </NuxtLink>
                <div class="header-info">
                    <v-icon icon="mdi-account-circle" size="36" class="header-avatar" />
                    <div>
                        <div class="header-name">{{ conversation?.otherUserName ?? '...' }}</div>
                        <NuxtLink
                            v-if="conversation"
                            :to="`/advert/${conversation.advertId}`"
                            class="header-advert"
                        >
                            {{ conversation.advertTitle }}
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>

        <div ref="scrollEl" class="messages-area">
            <div v-if="loading" class="d-flex justify-center mt-8">
                <v-progress-circular indeterminate color="primary" />
            </div>
            <template v-else>
                <div v-if="!messages.length" class="no-messages">
                    Napisz pierwszą wiadomość
                </div>
                <div
                    v-for="msg in messages"
                    :key="msg.id"
                    class="msg-row"
                    :class="msg.isMine ? 'msg-mine' : 'msg-other'"
                >
                    <div class="msg-bubble" :class="msg.isMine ? 'bubble-mine' : 'bubble-other'">
                        <p class="msg-text">{{ msg.content }}</p>
                        <span class="msg-time">{{ formatTime(msg.sentAt) }}</span>
                    </div>
                </div>
            </template>
        </div>

        <div class="input-bar">
            <v-textarea
                v-model="draft"
                placeholder="Napisz wiadomość..."
                rows="1"
                auto-grow
                :max-rows="4"
                hide-details
                variant="outlined"
                bg-color="#090909"
                @keydown.enter.exact.prevent="send"
            />
            <v-btn
                color="primary"
                :icon="true"
                size="large"
                :loading="sending"
                :disabled="!draft.trim()"
                @click="send"
            >
                <v-icon icon="mdi-send" />
            </v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Conversation, MessageItem } from '~/types'
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const conversationId = Number(route.params.conversationId)

const conversation = ref<Conversation | null>(null)
const messages = ref<MessageItem[]>([])
const loading = ref(false)
const sending = ref(false)
const draft = ref('')
const scrollEl = ref<HTMLElement | null>(null)

async function loadAll() {
    loading.value = true
    try {
        const [convs, msgs] = await Promise.all([
            $fetch<Conversation[]>('/api/proxy/api/Message/conversations'),
            $fetch<MessageItem[]>(`/api/proxy/api/Message/conversation/${conversationId}/messages`)
        ])
        conversation.value = convs.find(c => c.id === conversationId) ?? null
        messages.value = msgs
        await nextTick()
        scrollToBottom()
    } finally {
        loading.value = false
    }
}

function scrollToBottom() {
    if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
}

async function send() {
    const content = draft.value.trim()
    if (!content || sending.value) return
    sending.value = true
    try {
        const msg = await $fetch<MessageItem>(`/api/proxy/api/Message/conversation/${conversationId}`, {
            method: 'POST',
            body: { content }
        })
        messages.value.push(msg)
        draft.value = ''
        await nextTick()
        scrollToBottom()
    } finally {
        sending.value = false
    }
}

function formatTime(d: string) {
    return new Date(d).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => loadAll())
</script>

<style lang="scss" scoped>
.chat-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: $bg;
    padding-top: $nav-height;
}

.chat-header {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid $border;
    flex-shrink: 0;
}

.chat-header-inner {
    @include container;
    height: 60px;
    display: flex;
    align-items: center;
    gap: 14px;
}

.back-btn {
    color: $text-dim;
    display: flex;
    align-items: center;
    transition: color 0.2s;
    &:hover { color: $text; }
}

.header-info { display: flex; align-items: center; gap: 12px; }
.header-avatar { color: $text-dim; }
.header-name { font-size: 16px; font-weight: 700; color: $text; }
.header-advert {
    font-size: 12px;
    color: $red;
    display: block;
    &:hover { opacity: 0.8; }
}

.messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.no-messages {
    text-align: center;
    color: $text-dim;
    font-size: 14px;
    margin: auto;
}

.msg-row { display: flex; }
.msg-mine { justify-content: flex-end; }
.msg-other { justify-content: flex-start; }

.msg-bubble {
    max-width: 65%;
    padding: 10px 14px;
    border-radius: 16px;
}

.bubble-mine {
    background: $red;
    border-bottom-right-radius: 4px;
}

.bubble-other {
    background: #1a1a1a;
    border: 1px solid $border;
    border-bottom-left-radius: 4px;
}

.msg-text {
    font-size: 14px;
    line-height: 1.5;
    color: $text;
    margin: 0 0 4px 0;
    white-space: pre-wrap;
    word-break: break-word;
}

.msg-time {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    display: block;
    text-align: right;
}

.input-bar {
    flex-shrink: 0;
    display: flex;
    align-items: flex-end;
    gap: 12px;
    padding: 12px 24px;
    background: #080808;
    border-top: 1px solid $border;
}
</style>