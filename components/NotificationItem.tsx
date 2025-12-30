import { Notification, notificationRoutes } from "@/types/types";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  notification: Notification;
  onRead: (id: number) => void;
};

const notificationColors: Record<
  string,
  {
    dot: string; // couleur du point
    border: string; // bordure gauche
    bg?: string; // fond optionnel
  }
> = {
  BESOIN_A_VALIDER: {
    dot: "bg-orange-500",
    border: "border-l-orange-500",
    bg: "bg-orange-50",
  },

  BESOIN_VALIDE: {
    dot: "bg-green-500",
    border: "border-l-green-500",
    bg: "bg-green-50",
  },

  DEVIS_A_VALIDER: {
    dot: "bg-purple-500",
    border: "border-l-purple-500",
    bg: "bg-purple-50",
  },

  BON_COMMANDE_CREE: {
    dot: "bg-blue-500",
    border: "border-l-blue-500",
    bg: "bg-blue-50",
  },

  PAIEMENT_A_VALIDER: {
    dot: "bg-yellow-500",
    border: "border-l-yellow-500",
    bg: "bg-yellow-50",
  },

  PAIEMENT_VALIDE: {
    dot: "bg-teal-500",
    border: "border-l-teal-500",
    bg: "bg-teal-50",
  },

  PAIEMENT_PAYE: {
    dot: "bg-emerald-600",
    border: "border-l-emerald-600",
    bg: "bg-emerald-50",
  },
};

export function NotificationItem({ notification, onRead }: Props) {
  const router = useRouter();

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }

    const route = notificationRoutes[notification.type];
    if (route) {
      router.push(route);
    }
  };

  const colors = notificationColors[notification.type];

  return (
    <div
      onClick={handleClick}
      className={cn(
        "cursor-pointer p-3 border-b border-l-4 transition-colors shadow rounded-xl",
        "hover:bg-muted",
        !notification.read && colors?.bg,
        colors?.border ?? "border-l-transparent"
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <p className="font-medium leading-tight">{notification.title}</p>

        {!notification.read && (
          <span
            className={cn(
              "h-2 w-2 rounded-full mt-1",
              colors?.dot ?? "bg-gray-400"
            )}
          />
        )}
      </div>

      {/* Message */}
      <p className="text-sm text-muted-foreground mt-1">
        {notification.message}
      </p>

      {/* Date */}
      <p className="text-xs text-muted-foreground mt-1">
        {new Date(notification.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
