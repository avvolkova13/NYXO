import type { AccountSection } from '../router/useAppRoute'

type AccountDestination = {
  label: string
  href: string
  section?: AccountSection
}

const destinations: AccountDestination[] = [
  { label: 'Обзор', href: '/account', section: 'overview' },
  { label: 'Покупки', href: '/account/purchases', section: 'purchases' },
  { label: 'Платежи', href: '/account/payments', section: 'payments' },
  { label: 'Инвентарь', href: '/inventory' },
  { label: 'Steam', href: '/account/steam', section: 'steam' },
  { label: 'Настройки', href: '/account/settings', section: 'settings' },
  { label: 'Поддержка', href: '/support' },
]

export function AccountNav({ section }: { section: AccountSection }) {
  return (
    <nav className="account-nav" aria-label="Личный кабинет">
      {destinations.map((destination) => {
        const isCurrent = destination.section === section
        return (
          <a
            key={destination.href}
            href={destination.href}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {destination.label}
          </a>
        )
      })}
    </nav>
  )
}
