"use client";
import { CrossPlatformPDFViewer } from "@/components/cross-view-pdf";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerEyebrow,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CommandRequestT } from "@/types/types";
import CotationPDF from "../bdcommande/DétailCotation";
import { DownloadButton } from "../bdcommande/TéléchargeButton";

interface DetailOrderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CommandRequestT | null;
  message?: string;
}

export function DetailOrder({
  open,
  onOpenChange,
  data,
  message,
}: DetailOrderProps) {
  if (!data) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerEyebrow>{"Demande de cotation"}</DrawerEyebrow>
          <DrawerTitle>{data.title}</DrawerTitle>
          <DrawerDescription>{"Consultez les informations associées à la demande"}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-3 [&>*]:shrink-0">
        <div style={{ height: "500px", marginBottom: "20px" }}>
          <CrossPlatformPDFViewer
            document={<CotationPDF data={data} />}
            fileName={`Demande_${data.reference}.pdf`}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Footer buttons */}
        
        </DrawerBody>
        <DrawerFooter pinned>
          <DownloadButton data={data} />
          <DrawerClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
