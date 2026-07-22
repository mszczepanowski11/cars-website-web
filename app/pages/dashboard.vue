<template>
    <div class="dash-page">

        <!-- Left sidebar -->
        <aside class="dash-sidebar">
            <nav class="dash-nav">
                <button class="nav-item" :class="{ active: section === 'overview' }" @click="section = 'overview'">
                    <v-icon icon="mdi-view-dashboard-outline" size="19" /><span>{{ $t('dashboard.navOverview') }}</span>
                </button>
                <NuxtLink to="/my-adverts" class="nav-item">
                    <v-icon icon="mdi-card-text-outline" size="19" /><span>{{ $t('dashboard.navMyAdverts') }}</span>
                </NuxtLink>
                <NuxtLink to="/favorites" class="nav-item">
                    <v-icon icon="mdi-heart-outline" size="19" /><span>{{ $t('dashboard.navFavorites') }}</span>
                </NuxtLink>
                <button class="nav-item" :class="{ active: section === 'searches' }" @click="section = 'searches'">
                    <v-icon icon="mdi-magnify" size="19" /><span>{{ $t('dashboard.navSearches') }}</span>
                    <span v-if="savedSearchNewCount > 0" class="nav-badge">{{ savedSearchNewCount }}</span>
                </button>
                <NuxtLink to="/messages" class="nav-item">
                    <v-icon icon="mdi-email-outline" size="19" /><span>{{ $t('dashboard.navMessages') }}</span>
                    <span v-if="stats?.unreadMessages" class="nav-badge">{{ stats.unreadMessages }}</span>
                </NuxtLink>
                <button class="nav-item" :class="{ active: section === 'notifications' }" @click="goNotifications">
                    <v-icon icon="mdi-bell-outline" size="19" /><span>{{ $t('dashboard.navNotifications') }}</span>
                    <span v-if="notifUnread > 0" class="nav-badge">{{ notifUnread }}</span>
                </button>
                <button class="nav-item" :class="{ active: section === 'reviews' }" @click="goReviews">
                    <v-icon icon="mdi-star-outline" size="19" /><span>{{ $t('dashboard.navReviews') }}</span>
                </button>
                <NuxtLink to="/faktury" class="nav-item">
                    <v-icon icon="mdi-receipt-text-outline" size="19" /><span>{{ $t('dashboard.navInvoices') }}</span>
                </NuxtLink>
                <div class="nav-divider" />
                <button class="nav-item" :class="{ active: section === 'profile' }" @click="goProfile">
                    <v-icon icon="mdi-account-outline" size="19" /><span>{{ $t('dashboard.navPersonalData') }}</span>
                </button>
                <button class="nav-item" :class="{ active: section === 'settings' }" @click="goSettings">
                    <v-icon icon="mdi-cog-outline" size="19" /><span>{{ $t('dashboard.navAccountSettings') }}</span>
                </button>
                <div class="nav-divider" />
                <button class="nav-item nav-danger" @click="authLogout">
                    <v-icon icon="mdi-logout" size="19" /><span>{{ $t('dashboard.navLogout') }}</span>
                </button>
            </nav>
            <!-- B2B subscription widget -->
            <div v-if="profile?.accountType === 'Business'" class="dash-subscription">
                <div v-if="subscription" class="sub-info">
                    <div class="sub-label">
                        <v-icon :icon="subscription.isActive ? 'mdi-check-circle-outline' : 'mdi-briefcase-outline'" size="14" />
                        {{ $t('dashboard.b2bPackage') }}
                    </div>
                    <div class="sub-tier">{{ subscription.tierName }}</div>
                    <div v-if="subscription.isActive" class="sub-quota">
                        {{ $t('dashboard.featured') }}: {{ subscription.featuredQuotaUsed }}/{{ subscription.featuredQuotaPerMonth === -1 ? '∞' : subscription.featuredQuotaPerMonth }}
                    </div>
                </div>
                <NuxtLink to="/pakiety" class="sub-btn">
                    {{ subscription?.isActive ? $t('dashboard.changePackage') : $t('dashboard.activatePackage') }}
                </NuxtLink>
            </div>
            <div v-else class="dash-promo">
                <div class="promo-text">
                    <div class="promo-title">{{ $t('dashboard.promoTitle1') }}<br>{{ $t('dashboard.promoTitle2') }}</div>
                    <p class="promo-sub">{{ $t('dashboard.promoSub') }}</p>
                    <NuxtLink to="/promote" class="promo-btn">{{ $t('dashboard.promoBtn') }}</NuxtLink>
                </div>
            </div>
        </aside>

        <!-- Mobile nav strip (visible only when sidebar is hidden) -->
        <nav class="dash-mobile-nav">
            <button :class="['dmn-item', { active: section === 'overview' }]" @click="section = 'overview'">
                <v-icon icon="mdi-view-dashboard-outline" size="20" /><span>{{ $t('dashboard.mnavPanel') }}</span>
            </button>
            <NuxtLink to="/my-adverts" class="dmn-item">
                <v-icon icon="mdi-card-text-outline" size="20" /><span>{{ $t('dashboard.mnavAdverts') }}</span>
            </NuxtLink>
            <NuxtLink to="/messages" class="dmn-item">
                <v-icon icon="mdi-email-outline" size="20" /><span>{{ $t('dashboard.mnavMessages') }}</span>
                <span v-if="stats?.unreadMessages" class="dmn-badge">{{ stats.unreadMessages }}</span>
            </NuxtLink>
            <button :class="['dmn-item', { active: section === 'notifications' }]" @click="goNotifications">
                <v-icon icon="mdi-bell-outline" size="20" /><span>{{ $t('dashboard.mnavNotif') }}</span>
                <span v-if="notifUnread > 0" class="dmn-badge">{{ notifUnread }}</span>
            </button>
            <button :class="['dmn-item', { active: section === 'profile' }]" @click="goProfile">
                <v-icon icon="mdi-account-outline" size="20" /><span>{{ $t('dashboard.mnavProfile') }}</span>
            </button>
            <button :class="['dmn-item', { active: section === 'settings' }]" @click="goSettings">
                <v-icon icon="mdi-cog-outline" size="20" /><span>{{ $t('dashboard.mnavSettings') }}</span>
            </button>
            <button class="dmn-item dmn-item--danger" @click="authLogout">
                <v-icon icon="mdi-logout" size="20" /><span>{{ $t('dashboard.mnavLogout') }}</span>
            </button>
        </nav>

        <!-- Center -->
        <main class="dash-main">

            <!-- ══ OVERVIEW ══════════════════════════════════════════════════ -->
            <template v-if="section === 'overview'">
                <!-- Profile banner -->
                <div class="profile-banner">
                    <div class="banner-gradient" />
                    <div class="banner-content">
                        <div class="avatar-wrap">
                            <div class="avatar">{{ initials }}</div>
                        </div>
                        <div class="profile-info">
                            <div class="profile-name-row">
                                <h1 class="profile-name">{{ profile?.name }} {{ profile?.surname }}</h1>
                                <v-icon v-if="profile?.accountType === 'Business'" icon="mdi-check-decagram" size="18" class="verified-badge" />
                            </div>
                            <div class="profile-role">{{ profile?.accountType === 'Business' ? (profile.companyName ??
                                $t('dashboard.dealer')) : $t('dashboard.individualUser') }}</div>
                            <div class="profile-since">{{ $t('dashboard.memberSince') }} {{ memberSince }}</div>
                        </div>
                    </div>
                    <div class="banner-tags">
                        <span v-if="profile?.accountType === 'Business'" class="btag btag-dealer">
                            <v-icon icon="mdi-shield-check" size="13" />{{ $t('dashboard.verifiedDealer') }}
                        </span>
                        <span v-if="profile?.email" class="btag">
                            <v-icon icon="mdi-email-outline" size="13" />{{ profile.email }}
                        </span>
                        <span v-if="profile?.phoneNumber" class="btag">
                            <v-icon icon="mdi-phone-outline" size="13" />{{ profile.phoneNumber }}
                        </span>
                        <span v-if="profile?.city" class="btag">
                            <v-icon icon="mdi-map-marker-outline" size="13" />{{ profile.city }}<template
                                v-if="profile.region">, {{ profile.region }}</template>
                        </span>
                    </div>
                    <button class="edit-profile-btn" @click="goProfile">
                        <v-icon icon="mdi-pencil-outline" size="15" />{{ $t('dashboard.editProfile') }}
                    </button>
                </div>

                <!-- Stats row -->
                <div class="stats-row">
                    <div class="stat-card">
                        <v-icon icon="mdi-car-outline" size="22" class="stat-icon" />
                        <div class="stat-num" v-count-up="stats?.totalAdverts ?? 0" />
                        <div class="stat-label">{{ $t('dashboard.statMyAdverts') }}</div>
                        <div class="stat-sub green">{{ stats?.activeAdverts ?? 0 }} {{ $t('dashboard.statActive') }}</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-eye-outline" size="22" class="stat-icon" />
                        <div class="stat-num">{{ formatViews(stats?.totalViews ?? 0) }}</div>
                        <div class="stat-label">{{ $t('dashboard.statViews') }}</div>
                        <div class="stat-sub">{{ $t('dashboard.statTotal') }}</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-check-circle-outline" size="22" class="stat-icon" />
                        <div class="stat-num" v-count-up="stats?.totalSold ?? 0" />
                        <div class="stat-label">{{ $t('dashboard.statSold') }}</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-heart-outline" size="22" class="stat-icon" />
                        <div class="stat-num" v-count-up="stats?.favoritesCount ?? 0" />
                        <div class="stat-label">{{ $t('dashboard.statFavorites') }}</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-star-outline" size="22" class="stat-icon" />
                        <div class="stat-num">{{ stats?.averageRating ? stats.averageRating.toFixed(1) : $t('dashboard.none') }}</div>
                        <div class="stat-label">{{ $t('dashboard.statRating') }}</div>
                        <div v-if="stats?.averageRating" class="stat-stars">
                            <v-icon v-for="n in 5" :key="n"
                                :icon="n <= Math.round(stats.averageRating) ? 'mdi-star' : 'mdi-star-outline'"
                                size="12" />
                        </div>
                        <div v-if="stats?.reviewCount" class="stat-sub">{{ stats.reviewCount }} {{ $t('dashboard.reviewsWord') }}</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-account-multiple-outline" size="22" class="stat-icon" />
                        <div class="stat-num" v-count-up="stats?.followersCount ?? 0" />
                        <div class="stat-label">{{ $t('dashboard.statFollowers') }}</div>
                    </div>
                </div>

                <!-- Recently viewed strip -->
                <div v-if="recentAdverts.length" class="recent-section">
                    <div class="recent-hd">
                        <v-icon icon="mdi-history" size="14" class="recent-hd-icon" />
                        {{ $t('dashboard.recentlyViewed') }}
                    </div>
                    <div class="recent-strip">
                        <NuxtLink
                            v-for="a in recentAdverts"
                            :key="a.id"
                            :to="`/advert/${a.id}`"
                            class="recent-mini-card"
                        >
                            <img
                                :src="getImageUrl(a.images?.find(i => i.isMain)?.url)"
                                class="recent-mini-img"
                                :alt="a.title"
                                loading="lazy"
                            />
                            <div class="recent-mini-body">
                                <div class="recent-mini-name">{{ a.brand?.name }} {{ a.model?.name }}</div>
                                <div class="recent-mini-price">{{ Number(a.price).toLocaleString('pl') }} zł</div>
                                <div class="recent-mini-meta">{{ a.year }} · {{ Number(a.mileage).toLocaleString('pl') }} km</div>
                            </div>
                        </NuxtLink>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="tabs-bar">
                    <button v-for="tab in overviewTabs" :key="tab.key" class="tab-btn"
                        :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">{{ tab.label }}
                    </button>
                </div>

                <!-- Tab: Moje ogłoszenia -->
                <div v-if="activeTab === 'adverts'" class="tab-body">
                    <div class="tab-toolbar">
                        <div class="tab-search">
                            <v-icon icon="mdi-magnify" size="18" class="ts-icon" />
                            <input v-model="advertSearch" class="ts-input"
                                :placeholder="$t('dashboard.searchPlaceholder')" />
                        </div>
                        <NuxtLink to="/add-advert" class="btn-add-ad">
                            <v-icon icon="mdi-plus" size="16" />{{ $t('dashboard.addAdvert') }}
                        </NuxtLink>
                    </div>
                    <div v-if="loading" class="loading-row"><v-icon icon="mdi-loading" size="28" class="spin" /></div>
                    <div v-else-if="filteredAdverts.length" class="adverts-grid">
                        <div v-for="a in filteredAdverts" :key="a.id" class="advert-card">
                            <div class="adcard-img-wrap">
                                <span class="adcard-badge" :class="advertBadgeClass(a)">{{ advertBadgeLabel(a) }}</span>
                                <img :src="getImageUrl(a.images?.find(i => i.isMain)?.url)" :alt="a.title" loading="lazy" />
                                <button class="adcard-delete-btn" :disabled="deleteLoading === a.id" :title="$t('dashboard.deleteTitle')"
                                    @click.stop="confirmDelete(a.id)">
                                    <v-icon v-if="deleteLoading === a.id" icon="mdi-loading" size="14" class="spin" />
                                    <v-icon v-else icon="mdi-delete-outline" size="14" />
                                </button>
                            </div>
                            <div class="adcard-body">
                                <NuxtLink :to="`/advert/${a.id}`" class="adcard-link-area">
                                    <div class="adcard-title">{{ a.brand?.name }} {{ a.model?.name }}</div>
                                    <div class="adcard-meta">{{ a.year }} • {{ a.fuelType?.name ?? '—' }} • {{
                                        Number(a.mileage).toLocaleString('pl') }} km</div>
                                    <div class="adcard-price">{{ Number(a.price).toLocaleString('pl') }} zł</div>
                                    <div class="adcard-stats">
                                        <span><v-icon icon="mdi-eye-outline" size="13" /> {{ a.viewCount ?? 0 }}</span>
                                        <span><v-icon icon="mdi-heart-outline" size="13" /> {{ a.favoriteCount ?? 0 }}</span>
                                    </div>
                                </NuxtLink>
                                <div class="adcard-actions">
                                    <NuxtLink :to="`/add-advert?edit=${a.id}`" class="adcard-act">
                                        <v-icon icon="mdi-pencil-outline" size="12" />{{ $t('dashboard.edit') }}
                                    </NuxtLink>
                                    <NuxtLink :to="`/promote-advert/${a.id}`" class="adcard-act adcard-act--promo">
                                        <v-icon icon="mdi-star-outline" size="12" />{{ $t('dashboard.promote') }}
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="empty-state">
                        <v-icon icon="mdi-car-outline" size="36" class="empty-icon" />
                        <p>{{ $t('dashboard.emptyAdverts') }}</p>
                        <NuxtLink to="/add-advert" class="btn-red-sm">{{ $t('dashboard.addFirstAdvert') }}</NuxtLink>
                    </div>
                    <button v-if="myAdverts.length && myAdverts.length < advertTotal" class="show-more-btn"
                        :disabled="loadingMore" @click="loadMoreAdverts">
                        <v-icon v-if="loadingMore" icon="mdi-loading" size="16" class="spin" />
                        <span v-else>{{ $t('dashboard.showMore') }}</span>
                    </button>

                    <!-- Delete confirm modal -->
                    <Teleport to="body">
                        <transition name="fade">
                            <div v-if="deleteConfirmId !== null" class="modal-backdrop"
                                @click.self="deleteConfirmId = null">
                                <div class="confirm-modal">
                                    <div class="confirm-icon"><v-icon icon="mdi-delete-alert-outline" size="32" /></div>
                                    <h3 class="confirm-title">{{ $t('dashboard.deleteAdvertTitle') }}</h3>
                                    <p class="confirm-sub">{{ $t('dashboard.deleteAdvertConfirm') }}</p>
                                    <div class="confirm-actions">
                                        <button class="btn-cancel-modal" @click="deleteConfirmId = null">{{ $t('dashboard.cancel') }}</button>
                                        <button class="btn-delete-modal" :disabled="deleteLoading !== null"
                                            @click="doDelete">
                                            <v-icon v-if="deleteLoading !== null" icon="mdi-loading" size="15"
                                                class="spin" />
                                            <v-icon v-else icon="mdi-delete-outline" size="15" />
                                            {{ $t('dashboard.deleteAdvertBtn') }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </transition>
                    </Teleport>
                </div>

                <!-- Tab: Opinie -->
                <div v-else-if="activeTab === 'reviews'" class="tab-body">
                    <div v-if="reviewsLoading" class="loading-row"><v-icon icon="mdi-loading" size="28" class="spin" />
                    </div>
                    <template v-else>
                        <div v-if="receivedReviews.length" class="reviews-list">
                            <div v-for="r in receivedReviews" :key="r.id" class="review-card">
                                <div class="review-header">
                                    <div class="reviewer-avatar">{{ r.buyerName?.[0] ?? '?' }}</div>
                                    <div class="reviewer-info">
                                        <div class="reviewer-name">{{ r.buyerName }}</div>
                                        <div class="review-date">{{ formatDate(r.createdAt) }}</div>
                                    </div>
                                    <div class="review-stars">
                                        <v-icon v-for="n in 5" :key="n"
                                            :icon="n <= r.rating ? 'mdi-star' : 'mdi-star-outline'" size="16"
                                            class="star" />
                                    </div>
                                </div>
                                <p class="review-content">{{ r.content }}</p>
                                <div v-if="r.advertTitle" class="review-advert">
                                    <v-icon icon="mdi-car-outline" size="13" />
                                    {{ r.advertTitle }}
                                </div>
                            </div>
                        </div>
                        <div v-else class="empty-state">
                            <v-icon icon="mdi-star-outline" size="36" class="empty-icon" />
                            <p>{{ $t('dashboard.emptyReviews') }}</p>
                        </div>
                    </template>
                </div>

                <!-- Tab: Obserwujący -->
                <div v-else-if="activeTab === 'followers'" class="tab-body">
                    <div v-if="followersLoading" class="loading-row"><v-icon icon="mdi-loading" size="28"
                            class="spin" /></div>
                    <div v-else-if="followers.length" class="followers-grid">
                        <div v-for="f in followers" :key="f.id" class="follower-card">
                            <div class="follower-avatar">{{ f.followerName?.[0] ?? '?' }}</div>
                            <div class="follower-name">{{ f.followerName }}</div>
                            <div class="follower-since">{{ $t('dashboard.since') }} {{ formatDate(f.createdAt) }}</div>
                        </div>
                    </div>
                    <div v-else class="empty-state">
                        <v-icon icon="mdi-account-multiple-outline" size="36" class="empty-icon" />
                        <p>{{ $t('dashboard.emptyFollowers') }}</p>
                    </div>
                </div>

                <!-- Tab: Obserwowane -->
                <div v-else-if="activeTab === 'following'" class="tab-body">
                    <div v-if="followingLoading" class="loading-row"><v-icon icon="mdi-loading" size="28"
                            class="spin" /></div>
                    <div v-else-if="followedAdverts.length" class="advert-follow-list">
                        <div v-for="fa in followedAdverts" :key="fa.id" class="follow-advert-row">
                            <img :src="getImageUrl(fa.mainImageUrl)" class="follow-advert-img" :alt="fa.advertTitle" loading="lazy" />
                            <div class="follow-advert-info">
                                <div class="follow-advert-title">{{ fa.advertTitle }}</div>
                                <div class="follow-advert-meta">
                                    <span v-if="fa.brand">{{ fa.brand }} {{ fa.model }}</span>
                                    <span v-if="fa.city"><v-icon icon="mdi-map-marker-outline" size="13" />{{ fa.city
                                        }}</span>
                                </div>
                                <div class="follow-advert-price">
                                    {{ Number(fa.advertPrice).toLocaleString('pl') }} zł
                                    <span v-if="fa.priceChanged" class="price-changed">
                                        <v-icon icon="mdi-trending-down" size="14" />
                                        {{ $t('dashboard.priceChanged') }}
                                    </span>
                                </div>
                            </div>
                            <NuxtLink :to="`/advert/${fa.advertId}`" class="follow-advert-link">
                                <v-icon icon="mdi-arrow-right" size="18" />
                            </NuxtLink>
                        </div>
                    </div>
                    <div v-else class="empty-state">
                        <v-icon icon="mdi-bell-outline" size="36" class="empty-icon" />
                        <p>{{ $t('dashboard.emptyFollowing') }}</p>
                    </div>
                </div>
            </template>

            <!-- ══ NOTIFICATIONS ═════════════════════════════════════════════ -->
            <template v-else-if="section === 'notifications'">
                <div class="section-topbar">
                    <h2 class="section-title">{{ $t('dashboard.notificationsTitle') }}</h2>
                    <button v-if="notifUnread > 0" class="btn-outline-sm" @click="markAllRead">
                        <v-icon icon="mdi-check-all" size="15" />{{ $t('dashboard.markAllRead') }}
                    </button>
                </div>
                <div v-if="notifsLoading" class="loading-row"><v-icon icon="mdi-loading" size="28" class="spin" /></div>
                <div v-else-if="allNotifications.length" class="notif-list">
                    <div v-for="n in allNotifications" :key="n.id" class="notif-item" :class="{ unread: !n.isRead }"
                        @click="onNotifClick(n)">
                        <div class="notif-icon-wrap" :class="notifIconClass(n.type)">
                            <v-icon :icon="notifIcon(n.type)" size="18" />
                        </div>
                        <div class="notif-body">
                            <div class="notif-title">{{ n.title }}</div>
                            <div class="notif-content">{{ n.content }}</div>
                            <div class="notif-time">{{ formatDate(n.createdAt) }}</div>
                        </div>
                        <div v-if="!n.isRead" class="notif-dot" />
                        <button class="notif-del" :aria-label="$t('dashboard.deleteNotifAria')" @click.stop="deleteNotif(n.id)">
                            <v-icon icon="mdi-close" size="14" />
                        </button>
                    </div>
                </div>
                <div v-else class="empty-state" style="margin-top:60px">
                    <v-icon icon="mdi-bell-off-outline" size="40" class="empty-icon" />
                    <p>{{ $t('dashboard.emptyNotifications') }}</p>
                </div>
            </template>

            <!-- ══ SAVED SEARCHES ════════════════════════════════════════════ -->
            <template v-else-if="section === 'searches'">
                <div class="section-topbar">
                    <h2 class="section-title">{{ $t('dashboard.savedSearchesTitle') }}</h2>
                    <button class="btn-red-sm" @click="showNewSearchForm = !showNewSearchForm">
                        <v-icon icon="mdi-plus" size="14" />{{ $t('dashboard.newSearch') }}
                    </button>
                </div>

                <!-- Create form -->
                <transition name="slide-down">
                    <div v-if="showNewSearchForm" class="new-search-form">
                        <div class="nsf-row">
                            <div class="nsf-field nsf-full">
                                <label class="nsf-label">{{ $t('dashboard.searchName') }}</label>
                                <input v-model="newSearch.name" class="nsf-input" :placeholder="$t('dashboard.searchNamePlaceholder')" />
                            </div>
                            <div class="nsf-field nsf-full">
                                <label class="nsf-label">{{ $t('dashboard.searchPhrase') }}</label>
                                <input v-model="newSearch.textSearch" class="nsf-input" :placeholder="$t('dashboard.searchPhrasePlaceholder')" />
                            </div>
                            <div class="nsf-field">
                                <label class="nsf-label">{{ $t('dashboard.priceFrom') }}</label>
                                <input v-model="newSearch.priceFrom" type="number" class="nsf-input" placeholder="0" min="0" />
                            </div>
                            <div class="nsf-field">
                                <label class="nsf-label">{{ $t('dashboard.priceTo') }}</label>
                                <input v-model="newSearch.priceTo" type="number" class="nsf-input" placeholder="∞" min="0" />
                            </div>
                            <div class="nsf-field">
                                <label class="nsf-label">{{ $t('dashboard.yearFrom') }}</label>
                                <input v-model="newSearch.yearFrom" type="number" class="nsf-input" placeholder="2000" />
                            </div>
                            <div class="nsf-field">
                                <label class="nsf-label">{{ $t('dashboard.yearTo') }}</label>
                                <input v-model="newSearch.yearTo" type="number" class="nsf-input" placeholder="2025" />
                            </div>
                        </div>
                        <label class="nsf-toggle">
                            <input v-model="newSearch.notifyOnNew" type="checkbox" class="nsf-checkbox" />
                            <span>{{ $t('dashboard.notifyNewResults') }}</span>
                        </label>
                        <div v-if="searchSaveError" class="nsf-error">{{ searchSaveError }}</div>
                        <div class="nsf-actions">
                            <button class="btn-ghost-sm" @click="showNewSearchForm = false">{{ $t('dashboard.cancel') }}</button>
                            <button class="btn-red-sm" :disabled="!newSearch.name.trim() || searchSaving" @click="createSearch">
                                <v-icon v-if="searchSaving" icon="mdi-loading" size="13" class="spin" />
                                {{ $t('dashboard.saveSearch') }}
                            </button>
                        </div>
                    </div>
                </transition>

                <div v-if="searchesLoading" class="loading-row"><v-icon icon="mdi-loading" size="28" class="spin" /></div>
                <div v-else-if="savedSearches.length" class="searches-list">
                    <div v-for="s in savedSearches" :key="s.id" class="search-card">
                        <div class="search-card-left">
                            <div class="search-name">{{ s.name }}</div>
                            <div class="search-criteria">{{ criteriaLabel(s.criteria) }}</div>
                            <div class="search-created">{{ $t('dashboard.savedAt') }} {{ formatDate(s.createdAt) }}</div>
                        </div>
                        <div class="search-card-right">
                            <span v-if="s.newResultsCount > 0" class="new-results-badge">{{ s.newResultsCount }} {{ $t('dashboard.newWord') }}</span>
                            <NuxtLink :to="searchUrl(s.criteria)" class="btn-search-run">
                                <v-icon icon="mdi-magnify" size="14" />{{ $t('dashboard.search') }}
                            </NuxtLink>
                            <button class="btn-icon-danger" :aria-label="$t('dashboard.deleteSearchAria')" @click="deleteSearch(s.id)"><v-icon icon="mdi-delete-outline" size="16" /></button>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state" style="margin-top:60px">
                    <v-icon icon="mdi-magnify" size="40" class="empty-icon" />
                    <p>{{ $t('dashboard.emptySearches') }}</p>
                    <NuxtLink to="/adverts" class="btn-red-sm">{{ $t('dashboard.goToSearch') }}</NuxtLink>
                </div>
            </template>

            <!-- ══ REVIEWS SECTION ═══════════════════════════════════════════ -->
            <template v-else-if="section === 'reviews'">
                <div class="section-topbar">
                    <h2 class="section-title">{{ $t('dashboard.reviewsTitle') }}</h2>
                </div>
                <div v-if="stats?.averageRating" class="rating-summary">
                    <div class="rating-big">{{ stats.averageRating.toFixed(1) }}</div>
                    <div class="rating-stars">
                        <v-icon v-for="n in 5" :key="n"
                            :icon="n <= Math.round(stats.averageRating) ? 'mdi-star' : 'mdi-star-outline'" size="22"
                            class="star" />
                    </div>
                    <div class="rating-count">{{ stats.reviewCount ?? 0 }} {{ $t('dashboard.reviewsWord') }}</div>
                </div>
                <div v-if="reviewsLoading" class="loading-row"><v-icon icon="mdi-loading" size="28" class="spin" />
                </div>
                <div v-else-if="receivedReviews.length" class="reviews-list" style="padding:0 24px 40px">
                    <div v-for="r in receivedReviews" :key="r.id" class="review-card">
                        <div class="review-header">
                            <div class="reviewer-avatar">{{ r.buyerName?.[0] ?? '?' }}</div>
                            <div class="reviewer-info">
                                <div class="reviewer-name">{{ r.buyerName }}</div>
                                <div class="review-date">{{ formatDate(r.createdAt) }}</div>
                            </div>
                            <div class="review-stars">
                                <v-icon v-for="n in 5" :key="n" :icon="n <= r.rating ? 'mdi-star' : 'mdi-star-outline'"
                                    size="16" class="star" />
                            </div>
                        </div>
                        <p class="review-content">{{ r.content }}</p>
                        <div v-if="r.advertTitle" class="review-advert">
                            <v-icon icon="mdi-car-outline" size="13" />{{ r.advertTitle }}
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state" style="margin-top:60px">
                    <v-icon icon="mdi-star-off-outline" size="40" class="empty-icon" />
                    <p>{{ $t('dashboard.emptyReviews') }}</p>
                </div>
            </template>

            <!-- ══ PROFILE ═══════════════════════════════════════════════════ -->
            <template v-else-if="section === 'profile'">
                <div class="section-topbar">
                    <h2 class="section-title">{{ $t('dashboard.personalDataTitle') }}</h2>
                </div>
                <form class="profile-form" @submit.prevent="saveProfile">
                    <div class="form-row">
                        <div class="form-group">
                            <label>{{ $t('dashboard.firstName') }}</label>
                            <input v-model="profileForm.name" class="form-input" autocomplete="given-name" required />
                        </div>
                        <div class="form-group">
                            <label>{{ $t('dashboard.lastName') }}</label>
                            <input v-model="profileForm.surname" class="form-input" autocomplete="family-name" required />
                        </div>
                    </div>
                    <div class="form-group">
                        <label>{{ $t('dashboard.phoneNumber') }}</label>
                        <input v-model="profileForm.phoneNumber" class="form-input" type="tel" inputmode="tel" autocomplete="tel" />
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>{{ $t('dashboard.city') }}</label>
                            <input v-model="profileForm.city" class="form-input" autocomplete="address-level2" :placeholder="$t('dashboard.cityPlaceholder')" />
                        </div>
                        <div class="form-group">
                            <label>{{ $t('dashboard.region') }}</label>
                            <input v-model="profileForm.region" class="form-input" autocomplete="address-level1" :placeholder="$t('dashboard.regionPlaceholder')" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label>{{ $t('dashboard.about') }}</label>
                        <textarea v-model="profileForm.about" class="form-textarea" rows="4" maxlength="500"
                            :placeholder="$t('dashboard.aboutPlaceholder')" />
                        <div class="char-count">{{ (profileForm.about ?? '').length }} / 500</div>
                    </div>
                    <template v-if="profile?.accountType === 'Business'">
                        <div class="form-section-title">{{ $t('dashboard.companyData') }}</div>
                        <div class="form-group">
                            <label>{{ $t('dashboard.companyName') }}</label>
                            <input v-model="profileForm.companyName" class="form-input" />
                        </div>
                        <div class="form-group">
                            <label>{{ $t('dashboard.nip') }}</label>
                            <input v-model="profileForm.nip" class="form-input" :placeholder="$t('dashboard.nipPlaceholder')" />
                        </div>
                        <div class="form-section-title">{{ $t('dashboard.invoiceData') }}</div>
                        <div class="form-group">
                            <label>{{ $t('dashboard.street') }}</label>
                            <input v-model="profileForm.street" class="form-input" :placeholder="$t('dashboard.streetPlaceholder')" />
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>{{ $t('dashboard.postalCode') }}</label>
                                <input v-model="profileForm.postalCode" class="form-input" placeholder="00-000" />
                            </div>
                            <div class="form-group">
                                <label>{{ $t('dashboard.country') }}</label>
                                <input v-model="profileForm.country" class="form-input" :placeholder="$t('dashboard.countryPlaceholder')" />
                            </div>
                        </div>
                    </template>
                    <div v-if="profileSuccess" class="alert-success">
                        <v-icon icon="mdi-check-circle-outline" size="16" />{{ $t('dashboard.dataSaved') }}
                    </div>
                    <div v-if="profileError" class="alert-error">
                        <v-icon icon="mdi-alert-circle-outline" size="16" />{{ profileError }}
                    </div>
                    <button type="submit" class="btn-red" :disabled="profileSaving">
                        <v-icon v-if="profileSaving" icon="mdi-loading" size="16" class="spin" />
                        {{ $t('dashboard.saveChanges') }}
                    </button>
                </form>

                <div class="form-section-title" style="padding:0 28px;margin-top:32px">{{ $t('dashboard.changePassword') }}</div>
                <form class="profile-form" @submit.prevent="savePassword">
                    <div class="form-group">
                        <label>{{ $t('dashboard.currentPassword') }}</label>
                        <input v-model="passwordForm.currentPassword" type="password" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('dashboard.newPassword') }}</label>
                        <input v-model="passwordForm.newPassword" type="password" class="form-input" required
                            minlength="6" />
                    </div>
                    <div v-if="passwordSuccess" class="alert-success">
                        <v-icon icon="mdi-check-circle-outline" size="16" />{{ $t('dashboard.passwordChanged') }}
                    </div>
                    <div v-if="passwordError" class="alert-error">
                        <v-icon icon="mdi-alert-circle-outline" size="16" />{{ passwordError }}
                    </div>
                    <button type="submit" class="btn-outline" :disabled="passwordSaving">
                        <v-icon v-if="passwordSaving" icon="mdi-loading" size="16" class="spin" />
                        {{ $t('dashboard.changePasswordBtn') }}
                    </button>
                </form>
            </template>

            <!-- ══ SETTINGS ══════════════════════════════════════════════════ -->
            <template v-else-if="section === 'settings'">
                <div class="section-topbar">
                    <h2 class="section-title">{{ $t('dashboard.accountSettingsTitle') }}</h2>
                </div>
                <div class="settings-form">
                    <div class="settings-group">
                        <div class="settings-group-title">{{ $t('dashboard.emailNotifications') }}</div>
                        <div class="setting-row">
                            <div class="setting-label">
                                <div class="setting-name">{{ $t('dashboard.emailNotifications') }}</div>
                                <div class="setting-desc">{{ $t('dashboard.emailNotifDesc') }}</div>
                            </div>
                            <button class="toggle-btn" :class="{ on: settingsForm.emailNotifications }"
                                @click="settingsForm.emailNotifications = !settingsForm.emailNotifications">
                                <div class="toggle-knob" />
                            </button>
                        </div>
                        <div class="setting-row">
                            <div class="setting-label">
                                <div class="setting-name">{{ $t('dashboard.priceAlerts') }}</div>
                                <div class="setting-desc">{{ $t('dashboard.priceAlertsDesc') }}</div>
                            </div>
                            <button class="toggle-btn" :class="{ on: settingsForm.priceChangeAlerts }"
                                @click="settingsForm.priceChangeAlerts = !settingsForm.priceChangeAlerts">
                                <div class="toggle-knob" />
                            </button>
                        </div>
                        <div class="setting-row">
                            <div class="setting-label">
                                <div class="setting-name">{{ $t('dashboard.messageNotif') }}</div>
                                <div class="setting-desc">{{ $t('dashboard.messageNotifDesc') }}</div>
                            </div>
                            <button class="toggle-btn" :class="{ on: settingsForm.newMessageAlerts }"
                                @click="settingsForm.newMessageAlerts = !settingsForm.newMessageAlerts">
                                <div class="toggle-knob" />
                            </button>
                        </div>
                        <div class="setting-row">
                            <div class="setting-label">
                                <div class="setting-name">{{ $t('dashboard.newsletter') }}</div>
                                <div class="setting-desc">{{ $t('dashboard.newsletterDesc') }}</div>
                            </div>
                            <button class="toggle-btn" :class="{ on: settingsForm.newsletterSubscribed }"
                                @click="settingsForm.newsletterSubscribed = !settingsForm.newsletterSubscribed">
                                <div class="toggle-knob" />
                            </button>
                        </div>
                    </div>
                    <div v-if="settingsSuccess" class="alert-success">
                        <v-icon icon="mdi-check-circle-outline" size="16" />{{ $t('dashboard.settingsSaved') }}
                    </div>
                    <div v-if="settingsError" class="alert-error">
                        <v-icon icon="mdi-alert-circle-outline" size="16" />{{ settingsError }}
                    </div>
                    <button class="btn-red" :disabled="settingsSaving" @click="saveSettings">
                        <v-icon v-if="settingsSaving" icon="mdi-loading" size="16" class="spin" />
                        {{ $t('dashboard.saveSettings') }}
                    </button>

                    <div v-if="notifPrefs.length" class="settings-group">
                        <div class="settings-group-title">{{ $t('dashboard.emailNotifCategories') }}</div>
                        <div v-for="pref in notifPrefs" :key="pref.category" class="setting-row">
                            <div class="setting-label">
                                <div class="setting-name">{{ pref.label }}</div>
                            </div>
                            <button class="toggle-btn" :class="{ on: pref.emailEnabled }"
                                :disabled="prefsSaving === pref.category"
                                @click="toggleNotifPref(pref)">
                                <div class="toggle-knob" />
                            </button>
                        </div>
                    </div>

                    <div class="danger-zone">
                        <div class="danger-title">{{ $t('dashboard.dangerZone') }}</div>
                        <div class="danger-desc">{{ $t('dashboard.deleteAccountDesc') }}</div>
                        <button class="btn-danger" @click="confirmDeleteAccount = true">{{ $t('dashboard.deleteAccount') }}</button>
                    </div>
                </div>
            </template>
        </main>

        <!-- Right sidebar -->
        <aside class="right-sidebar">
            <div class="rs-card">
                <div class="rs-title">{{ $t('dashboard.about') }}</div>
                <p class="rs-about">{{ profile?.about || $t('dashboard.noDescription') }}</p>
                <button class="rs-edit-link" @click="goProfile">
                    <v-icon icon="mdi-pencil-outline" size="13" />{{ $t('dashboard.editDescription') }}
                </button>
            </div>
            <div class="rs-card">
                <div class="rs-title">{{ $t('dashboard.location') }}</div>
                <div class="rs-location" v-if="profile?.city">
                    <v-icon icon="mdi-map-marker-outline" size="15" class="loc-icon" />
                    {{ profile.city }}<template v-if="profile.region">, {{ profile.region }}</template>
                </div>
                <div class="rs-location" v-else><v-icon icon="mdi-map-marker-outline" size="15" class="loc-icon" />{{ $t('dashboard.notProvided') }}
                </div>
            </div>
            <div class="rs-card">
                <div class="rs-title">{{ $t('dashboard.verifications') }}</div>
                <div class="rs-verif-list">
                    <div class="verif-row">
                        <div class="verif-left"><v-icon icon="mdi-phone-outline" size="15" class="verif-icon" />{{ $t('dashboard.phone') }}
                        </div>
                        <span class="verif-ok">{{ $t('dashboard.verified') }}</span>
                    </div>
                    <div class="verif-row">
                        <div class="verif-left"><v-icon icon="mdi-email-outline" size="15" class="verif-icon" />{{ $t('dashboard.email') }}
                        </div>
                        <span class="verif-ok">{{ $t('dashboard.verified') }}</span>
                    </div>
                    <div class="verif-row">
                        <div class="verif-left"><v-icon icon="mdi-shield-check-outline" size="15" class="verif-icon" />
                            {{ profile?.accountType === 'Business' ? $t('dashboard.dealer') : $t('dashboard.account') }}
                        </div>
                        <span class="verif-ok">{{ $t('dashboard.verified') }}</span>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Delete account confirm -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="confirmDeleteAccount" class="modal-backdrop" @click.self="confirmDeleteAccount = false">
                    <div class="confirm-modal">
                        <div class="confirm-icon"><v-icon icon="mdi-account-remove" size="32" /></div>
                        <h3 class="confirm-title">{{ $t('dashboard.deleteAccount') }}</h3>
                        <p class="confirm-sub">{{ $t('dashboard.deleteAccountConfirm') }}</p>
                        <div class="confirm-actions">
                            <button class="btn-cancel-modal" @click="confirmDeleteAccount = false">{{ $t('dashboard.cancel') }}</button>
                            <button class="btn-delete-modal" @click="doDeleteAccount">{{ $t('dashboard.deleteAccount') }}</button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import type { CarAdvert, UserProfile, UserStats, Review, Notification, NotificationPreference, SavedSearch, FollowedAdvert, AccountSettings, UpdateProfileDto, SearchAdvertDto } from '~/types'

definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
useHead({ title: () => t('dashboard.metaTitle'), meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { fetchProfile, fetchStats, updateProfile, updatePassword, fetchSettings, updateSettings, deleteAccount } = useUser()
const { getMySubscription } = useSubscription()
const subscription = ref<Awaited<ReturnType<typeof getMySubscription>> | null>(null)
const { getMyReceivedReviews } = useReviews()
const { notifications: allNotifications, unreadCount: notifUnread, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, getPreferences, updatePreference } = useNotifications()
const { getFollowedAdverts, getFollowers } = useFollow()
const { getSavedSearches, deleteSearch: deleteSavedSearch, saveSearch } = useSavedSearches()
const { logout: authLogout } = useAuth()
const { getImageUrl } = useImageUrl()
const { success: toastSuccess, error: toastError } = useToast()
const { observe: observeCount } = useCountUp()
const { getIds: getRecentIds } = useRecentlyViewed()

// Count-up directive for stat numbers
const vCountUp = {
    mounted(el: HTMLElement, { value }: { value: number }) {
        el.textContent = '0'
        if (value > 0) observeCount(el, value)
    },
    updated(el: HTMLElement, { value, oldValue }: { value: number; oldValue: number }) {
        if (value !== oldValue) observeCount(el, value)
    },
}

// Section routing
type Section = 'overview' | 'notifications' | 'searches' | 'reviews' | 'profile' | 'settings'
const section = ref<Section>('overview')

// Data
const profile = ref<UserProfile | null>(null)
const stats = ref<UserStats | null>(null)
const myAdverts = ref<CarAdvert[]>([])
const advertTotal = ref(0)
const advertPage = ref(1)
const loading = ref(true)
const loadingMore = ref(false)
const recentAdverts = ref<CarAdvert[]>([])

// Tabs within overview
const activeTab = ref('adverts')
const overviewTabs = computed(() => [
    { key: 'adverts', label: t('dashboard.tabAdverts') },
    { key: 'reviews', label: t('dashboard.tabReviews') },
    { key: 'followers', label: t('dashboard.tabFollowers') },
    { key: 'following', label: t('dashboard.tabFollowing') },
])

// Adverts
const advertSearch = ref('')
const deleteConfirmId = ref<number | null>(null)
const deleteLoading = ref<number | null>(null)

const filteredAdverts = computed(() =>
    advertSearch.value
        ? myAdverts.value.filter(a => `${a.brand?.name} ${a.model?.name} ${a.title}`.toLowerCase().includes(advertSearch.value.toLowerCase()))
        : myAdverts.value
)

// Reviews
const receivedReviews = ref<Review[]>([])
const reviewsLoading = ref(false)

// Followers / following
const followers = ref<{ id: number; followerId: number; followerName: string; createdAt: string }[]>([])
const followersLoading = ref(false)
const followedAdverts = ref<FollowedAdvert[]>([])
const followingLoading = ref(false)

// Notifications
const notifsLoading = ref(false)

// Saved searches
const savedSearches = ref<SavedSearch[]>([])
const searchesLoading = ref(false)
const savedSearchNewCount = computed(() => savedSearches.value.reduce((s, ss) => s + (ss.newResultsCount ?? 0), 0))

// New saved search form
const newSearch = reactive({ name: '', textSearch: '', priceFrom: '', priceTo: '', yearFrom: '', yearTo: '', notifyOnNew: true })
const searchSaving = ref(false)
const searchSaveError = ref('')
const showNewSearchForm = ref(false)

// Profile form
const profileForm = reactive<UpdateProfileDto>({ name: '', surname: '', phoneNumber: '', city: '', region: '', about: '', companyName: '', nip: '', street: '', postalCode: '', country: '' })
const profileSaving = ref(false)
const profileSuccess = ref(false)
const profileError = ref<string | null>(null)

// Password form
const passwordForm = reactive({ currentPassword: '', newPassword: '' })
const passwordSaving = ref(false)
const passwordSuccess = ref(false)
const passwordError = ref<string | null>(null)

// Settings form
const settingsForm = reactive<AccountSettings>({ emailNotifications: true, priceChangeAlerts: true, newMessageAlerts: true, newsletterSubscribed: false })
const settingsSaving = ref(false)
const settingsSuccess = ref(false)
const settingsError = ref<string | null>(null)

// Notification preferences
const notifPrefs = ref<NotificationPreference[]>([])
const prefsSaving = ref<string | null>(null)

const confirmDeleteAccount = ref(false)

// Computed
const initials = computed(() => {
    if (!profile.value) return '?'
    return (profile.value.name?.[0] ?? '') + (profile.value.surname?.[0] ?? '')
})

const memberSince = computed(() => {
    if (!profile.value?.createdAt) return '—'
    const d = new Date(profile.value.createdAt)
    if (d.getFullYear() < 2020) return '—'
    return d.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
})

function formatViews(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1000) return Math.round(n / 1000) + 'K'
    return n.toString()
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function advertBadgeLabel(a: CarAdvert) {
    if (!a.isActive) return t('dashboard.badgeExpired')
    if (a.isHidden) return t('dashboard.badgeHidden')
    if (a.badge) return a.badge
    return t('dashboard.badgeActive')
}

function advertBadgeClass(a: CarAdvert) {
    if (!a.isActive) return 'badge-expired'
    if (a.isHidden) return 'badge-hidden'
    if (a.badge === 'TOP' || a.badge === 'FEATURED') return 'badge-featured'
    return 'badge-active'
}

// Section navigation with lazy loading
async function goNotifications() {
    section.value = 'notifications'
    if (allNotifications.value.length === 0) {
        notifsLoading.value = true
        try { await fetchNotifications() } finally { notifsLoading.value = false }
    }
}

async function goReviews() {
    section.value = 'reviews'
    if (receivedReviews.value.length === 0) {
        reviewsLoading.value = true
        try {
            const r = await getMyReceivedReviews()
            receivedReviews.value = r.items
        } catch { toastError(t('dashboard.errLoadReviews')) } finally { reviewsLoading.value = false }
    }
}

async function goProfile() {
    section.value = 'profile'
    if (profile.value) {
        Object.assign(profileForm, {
            name: profile.value.name ?? '',
            surname: profile.value.surname ?? '',
            phoneNumber: profile.value.phoneNumber ?? '',
            city: profile.value.city ?? '',
            region: profile.value.region ?? '',
            about: profile.value.about ?? '',
            companyName: profile.value.companyName ?? '',
            nip: profile.value.nip ?? '',
            street: profile.value.street ?? '',
            postalCode: profile.value.postalCode ?? '',
            country: profile.value.country ?? '',
        })
    }
}

async function goSettings() {
    section.value = 'settings'
    try {
        const [s, prefs] = await Promise.all([fetchSettings(), getPreferences()])
        if (s) Object.assign(settingsForm, s)
        notifPrefs.value = prefs
    } catch {}
}

async function toggleNotifPref(pref: NotificationPreference) {
    const prev = pref.emailEnabled
    pref.emailEnabled = !prev
    prefsSaving.value = pref.category
    try {
        await updatePreference({ category: pref.category, emailEnabled: pref.emailEnabled })
    } catch {
        pref.emailEnabled = prev
    } finally {
        prefsSaving.value = null
    }
}

// Actions
function confirmDelete(id: number) { deleteConfirmId.value = id }

async function doDelete() {
    if (deleteConfirmId.value === null) return
    const id = deleteConfirmId.value
    deleteLoading.value = id
    try {
        await $fetch(`/api/proxy/api/listings/${id}`, { method: 'DELETE' })
        myAdverts.value = myAdverts.value.filter(a => a.id !== id)
        deleteConfirmId.value = null
        advertTotal.value = Math.max(0, advertTotal.value - 1)
        if (stats.value) stats.value.totalAdverts = Math.max(0, stats.value.totalAdverts - 1)
        toastSuccess(t('dashboard.advertDeleted'))
    } catch (e: any) {
        toastError(e?.data?.message || e?.message || t('dashboard.errDeleteAdvert'))
    } finally { deleteLoading.value = null }
}

async function loadMoreAdverts() {
    loadingMore.value = true
    advertPage.value++
    try {
        const r = await $fetch<{ items: CarAdvert[]; totalCount: number }>(`/api/proxy/api/listings/user?page=${advertPage.value}&pageSize=8`)
        myAdverts.value.push(...r.items)
    } catch { toastError(t('dashboard.errLoadMore')) } finally { loadingMore.value = false }
}

async function markAllRead() {
    try { await markAllAsRead() } catch { /* non-critical — notifications still visible */ }
}

async function onNotifClick(n: Notification) {
    if (!n.isRead) await markAsRead(n.id)
    if (n.advertId) navigateTo(`/advert/${n.advertId}`)
}

async function deleteNotif(id: number) {
    try { await deleteNotification(id) } catch { toastError(t('dashboard.errDeleteNotif')) }
}

async function deleteSearch(id: number) {
    try {
        await deleteSavedSearch(id)
        savedSearches.value = savedSearches.value.filter(s => s.id !== id)
    } catch { toastError(t('dashboard.errDeleteSearch')) }
}

async function createSearch() {
    if (!newSearch.name.trim()) return
    searchSaving.value = true
    searchSaveError.value = ''
    try {
        const criteria: SearchAdvertDto = {}
        if (newSearch.textSearch.trim()) criteria.textSearch = newSearch.textSearch.trim()
        if (newSearch.priceFrom) criteria.priceFrom = Number(newSearch.priceFrom)
        if (newSearch.priceTo) criteria.priceTo = Number(newSearch.priceTo)
        if (newSearch.yearFrom) criteria.yearFrom = Number(newSearch.yearFrom)
        if (newSearch.yearTo) criteria.yearTo = Number(newSearch.yearTo)
        const s = await saveSearch({ name: newSearch.name.trim(), criteria, notifyOnNew: newSearch.notifyOnNew })
        savedSearches.value.unshift(s)
        Object.assign(newSearch, { name: '', textSearch: '', priceFrom: '', priceTo: '', yearFrom: '', yearTo: '', notifyOnNew: true })
        showNewSearchForm.value = false
    } catch (e: any) {
        searchSaveError.value = e?.data?.message ?? t('dashboard.errSaveSearch')
    } finally {
        searchSaving.value = false
    }
}

function criteriaLabel(criteria: SearchAdvertDto): string {
    const parts: string[] = []
    if (criteria.textSearch) parts.push(criteria.textSearch)
    if (criteria.priceFrom || criteria.priceTo) {
        parts.push(`${criteria.priceFrom ? criteria.priceFrom.toLocaleString('pl') + ' zł' : ''} – ${criteria.priceTo ? criteria.priceTo.toLocaleString('pl') + ' zł' : ''}`)
    }
    if (criteria.yearFrom || criteria.yearTo) parts.push(`${criteria.yearFrom ?? ''} – ${criteria.yearTo ?? ''}`)
    return parts.join(' · ') || t('dashboard.allAdverts')
}

function searchUrl(criteria: SearchAdvertDto): string {
    const params = new URLSearchParams()
    if (criteria.textSearch) params.set('textSearch', criteria.textSearch)
    if (criteria.priceFrom) params.set('priceFrom', String(criteria.priceFrom))
    if (criteria.priceTo) params.set('priceTo', String(criteria.priceTo))
    if (criteria.yearFrom) params.set('yearFrom', String(criteria.yearFrom))
    if (criteria.yearTo) params.set('yearTo', String(criteria.yearTo))
    return `/adverts?${params.toString()}`
}

function notifIcon(type: string) {
    const map: Record<string, string> = {
        AccountCreated: 'mdi-account-check-outline',
        PasswordChanged: 'mdi-lock-reset',
        PasswordReset: 'mdi-lock-reset',
        AdvertAdded: 'mdi-car-outline',
        AdvertPublished: 'mdi-check-circle-outline',
        AdvertRejected: 'mdi-close-circle-outline',
        AdvertDeleted: 'mdi-delete-outline',
        AdvertMarkedSold: 'mdi-handshake-outline',
        AdvertExpiring7Days: 'mdi-clock-alert-outline',
        AdvertExpiring3Days: 'mdi-clock-alert-outline',
        AdvertExpiring1Day: 'mdi-clock-alert-outline',
        AdvertExpired: 'mdi-clock-remove-outline',
        PromotionPurchased: 'mdi-star-outline',
        PromotionActivated: 'mdi-star-check-outline',
        TopStarted: 'mdi-crown-outline',
        PremiumStarted: 'mdi-diamond-outline',
        FeaturedStarted: 'mdi-star-outline',
        RefreshStarted: 'mdi-refresh',
        PromotionExpiring3Days: 'mdi-clock-alert-outline',
        PromotionExpiring1Day: 'mdi-clock-alert-outline',
        PromotionExpired: 'mdi-clock-remove-outline',
        PaymentConfirmed: 'mdi-check-circle-outline',
        PaymentFailed: 'mdi-alert-circle-outline',
        PaymentRefunded: 'mdi-cash-refund',
        InvoiceGenerated: 'mdi-receipt-text-outline',
        InvoiceSent: 'mdi-email-check-outline',
        NewMessage: 'mdi-message-outline',
    }
    return map[type] ?? 'mdi-bell-outline'
}

function notifIconClass(type: string) {
    if (['PaymentConfirmed', 'AdvertPublished', 'AccountCreated', 'PromotionActivated', 'TopStarted', 'PremiumStarted', 'FeaturedStarted', 'RefreshStarted', 'PromotionPurchased'].includes(type)) return 'notif-green'
    if (['NewMessage'].includes(type)) return 'notif-blue'
    if (['AdvertExpiring7Days', 'AdvertExpiring3Days', 'AdvertExpiring1Day', 'PromotionExpiring3Days', 'PromotionExpiring1Day'].includes(type)) return 'notif-orange'
    return 'notif-red'
}

async function saveProfile() {
    profileSaving.value = true
    profileSuccess.value = false
    profileError.value = null
    try {
        profile.value = await updateProfile({ ...profileForm })
        profileSuccess.value = true
        setTimeout(() => profileSuccess.value = false, 3000)
    } catch (e: any) {
        profileError.value = e?.data?.message ?? t('dashboard.errSaveData')
    } finally { profileSaving.value = false }
}

async function savePassword() {
    passwordSaving.value = true
    passwordSuccess.value = false
    passwordError.value = null
    try {
        await updatePassword({ ...passwordForm })
        passwordSuccess.value = true
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        setTimeout(() => passwordSuccess.value = false, 3000)
    } catch (e: any) {
        passwordError.value = e?.data?.message ?? t('dashboard.errChangePassword')
    } finally { passwordSaving.value = false }
}

async function saveSettings() {
    settingsSaving.value = true
    settingsSuccess.value = false
    settingsError.value = null
    try {
        await updateSettings({ ...settingsForm })
        settingsSuccess.value = true
        setTimeout(() => settingsSuccess.value = false, 3000)
    } catch (e: any) {
        settingsError.value = e?.data?.message ?? t('dashboard.errSaveSettings')
    } finally { settingsSaving.value = false }
}

async function doDeleteAccount() {
    try {
        await deleteAccount()
        await authLogout()
    } catch (e: any) {
        toastError(e?.data?.message || t('dashboard.errDeleteAccount'))
    }
}

// Load overview tab data lazily
watch(activeTab, async (tab) => {
    if (tab === 'reviews' && receivedReviews.value.length === 0) {
        reviewsLoading.value = true
        try {
            const r = await getMyReceivedReviews()
            receivedReviews.value = r.items
        } catch { toastError(t('dashboard.errLoadReviews')) } finally { reviewsLoading.value = false }
    }
    if (tab === 'followers' && followers.value.length === 0) {
        followersLoading.value = true
        try {
            const r = await getFollowers()
            followers.value = r.items
        } catch { toastError(t('dashboard.errLoadFollowers')) } finally { followersLoading.value = false }
    }
    if (tab === 'following' && followedAdverts.value.length === 0) {
        followingLoading.value = true
        try {
            const r = await getFollowedAdverts()
            followedAdverts.value = r.items
        } catch { toastError(t('dashboard.errLoadFollowing')) } finally { followingLoading.value = false }
    }
})

watch(section, async (s) => {
    if (s === 'searches' && savedSearches.value.length === 0) {
        searchesLoading.value = true
        try {
            const r = await getSavedSearches()
            savedSearches.value = r.items
        } catch { toastError(t('dashboard.errLoadSearches')) } finally { searchesLoading.value = false }
    }
})

onMounted(async () => {
    try {
        ;[profile.value, stats.value] = await Promise.all([fetchProfile(), fetchStats()])
        const r = await $fetch<{ items: CarAdvert[]; totalCount: number }>('/api/proxy/api/listings/user?page=1&pageSize=8')
        myAdverts.value = r.items
        advertTotal.value = r.totalCount
        // Lazy load notifications count
        fetchNotifications().catch(() => { })
        // Load B2B subscription for business accounts
        if (profile.value?.accountType === 'Business') {
            getMySubscription().then(s => { subscription.value = s }).catch(() => { })
        }
    } catch { toastError(t('dashboard.errLoadProfile')) } finally { loading.value = false }

    // Recently viewed (from localStorage — fire after loading so it doesn't block)
    const ids = getRecentIds().slice(0, 5)
    if (ids.length) {
        const fetched = await Promise.all(
            ids.map(id => $fetch<CarAdvert>(`/api/proxy/api/listings/${id}`).catch(() => null))
        )
        const ordered = ids.map(id => fetched.find(a => a?.id === id)).filter(Boolean) as CarAdvert[]
        recentAdverts.value = ordered
    }
})
</script>

<style lang="scss" scoped>
.dash-page {
    display: flex;
    min-height: 100vh;
    background: $bg;
    padding-top: $nav-height;

    @include respond-to(md) {
        flex-direction: column;
    }
}

// ── Left sidebar ──────────────────────────────────────────────────────────────
.dash-sidebar {
    width: 220px;
    min-width: 220px;
    background: #070707;
    border-right: 1px solid $border;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: $nav-height;
    height: calc(100vh - #{$nav-height});
    overflow-y: auto;

    @include respond-to(md) {
        display: none;
    }
}

.dash-nav {
    flex: 1;
    padding: 16px 0;
}

// ── Mobile nav strip ───────────────────────────────────────────────────────────
.dash-mobile-nav {
    display: none;
    position: sticky;
    top: $nav-height;
    z-index: 90;
    background: #070707;
    border-bottom: 1px solid $border;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    @include respond-to(md) {
        display: flex;
        flex-direction: row;
        gap: 0;
    }
}

.dmn-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 10px 14px;
    min-width: 64px;
    border: none;
    background: transparent;
    color: $text-dark;
    font-size: 10px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    flex-shrink: 0;
    position: relative;
    transition: color 0.2s;
    .v-icon { color: $text-dark; transition: color 0.2s; }

    &.active, &:hover {
        color: $red;
        .v-icon { color: $red; }
    }

    &--danger { color: #e55; .v-icon { color: #e55; } }
}

.dmn-badge {
    position: absolute;
    top: 6px;
    right: 8px;
    background: $red;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    border-radius: 99px;
    padding: 1px 5px;
    min-width: 16px;
    text-align: center;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 18px;
    color: $text-muted;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    text-decoration: none;
    background: transparent;
    border: none;
    width: 100%;
    text-align: left;
    font-family: 'Inter', sans-serif;
    position: relative;

    &:hover {
        background: rgba(255, 255, 255, 0.04);
        color: $text;
    }

    &.active {
        background: rgba($red, 0.1);
        color: $text;
        border-left: 2px solid $red;
        padding-left: 16px;
    }
}

.nav-danger:hover {
    color: #e55;
}

.nav-badge {
    margin-left: auto;
    background: $red;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 20px;
    min-width: 18px;
    text-align: center;
}

.nav-divider {
    height: 1px;
    background: $border;
    margin: 8px 0;
}

.dash-subscription {
    margin: 12px;
    background: linear-gradient(135deg, rgba(139,13,29,0.08), transparent);
    border: 1px solid rgba($red, 0.2);
    border-radius: $r-md;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.sub-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: $red;
}

.sub-tier { font-size: 13px; font-weight: 700; color: $text; }

.sub-quota { font-size: 11px; color: $text-dim; }

.sub-btn {
    display: block;
    text-align: center;
    background: $red;
    border-radius: $r-sm;
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 7px 12px;
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.dash-promo {
    margin: 12px;
    background: linear-gradient(135deg, #110005, #0a0002);
    border: 1px solid rgba($red, 0.2);
    border-radius: $r-md;
    padding: 16px 14px;
}

.promo-title {
    font-size: 13px;
    font-weight: 800;
    color: $text;
    line-height: 1.4;
    margin-bottom: 6px;
}

.promo-sub {
    font-size: 11px;
    color: $text-dim;
    line-height: 1.5;
    margin-bottom: 12px;
}

.promo-btn {
    display: inline-block;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 11px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 8px 14px;
    cursor: pointer;
    text-decoration: none;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.88;
    }
}

// ── Center main ───────────────────────────────────────────────────────────────
.dash-main {
    flex: 1;
    min-width: 0;
    padding-bottom: 60px;
}

// Profile banner
.profile-banner {
    position: relative;
    background: linear-gradient(135deg, #1c0005 0%, #0a0002 100%);
    border-bottom: 1px solid $border;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 0 28px 16px;
}

.banner-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba($red, 0.15) 0%, transparent 60%);
}

.banner-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-end;
    gap: 18px;
    margin-bottom: 14px;
}

.avatar-wrap {
    position: relative;
    flex-shrink: 0;
}

.avatar {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: linear-gradient(135deg, $red, #3a0008);
    border: 3px solid rgba($red, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 900;
    color: white;
}

.avatar-online {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #4caf50;
    border: 2px solid $bg;
}

.profile-info {
    flex: 1;
    padding-bottom: 4px;
}

.profile-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.profile-name {
    font-size: 24px;
    font-weight: 900;
    color: $text;
    line-height: 1.1;
}

.verified-badge {
    color: $red;
}

.profile-role {
    font-size: 13px;
    color: $text-muted;
    margin-top: 3px;
}

.profile-since {
    font-size: 12px;
    color: $text-dim;
    margin-top: 2px;
}

.banner-tags {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.btag {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: $text-muted;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 4px 10px;
}

.btag-dealer {
    background: rgba(45, 122, 58, 0.15);
    border-color: rgba(45, 122, 58, 0.3);
    color: #4caf50;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.3px;
}

.edit-profile-btn {
    position: absolute;
    top: 16px;
    right: 20px;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 8px 14px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;

    &:hover {
        border-color: rgba(255, 255, 255, 0.3);
        color: $text;
    }
}

// Stats row
.stats-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    border-bottom: 1px solid $border;

    @include respond-to(md) {
        grid-template-columns: repeat(3, 1fr);
    }

    @include respond-to(sm) {
        grid-template-columns: repeat(2, 1fr);
    }
}

.stat-card {
    padding: 18px 16px;
    border-right: 1px solid $border;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;

    &:last-child {
        border-right: none;
    }
}

.stat-icon {
    color: $red;
    margin-bottom: 6px;
}

.stat-num {
    font-size: 26px;
    font-weight: 900;
    color: $text;
    line-height: 1;
}

.stat-label {
    font-size: 11px;
    color: $text-dim;
    line-height: 1.4;
    margin-top: 2px;
}

.stat-sub {
    font-size: 11px;
    color: $text-dark;
    margin-top: 3px;
    font-weight: 500;

    &.green {
        color: #4caf50;
    }
}

.stat-stars {
    display: flex;
    gap: 1px;
    margin-top: 3px;
    color: #f5a623;
}

// Recently viewed strip
.recent-section {
    padding: 0 24px 24px;
}

.recent-hd {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
}

.recent-hd-icon { color: $red; }

.recent-strip {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: thin;
    scrollbar-color: $border transparent;
}

.recent-mini-card {
    @include card($r-sm);
    display: flex;
    gap: 10px;
    padding: 0;
    overflow: hidden;
    min-width: 200px;
    max-width: 220px;
    flex-shrink: 0;
    text-decoration: none;
    color: $text;
    transition: border-color 0.15s, transform 0.2s;

    &:hover {
        border-color: rgba($red, 0.3);
        transform: translateY(-2px);
    }
}

.recent-mini-img {
    width: 72px;
    height: 60px;
    object-fit: cover;
    flex-shrink: 0;
}

.recent-mini-body {
    padding: 8px 10px 8px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    min-width: 0;
}

.recent-mini-name {
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.recent-mini-price {
    font-size: 13px;
    font-weight: 900;
    color: $red;
}

.recent-mini-meta {
    font-size: 10px;
    color: $text-dim;
}

// Tabs
.tabs-bar {
    display: flex;
    border-bottom: 1px solid $border;
    padding: 0 24px;
    overflow-x: auto;
}

.tab-btn {
    flex-shrink: 0;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: $text-dim;
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    padding: 14px 16px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
    margin-bottom: -1px;

    &:hover {
        color: $text-muted;
    }

    &.active {
        color: $text;
        border-bottom-color: $red;
        font-weight: 600;
    }
}

.tab-body {
    padding: 20px 24px;
}

.tab-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
}

.tab-search {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 9px 12px;

    &:focus-within {
        border-color: rgba($red, 0.4);
    }
}

.ts-icon {
    color: $text-dim;
    flex-shrink: 0;
}

.ts-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;

    &::placeholder {
        color: $text-dark;
    }
}

.btn-add-ad {
    display: flex;
    align-items: center;
    gap: 6px;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 10px 18px;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.88;
    }
}

// Adverts grid
.adverts-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 18px;

    @include respond-to(md) {
        grid-template-columns: repeat(2, 1fr);
    }

    @include respond-to(sm) {
        grid-template-columns: 1fr;
    }
}

.advert-card {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-md;
    overflow: hidden;
    transition: border-color 0.25s, transform 0.25s;

    &:hover {
        border-color: rgba($red, 0.3);
        transform: translateY(-3px);
    }
}

.adcard-img-wrap {
    position: relative;

    img {
        width: 100%;
        height: 140px;
        object-fit: cover;
        display: block;
    }
}

.adcard-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 9px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 5px;
    letter-spacing: 0.4px;
}

