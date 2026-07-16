import { products } from '../data/products'
import type { Product } from '../types/product'

export interface CatalogOffer {
  id: string
  baseProductId: string
  label: string
  pageIndex: number
  product: Product
}

const generatedOfferPattern = /^nyxo-offer-(\d+)--(.+)$/

function stableHash(value: string) {
  return [...value].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7)
}

function offerLabel(product: Product, pageIndex: number) {
  const sequence = String(pageIndex + 1).padStart(2, '0')
  const code = String(stableHash(product.id) % 10_000).padStart(4, '0')
  return `Предложение ${sequence} / ${code}`
}

function floatRange(condition?: string): [number, number] | null {
  switch (condition) {
    case 'Прямо с завода':
      return [0.001, 0.069]
    case 'Немного поношенное':
      return [0.071, 0.149]
    case 'После полевых испытаний':
      return [0.151, 0.379]
    case 'Поношенное':
      return [0.381, 0.449]
    case 'Закалённое в боях':
      return [0.451, 0.999]
    default:
      return null
  }
}

function skinOfferProduct(product: Product, pageIndex: number, id: string): Product {
  if (pageIndex === 0) return { ...product, id }

  const hash = stableHash(`${product.id}:${pageIndex}`)
  const range = floatRange(product.condition)
  const attribute = range
    ? (range[0] + ((hash % 10_000) / 10_000) * (range[1] - range[0]))
        .toFixed(6)
        .replace('.', ',')
    : product.attribute
  const priceReduction = 0.004 * (1 + (hash % 6))

  return {
    ...product,
    id,
    price: Number((product.price * (1 - priceReduction)).toFixed(2)),
    attributeLabel: product.attributeLabel ?? 'Характеристика',
    attribute,
  }
}

function serviceOfferProduct(product: Product, pageIndex: number, id: string): Product {
  return {
    ...product,
    id,
    attributeLabel: 'Предложение',
    attribute: `Вариант ${String(pageIndex + 1).padStart(2, '0')}`,
  }
}

export function createCatalogOffer(product: Product, pageIndex: number): CatalogOffer {
  const normalizedPage = Math.max(0, Math.trunc(pageIndex))
  const id = normalizedPage === 0
    ? product.id
    : `nyxo-offer-${normalizedPage + 1}--${product.id}`

  return {
    id,
    baseProductId: product.id,
    label: offerLabel(product, normalizedPage),
    pageIndex: normalizedPage,
    product: product.kind === 'skin'
      ? skinOfferProduct(product, normalizedPage, id)
      : serviceOfferProduct(product, normalizedPage, id),
  }
}

export function createCatalogOffers(items: Product[], pageIndex: number): CatalogOffer[] {
  return items.map((product) => createCatalogOffer(product, pageIndex))
}

export function resolveCatalogProduct(id: string): Product | undefined {
  const direct = products.find((product) => product.id === id)
  if (direct) return createCatalogOffer(direct, 0).product

  const match = id.match(generatedOfferPattern)
  if (!match) return undefined
  const pageNumber = Number(match[1])
  const base = products.find((product) => product.id === match[2])
  if (!base || !Number.isSafeInteger(pageNumber) || pageNumber < 2) return undefined

  return createCatalogOffer(base, pageNumber - 1).product
}

export function resolveCatalogProducts(ids: string[]): Product[] {
  return [...new Set(ids)].flatMap((id) => {
    const product = resolveCatalogProduct(id)
    return product ? [product] : []
  })
}
