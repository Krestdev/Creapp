"use client";

import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getRoleBadge } from "@/lib/utils";
import { RequestModelT, User } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  FileIcon,
  Mail,
  Phone,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";

interface Props {
  user: User;
  requests: Array<RequestModelT>;
}

// Map request state to badge styling
const STATE_CONFIG: Record<
  string,
  {
    label: string;
    variant: React.ComponentProps<typeof Badge>["variant"];
    icon: React.ElementType;
  }
> = {
  pending: { label: "En attente", variant: "yellow", icon: Clock },
  "in-review": { label: "En révision", variant: "blue", icon: Activity },
  validated: { label: "Validé", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Rejeté", variant: "destructive", icon: XCircle },
  cancel: { label: "Annulé", variant: "default", icon: AlertCircle },
  store: { label: "Déstocké", variant: "teal", icon: ShieldCheck },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  low: { label: "Basse", variant: "default" },
  medium: { label: "Normale", variant: "blue" },
  high: { label: "Élevée", variant: "amber" },
  urgent: { label: "Urgent", variant: "destructive" },
};

function getStateConfig(state: string) {
  return (
    STATE_CONFIG[state] ?? { label: state, variant: "default", icon: Activity }
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  colorClass,
  bgClass,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-5 rounded-xl border border-input bg-card shadow-sm">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgClass}`}
      >
        <Icon size={18} className={colorClass} />
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ProfilePage({ user, requests }: Props) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`;

  const roles = user.role ?? [];
  const departments =
    user.members?.map((m) => m.department?.label).filter(Boolean) ?? [];

  // Analytics
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.state === "pending").length;
    const inReview = requests.filter((r) => r.state === "in-review").length;
    const validated = requests.filter((r) => r.state === "validated").length;
    const rejected = requests.filter((r) => r.state === "rejected").length;
    const cancelled = requests.filter((r) => r.state === "cancel").length;
    return { total, pending, inReview, validated, rejected, cancelled };
  }, [requests]);

  // Latest 5 requests sorted by createdAt desc
  const latestRequests = useMemo(
    () =>
      [...requests]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [requests],
  );

  const memberChief = user.members?.find((m) => m.chief);

  const statCards: Array<StatisticProps> = [
    {
      title: "Total besoins",
      value: stats.total,
      variant: "default",
      more: {
        title: "Annulés",
        value: stats.cancelled,
      },
    },
    {
      title: "En attente",
      value: stats.pending,
      variant: "secondary",
    },
    {
      title: "Validés",
      value: stats.validated,
      variant: "success",
      more: {
        title: "Rejetés",
        value: stats.rejected,
      },
    },
  ];

  return (
    <div className="content">
      {/* ── User Identity Card ── */}
      <div>
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="size-20 rounded-full bg-linear-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white text-2xl font-bold uppercase">
              {initials}
            </div>
            <span
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-background ${user.status === "active" ? "bg-green-500" : "bg-gray-400"
                }`}
            />
          </div>

          {/* Name & roles */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-bold truncate">{fullName}</h2>
              {memberChief && (
                <Badge variant="primary" className="w-fit">
                  <ShieldCheck size={12} className="mr-1" />
                  Chef de département
                </Badge>
              )}
            </div>

            {user.post && (
              <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                {user.post}
              </p>
            )}

            {/* Roles */}
            {roles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {roles.map((role) => {
                  const { label, variant } = getRoleBadge(role);
                  return (
                    <Badge key={role.id} variant={variant}>
                      {label}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <Separator className="my-5" />

        {/* Contact info */}
        <div className="grid grid-cols-1 @min-[480px]:grid-cols-2 @min-[768px]:grid-cols-3 @min-[1024px]:grid-cols-4 gap-4">
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Phone} label="Téléphone" value={user.phone ?? "—"} />
          <InfoRow
            icon={Calendar}
            label="Dernière connexion"
            value={
              user.lastConnection
                ? format(new Date(user.lastConnection), "dd MMM yyyy, HH:mm", {
                  locale: fr,
                })
                : "—"
            }
          />
          <div className="view-group">
            <div className="view-icon"><FileIcon /></div>
            <div className="flex flex-col">
              <p className="view-group-title">{"Signature"}</p>
              {
                !!user.signature ? (
                  <Link href={`${process.env.NEXT_PUBLIC_API}/${user.signature}`} target="_blank" className="flex gap-0.5 items-center">
                    <img src={"/images/pdf.png"} alt="justificatif" className="h-7 w-auto aspect-square" />
                    <p className="text-foreground font-medium">{"Signature"}</p>
                  </Link>
                ) : (
                  <Link href={"/tableau-de-bord/profil/signature"}>
                    <Button size={"sm"} variant={"primary"}>{"Ajouter une signature"}</Button>
                  </Link>
                )
              }
            </div>
          </div>
          {departments.length > 0 && (
            <InfoRow
              icon={Briefcase}
              label="Département(s)"
              value={departments.join(", ")}
            />
          )}
          {user.createdAt && (
            <InfoRow
              icon={Calendar}
              label="Membre depuis"
              value={format(new Date(user.createdAt), "dd MMMM yyyy", {
                locale: fr,
              })}
            />
          )}
        </div>
      </div>

      {/* ── Quick Analytics ── */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-600" />
          {"Statistiques des Besoins"}
        </h3>
        <div className="grid-stats-4">
          {statCards.map((statCard) => (
            <StatisticCard key={statCard.title} {...statCard} />
          ))}
        </div>
      </div>

      {/* ── Latest Requests ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock size={16} className="text-primary-600" />
            Dernières demandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucune demande trouvée.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {latestRequests.map((req) => {
                const stateConf = getStateConfig(req.state);
                const StateIcon = stateConf.icon;
                const priorityConf = PRIORITY_CONFIG[req.priority] ?? {
                  label: req.priority,
                  variant: "default" as const,
                };

                return (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3"
                  >
                    <div className="flex gap-3 items-start sm:items-center min-w-0">
                      <div className="shrink-0 mt-0.5 sm:mt-0">
                        <StateIcon
                          size={18}
                          className={
                            req.state === "validated"
                              ? "text-green-600"
                              : req.state === "rejected" ||
                                req.state === "cancel"
                                ? "text-red-500"
                                : req.state === "in-review"
                                  ? "text-blue-500"
                                  : "text-yellow-500"
                          }
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {req.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {req.ref} ·{" "}
                          {format(new Date(req.createdAt), "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-7 sm:ml-0">
                      <Badge
                        variant={
                          priorityConf.variant as React.ComponentProps<
                            typeof Badge
                          >["variant"]
                        }
                      >
                        {priorityConf.label}
                      </Badge>
                      <Badge variant={stateConf.variant}>
                        {stateConf.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="view-group">
      <div className="view-icon">
        <Icon />
      </div>
      <div className="flex flex-col">
        <p className="view-group-title">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default ProfilePage;
