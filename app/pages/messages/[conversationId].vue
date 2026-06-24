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
            <div v-if="loading" class="msgs-loading">
                <v-icon icon="mdi-loading" size="28" class="spin" />
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

        <div v-if="loadError" class="load-error">
            <v-icon icon="mdi-wifi-off" size="20" />
            Nie udało się załadować wiadomości.
            <button class="retry-btn" @click="loadAll">Spróbuj ponownie</button>
        </div>

        <div class="input-bar">
            <div v-if="sendError" class="send-error">{{ sendError }}</div>
            <div class="input-row">
                <textarea
                    v-model="draft"
                    class="msg-textarea"
                    placeholder="Napisz wiadomość..."
                    rows="1"
                    @keydown.enter.exact.prevent="send"
                    @input="autoResize"
                    ref="textareaRef"
                />
                <button class="send-btn" :disabled="sending || !draft.trim()" @click="send">
                    <v-icon v-if="sending" icon="mdi-loading" size="20" class="spin" />
                    <v-icon v-else icon="mdi-send" size="20" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Conversation, MessageItem } from '~/types'
definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const conversationId = Number(route.params.conversationId)

const conversation = ref<Conversation | null>(null)
const messages = ref<MessageItem[]>([])
const loading = ref(false)
const sending = ref(false)
const draft = ref('')
const scrollEl = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const loadError = ref(false)
const sendError = ref('')

function autoResize() {
    const el = textareaRef.value
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

async function loadAll() {
    loading.value = true
    loadError.value = false
    try {
        const [convs, msgs] = await Promise.all([
            $fetch<Conversation[]>('/api/proxy/api/Message/conversations'),
            $fetch<MessageItem[]>(`/api/proxy/api/Message/conversation/${conversationId}/messages`)
        ])
        conversation.value = convs.find(c => c.id === conversationId) ?? null
        messages.value = msgs
        await nextTick()
        scrollToBottom()
    } catch {
        loadError.value = true
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
    sendError.value = ''
    try {
        const msg = await $fetch<MessageItem>(`/api/proxy/api/Message/conversation/${conversationId}`, {
            method: 'POST',
            body: { content }
        })
        messages.value.push(msg)
        draft.value = ''
        if (textareaRef.value) textareaRef.value.style.height = 'auto'
        await nextTick()
        scrollToBottom()
    } catch (err: any) {
        const msg = err?.data?.message ?? err?.data?.statusMessage ?? err?.message
        sendError.value = msg || 'Nie udało się wysłać wiadomości. Spróbuj ponownie.'
    } finally {
        sending.value = false
    }
}

function formatTime(d: string) {
    return new Date(d).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}

async function pollMessages() {
    if (loading.value) return
    try {
        const msgs = await $fetch<MessageItem[]>(`/api/proxy/api/Message/conversation/${conversationId}/messages`)
        if (msgs.length > messages.value.length) {
            const lastId = messages.value[messages.value.length - 1]?.id ?? 0
            const newMsgs = msgs.filter(m => m.id > lastId)
            if (newMsgs.length) {
                messages.value.push(...newMsgs)
                await nextTick()
                scrollToBottom()
            }
        }
    } catch {}
}

let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
    loadAll()
    pollTimer = setInterval(pollMessages, 15_000)
})

onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer)
})
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

.msgs-loading {
    display: flex;
    justify-content: center;
    padding: 40px 0;
    color: $red;
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.load-error {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    background: rgba($red, 0.08);
    border-top: 1px solid rgba($red, 0.3);
    color: $text-dim;
    font-size: 13px;
}

.retry-btn {
    background: none;
    border: none;
    color: $red;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-left: 4px;
    &:hover { opacity: 0.8; }
}

.input-bar {
    flex-shrink: 0;
    padding: 12px 24px;
    background: #080808;
    border-top: 1px solid $border;
}

.send-error {
    font-size: 12px;
    color: $red;
    margin-bottom: 8px;
}

.input-row {
    display: flex;
    align-items: flex-end;
    gap: 12px;
}

.msg-textarea {
    flex: 1;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-lg;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
    outline: none;
    padding: 10px 14px;
    resize: none;
    min-height: 42px;
    max-height: 120px;
    overflow-y: auto;
    transition: border-color 0.2s;

    &::placeholder { color: $text-dark; }
    &:focus { border-color: rgba($red, 0.4); }
}

.send-btn {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: $red;
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity 0.2s;

    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
}
</style>