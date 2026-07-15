export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__chassis">
        <a className="wordmark" href="#hero" aria-label="NYXO, на главную">
          NYXO
        </a>
        <nav aria-label="Основная навигация">
          <a href="#popular">Каталог</a>
          <a href="#popular">Популярное</a>
          <a href="#how">Как это работает</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="inventory-link nyxo-action" href="#popular">
          <span className="status-lamp" aria-hidden="true" />
          Инвентарь
        </a>
      </div>
    </header>
  )
}
