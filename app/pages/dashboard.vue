<template>
    <div class="dash-page">

        <!-- Left sidebar -->
        <aside class="dash-sidebar">
            <nav class="dash-nav">
                <button class="nav-item" :class="{ active: section === 'overview' }" @click="section = 'overview'">
                    <v-icon icon="mdi-view-dashboard-outline" size="19" /><span>Podsumowanie</span>
                </button>
                <NuxtLink to="/my-adverts" class="nav-item">
                    <v-icon icon="mdi-card-text-outline" size="19" /><span>Moje ogłoszenia</span>
                </NuxtLink>
                <NuxtLink to="/favorites" class="nav-item">
                    <v-icon icon="mdi-heart-outline" size="19" /><span>Ulubione</span>
                </NuxtLink>
                <button class="nav-item" :class="{ active: section === 'searches' }" @click="section = 'searches'">
                    <v-icon icon="mdi-magnify" size="19" /><span>Wyszukiwania</span>
                    <span v-if="savedSearchNewCount > 0" class="nav-badge">{{ savedSearchNewCount }}</span>
                </button>
                <NuxtLink to="/messages" class="nav-item">
                    <v-icon icon="mdi-email-outline" size="19" /><span>Wiadomości</span>
                    <span v-if="stats?.unreadMessages" class="nav-badge">{{ stats.unreadMessages }}</span>
                </NuxtLink>
                <button class="nav-item" :class="{ active: section === 'notifications' }" @click="goNotifications">
                    <v-icon icon="mdi-bell-outline" size="19" /><span>Powiadomienia</span>
                    <span v-if="notifUnread > 0" class="nav-badge">{{ notifUnread }}</span>
                </button>
                <button class="nav-item" :class="{ active: section === 'reviews' }" @click="goReviews">
                    <v-icon icon="mdi-star-outline" size="19" /><span>Opinie i oceny</span>
                </button>
                <NuxtLink to="/faktury" class="nav-item">
                    <v-icon icon="mdi-receipt-text-outline" size="19" /><span>Faktury</span>
                </NuxtLink>
                <div class="nav-divider" />
                <button class="nav-item" :class="{ active: section === 'profile' }" @click="goProfile">
                    <v-icon icon="mdi-account-outline" size="19" /><span>Dane osobowe</span>
                </button>
                <button class="nav-item" :class="{ active: section === 'settings' }" @click="goSettings">
                    <v-icon icon="mdi-cog-outline" size="19" /><span>Ustawienia konta</span>
                </button>
                <div class="nav-divider" />
                <button class="nav-item nav-danger" @click="authLogout">
                    <v-icon icon="mdi-logout" size="19" /><span>Wyloguj się</span>
                </button>
            </nav>
            <div class="dash-promo">
                <div class="promo-text">
                    <div class="promo-title">Zwiększ zasięg<br>swoich ogłoszeń</div>
                    <p class="promo-sub">Wyróżnij ogłoszenia i sprzedawaj szybciej.</p>
                    <NuxtLink to="/promote" class="promo-btn">Dowiedz się więcej</NuxtLink>
                </div>
            </div>
        </aside>

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
                            <div class="avatar-online" />
                        </div>
                        <div class="profile-info">
                            <div class="profile-name-row">
                                <h1 class="profile-name">{{ profile?.name }} {{ profile?.surname }}</h1>
                                <v-icon icon="mdi-check-decagram" size="18" class="verified-badge" />
                            </div>
                            <div class="profile-role">{{ profile?.accountType === 'Business' ? (profile.companyName ?? 'Dealer') : 'Użytkownik indywidualny' }}</div>
                            <div class="profile-since">Członek od {{ memberSince }}</div>
                        </div>
                    </div>
                    <div class="banner-tags">
                        <span v-if="profile?.accountType === 'Business'" class="btag btag-dealer">
                            <v-icon icon="mdi-shield-check" size="13" />DEALER ZWERYFIKOWANY
                        </span>
                        <span v-if="profile?.email" class="btag">
                            <v-icon icon="mdi-email-outline" size="13" />{{ profile.email }}
                        </span>
                        <span v-if="profile?.phoneNumber" class="btag">
                            <v-icon icon="mdi-phone-outline" size="13" />{{ profile.phoneNumber }}
                        </span>
                        <span v-if="profile?.city" class="btag">
                            <v-icon icon="mdi-map-marker-outline" size="13" />{{ profile.city }}<template v-if="profile.region">, {{ profile.region }}</template>
                        </span>
                    </div>
                    <button class="edit-profile-btn" @click="goProfile">
                        <v-icon icon="mdi-pencil-outline" size="15" />Edytuj profil
                    </button>
                </div>

                <!-- Stats row -->
                <div class="stats-row">
                    <div class="stat-card">
                        <v-icon icon="mdi-car-outline" size="22" class="stat-icon" />
                        <div class="stat-num">{{ stats?.totalAdverts ?? 0 }}</div>
                        <div class="stat-label">Moje ogłoszenia</div>
                        <div class="stat-sub green">{{ stats?.activeAdverts ?? 0 }} aktywnych</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-eye-outline" size="22" class="stat-icon" />
                        <div class="stat-num">{{ formatViews(stats?.totalViews ?? 0) }}</div>
                        <div class="stat-label">Wyświetlenia</div>
                        <div class="stat-sub">łącznie</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-check-circle-outline" size="22" class="stat-icon" />
                        <div class="stat-num">{{ stats?.totalSold ?? 0 }}</div>
                        <div class="stat-label">Sprzedanych aut</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-heart-outline" size="22" class="stat-icon" />
                        <div class="stat-num">{{ stats?.favoritesCount ?? 0 }}</div>
                        <div class="stat-label">W ulubionych</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-star-outline" size="22" class="stat-icon" />
                        <div class="stat-num">{{ stats?.averageRating ? stats.averageRating.toFixed(1) : '—' }}</div>
                        <div class="stat-label">Ocena sprzedawcy</div>
                        <div v-if="stats?.averageRating" class="stat-stars">
                            <v-icon v-for="n in 5" :key="n" :icon="n <= Math.round(stats.averageRating) ? 'mdi-star' : 'mdi-star-outline'" size="12" />
                        </div>
                        <div v-if="stats?.reviewCount" class="stat-sub">{{ stats.reviewCount }} opinii</div>
                    </div>
                    <div class="stat-card">
                        <v-icon icon="mdi-account-multiple-outline" size="22" class="stat-icon" />
                        <div class="stat-num">{{ stats?.followersCount ?? 0 }}</div>
                        <div class="stat-label">Obserwujący</div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="tabs-bar">
                    <button v-for="tab in overviewTabs" :key="tab.key"
                        class="tab-btn" :class="{ active: activeTab === tab.key }"
                        @click="activeTab = tab.key">{{ tab.label }}
                    </button>
                </div>

                <!-- Tab: Moje ogłoszenia -->
                <div v-if="activeTab === 'adverts'" class="tab-body">
                    <div class="tab-toolbar">
                        <div class="tab-search">
                            <v-icon icon="mdi-magnify" size="18" class="ts-icon" />
                            <input v-model="advertSearch" class="ts-input" placeholder="Szukaj w moich ogłoszeniach..." />
                        </div>
                        <NuxtLink to="/add-advert" class="btn-add-ad">
                            <v-icon icon="mdi-plus" size="16" />Dodaj ogłoszenie
                        </NuxtLink>
                    </div>
                    <div v-if="loading" class="loading-row"><v-icon icon="mdi-loading" size="28" class="spin" /></div>
                    <div v-else-if="filteredAdverts.length" class="adverts-grid">
                        <div v-for="a in filteredAdverts" :key="a.id" class="advert-card">
                            <div class="adcard-img-wrap">
                                <span class="adcard-badge" :class="advertBadgeClass(a)">{{ advertBadgeLabel(a) }}</span>
                                <img :src="getImageUrl(a.images?.find(i => i.isMain)?.url)" :alt="a.title" />
                                <button class="adcard-delete-btn" :disabled="deleteLoading === a.id" title="Usuń" @click.stop="confirmDelete(a.id)">
                                    <v-icon v-if="deleteLoading === a.id" icon="mdi-loading" size="14" class="spin" />
                                    <v-icon v-else icon="mdi-delete-outline" size="14" />
                                </button>
                            </div>
                            <NuxtLink :to="`/advert/${a.id}`" class="adcard-body">
                                <div class="adcard-title">{{ a.brand?.name }} {{ a.model?.name }}</div>
                                <div class="adcard-meta">{{ a.year }} • {{ a.fuelType?.name ?? '—' }} • {{ Number(a.mileage).toLocaleString('pl') }} km</div>
                                <div class="adcard-price">{{ Number(a.price).toLocaleString('pl') }} zł</div>
                                <div class="adcard-stats">
                                    <span><v-icon icon="mdi-eye-outline" size="13" /> {{ a.viewCount ?? 0 }}</span>
                                    <span><v-icon icon="mdi-heart-outline" size="13" /> {{ a.favoriteCount ?? 0 }}</span>
                                </div>
                            </NuxtLink>
                        </div>
                    </div>
                    <div v-else class="empty-state">
                        <v-icon icon="mdi-car-outline" size="36" class="empty-icon" />
                        <p>Nie masz jeszcze żadnych ogłoszeń.</p>
                        <NuxtLink to="/add-advert" class="btn-red-sm">+ Dodaj pierwsze ogłoszenie</NuxtLink>
                    </div>
                    <button v-if="myAdverts.length && myAdverts.length < advertTotal" class="show-more-btn" :disabled="loadingMore" @click="loadMoreAdverts">
                        <v-icon v-if="loadingMore" icon="mdi-loading" size="16" class="spin" />
                        <span v-else>Pokaż więcej</span>
                    </button>

                    <!-- Delete confirm modal -->
                    <Teleport to="body">
                        <transition name="fade">
                            <div v-if="deleteConfirmId !== null" class="modal-backdrop" @click.self="deleteConfirmId = null">
                                <div class="confirm-modal">
                                    <div class="confirm-icon"><v-icon icon="mdi-delete-alert-outline" size="32" /></div>
                                    <h3 class="confirm-title">Usuń ogłoszenie</h3>
                                    <p class="confirm-sub">Czy na pewno chcesz usunąć to ogłoszenie? Tej operacji nie można cofnąć.</p>
                                    <div class="confirm-actions">
                                        <button class="btn-cancel-modal" @click="deleteConfirmId = null">Anuluj</button>
                                        <button class="btn-delete-modal" :disabled="deleteLoading !== null" @click="doDelete">
                                            <v-icon v-if="deleteLoading !== null" icon="mdi-loading" size="15" class="spin" />
                                            <v-icon v-else icon="mdi-delete-outline" size="15" />
                                            Usuń ogłoszenie
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </transition>
                    </Teleport>
                </div>

                <!-- Tab: Opinie -->
                <div v-else-if="activeTab === 'reviews'" class="tab-body">
                    <div v-if="reviewsLoading" class="loading-row"><v-icon icon="mdi-loading" size="28" class="spin" /></div>
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
                                        <v-icon v-for="n in 5" :key="n" :icon="n <= r.rating ? 'mdi-star' : 'mdi-star-outline'" size="16" class="star" />
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
                            <p>Nie masz jeszcze żadnych opinii.</p>
                        </div>
                    </template>
                </div>

                <!-- Tab: Obserwujący -->
                <div v-else-if="activeTab === 'followers'" class="tab-body">
                    <div v-if="followersLoading" class="loading-row"><v-icon icon="mdi-loading" size="28" class="spin" /></div>
                    <div v-else-if="followers.length" class="followers-grid">
                        <div v-for="f in followers" :key="f.id" class="follower-card">
                            <div class="follower-avatar">{{ f.followerName?.[0] ?? '?' }}</div>
                            <div class="follower-name">{{ f.followerName }}</div>
                            <div class="follower-since">od {{ formatDate(f.createdAt) }}</div>
                        </div>
                    </div>
                    <div v-else class="empty-state">
                        <v-icon icon="mdi-account-multiple-outline" size="36" class="empty-icon" />
                        <p>Nie masz jeszcze obserwujących.</p>
                    </div>
                </div>

                <!-- Tab: Obserwowane -->
                <div v-else-if="activeTab === 'following'" class="tab-body">
                    <div v-if="followingLoading" class="loading-row"><v-icon icon="mdi-loading" size="28" class="spin" /></div>
                    <div v-else-if="followedAdverts.length" class="advert-follow-list">
                        <div v-for="fa in followedAdverts" :key="fa.id" class="follow-advert-row">
                            <img :src="getImageUrl(fa.mainImageUrl)" class="follow-advert-img" :alt="fa.advertTitle" />
                            <div class="follow-advert-info">
                                <div class="follow-advert-title">{{ fa.advertTitle }}</div>
                                <div class="follow-advert-meta">
                                    <span v-if="fa.brand">{{ fa.brand }} {{ fa.model }}</span>
                                    <span v-if="fa.city"><v-icon icon="mdi-map-marker-outline" size="13" />{{ fa.city }}</span>
                                </div>
                                <div class="follow-advert-price">
                                    {{ Number(fa.advertPrice).toLocaleString('pl') }} zł
                                    <span v-if="fa.priceChanged" class="price-changed">
                                        <v-icon icon="mdi-trending-down" size="14" />
                                        Zmiana ceny
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
                        <p>Nie obserwujesz żadnych ogłoszeń.</p>
                    </div>
                </div>
            </template>

            <!-- ══ NOTIFICATIONS ═════════════════════════════════════════════ -->
            <template v-else-if="section === 'notifications'">
                <div class="section-topbar">
                    <h2 class="section-title">Powiadomienia</h2>
                    <button v-if="notifUnread > 0" class="btn-outline-sm" @click="markAllRead">
                        <v-icon icon="mdi-check-all" size="15" />Oznacz wszystkie jako przeczytane
                    </button>
                </div>
                <div v-if="notifsLoading" class="loading-row"><v-icon icon="mdi-loading" size="28" class="spin" /></div>
                <div v-else-if="allNotifications.length" class="notif-list">
                    <div v-for="n in allNotifications" :key="n.id" class="notif-item" :class="{ unread: !n.isRead }" @click="onNotifClick(n)">
                        <div class="notif-icon-wrap" :class="notifIconClass(n.type)">
                            <v-icon :icon="notifIcon(n.type)" size="18" />
                        </div>
                        <div class="notif-body">
                            <div class="notif-title">{{ n.title }}</div>
                            <div class="notif-content">{{ n.content }}</div>
                            <div class="notif-time">{{ formatDate(n.createdAt) }}</div>
                        </div>
                        <div v-if="!n.isRead" class="notif-dot" />
                        <button class="notif-del" @click.stop="deleteNotif(n.id)">
                            <v-icon icon="mdi-close" size="14" />
                        </button>
                    </div>
                </div>
                <div v-else class="empty-state" style="margin-top:60px">
                    <v-icon icon="mdi-bell-off-outline" size="40" class="empty-icon" />
                    <p>Brak powiadomień.</p>
                </div>
            </template>

            <!-- ══ SAVED SEARCHES ════════════════════════════════════════════ -->
            <template v-else-if="section === 'searches'">
                <div class="section-topbar">
                    <h2 class="section-title">Zapisane wyszukiwania</h2>
                </div>
                <div v-if="searchesLoading" class="loading-row"><v-icon icon="mdi-loading" size="28" class="spin" /></div>
                <div v-else-if="savedSearches.length" class="searches-list">
                    <div v-for="s in savedSearches" :key="s.id" class="search-card">
                        <div class="search-card-left">
                            <div class="search-name">{{ s.name }}</div>
                            <div class="search-criteria">{{ criteriaLabel(s.criteria) }}</div>
                            <div class="search-created">Zapisano: {{ formatDate(s.createdAt) }}</div>
                        </div>
                        <div class="search-card-right">
                            <span v-if="s.newResultsCount > 0" class="new-results-badge">{{ s.newResultsCount }} nowych</span>
                            <NuxtLink :to="searchUrl(s.criteria)" class="btn-search-run">
                                <v-icon icon="mdi-magnify" size="14" />Szukaj
                            </NuxtLink>
                            <button class="btn-icon-danger" @click="deleteSearch(s.id)"><v-icon icon="mdi-delete-outline" size="16" /></button>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state" style="margin-top:60px">
                    <v-icon icon="mdi-magnify" size="40" class="empty-icon" />
                    <p>Nie masz żadnych zapisanych wyszukiwań.</p>
                    <NuxtLink to="/adverts" class="btn-red-sm">Przejdź do wyszukiwarki</NuxtLink>
                </div>
            </template>

            <!-- ══ REVIEWS SECTION ═══════════════════════════════════════════ -->
            <template v-else-if="section === 'reviews'">
                <div class="section-topbar">
                    <h2 class="section-title">Opinie i oceny</h2>
                </div>
                <div v-if="stats?.averageRating" class="rating-summary">
                    <div class="rating-big">{{ stats.averageRating.toFixed(1) }}</div>
                    <div class="rating-stars">
                        <v-icon v-for="n in 5" :key="n" :icon="n <= Math.round(stats.averageRating) ? 'mdi-star' : 'mdi-star-outline'" size="22" class="star" />
                    </div>
                    <div class="rating-count">{{ stats.reviewCount ?? 0 }} opinii</div>
                </div>
                <div v-if="reviewsLoading" class="loading-row"><v-icon icon="mdi-loading" size="28" class="spin" /></div>
                <div v-else-if="receivedReviews.length" class="reviews-list" style="padding:0 24px 40px">
                    <div v-for="r in receivedReviews" :key="r.id" class="review-card">
                        <div class="review-header">
                            <div class="reviewer-avatar">{{ r.buyerName?.[0] ?? '?' }}</div>
                            <div class="reviewer-info">
                                <div class="reviewer-name">{{ r.buyerName }}</div>
                                <div class="review-date">{{ formatDate(r.createdAt) }}</div>
                            </div>
                            <div class="review-stars">
                                <v-icon v-for="n in 5" :key="n" :icon="n <= r.rating ? 'mdi-star' : 'mdi-star-outline'" size="16" class="star" />
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
                    <p>Nie masz jeszcze żadnych opinii.</p>
                </div>
            </template>

            <!-- ══ PROFILE ═══════════════════════════════════════════════════ -->
            <template v-else-if="section === 'profile'">
                <div class="section-topbar">
                    <h2 class="section-title">Dane osobowe</h2>
                </div>
                <form class="profile-form" @submit.prevent="saveProfile">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Imię *</label>
                            <input v-model="profileForm.name" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label>Nazwisko *</label>
                            <input v-model="profileForm.surname" class="form-input" required />
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Numer telefonu</label>
                        <input v-model="profileForm.phoneNumber" class="form-input" />
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Miasto</label>
                            <input v-model="profileForm.city" class="form-input" placeholder="np. Warszawa" />
                        </div>
                        <div class="form-group">
                            <label>Województwo</label>
                            <input v-model="profileForm.region" class="form-input" placeholder="np. mazowieckie" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label>O mnie</label>
                        <textarea v-model="profileForm.about" class="form-textarea" rows="4" maxlength="500" placeholder="Opisz się krótko..." />
                        <div class="char-count">{{ (profileForm.about ?? '').length }} / 500</div>
                    </div>
                    <template v-if="profile?.accountType === 'Business'">
                        <div class="form-section-title">Dane firmy</div>
                        <div class="form-group">
                            <label>Nazwa firmy</label>
                            <input v-model="profileForm.companyName" class="form-input" />
                        </div>
                        <div class="form-group">
                            <label>NIP</label>
                            <input v-model="profileForm.nip" class="form-input" />
                        </div>
                    </template>
                    <div v-if="profileSuccess" class="alert-success">
                        <v-icon icon="mdi-check-circle-outline" size="16" />Dane zostały zapisane.
                    </div>
                    <div v-if="profileError" class="alert-error">
                        <v-icon icon="mdi-alert-circle-outline" size="16" />{{ profileError }}
                    </div>
                    <button type="submit" class="btn-red" :disabled="profileSaving">
                        <v-icon v-if="profileSaving" icon="mdi-loading" size="16" class="spin" />
                        Zapisz zmiany
                    </button>
                </form>

                <div class="form-section-title" style="padding:0 28px;margin-top:32px">Zmiana hasła</div>
                <form class="profile-form" @submit.prevent="savePassword">
                    <div class="form-group">
                        <label>Aktualne hasło *</label>
                        <input v-model="passwordForm.currentPassword" type="password" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label>Nowe hasło *</label>
                        <input v-model="passwordForm.newPassword" type="password" class="form-input" required minlength="6" />
                    </div>
                    <div v-if="passwordSuccess" class="alert-success">
                        <v-icon icon="mdi-check-circle-outline" size="16" />Hasło zostało zmienione.
                    </div>
                    <div v-if="passwordError" class="alert-error">
                        <v-icon icon="mdi-alert-circle-outline" size="16" />{{ passwordError }}
                    </div>
                    <button type="submit" class="btn-outline" :disabled="passwordSaving">
                        <v-icon v-if="passwordSaving" icon="mdi-loading" size="16" class="spin" />
                        Zmień hasło
                    </button>
                </form>
            </template>

            <!-- ══ SETTINGS ══════════════════════════════════════════════════ -->
            <template v-else-if="section === 'settings'">
                <div class="section-topbar">
                    <h2 class="section-title">Ustawienia konta</h2>
                </div>
                <div class="settings-form">
                    <div class="settings-group">
                        <div class="settings-group-title">Powiadomienia e-mail</div>
                        <div class="setting-row">
                            <div class="setting-label">
                                <div class="setting-name">Powiadomienia e-mail</div>
                                <div class="setting-desc">Otrzymuj powiadomienia na adres e-mail</div>
                            </div>
                            <button class="toggle-btn" :class="{ on: settingsForm.emailNotifications }" @click="settingsForm.emailNotifications = !settingsForm.emailNotifications">
                                <div class="toggle-knob" />
                            </button>
                        </div>
                        <div class="setting-row">
                            <div class="setting-label">
                                <div class="setting-name">Alerty o zmianach cen</div>
                                <div class="setting-desc">Powiadamiaj gdy cena obserwowanego ogłoszenia się zmieni</div>
                            </div>
                            <button class="toggle-btn" :class="{ on: settingsForm.priceChangeAlerts }" @click="settingsForm.priceChangeAlerts = !settingsForm.priceChangeAlerts">
                                <div class="toggle-knob" />
                            </button>
                        </div>
                        <div class="setting-row">
                            <div class="setting-label">
                                <div class="setting-name">Powiadomienia o wiadomościach</div>
                                <div class="setting-desc">Powiadamiaj o nowych wiadomościach e-mailem</div>
                            </div>
                            <button class="toggle-btn" :class="{ on: settingsForm.newMessageAlerts }" @click="settingsForm.newMessageAlerts = !settingsForm.newMessageAlerts">
                                <div class="toggle-knob" />
                            </button>
                        </div>
                        <div class="setting-row">
                            <div class="setting-label">
                                <div class="setting-name">Newsletter CARIZO</div>
                                <div class="setting-desc">Otrzymuj oferty i aktualności motoryzacyjne</div>
                            </div>
                            <button class="toggle-btn" :class="{ on: settingsForm.newsletterSubscribed }" @click="settingsForm.newsletterSubscribed = !settingsForm.newsletterSubscribed">
                                <div class="toggle-knob" />
                            </button>
                        </div>
                    </div>
                    <div v-if="settingsSuccess" class="alert-success">
                        <v-icon icon="mdi-check-circle-outline" size="16" />Ustawienia zostały zapisane.
                    </div>
                    <div v-if="settingsError" class="alert-error">
                        <v-icon icon="mdi-alert-circle-outline" size="16" />{{ settingsError }}
                    </div>
                    <button class="btn-red" :disabled="settingsSaving" @click="saveSettings">
                        <v-icon v-if="settingsSaving" icon="mdi-loading" size="16" class="spin" />
                        Zapisz ustawienia
                    </button>

                    <div class="danger-zone">
                        <div class="danger-title">Strefa niebezpieczna</div>
                        <div class="danger-desc">Usunięcie konta jest nieodwracalne. Wszystkie Twoje ogłoszenia i dane zostaną trwale usunięte.</div>
                        <button class="btn-danger" @click="confirmDeleteAccount = true">Usuń konto</button>
                    </div>
                </div>
            </template>
        </main>

        <!-- Right sidebar -->
        <aside class="right-sidebar">
            <div class="rs-card">
                <div class="rs-title">O mnie</div>
                <p class="rs-about">{{ profile?.about || 'Brak opisu.' }}</p>
                <button class="rs-edit-link" @click="goProfile">
                    <v-icon icon="mdi-pencil-outline" size="13" />Edytuj opis
                </button>
            </div>
            <div class="rs-card">
                <div class="rs-title">Lokalizacja</div>
                <div class="rs-location" v-if="profile?.city">
                    <v-icon icon="mdi-map-marker-outline" size="15" class="loc-icon" />
                    {{ profile.city }}<template v-if="profile.region">, {{ profile.region }}</template>
                </div>
                <div class="rs-location" v-else><v-icon icon="mdi-map-marker-outline" size="15" class="loc-icon" />Nie podano</div>
            </div>
            <div class="rs-card">
                <div class="rs-title">Weryfikacje</div>
                <div class="rs-verif-list">
                    <div class="verif-row">
                        <div class="verif-left"><v-icon icon="mdi-phone-outline" size="15" class="verif-icon" />Telefon</div>
                        <span class="verif-ok">Zweryfikowany</span>
                    </div>
                    <div class="verif-row">
                        <div class="verif-left"><v-icon icon="mdi-email-outline" size="15" class="verif-icon" />E-mail</div>
                        <span class="verif-ok">Zweryfikowany</span>
                    </div>
                    <div class="verif-row">
                        <div class="verif-left"><v-icon icon="mdi-shield-check-outline" size="15" class="verif-icon" />
                            {{ profile?.accountType === 'Business' ? 'Dealer' : 'Konto' }}
                        </div>
                        <span class="verif-ok">Zweryfikowany</span>
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
                        <h3 class="confirm-title">Usuń konto</h3>
                        <p class="confirm-sub">To działanie jest nieodwracalne. Wszystkie dane, ogłoszenia i historia zostaną trwale usunięte.</p>
                        <div class="confirm-actions">
                            <button class="btn-cancel-modal" @click="confirmDeleteAccount = false">Anuluj</button>
                            <button class="btn-delete-modal" @click="doDeleteAccount">Usuń konto</button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import type { CarAdvert, UserProfile, UserStats, Review, Notification, SavedSearch, FollowedAdvert, AccountSettings, UpdateProfileDto, SearchAdvertDto } from '~/types'

