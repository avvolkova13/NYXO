import { Account } from './components/Account'
import { CatalogPage } from './catalog/CatalogPage'
import { ProductPreviewPage } from './catalog/ProductPreviewPage'
import { Checkout } from './components/Checkout'
import { CartPage } from './checkout/CartPage'
import { TopUpPage } from './balance/TopUpPage'
import { AuthPage } from './auth/AuthPage'
import { AccountPage } from './account/AccountPage'
import { FAQ } from './components/FAQ'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Inspection } from './components/Inspection'
import { MarketplaceTools } from './components/MarketplaceTools'
import { PopularNow } from './components/PopularNow'
import { useAppRoute } from './router/useAppRoute'

function HomePage() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <Hero />
        <MarketplaceTools />
        <PopularNow />
        <Account />
        <Checkout />
        <HowItWorks />
        <Inspection />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  const route = useAppRoute()

  if (route.name === 'catalog') return <CatalogPage />
  if (route.name === 'product') return <ProductPreviewPage slug={route.slug} />
  if (route.name === 'cart') return <CartPage />
  if (route.name === 'top-up') return <TopUpPage />
  if (route.name === 'auth') return <AuthPage />
  if (route.name === 'account') return <AccountPage section={route.section} />

  return <HomePage />
}
