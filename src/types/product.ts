export type ProductTone =
  | 'orange'
  | 'coral'
  | 'magenta'
  | 'yellow'
  | 'violet'
  | 'ash'

export type ProductKind = 'skin' | 'steam-topup' | 'gpt-topup'
export type AvailabilityStatus = 'available' | 'instant' | 'limited'

export interface Product {
  id: string
  slug: string
  name: string
  kind: ProductKind
  game?: string
  category: string
  description: string
  searchAliases: string[]
  price: number
  currency: 'COINS'
  condition?: string
  rarity?: string
  weaponType?: string
  attributeLabel?: string
  attribute?: string
  tone: ProductTone
  imageUrl: string
  availability: AvailabilityStatus
  delivery: string
  popularity: number
  createdAt: string
  featured?: boolean
}
