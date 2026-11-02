"use client";

import { AccountBalance } from "@/components/ds/account-balance";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Bank, BANK_TYPES } from "@/types/types";
import {
  Eye,
  EllipsisVertical,
  LandmarkIcon,
  Pencil,
  WalletIcon,
} from "lucide-react";
import * as React from "react";
import EditBank from "./editBank";
import ViewBank from "./viewBank";

interface Props {
  data: Array<Bank>;
  canEdit: boolean;
}

const isCash = (bank: Bank) =>
  bank.type === "CASH" || bank.type === "CASH_REGISTER";

function subtitleOf(bank: Bank): string {
  const type = BANK_TYPES.find((t) => t.value === bank.type)?.name ?? "";
  const last = bank.accountNumber?.trim().slice(-4);
  if (isCash(bank)) return type;
  return last ? `${type} · ••• ${last}` : type;
}

function TotalCard({
  label,
  value,
  caption,
  valueClassName,
}: {
  label: string;
  value: string;
  caption: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-border-default bg-surface px-[18px] py-4">
      <p className="text-caption text-text-tertiary">{label}</p>
      <p
        className={cn(
          "text-heading-2 [overflow-wrap:anywhere] text-text-primary",
          valueClassName,
        )}
      >
        {value}
      </p>
      <p className="text-caption text-text-tertiary">{caption}</p>
    </div>
  );
}

function Section({
  title,
  banks,
  children,
}: {
  title: string;
  banks: Array<Bank>;
  children: (bank: Bank) => React.ReactNode;
}) {
  if (banks.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-heading-3 text-text-primary">{title}</h2>
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {banks.map((bank) => (
          <React.Fragment key={bank.id}>{children(bank)}</React.Fragment>
        ))}
      </div>
    </section>
  );
}

/**
 * États des comptes (Figma · Comptes & caisses) : totaux, puis un solde par
 * compte bancaire, par caisse et par compte temporaire. Le solde d'un compte
 * (`balance`) est son montant utilisable ; le réservé est celui de son compte
 * temporaire associé.
 */
function BankAccounts({ data, canEdit }: Props) {
  const [selected, setSelected] = React.useState<Bank>();
  const [view, setView] = React.useState<boolean>(false);
  const [edit, setEdit] = React.useState<boolean>(false);

  const mains = data.filter((b) => !b.isTemporary);
  const temporaries = data.filter((b) => b.isTemporary);
  const active = mains.filter((b) => b.Status);
  const availableTotal = active.reduce((sum, b) => sum + b.balance, 0);
  const reservedOf = (b: Bank) => b.tempAccount?.balance ?? 0;
  const reservedTotal = active.reduce((sum, b) => sum + reservedOf(b), 0);
  const withReserved = active.filter((b) => reservedOf(b) > 0).length;

  const card = (bank: Bank) => {
    const cash = isCash(bank);
    const reserved = reservedOf(bank);
    return (
      <AccountBalance
        icon={cash ? WalletIcon : LandmarkIcon}
        kind={cash ? "cash" : "bank"}
        name={bank.label}
        subtitle={subtitleOf(bank)}
        available={bank.balance}
        balance={bank.balance + reserved}
        reserved={reserved}
        warning={bank.Status && bank.balance <= 0}
        muted={!bank.Status}
        badge={
          !bank.Status ? <Badge variant="destructive">{"Désactivé"}</Badge> : null
        }
        onClick={() => {
          setSelected(bank);
          setView(true);
        }}
        menu={
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Actions pour ${bank.label}`}
              className="size-7 h-7 w-7 gap-0 border-0 bg-transparent p-0 text-text-tertiary hover:bg-hover hover:text-text-primary [&_svg]:size-[18px] [&_svg]:text-current data-[state=open]:bg-hover cursor-pointer justify-center"
            >
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelected(bank);
                  setView(true);
                }}
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!canEdit}
                onClick={() => {
                  setSelected(bank);
                  setEdit(true);
                }}
              >
                <Pencil />
                {"Modifier"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TotalCard
          label="Disponible total"
          value={formatNumber(availableTotal)}
          caption={`XAF · ${active.length} compte${active.length > 1 ? "s" : ""} et caisse${active.length > 1 ? "s" : ""}`}
        />
        <TotalCard
          label="Réservé"
          value={formatNumber(reservedTotal)}
          valueClassName={reservedTotal > 0 ? "text-status-warning-fg" : undefined}
          caption={
            withReserved > 0
              ? `sur ${withReserved} compte${withReserved > 1 ? "s" : ""}`
              : "aucun montant réservé"
          }
        />
        <TotalCard
          label="Solde réel"
          value={formatNumber(availableTotal + reservedTotal)}
          valueClassName="text-text-secondary"
          caption="disponible + réservé"
        />
        <TotalCard
          label="Comptes actifs"
          value={String(active.length)}
          caption={`sur ${mains.length} compte${mains.length > 1 ? "s" : ""} et caisse${mains.length > 1 ? "s" : ""}`}
        />
      </div>

      <Section
        title="Comptes bancaires"
        banks={mains.filter((b) => !isCash(b))}
      >
        {card}
      </Section>
      <Section title="Caisses" banks={mains.filter(isCash)}>
        {card}
      </Section>
      <Section title="Comptes temporaires" banks={temporaries}>
        {card}
      </Section>

      {data.length === 0 && (
        <p className="text-body text-text-secondary">
          {"Aucun compte pour le moment."}
        </p>
      )}

      {selected && (
        <ViewBank bank={selected} open={view} openChange={setView} />
      )}
      {selected && (
        <EditBank bank={selected} open={edit} openChange={setEdit} />
      )}
    </>
  );
}

export default BankAccounts;
