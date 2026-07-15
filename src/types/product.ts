export type ProductTone =
  | 'orange'
  | 'coral'
  | 'magenta'
  | 'yellow'
  | 'violet'
  | 'ash'

export interface Product {
  id: string
  name: string
  game: string
  category: string
  price: number
  currency: 'COINS'
  condition: string
  attributeLabel?: string
  attribute?: string
  tone: ProductTone
  imageUrl: string
  featured?: boolean
}
