export interface TaxonomyItem { id: number; name: string }
export interface SelectOption { value: number | string; label: string; icon?: string; meta?: string }
export interface Generation extends TaxonomyItem { yearFrom: number; yearTo: number }
export interface EngineVersion { id: number; name: string; engineName: string; displacement?: number; horsepower?: number; powerHP?: number; powerKW?: number }
export interface AdvertImage { id: number; url: string; isMain: boolean }
export interface Feature { id: number; name: string; category: { id: number; name: string; vehicleCategoryId?: number | null } }
export interface DriveType { id: number; name: string; slug: string }
export interface CarColor { id: number; name: string; hexCode: string }
export type AdvertBadge = 'PREMIUM' | 'VERIFIED' | 'DEALER' | 'FEATURED' | 'TOP'

export interface CarAdvert {
    id: number; userId: number; title: string; description: string
    price: number; year: number; mileage: number
    city?: string; region?: string
    brand: TaxonomyItem | null; model: TaxonomyItem | null
    generation: Generation | null; engineVersion: EngineVersion | null
    fuelType: TaxonomyItem | null; gearbox: TaxonomyItem | null; bodyType: TaxonomyItem | null
    driveType?: DriveType | null; color?: CarColor | null
    category?: { id: number; name: string; slug?: string } | null
    categoryId?: number | null
    features: Feature[]; images: AdvertImage[]; createdAt: string
    badge?: AdvertBadge | null

    // Core specs
    powerHP?: number; powerKW?: number; engineSize?: number
    doorCount?: number; seatsCount?: number; vin?: string

    // Sale info
    condition?: 'new' | 'used'
    isNegotiable?: boolean
    sellerType?: 'private' | 'dealer'

    // Technical
    torque?: number; acceleration?: number
    fuelConsumptionCity?: number; fuelConsumptionHighway?: number; fuelConsumptionCombined?: number
    co2Emission?: number; euroNorm?: string
    curbWeight?: number; grossWeight?: number

    // Vehicle history
    firstRegistrationDate?: string; registrationCountry?: string
    ownersCount?: number; isImported?: boolean; importCountry?: string
    nextInspection?: string
    hasServiceBook?: boolean; hasFullServiceHistory?: boolean
    hasDamage?: boolean; damageDescription?: string
    hasWarranty?: boolean; warrantyUntil?: string

    isVerified?: boolean
    isHidden?: boolean; isActive?: boolean
    viewCount?: number; favoriteCount?: number; soldAt?: string; expiresAt?: string
    slug?: string; updatedAt?: string
}

export interface PagedResult<T> { items: T[]; totalCount: number }

export interface SearchAdvertDto {
    categoryId?: number | null; textSearch?: string | null
    brandId?: number | null; modelId?: number | null
    generationId?: number | null; engineVersionId?: number | null
    fuelTypeId?: number | null; gearboxId?: number | null; bodyTypeId?: number | null
    driveTypeId?: number | null; colorId?: number | null
    yearFrom?: number | null; yearTo?: number | null
    mileageFrom?: number | null; mileageTo?: number | null
    priceFrom?: number | null; priceTo?: number | null
    powerFrom?: number | null; powerTo?: number | null
    engineSizeFrom?: number | null; engineSizeTo?: number | null
    doorCount?: number | null; seatsCount?: number | null
    condition?: string | null; sellerType?: string | null
    isNegotiable?: boolean | null; hasDamage?: boolean | null
    hasWarranty?: boolean | null; hasServiceBook?: boolean | null
    isImported?: boolean | null; euroNorm?: string | null
    featureIds?: number[]; sortBy?: string; page?: number; pageSize?: number
}

export interface CategoryWithCount {
    id: number; slug: string; name: string
    description: string; iconName: string; advertCount: number
}

export interface UserStats {
    totalAdverts: number; activeAdverts: number; totalViews: number
    favoritesCount: number; unreadMessages: number
    totalSold: number; followersCount: number; followingCount: number
    averageRating: number; reviewCount: number
    responseRate: number; avgResponseMinutes: number
}

