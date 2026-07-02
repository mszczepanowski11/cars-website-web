<template>
    <!-- Not found / error state -->
    <div v-if="!advert" class="advert-not-found">
        <div class="anf-inner">
            <v-icon icon="mdi-car-off" size="64" class="anf-icon" />
            <h1 class="anf-title">Ogłoszenie nie istnieje</h1>
            <p class="anf-desc">To ogłoszenie mogło zostać usunięte, wygasnąć lub link jest nieprawidłowy.</p>
            <NuxtLink to="/adverts" class="anf-btn">
                <v-icon icon="mdi-magnify" size="18" />
                Przeglądaj ogłoszenia
            </NuxtLink>
        </div>
    </div>
    <div v-else class="advert-page">

        <!-- Sticky topbar -->
        <div class="advert-topbar">
            <div class="container topbar-inner">
                <div class="topbar-left">
                    <NuxtLink to="/adverts" class="back-link">
                        <v-icon icon="mdi-chevron-left" size="18" />
                        Wróć
                    </NuxtLink>
                    <div v-if="advert" class="topbar-crumbs">
                        <span class="crumb">{{ advert.brand?.name }}</span>
                        <v-icon icon="mdi-chevron-right" size="12" class="crumb-sep" />
                        <span class="crumb">{{ advert.model?.name }}</span>
                        <v-icon icon="mdi-chevron-right" size="12" class="crumb-sep" />
                        <span class="crumb crumb-active">{{ advert.year }}</span>
                    </div>
                </div>
                <div class="topbar-actions">
                    <button class="icon-action" @click="toggleFav">
                        <v-icon :icon="isFav ? 'mdi-heart' : 'mdi-heart-outline'" size="17" :class="{ 'heart-active': isFav }" />
                        <span class="ia-label">Ulubione</span>
                    </button>
                    <div class="share-wrap" v-click-outside="() => shareOpen = false">
                        <button class="icon-action" @click="shareOpen = !shareOpen">
                            <v-icon icon="mdi-share-variant-outline" size="17" />
                            <span class="ia-label">Udostępnij</span>
                        </button>
                        <div v-if="shareOpen" class="share-dropdown">
                            <button class="share-opt" @click="doShareNative"><v-icon icon="mdi-share-outline" size="15" /> Natywnie</button>
                            <button class="share-opt" @click="doShareFacebook"><v-icon icon="mdi-facebook" size="15" /> Facebook</button>
                            <button class="share-opt" @click="doShareX"><v-icon icon="mdi-twitter" size="15" /> X / Twitter</button>
                            <button class="share-opt" @click="doShareWhatsApp"><v-icon icon="mdi-whatsapp" size="15" /> WhatsApp</button>
                            <button class="share-opt" @click="doCopyLink">
                                <v-icon :icon="linkCopied ? 'mdi-check' : 'mdi-link-variant'" size="15" />
                                {{ linkCopied ? 'Skopiowano!' : 'Kopiuj link' }}
                            </button>
                        </div>
                    </div>
                    <button class="icon-action" :disabled="pdfLoading" @click="downloadPDF">
                        <v-icon :icon="pdfLoading ? 'mdi-loading' : 'mdi-file-pdf-box'" size="17" :class="{ spin: pdfLoading }" />
                        <span class="ia-label">PDF</span>
                    </button>
                    <div class="qr-wrap" @mouseenter="generateQR">
                        <button class="icon-action"><v-icon icon="mdi-qrcode" size="17" /><span class="ia-label">QR</span></button>
                        <div v-if="qrDataUrl" class="qr-popup">
                            <img :src="qrDataUrl" alt="QR kod" width="120" height="120" />
                            <span>Zeskanuj aby otworzyć</span>
                        </div>
                    </div>
                    <button class="icon-action" @click="handleReport">
                        <v-icon icon="mdi-flag-outline" size="17" />
                        <span class="ia-label">Zgłoś</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- ═══════════════ HERO SECTION ═══════════════ -->
        <div class="hero-section">
            <div class="container hero-inner">

                <!-- Gallery column -->
                <div class="gallery-col">
                    <div
                        class="main-photo-wrap"
                        @click="openLightbox(activeImg)"
                        @touchstart.passive="touchStartX = $event.changedTouches[0].clientX"
                        @touchend.passive="onSwipe($event)"
                    >
                        <div class="photo-badges">
                            <span v-if="advert?.isVerified" class="badge-verified">
                                <v-icon icon="mdi-check-circle" size="12" /> VERIFIED
                            </span>
                            <span v-if="advert?.badge" class="badge-hero" :class="`badge-hero--${(advert.badge ?? '').toLowerCase()}`">
                                {{ advert.badge }}
                            </span>
                        </div>
                        <img :src="mainImg" :alt="advert?.title ?? ''" class="main-photo-img" />
                        <div class="photo-bottom-bar">
                            <span v-if="hasImages" class="photo-count-pill">
                                <v-icon icon="mdi-image-multiple-outline" size="13" />
                                {{ activeImg + 1 }} / {{ allImages.length }}
                            </span>
                            <button class="photo-expand-btn" @click.stop="openLightbox(activeImg)">
                                <v-icon icon="mdi-fullscreen" size="15" /> Galeria
                            </button>
                        </div>
                        <button class="photo-fav-btn" :class="{ active: isFav }" @click.stop="toggleFav">
                            <v-icon :icon="isFav ? 'mdi-heart' : 'mdi-heart-outline'" size="20" />
                        </button>
                    </div>
                    <div v-if="hasImages && allImages.length > 1" class="photo-thumbs-row">
                        <button
                            v-for="(img, i) in allImages.slice(0, 6)"
                            :key="i"
                            class="photo-thumb"
                            :class="{ 'thumb-active': i === activeImg }"
                            @click="activeImg = i"
                        >
                            <img :src="img.url" :alt="`Zdjęcie ${i + 1} – ${advert?.title ?? ''}`" loading="lazy" />
                            <div v-if="i === 5 && allImages.length > 6" class="thumb-more">+{{ allImages.length - 6 }}</div>
                        </button>
                    </div>
                </div>

                <!-- Info column -->
                <div class="info-col">
                    <div class="info-brand-line">
                        <span class="info-brand">{{ advert?.brand?.name ?? '' }}</span>
                        <span v-if="advert?.generation" class="info-gen">{{ generationLabel(advert.generation) }}</span>
                    </div>
                    <h1 class="info-title">{{ advert?.model?.name ?? advert?.title ?? '' }}</h1>

                    <div class="info-chips">
                        <span v-if="advert?.year" class="i-chip"><v-icon icon="mdi-calendar-outline" size="12" />{{ advert.year }}</span>
                        <span v-if="advert?.mileage" class="i-chip"><v-icon icon="mdi-speedometer" size="12" />{{ Number(advert.mileage).toLocaleString('pl') }} km</span>
                        <span v-if="advert?.fuelType" class="i-chip"><v-icon icon="mdi-gas-station-outline" size="12" />{{ advert.fuelType.name }}</span>
                        <span v-if="advert?.gearbox" class="i-chip"><v-icon icon="mdi-cog-outline" size="12" />{{ advert.gearbox.name }}</span>
                        <span v-if="advert?.powerHP || advert?.engineVersion?.horsepower" class="i-chip i-chip--power"><v-icon icon="mdi-lightning-bolt" size="12" />{{ advert?.powerHP ?? advert?.engineVersion?.horsepower }} KM</span>
                        <span v-if="advert?.driveType" class="i-chip"><v-icon icon="mdi-car-traction-control" size="12" />{{ advert.driveType.name }}</span>
                        <span v-if="advert?.color" class="i-chip">
                            <span class="i-chip-color-dot" :style="{ background: advert.color.hexCode }" />
                            {{ advert.color.name }}
                        </span>
                    </div>

                    <div class="price-area">
                        <div class="price-big">{{ advert?.price ? Number(advert.price).toLocaleString('pl') + ' zł' : '—' }}</div>
                        <div v-if="advert?.price && Number(advert.price) > 5000" class="price-monthly-estimate">
                            <div class="pme-row">
                                <div class="pme-item">
                                    <div class="pme-label">
                                        <div class="pme-ing-dot ing-leasing" />
                                        Leasing ING
                                    </div>
                                    <div class="pme-val">od {{ Math.round(Number(advert.price) * 0.9 * 0.0075 * Math.pow(1.0075, 48) / (Math.pow(1.0075, 48) - 1)).toLocaleString('pl') }} zł/mies.</div>
                                </div>
                                <div class="pme-item">
                                    <div class="pme-label">
                                        <div class="pme-ing-dot ing-credit" />
                                        Kredyt ING
                                    </div>
                                    <div class="pme-val">od {{ Math.round(Number(advert.price) * 0.9 * 0.00749 * Math.pow(1.00749, 60) / (Math.pow(1.00749, 60) - 1)).toLocaleString('pl') }} zł/mies.</div>
                                </div>
                            </div>
                            <div class="pme-note">* przy 10% wpłaty własnej, szacunkowo</div>
                        </div>
                        <div class="price-badges-row">
                            <span v-if="isNegotiable" class="nego-badge"><v-icon icon="mdi-handshake-outline" size="12" />Do negocjacji</span>
                            <span class="seller-type-chip" :class="sellerTypeLabel.includes('Dealer') ? 'chip-dealer' : 'chip-private'">
                                <v-icon :icon="sellerTypeLabel.includes('Dealer') ? 'mdi-store-outline' : 'mdi-account-outline'" size="11" />
                                {{ sellerTypeLabel }}
                            </span>
                            <span v-if="priceAnalysis" class="price-analysis-badge" :class="priceAnalysis.cls">
                                <v-icon :icon="priceAnalysis.icon" size="11" />
                                {{ priceAnalysis.label }}
                                <span class="pab-sub">{{ priceAnalysis.sub }}</span>
                            </span>
                        </div>
                    </div>

                    <div v-if="advert?.city" class="info-location-row">
                        <v-icon icon="mdi-map-marker-outline" size="14" class="loc-pin-sm" />
                        <span>{{ advert.city }}<template v-if="advert?.region">, {{ advert.region }}</template></span>
                        <span v-if="advert?.viewCount" class="views-pill">
                            <v-icon icon="mdi-eye-outline" size="12" />{{ Number(advert.viewCount).toLocaleString('pl') }}
                        </span>
                        <span class="time-pill">{{ advertAge }}</span>
                    </div>

                    <!-- CARIZO VERIFIED trust badges -->
                    <div class="verified-trust-box">
                        <div class="vtb-header">
                            <v-icon icon="mdi-shield-check" size="16" class="vtb-icon" />
                            <span class="vtb-title">CARIZO VERIFIED</span>
                        </div>
                        <div class="vtb-items">
                            <div class="vtb-item" :class="advert?.vin ? 'vtb-ok' : 'vtb-pending'">
                                <v-icon :icon="advert?.vin ? 'mdi-check-circle' : 'mdi-clock-outline'" size="14" />
                                <span>VIN {{ advert?.vin ? 'zweryfikowany' : 'niezweryfikowany' }}</span>
                            </div>
                            <div class="vtb-item" :class="advert?.hasFullServiceHistory ? 'vtb-ok' : 'vtb-pending'">
                                <v-icon :icon="advert?.hasFullServiceHistory ? 'mdi-check-circle' : 'mdi-clock-outline'" size="14" />
                                <span>Historia serwisowa</span>
                            </div>
                            <div class="vtb-item" :class="!advert?.hasDamage ? 'vtb-ok' : 'vtb-warn'">
                                <v-icon :icon="!advert?.hasDamage ? 'mdi-check-circle' : 'mdi-alert-circle'" size="14" />
                                <span>Bezwypadkowy</span>
                            </div>
                            <div class="vtb-item" :class="seller?.accountType === 'Business' ? 'vtb-ok' : 'vtb-pending'">
                                <v-icon :icon="seller?.accountType === 'Business' ? 'mdi-check-circle' : 'mdi-clock-outline'" size="14" />
                                <span>Zweryfikowany sprzedawca</span>
                            </div>
                        </div>
                    </div>

                    <div class="info-divider" />

                    <div v-if="seller" class="seller-mini">
                        <div class="sma-avatar" :style="{ background: sellerAvatarColor }">{{ sellerInitials }}</div>
                        <div class="sma-info">
                            <div class="sma-name">{{ sellerDisplayName }}</div>
                            <div class="sma-meta">
                                <span v-if="sellerStats?.averageRating" class="sma-stars">
                                    <v-icon v-for="n in 5" :key="n" :icon="n <= Math.round(sellerStats.averageRating) ? 'mdi-star' : 'mdi-star-outline'" size="11" class="star" />
                                    <span class="sma-rating">{{ sellerStats.averageRating.toFixed(1) }}</span>
                                </span>
                                <span class="sma-cnt">{{ sellerStats?.activeAdverts ?? 0 }} ogłoszeń</span>
                            </div>
                        </div>
                        <NuxtLink v-if="advert?.userId" :to="`/seller/${advert.userId}`" class="sma-link">Profil ›</NuxtLink>
                    </div>

                    <div class="info-divider" />

                    <!-- CTAs -->
                    <div class="cta-stack">
                        <button v-if="seller?.phoneNumber" class="cta-phone" @click="showPhone = !showPhone">
                            <v-icon icon="mdi-phone-outline" size="17" />
                            {{ showPhone ? seller.phoneNumber : 'Pokaż numer telefonu' }}
                        </button>
                        <button class="cta-message" :disabled="contactLoading || isOwnAdvert" :title="isOwnAdvert ? 'To Twoje ogłoszenie – nie możesz pisać do samego siebie' : undefined" @click="contactSeller">
                            <v-icon v-if="contactLoading" icon="mdi-loading" size="17" class="spin" />
                            <v-icon v-else-if="isOwnAdvert" icon="mdi-message-off-outline" size="17" />
                            <v-icon v-else icon="mdi-message-text-outline" size="17" />
                            {{ contactLoading ? 'Otwieranie...' : isOwnAdvert ? 'To Twoje ogłoszenie' : 'Napisz wiadomość' }}
                        </button>
                        <p v-if="isOwnAdvert" class="own-advert-note">
                            <v-icon icon="mdi-information-outline" size="13" />
                            Nie możesz wysyłać wiadomości do samego siebie. To Twoje ogłoszenie.
                        </p>
                        <div class="cta-row2">
                            <button class="cta-alt" :disabled="!!txLoading" @click="showViewingPicker = !showViewingPicker">
                                <v-icon icon="mdi-calendar-check-outline" size="15" />Oględziny
                            </button>
                            <button class="cta-alt" :disabled="!!txLoading" @click="showReservationPicker = !showReservationPicker">
                                <v-icon icon="mdi-bookmark-check-outline" size="15" />Rezerwacja
                            </button>
                        </div>

                        <!-- Viewing date picker -->
                        <transition name="slide-down">
                            <div v-if="showViewingPicker" class="date-picker-card">
                                <div class="dpc-title"><v-icon icon="mdi-calendar-check-outline" size="14" />Umów oględziny</div>
                                <div class="dpc-row">
                                    <input v-model="viewingDate" type="date" class="dpc-input" :min="todayStr" />
                                    <input v-model="viewingTime" type="time" class="dpc-input dpc-time" />
                                </div>
                                <textarea v-model="viewingNote" class="dpc-note" placeholder="Uwagi (opcjonalnie)..." rows="2" />
                                <div class="dpc-btns">
                                    <button class="dpc-cancel" @click="showViewingPicker = false">Anuluj</button>
                                    <button class="dpc-confirm" :disabled="!viewingDate || txLoading === 'viewing'" @click="scheduleViewing">
                                        <v-icon v-if="txLoading === 'viewing'" icon="mdi-loading" size="14" class="spin" />
                                        Wyślij prośbę
                                    </button>
                                </div>
                            </div>
                        </transition>

                        <!-- Reservation date picker -->
                        <transition name="slide-down">
                            <div v-if="showReservationPicker" class="date-picker-card">
                                <div class="dpc-title"><v-icon icon="mdi-bookmark-check-outline" size="14" />Zarezerwuj pojazd</div>
                                <div class="dpc-row">
                                    <input v-model="reservationDate" type="date" class="dpc-input" :min="todayStr" />
                                    <input v-model="reservationTime" type="time" class="dpc-input dpc-time" />
                                </div>
                                <textarea v-model="reservationNote" class="dpc-note" placeholder="Uwagi (opcjonalnie)..." rows="2" />
                                <div class="dpc-btns">
                                    <button class="dpc-cancel" @click="showReservationPicker = false">Anuluj</button>
                                    <button class="dpc-confirm" :disabled="!reservationDate || txLoading === 'reservation'" @click="reserveCar">
                                        <v-icon v-if="txLoading === 'reservation'" icon="mdi-loading" size="14" class="spin" />
                                        Zarezerwuj
                                    </button>
                                </div>
                            </div>
                        </transition>
                    </div>

                    <transition name="fade-msg">
                        <div v-if="txSuccess" class="tx-success"><v-icon icon="mdi-check-circle-outline" size="14" />{{ txSuccess }}</div>
                    </transition>
                    <transition name="fade-msg">
                        <div v-if="txError || contactError" class="tx-error"><v-icon icon="mdi-alert-circle-outline" size="14" />{{ txError || contactError }}</div>
                    </transition>

                    <div class="secure-note-sm">
                        <v-icon icon="mdi-shield-check-outline" size="13" class="secure-icon-sm" />
                        Transakcja zabezpieczona przez CARI<span class="red-text">ZO</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════════════ SPECS BAR ═══════════════ -->
        <div class="specs-bar">
            <div class="container specs-bar-inner">
                <div v-if="advert?.mileage" class="spec-item">
                    <v-icon icon="mdi-speedometer" size="22" class="spi-icon" />
                    <div><div class="spi-val">{{ Number(advert.mileage).toLocaleString('pl') }} km</div><div class="spi-lbl">Przebieg</div></div>
                </div>
                <div v-if="advert?.year" class="spec-item">
                    <v-icon icon="mdi-calendar-outline" size="22" class="spi-icon" />
                    <div><div class="spi-val">{{ advert.year }}</div><div class="spi-lbl">Rok produkcji</div></div>
                </div>
                <div v-if="advert?.fuelType" class="spec-item">
                    <v-icon icon="mdi-gas-station-outline" size="22" class="spi-icon" />
                    <div><div class="spi-val">{{ advert.fuelType.name }}</div><div class="spi-lbl">Paliwo</div></div>
                </div>
                <div v-if="advert?.engineVersion?.horsepower" class="spec-item">
                    <v-icon icon="mdi-lightning-bolt" size="22" class="spi-icon" />
                    <div><div class="spi-val">{{ advert.engineVersion.horsepower }} KM</div><div class="spi-lbl">Moc</div></div>
                </div>
                <div v-if="advert?.engineVersion?.displacement" class="spec-item">
                    <v-icon icon="mdi-engine-outline" size="22" class="spi-icon" />
                    <div><div class="spi-val">{{ advert.engineVersion.displacement }} cm³</div><div class="spi-lbl">Pojemność</div></div>
                </div>
                <div v-if="advert?.gearbox" class="spec-item">
                    <v-icon icon="mdi-cog-outline" size="22" class="spi-icon" />
                    <div><div class="spi-val">{{ advert.gearbox.name }}</div><div class="spi-lbl">Skrzynia</div></div>
                </div>
                <div v-if="advert?.bodyType" class="spec-item">
                    <v-icon icon="mdi-car-outline" size="22" class="spi-icon" />
                    <div><div class="spi-val">{{ advert.bodyType.name }}</div><div class="spi-lbl">Nadwozie</div></div>
                </div>
                <div v-if="advert?.viewCount" class="spec-item spec-item--dim">
                    <v-icon icon="mdi-eye-outline" size="22" class="spi-icon spi-icon--dim" />
                    <div><div class="spi-val spi-val--dim">{{ Number(advert.viewCount).toLocaleString('pl') }}</div><div class="spi-lbl">Wyświetleń</div></div>
                </div>
            </div>
        </div>

        <!-- ═══════════════ MAIN CONTENT ═══════════════ -->
        <div class="container main-layout" ref="mainLayoutRef">

            <!-- Left column -->
            <div class="main-left">

                <!-- Extra tech chips from description -->
                <transition name="fade">
                    <div v-if="parsedTechData.length" class="tech-chips-section">
                        <div class="tcs-title"><v-icon icon="mdi-clipboard-list-outline" size="14" />Dane dodatkowe</div>
                        <div class="tech-chips-grid">
                            <div v-for="item in parsedTechData" :key="item.label" class="tech-chip" :class="{ 'chip-bool': item.isCheck && !item.value.includes(' ') }">
                                <span class="tc-label">{{ item.label }}</span>
                                <span class="tc-value" :class="{ 'tc-check': item.isCheck && item.value === 'Tak' }">
                                    <v-icon v-if="item.isCheck && item.value === 'Tak'" icon="mdi-check-circle" size="13" class="tc-check-icon" />
                                    {{ item.value === 'Tak' && item.isCheck ? '' : item.value }}
                                </span>
                            </div>
                        </div>
                    </div>
                </transition>

                <!-- SECTION 1: Opis -->
                <section v-if="parsedUserDesc" class="pg-section">
                    <h2 class="pg-section-title"><v-icon icon="mdi-text-box-outline" size="17" />Opis</h2>
                    <div class="tab-content">
                        <div class="desc-body">
                            <p class="desc-text" :class="{ clamped: !showFullDesc }">{{ parsedUserDesc }}</p>
                            <div v-if="parsedUserDesc.length > 400" class="desc-toggle">
                                <button @click="showFullDesc = !showFullDesc" class="read-more-btn">
                                    {{ showFullDesc ? 'Zwiń opis' : 'Czytaj więcej' }}
                                    <v-icon :icon="showFullDesc ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 2: Parametry techniczne -->
                <section class="pg-section">
                    <h2 class="pg-section-title"><v-icon icon="mdi-cog-outline" size="17" />Parametry techniczne</h2>
                    <div class="spec-table">
                        <div class="spec-section">
                            <div class="spec-section-title">Dane podstawowe</div>
                            <div class="spec-rows">
                                <div v-if="advert?.brand" class="spec-row"><span class="sr-label">Marka</span><span class="sr-val">{{ advert.brand.name }}</span></div>
                                <div v-if="advert?.model" class="spec-row"><span class="sr-label">Model</span><span class="sr-val">{{ advert.model.name }}</span></div>
                                <div v-if="advert?.generation" class="spec-row"><span class="sr-label">Generacja</span><span class="sr-val">{{ generationLabel(advert.generation) }}</span></div>
                                <div v-if="advert?.year" class="spec-row"><span class="sr-label">Rok produkcji</span><span class="sr-val">{{ advert.year }}</span></div>
                                <div v-if="advert?.mileage" class="spec-row"><span class="sr-label">Przebieg</span><span class="sr-val">{{ Number(advert.mileage).toLocaleString('pl') }} km</span></div>
                                <div v-if="advert?.condition" class="spec-row"><span class="sr-label">Stan pojazdu</span><span class="sr-val">{{ advert.condition === 'new' ? 'Nowy' : 'Używany' }}</span></div>
                                <div v-if="advert?.bodyType" class="spec-row"><span class="sr-label">Typ nadwozia</span><span class="sr-val">{{ advert.bodyType.name }}</span></div>
                                <div v-if="advert?.color" class="spec-row">
                                    <span class="sr-label">Kolor</span>
                                    <span class="sr-val sr-val--color">
                                        <span class="color-dot" :style="{ background: advert.color.hexCode }" />
                                        {{ advert.color.name }}
                                    </span>
                                </div>
                                <div v-if="advert?.doorCount" class="spec-row"><span class="sr-label">Liczba drzwi</span><span class="sr-val">{{ advert.doorCount }}</span></div>
                                <div v-if="advert?.seatsCount" class="spec-row"><span class="sr-label">Liczba miejsc</span><span class="sr-val">{{ advert.seatsCount }}</span></div>
                                <div v-if="advert?.vin" class="spec-row"><span class="sr-label">VIN</span><span class="sr-val sr-val--mono">{{ advert.vin }}</span></div>
                            </div>
                        </div>
                        <div class="spec-section">
                            <div class="spec-section-title">Silnik i napęd</div>
                            <div class="spec-rows">
                                <div v-if="advert?.fuelType" class="spec-row"><span class="sr-label">Rodzaj paliwa</span><span class="sr-val">{{ advert.fuelType.name }}</span></div>
                                <div v-if="advert?.gearbox" class="spec-row"><span class="sr-label">Skrzynia biegów</span><span class="sr-val">{{ advert.gearbox.name }}</span></div>
                                <div v-if="advert?.driveType" class="spec-row"><span class="sr-label">Napęd</span><span class="sr-val">{{ advert.driveType.name }}</span></div>
                                <div v-if="advert?.powerHP || advert?.engineVersion?.horsepower" class="spec-row"><span class="sr-label">Moc</span><span class="sr-val">{{ advert.powerHP ?? advert.engineVersion?.horsepower }} KM{{ advert.powerKW ? ` / ${advert.powerKW} kW` : '' }}</span></div>
                                <div v-if="advert?.engineSize || advert?.engineVersion?.displacement" class="spec-row"><span class="sr-label">Pojemność silnika</span><span class="sr-val">{{ (advert.engineSize ?? advert.engineVersion?.displacement)?.toLocaleString('pl') }} cm³</span></div>
                                <div v-if="advert?.torque" class="spec-row"><span class="sr-label">Moment obrotowy</span><span class="sr-val">{{ advert.torque }} Nm</span></div>
                                <div v-if="advert?.acceleration" class="spec-row"><span class="sr-label">Przyspieszenie 0–100 km/h</span><span class="sr-val">{{ advert.acceleration }} s</span></div>
                            </div>
                        </div>
                        <div v-if="advert?.fuelConsumptionCombined || advert?.co2Emission || advert?.euroNorm || advert?.curbWeight" class="spec-section">
                            <div class="spec-section-title">Zużycie paliwa i emisja</div>
                            <div class="spec-rows">
                                <div v-if="advert?.fuelConsumptionCity" class="spec-row"><span class="sr-label">Spalanie w mieście</span><span class="sr-val">{{ advert.fuelConsumptionCity }} l/100km</span></div>
                                <div v-if="advert?.fuelConsumptionHighway" class="spec-row"><span class="sr-label">Spalanie poza miastem</span><span class="sr-val">{{ advert.fuelConsumptionHighway }} l/100km</span></div>
                                <div v-if="advert?.fuelConsumptionCombined" class="spec-row"><span class="sr-label">Spalanie mieszane</span><span class="sr-val">{{ advert.fuelConsumptionCombined }} l/100km</span></div>
                                <div v-if="advert?.co2Emission" class="spec-row"><span class="sr-label">Emisja CO₂</span><span class="sr-val">{{ advert.co2Emission }} g/km</span></div>
                                <div v-if="advert?.euroNorm" class="spec-row"><span class="sr-label">Norma emisji spalin</span><span class="sr-val">{{ advert.euroNorm }}</span></div>
                                <div v-if="advert?.curbWeight" class="spec-row"><span class="sr-label">Masa własna</span><span class="sr-val">{{ advert.curbWeight?.toLocaleString('pl') }} kg</span></div>
                                <div v-if="advert?.grossWeight" class="spec-row"><span class="sr-label">Dopuszczalna masa całkowita</span><span class="sr-val">{{ advert.grossWeight?.toLocaleString('pl') }} kg</span></div>
                            </div>
                        </div>
                        <div v-if="parsedTechData.length" class="spec-section">
                            <div class="spec-section-title">Dane szczegółowe</div>
                            <div class="spec-rows">
                                <div v-for="item in parsedTechData" :key="item.label" class="spec-row">
                                    <span class="sr-label">{{ item.label }}</span>
                                    <span class="sr-val" :class="{ 'sr-val--check': item.isCheck && item.value === 'Tak', 'sr-val--warn': item.isWarning }">
                                        <v-icon v-if="item.isCheck && item.value === 'Tak'" icon="mdi-check-circle" size="14" class="sr-check-icon" />
                                        {{ item.value === 'Tak' && item.isCheck ? 'Tak' : item.value }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 3: Wyposażenie -->
                <section v-if="Object.keys(featureGroups).length" class="pg-section">
                    <h2 class="pg-section-title"><v-icon icon="mdi-check-all" size="17" />Wyposażenie <span class="eq-total-badge">{{ advert?.features?.length ?? 0 }}</span></h2>
                    <div v-for="(group, cat) in featureGroups" :key="cat" class="eq-group">
                        <div class="eq-cat-label">
                            <v-icon :icon="featureGroupIcon(String(cat))" size="13" class="eq-cat-icon" />
                            {{ cat }}
                        </div>
                        <div class="eq-chip-grid">
                            <span v-for="f in group" :key="f.id" class="eq-chip">
                                <v-icon icon="mdi-check" size="11" class="eq-chip-icon" />{{ f.name }}
                            </span>
                        </div>
                    </div>
                </section>

                <!-- SECTION 4: Historia pojazdu -->
                <section v-if="hasHistoryData" class="pg-section">
                    <h2 class="pg-section-title"><v-icon icon="mdi-history" size="17" />Historia pojazdu</h2>
                    <div class="tab-content">
                        <div v-if="advert?.vin" class="hist-vin-block">
                            <v-icon icon="mdi-barcode-scan" size="16" class="hv-icon" />
                            <div><div class="hv-label">Numer VIN</div><div class="hv-val">{{ advert.vin }}</div></div>
                            <span class="hv-verified"><v-icon icon="mdi-check-circle" size="13" />Zidentyfikowany</span>
                        </div>
                        <!-- Structured history data -->
                        <div class="hist-items-grid">
                            <div v-if="advert?.firstRegistrationDate" class="hist-item hi-info">
                                <v-icon icon="mdi-calendar-check-outline" size="18" class="hi-icon" />
                                <div class="hi-body"><div class="hi-label">Pierwsza rejestracja</div><div class="hi-value">{{ advert.firstRegistrationDate }}</div></div>
                            </div>
                            <div v-if="advert?.ownersCount !== undefined && advert?.ownersCount !== null" class="hist-item hi-info">
                                <v-icon icon="mdi-account-multiple-outline" size="18" class="hi-icon" />
                                <div class="hi-body"><div class="hi-label">Liczba właścicieli</div><div class="hi-value">{{ advert.ownersCount }}</div></div>
                            </div>
                            <div v-if="advert?.registrationCountry && advert.registrationCountry !== 'PL'" class="hist-item hi-info">
                                <v-icon icon="mdi-flag-outline" size="18" class="hi-icon" />
                                <div class="hi-body"><div class="hi-label">Kraj rejestracji</div><div class="hi-value">{{ advert.registrationCountry }}</div></div>
                            </div>
                            <div v-if="advert?.isImported" class="hist-item hi-info">
                                <v-icon icon="mdi-earth" size="18" class="hi-icon" />
                                <div class="hi-body"><div class="hi-label">Pojazd z importu</div><div v-if="advert.importCountry" class="hi-value">{{ advert.importCountry }}</div></div>
                            </div>
                            <div v-if="advert?.hasServiceBook" class="hist-item hi-ok">
                                <v-icon icon="mdi-book-check-outline" size="18" class="hi-icon" />
                                <div class="hi-body"><div class="hi-label">Książka serwisowa</div></div>
                            </div>
                            <div v-if="advert?.hasFullServiceHistory" class="hist-item hi-ok">
                                <v-icon icon="mdi-check-decagram-outline" size="18" class="hi-icon" />
                                <div class="hi-body"><div class="hi-label">Pełna historia serwisowa ASO</div></div>
                            </div>
                            <div v-if="advert?.nextInspection" class="hist-item hi-info">
                                <v-icon icon="mdi-wrench-clock" size="18" class="hi-icon" />
                                <div class="hi-body"><div class="hi-label">Następny przegląd</div><div class="hi-value">{{ advert.nextInspection }}</div></div>
                            </div>
                            <div v-if="advert?.hasDamage" class="hist-item hi-warn">
                                <v-icon icon="mdi-alert-outline" size="18" class="hi-icon" />
                                <div class="hi-body"><div class="hi-label">Pojazd po szkodzie</div><div v-if="advert.damageDescription" class="hi-value">{{ advert.damageDescription }}</div></div>
                            </div>
                            <div v-if="advert?.hasDamage === false" class="hist-item hi-ok">
                                <v-icon icon="mdi-shield-check-outline" size="18" class="hi-icon" />
                                <div class="hi-body"><div class="hi-label">Bezwypadkowy</div></div>
                            </div>
                            <div v-if="advert?.hasWarranty" class="hist-item hi-ok">
                                <v-icon icon="mdi-certificate-outline" size="18" class="hi-icon" />
                                <div class="hi-body"><div class="hi-label">Gwarancja aktywna</div><div v-if="advert.warrantyUntil" class="hi-value">do {{ advert.warrantyUntil }}</div></div>
                            </div>
                            <!-- Legacy parsed history from description text -->
                            <div v-for="item in parsedHistory" :key="item.label" class="hist-item" :class="{ 'hi-ok': item.isCheck, 'hi-warn': item.isWarning, 'hi-info': !item.isCheck && !item.isWarning }">
                                <v-icon :icon="item.isWarning ? 'mdi-alert-outline' : item.isCheck ? 'mdi-check-circle-outline' : 'mdi-information-outline'" size="18" class="hi-icon" />
                                <div class="hi-body"><div class="hi-label">{{ item.label }}</div><div v-if="item.value" class="hi-value">{{ item.value }}</div></div>
                            </div>
                        </div>
                        <!-- VIN Report external links -->
                        <div class="vin-report-section">
                            <div class="vrs-title"><v-icon icon="mdi-shield-search" size="15" />Sprawdź historię pojazdu</div>
                            <p class="vrs-desc">Zamów raport VIN aby poznać pełną historię pojazdu, kolizje, przebieg z serwisów i więcej.</p>
                            <div class="vrs-btns">
                                <a href="https://autodna.pl" target="_blank" rel="noopener noreferrer" class="vrs-btn">
                                    <v-icon icon="mdi-file-search-outline" size="15" /> AutoDNA
                                </a>
                                <a href="https://www.carvertical.com/pl" target="_blank" rel="noopener noreferrer" class="vrs-btn">
                                    <v-icon icon="mdi-car-search-outline" size="15" /> carVertical
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 6: Opinie o sprzedawcy -->
                <section class="pg-section" id="reviews-section">
                    <h2 class="pg-section-title"><v-icon icon="mdi-star-outline" size="17" />Opinie o sprzedawcy</h2>
                    <div class="tab-content">
                        <div v-if="reviewsLoading" class="loading-center"><v-icon icon="mdi-loading" size="26" class="spin" /></div>
                        <template v-else>
                            <div v-if="sellerReviews.length" class="reviews-list">
                                <div v-for="r in sellerReviews" :key="r.id" class="review-card">
                                    <div class="review-header">
                                        <div class="rev-avatar">{{ r.buyerName?.[0] ?? '?' }}</div>
                                        <div class="rev-info"><div class="rev-name">{{ r.buyerName }}</div><div class="rev-date">{{ new Date(r.createdAt).toLocaleDateString('pl-PL') }}</div></div>
                                        <div class="rev-stars"><v-icon v-for="n in 5" :key="n" :icon="n <= r.rating ? 'mdi-star' : 'mdi-star-outline'" size="15" class="star-icon" /></div>
                                    </div>
                                    <p class="rev-text">{{ r.content }}</p>
                                </div>
                            </div>
                            <p v-else class="empty-tab">Brak opinii o tym sprzedawcy.</p>
                            <div v-if="canLeaveReview && !reviewSuccess" class="review-form">
                                <div class="review-form-title">Wystaw opinię sprzedawcy</div>
                                <div class="rev-rating-row">
                                    <button v-for="n in 5" :key="n" class="rev-star-btn" @click="reviewRating = n">
                                        <v-icon :icon="n <= reviewRating ? 'mdi-star' : 'mdi-star-outline'" size="22" :class="n <= reviewRating ? 'star-active' : 'star-empty'" />
                                    </button>
                                    <span class="rev-rating-label">{{ reviewRating }}/5</span>
                                </div>
                                <textarea v-model="reviewContent" class="rev-textarea" placeholder="Opisz swoje doświadczenia ze sprzedawcą..." rows="4" />
                                <div v-if="reviewError" class="rev-error">{{ reviewError }}</div>
                                <button class="rev-submit-btn" :disabled="reviewSubmitting || !reviewContent.trim()" @click="doSubmitReview">
                                    <v-icon v-if="reviewSubmitting" icon="mdi-loading" size="15" class="spin" />
                                    <v-icon v-else icon="mdi-send-outline" size="15" />
                                    Wyślij opinię
                                </button>
                            </div>
                            <div v-else-if="reviewSuccess" class="review-success"><v-icon icon="mdi-check-circle-outline" size="18" />Dziękujemy za opinię!</div>
                        </template>
                    </div>
                </section>


                <!-- Similar section -->
                <div class="similar-section">
                    <div class="section-head">
                        <h2 class="section-heading">Podobne ogłoszenia</h2>
                        <NuxtLink to="/adverts" class="see-all-link-nuxt">Zobacz wszystkie</NuxtLink>
                    </div>
                    <div class="similar-grid">
                        <NuxtLink v-for="a in similar" :key="a.id" :to="`/advert/${a.id}`" class="sim-card">
                            <div class="sim-img-wrap">
                                <span v-if="a.isVerified" class="sim-verified">VERIFIED</span>
                                <img :src="getImageUrl(a.images?.find(i => i.isMain)?.url)" :alt="a.title" />
                                <button class="sim-fav" @click.prevent="toggleFavorite(a.id)"><v-icon :icon="isFavorite(a.id) ? 'mdi-heart' : 'mdi-heart-outline'" size="17" /></button>
                            </div>
                            <div class="sim-body">
                                <div class="sim-title">{{ a.brand?.name }} {{ a.model?.name }}</div>
                                <div class="sim-meta">{{ a.year }} • {{ Number(a.mileage).toLocaleString('pl') }} km</div>
                                <div class="sim-price">{{ Number(a.price).toLocaleString('pl') }} zł</div>
                            </div>
                        </NuxtLink>
                    </div>
                </div>

            </div>

            <!-- Right sidebar -->
            <aside class="main-right">

                <div class="sidebar-card">
                    <div class="card-title">Sprzedający</div>
                    <div class="seller-info">
                        <div class="seller-avatar" :style="{ background: sellerAvatarColor }"><span>{{ sellerInitials }}</span></div>
                        <div class="seller-details">
                            <div class="seller-name">{{ sellerDisplayName }}<v-icon v-if="seller?.accountType === 'Business'" icon="mdi-check-decagram" size="14" class="dealer-badge" /></div>
                            <div class="seller-role">
                                <span class="role-badge" :class="seller?.accountType === 'Business' ? 'role-dealer' : 'role-private'">
                                    <v-icon :icon="seller?.accountType === 'Business' ? 'mdi-domain' : 'mdi-account-outline'" size="11" />
                                    {{ seller?.accountType === 'Business' ? 'Dealer / Firma' : 'Sprzedawca prywatny' }}
                                </span>
                            </div>
                            <div v-if="sellerStats?.averageRating" class="seller-stars">
                                <v-icon v-for="n in 5" :key="n" :icon="n <= Math.round(sellerStats.averageRating) ? 'mdi-star' : 'mdi-star-outline'" size="13" class="star" />
                                <span class="seller-rating">{{ sellerStats.averageRating.toFixed(1) }}</span>
                                <span class="seller-reviews">({{ sellerStats.reviewCount }})</span>
                            </div>
                            <div class="seller-meta-row">
                                <span v-if="seller?.createdAt && new Date(seller.createdAt).getFullYear() >= 2020" class="seller-meta-item">
                                    <v-icon icon="mdi-calendar-outline" size="12" />
                                    na CARIZO od {{ new Date(seller.createdAt).getFullYear() }} r.
                                </span>
                            </div>
                        </div>
                    </div>
                    <div v-if="sellerStats" class="seller-stats">
                        <div class="ss-item"><div class="ss-val">{{ sellerStats.activeAdverts ?? 0 }}</div><div class="ss-label">Aktywnych</div></div>
                        <div class="ss-item"><div class="ss-val">{{ sellerStats.totalSold ?? 0 }}</div><div class="ss-label">Sprzedanych</div></div>
                        <div class="ss-item"><div class="ss-val">{{ sellerStats.reviewCount ?? 0 }}</div><div class="ss-label">Opinii</div></div>
                    </div>
                    <button class="follow-seller-btn w-full" :class="{ following: isFollowingSeller }" @click="toggleFollowSeller">
                        <v-icon :icon="isFollowingSeller ? 'mdi-bell' : 'mdi-bell-outline'" size="15" />
                        {{ isFollowingSeller ? 'Obserwujesz' : 'Obserwuj sprzedawcę' }}
                    </button>
                    <transition name="fade-msg"><div v-if="followError" class="tx-error"><v-icon icon="mdi-alert-circle-outline" size="14" />{{ followError }}</div></transition>
                    <NuxtLink v-if="advert?.userId" :to="`/seller/${advert.userId}`" class="outline-btn w-full">
                        <v-icon icon="mdi-car-multiple" size="15" />Wszystkie ogłoszenia
                        <span v-if="sellerStats?.activeAdverts" class="btn-count">{{ sellerStats.activeAdverts }}</span>
                    </NuxtLink>
                    <NuxtLink v-if="advert?.userId" :to="`/seller/${advert.userId}`" class="outline-btn w-full outline-btn--dim">
                        <v-icon icon="mdi-account-outline" size="15" />Profil sprzedawcy
                    </NuxtLink>
                </div>

                <div class="sidebar-card">
                    <div class="card-title"><v-icon icon="mdi-map-marker-outline" size="15" class="card-title-icon" />Lokalizacja</div>
                    <div v-if="advert?.city" class="location-addr"><v-icon icon="mdi-map-marker" size="16" class="loc-pin" /><span class="loc-city">{{ advert.city }}<template v-if="advert?.region">, {{ advert.region }}</template></span></div>
                    <div class="map-wrap">
                        <iframe v-if="mapSrc" :src="mapSrc" class="map-iframe" frameborder="0" loading="lazy" allowfullscreen />
                        <div v-else class="map-fallback">
                            <v-icon icon="mdi-map-marker" size="22" class="map-fallback-pin" />
                            <span class="map-fallback-city">{{ advert?.city ?? 'Brak lokalizacji' }}<template v-if="advert?.region">, {{ advert.region }}</template></span>
                            <span class="map-fallback-sub">Dokładna lokalizacja ustalana indywidualnie</span>
                        </div>
                    </div>
                    <a v-if="advert?.city" :href="`https://www.google.com/maps/search/${encodeURIComponent((advert.city) + ', Polska')}`" target="_blank" rel="noopener noreferrer" class="outline-btn w-full">
                        <v-icon icon="mdi-open-in-new" size="15" />Otwórz w Google Maps
                    </a>
                </div>


                <div class="sidebar-report-row">
                    <button class="report-advert-btn" @click="handleReport"><v-icon icon="mdi-flag-outline" size="13" />Zgłoś ogłoszenie</button>
                </div>

            </aside>
        </div>

    </div>

    <!-- Lightbox -->
    <Teleport to="body">
        <transition name="fade">
            <div v-if="lightboxOpen" class="lightbox-backdrop" @click.self="lightboxOpen = false">
                <button class="lb-close" aria-label="Zamknij galerię" @click="lightboxOpen = false"><v-icon icon="mdi-close" size="22" /></button>
                <button class="lb-arrow lb-prev" aria-label="Poprzednie zdjęcie" :disabled="lightboxIdx === 0" @click="lightboxIdx--"><v-icon icon="mdi-chevron-left" size="30" /></button>
                <div class="lb-img-wrap"><img :src="allImages[lightboxIdx]?.url ?? placeholder" :alt="`${advert?.title ?? 'Zdjęcie'} ${lightboxIdx + 1} / ${allImages.length}`" class="lb-img" /></div>
                <button class="lb-arrow lb-next" aria-label="Następne zdjęcie" :disabled="lightboxIdx === allImages.length - 1" @click="lightboxIdx++"><v-icon icon="mdi-chevron-right" size="30" /></button>
                <div class="lb-counter">{{ lightboxIdx + 1 }} / {{ allImages.length }}</div>
                <div class="lb-thumbs">
                    <div v-for="(img, i) in allImages" :key="i" class="lb-thumb" :class="{ 'lb-thumb-active': i === lightboxIdx }" @click="lightboxIdx = i"><img :src="img.url" :alt="`Miniatura ${i + 1}`" /></div>
                </div>
            </div>
        </transition>
    </Teleport>

    <ReportModal v-model="reportOpen" target-type="Advert" :target-id="id" />

    <!-- Compose message modal -->
    <Teleport to="body">
        <transition name="fade">
            <div v-if="composeOpen" class="compose-backdrop" @click.self="composeOpen = false">
                <div class="compose-modal">
                    <div class="compose-header">
                        <div class="compose-to">
                            <v-icon icon="mdi-message-text-outline" size="18" />
                            <span>Wiadomość do <strong>{{ seller?.name }} {{ seller?.surname }}</strong></span>
                        </div>
                        <button class="compose-close" @click="composeOpen = false">
                            <v-icon icon="mdi-close" size="20" />
                        </button>
                    </div>
                    <div class="compose-advert-ref">{{ advert?.title }}</div>
                    <div class="compose-suggestions">
                        <button
                            v-for="s in messageSuggestions"
                            :key="s"
                            class="compose-chip"
                            :class="{ active: composeDraft === s }"
                            @click="composeDraft = s"
                        >{{ s }}</button>
                    </div>
                    <textarea
                        ref="composeRef"
                        v-model="composeDraft"
                        class="compose-textarea"
                        placeholder="Napisz wiadomość..."
                        rows="3"
                    />
                    <div v-if="contactError" class="compose-error">
                        <v-icon icon="mdi-alert-circle-outline" size="14" />{{ contactError }}
                    </div>
                    <button class="compose-send" :disabled="contactLoading || !composeDraft.trim()" @click="sendComposeMessage">
                        <v-icon v-if="contactLoading" icon="mdi-loading" size="17" class="spin" />
                        <v-icon v-else icon="mdi-send" size="17" />
                        {{ contactLoading ? 'Wysyłanie...' : 'Wyślij wiadomość' }}
                    </button>
                </div>
            </div>
        </transition>
    </Teleport>

    <!-- Mobile sticky contact bar -->
    <Teleport to="body">
        <div v-if="seller" class="mobile-cta-bar">
            <button v-if="seller?.phoneNumber" class="mcb-phone" @click="showPhone = !showPhone">
                <v-icon :icon="showPhone ? 'mdi-phone' : 'mdi-phone-outline'" size="18" />
                <span>{{ showPhone ? seller.phoneNumber : 'Zadzwoń' }}</span>
            </button>
            <button class="mcb-message" @click="contactSeller">
                <v-icon icon="mdi-message-text-outline" size="18" />
                <span>Napisz</span>
            </button>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import type { CarAdvert, Feature, PagedResult, UserProfile, UserStats, Review } from '~/types'

const route = useRoute()
const rawId = Number(route.params.id)
if (isNaN(rawId) || rawId <= 0) {
    throw createError({ statusCode: 404, statusMessage: 'Ogłoszenie nie istnieje' })
}
const id = rawId
const config = useRuntimeConfig()

const { shareNative, shareOnFacebook, shareOnX, shareOnWhatsApp, copyLink, copied: linkCopied } = useShare()
const shareOpen = ref(false)

function currentUrl(): string {
    if (import.meta.client) return window.location.href
    return `${config.public.siteUrl}/advert/${id}`
}
function doShareNative() {
    shareNative(currentUrl(), advert.value?.title ?? 'Ogłoszenie CARIZO')
    shareOpen.value = false
}
function doShareFacebook() { shareOnFacebook(currentUrl()); shareOpen.value = false }
function doShareX() { shareOnX(currentUrl(), advert.value?.title ?? 'Ogłoszenie CARIZO'); shareOpen.value = false }
function doShareWhatsApp() { shareOnWhatsApp(currentUrl(), advert.value?.title ?? 'Ogłoszenie CARIZO'); shareOpen.value = false }
async function doCopyLink() {
    await copyLink(currentUrl())
    shareOpen.value = false
}

const { isFavorite, toggleFavorite, fetchFavoriteIds, isLoggedIn } = useFavorites()
const { getImageUrl, placeholder } = useImageUrl()
const { startConversation } = useMessages()
const { createTransaction } = useTransactions()
const { followSeller, unfollowSeller, isFollowingSeller: checkFollowingSeller } = useFollow()
const { getSellerReviews, canReview, submitReview } = useReviews()

const currentUserId = ref<number | null>(null)
const isOwnAdvert = computed(() => isLoggedIn.value && currentUserId.value !== null && currentUserId.value === advert.value?.userId)

const contactLoading = ref(false)
const contactError = ref('')
const composeOpen = ref(false)
const composeDraft = ref('')
const composeRef = ref<HTMLTextAreaElement | null>(null)
const messageSuggestions = [
    'Czy auto jest jeszcze dostępne?',
    'Czy cena jest do negocjacji?',
    'Kiedy można obejrzeć pojazd?',
    'Czy auto ma pełną historię serwisową?',
    'Czy możliwa jest zamiana?',
]
const followError = ref('')
const advert = ref<CarAdvert | null>(null)
const similar = ref<CarAdvert[]>([])
const seller = ref<UserProfile | null>(null)
const sellerStats = ref<UserStats | null>(null)
const sellerReviews = ref<Review[]>([])
const reviewsLoading = ref(false)
const canLeaveReview = ref(false)
const reviewRating = ref(5)
const reviewContent = ref('')
const reviewSubmitting = ref(false)
const reviewError = ref('')
const reviewSuccess = ref(false)
const isFollowingSeller = ref(false)
const showPhone = ref(false)
const txLoading = ref<'reservation' | 'viewing' | null>(null)
const txSuccess = ref<string | null>(null)
const txError = ref<string | null>(null)

// Date/time pickers for viewing & reservation
const showViewingPicker = ref(false)
const viewingDate = ref('')
const viewingTime = ref('10:00')
const viewingNote = ref('')
const showReservationPicker = ref(false)
const reservationDate = ref('')
const reservationTime = ref('10:00')
const reservationNote = ref('')

const mainLayoutRef = ref<HTMLElement | null>(null)

const activeImg = ref(0)
const showFullDesc = ref(false)
const isFav = ref(false)
const reportOpen = ref(false)

const todayStr = computed(() => new Date().toISOString().slice(0, 10))

const advertAge = computed(() => {
    if (!advert.value?.createdAt) return ''
    const diff = Date.now() - new Date(advert.value.createdAt).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'dzisiaj'
    if (days === 1) return 'wczoraj'
    if (days < 7) return `${days} dni temu`
    if (days < 30) return `${Math.floor(days / 7)} tyg. temu`
    if (days < 365) return `${Math.floor(days / 30)} mies. temu`
    return `${Math.floor(days / 365)} lat temu`
})

const lightboxOpen = ref(false)
const lightboxIdx = ref(0)

function openLightbox(i: number) {
    lightboxIdx.value = i
    lightboxOpen.value = true
}

function onKeydown(e: KeyboardEvent) {
    if (!lightboxOpen.value) return
    if (e.key === 'Escape') lightboxOpen.value = false
    if (e.key === 'ArrowLeft' && lightboxIdx.value > 0) lightboxIdx.value--
    if (e.key === 'ArrowRight' && lightboxIdx.value < allImages.value.length - 1) lightboxIdx.value++
}

// ── Parse structured description sections ─────────────────────────────────────
const parsedTechData = computed(() => {
    const desc = advert.value?.description ?? ''
    const match = desc.match(/📋 Dane techniczne:\n([\s\S]*?)(?=\n\n[^\s]|$)/)
    if (!match) return []
    return match[1].trim().split('\n').filter(Boolean).map(line => {
        const isCheck = line.startsWith('✓')
        const clean = line.replace(/^✓ /, '')
        const colonIdx = clean.indexOf(': ')
        if (colonIdx === -1) return { label: clean, value: 'Tak', isCheck, isWarning: false }
        return { label: clean.slice(0, colonIdx), value: clean.slice(colonIdx + 2), isCheck, isWarning: false }
    })
})

const parsedHistory = computed(() => {
    const desc = advert.value?.description ?? ''
    const match = desc.match(/🔍 Historia pojazdu:\n([\s\S]*?)(?=\n\n[^\s]|$)/)
    if (!match) return []
    return match[1].trim().split('\n').filter(Boolean).map(line => {
        const isCheck = line.startsWith('✓')
        const isWarning = line.startsWith('⚠')
        const clean = line.replace(/^[✓⚠] /, '')
        const colonIdx = clean.indexOf(': ')
        if (colonIdx === -1) return { label: clean, value: '', isCheck, isWarning }
        return { label: clean.slice(0, colonIdx), value: clean.slice(colonIdx + 2), isCheck, isWarning }
    })
})

const hasHistoryData = computed(() => {
    const a = advert.value
    if (!a) return false
    return !!(a.vin || a.firstRegistrationDate || a.ownersCount !== undefined ||
              a.isImported || a.hasServiceBook || a.hasFullServiceHistory ||
              a.hasDamage !== undefined || a.hasWarranty || a.nextInspection ||
              parsedHistory.value.length)
})

const parsedUserDesc = computed(() => {
    let desc = advert.value?.description ?? ''
    desc = desc.replace(/Producent:.*\n?/g, '').replace(/Model:.*\n?/g, '')
    desc = desc.replace(/📋 Dane techniczne:\n[\s\S]*?(?=\n\n[^\n]|\n*$)/g, '')
    desc = desc.replace(/🔍 Historia pojazdu:\n[\s\S]*?(?=\n\n[^\n]|\n*$)/g, '')
    desc = desc.replace(/Sprzedawca:.*\n?/g, '').replace(/💬.*\n?/g, '')
    return desc.trim()
})

const isNegotiable = computed(() =>
    !!(advert.value as any)?.isNegotiable ||
    (advert.value?.description?.includes('💬 Cena do negocjacji'))
)

const sellerTypeLabel = computed(() => {
    if (seller.value?.accountType === 'Business') return 'Dealer / Firma'
    if (advert.value?.description?.includes('Sprzedawca: Dealer')) return 'Dealer / Firma'
    return 'Sprzedawca prywatny'
})

// Seller display helpers
const sellerDisplayName = computed(() => {
    if (!seller.value) return 'Sprzedawca'
    if (seller.value.accountType === 'Business' && seller.value.companyName) return seller.value.companyName
    return `${seller.value.name} ${seller.value.surname}`.trim() || 'Sprzedawca'
})

const sellerInitials = computed(() => {
    const name = sellerDisplayName.value
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
})

const sellerAvatarColor = computed(() => {
    const colors = ['#8B0D1D', '#c0392b', '#922b21', '#7b241c', '#641e16']
    const name = sellerDisplayName.value
    let h = 0
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
    return colors[Math.abs(h) % colors.length]
})

// Map
const mapSrc = ref<string | null>(null)

async function initMap(city: string, region?: string) {
    try {
        const q = [city, region, 'Polska'].filter(Boolean).join(', ')
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, {
            headers: { 'Accept-Language': 'pl', 'User-Agent': 'Carizo/1.0 (carizo.eu)' }
        })
        const data = await res.json()
        if (data[0]) {
            const lat = parseFloat(data[0].lat)
            const lon = parseFloat(data[0].lon)
            const d = 0.04
            mapSrc.value = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d},${lat - d},${lon + d},${lat + d}&layer=mapnik&marker=${lat},${lon}`
        }
    } catch {}
}

const scoreChecks = [
    'Zweryfikowany VIN',
    'Pełna historia pojazdu',
    'Wysokiej jakości zdjęcia',
    'Szybki czas odpowiedzi',
]

const hasImages = computed(() => !!advert.value?.images?.length)

const allImages = computed(() => {
    if (!advert.value?.images?.length) return [{ id: 0, url: placeholder, isMain: true }]
    return advert.value.images.map(img => ({ ...img, url: getImageUrl(img.url) }))
})

const mainImg = computed(() => allImages.value[activeImg.value]?.url ?? placeholder)

const featureGroups = computed(() => {
    if (!advert.value?.features?.length) return {}
    const g: Record<string, Feature[]> = {}
    for (const f of advert.value.features) {
        const cat = f.category?.name ?? 'Inne';
        (g[cat] ??= []).push(f)
    }
    return g
})

function featureGroupIcon(cat: string): string {
    const l = cat.toLowerCase()
    if (l.includes('bezpiecze')) return 'mdi-shield-check-outline'
    if (l.includes('komfort')) return 'mdi-seat-recline-extra'
    if (l.includes('multim') || l.includes('czno')) return 'mdi-monitor-speaker'
    if (l.includes('wietle') || l.includes('wiatl')) return 'mdi-car-light-high'
    if (l.includes('wspomagania') || l.includes('asyst')) return 'mdi-car-cruise-control'
    if (l.includes('tapicerka') || l.includes('wn')) return 'mdi-car-seat'
    if (l.includes('zewn')) return 'mdi-car-side'
    if (l.includes('napęd') || l.includes('naped') || l.includes('układ')) return 'mdi-car-traction-control'
    if (l.includes('ciężar') || l.includes('ciezar')) return 'mdi-truck-outline'
    if (l.includes('motocykl')) return 'mdi-motorbike'
    if (l.includes('dostawcze')) return 'mdi-van-utility'
    if (l.includes('przyczepa') || l.includes('naczepa')) return 'mdi-truck-trailer'
    if (l.includes('budowlan')) return 'mdi-crane'
    if (l.includes('rolnicze') || l.includes('rolnicza')) return 'mdi-tractor'
    if (l.includes('maszyn')) return 'mdi-cog-transfer-outline'
    return 'mdi-star-outline'
}

const advertPublishedDate = computed(() => {
    if (!advert.value?.createdAt) return '—'
    return new Date(advert.value.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
})

// Ad completeness score – visible to buyer as a trust signal
const completenessScore = computed(() => {
    const a = advert.value
    if (!a) return 0
    let s = 0
    if (a.brand) s += 10
    if (a.model) s += 8
    if (a.year) s += 7
    if (a.fuelType) s += 5
    if (a.mileage) s += 7
    if (a.gearbox) s += 4
    if (a.engineVersion || a.engineSize) s += 4
    const photos = a.images?.length ?? 0
    if (photos >= 10) s += 15
    else if (photos >= 5) s += 10
    else if (photos > 0) s += 5
    const descLen = a.description?.length ?? 0
    if (descLen >= 400) s += 15
    else if (descLen >= 100) s += 8
    const feats = a.features?.length ?? 0
    if (feats >= 5) s += 10
    if (a.vin) s += 5
    if (a.color) s += 3
    if (a.bodyType) s += 3
    if (a.driveType) s += 2
    if (a.powerHP || a.engineVersion?.horsepower) s += 2
    return Math.min(s, 100)
})

const completenessLabel = computed(() => {
    const s = completenessScore.value
    if (s >= 90) return 'Wyjątkowe'
    if (s >= 75) return 'Bardzo dobre'
    if (s >= 55) return 'Dobre'
    if (s >= 35) return 'Podstawowe'
    return 'Niekompletne'
})

const completenessColor = computed(() => {
    const s = completenessScore.value
    if (s >= 75) return '#4caf50'
    if (s >= 50) return '#e67e22'
    return '#8B0D1D'
})

const priceAnalysis = computed(() => {
    if (!advert.value?.price || similar.value.length < 2) return null
    const myPrice = Number(advert.value.price)
    if (!myPrice) return null
    const simPrices = similar.value
        .filter(a => a.id !== id && a.price)
        .map(a => Number(a.price))
        .filter(p => p > 0 && p < myPrice * 6 && p > myPrice * 0.15)
    if (simPrices.length < 2) return null
    const avg = simPrices.reduce((a, b) => a + b, 0) / simPrices.length
    const diff = (myPrice - avg) / avg
    if (diff < -0.15) return { label: 'Świetna cena', cls: 'pa-great', icon: 'mdi-trending-down', sub: `${Math.abs(Math.round(diff * 100))}% poniżej ceny rynkowej` }
    if (diff < -0.05) return { label: 'Dobra cena', cls: 'pa-good', icon: 'mdi-check-circle-outline', sub: `${Math.abs(Math.round(diff * 100))}% poniżej średniej` }
    if (diff <= 0.05) return { label: 'Cena rynkowa', cls: 'pa-avg', icon: 'mdi-minus-circle-outline', sub: 'Zgodna z rynkiem' }
    return { label: 'Powyżej średniej', cls: 'pa-high', icon: 'mdi-trending-up', sub: `${Math.round(diff * 100)}% powyżej średniej` }
})

function toggleFav() {
    if (!isLoggedIn.value) { navigateTo('/login'); return }
    isFav.value = !isFav.value
    toggleFavorite(id)
}

function handleReport() {
    if (!isLoggedIn.value) { navigateTo('/login'); return }
    reportOpen.value = true
}

function contactSeller() {
    if (!isLoggedIn.value) { navigateTo('/login'); return }
    contactError.value = ''
    composeDraft.value = ''
    composeOpen.value = true
    nextTick(() => composeRef.value?.focus())
}

async function sendComposeMessage() {
    if (!composeDraft.value.trim() || contactLoading.value) return
    contactLoading.value = true
    contactError.value = ''
    try {
        const conversationId = await startConversation(id, composeDraft.value.trim())
        if (!conversationId) throw new Error('Brak ID rozmowy w odpowiedzi.')
        composeOpen.value = false
        await navigateTo(`/messages/${conversationId}`)
    } catch (e: any) {
        contactError.value = e?.data?.message ?? e?.message ?? 'Nie udało się wysłać wiadomości.'
    } finally {
        contactLoading.value = false
    }
}

async function reserveCar() {
    if (!isLoggedIn.value) { await navigateTo('/login'); return }
    txLoading.value = 'reservation'
    txSuccess.value = null
    txError.value = null
    try {
        const scheduled = reservationDate.value
            ? new Date(`${reservationDate.value}T${reservationTime.value || '10:00'}`).toISOString()
            : undefined
        await createTransaction({ type: 'Reservation', advertId: id, scheduledAt: scheduled, notes: reservationNote.value || undefined })
        txSuccess.value = 'Auto zarezerwowane! Sprzedawca zostanie powiadomiony.'
        showReservationPicker.value = false
        reservationDate.value = ''
        reservationNote.value = ''
        setTimeout(() => txSuccess.value = null, 5000)
    } catch (e: any) {
        txError.value = e?.data?.message ?? 'Nie udało się zarezerwować auta.'
        setTimeout(() => txError.value = null, 4000)
    } finally { txLoading.value = null }
}

async function scheduleViewing() {
    if (!isLoggedIn.value) { await navigateTo('/login'); return }
    txLoading.value = 'viewing'
    txSuccess.value = null
    txError.value = null
    try {
        const scheduled = viewingDate.value
            ? new Date(`${viewingDate.value}T${viewingTime.value || '10:00'}`).toISOString()
            : undefined
        await createTransaction({ type: 'Viewing', advertId: id, scheduledAt: scheduled, notes: viewingNote.value || undefined })
        txSuccess.value = 'Prośba o oględziny wysłana! Sprzedawca skontaktuje się z Tobą.'
        showViewingPicker.value = false
        viewingDate.value = ''
        viewingNote.value = ''
        setTimeout(() => txSuccess.value = null, 5000)
    } catch (e: any) {
        txError.value = e?.data?.message ?? 'Nie udało się wysłać prośby o oględziny.'
        setTimeout(() => txError.value = null, 4000)
    } finally { txLoading.value = null }
}

async function toggleFollowSeller() {
    if (!isLoggedIn.value) { await navigateTo('/login'); return }
    if (!advert.value?.userId) return
    followError.value = ''
    try {
        if (isFollowingSeller.value) {
            await unfollowSeller(advert.value.userId)
            isFollowingSeller.value = false
        } else {
            await followSeller(advert.value.userId)
            isFollowingSeller.value = true
        }
    } catch (e: any) {
        followError.value = e?.data?.message ?? 'Nie udało się zaktualizować obserwowania.'
        setTimeout(() => { followError.value = '' }, 3000)
    }
}

// ── SEO / meta (computed at setup top-level so they work on SSR) ─────────────
const seoTitle = computed(() => {
    const a = advert.value
    if (!a) return 'CARIZO'
    const parts = [a.year, a.brand?.name, a.model?.name].filter(Boolean)
    return parts.join(' ') + ' – CARIZO'
})

const seoOgTitle = computed(() => {
    const a = advert.value
    if (!a) return 'CARIZO'
    return [a.year, a.brand?.name, a.model?.name].filter(Boolean).join(' ')
})

const seoDescription = computed(() => {
    const a = advert.value
    if (!a) return ''
    const rawDesc = a.description
        ? a.description.replace(/📋 Dane techniczne:[\s\S]*$/, '').replace(/🔍 Historia pojazdu:[\s\S]*$/, '').trim()
        : ''
    if (rawDesc.length > 0) return rawDesc.slice(0, 160)
    return [a.year, a.brand?.name, a.model?.name, a.fuelType?.name,
        a.mileage ? `${Number(a.mileage).toLocaleString('pl')} km` : '',
        a.price ? `${Number(a.price).toLocaleString('pl')} zł` : '',
    ].filter(Boolean).join(' · ').slice(0, 160)
})

const seoImage = computed(() => {
    const a = advert.value
    if (!a) return ''
    const imgUrl = a.images?.find(i => i.isMain)?.url ?? a.images?.[0]?.url ?? ''
    const imgPath = getImageUrl(imgUrl)
    if (!imgPath || imgPath === placeholder) return ''
    return imgPath.startsWith('http') ? imgPath : `${config.public.siteUrl}${imgPath}`
})
const seoUrl = computed(() => currentUrl())

useSeoMeta({
    title: seoTitle,
    description: seoDescription,
    ogType: 'website',
    ogUrl: seoUrl,
    ogTitle: seoOgTitle,
    ogDescription: seoDescription,
    ogImage: seoImage,
    ogImageWidth: '1200',
    ogImageHeight: '630',
    ogSiteName: 'CARIZO',
    twitterCard: 'summary_large_image',
    twitterTitle: seoOgTitle,
    twitterDescription: seoDescription,
    twitterImage: seoImage,
})

useHead({
    link: [{ rel: 'canonical', href: seoUrl }],
    script: [computed(() => {
        const a = advert.value
        if (!a) return { type: 'application/ld+json', innerHTML: '' }
        const schema: Record<string, any> = {
            '@context': 'https://schema.org',
            '@type': 'Car',
            name: a.title,
            description: a.description?.slice(0, 500) ?? '',
            url: seoUrl.value,
            image: (a.images ?? []).map((i: any) => getImageUrl(i.url)).filter(Boolean),
        }
        if (a.brand?.name) schema.brand = { '@type': 'Brand', name: a.brand.name }
        if (a.model?.name) schema.model = a.model.name
        if (a.year) schema.vehicleModelDate = String(a.year)
        if (a.mileage != null) schema.mileageFromOdometer = { '@type': 'QuantitativeValue', value: a.mileage, unitCode: 'KMT' }
        if (a.fuelType?.name) schema.fuelType = a.fuelType.name
        if (a.price != null) {
            schema.offers = {
                '@type': 'Offer',
                price: a.price,
                priceCurrency: 'PLN',
                availability: 'https://schema.org/InStock',
                url: seoUrl.value,
            }
        }
        return { type: 'application/ld+json', innerHTML: JSON.stringify(schema) }
    })]
})

async function doSubmitReview() {
    if (!advert.value?.userId || !reviewContent.value.trim()) return
    reviewSubmitting.value = true
    reviewError.value = ''
    try {
        const r = await submitReview({ sellerId: advert.value.userId, advertId: id, rating: reviewRating.value, content: reviewContent.value.trim() })
        sellerReviews.value.unshift(r)
        reviewSuccess.value = true
        reviewContent.value = ''
        canLeaveReview.value = false
    } catch (e: any) {
        reviewError.value = e?.data?.message ?? 'Nie udało się wysłać opinii.'
    } finally {
        reviewSubmitting.value = false
    }
}

// Touch swipe for gallery
const touchStartX = ref(0)
function onSwipe(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.value
    if (Math.abs(dx) < 40) return
    if (dx < 0 && activeImg.value < allImages.value.length - 1) activeImg.value++
    else if (dx > 0 && activeImg.value > 0) activeImg.value--
}

// Recently viewed tracking
const { track: trackRecentlyViewed } = useRecentlyViewed()

// PDF + QR
const qrDataUrl = ref('')
const pdfLoading = ref(false)

async function generateQR() {
    if (!import.meta.client || qrDataUrl.value) return
    const QRCode = (await import('qrcode')).default
    qrDataUrl.value = await QRCode.toDataURL(window.location.href, { width: 160, margin: 1, color: { dark: '#ffffff', light: '#00000000' } })
}

async function downloadPDF() {
    if (!advert.value) return
    pdfLoading.value = true
    try {
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const a = advert.value
        const w = doc.internal.pageSize.getWidth()

        doc.setFillColor(139, 13, 29)
        doc.rect(0, 0, w, 18, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(14); doc.setFont('helvetica', 'bold')
        doc.text('CARIZO', 14, 12)
        doc.setFontSize(9); doc.setFont('helvetica', 'normal')
        doc.text('carizo.eu', w - 14, 12, { align: 'right' })

        doc.setTextColor(20, 20, 20)
        doc.setFontSize(16); doc.setFont('helvetica', 'bold')
        doc.text(a.title, 14, 30)

        doc.setFontSize(20); doc.setTextColor(139, 13, 29)
        doc.text(`${Number(a.price).toLocaleString('pl')} zł`, 14, 42)

        doc.setFontSize(10); doc.setTextColor(80, 80, 80); doc.setFont('helvetica', 'normal')
        const specs = [
            ['Rok', String(a.year ?? '—')],
            ['Przebieg', a.mileage ? `${Number(a.mileage).toLocaleString('pl')} km` : '—'],
            ['Paliwo', a.fuelType?.name ?? '—'],
            ['Skrzynia biegów', a.gearbox?.name ?? '—'],
            ['Moc', a.engineVersion?.horsepower ? `${a.engineVersion.horsepower} KM` : '—'],
            ['Marka / Model', `${a.brand?.name ?? ''} ${a.model?.name ?? ''}`],
            ['Lokalizacja', a.city ?? '—'],
        ]
        let y = 56
        specs.forEach(([label, val]) => {
            doc.setFont('helvetica', 'bold'); doc.setTextColor(40, 40, 40)
            doc.text(label + ':', 14, y)
            doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80)
            doc.text(val, 65, y)
            y += 8
        })

        if (a.description) {
            y += 4
            doc.setFont('helvetica', 'bold'); doc.setTextColor(40, 40, 40)
            doc.text('Opis:', 14, y); y += 6
            doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80)
            const lines = doc.splitTextToSize(a.description.slice(0, 800), w - 28)
            doc.text(lines, 14, y)
        }

        doc.setFontSize(8); doc.setTextColor(160, 160, 160)
        doc.text(`Wygenerowano: ${new Date().toLocaleDateString('pl-PL')} | carizo.eu/advert/${a.id}`, 14, 285)

        doc.save(`CARIZO-${a.id}-${(a.brand?.name ?? 'auto').replace(/\s/g, '-')}.pdf`)
    } finally { pdfLoading.value = false }
}

// SSR-safe data fetching
const { data: advertData } = await useAsyncData(`advert-${id}`, async () => {
    try {
        const a = await $fetch<CarAdvert>(`/api/proxy/api/listings/${id}`)
        if (!a) return null
        const uid = a.userId
        let s: UserProfile | null = null
        let stats: UserStats | null = null
        if (uid && uid > 0) {
            ;[s, stats] = await Promise.all([
                $fetch<UserProfile>(`/api/proxy/api/User/${uid}/public`).catch(() =>
                    $fetch<UserProfile>(`/api/proxy/api/User/${uid}`).catch(() => null)
                ),
                $fetch<UserStats>(`/api/proxy/api/User/${uid}/stats`).catch(() => null),
            ])
        }
        return { advert: a, seller: s, sellerStats: stats }
    } catch { return null }
})

advert.value = advertData.value?.advert ?? null
seller.value = advertData.value?.seller ?? null
sellerStats.value = advertData.value?.sellerStats ?? null

onMounted(async () => {
    window.addEventListener('keydown', onKeydown)
    await fetchFavoriteIds()
    if (isLoggedIn.value) {
        try {
            const me = await $fetch<{ id: number }>('/api/proxy/api/User/me')
            currentUserId.value = me.id
        } catch {}
    }
    if (advert.value) {
        trackRecentlyViewed(Number(id))
        // Track view
        $fetch(`/api/proxy/api/listings/${id}/view`, { method: 'POST' }).catch(() => {})
        isFav.value = isFavorite(id)
        if (advert.value.city) initMap(advert.value.city, advert.value.region ?? undefined)
    }
    const uid = seller.value?.id ?? advert.value?.userId
    if (uid && uid > 0 && isLoggedIn.value) {
        isFollowingSeller.value = await checkFollowingSeller(uid).catch(() => false)
    }
    try {
        const a = advert.value
        if (a) {
            const body: Record<string, unknown> = { page: 1, pageSize: 12 }
            if (a.brand?.id) body.brandId = a.brand.id
            if (a.categoryId) body.categoryId = a.categoryId
            else if (a.category?.id) body.categoryId = a.category.id
            if (a.bodyType?.id) body.bodyTypeId = a.bodyType.id
            if (a.price) {
                const p = Number(a.price)
                body.priceFrom = Math.round(p * 0.4)
                body.priceTo   = Math.round(p * 2.5)
            }
            const r = await $fetch<PagedResult<CarAdvert>>('/api/proxy/api/listings/search', { method: 'POST', body })
            similar.value = (r?.items ?? []).filter(x => x.id !== id).slice(0, 6)
        }
    } catch { }
    // Load reviews
    if (advert.value?.userId) {
        reviewsLoading.value = true
        try {
            const [r, ok] = await Promise.all([
                getSellerReviews(advert.value.userId),
                isLoggedIn.value ? canReview(advert.value.userId) : Promise.resolve(false),
            ])
            sellerReviews.value = r.items
            canLeaveReview.value = ok
        } catch {} finally { reviewsLoading.value = false }
    }
})

onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
})
</script>

<style lang="scss" scoped>
.advert-page {
    background: $bg;
    min-height: 100vh;
    padding-top: $nav-height;

    @include respond-to(md) {
        padding-bottom: $mobile-cta-height;
    }
}

// ── Topbar ────────────────────────────────────────────────────────────────────
.advert-topbar {
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid $border;
    position: sticky;
    top: $nav-height;
    z-index: 50;
}

.topbar-inner {
    @include container;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.topbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.back-link {
    display: flex;
    align-items: center;
    gap: 4px;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    flex-shrink: 0;
    transition: color 0.2s;
    &:hover { color: $text; }
}

.topbar-crumbs {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    @include respond-to(sm) { display: none; }
}

.crumb {
    font-size: 12px;
    color: $text-dim;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
}
.crumb-sep { color: $text-faint; }
.crumb-active { color: $text-muted; }

.topbar-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.icon-action {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: none;
    color: $text-muted;
    font-size: 12px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: $r-sm;
    transition: color 0.2s, background 0.2s;
    &:hover { color: $text; background: rgba(255,255,255,0.05); }
    .heart-active { color: $red; }
}

.ia-label {
    @include respond-to(md) { display: none; }
}

.share-wrap { position: relative; }

.share-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: #111;
    border: 1px solid $border;
    border-radius: $r-md;
    overflow: hidden;
    min-width: 170px;
    z-index: 200;
    box-shadow: 0 12px 40px rgba(0,0,0,0.7);
}

.share-opt {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    background: transparent;
    border: none;
    color: $text-muted;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 10px 14px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, color 0.15s;
    &:hover { background: rgba(255,255,255,0.05); color: $text; }
}

.qr-wrap {
    position: relative;
    &:hover .qr-popup { opacity: 1; pointer-events: auto; transform: translateY(0); }
}

.qr-popup {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: #111;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 100;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-6px);
    transition: opacity 0.2s, transform 0.2s;
    white-space: nowrap;
    img { border-radius: 8px; }
    span { font-size: 11px; color: $text-dark; }
}

// ── Hero section ──────────────────────────────────────────────────────────────
.hero-section {
    background: #050505;
    border-bottom: 1px solid $border;
    padding: 24px 0 20px;

    @include respond-to(md) {
        padding: 0;
        border-bottom: none;
    }
}

.container { @include container; }

.hero-inner {
    display: grid;
    grid-template-columns: 58% 42%;
    gap: 28px;
    align-items: start;

    @include respond-to(md) {
        grid-template-columns: 1fr;
        gap: 0;
    }
}

// Gallery col
.gallery-col { min-width: 0; }

.main-photo-wrap {
    position: relative;
    border-radius: $r-lg;
    overflow: hidden;
    background: #0a0a0a;
    cursor: pointer;
    aspect-ratio: 16/10;

    &:hover .photo-overlay { opacity: 1; }

    @include respond-to(md) {
        border-radius: 0;
        aspect-ratio: unset;
        height: 66vw;
        max-height: 70vh;
        min-height: 240px;
    }
}

.main-photo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.35s ease;

    .main-photo-wrap:hover & { transform: scale(1.02); }
}

.photo-badges {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 5;
    display: flex;
    gap: 6px;
}

.badge-verified {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #2d7a3a;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 5px;
    letter-spacing: 0.5px;
}

.badge-hero {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 5px;
    letter-spacing: 0.5px;
    &--premium { background: linear-gradient(135deg, #8B0D1D, #c0392b); color: #fff; }
    &--top { background: #e67e22; color: #fff; }
    &--featured { background: #2980b9; color: #fff; }
    &--dealer { background: #555; color: #fff; }
}

.photo-bottom-bar {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
    padding: 20px 14px 12px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    opacity: 1;
    pointer-events: none;

    .photo-expand-btn { pointer-events: auto; }
}

.photo-count-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    color: $text-muted;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.1);
}

.photo-expand-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 11px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 4px 10px;
    cursor: pointer;
    transition: color 0.2s;
    &:hover { color: $text; }
}

.photo-fav-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.1);
    color: $text-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
    z-index: 5;
    &:hover { background: rgba(0,0,0,0.9); }
    &.active { color: $red; }
}

.photo-thumbs-row {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    @include respond-to(md) {
        padding: 0 16px;
        margin-top: 10px;
    }
}

.photo-thumb {
    position: relative;
    flex-shrink: 0;
    width: 72px;
    height: 52px;
    border-radius: 6px;
    overflow: hidden;
    border: 2px solid transparent;
    background: #111;
    cursor: pointer;
    transition: border-color 0.2s;
    padding: 0;

    img { width: 100%; height: 100%; object-fit: cover; display: block; }

    &.thumb-active { border-color: $red; }
    &:not(.thumb-active):hover { border-color: rgba($red, 0.5); }
}

.thumb-more {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: $text;
}

// Info col
.info-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;

    @include respond-to(md) {
        padding: 20px 16px 16px;
        border-bottom: 1px solid $border;
        background: $bg;
    }
}

.info-brand-line {
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-brand {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.info-gen {
    font-size: 11px;
    color: $text-dark;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: 4px;
    padding: 2px 6px;
}

.info-title {
    font-size: 28px;
    font-weight: 900;
    color: $text;
    line-height: 1.1;
    margin: 0;

    @include respond-to(sm) { font-size: 22px; }
}

.info-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.i-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    color: $text-muted;
    padding: 4px 10px;
    white-space: nowrap;

    .v-icon { color: $text-dim; }

    &--power {
        background: rgba($red, 0.08);
        border-color: rgba($red, 0.2);
        color: lighten($red, 20%);
        .v-icon { color: $red; }
    }
}

.i-chip-color-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.25);
    flex-shrink: 0;
}

.price-area { display: flex; flex-direction: column; gap: 6px; }

.price-big {
    font-size: 42px;
    font-weight: 900;
    color: $red;
    line-height: 1;
    letter-spacing: -1px;
    margin-bottom: 0;

    @include respond-to(sm) { font-size: 28px; }
}

.price-badges-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.nego-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(45, 122, 58, 0.15);
    border: 1px solid rgba(45, 122, 58, 0.3);
    color: #4caf50;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 20px;
}

.seller-type-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 20px;

    &.chip-dealer {
        background: rgba(41, 128, 185, 0.15);
        border: 1px solid rgba(41, 128, 185, 0.3);
        color: #5dade2;
    }
    &.chip-private {
        background: rgba(255,255,255,0.05);
        border: 1px solid $border;
        color: $text-dim;
    }
}

.price-analysis-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 20px;
    white-space: nowrap;

    .pab-sub {
        font-weight: 400;
        opacity: 0.75;
        font-size: 10px;
        margin-left: 2px;
    }

    &.pa-great {
        background: rgba(76, 175, 80, 0.15);
        border: 1px solid rgba(76, 175, 80, 0.35);
        color: #4caf50;
    }
    &.pa-good {
        background: rgba(139, 195, 74, 0.12);
        border: 1px solid rgba(139, 195, 74, 0.3);
        color: #8bc34a;
    }
    &.pa-avg {
        background: rgba(255, 152, 0, 0.1);
        border: 1px solid rgba(255, 152, 0, 0.25);
        color: #ff9800;
    }
    &.pa-high {
        background: rgba(244, 67, 54, 0.1);
        border: 1px solid rgba(244, 67, 54, 0.25);
        color: #ef5350;
    }
}

.finance-hint {
    font-size: 12px;
    color: $text-dim;
}

.finance-hint-link {
    background: transparent;
    border: none;
    color: $red;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 0;
    margin-left: 4px;
    &:hover { opacity: 0.8; }
}

.info-location-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: $text-dim;
    flex-wrap: wrap;
}

.loc-pin-sm { color: $text-dim; }

.views-pill, .time-pill {
    display: flex;
    align-items: center;
    gap: 3px;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: 20px;
    font-size: 11px;
    color: $text-dark;
    padding: 2px 7px;
}

.info-divider {
    height: 1px;
    background: $border;
    margin: 2px 0;
}

// Seller mini
.seller-mini {
    display: flex;
    align-items: center;
    gap: 10px;
}

.sma-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
}

.sma-info {
    flex: 1;
    min-width: 0;
}

.sma-name {
    font-size: 13px;
    font-weight: 600;
    color: $text;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sma-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
}

.sma-stars {
    display: flex;
    align-items: center;
    gap: 2px;
    .star { color: #f39c12; }
}

.sma-rating { font-size: 11px; color: $text-dim; margin-left: 2px; }
.sma-cnt { font-size: 11px; color: $text-dark; }

.sma-link {
    font-size: 12px;
    font-weight: 600;
    color: $red;
    flex-shrink: 0;
    &:hover { opacity: 0.8; }
}

// CTAs
.cta-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.cta-phone {
    width: 100%;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 13px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.cta-message {
    width: 100%;
    background: rgba(255,255,255,0.06);
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.2s, border-color 0.2s;
    &:hover { background: rgba(255,255,255,0.1); border-color: #333; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.own-advert-note {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    margin: 4px 0 0;
    line-height: 1.4;
}

.cta-row2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.cta-alt {
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 10px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.2s, color 0.2s;
    &:hover { background: rgba(255,255,255,0.08); color: $text; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// Date picker card
.date-picker-card {
    background: #0c0c0c;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.dpc-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    color: $text;
    .v-icon { color: $red; }
}

.dpc-row {
    display: flex;
    gap: 8px;
}

.dpc-input {
    flex: 1;
    background: #111;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 8px 10px;
    outline: none;
    &:focus { border-color: $red; }
    &::-webkit-calendar-picker-indicator { filter: invert(0.5); }
}

.dpc-time { max-width: 100px; }

.dpc-note {
    background: #111;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    padding: 8px 10px;
    outline: none;
    resize: none;
    &:focus { border-color: $red; }
    &::placeholder { color: $text-dark; }
}

.dpc-btns {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.dpc-cancel {
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-dim;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 7px 14px;
    cursor: pointer;
    &:hover { color: $text; }
}

.dpc-confirm {
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 7px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.secure-note-sm {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: $text-dark;
    margin-top: 2px;
}

.secure-icon-sm { color: #4caf50; }
.red-text { color: $red; }

// ── Specs bar ─────────────────────────────────────────────────────────────────
.specs-bar {
    background: #070707;
    border-bottom: 1px solid $border;
    padding: 0;
    overflow: hidden;
}

.specs-bar-inner {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
}

.spec-item {
    flex: 1;
    min-width: 90px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-right: 1px solid $border;

    &:last-child { border-right: none; }
    &--dim { opacity: 0.6; }
}

.spi-icon { color: $red; flex-shrink: 0; }
.spi-icon--dim { color: $text-dark; }
.spi-val { font-size: 14px; font-weight: 700; color: $text; white-space: nowrap; }
.spi-val--dim { color: $text-dim; }
.spi-lbl { font-size: 10px; color: $text-dark; margin-top: 2px; white-space: nowrap; }

// ── Main layout ───────────────────────────────────────────────────────────────
.main-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 28px;
    padding-top: 24px;
    padding-bottom: 60px;
    align-items: start;

    @include respond-to(md) {
        grid-template-columns: 1fr;
        padding-bottom: 90px;
    }
}

.main-left { min-width: 0; }

.main-right {
    position: sticky;
    top: calc(#{$nav-height} + 50px + 16px);
    display: flex;
    flex-direction: column;
    gap: 16px;

    @include respond-to(md) {
        position: static;
    }
}

// ── Tech chips ────────────────────────────────────────────────────────────────
.tech-chips-section {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 18px;
    margin-bottom: 20px;
}

.tcs-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 14px;
    .v-icon { color: $red; }
}

.tech-chips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 8px;
}

.tech-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 8px 12px;
    font-size: 12px;

    &.chip-bool { border-color: rgba(45,122,58,0.3); background: rgba(45,122,58,0.06); }
}

.tc-label { color: $text-dim; }
.tc-value { color: $text; font-weight: 600; }
.tc-check { color: #4caf50; display: flex; align-items: center; gap: 4px; }
.tc-check-icon { color: #4caf50; }

// ── Premium vertical scroll sections ─────────────────────────────────────────
.pg-section {
    margin-bottom: 28px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-lg;
    overflow: hidden;
}

.pg-section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    color: $text;
    padding: 18px 20px 14px;
    border-bottom: 1px solid $border;
    margin: 0;
    .v-icon { color: $red; }
}

.pg-section .spec-table {
    padding: 16px 20px;
}

.pg-section .spec-section-title {
    padding: 0;
    margin-bottom: 10px;
}

.pg-section .tab-content {
    padding: 16px 20px;
}

// ── Equipment collapsible groups ──────────────────────────────────────────────
.eq-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    color: $text;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 12px 20px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover { background: rgba(255,255,255,0.03); }

    .eq-group-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
    }
}

.pg-section .eq-grid {
    padding: 12px 20px 16px;
}

.pg-section .eq-item {
    color: $text-dim;

    .feat-icon { color: #4caf50; flex-shrink: 0; }
}

.eq-collapse-enter-active,
.eq-collapse-leave-active {
    transition: max-height 0.25s ease, opacity 0.25s;
    max-height: 600px;
    overflow: hidden;
}
.eq-collapse-enter-from,
.eq-collapse-leave-to {
    max-height: 0;
    opacity: 0;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
.tabs-wrap {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    overflow: hidden;
    margin-bottom: 20px;
}

.tabs-nav {
    display: flex;
    border-bottom: 1px solid $border;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
}

.tab-btn {
    flex-shrink: 0;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: $text-dim;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 14px 18px;
    cursor: pointer;
    transition: color 0.2s;
    margin-bottom: -1px;

    &:hover { color: $text; }
    &.tab-active { color: $text; border-bottom-color: $red; }
}

.tab-content {
    padding: 22px;

    @include respond-to(sm) { padding: 16px; }
}

// ── Description tab ───────────────────────────────────────────────────────────
.desc-body { margin-bottom: 20px; }

.desc-text {
    font-size: 14px;
    color: $text-muted;
    line-height: 1.8;
    white-space: pre-wrap;
    margin: 0;

    &.clamped {
        display: -webkit-box;
        -webkit-line-clamp: 8;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
}

.desc-toggle { margin-top: 12px; }

.read-more-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: none;
    color: $red;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 0;
}

.desc-tech-inline {
    margin-top: 22px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 16px;
}

.dti-title {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
}

.dti-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
}

.dti-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 8px 10px;
    background: #111;
    border-radius: 6px;
}

.dti-label { font-size: 11px; color: $text-dark; }
.dti-value {
    font-size: 13px;
    font-weight: 600;
    color: $text;
    display: flex;
    align-items: center;
    gap: 4px;
}
.dti-check { color: #4caf50; }

.features-section { margin-top: 22px; }

.feat-section-title {
    font-size: 12px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
}

.feat-cols {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
}

.feat-row {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: $text-muted;
}

.feat-icon { color: #4caf50; flex-shrink: 0; }

// ── Spec table ────────────────────────────────────────────────────────────────
.spec-table { display: flex; flex-direction: column; gap: 20px; }

.spec-section { }

.spec-section-title {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-bottom: 10px;
    border-bottom: 1px solid $border;
    margin-bottom: 8px;
}

.spec-rows { display: flex; flex-direction: column; }

.spec-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 9px 12px;
    border-radius: $r-sm;
    &:nth-child(odd) { background: rgba(255,255,255,0.02); }
}

.sr-label { font-size: 13px; color: $text-dim; }
.sr-val {
    font-size: 13px;
    font-weight: 600;
    color: $text;
    display: flex;
    align-items: center;
    gap: 5px;
    &--check { color: #4caf50; }
    &--warn { color: #e67e22; }
    &--color { display: flex; align-items: center; gap: 7px; }
    &--mono { font-family: 'Roboto Mono', monospace; font-size: 12px; letter-spacing: 0.05em; }
}
.sr-check-icon { color: #4caf50; }
.color-dot {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.2);
    flex-shrink: 0;
}

// ── Equipment tab ─────────────────────────────────────────────────────────────
.eq-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: $text-dim;
    background: rgba(255,255,255,0.025);
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 10px 14px;
    margin-bottom: 20px;

    strong { color: $text; }
}

.eq-sum-icon { color: $red; }

.eq-group { margin-bottom: 20px; }

.eq-total-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba($red, 0.12);
    color: lighten($red, 20%);
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    margin-left: 6px;
    letter-spacing: 0;
    vertical-align: middle;
}

.eq-cat-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: $text-dark;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 10px;
}

.eq-chip-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 4px;
}

.eq-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 12px;
    color: $text-muted;
    line-height: 1;
}

.eq-chip-icon {
    color: $red;
    flex-shrink: 0;
}

.eq-group-title {
    font-size: 12px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-bottom: 8px;
    border-bottom: 1px solid $border;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.eq-cat-icon { color: $red; flex-shrink: 0; }

.eq-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba($red, 0.12);
    color: lighten($red, 20%);
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    letter-spacing: 0;
}

.eq-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
}

.eq-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: $text-muted;
}

// ── History tab ───────────────────────────────────────────────────────────────
.hist-vin-block {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 14px;
    margin-bottom: 16px;
}

.hv-icon { color: $red; flex-shrink: 0; }
.hv-label { font-size: 11px; color: $text-dark; margin-bottom: 2px; }
.hv-val { font-size: 13px; font-weight: 700; color: $text; font-family: monospace; letter-spacing: 1px; }

.hv-verified {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    font-size: 11px;
    font-weight: 600;
    color: #4caf50;
    .v-icon { color: #4caf50; }
}

.hist-items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
}

.hist-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 14px;

    &.hi-ok { border-color: rgba(45,122,58,0.3); background: rgba(45,122,58,0.06); .hi-icon { color: #4caf50; } }
    &.hi-warn { border-color: rgba(230,126,34,0.3); background: rgba(230,126,34,0.06); .hi-icon { color: #e67e22; } }
    &.hi-info { border-color: $border; background: rgba(255,255,255,0.03); .hi-icon { color: $text-dim; } }
}

.hi-icon { flex-shrink: 0; margin-top: 1px; color: $text-dim; }
.hi-label { font-size: 13px; font-weight: 600; color: $text; }
.hi-value { font-size: 12px; color: $text-dim; margin-top: 3px; }

.vin-report-section {
    background: rgba($red, 0.06);
    border: 1px solid rgba($red, 0.2);
    border-radius: $r-md;
    padding: 16px;
    margin-top: 16px;
}

.vrs-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    color: $text;
    margin-bottom: 8px;
    .v-icon { color: $red; }
}

.vrs-desc {
    font-size: 12px;
    color: $text-dim;
    line-height: 1.5;
    margin: 0 0 12px;
}

.vrs-btns {
    display: flex;
    gap: 10px;
}

.vrs-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.06);
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 16px;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
    &:hover { background: rgba(255,255,255,0.1); color: $text; }
}

.empty-hist {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px 20px;
    gap: 12px;
}

.empty-hist-icon { color: $text-dark; }
.empty-hist-title { font-size: 16px; font-weight: 700; color: $text-muted; }
.empty-hist-sub { font-size: 13px; color: $text-dim; line-height: 1.5; max-width: 320px; }

.empty-hist-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.06);
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 9px 18px;
    cursor: pointer;
    margin-top: 4px;
    transition: background 0.2s;
    &:hover { background: rgba(255,255,255,0.1); }
}

// ── Financing tab ─────────────────────────────────────────────────────────────
.financing-tab { display: flex; flex-direction: column; gap: 20px; }

.fin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

.fin-price-display { }
.fin-price-big { font-size: 28px; font-weight: 900; color: $red; }
.fin-price-sub { font-size: 11px; color: $text-dark; margin-top: 2px; }

.fin-calc-body {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.calc-result-big {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    background: rgba($red, 0.08);
    border: 1px solid rgba($red, 0.2);
    border-radius: $r-sm;
    padding: 14px;
    margin-top: 4px;
}

.crb-label { display: block; font-size: 11px; color: $text-dark; margin-bottom: 4px; }
.crb-val { font-size: 20px; font-weight: 900; color: $red; display: block; }
.crb-val--sm { font-size: 16px; color: $text; }

.fin-inquiry-section {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 20px;
}

.fin-inquiry-title {
    font-size: 16px;
    font-weight: 700;
    color: $text;
    margin-bottom: 6px;
}

.fin-inquiry-desc { font-size: 13px; color: $text-dim; line-height: 1.5; margin: 0 0 16px; }

.fin-inquiry-form { display: flex; flex-direction: column; gap: 10px; }

.fin-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.fin-input {
    background: #111;
    border: 1px solid #2d2d2d;
    border-radius: $r-sm;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 10px 12px;
    outline: none;
    width: 100%;
    &:focus { border-color: $red; }
    &::placeholder { color: $text-dark; }
}

.fin-type-btns {
    display: flex;
    gap: 8px;
}

.fin-type-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-dim;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 10px;
    cursor: pointer;
    transition: all 0.2s;
    &.active { background: rgba($red, 0.1); border-color: rgba($red, 0.4); color: $text; }
    &:not(.active):hover { border-color: #333; color: $text; }
}

.fin-submit-btn {
    width: 100%;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// ── Reviews tab ───────────────────────────────────────────────────────────────
.reviews-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }

.review-card {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 16px;
}

.review-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
}

.rev-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: $red;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
}

.rev-info { flex: 1; }
.rev-name { font-size: 13px; font-weight: 600; color: $text; }
.rev-date { font-size: 11px; color: $text-dark; margin-top: 2px; }

.rev-stars { display: flex; gap: 2px; margin-left: auto; }
.star-icon { color: #f39c12; }

.rev-text { font-size: 13px; color: $text-muted; line-height: 1.6; margin: 0; }

.review-form {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
}

.review-form-title { font-size: 14px; font-weight: 700; color: $text; }

.rev-rating-row {
    display: flex;
    align-items: center;
    gap: 4px;
}

.rev-star-btn {
    background: transparent;
    border: none;
    padding: 2px;
    cursor: pointer;
}

.star-active { color: #f39c12; }
.star-empty { color: $text-dark; }
.rev-rating-label { font-size: 12px; color: $text-dim; margin-left: 8px; }

.rev-textarea {
    background: #111;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 10px 12px;
    resize: none;
    outline: none;
    &:focus { border-color: $red; }
    &::placeholder { color: $text-dark; }
}

.rev-error { font-size: 12px; color: #e74c3c; }

.rev-submit-btn {
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.review-success {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(45,122,58,0.1);
    border: 1px solid rgba(45,122,58,0.3);
    border-radius: $r-sm;
    padding: 12px 16px;
    font-size: 13px;
    color: #4caf50;
    font-weight: 600;
    margin-top: 14px;
    .v-icon { color: #4caf50; }
}

// ── Similar tab grid ──────────────────────────────────────────────────────────
.similar-tab-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
}

// ── Gallery section ───────────────────────────────────────────────────────────
.gallery-section {
    margin-bottom: 28px;
}

.section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

.section-heading {
    font-size: 16px;
    font-weight: 700;
    color: $text;
    margin: 0;
}

.see-all-link {
    background: transparent;
    border: none;
    color: $red;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    &:hover { opacity: 0.8; }
}

.see-all-link-nuxt {
    font-size: 13px;
    font-weight: 600;
    color: $red;
    &:hover { opacity: 0.8; }
}

.gallery-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto;
    gap: 8px;
}

.gallery-main {
    position: relative;
    border-radius: $r-md;
    overflow: hidden;
    cursor: pointer;
    background: #0a0a0a;

    img { width: 100%; height: 280px; object-fit: cover; display: block; transition: transform 0.3s; }
    &:hover img { transform: scale(1.03); }
}

.expand-btn {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: $r-sm;
    color: $text-muted;
    padding: 6px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: color 0.2s;
    &:hover { color: $text; }
}

.gallery-thumbs {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.gallery-thumb {
    position: relative;
    border-radius: $r-md;
    overflow: hidden;
    cursor: pointer;
    background: #0a0a0a;
    flex: 1;

    img { width: 100%; height: 88px; object-fit: cover; display: block; transition: transform 0.3s; }
    &:hover img { transform: scale(1.05); }
}

.thumb-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
    color: white;
}

.no-images-info {
    display: flex;
    align-items: center;
    gap: 10px;
    color: $text-dark;
    font-size: 13px;
    padding: 24px 0;
    .v-icon { color: $text-dim; }
}

// ── Similar section ───────────────────────────────────────────────────────────
.similar-section { margin-top: 8px; }

.similar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
}

.sim-card {
    display: block;
    text-decoration: none;
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
    &:hover { border-color: #2a2a2a; transform: translateY(-2px); }
}

.sim-img-wrap {
    position: relative;
    background: #0a0a0a;
    img { width: 100%; height: 140px; object-fit: cover; display: block; }
}

.sim-verified {
    position: absolute;
    top: 8px;
    left: 8px;
    background: #2d7a3a;
    color: white;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.5px;
}

.sim-fav {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0,0,0,0.65);
    border: 1px solid rgba(255,255,255,0.1);
    color: $text-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover { color: $red; }
}

.sim-body { padding: 12px 14px; }
.sim-title { font-size: 13px; font-weight: 700; color: $text; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
.sim-meta { font-size: 11px; color: $text-dim; margin-bottom: 6px; }
.sim-price { font-size: 16px; font-weight: 800; color: $red; }

// ── Right sidebar ─────────────────────────────────────────────────────────────
.sidebar-card {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.card-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: $text;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.card-title-icon { color: $red; }

.seller-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.seller-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
}

.seller-details { flex: 1; min-width: 0; }

.seller-name {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    font-weight: 700;
    color: $text;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dealer-badge { color: #5dade2; }

.seller-role { margin-top: 4px; }

.role-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    &.role-dealer { background: rgba(41,128,185,0.12); color: #5dade2; border: 1px solid rgba(41,128,185,0.25); }
    &.role-private { background: rgba(255,255,255,0.05); color: $text-dim; border: 1px solid $border; }
}

.seller-stars {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-top: 4px;
    .star { color: #f39c12; }
}

.seller-rating { font-size: 12px; font-weight: 700; color: $text; margin-left: 4px; }
.seller-reviews { font-size: 11px; color: $text-dark; }

.seller-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    overflow: hidden;
}

.ss-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 8px;
    border-right: 1px solid $border;
    &:last-child { border-right: none; }
}

.ss-val { font-size: 18px; font-weight: 800; color: $text; }
.ss-label { font-size: 10px; color: $text-dark; margin-top: 2px; }

.follow-seller-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 10px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    &:hover { background: rgba(255,255,255,0.08); }
    &.following { background: rgba($red, 0.1); border-color: rgba($red, 0.35); color: $red; }
}

.outline-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 10px;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
    &:hover { background: rgba(255,255,255,0.08); color: $text; }
    &--dim { opacity: 0.7; }
    &.w-full { width: 100%; }
}

.btn-count {
    margin-left: auto;
    background: $red;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 10px;
}

.location-addr {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: $text-muted;
}

.loc-pin { color: $red; flex-shrink: 0; }
.loc-city { font-weight: 600; }

.map-wrap {
    border-radius: $r-md;
    overflow: hidden;
    background: #0a0a0a;
}

.map-iframe {
    width: 100%;
    height: 180px;
    display: block;
    border: none;
}

.map-fallback {
    height: 110px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: #0d0d0d;
    border-radius: $r-md;
    text-align: center;
    padding: 16px;
}

.map-fallback-pin { color: $red; }

.map-fallback-city {
    font-size: 14px;
    font-weight: 700;
    color: $text;
}

.map-fallback-sub {
    font-size: 11px;
    color: $text-dark;
}

// Calc card
.calc-card { }

.calc-tabs {
    display: flex;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    overflow: hidden;
    margin-bottom: 10px;
}

.calc-tab {
    flex: 1;
    background: transparent;
    border: none;
    color: $text-dim;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 9px;
    transition: all 0.2s;
    &.active { background: $red; color: #fff; }
    &:not(.active):hover { color: $text; }
}

.calc-body { display: flex; flex-direction: column; gap: 10px; }

.calc-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    label { font-size: 12px; color: $text-dark; }
}

.calc-val { font-size: 13px; color: $text; font-weight: 600; }

.calc-range {
    width: 100%;
    accent-color: $red;
    cursor: pointer;
}

.calc-result {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba($red, 0.08);
    border: 1px solid rgba($red, 0.25);
    border-radius: $r-sm;
    padding: 10px 14px;
    margin-top: 4px;
    span { font-size: 12px; color: $text-dark; }
    strong { font-size: 18px; color: $red; }
}

.calc-disclaimer { font-size: 10px; color: $text-dark; line-height: 1.4; margin: 0; }

.calc-fin-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 11px;
    cursor: pointer;
    margin-top: 4px;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.sidebar-report-row {
    display: flex;
    justify-content: center;
}

.report-advert-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: none;
    color: $text-dark;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 4px 8px;
    transition: color 0.2s;
    &:hover { color: $text-muted; }
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
.lightbox-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.96);
    z-index: 9000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lb-close {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s;
    &:hover { background: rgba(255,255,255,0.2); }
}

.lb-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s;
    &:hover:not(:disabled) { background: rgba(255,255,255,0.2); }
    &:disabled { opacity: 0.3; cursor: default; }
    &.lb-prev { left: 18px; }
    &.lb-next { right: 18px; }
}

.lb-img-wrap {
    max-width: 90vw;
    max-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lb-img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 6px;
}

.lb-counter {
    position: absolute;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    color: white;
    font-size: 13px;
    font-weight: 600;
    padding: 4px 14px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.1);
}

.lb-thumbs {
    position: absolute;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
    max-width: 90vw;
    overflow-x: auto;
    padding: 6px;
    scrollbar-width: none;
}

.lb-thumb {
    width: 56px;
    height: 40px;
    border-radius: 5px;
    overflow: hidden;
    flex-shrink: 0;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.2s;
    img { width: 100%; height: 100%; object-fit: cover; }
    &.lb-thumb-active { border-color: $red; }
}

// ── Feedback messages ─────────────────────────────────────────────────────────
.tx-success {
    display: flex;
    align-items: center;
    gap: 7px;
    background: rgba(45,122,58,0.1);
    border: 1px solid rgba(45,122,58,0.3);
    border-radius: $r-sm;
    padding: 10px 14px;
    font-size: 13px;
    color: #4caf50;
    font-weight: 600;
    .v-icon { color: #4caf50; }
}

.tx-error {
    display: flex;
    align-items: center;
    gap: 7px;
    background: rgba(231,76,60,0.08);
    border: 1px solid rgba(231,76,60,0.25);
    border-radius: $r-sm;
    padding: 10px 14px;
    font-size: 13px;
    color: #e74c3c;
    font-weight: 500;
}

.empty-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 28px 16px;
    color: $text-dim;
    font-size: 14px;
    text-align: center;
    .v-icon { color: $text-dark; }
}

.loading-center {
    display: flex;
    justify-content: center;
    padding: 28px;
}

.w-full { width: 100%; }

// ── Transitions ───────────────────────────────────────────────────────────────
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.fade-msg-enter-active, .fade-msg-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-msg-enter-from, .fade-msg-leave-to { opacity: 0; transform: translateY(-6px); }

.slide-down-enter-active, .slide-down-leave-active { transition: opacity 0.2s, transform 0.2s; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

// ── Price history tab ─────────────────────────────────────────────────────────

.price-history-section { padding: 8px 0; }

.ph-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid $border;
}

.ph-icon { color: $red; flex-shrink: 0; }

.ph-title { font-size: 16px; font-weight: 700; color: $text; margin-bottom: 3px; }
.ph-sub { font-size: 12px; color: $text-dim; }

.ph-chart-wrap { display: flex; flex-direction: column; gap: 24px; }

.ph-current-price-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.ph-price-badge {
    display: flex;
    flex-direction: column;
}
.ph-price-val { font-size: 28px; font-weight: 900; color: $text; }
.ph-price-label { font-size: 12px; color: $text-dim; margin-top: 2px; }

.ph-market-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: $r-md;
    border: 1px solid;
    font-size: 13px;

    &.pa-great { background: rgba(46,160,67,0.12); border-color: rgba(46,160,67,0.3); color: #4caf50; }
    &.pa-good  { background: rgba(46,160,67,0.08); border-color: rgba(46,160,67,0.2); color: #81c784; }
    &.pa-avg   { background: rgba(255,255,255,0.04); border-color: $border; color: $text-dim; }
    &.pa-high  { background: rgba(139,13,29,0.1); border-color: rgba($red,0.3); color: $red; }
}
.phm-label { font-weight: 700; font-size: 13px; }
.phm-sub { font-size: 11px; opacity: 0.8; }

.ph-graph-area {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 20px 20px 10px;
}

.ph-svg {
    width: 100%;
    height: 80px;
    display: block;
}

.ph-graph-dates {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: $text-dark;
    margin-top: 6px;
    padding: 0 2px;
}

.ph-timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
    padding-left: 20px;

    &::before {
        content: '';
        position: absolute;
        left: 6px;
        top: 8px;
        bottom: 8px;
        width: 1px;
        background: $border;
    }
}

.ph-event {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 14px 0;
    position: relative;
}

.ph-event-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: $border;
    border: 2px solid $bg;
    position: absolute;
    left: -20px;
    top: 18px;
    flex-shrink: 0;

    .ph-event--add & { background: $text-dim; }
    .ph-event--current & { background: $red; box-shadow: 0 0 8px rgba($red, 0.5); }
}

.ph-event-body { flex: 1; }
.ph-event-label { font-size: 12px; color: $text-dim; margin-bottom: 2px; }
.ph-event-date { font-size: 11px; color: $text-dark; }
.ph-event-price { font-size: 16px; font-weight: 700; color: $text; margin-top: 3px; }

.ph-alert-follow {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid $border;
    border-radius: $r-md;
    font-size: 12px;
    color: $text-dim;
    flex-wrap: wrap;
}

.ph-alert-icon { color: $red; flex-shrink: 0; }

.ph-follow-btn {
    margin-left: auto;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.3);
    color: $red;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: $r-sm;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background 0.15s;
    &:hover { background: rgba($red, 0.2); }
}

// ── Completeness card in sidebar ──────────────────────────────────────────────

.completeness-card { }

.compl-score-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
}

.compl-circle {
    position: relative;
    flex-shrink: 0;
}

.compl-pct {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 900;
    color: $text;

    span { font-size: 10px; font-weight: 400; color: $text-dim; margin-left: 1px; }
}

.compl-info { flex: 1; min-width: 0; }
.compl-label { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
.compl-desc { font-size: 11px; color: $text-dark; line-height: 1.4; }

.compl-checks {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.cc-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: $text-dark;

    .v-icon { color: $text-dark; flex-shrink: 0; }

    &.done {
        color: $text-dim;
        .v-icon { color: #4caf50; }
    }
}

// ── Powiększona galeria ────────────────────────────────────────────────────────
.main-photo-wrap {
    min-height: 520px;

    @include respond-to(md) { min-height: 380px; }
    @include respond-to(sm) { min-height: 280px; }
}

.main-photo-img {
    min-height: 520px;

    @include respond-to(md) { min-height: 380px; }
    @include respond-to(sm) { min-height: 280px; }
}

// ── CARIZO VERIFIED ────────────────────────────────────────────────────────────
.verified-trust-box {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: $r-lg;
    padding: 14px 16px;
    margin: 16px 0;
}

.vtb-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.vtb-icon { color: #22c55e; }

.vtb-title {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: $text-muted;
}

.vtb-items {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;

    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.vtb-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 10px;
    border-radius: $r-sm;

    &.vtb-ok {
        color: #22c55e;
        background: rgba(#22c55e, 0.08);
        .v-icon { color: #22c55e; }
    }

    &.vtb-pending {
        color: $text-dim;
        background: rgba(255,255,255,0.03);
        .v-icon { color: $text-dark; }
    }

    &.vtb-warn {
        color: #f59e0b;
        background: rgba(#f59e0b, 0.08);
        .v-icon { color: #f59e0b; }
    }
}

// ── Price monthly estimate ─────────────────────────────────────────────────────
.price-monthly-estimate {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: $r-md;
    padding: 12px 16px;
    margin: 10px 0 6px;
}

.pme-row {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
}

.pme-item {
    flex: 1;
    min-width: 120px;
}

.pme-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: $text-dim;
    margin-bottom: 4px;
}

.pme-ing-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.ing-leasing { background: #FF6200; }
    &.ing-credit { background: #0066cc; }
}

.pme-val {
    font-size: 14px;
    font-weight: 700;
    color: $text;
}

.pme-note {
    font-size: 10px;
    color: $text-dark;
    margin-top: 8px;
}

// ── Seller meta row ────────────────────────────────────────────────────────────
.seller-meta-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 6px;
}

.seller-meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: $text-dim;
    .v-icon { color: $text-dark; }
}

.seller-response { color: #22c55e; .v-icon { color: #22c55e; } }

// ── Info column extra space ────────────────────────────────────────────────────
.info-col {
    padding: 36px 0 36px 40px;

    @include respond-to(md) { padding: 24px 0; }
}

// ── Mobile sticky contact bar ─────────────────────────────────────────────────
.mobile-cta-bar {
    display: none;

    @include respond-to(md) {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 200;
        gap: 10px;
        padding: 12px 16px;
        padding-bottom: max(12px, env(safe-area-inset-bottom));
        background: rgba(#080808, 0.95);
        border-top: 1px solid #232323;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }
}

.mcb-phone {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 13px 12px;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
    span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
}

.mcb-message {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(255,255,255,0.07);
    border: 1px solid #2d2d2d;
    border-radius: $r-sm;
    color: $text;
    font-size: 15px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 13px 12px;
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: rgba(255,255,255,0.12); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// ── Not found state ────────────────────────────────────────────────────────────
.advert-not-found {
    min-height: 100vh;
    background: $bg;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    padding-top: calc(#{$nav-height} + 40px);
}

.anf-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    max-width: 420px;
}

.anf-icon { color: $text-dark; opacity: 0.5; }

.anf-title {
    font-size: 28px;
    font-weight: 900;
    color: $text;
    margin: 0;
}

.anf-desc {
    font-size: 15px;
    color: $text-dim;
    line-height: 1.7;
    margin: 0;
}

.anf-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: $red;
    color: white;
    border-radius: $r-md;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 12px 24px;
    text-decoration: none;
    margin-top: 8px;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

// ── Compose modal ─────────────────────────────────────────────────────────────
.compose-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    z-index: 9000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.compose-modal {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-xl;
    padding: 28px;
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.compose-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.compose-to {
    display: flex;
    align-items: center;
    gap: 8px;
    color: $text-dim;
    font-size: 14px;
    strong { color: $text; }
}

.compose-close {
    background: none;
    border: none;
    color: $text-dim;
    cursor: pointer;
    padding: 4px;
    display: flex;
    &:hover { color: $text; }
}

.compose-advert-ref {
    font-size: 12px;
    color: $text-dark;
    background: rgba(255,255,255,0.04);
    border-radius: $r-sm;
    padding: 8px 12px;
    border-left: 2px solid $red;
}

.compose-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.compose-chip {
    background: rgba(255,255,255,0.05);
    border: 1px solid $border;
    border-radius: 20px;
    color: $text-dim;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    padding: 6px 14px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    text-align: left;

    &:hover, &.active {
        border-color: rgba($red, 0.6);
        color: $text;
        background: rgba($red, 0.08);
    }
}

.compose-textarea {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-md;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    outline: none;
    padding: 12px 14px;
    resize: vertical;
    min-height: 90px;
    box-sizing: border-box;

    &::placeholder { color: $text-dark; }
    &:focus { border-color: rgba($red, 0.4); }
}

.compose-error {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: $red;
}

.compose-send {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    background: $red;
    border: none;
    border-radius: $r-md;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 13px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
}
</style>
