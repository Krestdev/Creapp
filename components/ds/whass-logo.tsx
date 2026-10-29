import Image from "next/image"
import { cn } from "@/lib/utils"

/** Boîte de référence du logo dans le Figma (WhassAI › Logo = 88 × 88). */
const BOX = 88

/**
 * Logo Whass IA (Figma · WhassAI › Logo). Exporté du Figma en PNG puis
 * détouré (public/whass/logo.png, 323 × 256 à @4x) : c'est un composite de
 * calques masqués côté Figma, à ne pas redessiner en code. `size` est le côté
 * de la boîte de référence ; le pictogramme (≈ 79 × 62 px sur 88) y est placé
 * comme dans le Figma.
 */
export function WhassLogo({
  size = 32,
  className,
}: {
  size?: number
  className?: string
}) {
  const k = size / BOX
  return (
    <span
      aria-hidden
      className={cn("relative block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/whass/logo.png"
        alt=""
        width={323}
        height={256}
        unoptimized
        style={{
          width: (323 / 4) * k,
          height: (256 / 4) * k,
          left: 50 * k,
          top: 43 * k,
        }}
        className="absolute max-w-none -translate-x-1/2 -translate-y-1/2"
      />
    </span>
  )
}
