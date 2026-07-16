import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import type { LegalDocument } from '../router/useAppRoute'
import { legalDocuments } from './legalDocuments'

type LegalPageProps = {
  document: LegalDocument
}

export function LegalPage({ document }: LegalPageProps) {
  const metadata = legalDocuments[document]

  return (
    <div className="legal-page">
      <Header />
      <main className="legal-page__main">
        <header className="legal-page__intro">
          <p className="eyebrow">NYXO / DOCUMENT</p>
          <h1>{metadata.title}</h1>
          <p className="legal-page__status">Информация о документе</p>
        </header>

        <section className="legal-page__scope" aria-labelledby="legal-scope-title">
          <div>
            <p className="legal-page__index">01 / CONTENT</p>
            <h2 id="legal-scope-title">Основные положения</h2>
            <p>
              Здесь собраны ключевые вопросы, которые регулирует этот документ.
            </p>
          </div>
          <ul>
            {metadata.scope.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <aside className="legal-page__contact" aria-label="Контакт по документу">
          <span>Вопросы по документу</span>
          <a href="mailto:support@nyxo.market">support@nyxo.market</a>
        </aside>
      </main>
      <Footer />
    </div>
  )
}
