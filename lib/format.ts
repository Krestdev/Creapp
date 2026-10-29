/**
 * Formats d'affichage des nombres et montants. Volontairement sans
 * `toLocaleString` : le séparateur de milliers varie selon l'ICU du serveur et
 * du navigateur, ce qui casse l'hydratation. Ici le résultat est identique
 * partout.
 *
 * fr : 3 850 000 · en : 3,850,000 · it : 3.850.000
 */
const thousands: Record<string, string> = {
  fr: " ",
  en: ",",
  it: ".",
}

export function formatNumber(value: number, locale = "fr") {
  const sep = thousands[locale] ?? thousands.fr
  const int = Math.abs(Math.round(value)).toString()
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, sep)
  return `${value < 0 ? "−" : ""}${grouped}`
}

/** « 2 450 000 XAF » (fr) · « 2,450,000 XAF » (en) · « 2.450.000 XAF » (it). */
export function formatMoney(value: number, locale = "fr", currency = "XAF") {
  return `${formatNumber(value, locale)} ${currency}`
}

/** Mêmes formats, en français (Creapp n'est pas traduit). */
export function useFormat() {
  return {
    number: (value: number) => formatNumber(value),
    money: (value: number, currency?: string) => formatMoney(value, "fr", currency),
  }
}
