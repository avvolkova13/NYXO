import { PixelHeading } from './PixelHeading'

const faqs = [
  {
    question: 'Как быстро приходит предмет?',
    answer:
      'После оформления заказ проходит обработку, затем скин передаётся на указанный аккаунт.',
  },
  {
    question: 'Как происходит передача скина?',
    answer:
      'Способ передачи зависит от игры и типа предмета. Перед покупкой пользователь увидит, какие данные понадобятся.',
  },
  {
    question: 'Можно ли рассмотреть предмет до покупки?',
    answer:
      'Да. Перед оформлением можно изучить изображение, состояние и доступные характеристики предмета.',
  },
  {
    question: 'Что делать, если возникла проблема с заказом?',
    answer:
      'Пользователь сможет обратиться в поддержку и указать номер заказа.',
  },
]

export function FAQ() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="faq-console station-panel">
        <PixelHeading as="h2" id="faq-title">Остались вопросы?</PixelHeading>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>
                <span className="status-lamp" aria-hidden="true" />
                {item.question}
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
