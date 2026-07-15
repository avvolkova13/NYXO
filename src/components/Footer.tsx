type FooterDestination = {
  label: string
  href: string
}

const primaryDestinations: FooterDestination[] = [
  { label: 'Каталог', href: '#catalog-tools' },
  { label: 'Популярное', href: '#popular' },
  { label: 'Как это работает', href: '#how' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Личный кабинет', href: '#account' },
  { label: 'Поддержка', href: 'mailto:support@nyxo.market' },
]

const legalDestinations: FooterDestination[] = [
  { label: 'Пользовательское соглашение', href: '#offer' },
  { label: 'Политика конфиденциальности', href: '#privacy' },
  { label: 'Условия возврата', href: '#returns' },
  { label: 'Честная игра', href: '#fair-play' },
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

      <div className="site-footer__legal" aria-label="Юридическая информация">
        <p><strong>18+</strong> Цифровые товары и пополнение доступны совершеннолетним пользователям.</p>
        <p>Наш сайт не связан, не аффилирован и не одобрен Valve Corporation или Steam.</p>
        <p>Реквизиты юридического лица, ИНН и адрес предоставляются заказчиком перед запуском.</p>
        <p>Почта поддержки (черновик до передачи домена): <a href="mailto:support@nyxo.market">support@nyxo.market</a> · режим работы: ежедневно, 10:00–20:00 (ЕКБ)</p>
        <div className="site-footer__payments" aria-label="Способы оплаты">
          <span>Visa</span><span>Mastercard</span><span>МИР</span><span>СБП</span><span>Steam</span>
        </div>
        <div id="offer" className="site-footer__legal-anchor">Пользовательское соглашение (Оферта) будет опубликовано до запуска оплаты.</div>
        <div id="privacy" className="site-footer__legal-anchor">Политика конфиденциальности будет опубликована до запуска регистрации.</div>
        <div id="returns" className="site-footer__legal-anchor">Условия возврата будут опубликованы до запуска продаж.</div>
        <div id="fair-play" className="site-footer__legal-anchor">Страница честной игры будет опубликована после подключения игровых механик.</div>
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
