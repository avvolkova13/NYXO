import type { AnchorHTMLAttributes, ReactNode } from 'react'

interface SignalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode
  signalLabel: string
  variant?: 'primary' | 'compact'
}

export function SignalLink({
  children,
  signalLabel,
  variant = 'primary',
  className = '',
  ...props
}: SignalLinkProps) {
  return (
    <a
      className={`signal-link signal-link--${variant} ${className}`.trim()}
      {...props}
    >
      <span className="signal-link__signal" aria-hidden="true">
        {signalLabel}
      </span>
      <span className="signal-link__content">{children}</span>
    </a>
  )
}
