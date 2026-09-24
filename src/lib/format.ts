const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/** 299 -> "$299". The data has no currency field; USD is assumed (TRADEOFFS.md). */
export function formatPrice(amount: number): string {
  return usd.format(amount)
}

/** "fitness_center" -> "Fitness center"; "free Wi-Fi" -> "Free Wi-Fi". Only the
 *  first letter is touched so brand casing in the data survives. */
export function humanizeAmenity(key: string): string {
  const words = key.replace(/_/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** plural(1, "night") -> "1 night"; plural(3, "night") -> "3 nights" */
export function plural(count: number, noun: string, pluralNoun = `${noun}s`): string {
  return `${count} ${count === 1 ? noun : pluralNoun}`
}
