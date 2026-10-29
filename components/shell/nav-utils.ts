import type { ShellNavGroup } from "./sidebar"

export const ROOT_HREF = "/tableau-de-bord"

/**
 * Page active : l'entrée dont le chemin est le plus long préfixe de l'URL, de
 * sorte que `/besoins/mes-besoins/12` allume « Mes besoins ». La racine du
 * tableau de bord est un préfixe de toutes les pages : on ne l'allume que sur
 * l'URL exacte.
 */
export function findActiveHref(groups: ShellNavGroup[], pathname: string) {
  let best: string | undefined
  for (const group of groups) {
    for (const item of group.items) {
      const match =
        pathname === item.href ||
        (item.href !== ROOT_HREF && pathname.startsWith(`${item.href}/`))
      if (match && (!best || item.href.length > best.length)) best = item.href
    }
  }
  return best
}

function humanize(segment: string) {
  const text = decodeURIComponent(segment).split("-").join(" ")
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Fil d'Ariane du TopBar (Figma · « Parent › Page ») : le groupe et la page de
 * la navigation quand l'URL en fait partie, sinon les deux derniers segments
 * lisibles de l'URL (les identifiants numériques sont ignorés).
 */
export function breadcrumbFor(
  groups: ShellNavGroup[],
  pathname: string
): { parent?: string; page: string } {
  const href = findActiveHref(groups, pathname)
  if (href) {
    for (const group of groups) {
      const item = group.items.find((i) => i.href === href)
      if (item) {
        // Un groupe d'une seule page, ou une page qui porte le nom du groupe :
        // pas de niveau parent.
        const sameName = group.items.length === 1 || item.title === group.title
        return { parent: sameName ? undefined : group.title, page: item.title }
      }
    }
  }
  const segments = pathname
    .split("/")
    .filter((s) => s && s !== ROOT_HREF.slice(1) && !/^\d+$/.test(s))
  const page = segments.at(-1)
  if (!page) return { page: "Tableau de bord" }
  const parent = segments.at(-2)
  return { parent: parent ? humanize(parent) : undefined, page: humanize(page) }
}
