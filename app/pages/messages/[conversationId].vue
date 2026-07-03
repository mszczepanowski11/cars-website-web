<template>
    <div class="chat-wrap">
        <!-- Chat header -->
        <div class="chat-header">
            <NuxtLink to="/messages" class="back-btn" aria-label="Wróć">
                <v-icon icon="mdi-arrow-left" size="20" />
            </NuxtLink>

            <div class="header-user" v-if="conversation">
                <div class="header-avatar">
                    <img v-if="conversation.otherUserAvatar" :src="conversation.otherUserAvatar" class="hdr-avatar-img" :alt="conversation.otherUserName" loading="lazy" />
                    <span v-else class="hdr-avatar-initials">{{ initials }}</span>
                </div>
                <div class="header-info">
                    <div class="hdr-name">{{ conversation.otherUserName }}</div>
                    <NuxtLink :to="`/advert/${conversation.advertId}`" class="hdr-advert">
                        <v-icon icon="mdi-car" size="12" />
                        {{ conversation.advertTitle }}
                    </NuxtLink>
                </div>
            </div>
            <div v-else class="header-user">
                <div class="header-avatar"><span class="hdr-avatar-initials">?</span></div>
                <div class="header-info">
                    <div class="hdr-name hdr-name-loading" />
                    <div class="hdr-advert-loading" />
                </div>
            </div>

            <!-- Actions -->
            <div class="header-actions">
                <NuxtLink v-if="conversation" :to="`/advert/${conversation.advertId}`" class="hdr-action-btn" title="Zobacz ogłoszenie">
                    <v-icon icon="mdi-open-in-new" size="18" />
                </NuxtLink>
                <button class="hdr-action-btn" title="Więcej opcji" @click="showActions = !showActions">
                    <v-icon icon="mdi-dots-vertical" size="18" />
                </button>

                <!-- Dropdown actions -->
                <div v-if="showActions" class="actions-dropdown">
                    <div class="act-backdrop" @click="showActions = false" />
                    <div class="act-menu">
                        <button class="act-item" @click="togglePin">
                            <v-icon :icon="conversation?.isPinned ? 'mdi-pin-off' : 'mdi-pin'" size="16" />
                            {{ conversation?.isPinned ? 'Odepnij' : 'Przypnij' }}
                        </button>
                        <button class="act-item" @click="doMarkUnread">
                            <v-icon icon="mdi-email-mark-as-unread" size="16" />
                            Oznacz jako nieprzeczytane
                        </button>
                        <button class="act-item" @click="toggleArchive">
                            <v-icon :icon="conversation?.isArchived ? 'mdi-archive-arrow-up' : 'mdi-archive-arrow-down'" size="16" />
                            {{ conversation?.isArchived ? 'Przywróć z archiwum' : 'Archiwizuj' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Advert card strip -->
        <div v-if="conversation" class="advert-strip">
            <NuxtLink :to="`/advert/${conversation.advertId}`" class="advert-strip-inner">
                <img v-if="conversation.advertThumbnail" :src="conversation.advertThumbnail" class="strip-thumb" :alt="conversation.advertTitle" loading="lazy" />
                <div v-else class="strip-thumb-placeholder"><v-icon icon="mdi-car" size="16" /></div>
                <span class="strip-title">{{ conversation.advertTitle }}</span>
                <v-icon icon="mdi-chevron-right" size="16" class="strip-arrow" />
            </NuxtLink>
        </div>

        <!-- Messages area -->
        <div ref="scrollEl" class="messages-area">
            <div v-if="loading" class="msgs-loading">
                <div v-for="i in 5" :key="i" class="msg-skel" :class="i % 2 === 0 ? 'skel-right' : 'skel-left'">
                    <div class="skel-bubble" />
                </div>
            </div>

            <template v-else>
                <div v-if="loadError" class="no-messages">
                    <v-icon icon="mdi-alert-circle-outline" size="40" class="no-msg-icon" />
                    <p>Nie udało się załadować wiadomości. <button class="retry-link" @click="loadAll">Spróbuj ponownie</button></p>
                </div>

                <div v-else-if="!messages.length" class="no-messages">
                    <v-icon icon="mdi-message-outline" size="40" class="no-msg-icon" />
                    <p>Napisz pierwszą wiadomość</p>
                </div>

                <template v-for="(msg, idx) in messages" :key="msg.id">
                    <!-- Date separator -->
                    <div v-if="showDateSep(idx)" class="date-sep">
                        <span>{{ formatDate(msg.sentAt) }}</span>
                    </div>

                    <!-- Message bubble -->
                    <div class="msg-row" :class="msg.isMine ? 'row-mine' : 'row-other'">
                        <!-- Other user avatar (only first in group) -->
                        <div v-if="!msg.isMine" class="msg-avatar-col">
                            <div v-if="isFirstInGroup(idx)" class="msg-avatar">
                                <img v-if="conversation?.otherUserAvatar" :src="conversation.otherUserAvatar" :alt="conversation.otherUserName" class="bubble-avatar-img" loading="lazy" />
                                <span v-else class="bubble-avatar-initials">{{ initials }}</span>
                            </div>
                            <div v-else class="msg-avatar-spacer" />
                        </div>

                        <div class="msg-bubble" :class="msg.isMine ? 'bubble-mine' : 'bubble-other'">
                            <p class="msg-text">{{ msg.content }}</p>
                            <div class="msg-footer">
                                <span class="msg-time">{{ formatTime(msg.sentAt) }}</span>
                                <span v-if="msg.isMine" class="msg-status">
                                    <v-icon
                                        :icon="msg.isRead ? 'mdi-check-all' : 'mdi-check'"
                                        size="14"
                                        :class="msg.isRead ? 'status-read' : 'status-sent'"
                                    />
                                </span>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Typing indicator (polling-based: show for 3s after other user's last activity) -->
                <div v-if="showTyping" class="msg-row row-other typing-row">
                    <div class="msg-avatar-col">
                        <div class="msg-avatar">
                            <img v-if="conversation?.otherUserAvatar" :src="conversation.otherUserAvatar" :alt="conversation.otherUserName" class="bubble-avatar-img" loading="lazy" />
                            <span v-else class="bubble-avatar-initials">{{ initials }}</span>
                        </div>
                    </div>
                    <div class="msg-bubble bubble-other typing-bubble">
                        <span class="typing-dot" /><span class="typing-dot" /><span class="typing-dot" />
                    </div>
                </div>
            </template>
        </div>

        <!-- Load error -->
        <div v-if="loadError" class="load-error">
            <v-icon icon="mdi-wifi-off" size="16" />
            Błąd ładowania.
            <button class="retry-btn" @click="loadAll">Spróbuj</button>
        </div>

        <!-- Input bar -->
        <div class="input-bar">
            <div v-if="sendError" class="send-error">{{ sendError }}</div>
            <div class="input-row">
                <textarea
                    v-model="draft"
                    ref="textareaRef"
                    class="msg-textarea"
                    placeholder="Napisz wiadomość..."
                    rows="1"
                    :disabled="sending"
                    @keydown.enter.exact.prevent="send"
                    @input="autoResize"
                />
                <button
                    class="send-btn"
                    :disabled="sending || !draft.trim()"
                    :title="sending ? 'Wysyłanie...' : 'Wyślij (Enter)'"
                    @click="send"
                >
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
const emit = defineEmits<{ (e: 'conversation-updated'): void }>()
const { error: toastError } = useToast()
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
const showActions = ref(false)
const showTyping = ref(false)
let prevMessageCount = 0
let pollTimer: ReturnType<typeof setInterval> | null = null

const initials = computed(() => {
    const name = conversation.value?.otherUserName ?? ''
    return name.split(' ').map(p => p[0] ?? '').join('').slice(0, 2).toUpperCase()
})

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
        prevMessageCount = msgs.length
        await nextTick()
        scrollToBottom()
    } catch {
        loadError.value = true
    } finally {
        loading.value = false
    }
}

function scrollToBottom(smooth = false) {
    if (!scrollEl.value) return
    scrollEl.value.scrollTo({ top: scrollEl.value.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
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
        scrollToBottom(true)
        emit('conversation-updated')
    } catch (err: any) {
        const msg = err?.data?.message ?? err?.data?.statusMessage ?? err?.message
        sendError.value = msg || 'Nie udało się wysłać. Spróbuj ponownie.'
    } finally {
        sending.value = false
    }
}

async function pollMessages() {
    if (loading.value) return
    try {
        const msgs = await $fetch<MessageItem[]>(`/api/proxy/api/Message/conversation/${conversationId}/messages`)
        if (msgs.length > messages.value.length) {
            const lastKnownId = messages.value[messages.value.length - 1]?.id ?? 0
            const newMsgs = msgs.filter(m => m.id > lastKnownId)
            if (newMsgs.length) {
                // Show typing before adding new messages from other user
                const hasOtherMsg = newMsgs.some(m => !m.isMine)
                if (hasOtherMsg) {
                    showTyping.value = true
                    await new Promise(r => setTimeout(r, 600))
                    showTyping.value = false
                }
                messages.value.push(...newMsgs)
                prevMessageCount = msgs.length
                await nextTick()
                scrollToBottom(true)
                emit('conversation-updated')
            }
        }
        // Update read statuses on existing messages
        for (const msg of messages.value) {
            const fresh = msgs.find(m => m.id === msg.id)
            if (fresh && fresh.isRead !== msg.isRead) msg.isRead = fresh.isRead
        }
    } catch (err: any) {
        const status = err?.response?.status ?? err?.statusCode
        if (status === 401) {
            if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
        }
    }
}

// Date separator: show if this is the first message or date differs from prev
function showDateSep(idx: number): boolean {
    if (idx === 0) return true
    const prev = new Date(messages.value[idx - 1].sentAt)
    const cur = new Date(messages.value[idx].sentAt)
    return prev.toDateString() !== cur.toDateString()
}

// First in group: show avatar if sender changed or first message
function isFirstInGroup(idx: number): boolean {
    if (idx === 0) return true
    return messages.value[idx - 1].isMine !== messages.value[idx].isMine
}

function formatDate(d: string) {
    const date = new Date(d)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    if (diff < 86_400_000 && date.toDateString() === now.toDateString()) return 'Dzisiaj'
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return 'Wczoraj'
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(d: string) {
    return new Date(d).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}

async function togglePin() {
    showActions.value = false
    if (!conversation.value) return
    try {
        const updated = await $fetch<Conversation>(`/api/proxy/api/Message/conversation/${conversationId}/pin`, { method: 'PUT' })
        conversation.value = updated
        emit('conversation-updated')
    } catch { toastError('Nie udało się przypiąć rozmowy.') }
}

async function toggleArchive() {
    showActions.value = false
    if (!conversation.value) return
    try {
        const updated = await $fetch<Conversation>(`/api/proxy/api/Message/conversation/${conversationId}/archive`, { method: 'PUT' })
        conversation.value = updated
        emit('conversation-updated')
    } catch { toastError('Nie udało się zarchiwizować rozmowy.') }
}

async function doMarkUnread() {
    showActions.value = false
    try {
        await $fetch(`/api/proxy/api/Message/conversation/${conversationId}/mark-unread`, { method: 'PUT' })
        emit('conversation-updated')
    } catch { toastError('Nie udało się oznaczyć jako nieprzeczytane.') }
}

onMounted(() => {
    loadAll()
    pollTimer = setInterval(pollMessages, 8_000)
})

onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer)
})
</script>

