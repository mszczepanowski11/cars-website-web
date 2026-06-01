export interface TaxonomyItem { id: number; name: string }
export interface Generation extends TaxonomyItem { yearFrom: number; yearTo: number }
export interface EngineVersion extends TaxonomyItem { displacement: number; horsepower: number }
export interface AdvertImage { id: number; url: string; isMain: boolean }
export interface Feature { id: number; name: string; category: { id: number; name: string } }

export interface CarAdvert {
    id: number; userId: number; title: string; description: string
    price: number; year: number; mileage: number
    city?: string; region?: string
    brand: TaxonomyItem | null; model: TaxonomyItem | null
    generation: Generation | null; engineVersion: EngineVersion | null
    fuelType: TaxonomyItem | null; gearbox: TaxonomyItem | null; bodyType: TaxonomyItem | null
    features: Feature[]; images: AdvertImage[]; createdAt: string
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


