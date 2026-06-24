<template>
    <Teleport to="body">
        <transition name="slide-up">
            <div v-if="visible && !showPanel" class="cookie-bar">
                <div class="cookie-inner">
                    <div class="cookie-text">
                        <v-icon icon="mdi-cookie-outline" size="20" class="cookie-icon" />
                        <span>
                            Używamy plików cookie do analizy ruchu i personalizacji reklam.
                            <NuxtLink to="/polityka-cookies" class="cookie-link">Polityka cookies</NuxtLink>
                        </span>
                    </div>
                    <div class="cookie-actions">
                        <button class="btn-reject" @click="rejectAll">Odrzuć wszystkie</button>
                        <button class="btn-settings" @click="showPanel = true">Ustawienia</button>
                        <button class="btn-accept" @click="acceptAll">Akceptuj wszystkie</button>
                    </div>
                </div>
            </div>
        </transition>

        <transition name="fade">
            <div v-if="visible && showPanel" class="cookie-panel-overlay" @click.self="showPanel = false">
                <div class="cookie-panel">
                    <div class="panel-header">
                        <v-icon icon="mdi-cookie-cog-outline" size="20" />
                        <span>Ustawienia plików cookie</span>
                        <button class="panel-close" @click="showPanel = false">
                            <v-icon icon="mdi-close" size="18" />
                        </button>
                    </div>

                    <div class="panel-categories">
                        <div class="category always-on">
                            <div class="category-header">
                                <span class="category-name">Niezbędne</span>
                                <span class="category-badge">Zawsze włączone</span>
                            </div>
                            <p class="category-desc">Wymagane do działania serwisu (sesja, autoryzacja, bezpieczeństwo).</p>
                        </div>

                        <div class="category">
                            <div class="category-header">
                                <span class="category-name">Analityczne</span>
                                <label class="toggle">
                                    <input type="checkbox" v-model="prefs.analytics" />
                                    <span class="slider" />
                                </label>
                            </div>
                            <p class="category-desc">Google Analytics — pomaga nam mierzyć ruch i ulepszać serwis.</p>
                        </div>

                        <div class="category">
                            <div class="category-header">
                                <span class="category-name">Marketingowe</span>
                                <label class="toggle">
                                    <input type="checkbox" v-model="prefs.marketing" />
                                    <span class="slider" />
                                </label>
                            </div>
                            <p class="category-desc">Google Ads — umożliwiają wyświetlanie spersonalizowanych reklam.</p>
                        </div>
                    </div>

                    <div class="panel-actions">
                        <button class="btn-reject" @click="rejectAll">Odrzuć wszystkie</button>
                        <button class="btn-accept" @click="savePrefs">Zapisz ustawienia</button>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup lang="ts">
interface CookiePrefs { analytics: boolean; marketing: boolean; timestamp?: string }

const visible = ref(false)
const showPanel = ref(false)
const prefs = ref<CookiePrefs>({ analytics: false, marketing: false })

function onOpenCookieSettings() {
    visible.value = true
    showPanel.value = true
}

onMounted(() => {
    const stored = localStorage.getItem('cookieConsent')
    if (!stored) {
        visible.value = true
    } else {
        applyConsent(parseStored(stored))
    }
    window.addEventListener('openCookieSettings', onOpenCookieSettings)
})

onBeforeUnmount(() => {
    window.removeEventListener('openCookieSettings', onOpenCookieSettings)
})

function parseStored(stored: string): CookiePrefs {
    if (stored === 'all') return { analytics: true, marketing: true }
    if (stored === 'essential') return { analytics: false, marketing: false }
    try { return { ...{ analytics: false, marketing: false }, ...JSON.parse(stored) } }
    catch { return { analytics: false, marketing: false } }
}

function acceptAll() {
    const p: CookiePrefs = { analytics: true, marketing: true }
    persist(p)
}