.badge-active {
    background: #2d7a3a;
    color: white;
}

.badge-featured {
    background: #8B6914;
    color: #f5d060;
    border: 1px solid #a07820;
}

.badge-expired {
    background: rgba(255, 255, 255, 0.1);
    color: $text-dim;
}

.badge-hidden {
    background: rgba(150, 50, 50, 0.3);
    color: #e55;
    border: 1px solid rgba(#e55, 0.3);
}

.adcard-delete-btn {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(#e55, 0.25);
    color: rgba(#e55, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;

    &:hover:not(:disabled) {
        background: rgba(220, 50, 50, 0.28);
        color: #e55;
        border-color: rgba(#e55, 0.55);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
}

.adcard-body {
    display: flex;
    flex-direction: column;
}

.adcard-link-area {
    display: block;
    padding: 12px 12px 8px;
    text-decoration: none;
    flex: 1;

    &:hover .adcard-title { color: $red; }
}

.adcard-actions {
    display: flex;
    border-top: 1px solid $border;
}

.adcard-act {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 7px 4px;
    font-size: 11px;
    font-weight: 600;
    color: $text-dim;
    text-decoration: none;
    border-right: 1px solid $border;
    transition: color 0.15s, background 0.15s;
    font-family: 'Inter', sans-serif;

    &:last-child { border-right: none; }
    &:hover { background: rgba(255,255,255,0.03); color: $text; }

    &--promo { color: rgba($red, 0.7); &:hover { color: $red; background: rgba($red, 0.06); } }
}

.adcard-title {
    font-size: 14px;
    font-weight: 700;
    color: $text;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s;
}

.adcard-meta {
    font-size: 11px;
    color: $text-dim;
    margin-bottom: 6px;
}

.adcard-price {
    font-size: 17px;
    font-weight: 900;
    color: $red;
    margin-bottom: 8px;
}

.adcard-stats {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: $text-dark;

    span {
        display: flex;
        align-items: center;
        gap: 3px;
    }
}

.show-more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-md;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 12px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;

    &:hover:not(:disabled) {
        border-color: $text-dim;
        color: $text;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

// Reviews
.reviews-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.review-card {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.review-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.reviewer-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba($red, 0.15);
    border: 1px solid rgba($red, 0.3);
    color: $red;
    font-weight: 700;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.reviewer-info {
    flex: 1;
}

.reviewer-name {
    font-size: 14px;
    font-weight: 600;
    color: $text;
}

.review-date {
    font-size: 11px;
    color: $text-dim;
    margin-top: 2px;
}

.review-stars {
    display: flex;
    gap: 2px;
    color: #f5a623;
}

.star {
    color: #f5a623;
}

.review-content {
    font-size: 13px;
    color: $text-muted;
    line-height: 1.7;
}

.review-advert {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: $text-dim;
    padding-top: 8px;
    border-top: 1px solid $border;
}

// Followers grid
.followers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
}

.follower-card {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 16px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.follower-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba($red, 0.12);
    border: 1px solid rgba($red, 0.25);
    color: $red;
    font-weight: 700;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
}

.follower-name {
    font-size: 13px;
    font-weight: 600;
    color: $text;
}

.follower-since {
    font-size: 11px;
    color: $text-dim;
}

// Following adverts
.advert-follow-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.follow-advert-row {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 12px;
    transition: border-color 0.2s;

    &:hover {
        border-color: rgba($red, 0.3);
    }
}

.follow-advert-img {
    width: 80px;
    height: 55px;
    object-fit: cover;
    border-radius: $r-sm;
    flex-shrink: 0;
}

.follow-advert-info {
    flex: 1;
    min-width: 0;
}

.follow-advert-title {
    font-size: 14px;
    font-weight: 600;
    color: $text;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.follow-advert-meta {
    display: flex;
    gap: 10px;
    font-size: 11px;
    color: $text-dim;
    margin-bottom: 4px;
    align-items: center;
}

.follow-advert-price {
    font-size: 16px;
    font-weight: 800;
    color: $red;
    display: flex;
    align-items: center;
    gap: 8px;
}

.price-changed {
    font-size: 11px;
    color: #4caf50;
    display: flex;
    align-items: center;
    gap: 3px;
}

.follow-advert-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba($red, 0.1);
    color: $red;
    transition: background 0.2s;

    &:hover {
        background: rgba($red, 0.2);
    }

    flex-shrink: 0;
}

// Section header
.section-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 0;
    margin-bottom: 20px;
}

.section-title {
    font-size: 20px;
    font-weight: 800;
    color: $text;
}

// Notifications
.notif-list {
    display: flex;
    flex-direction: column;
    padding: 0 24px 40px;
    gap: 8px;
}

.notif-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 16px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-md;
    cursor: pointer;
    transition: border-color 0.2s;
    position: relative;

    &:hover {
        border-color: rgba($red, 0.2);
    }

    &.unread {
        background: rgba($red, 0.03);
        border-color: rgba($red, 0.12);
    }
}

.notif-icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &.notif-red {
        background: rgba($red, 0.12);
        color: $red;
    }

    &.notif-blue {
        background: rgba(33, 150, 243, 0.12);
        color: #2196f3;
    }

    &.notif-green {
        background: rgba(76, 175, 80, 0.12);
        color: #4caf50;
    }

    &.notif-orange {
        background: rgba(255, 152, 0, 0.12);
        color: #ff9800;
    }
}

.notif-body {
    flex: 1;
    min-width: 0;
}

.notif-title {
    font-size: 13px;
    font-weight: 600;
    color: $text;
    margin-bottom: 3px;
}

.notif-content {
    font-size: 12px;
    color: $text-dim;
    line-height: 1.5;
}

.notif-time {
    font-size: 11px;
    color: $text-dark;
    margin-top: 5px;
}

.notif-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $red;
    flex-shrink: 0;
    margin-top: 5px;
}

.notif-del {
    background: transparent;
    border: none;
    color: $text-dark;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: color 0.2s;

    &:hover {
        color: #e55;
    }
}

// Saved searches
.new-search-form {
    margin: 0 24px 20px;
    background: #0a0a0a;
    border: 1px solid rgba($red, 0.2);
    border-radius: $r-md;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.nsf-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.nsf-full { grid-column: 1 / -1; }

.nsf-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.nsf-label {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

.nsf-input {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 9px 12px;
    outline: none;
    transition: border-color 0.2s;
    &::placeholder { color: $text-dark; }
    &:focus { border-color: rgba($red, 0.4); }
}

.nsf-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: $text-muted;
    cursor: pointer;
    user-select: none;
}

.nsf-checkbox { accent-color: $red; width: 15px; height: 15px; cursor: pointer; }

.nsf-error { font-size: 12px; color: #e55; }

.nsf-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;
}

.btn-ghost-sm {
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 7px 14px;
    cursor: pointer;
    &:hover { border-color: $text-dim; color: $text; }
}

.slide-down-enter-active { transition: max-height 0.25s ease, opacity 0.2s ease; max-height: 500px; }
.slide-down-leave-active { transition: max-height 0.2s ease, opacity 0.15s ease; }
.slide-down-enter-from, .slide-down-leave-to { max-height: 0; opacity: 0; overflow: hidden; }

.searches-list {
    display: flex;
    flex-direction: column;
    padding: 0 24px 40px;
    gap: 10px;
}

.search-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 14px 18px;
    transition: border-color 0.2s;

    &:hover {
        border-color: rgba($red, 0.2);
    }
}

.search-card-left {
    flex: 1;
    min-width: 0;
}

.search-name {
    font-size: 14px;
    font-weight: 600;
    color: $text;
    margin-bottom: 3px;
}

.search-criteria {
    font-size: 12px;
    color: $text-dim;
}

.search-created {
    font-size: 11px;
    color: $text-dark;
    margin-top: 3px;
}

.search-card-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.new-results-badge {
    background: rgba($red, 0.12);
    border: 1px solid rgba($red, 0.25);
    color: $red;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 20px;
}

.btn-search-run {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 7px 14px;
    cursor: pointer;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;

    &:hover {
        border-color: rgba($red, 0.4);
        color: $red;
    }
}

.btn-icon-danger {
    background: transparent;
    border: none;
    color: $text-dark;
    cursor: pointer;
    padding: 6px;
    border-radius: $r-sm;
    transition: color 0.2s, background 0.2s;

    &:hover {
        color: #e55;
        background: rgba(220, 50, 50, 0.1);
    }
}

// Rating summary
.rating-summary {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 24px 20px;
}

.rating-big {
    font-size: 56px;
    font-weight: 900;
    color: $text;
    line-height: 1;
}

.rating-stars {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.rating-count {
    font-size: 13px;
    color: $text-dim;
}

// Profile form
.profile-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 0 28px 32px;
    max-width: 640px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-size: 12px;
    font-weight: 600;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

.form-input {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 11px 14px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
        border-color: rgba($red, 0.5);
    }

    &::placeholder {
        color: $text-dark;
    }
}

.form-textarea {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 11px 14px;
    outline: none;
    resize: vertical;
    transition: border-color 0.2s;

    &:focus {
        border-color: rgba($red, 0.5);
    }

    &::placeholder {
        color: $text-dark;
    }
}

.char-count {
    font-size: 11px;
    color: $text-dark;
    text-align: right;
}

.form-section-title {
    font-size: 13px;
    font-weight: 700;
    color: $text;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-bottom: 4px;
    border-bottom: 1px solid $border;
    margin-bottom: -4px;
}

// Settings
.settings-form {
    padding: 0 28px 40px;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.settings-group {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.settings-group-title {
    font-size: 13px;
    font-weight: 700;
    color: $text;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
}

.setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 14px 0;
    border-bottom: 1px solid $border;

    &:last-child {
        border-bottom: none;
    }
}

.setting-label {
    flex: 1;
}

.setting-name {
    font-size: 14px;
    font-weight: 500;
    color: $text;
}

.setting-desc {
    font-size: 12px;
    color: $text-dim;
    margin-top: 2px;
}

.toggle-btn {
    width: 48px;
    height: 26px;
    border-radius: 13px;
    border: none;
    cursor: pointer;
    position: relative;
    transition: background 0.25s;
    background: #1e1e1e;
    flex-shrink: 0;

    &.on {
        background: $red;
    }
}

.toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: transform 0.25s;

    .toggle-btn.on & {
        transform: translateX(22px);
    }
}

.danger-zone {
    margin-top: 8px;
    padding: 20px;
    background: rgba(220, 50, 50, 0.05);
    border: 1px solid rgba(#e55, 0.2);
    border-radius: $r-md;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.danger-title {
    font-size: 14px;
    font-weight: 700;
    color: #e55;
}

.danger-desc {
    font-size: 13px;
    color: $text-dim;
    line-height: 1.6;
}

.btn-danger {
    background: transparent;
    border: 1px solid rgba(#e55, 0.4);
    border-radius: $r-sm;
    color: #e55;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 10px 20px;
    cursor: pointer;
    width: fit-content;
    transition: background 0.2s;
    align-self: flex-start;

    &:hover {
        background: rgba(220, 50, 50, 0.12);
    }
}

// Shared buttons
.btn-red {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 14px;
    font-weight: 700;
    padding: 12px 24px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    width: fit-content;
    transition: opacity 0.2s;

    &:hover:not(:disabled) {
        opacity: 0.88;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.btn-outline {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 24px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    width: fit-content;
    transition: border-color 0.2s, color 0.2s;

    &:hover:not(:disabled) {
        border-color: $text-dim;
        color: $text;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.btn-outline-sm {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 8px 14px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;

    &:hover {
        border-color: $text-dim;
        color: $text;
    }
}

.btn-red-sm {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 10px 20px;
    cursor: pointer;
    text-decoration: none;
    transition: opacity 0.2s;
    margin-top: 12px;

    &:hover {
        opacity: 0.88;
    }
}

// Alerts
.alert-success {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #4caf50;
    background: rgba(76, 175, 80, 0.08);
    border: 1px solid rgba(76, 175, 80, 0.2);
    border-radius: $r-sm;
    padding: 10px 14px;
}

.alert-error {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #e55;
    background: rgba(220, 50, 50, 0.08);
    border: 1px solid rgba(220, 50, 50, 0.2);
    border-radius: $r-sm;
    padding: 10px 14px;
}

// Loading
.loading-row {
    display: flex;
    justify-content: center;
    padding: 60px 0;
    color: $text-dim;
}

// Empty state
.empty-state {
    text-align: center;
    padding: 50px 20px;
    color: $text-dim;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.empty-icon {
    color: $border;
}

// Modals
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

.confirm-modal {
    background: #0e0e0e;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 32px 28px;
    width: 100%;
    max-width: 400px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.confirm-icon {
    color: rgba(#e55, 0.7);
}

.confirm-title {
    font-size: 18px;
    font-weight: 800;
    color: $text;
    margin: 0;
}

.confirm-sub {
    font-size: 13px;
    color: $text-dim;
    line-height: 1.6;
    margin: 0;
}

.confirm-actions {
    display: flex;
    gap: 10px;
    margin-top: 8px;
    width: 100%;
}

.btn-cancel-modal {
    flex: 1;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    padding: 10px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;

    &:hover {
        border-color: $text-dim;
        color: $text;
    }
}

.btn-delete-modal {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: rgba(220, 50, 50, 0.15);
    border: 1px solid rgba(#e55, 0.35);
    border-radius: $r-sm;
    color: #e55;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 10px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;

    &:hover:not(:disabled) {
        background: rgba(220, 50, 50, 0.25);
    }

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

// ── Right sidebar ─────────────────────────────────────────────────────────────
.right-sidebar {
    width: 250px;
    min-width: 250px;
    border-left: 1px solid $border;
    background: #070707;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: $nav-height;
    height: calc(100vh - #{$nav-height});
    overflow-y: auto;

    @include respond-to(md) {
        display: none;
    }
}

.rs-card {
    padding: 20px;
    border-bottom: 1px solid $border;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.rs-title {
    font-size: 13px;
    font-weight: 700;
    color: $text;
}

.rs-about {
    font-size: 12px;
    color: $text-dim;
    line-height: 1.7;
}

.rs-edit-link {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: none;
    color: $red;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 0;

    &:hover {
        opacity: 0.8;
    }
}

.rs-location {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: $text-muted;
}

.loc-icon {
    color: $red;
}

.rs-verif-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.verif-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
}

.verif-left {
    display: flex;
    align-items: center;
    gap: 7px;
    color: $text-muted;
}

.verif-icon {
    color: $text-dim;
}

.verif-ok {
    color: #4caf50;
    font-size: 11px;
    font-weight: 600;
}
</style>