definePageMeta({ middleware: 'auth' })

const { fetchProfile, fetchStats, updateProfile, updatePassword, fetchSettings, updateSettings, deleteAccount } = useUser()
const { getMyReceivedReviews } = useReviews()
const { notifications: allNotifications, unreadCount: notifUnread, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
const { getFollowedAdverts, getFollowers } = useFollow()
const { getSavedSearches, deleteSearch: deleteSavedSearch } = useSavedSearches()
const { logout: authLogout } = useAuth()
const { getImageUrl } = useImageUrl()

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

// Tabs within overview
const activeTab = ref('adverts')
const overviewTabs = [
    { key: 'adverts', label: 'Moje ogłoszenia' },
    { key: 'reviews', label: 'Opinie' },
    { key: 'followers', label: 'Obserwujący' },
    { key: 'following', label: 'Obserwowane' },
]

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

// Profile form
const profileForm = reactive<UpdateProfileDto>({ name: '', surname: '', phoneNumber: '', city: '', region: '', about: '', companyName: '', nip: '' })
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

const confirmDeleteAccount = ref(false)

// Computed
const initials = computed(() => {
    if (!profile.value) return '?'
    return (profile.value.name?.[0] ?? '') + (profile.value.surname?.[0] ?? '')
})

const memberSince = computed(() => {
    if (!profile.value?.createdAt) return '—'
    return new Date(profile.value.createdAt).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
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
    if (!a.isActive) return 'WYGASŁO'
    if (a.isHidden) return 'UKRYTE'
    if (a.badge) return a.badge
    return 'AKTYWNE'
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
        } catch {} finally { reviewsLoading.value = false }
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
        })
    }
}

