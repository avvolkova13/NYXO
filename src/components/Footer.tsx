type FooterDestination = {
  label: string
  href: string
}

const primaryDestinations: FooterDestination[] = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Популярное', href: '/#popular' },
  { label: 'Как это работает', href: '/#how' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Личный кабинет', href: '/#account-inventory' },
  { label: 'Поддержка', href: '/support' },
]

const legalDestinations: FooterDestination[] = [
  { label: 'Пользовательское соглашение', href: '/legal/terms' },
  { label: 'Политика конфиденциальности', href: '/legal/privacy' },
  { label: 'Условия возврата', href: '/legal/refunds' },
  { label: 'Честная игра', href: '/legal/fair-play' },
]

export function Footer() {
  const catalogIsCurrent = window.location.pathname === '/catalog'
    || window.location.pathname.startsWith('/catalog/')

  return (
    <footer
      className="site-footer"
      id="footer"
    >
      <div className="site-footer__statement">
        <div className="site-footer__statement-copy">
          <p>Ищете свой предмет?</p>
          <a href="/catalog">
            Найдите его в NYXO<span aria-hidden="true">↗</span>
          </a>
        </div>
        <a className="site-footer__contact" href="/catalog">
          Перейти в каталог <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="site-footer__bottom">
        <nav aria-label="Разделы страницы" className="site-footer__nav site-footer__nav--main">
          {primaryDestinations.map((destination) => (
            <a
              key={destination.label}
              href={destination.href}
              aria-current={
                destination.href === '/catalog' && catalogIsCurrent ? 'page' : undefined
              }
            >
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

      <div className="site-footer__legal" aria-label="Юридическая информация">
        <p><strong>18+</strong> Цифровые товары и пополнение доступны совершеннолетним пользователям.</p>
        <p>Наш сайт не связан, не аффилирован и не одобрен Valve Corporation или Steam.</p>
        <p>Поддержка: <a href="mailto:support@nyxo.market">support@nyxo.market</a></p>
        <div className="site-footer__payments" aria-label="Способы оплаты">
          <span>Visa</span><span>Mastercard</span><span>МИР</span><span>СБП</span><span>Steam</span>
        </div>
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
