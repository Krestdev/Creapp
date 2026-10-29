import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/** Initiales à partir d'un nom : « Jesse Ikolo » → « JI ». */
export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

/** Avatar utilisateur : photo si fournie, sinon initiales (Figma · Avatar). */
export function UserAvatar({
  name,
  src,
  size = "default",
  className,
}: {
  name: string
  src?: string
  size?: "default" | "sm" | "lg"
  className?: string
}) {
  return (
    <Avatar size={size} className={className}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback>{initialsOf(name)}</AvatarFallback>
    </Avatar>
  )
}