async function goSettings() {
    section.value = 'settings'
    try {
        const s = await fetchSettings()
        if (s) Object.assign(settingsForm, s)
    } catch {}
}

// Actions
function confirmDelete(id: number) { deleteConfirmId.value = id }

async function doDelete() {
    if (deleteConfirmId.value === null) return
    const id = deleteConfirmId.value
    deleteLoading.value = id
    try {
        await $fetch(`/api/proxy/api/Advert/${id}`, { method: 'DELETE' })
        myAdverts.value = myAdverts.value.filter(a => a.id !== id)
        deleteConfirmId.value = null
        advertTotal.value = Math.max(0, advertTotal.value - 1)
        if (stats.value) stats.value.totalAdverts = Math.max(0, stats.value.totalAdverts - 1)
    } catch {} finally { deleteLoading.value = null }
}

async function loadMoreAdverts() {
    loadingMore.value = true
    advertPage.value++
    try {
        const r = await $fetch<{ items: CarAdvert[]; totalCount: number }>(`/api/proxy/api/Advert/user?page=${advertPage.value}&pageSize=8`)
        myAdverts.value.push(...r.items)
    } catch {} finally { loadingMore.value = false }
}

async function markAllRead() {
    try { await markAllAsRead() } catch {}
}

async function onNotifClick(n: Notification) {
    if (!n.isRead) await markAsRead(n.id)
    if (n.advertId) navigateTo(`/advert/${n.advertId}`)
}

