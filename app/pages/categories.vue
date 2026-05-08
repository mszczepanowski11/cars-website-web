<template>
    <div class="cats-page">
        <section class="cats-hero">
            <div class="container">
                <p class="cats-label">KATEGORIE</p>
                <h1 class="cats-heading">ZNAJDŹ COŚ <span>DLA SIEBIE</span></h1>
                <p class="cats-sub">Wybierz kategorię i znajdź idealną ofertę</p>
                <div class="cats-divider" />
            </div>
        </section>

        <section class="cats-grid-section">
            <div class="container">
                <div class="cats-grid">
                    <NuxtLink
                        v-for="cat in categories"
                        :key="cat.slug"
                        :to="`/adverts?categoryId=${cat.id}`"
                        class="cat-card"
                        :style="{ backgroundImage: `url(${catImages[cat.slug]})` }"
                    >
                        <div class="cat-overlay" />
                        <div class="cat-icon-wrap">
                            <v-icon :icon="cat.iconName" color="#8B0D1D" size="28" />
                        </div>
                        <div class="cat-info">
                            <h2 class="cat-name">{{ cat.name.toUpperCase() }}</h2>
                            <p class="cat-desc">{{ cat.description }}</p>
                            <div class="cat-btn">
                                Zobacz oferty
                                <v-icon icon="mdi-arrow-right" size="16" class="ml-1" />
                            </div>
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { useCategories } from '~/composables/useCategories'
import type { CategoryWithCount } from '~/types'

const { fetchCategories } = useCategories()
const categories = ref<CategoryWithCount[]>([])

const catImages: Record<string, string> = {
    'auta-osobowe': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=900&auto=format&fit=crop',
    'dostawcze': 'https://images.unsplash.com/photo-1635773054018-c77a8a3cffc3?q=80&w=900&auto=format&fit=crop',
    'ciezarowe': 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=900&auto=format&fit=crop',
    'maszyny': 'https://images.unsplash.com/photo-1582738411706-bbb6f4386e4f?q=80&w=900&auto=format&fit=crop',
    'czesci': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=900&auto=format&fit=crop',
    'motocykle': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=900&auto=format&fit=crop',
    'przyczepy': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=900&auto=format&fit=crop',
    'rolnicze': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=900&auto=format&fit=crop',
    'budowlane': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=900&auto=format&fit=crop',
    'inne': 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=900&auto=format&fit=crop',
}

onMounted(async () => {
    categories.value = await fetchCategories()
})
</script>

<style lang="scss" scoped>
.cats-page { background: $bg; min-height: 100vh; }

.container { @include container; }

.cats-hero {
    padding: 140px 0 60px;
    text-align: center;
}

.cats-label {
    color: $red;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 4px;
    margin-bottom: 20px;
}

.cats-heading {
    font-size: clamp(48px, 8vw, 88px);
    font-weight: 900;
    color: $text;
    line-height: 1;
    margin-bottom: 20px;
    span { color: $red; }
}

.cats-sub {
    color: $text-muted;
    font-size: 18px;
}

.cats-divider {
    width: 60px;
    height: 3px;
    background: $red;
    margin: 28px auto 0;
}

.cats-grid-section { padding: 20px 0 80px; }

.cats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, 400px);
    gap: 16px;

    @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); grid-template-rows: auto; }
    @media (max-width: 780px)  { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 500px)  { grid-template-columns: 1fr; }
}

.cat-card {
    position: relative;
    border-radius: $r-lg;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    background-size: cover;
    background-position: center;
    text-decoration: none;
    border: 1px solid $border;
    transition: transform 0.35s ease, border-color 0.3s;

    &:hover {
        transform: translateY(-6px);
        border-color: $red-fade;
        .cat-btn { color: $red; }
    }
}

.cat-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        180deg,
        rgba(0,0,0,0.35) 0%,
        rgba(0,0,0,0.75) 60%,
        rgba(0,0,0,0.92) 100%
    );
    border-radius: inherit;
}

.cat-icon-wrap {
    position: relative;
    z-index: 2;
    width: 48px;
    height: 48px;
    border: 1px solid rgba(139,13,29,0.5);
    border-radius: $r-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(139,13,29,0.12);
}

.cat-info {
    position: relative;
    z-index: 2;
}

.cat-name {
    font-size: 22px;
    font-weight: 900;
    color: $text;
    letter-spacing: 1px;
    line-height: 1.1;
    margin-bottom: 8px;
}

.cat-desc {
    color: $text-muted;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 16px;
}

.cat-btn {
    display: inline-flex;
    align-items: center;
    color: $text-link;
    font-size: 13px;
    font-weight: 600;
    transition: color 0.2s;
}
</style>