"use client";
import { ViewDrawer, ViewGrid, ViewGroup } from "@/components/ds/view-drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CommandRequestT } from "@/types/types";
import {
  CalendarFoldIcon,
  CalendarIcon,
  LucideHash,
  PhoneIcon,
  ScrollTextIcon,
  SquareAsteriskIcon,
  UserRoundIcon,
} from "lucide-react";
import { DownloadButton } from "../bdcommande/TéléchargeButton";

interface DetailOrderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CommandRequestT | null;
}

const longDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function DetailOrder({ open, onOpenChange, data }: DetailOrderProps) {
  if (!data) return null;

  return (
    <ViewDrawer
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="Demande de cotation"
      title={data.title}
      description="Consultez les informations associées à la demande de cotation"
      footer={<DownloadButton data={data} />}
    >
      <ViewGrid>
        <ViewGroup icon={SquareAsteriskIcon} label="Objet">
          <p className="font-semibold">{data.title || "N/A"}</p>
        </ViewGroup>
        <ViewGroup icon={LucideHash} label="Référence">
          <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
            <p className="text-primary-600 text-sm">
              {data.reference || "N/A"}
            </p>
          </div>
        </ViewGroup>
        <ViewGroup icon={CalendarFoldIcon} label="Date limite">
          <p className="font-semibold">
            {data.dueDate ? longDate(data.dueDate) : "-"}
          </p>
        </ViewGroup>
        <ViewGroup icon={UserRoundIcon} label="Contact principal">
          <p className="font-semibold">{data.name || "N/A"}</p>
        </ViewGroup>
        <ViewGroup icon={PhoneIcon} label="Téléphone">
          <p className="font-semibold">{data.phone || "N/A"}</p>
        </ViewGroup>
        <ViewGroup icon={CalendarIcon} label="Créé le">
          <p className="font-semibold">{longDate(data.createdAt)}</p>
        </ViewGroup>
        <ViewGroup icon={ScrollTextIcon} label="Liste des éléments" wide>
          <div className="mt-1 w-full overflow-x-auto rounded-lg border border-border-default">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{"Titre du besoin"}</TableHead>
                  <TableHead>{"Description et spécifications"}</TableHead>
                  <TableHead>{"Unité"}</TableHead>
                  <TableHead>{"Quantité"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.besoins ?? []).map((item, i) => (
                  <TableRow key={item.id ?? i}>
                    <TableCell className="whitespace-normal normal-case">
                      {item.label || "-"}
                    </TableCell>
                    <TableCell className="whitespace-normal normal-case">
                      {item.description || "-"}
                    </TableCell>
                    <TableCell className="normal-case">{item.unit || "-"}</TableCell>
                    <TableCell className="normal-case">{item.quantity || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ViewGroup>
      </ViewGrid>
    </ViewDrawer>
  );
}