async function deleteNotif(id: number) {
    try { await deleteNotification(id) } catch {}
}

async function deleteSearch(id: number) {
    try {
        await deleteSavedSearch(id)
        savedSearches.value = savedSearches.value.filter(s => s.id !== id)
    } catch {}
}

function criteriaLabel(criteria: SearchAdvertDto): string {
    const parts: string[] = []
    if (criteria.textSearch) parts.push(criteria.textSearch)
    if (criteria.priceFrom || criteria.priceTo) {
        parts.push(`${criteria.priceFrom ? criteria.priceFrom.toLocaleString('pl') + ' zł' : ''} – ${criteria.priceTo ? criteria.priceTo.toLocaleString('pl') + ' zł' : ''}`)
    }
    if (criteria.yearFrom || criteria.yearTo) parts.push(`${criteria.yearFrom ?? ''} – ${criteria.yearTo ?? ''}`)
    return parts.join(' · ') || 'Wszystkie ogłoszenia'
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
        NewMessage: 'mdi-message-outline',
        PriceChange: 'mdi-tag-outline',
        NewFollower: 'mdi-account-plus-outline',
        ReportResolved: 'mdi-flag-outline',
        AdvertExpiring: 'mdi-clock-alert-outline',
        PromoExpiring: 'mdi-star-outline',
        NewReview: 'mdi-star-outline',
        TransactionUpdate: 'mdi-handshake-outline',
    }
    return map[type] ?? 'mdi-bell-outline'
}