export interface UserProfile {
    id: number; name: string; surname: string; email: string; phoneNumber: string
    createdAt: string
    accountType: 'Personal' | 'Business'
    companyName?: string
    nip?: string
    isAdmin?: boolean
    isBlocked?: boolean
    city?: string
    region?: string
    about?: string
    street?: string
    postalCode?: string
    country?: string
}

export interface UpdateProfileDto {
    name: string; surname: string; phoneNumber: string
    city?: string; region?: string; about?: string
    companyName?: string; nip?: string
    street?: string; postalCode?: string; country?: string
}

export interface UpdatePasswordDto {
    currentPassword: string; newPassword: string
}

export interface UpdateSettingsDto {
    emailNotifications: boolean
    priceChangeAlerts: boolean
    newMessageAlerts: boolean
    newsletterSubscribed: boolean
}

export interface AccountSettings {
    emailNotifications: boolean
    priceChangeAlerts: boolean
    newMessageAlerts: boolean
    newsletterSubscribed: boolean
}

// ── Conversations & Messages ──────────────────────────────────────────────────

export interface Conversation {
    id: number
    buyerId: number; buyerName: string
    sellerId: number; sellerName: string
    advertId: number; advertTitle: string
    lastMessageAt: string; lastMessageContent: string | null
    unreadCount: number; otherUserId: number; otherUserName: string
}

export interface MessageItem {
    id: number; senderId: number; senderName: string
    content: string; sentAt: string; isRead: boolean; isMine: boolean
}

// ── Reports ───────────────────────────────────────────────────────────────────

export type ReportReason = 'Fraud' | 'FalseData' | 'InvalidVin' | 'DuplicateAdvert' | 'InappropriateContent' | 'Spam' | 'Other'
export type ReportTargetType = 'Advert' | 'User'
export type ReportStatus = 'Pending' | 'Resolved' | 'Rejected'

export interface CreateReportDto {
    targetType: ReportTargetType; targetAdvertId?: number; targetUserId?: number
    reason: ReportReason; content?: string
}

export interface AdminReport {
    id: number; targetType: ReportTargetType
    targetAdvertId?: number; targetAdvertTitle?: string
    targetUserId?: number; targetUserName?: string
    reason: ReportReason; content?: string
    reportedAt: string; reportedByUserId: number; reportedByName: string
    status: ReportStatus; resolvedAt?: string; adminNote?: string
}

// ── Admin Panel ───────────────────────────────────────────────────────────────

export interface AdminStats {
    totalActiveAdverts: number; totalUsers: number
    totalReports: number; pendingReports: number
    newRegistrationsThisMonth: number; blockedUsers: number
    totalRevenue: number; activePromotions: number
    totalSoldVehicles: number; dailyRevenue: number; monthlyRevenue: number
}

export interface AdminUser {
    id: number; name: string; surname: string; email: string
    phoneNumber: string; isAdmin: boolean; isBlocked: boolean
    blockedAt?: string; blockedReason?: string; advertCount: number
    createdAt: string
    accountType?: 'Personal' | 'Business'
    companyName?: string
}

export interface AdminAdvert {
    id: number; title: string; price: number; currency: string
    isHidden: boolean; isActive: boolean; createdAt: string
    userId: number; ownerName: string; sellerName?: string
    city?: string; region?: string
    viewCount?: number; badge?: AdvertBadge | null
    brand?: string; model?: string; year?: number
    mainImageUrl?: string
}


