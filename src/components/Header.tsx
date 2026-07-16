export function Header() {
  const catalogIsCurrent = window.location.pathname === '/catalog'
    || window.location.pathname.startsWith('/catalog/')

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
        </nav>
        <a className="inventory-link nyxo-action" href="/#account-inventory">
          <span className="status-lamp" aria-hidden="true" />
          Инвентарь
        </a>
      </div>
    </header>
  )
}