<style lang="scss" scoped>
.chat-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: $bg;
    overflow: hidden;
}

// ── Header ──────────────────────────────────────────────────────────────────
.chat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    height: 60px;
    background: rgba(0,0,0,0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid $border;
    flex-shrink: 0;
    position: relative;
}

.back-btn {
    color: $text-dim;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: color 0.2s;
    &:hover { color: $text; }
}

.header-user {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
}

.header-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
}

.hdr-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.hdr-avatar-initials { font-size: 14px; font-weight: 700; color: $red; }

.header-info { min-width: 0; flex: 1; }
.hdr-name {
    font-size: 15px;
    font-weight: 700;
    color: $text;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.hdr-name-loading {
    height: 14px;
    width: 120px;
    background: #1a1a1a;
    border-radius: 6px;
    margin-bottom: 6px;
    animation: shimmer 1.4s infinite;
}
.hdr-advert {
    font-size: 11px;
    color: $red;
    display: flex;
    align-items: center;
    gap: 3px;
    &:hover { opacity: 0.8; }
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.hdr-advert-loading {
    height: 10px;
    width: 180px;
    background: #1a1a1a;
    border-radius: 5px;
    animation: shimmer 1.4s infinite;
}

// Header actions
.header-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    position: relative;
}

.hdr-action-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: none;
    border: none;
    color: $text-dim;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    &:hover { background: #1a1a1a; color: $text; }
}

.act-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
}

