const accountDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatAccountDate(value: string): string {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'Дата недоступна'
  return accountDateFormatter.format(date)
}

export function accountDateTime(value: string): string | undefined {
  return Number.isFinite(new Date(value).getTime()) ? value : undefined
}
