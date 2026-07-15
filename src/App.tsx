import { Account } from './components/Account'
import { Checkout } from './components/Checkout'
import { FAQ } from './components/FAQ'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Inspection } from './components/Inspection'
import { MarketplaceTools } from './components/MarketplaceTools'
import { PopularNow } from './components/PopularNow'

export default function App() {
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
