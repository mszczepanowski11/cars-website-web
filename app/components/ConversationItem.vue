<template>
    <div
        class="conv-item"
        :class="{
            'conv-active': active,
            'conv-unread': conv.unreadCount > 0
        }"
        @click="$emit('click')"
        @contextmenu.prevent="openMenu"
    >
        <!-- Avatar -->
        <div class="conv-avatar-wrap">
            <div class="conv-avatar">
                <img v-if="conv.otherUserAvatar" :src="conv.otherUserAvatar" :alt="conv.otherUserName" class="avatar-img" loading="lazy" />
                <span v-else class="avatar-initials">{{ initials }}</span>
            </div>
            <span v-if="conv.unreadCount > 0" class="unread-dot" />
        </div>

        <!-- Body -->
        <div class="conv-body">
            <div class="conv-top">
                <span class="conv-name" :class="{ bold: conv.unreadCount > 0 }">{{ conv.otherUserName }}</span>
                <span class="conv-time">{{ timeLabel }}</span>
            </div>
            <div class="conv-advert">
                <img v-if="conv.advertThumbnail" :src="conv.advertThumbnail" class="advert-thumb" :alt="conv.advertTitle" loading="lazy" />
                <span class="advert-title">{{ conv.advertTitle }}</span>
            </div>
            <div class="conv-preview">
                <span v-if="conv.lastMessageIsMine" class="preview-mine">Ty: </span>
                <span>{{ conv.lastMessageContent || 'Zacznij rozmowę' }}</span>
            </div>
        </div>

        <!-- Right meta -->
        <div class="conv-meta">
            <span v-if="conv.unreadCount > 0" class="unread-badge">{{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}</span>
            <v-icon v-if="conv.isPinned" icon="mdi-pin" size="14" class="pin-icon" />
        </div>

        <!-- Context menu -->
        <Teleport to="body">
            <div v-if="showMenu" class="ctx-backdrop" @click="showMenu = false" @contextmenu.prevent="showMenu = false" />
            <div v-if="showMenu" class="ctx-menu" :style="menuStyle" @click.stop>
                <button class="ctx-item" @click="emit('pin'); showMenu = false">
                    <v-icon :icon="conv.isPinned ? 'mdi-pin-off' : 'mdi-pin'" size="16" />
                    {{ conv.isPinned ? 'Odepnij' : 'Przypnij' }}
                </button>
                <button class="ctx-item" @click="emit('mark-unread'); showMenu = false">
                    <v-icon icon="mdi-email-mark-as-unread" size="16" />
                    Oznacz jako nieprzeczytane
                </button>
                <button class="ctx-item" @click="emit('archive'); showMenu = false">
                    <v-icon :icon="conv.isArchived ? 'mdi-archive-arrow-up' : 'mdi-archive-arrow-down'" size="16" />
                    {{ conv.isArchived ? 'Przywróć' : 'Archiwizuj' }}
                </button>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~/types'

const props = defineProps<{ conv: Conversation; active?: boolean }>()
const emit = defineEmits<{
    (e: 'click'): void
    (e: 'pin'): void
    (e: 'archive'): void
    (e: 'mark-unread'): void
}>()

const showMenu = ref(false)
const menuStyle = ref('')

const initials = computed(() => {
    const parts = props.conv.otherUserName.split(' ')
    return parts.map(p => p[0] ?? '').join('').slice(0, 2).toUpperCase()
})

const timeLabel = computed(() => {
    const d = new Date(props.conv.lastMessageAt)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60_000) return 'teraz'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`
    if (diff < 86_400_000) return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    if (diff < 7 * 86_400_000) return d.toLocaleDateString('pl-PL', { weekday: 'short' })
    return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })
})

function openMenu(e: MouseEvent) {
    const x = Math.min(e.clientX, window.innerWidth - 210)
    const y = Math.min(e.clientY, window.innerHeight - 130)
    menuStyle.value = `top:${y}px;left:${x}px`
    showMenu.value = true
}
</script>

<style lang="scss" scoped>
.conv-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    cursor: pointer;
    transition: background 0.15s;
    position: relative;
    border-left: 3px solid transparent;

    &:hover { background: #0d0d0d; }
    &.conv-active {
        background: #0d0d0d;
        border-left-color: $red;
    }
    &.conv-unread .conv-name { color: #fff; }
}

// Avatar
.conv-avatar-wrap {
    position: relative;
    flex-shrink: 0;
}

.conv-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-initials {
    font-size: 16px;
    font-weight: 700;
    color: $red;
    letter-spacing: -0.5px;
}

.unread-dot {
    position: absolute;
    bottom: 1px;
    right: 1px;
    width: 10px;
    height: 10px;
    background: $red;
    border-radius: 50%;
    border: 2px solid #050505;
}

// Body
.conv-body {
    flex: 1;
    min-width: 0;
}

.conv-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3px;
}

.conv-name {
    font-size: 14px;
    font-weight: 500;
    color: $text-dim;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.bold { font-weight: 700; color: $text; }
}

.conv-time {
    font-size: 11px;
    color: $text-dark;
    flex-shrink: 0;
    margin-left: 8px;
}

.conv-advert {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 3px;
}

.advert-thumb {
    width: 18px;
    height: 14px;
    object-fit: cover;
    border-radius: 2px;
    flex-shrink: 0;
}

.advert-title {
    font-size: 11px;
    color: $red;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.85;
}

.conv-preview {
    font-size: 13px;
    color: $text-dark;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.preview-mine {
    color: $text-dim;
    font-weight: 500;
}

// Meta
.conv-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
}

.unread-badge {
    background: $red;
    color: white;
    border-radius: 10px;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    padding: 0 5px;
}

.pin-icon { color: $text-dark; }

// Context menu
.ctx-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
}

.ctx-menu {
    position: fixed;
    z-index: 1001;
    background: #111;
    border: 1px solid #2a2a2a;
    border-radius: $r-md;
    padding: 4px;
    min-width: 200px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
}

.ctx-item {
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
</style>