.act-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 101;
    background: #111;
    border: 1px solid #2a2a2a;
    border-radius: $r-md;
    padding: 4px;
    min-width: 220px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.7);
}

.act-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    background: none;
    border: none;
    color: $text-dim;
    font-size: 13px;
    padding: 9px 12px;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, color 0.15s;
    &:hover { background: #1a1a1a; color: $text; }
}

// ── Advert strip ──────────────────────────────────────────────────────────────
.advert-strip {
    flex-shrink: 0;
    border-bottom: 1px solid $border;
}

.advert-strip-inner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    background: #050505;
    transition: background 0.15s;
    text-decoration: none;
    &:hover { background: #0a0a0a; }
}

.strip-thumb {
    width: 36px;
    height: 28px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
}

.strip-thumb-placeholder {
    width: 36px;
    height: 28px;
    background: #1a1a1a;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-dark;
    flex-shrink: 0;
}

.strip-title {
    flex: 1;
    font-size: 12px;
    color: $text-dim;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.strip-arrow { color: $text-dark; flex-shrink: 0; }

// ── Messages area ──────────────────────────────────────────────────────────────
.messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 2px;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 2px; }
}

// Skeletons
.msg-skel {
    display: flex;
    margin-bottom: 8px;
    &.skel-right { justify-content: flex-end; }
    &.skel-left { justify-content: flex-start; padding-left: 48px; }
}
.skel-bubble {
    height: 36px;
    width: 180px;
    background: #1a1a1a;
    border-radius: 16px;
    animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
}

