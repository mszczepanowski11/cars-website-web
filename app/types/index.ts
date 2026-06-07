export interface TaxonomyItem { id: number; name: string }
export interface Generation extends TaxonomyItem { yearFrom: number; yearTo: number }
export interface EngineVersion extends TaxonomyItem { displacement: number; horsepower: number }
export interface AdvertImage { id: number; url: string; isMain: boolean }
export interface Feature { id: number; name: string; category: { id: number; name: string } }
export type AdvertBadge = 'PREMIUM' | 'VERIFIED' | 'DEALER' | 'FEATURED' | 'TOP'

export interface CarAdvert {
    id: number; userId: number; title: string; description: string
    price: number; year: number; mileage: number
    city?: string; region?: string
    brand: TaxonomyItem | null; model: TaxonomyItem | null
    generation: Generation | null; engineVersion: EngineVersion | null
    fuelType: TaxonomyItem | null; gearbox: TaxonomyItem | null; bodyType: TaxonomyItem | null
    features: Feature[]; images: AdvertImage[]; createdAt: string
    badge?: AdvertBadge | null
    isVerified?: boolean
    sellerType?: 'personal' | 'dealer'
    isHidden?: boolean
    isActive?: boolean
}

export interface PagedResult<T> { items: T[]; totalCount: number }

export interface SearchAdvertDto {
    categoryId?: number | null; textSearch?: string | null
    brandId?: number | null; modelId?: number | null
    generationId?: number | null; engineVersionId?: number | null
    fuelTypeId?: number | null; gearboxId?: number | null; bodyTypeId?: number | null
    yearFrom?: number | null; yearTo?: number | null
    mileageFrom?: number | null; mileageTo?: number | null
    priceFrom?: number | null; priceTo?: number | null
    featureIds?: number[]; sortBy?: string; page?: number; pageSize?: number
}

export interface CategoryWithCount {
    id: number; slug: string; name: string
    description: string; iconName: string; advertCount: number
}

export interface UserStats {
    totalAdverts: number; activeAdverts: number; totalViews: number
    favoritesCount: number; unreadMessages: number
}

export interface UserProfile {
    id: number; name: string; surname: string; email: string; phoneNumber: string
    createdAt: string
    accountType: 'Personal' | 'Business'
    companyName?: string
    nip?: string
    isAdmin?: boolean
    isBlocked?: boolean
}

export interface Conversation {
    id: number
    buyerId: number
    buyerName: string
    sellerId: number
    sellerName: string
    advertId: number
    advertTitle: string
    lastMessageAt: string
    lastMessageContent: string | null
    unreadCount: number
    otherUserId: number
    otherUserName: string
}

export interface MessageItem {
    id: number
    senderId: number
    senderName: string
    content: string
    sentAt: string
    isRead: boolean
    isMine: boolean
}

// ── Reports ───────────────────────────────────────────────────────────────────

export type ReportReason = 'Fraud' | 'FalseData' | 'InvalidVin' | 'DuplicateAdvert' | 'InappropriateContent' | 'Spam' | 'Other'
export type ReportTargetType = 'Advert' | 'User'
export type ReportStatus = 'Pending' | 'Resolved' | 'Rejected'

export interface CreateReportDto {
    targetType: ReportTargetType
    targetAdvertId?: number
    targetUserId?: number
    reason: ReportReason
    content?: string
}

export interface AdminReport {
    id: number
    targetType: ReportTargetType
    targetAdvertId?: number
    targetAdvertTitle?: string
    targetUserId?: number
    targetUserName?: string
    reason: ReportReason
    content?: string
    reportedAt: string
    reportedByUserId: number
    reportedByName: string
    status: ReportStatus
    resolvedAt?: string
    adminNote?: string
}

// ── Admin Panel ───────────────────────────────────────────────────────────────

export interface AdminStats {
    totalActiveAdverts: number
    totalUsers: number
    totalReports: number
    pendingReports: number
    newRegistrationsThisMonth: number
    blockedUsers: number
}

export interface AdminUser {
    id: number
    name: string
    surname: string
    email: string
    phoneNumber: string
    isAdmin: boolean
    isBlocked: boolean
    blockedAt?: string
    blockedReason?: string
    advertCount: number
}

export interface AdminAdvert {
    id: number
    title: string
    price: number
    currency: string
    isHidden: boolean
    isActive: boolean
    createdAt: string
    userId: number
    ownerName: string
    city?: string
    region?: string
}

export interface AdminActionLog {
    id: number
    adminUserId: number
    adminName: string
    actionType: string
    targetAdvertId?: number
    targetUserId?: number
    reportId?: number
    note?: string
    performedAt: string
}

// ── Events ────────────────────────────────────────────────────────────────────

export type EventStatus = 'Pending' | 'Published' | 'Rejected' | 'Archived'
export type EventReportReason = 'Spam' | 'FakeEvent' | 'OutdatedInfo' | 'Other'

export interface EventImage {
    id: number
    url: string
    isMain: boolean
}

export interface CarEvent {
    id: number
    name: string
    description: string
    startDate: string
    endDate: string
    city: string
    address: string
    websiteUrl?: string
    ticketsUrl?: string
    organizerName?: string
    organizerEmail?: string
    organizerPhone?: string
    status: EventStatus
    createdAt: string
    createdByUserId: number
    createdByName?: string
    images: EventImage[]
}

export interface AdminEvent {
    id: number
    name: string
    startDate: string
    endDate: string
    city: string
    status: EventStatus
    createdAt: string
    createdByUserId: number
    createdByName?: string
    reportCount: number
    mainImageUrl?: string
}

export interface CreateEventDto {
    name: string
    description: string
    startDate: string
    endDate: string
    city: string
    address: string
    websiteUrl?: string
    ticketsUrl?: string
    organizerName?: string
    organizerEmail?: string
    organizerPhone?: string
}

export interface CreateEventReportDto {
    reason: EventReportReason
    content?: string
}