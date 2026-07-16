import { useEffect, useState } from 'react'

export type AppRoute =
  | { name: 'home' }
  | { name: 'catalog' }
  | { name: 'product'; slug: string }

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

export function parseAppRoute(pathname: string): AppRoute {
  if (pathname === '/catalog') return { name: 'catalog' }

  const productMatch = pathname.match(/^\/(?:catalog|product)\/([^/]+)$/)
  if (productMatch) return { name: 'product', slug: decodeSlug(productMatch[1]) }

  return { name: 'home' }
}

export function navigate(href: string) {
  window.history.pushState({}, '', href)
  window.dispatchEvent(new PopStateEvent('popstate'))

  if (typeof window.scrollTo === 'function') {
    try {
      window.scrollTo({ top: 0, behavior: 'auto' })
    } catch {
      // Some non-browser environments expose scrollTo without implementing it.
    }
  }
}

function handleInternalLinkClick(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return
  }

  const target = event.target instanceof Element ? event.target.closest('a[href]') : null
  if (!(target instanceof HTMLAnchorElement)) return
  if (target.hasAttribute('download')) return
  if (target.target && target.target.toLowerCase() !== '_self') return

  const rawHref = target.getAttribute('href')
  if (!rawHref || rawHref.startsWith('#')) return

  const url = new URL(target.href, window.location.href)
  if (url.origin !== window.location.origin || url.hash) return
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return

  event.preventDefault()
  navigate(`${url.pathname}${url.search}`)
}

export function useAppRoute() {
  const [route, setRoute] = useState<AppRoute>(() => parseAppRoute(window.location.pathname))

  useEffect(() => {
    const updateRoute = () => setRoute(parseAppRoute(window.location.pathname))

    window.addEventListener('popstate', updateRoute)
    document.addEventListener('click', handleInternalLinkClick)

    return () => {
      window.removeEventListener('popstate', updateRoute)
      document.removeEventListener('click', handleInternalLinkClick)
    }
  }, [])

  return route
}