// No messages
.no-messages {
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: $text-dark;
    font-size: 14px;
}
.no-msg-icon { color: #1a1a1a; }

// Date separator
.date-sep {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 12px 0 8px;

    span {
        font-size: 11px;
        color: $text-dark;
        background: #0a0a0a;
        padding: 3px 10px;
        border-radius: 20px;
        border: 1px solid $border;
    }
}

// Message rows
.msg-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    margin-bottom: 2px;

    &.row-mine { justify-content: flex-end; }
    &.row-other { justify-content: flex-start; }
}

// Avatar column (other user)
.msg-avatar-col { width: 32px; flex-shrink: 0; }
.msg-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.bubble-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.bubble-avatar-initials { font-size: 11px; font-weight: 700; color: $red; }
.msg-avatar-spacer { width: 32px; }

// Bubble
.msg-bubble {
    max-width: min(68%, 480px);
    padding: 9px 13px;
    border-radius: 18px;
    word-break: break-word;
    white-space: pre-wrap;
}

.bubble-mine {
    background: $red;
    border-bottom-right-radius: 4px;
}

.bubble-other {
    background: #141414;
    border: 1px solid #1e1e1e;
    border-bottom-left-radius: 4px;
}

.msg-text {
    font-size: 14px;
    line-height: 1.5;
    color: $text;
    margin: 0 0 4px 0;
}

.msg-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
}

.msg-time {
    font-size: 10px;
    color: rgba(255,255,255,0.4);
}

.msg-status { display: flex; align-items: center; }
.status-read { color: rgba(255,255,255,0.7); }
.status-sent { color: rgba(255,255,255,0.35); }

// Typing indicator
.typing-row { margin-top: 4px; }
.typing-bubble {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
}
.typing-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: $text-dark;
    animation: typing-pulse 1.2s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
}
@keyframes typing-pulse {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-4px); opacity: 1; }
}

// ── Load error ──────────────────────────────────────────────────────────────────
.load-error {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba($red, 0.07);
    border-top: 1px solid rgba($red, 0.25);
    color: $text-dim;
    font-size: 12px;
}
.retry-btn {
    background: none;
    border: none;
    color: $red;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    &:hover { opacity: 0.8; }
}

// ── Input bar ──────────────────────────────────────────────────────────────────
.input-bar {
    flex-shrink: 0;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
    background: #050505;
    border-top: 1px solid $border;
}

.send-error {
    font-size: 12px;
    color: $red;
    margin-bottom: 6px;
}

.input-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
}

.msg-textarea {
    flex: 1;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: 22px;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
    outline: none;
    padding: 10px 16px;
    resize: none;
    min-height: 42px;
    max-height: 120px;
    overflow-y: auto;
    transition: border-color 0.2s;

    &::placeholder { color: $text-dark; }
    &:focus { border-color: rgba($red, 0.4); }
    &:disabled { opacity: 0.6; }
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
    transition: opacity 0.2s, transform 0.1s;

    &:hover:not(:disabled) { opacity: 0.88; transform: scale(1.04); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

// ── Mobile ──────────────────────────────────────────────────────────────────────
@media (max-width: 768px) {
    .chat-wrap {
        // 100vh on iOS Safari is the *layout* viewport height, which ignores the on-screen
        // keyboard/toolbars — the input bar (flex-shrink:0, last in the column) ends up
        // positioned below the visible area or under the browser's bottom bar. 100dvh tracks
        // the *current* browser-chrome state but can still momentarily report the larger
        // (chrome-collapsed) value while the chrome is actually expanded, letting the fixed
        // panel's bottom slip under the toolbar. 100svh is the smallest possible viewport
        // (chrome always fully expanded) — guarantees the input bar stays above it, at the
        // cost of a little unused space on the rare occasion the chrome auto-hides.
        height: calc(100vh - $nav-height);
        height: calc(100dvh - $nav-height);
        height: calc(100svh - $nav-height);
        position: fixed;
        inset: $nav-height 0 0 0;
        z-index: 10;
    }
    .back-btn { display: flex !important; }
}
</style>
