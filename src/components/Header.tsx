import { products } from '../data/products'
import { calculateCart } from '../marketplace/purchase'
import { useMarketplaceState } from '../marketplace/useMarketplaceState'

function cartAccessibleName(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  const noun = mod10 === 1 && mod100 !== 11
    ? 'товар'
    : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
      ? 'товара'
      : 'товаров'
  return `Корзина, ${count} ${noun}`
}

export function Header() {
  const marketplaceState = useMarketplaceState()
  const cartCount = calculateCart(products, marketplaceState.cartProductIds).items.length
  const catalogIsCurrent = window.location.pathname === '/catalog'
    || window.location.pathname.startsWith('/catalog/')
  const cartIsCurrent = window.location.pathname === '/cart'
  const accountIsCurrent = window.location.pathname === '/account'
    || window.location.pathname.startsWith('/account/')
  const inventoryIsCurrent = window.location.pathname === '/inventory'

  return (
    <header className="site-header">
      <div className="site-header__chassis">
        <a className="wordmark" href="/" aria-label="NYXO, на главную">
          NYXO
        </a>
        <nav aria-label="Основная навигация">
          <a
            className={catalogIsCurrent ? 'site-header__nav-link--active' : undefined}
            href="/catalog"
            aria-current={catalogIsCurrent ? 'page' : undefined}
          >
            Каталог
          </a>
          <a href="/#popular">Популярное</a>
          <a href="/#how">Как это работает</a>
          <a href="/#faq">FAQ</a>
          <a
            className={accountIsCurrent ? 'site-header__nav-link--active' : undefined}
            href="/account"
            aria-current={accountIsCurrent ? 'page' : undefined}
          >
            Аккаунт
          </a>
          <a
            className={`site-header__cart-link--desktop${cartIsCurrent ? ' site-header__nav-link--active' : ''}`}
            href="/cart"
            aria-current={cartIsCurrent ? 'page' : undefined}
            aria-label={cartAccessibleName(cartCount)}
          >
            Корзина <span className="site-header__cart-count" aria-hidden="true">{cartCount}</span>
          </a>
        </nav>
        <a
          className={`site-header__cart-link--mobile${cartIsCurrent ? ' site-header__nav-link--active' : ''}`}
          href="/cart"
          aria-current={cartIsCurrent ? 'page' : undefined}
          aria-label={cartAccessibleName(cartCount)}
        >
          Корзина <span className="site-header__cart-count" aria-hidden="true">{cartCount}</span>
        </a>
        <a
          className={`inventory-link nyxo-action${inventoryIsCurrent ? ' site-header__nav-link--active' : ''}`}
          href="/inventory"
          aria-current={inventoryIsCurrent ? 'page' : undefined}
        >
          <span className="status-lamp" aria-hidden="true" />
          Инвентарь
        </a>
      </div>
    </header>
  )
}
