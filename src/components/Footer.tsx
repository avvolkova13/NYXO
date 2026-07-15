type FooterDestination = {
  label: string
  href: string
}

const primaryDestinations: FooterDestination[] = [
  { label: 'Каталог', href: '#popular' },
  { label: 'Популярное', href: '#popular' },
  { label: 'Как это работает', href: '#how' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Поддержка', href: '#faq' },
]

const legalDestinations: FooterDestination[] = [
  { label: 'Пользовательское соглашение', href: '#footer' },
  { label: 'Политика конфиденциальности', href: '#footer' },
  { label: 'Политика cookie', href: '#footer' },
]

export function Footer() {
  return (
    <footer
      className="site-footer"
      id="footer"
    >
      <div className="site-footer__statement">
        <div className="site-footer__statement-copy">
          <p>Ищете свой предмет?</p>
          <a href="#popular">
            Найдите его в NYXO<span aria-hidden="true">↗</span>
          </a>
        </div>
        <a className="site-footer__contact" href="#popular">
          Перейти в каталог <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="site-footer__bottom">
        <nav aria-label="Разделы страницы" className="site-footer__nav site-footer__nav--main">
          {primaryDestinations.map((destination) => (
            <a key={destination.label} href={destination.href}>
              {destination.label}
            </a>
          ))}
        </nav>
        <nav aria-label="Правовая информация" className="site-footer__nav site-footer__nav--legal">
          {legalDestinations.map((destination) => (
            <a key={destination.label} href={destination.href}>
              {destination.label}
            </a>
          ))}
        </nav>
        <p className="site-footer__copyright">© NYXO / 2026</p>
      </div>

      <div className="site-footer__lockup" data-testid="footer-lockup">
        <strong className="site-footer__lockup-logo">
          <span>NYXO</span>
        </strong>
        <span className="site-footer__lockup-bar" aria-hidden="true" />
        <b>SKINS</b>
      </div>
    </footer>
  )
}