function rejectAll() {
    const p: CookiePrefs = { analytics: false, marketing: false }
    persist(p)
}

function savePrefs() {
    persist({ ...prefs.value })
}

function persist(p: CookiePrefs) {
    const withTimestamp: CookiePrefs = { ...p, timestamp: new Date().toISOString() }
    localStorage.setItem('cookieConsent', JSON.stringify(withTimestamp))
    visible.value = false
    showPanel.value = false
    applyConsent(p)
    window.dispatchEvent(new Event('cookieConsentAccepted'))
    $fetch('/api/consent/log', { method: 'POST', body: withTimestamp }).catch(() => {})
}

function applyConsent(p: CookiePrefs) {
    prefs.value = p
    if (typeof window === 'undefined' || typeof (window as any).gtag !== 'function') return
    ;(window as any).gtag('consent', 'update', {
        analytics_storage: p.analytics ? 'granted' : 'denied',
        ad_storage: p.marketing ? 'granted' : 'denied',
        ad_user_data: p.marketing ? 'granted' : 'denied',
        ad_personalization: p.marketing ? 'granted' : 'denied',
        functionality_storage: 'granted',
        personalization_storage: p.analytics ? 'granted' : 'denied',
    })
}
</script>

<style lang="scss" scoped>
.cookie-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    background: #0c0c0c;
    border-top: 1px solid $border;
    padding: 14px 0;
    box-shadow: 0 -4px 24px rgba(0,0,0,0.5);
}

.cookie-inner {
    @include container;
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: space-between;
}

.cookie-text {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    color: $text-muted;
    flex: 1;
    min-width: 0;
    line-height: 1.5;
}

.cookie-icon { color: $text-dim; flex-shrink: 0; margin-top: 1px; }

.cookie-link { color: $red; text-decoration: none; font-weight: 500; &:hover { text-decoration: underline; } }

.cookie-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    flex-wrap: wrap;
}

.btn-reject {
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 8px 16px;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.btn-settings {
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 8px 16px;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.btn-accept {
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 8px 20px;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

// Settings panel overlay
.cookie-panel-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 16px;
    @media (min-width: 600px) { align-items: center; }
}

.cookie-panel {
    background: #111;
    border: 1px solid $border;
    border-radius: $r-lg;
    width: 100%;
    max-width: 520px;
    padding: 24px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.8);
}

.panel-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    color: $text;
    font-weight: 700;
    font-size: 15px;
    span { flex: 1; }
}

.panel-close {
    background: none;
    border: none;
    color: $text-dim;
    cursor: pointer;
    padding: 4px;
    border-radius: $r-sm;
    &:hover { color: $text; }
}

.panel-categories { display: flex; flex-direction: column; gap: 16px; }

.category {
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 14px 16px;
    &.always-on { opacity: 0.6; }
}

.category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
}

.category-name { font-size: 14px; font-weight: 600; color: $text; }

.category-badge {
    font-size: 11px;
    color: $text-dim;
    background: rgba(255,255,255,0.06);
    padding: 2px 8px;
    border-radius: 20px;
}

.category-desc { font-size: 12px; color: $text-muted; line-height: 1.5; margin: 0; }

// Toggle switch
.toggle {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 22px;
    flex-shrink: 0;
    cursor: pointer;
    input { opacity: 0; width: 0; height: 0; position: absolute; }
}

.slider {
    position: absolute;
    inset: 0;
    background: #333;
    border-radius: 22px;
    transition: background 0.2s;
    &::before {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        left: 3px;
        top: 3px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s;
    }
}

.toggle input:checked + .slider { background: $red; }
.toggle input:checked + .slider::before { transform: translateX(18px); }

.panel-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    justify-content: flex-end;
}

// Transitions
.slide-up-enter-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.slide-up-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.slide-up-enter-from { transform: translateY(100%); opacity: 0; }
.slide-up-leave-to { transform: translateY(100%); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
