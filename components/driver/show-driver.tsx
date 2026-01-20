"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Driver } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CircleDollarSign,
  LucideCalendar,
  LucideWallet,
  LucideFile,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import ShowFile from "../base/show-file";
import { DownloadFile } from "../base/downLoadFile";

interface DetailBCProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Driver;
}

export function ShowDriver({ open, onOpenChange, data }: DetailBCProps) {
  const [page, setPage] = useState(1);
  const [file, setFile] = useState<string | File | undefined>(undefined);
  const [title, setTitle] = useState("");
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setPage(1);
        }
      }}
    >
      <DialogContent>
        {/* Header with burgundy background */}
        <DialogHeader>
          <DialogTitle>
            {`Chauffeur - ${data?.firstName} ${data?.lastName}`}
          </DialogTitle>
          <DialogDescription>
            {title.length > 0 ? title : "Informations relatives au chauffeur"}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        {page === 1 ? (
          <div className="grid gap-3">
            <div className="view-group">
            <span className="view-icon">
              <UserIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Noms et prénoms"}</p>
              <p className="font-semibold">
                {data?.firstName.concat(" ", data.lastName)}
              </p>
            </div>
          </div>
            <Button
              disabled={!data.licence}
              variant={"ghost"}
              className="w-full h-fit px-0 flex flex-row items-center text-start justify-start gap-2"
              onClick={() => {
                setPage(2);
                setFile(data.licence);
                setTitle("Driver Licence");
              }}
            >
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideFile size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">{"Permis de conduire"}</p>
                {data.licence ? (
                  <div className="flex gap-1.5 items-center">
                    <>
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-8 w-auto aspect-square"
                      />
                      <div>
                        <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {data.licence
                            ? "Document justificatif"
                            : "Aucun document"}
                        </p>
                      </div>
                    </>
                  </div>
                ) : (
                  <p className="text-[#A1A1AA] text-[12px]">
                    {"Aucun document"}
                  </p>
                )}
              </div>
            </Button>
            {/* ACF */}
            <Button
              disabled={!data?.idCard}
              variant={"ghost"}
              className="w-full h-fit px-0 flex flex-row items-center text-start justify-start gap-2"
              onClick={() => {
                setPage(2);
                setFile(data.idCard);
                setTitle("ID Card");
              }}
            >
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideFile size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">{"Carte nationale d'identité"}</p>
                {data?.idCard ? (
                  <div className="flex gap-1.5 items-center">
                    <>
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-8 w-auto aspect-square"
                      />
                      <div>
                        <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {data.idCard
                            ? "Document justificatif"
                            : "Aucun document"}
                        </p>
                      </div>
                    </>
                  </div>
                ) : (
                  <p className="text-[#A1A1AA] text-[12px]">
                    {"Aucun document"}
                  </p>
                )}
              </div>
            </Button>
          </div>
        ) : (
          <ShowFile
            file={file}
            setPage={setPage}
            title={`Justificatif du devis ${title}`}
          />
        )}

        {/* Footer buttons */}
        <DialogFooter>
          {page === 2 && <DownloadFile file={file} />}
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
