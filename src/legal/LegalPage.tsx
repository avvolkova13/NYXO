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
          <p className="eyebrow">NYXO / DOCUMENT STATUS</p>
          <h1>{metadata.title}</h1>
          <p className="legal-page__status">Документ готовится заказчиком.</p>
        </header>

        <section className="legal-page__scope" aria-labelledby="legal-scope-title">
          <div>
            <p className="legal-page__index">01 / SCOPE</p>
            <h2 id="legal-scope-title">Что требуется для публикации</h2>
            <p>
              Заказчику необходимо предоставить содержание перечисленных разделов. Эта страница
              не заменяет итоговый юридический документ.
            </p>
          </div>
          <ul>
            {metadata.scope.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <aside className="legal-page__contact" aria-label="Контакт по документу">
          <span>Вопросы о статусе документа</span>
          <a href="mailto:support@nyxo.market">support@nyxo.market</a>
        </aside>
      </main>
      <Footer />
    </div>
  )
}