export interface AdminActionLog {
    id: number; adminUserId: number; adminName: string; actionType: string
    targetAdvertId?: number; targetUserId?: number; reportId?: number
    note?: string; performedAt: string
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface Review {
    id: number; advertId?: number; advertTitle?: string
    sellerId: number; sellerName: string
    buyerId: number; buyerName: string
    rating: number; content: string
    createdAt: string; isVerifiedPurchase: boolean
}

export interface CreateReviewDto {
    sellerId: number; advertId?: number; rating: number; content: string
}

export interface ReviewsResult {
    items: Review[]; totalCount: number; averageRating: number
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType =
    | 'AccountCreated' | 'PasswordChanged' | 'PasswordReset'
    | 'AdvertAdded' | 'AdvertPublished' | 'AdvertRejected' | 'AdvertDeleted' | 'AdvertMarkedSold'
    | 'AdvertExpiring7Days' | 'AdvertExpiring3Days' | 'AdvertExpiring1Day' | 'AdvertExpired'
    | 'PromotionPurchased' | 'PromotionActivated' | 'TopStarted' | 'PremiumStarted' | 'FeaturedStarted' | 'RefreshStarted'
    | 'PromotionExpiring3Days' | 'PromotionExpiring1Day' | 'PromotionExpired'
    | 'PaymentConfirmed' | 'PaymentFailed' | 'PaymentRefunded'
    | 'InvoiceGenerated' | 'InvoiceSent'
    | 'NewMessage'

export interface Notification {
    id: number; type: NotificationType
    title: string; content: string
    isRead: boolean; createdAt: string
    advertId?: number; paymentId?: number; invoiceId?: number
}

export interface NotificationPreference {
    category: string
    label: string
    emailEnabled: boolean
}

export interface UpdateNotificationPreferenceDto {
    category: string
    emailEnabled: boolean
}

// ── Saved Searches ────────────────────────────────────────────────────────────

export interface SavedSearch {
    id: number; name: string
    criteria: SearchAdvertDto
    createdAt: string; notifyOnNew: boolean
    newResultsCount: number
}

export interface CreateSavedSearchDto {
    name: string; criteria: SearchAdvertDto; notifyOnNew: boolean
}

// ── Follow System ─────────────────────────────────────────────────────────────

export interface FollowedAdvert {
    id: number; advertId: number; advertTitle: string
    advertPrice: number; priceAtFollow: number; priceChanged: boolean
    city?: string; brand?: string; model?: string
    mainImageUrl?: string; createdAt: string
    advert?: CarAdvert
}

export interface FollowedSeller {
    id: number; sellerId: number; sellerName: string
    advertCount: number; createdAt: string
    averageRating?: number
}

// ── Transactions ──────────────────────────────────────────────────────────────

export type TransactionType = 'Reservation' | 'Viewing' | 'Purchase'
export type TransactionStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'

export interface Transaction {
    id: number; type: TransactionType; status: TransactionStatus
    advertId: number; advertTitle: string; advertPrice: number
    buyerId: number; buyerName: string
    sellerId: number; sellerName: string
    createdAt: string; scheduledAt?: string; completedAt?: string
    notes?: string; sellerPhone?: string
}

export interface CreateTransactionDto {
    type: TransactionType; advertId: number
    scheduledAt?: string; notes?: string
}

// ── Promotions ────────────────────────────────────────────────────────────────

export type PromotionType = 'Top' | 'Premium' | 'Featured' | 'Refresh'

export interface PromotionPlan {
    type: PromotionType; name: string
    price7days: number; price30days: number
    description: string; features: string[]
}

export interface ActivePromotion {
    id: number; advertId: number; advertTitle: string
    type: PromotionType; startsAt: string; expiresAt: string
    isPaid: boolean; durationDays: number
}

export interface CreatePromotionDto {
    advertId: number; type: PromotionType
    durationDays: number; couponCode?: string
}

export interface PromotionOrder {
    originalPrice: number; finalPrice: number
    discountApplied: number; couponCode?: string
    promotion: CreatePromotionDto
}

// ── Coupons ───────────────────────────────────────────────────────────────────

export interface Coupon {
    id: number; code: string
    discountPercent?: number; discountAmount?: number
    maxUses: number; usedCount: number
    expiresAt?: string; isActive: boolean
    description?: string; createdAt: string
}

export interface CouponValidation {
    isValid: boolean; message?: string
    discountPercent?: number; discountAmount?: number
    originalPrice: number; finalPrice: number
}

export interface CreateCouponDto {
    code: string; discountPercent?: number; discountAmount?: number
    maxUses: number; expiresAt?: string; description?: string
}

// ── Events ────────────────────────────────────────────────────────────────────

export type EventStatus = 'Pending' | 'Published' | 'Rejected' | 'Archived'
export type EventReportReason = 'Spam' | 'FakeEvent' | 'OutdatedInfo' | 'Other'

export interface EventImage { id: number; url: string; isMain: boolean }

export interface CarEvent {
    id: number; name: string; description: string
    startDate: string; endDate: string
    city: string; address: string
    websiteUrl?: string; ticketsUrl?: string
    organizerName?: string; organizerEmail?: string; organizerPhone?: string
    status: EventStatus; createdAt: string
    createdByUserId: number; createdByName?: string
    images: EventImage[]
    isFeatured?: boolean
    interestedCount?: number
    attendingCount?: number
    viewCount?: number
    shareCount?: number
    isUserInterested?: boolean
    isUserFavorite?: boolean
}

export interface AdminEvent {
    id: number; name: string; startDate: string; endDate: string
    city: string; status: EventStatus; createdAt: string
    createdByUserId: number; createdByName?: string
    reportCount: number; mainImageUrl?: string
    isFeatured?: boolean
    interestedCount?: number
}

export interface CreateEventDto {
    name: string; description: string
    startDate: string; endDate: string
    city: string; address: string
    websiteUrl?: string; ticketsUrl?: string
    organizerName?: string; organizerEmail?: string; organizerPhone?: string
}

export interface CreateEventReportDto {
    reason: EventReportReason; content?: string
}

// ── Billing data ──────────────────────────────────────────────────────────────

export type BillingType = 'personal' | 'business'

export interface BillingData {
    type: BillingType
    // Personal
    firstName?: string
    lastName?: string
    // Business
    companyName?: string
    nip?: string
    street?: string
    postalCode?: string
    city?: string
    country?: string
    // Shared
    email: string
}

export interface InitiatePaymentDto {
    advertId?: number
    serviceType: string
    durationDays: number
    couponCode?: string
    billing: BillingData
    returnUrl?: string
    cancelUrl?: string
}

// KSeF-ready invoice line item
export interface KSeFLineItem {
    name: string
    quantity: number
    unitPrice: number
    netAmount: number
    vatRate: number
    vatAmount: number
    grossAmount: number
    gtu?: string
}

// ── Payments & Invoices ────────────────────────────────────────────────────────

export type PaymentServiceType = 'Top' | 'Premium' | 'Featured' | 'Refresh' | 'EventFeatured' | 'Other'
export type PaymentStatusType = 'Pending' | 'Completed' | 'Failed' | 'Cancelled' | 'Refunded'
export type InvoiceStatusType = 'Draft' | 'Generated' | 'Sent'

export interface ServicePrice {
    serviceType: PaymentServiceType
    durationDays: number
    price: number
    description: string
}

export interface PaymentInitiated {
    paymentId: number
    paymentUrl: string
    amount: number
    orderId: string
}

export interface PaymentRecord {
    id: number
    serviceType: PaymentServiceType
    serviceDescription: string
    amount: number
    currency: string
    status: PaymentStatusType
    imojeTransactionId?: string
    createdAt: string
    paidAt?: string
    advertId?: number
    eventId?: number
    durationDays?: number
}

export interface MonthlyInvoice {
    id: number
    invoiceNumber: string
    month: number
    year: number
    totalAmount: number
    netAmount: number
    vatAmount: number
    vatRate: number
    status: InvoiceStatusType
    generatedAt: string
    sentAt?: string
    items: PaymentRecord[]
    userName: string
    userEmail: string
    companyName?: string
    nip?: string
    // Billing address
    street?: string
    postalCode?: string
    city?: string
    country?: string
    // KSeF readiness
    kSeFReferenceNumber?: string
    isKSeFSent?: boolean
    billingType?: BillingType
    lineItems?: KSeFLineItem[]
    // Seller info (for PDF generation)
    sellerName?: string
    sellerEmail?: string
    sellerAddress?: string
    sellerNip?: string
}
