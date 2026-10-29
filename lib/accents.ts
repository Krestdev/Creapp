/**
 * Accents « type de besoin » (12 teintes iOS 26 du design system).
 * Les classes sont écrites en toutes lettres pour que Tailwind les détecte :
 * ne pas les construire par concaténation.
 *
 * - tile    : pastille d'icône (fond, bordure, couleur du pictogramme)
 * - text    : couleur de texte (fg) de la teinte
 * - border  : bordure de la teinte
 * - dot     : aplat de la teinte 500 (légende, point de graphique)
 * - card    : fond de carte (dégradé tint quand il existe), bordure incluse
 * - ring    : anneau de sélection
 */
export const accentNames = ["green","mint","teal","cyan","blue","indigo","purple","pink","orange","yellow","red","brown"] as const

export type Accent = (typeof accentNames)[number]

type AccentStyle = {
  tile: string
  text: string
  border: string
  dot: string
  card: string
  ring: string
}

export const accents: Record<Accent, AccentStyle> = {
  green: {
    tile: "border-accent-green-border bg-accent-green-bg text-accent-green-fg",
    text: "text-accent-green-fg",
    border: "border-accent-green-border",
    dot: "bg-accent-green",
    card: "bg-gradient-tint-green border-accent-green-border",
    ring: "ring-accent-green-fg",
  },
  mint: {
    tile: "border-accent-mint-border bg-accent-mint-bg text-accent-mint-fg",
    text: "text-accent-mint-fg",
    border: "border-accent-mint-border",
    dot: "bg-accent-mint",
    card: "bg-gradient-tint-mint border-accent-mint-border",
    ring: "ring-accent-mint-fg",
  },
  teal: {
    tile: "border-accent-teal-border bg-accent-teal-bg text-accent-teal-fg",
    text: "text-accent-teal-fg",
    border: "border-accent-teal-border",
    dot: "bg-accent-teal",
    card: "bg-accent-teal-bg border-accent-teal-border",
    ring: "ring-accent-teal-fg",
  },
  cyan: {
    tile: "border-accent-cyan-border bg-accent-cyan-bg text-accent-cyan-fg",
    text: "text-accent-cyan-fg",
    border: "border-accent-cyan-border",
    dot: "bg-accent-cyan",
    card: "bg-gradient-tint-cyan border-accent-cyan-border",
    ring: "ring-accent-cyan-fg",
  },
  blue: {
    tile: "border-accent-blue-border bg-accent-blue-bg text-accent-blue-fg",
    text: "text-accent-blue-fg",
    border: "border-accent-blue-border",
    dot: "bg-accent-blue",
    card: "bg-gradient-tint-blue border-accent-blue-border",
    ring: "ring-accent-blue-fg",
  },
  indigo: {
    tile: "border-accent-indigo-border bg-accent-indigo-bg text-accent-indigo-fg",
    text: "text-accent-indigo-fg",
    border: "border-accent-indigo-border",
    dot: "bg-accent-indigo",
    card: "bg-gradient-tint-indigo border-accent-indigo-border",
    ring: "ring-accent-indigo-fg",
  },
  purple: {
    tile: "border-accent-purple-border bg-accent-purple-bg text-accent-purple-fg",
    text: "text-accent-purple-fg",
    border: "border-accent-purple-border",
    dot: "bg-accent-purple",
    card: "bg-gradient-tint-purple border-accent-purple-border",
    ring: "ring-accent-purple-fg",
  },
  pink: {
    tile: "border-accent-pink-border bg-accent-pink-bg text-accent-pink-fg",
    text: "text-accent-pink-fg",
    border: "border-accent-pink-border",
    dot: "bg-accent-pink",
    card: "bg-gradient-tint-pink border-accent-pink-border",
    ring: "ring-accent-pink-fg",
  },
  orange: {
    tile: "border-accent-orange-border bg-accent-orange-bg text-accent-orange-fg",
    text: "text-accent-orange-fg",
    border: "border-accent-orange-border",
    dot: "bg-accent-orange",
    card: "bg-gradient-tint-orange border-accent-orange-border",
    ring: "ring-accent-orange-fg",
  },
  yellow: {
    tile: "border-accent-yellow-border bg-accent-yellow-bg text-accent-yellow-fg",
    text: "text-accent-yellow-fg",
    border: "border-accent-yellow-border",
    dot: "bg-accent-yellow",
    card: "bg-gradient-tint-yellow border-accent-yellow-border",
    ring: "ring-accent-yellow-fg",
  },
  red: {
    tile: "border-accent-red-border bg-accent-red-bg text-accent-red-fg",
    text: "text-accent-red-fg",
    border: "border-accent-red-border",
    dot: "bg-accent-red",
    card: "bg-gradient-tint-red border-accent-red-border",
    ring: "ring-accent-red-fg",
  },
  brown: {
    tile: "border-accent-brown-border bg-accent-brown-bg text-accent-brown-fg",
    text: "text-accent-brown-fg",
    border: "border-accent-brown-border",
    dot: "bg-accent-brown",
    card: "bg-accent-brown-bg border-accent-brown-border",
    ring: "ring-accent-brown-fg",
  },
}