function notifIconClass(type: string) {
    if (type === 'PriceChange') return 'notif-green'
    if (type === 'NewMessage') return 'notif-blue'
    if (['AdvertExpiring', 'PromoExpiring'].includes(type)) return 'notif-orange'
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
        profileError.value = e?.data?.message ?? 'Nie udało się zapisać danych.'
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
        passwordError.value = e?.data?.message ?? 'Nie udało się zmienić hasła. Sprawdź aktualne hasło.'
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
        settingsError.value = e?.data?.message ?? 'Nie udało się zapisać ustawień.'
    } finally { settingsSaving.value = false }
}

async function doDeleteAccount() {
    try {
        await deleteAccount()
        await authLogout()
    } catch {}
}

// Load overview tab data lazily
watch(activeTab, async (tab) => {
    if (tab === 'reviews' && receivedReviews.value.length === 0) {
        reviewsLoading.value = true
        try {
            const r = await getMyReceivedReviews()
            receivedReviews.value = r.items
        } catch {} finally { reviewsLoading.value = false }
    }
    if (tab === 'followers' && followers.value.length === 0) {
        followersLoading.value = true
        try {
            const r = await getFollowers()
            followers.value = r.items
        } catch {} finally { followersLoading.value = false }
    }
    if (tab === 'following' && followedAdverts.value.length === 0) {
        followingLoading.value = true
        try {
            const r = await getFollowedAdverts()
            followedAdverts.value = r.items
        } catch {} finally { followingLoading.value = false }
    }
})

watch(section, async (s) => {
    if (s === 'searches' && savedSearches.value.length === 0) {
        searchesLoading.value = true
        try {
            const r = await getSavedSearches()
            savedSearches.value = r.items
        } catch {} finally { searchesLoading.value = false }
    }
})

onMounted(async () => {
    try {
        ;[profile.value, stats.value] = await Promise.all([fetchProfile(), fetchStats()])
        const r = await $fetch<{ items: CarAdvert[]; totalCount: number }>('/api/proxy/api/Advert/user?page=1&pageSize=8')
        myAdverts.value = r.items
        advertTotal.value = r.totalCount
        // Lazy load notifications count
        fetchNotifications().catch(() => {})
    } catch {} finally { loading.value = false }
})
</script>

<style lang="scss" scoped>
.dash-page {
    display: flex; min-height: 100vh; background: $bg; padding-top: $nav-height;
}

