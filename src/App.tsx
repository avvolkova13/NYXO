import { FAQ } from './components/FAQ'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Inspection } from './components/Inspection'
import { PopularNow } from './components/PopularNow'

export default function App() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <Hero />
        <PopularNow />
        <HowItWorks />
        <Inspection />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
