import { PixelHeading } from './PixelHeading'

const steps = [
  {
    number: '01',
    title: 'Выберите скин',
    text: 'Найдите предмет, который хотите добавить в коллекцию.',
  },
  {
    number: '02',
    title: 'Подтвердите покупку',
    text: 'Проверьте выбранный предмет и подтвердите заказ.',
  },
  {
    number: '03',
    title: 'Получите предмет',
    text: 'После обработки скин будет передан на ваш аккаунт.',
  },
  {
    number: '04',
    title: 'Пополните коллекцию',
    text: 'Новый предмет появится в вашем инвентаре.',
  },
]

export function HowItWorks() {
  return (
    <section className="how" id="how" aria-labelledby="how-title">
      <div className="process-console station-panel">
        <PixelHeading as="h2" id="how-title">Как это работает</PixelHeading>
        <ol className="process-flow" aria-label="Этапы покупки">
          {steps.map((step, index) => (
            <li key={step.number}>
              <div className="process-flow__state" aria-hidden="true">
                <span className="status-lamp" />
                <strong>{step.number}</strong>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {index < steps.length - 1 && (
                <span className="process-flow__connector" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