// ── Left sidebar ──────────────────────────────────────────────────────────────
.dash-sidebar {
    width: 220px; min-width: 220px; background: #070707; border-right: 1px solid $border;
    display: flex; flex-direction: column; position: sticky; top: $nav-height;
    height: calc(100vh - #{$nav-height}); overflow-y: auto;
    @include respond-to(md) { display: none; }
}

.dash-nav { flex: 1; padding: 16px 0; }

.nav-item {
    display: flex; align-items: center; gap: 11px; padding: 11px 18px;
    color: $text-muted; font-size: 13.5px; font-weight: 500; cursor: pointer;
    transition: background 0.15s, color 0.15s; text-decoration: none;
    background: transparent; border: none; width: 100%; text-align: left;
    font-family: 'Inter', sans-serif; position: relative;

    &:hover { background: rgba(255,255,255,0.04); color: $text; }
    &.active { background: rgba($red, 0.1); color: $text; border-left: 2px solid $red; padding-left: 16px; }
}

.nav-danger:hover { color: #e55; }

.nav-badge {
    margin-left: auto; background: $red; color: white;
    font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 20px;
    min-width: 18px; text-align: center;
}

.nav-divider { height: 1px; background: $border; margin: 8px 0; }

.dash-promo {
    margin: 12px; background: linear-gradient(135deg, #110005, #0a0002);
    border: 1px solid rgba($red, 0.2); border-radius: $r-md; padding: 16px 14px;
}

.promo-title { font-size: 13px; font-weight: 800; color: $text; line-height: 1.4; margin-bottom: 6px; }
.promo-sub { font-size: 11px; color: $text-dim; line-height: 1.5; margin-bottom: 12px; }

.promo-btn {
    display: inline-block; background: $red; border: none; border-radius: $r-sm;
    color: white; font-size: 11px; font-weight: 700; font-family: 'Inter', sans-serif;
    padding: 8px 14px; cursor: pointer; text-decoration: none; transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

// ── Center main ───────────────────────────────────────────────────────────────
.dash-main { flex: 1; min-width: 0; padding-bottom: 60px; }

// Profile banner
.profile-banner {
    position: relative; background: linear-gradient(135deg, #1c0005 0%, #0a0002 100%);
    border-bottom: 1px solid $border; min-height: 200px;
    display: flex; flex-direction: column; justify-content: flex-end; padding: 0 28px 16px;
}

.banner-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba($red, 0.15) 0%, transparent 60%);
}

.banner-content {
    position: relative; z-index: 2; display: flex; align-items: flex-end; gap: 18px; margin-bottom: 14px;
}

.avatar-wrap { position: relative; flex-shrink: 0; }

.avatar {
    width: 76px; height: 76px; border-radius: 50%;
    background: linear-gradient(135deg, $red, #3a0008); border: 3px solid rgba($red, 0.6);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; font-weight: 900; color: white;
}

.avatar-online {
    position: absolute; bottom: 4px; right: 4px; width: 12px; height: 12px;
    border-radius: 50%; background: #4caf50; border: 2px solid $bg;
}

.profile-info { flex: 1; padding-bottom: 4px; }

.profile-name-row { display: flex; align-items: center; gap: 8px; }

.profile-name { font-size: 24px; font-weight: 900; color: $text; line-height: 1.1; }

.verified-badge { color: $red; }

.profile-role { font-size: 13px; color: $text-muted; margin-top: 3px; }
.profile-since { font-size: 12px; color: $text-dim; margin-top: 2px; }

.banner-tags {
    position: relative; z-index: 2; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}

.btag {
    display: flex; align-items: center; gap: 5px; font-size: 12px; color: $text-muted;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px; padding: 4px 10px;
}

.btag-dealer {
    background: rgba(45,122,58,0.15); border-color: rgba(45,122,58,0.3); color: #4caf50;
    font-weight: 700; font-size: 11px; letter-spacing: 0.3px;
}

.edit-profile-btn {
    position: absolute; top: 16px; right: 20px; z-index: 5;
    display: flex; align-items: center; gap: 6px;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.15); border-radius: $r-sm;
    color: $text-muted; font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif;
    padding: 8px 14px; cursor: pointer; transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: rgba(255,255,255,0.3); color: $text; }
}

// Stats row
.stats-row {
    display: grid; grid-template-columns: repeat(6, 1fr); border-bottom: 1px solid $border;
    @include respond-to(md) { grid-template-columns: repeat(3, 1fr); }
    @include respond-to(sm) { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
    padding: 18px 16px; border-right: 1px solid $border;
    display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
    &:last-child { border-right: none; }
}

.stat-icon { color: $red; margin-bottom: 6px; }
.stat-num { font-size: 26px; font-weight: 900; color: $text; line-height: 1; }
.stat-label { font-size: 11px; color: $text-dim; line-height: 1.4; margin-top: 2px; }
.stat-sub { font-size: 11px; color: $text-dark; margin-top: 3px; font-weight: 500; &.green { color: #4caf50; } }
.stat-stars { display: flex; gap: 1px; margin-top: 3px; color: #f5a623; }

// Tabs
.tabs-bar {
    display: flex; border-bottom: 1px solid $border; padding: 0 24px; overflow-x: auto;
}

.tab-btn {
    flex-shrink: 0; background: transparent; border: none; border-bottom: 2px solid transparent;
    color: $text-dim; font-size: 13.5px; font-weight: 500; font-family: 'Inter', sans-serif;
    padding: 14px 16px; cursor: pointer; transition: color 0.2s, border-color 0.2s; margin-bottom: -1px;
    &:hover { color: $text-muted; }
    &.active { color: $text; border-bottom-color: $red; font-weight: 600; }
}

.tab-body { padding: 20px 24px; }

.tab-toolbar {
    display: flex; align-items: center; gap: 10px; margin-bottom: 18px;
}

.tab-search {
    flex: 1; display: flex; align-items: center; gap: 8px; background: #0d0d0d;
    border: 1px solid $border; border-radius: $r-md; padding: 9px 12px;
    &:focus-within { border-color: rgba($red, 0.4); }
}

.ts-icon { color: $text-dim; flex-shrink: 0; }

.ts-input {
    flex: 1; background: transparent; border: none; outline: none;
    color: $text; font-size: 13px; font-family: 'Inter', sans-serif;
    &::placeholder { color: $text-dark; }
}

.btn-add-ad {
    display: flex; align-items: center; gap: 6px; background: $red; border: none;
    border-radius: $r-sm; color: white; font-size: 13px; font-weight: 600;
    font-family: 'Inter', sans-serif; padding: 10px 18px; cursor: pointer; text-decoration: none;
    white-space: nowrap; transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

// Adverts grid
.adverts-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px;
    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.advert-card {
    background: #0a0a0a; border: 1px solid $border; border-radius: $r-md; overflow: hidden;
    transition: border-color 0.25s, transform 0.25s;
    &:hover { border-color: rgba($red, 0.3); transform: translateY(-3px); }
}

.adcard-img-wrap {
    position: relative;
    img { width: 100%; height: 140px; object-fit: cover; display: block; }
}

.adcard-badge {
    position: absolute; top: 8px; left: 8px; font-size: 9px; font-weight: 800;
    padding: 3px 8px; border-radius: 5px; letter-spacing: 0.4px;
}

.badge-active { background: #2d7a3a; color: white; }
.badge-featured { background: #8B6914; color: #f5d060; border: 1px solid #a07820; }
.badge-expired { background: rgba(255,255,255,0.1); color: $text-dim; }
.badge-hidden { background: rgba(150,50,50,0.3); color: #e55; border: 1px solid rgba(#e55,0.3); }

.adcard-delete-btn {
    position: absolute; top: 7px; right: 7px; width: 30px; height: 30px; border-radius: 50%;
    background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);
    border: 1px solid rgba(#e55, 0.25); color: rgba(#e55, 0.75);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    &:hover:not(:disabled) { background: rgba(220,50,50,0.28); color: #e55; border-color: rgba(#e55, 0.55); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.adcard-body { display: block; padding: 12px; text-decoration: none; &:hover .adcard-title { color: $red; } }
.adcard-title { font-size: 14px; font-weight: 700; color: $text; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.15s; }
.adcard-meta { font-size: 11px; color: $text-dim; margin-bottom: 6px; }
.adcard-price { font-size: 17px; font-weight: 900; color: $red; margin-bottom: 8px; }
.adcard-stats {
    display: flex; gap: 12px; font-size: 11px; color: $text-dark;
    span { display: flex; align-items: center; gap: 3px; }
}

.show-more-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    width: 100%; background: transparent; border: 1px solid $border; border-radius: $r-md;
    color: $text-muted; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif;
    padding: 12px; cursor: pointer; transition: border-color 0.2s, color 0.2s;
    &:hover:not(:disabled) { border-color: $text-dim; color: $text; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// Reviews
.reviews-list { display: flex; flex-direction: column; gap: 16px; }

.review-card {
    background: #0a0a0a; border: 1px solid $border; border-radius: $r-md; padding: 18px;
    display: flex; flex-direction: column; gap: 10px;
}

.review-header { display: flex; align-items: center; gap: 12px; }

.reviewer-avatar {
    width: 38px; height: 38px; border-radius: 50%; background: rgba($red, 0.15);
    border: 1px solid rgba($red, 0.3); color: $red; font-weight: 700; font-size: 16px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.reviewer-info { flex: 1; }
.reviewer-name { font-size: 14px; font-weight: 600; color: $text; }
.review-date { font-size: 11px; color: $text-dim; margin-top: 2px; }
.review-stars { display: flex; gap: 2px; color: #f5a623; }
.star { color: #f5a623; }
.review-content { font-size: 13px; color: $text-muted; line-height: 1.7; }

.review-advert {
    display: flex; align-items: center; gap: 5px; font-size: 11px; color: $text-dim;
    padding-top: 8px; border-top: 1px solid $border;
}

// Followers grid
.followers-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;
}

.follower-card {
    background: #0a0a0a; border: 1px solid $border; border-radius: $r-md;
    padding: 16px; text-align: center; display: flex; flex-direction: column; gap: 8px;
}

.follower-avatar {
    width: 48px; height: 48px; border-radius: 50%; background: rgba($red, 0.12);
    border: 1px solid rgba($red, 0.25); color: $red; font-weight: 700; font-size: 20px;
    display: flex; align-items: center; justify-content: center; margin: 0 auto;
}

.follower-name { font-size: 13px; font-weight: 600; color: $text; }
.follower-since { font-size: 11px; color: $text-dim; }

// Following adverts
.advert-follow-list { display: flex; flex-direction: column; gap: 12px; }

.follow-advert-row {
    display: flex; align-items: center; gap: 14px; background: #0a0a0a;
    border: 1px solid $border; border-radius: $r-md; padding: 12px;
    transition: border-color 0.2s;
    &:hover { border-color: rgba($red, 0.3); }
}

.follow-advert-img { width: 80px; height: 55px; object-fit: cover; border-radius: $r-sm; flex-shrink: 0; }
.follow-advert-info { flex: 1; min-width: 0; }
.follow-advert-title { font-size: 14px; font-weight: 600; color: $text; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.follow-advert-meta { display: flex; gap: 10px; font-size: 11px; color: $text-dim; margin-bottom: 4px; align-items: center; }
.follow-advert-price { font-size: 16px; font-weight: 800; color: $red; display: flex; align-items: center; gap: 8px; }
.price-changed { font-size: 11px; color: #4caf50; display: flex; align-items: center; gap: 3px; }
.follow-advert-link { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: rgba($red, 0.1); color: $red; transition: background 0.2s; &:hover { background: rgba($red, 0.2); } flex-shrink: 0; }

// Section header
.section-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 0; margin-bottom: 20px;
}

.section-title { font-size: 20px; font-weight: 800; color: $text; }

// Notifications
.notif-list { display: flex; flex-direction: column; padding: 0 24px 40px; gap: 8px; }

.notif-item {
    display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px;
    background: #0a0a0a; border: 1px solid $border; border-radius: $r-md;
    cursor: pointer; transition: border-color 0.2s; position: relative;
    &:hover { border-color: rgba($red, 0.2); }
    &.unread { background: rgba($red, 0.03); border-color: rgba($red, 0.12); }
}

.notif-icon-wrap {
    width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;

    &.notif-red { background: rgba($red, 0.12); color: $red; }
    &.notif-blue { background: rgba(33,150,243,0.12); color: #2196f3; }
    &.notif-green { background: rgba(76,175,80,0.12); color: #4caf50; }
    &.notif-orange { background: rgba(255,152,0,0.12); color: #ff9800; }
}

.notif-body { flex: 1; min-width: 0; }
.notif-title { font-size: 13px; font-weight: 600; color: $text; margin-bottom: 3px; }
.notif-content { font-size: 12px; color: $text-dim; line-height: 1.5; }
.notif-time { font-size: 11px; color: $text-dark; margin-top: 5px; }
.notif-dot { width: 8px; height: 8px; border-radius: 50%; background: $red; flex-shrink: 0; margin-top: 5px; }

.notif-del {
    background: transparent; border: none; color: $text-dark; cursor: pointer;
    padding: 4px; border-radius: 4px; transition: color 0.2s;
    &:hover { color: #e55; }
}

// Saved searches
.searches-list { display: flex; flex-direction: column; padding: 0 24px 40px; gap: 10px; }

.search-card {
    display: flex; align-items: center; gap: 16px; background: #0a0a0a;
    border: 1px solid $border; border-radius: $r-md; padding: 14px 18px;
    transition: border-color 0.2s;
    &:hover { border-color: rgba($red, 0.2); }
}

.search-card-left { flex: 1; min-width: 0; }
.search-name { font-size: 14px; font-weight: 600; color: $text; margin-bottom: 3px; }
.search-criteria { font-size: 12px; color: $text-dim; }
.search-created { font-size: 11px; color: $text-dark; margin-top: 3px; }
.search-card-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.new-results-badge {
    background: rgba($red, 0.12); border: 1px solid rgba($red, 0.25); color: $red;
    font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px;
}

.btn-search-run {
    display: flex; align-items: center; gap: 5px; background: transparent;
    border: 1px solid $border; border-radius: $r-sm; color: $text-muted; font-size: 12px;
    font-weight: 600; font-family: 'Inter', sans-serif; padding: 7px 14px;
    cursor: pointer; text-decoration: none; transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: rgba($red, 0.4); color: $red; }
}

.btn-icon-danger {
    background: transparent; border: none; color: $text-dark; cursor: pointer;
    padding: 6px; border-radius: $r-sm; transition: color 0.2s, background 0.2s;
    &:hover { color: #e55; background: rgba(220,50,50,0.1); }
}

// Rating summary
.rating-summary {
    display: flex; align-items: center; gap: 14px; padding: 0 24px 20px;
}

.rating-big { font-size: 56px; font-weight: 900; color: $text; line-height: 1; }
.rating-stars { display: flex; flex-direction: column; gap: 4px; }
.rating-count { font-size: 13px; color: $text-dim; }

// Profile form
.profile-form {
    display: flex; flex-direction: column; gap: 18px; padding: 0 28px 32px; max-width: 640px;
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-group label { font-size: 12px; font-weight: 600; color: $text-muted; text-transform: uppercase; letter-spacing: 0.4px; }

.form-input {
    background: #0d0d0d; border: 1px solid $border; border-radius: $r-sm; color: $text;
    font-size: 14px; font-family: 'Inter', sans-serif; padding: 11px 14px; outline: none;
    transition: border-color 0.2s;
    &:focus { border-color: rgba($red, 0.5); }
    &::placeholder { color: $text-dark; }
}

.form-textarea {
    background: #0d0d0d; border: 1px solid $border; border-radius: $r-sm; color: $text;
    font-size: 14px; font-family: 'Inter', sans-serif; padding: 11px 14px; outline: none;
    resize: vertical; transition: border-color 0.2s;
    &:focus { border-color: rgba($red, 0.5); }
    &::placeholder { color: $text-dark; }
}

.char-count { font-size: 11px; color: $text-dark; text-align: right; }

.form-section-title {
    font-size: 13px; font-weight: 700; color: $text; text-transform: uppercase;
    letter-spacing: 0.5px; padding-bottom: 4px; border-bottom: 1px solid $border; margin-bottom: -4px;
}

// Settings
.settings-form { padding: 0 28px 40px; max-width: 600px; display: flex; flex-direction: column; gap: 24px; }

.settings-group { display: flex; flex-direction: column; gap: 0; }

.settings-group-title {
    font-size: 13px; font-weight: 700; color: $text; text-transform: uppercase;
    letter-spacing: 0.5px; margin-bottom: 12px;
}

.setting-row {
    display: flex; align-items: center; justify-content: space-between; gap: 20px;
    padding: 14px 0; border-bottom: 1px solid $border;
    &:last-child { border-bottom: none; }
}

.setting-label { flex: 1; }
.setting-name { font-size: 14px; font-weight: 500; color: $text; }
.setting-desc { font-size: 12px; color: $text-dim; margin-top: 2px; }

.toggle-btn {
    width: 48px; height: 26px; border-radius: 13px; border: none; cursor: pointer;
    position: relative; transition: background 0.25s; background: #1e1e1e; flex-shrink: 0;
    &.on { background: $red; }
}

.toggle-knob {
    position: absolute; top: 3px; left: 3px; width: 20px; height: 20px;
    border-radius: 50%; background: white; transition: transform 0.25s;
    .toggle-btn.on & { transform: translateX(22px); }
}

.danger-zone {
    margin-top: 8px; padding: 20px; background: rgba(220,50,50,0.05);
    border: 1px solid rgba(#e55, 0.2); border-radius: $r-md;
    display: flex; flex-direction: column; gap: 10px;
}

.danger-title { font-size: 14px; font-weight: 700; color: #e55; }
.danger-desc { font-size: 13px; color: $text-dim; line-height: 1.6; }

.btn-danger {
    background: transparent; border: 1px solid rgba(#e55, 0.4); border-radius: $r-sm;
    color: #e55; font-size: 13px; font-weight: 700; font-family: 'Inter', sans-serif;
    padding: 10px 20px; cursor: pointer; width: fit-content;
    transition: background 0.2s; align-self: flex-start;
    &:hover { background: rgba(220,50,50,0.12); }
}

// Shared buttons
.btn-red {
    display: flex; align-items: center; justify-content: center; gap: 7px;
    background: $red; border: none; border-radius: $r-sm; color: white;
    font-size: 14px; font-weight: 700; padding: 12px 24px; cursor: pointer;
    font-family: 'Inter', sans-serif; width: fit-content; transition: opacity 0.2s;
    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-outline {
    display: flex; align-items: center; justify-content: center; gap: 7px;
    background: transparent; border: 1px solid $border; border-radius: $r-sm;
    color: $text-muted; font-size: 14px; font-weight: 600; padding: 12px 24px; cursor: pointer;
    font-family: 'Inter', sans-serif; width: fit-content; transition: border-color 0.2s, color 0.2s;
    &:hover:not(:disabled) { border-color: $text-dim; color: $text; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-outline-sm {
    display: flex; align-items: center; gap: 6px; background: transparent;
    border: 1px solid $border; border-radius: $r-sm; color: $text-muted;
    font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif;
    padding: 8px 14px; cursor: pointer; transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.btn-red-sm {
    display: inline-flex; align-items: center; gap: 6px; background: $red;
    border: none; border-radius: $r-sm; color: white; font-size: 13px; font-weight: 700;
    font-family: 'Inter', sans-serif; padding: 10px 20px; cursor: pointer; text-decoration: none;
    transition: opacity 0.2s; margin-top: 12px;
    &:hover { opacity: 0.88; }
}

// Alerts
.alert-success {
    display: flex; align-items: center; gap: 8px; font-size: 13px; color: #4caf50;
    background: rgba(76,175,80,0.08); border: 1px solid rgba(76,175,80,0.2);
    border-radius: $r-sm; padding: 10px 14px;
}

.alert-error {
    display: flex; align-items: center; gap: 8px; font-size: 13px; color: #e55;
    background: rgba(220,50,50,0.08); border: 1px solid rgba(220,50,50,0.2);
    border-radius: $r-sm; padding: 10px 14px;
}

// Loading
.loading-row { display: flex; justify-content: center; padding: 60px 0; color: $text-dim; }

// Empty state
.empty-state {
    text-align: center; padding: 50px 20px; color: $text-dim; font-size: 14px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
}

.empty-icon { color: $border; }

// Modals
.modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);
    z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 16px;
}

.confirm-modal {
    background: #0e0e0e; border: 1px solid $border; border-radius: $r-lg;
    padding: 32px 28px; width: 100%; max-width: 400px; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
}

.confirm-icon { color: rgba(#e55, 0.7); }
.confirm-title { font-size: 18px; font-weight: 800; color: $text; margin: 0; }
.confirm-sub { font-size: 13px; color: $text-dim; line-height: 1.6; margin: 0; }

.confirm-actions { display: flex; gap: 10px; margin-top: 8px; width: 100%; }

.btn-cancel-modal {
    flex: 1; background: transparent; border: 1px solid $border; border-radius: $r-sm;
    color: $text-muted; font-size: 13px; font-weight: 500; font-family: 'Inter', sans-serif;
    padding: 10px; cursor: pointer; transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.btn-delete-modal {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
    background: rgba(220,50,50,0.15); border: 1px solid rgba(#e55, 0.35); border-radius: $r-sm;
    color: #e55; font-size: 13px; font-weight: 700; font-family: 'Inter', sans-serif;
    padding: 10px; cursor: pointer; transition: background 0.2s, border-color 0.2s;
    &:hover:not(:disabled) { background: rgba(220,50,50,0.25); }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

// ── Right sidebar ─────────────────────────────────────────────────────────────
.right-sidebar {
    width: 250px; min-width: 250px; border-left: 1px solid $border; background: #070707;
    display: flex; flex-direction: column; position: sticky; top: $nav-height;
    height: calc(100vh - #{$nav-height}); overflow-y: auto;
    @include respond-to(md) { display: none; }
}

.rs-card { padding: 20px; border-bottom: 1px solid $border; display: flex; flex-direction: column; gap: 10px; }
.rs-title { font-size: 13px; font-weight: 700; color: $text; }
.rs-about { font-size: 12px; color: $text-dim; line-height: 1.7; }
.rs-edit-link {
    display: flex; align-items: center; gap: 5px; background: transparent; border: none;
    color: $red; font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif;
    cursor: pointer; padding: 0;
    &:hover { opacity: 0.8; }
}

.rs-location { display: flex; align-items: center; gap: 6px; font-size: 13px; color: $text-muted; }
.loc-icon { color: $red; }
.rs-verif-list { display: flex; flex-direction: column; gap: 12px; }
.verif-row { display: flex; align-items: center; justify-content: space-between; font-size: 12px; }
.verif-left { display: flex; align-items: center; gap: 7px; color: $text-muted; }
.verif-icon { color: $text-dim; }
.verif-ok { color: #4caf50; font-size: 11px; font-weight: 600; }
</style>
