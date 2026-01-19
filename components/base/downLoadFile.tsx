"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Document, Image, Page, PDFDownloadLink } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";

interface DownloadButtonProps {
  file: string | File | undefined;
  className?: string;
}

export function DownloadFile({ file }: DownloadButtonProps) {
  const baseUrl = process.env.NEXT_PUBLIC_API;
  return (
    <PDFDownloadLink
      document={
        <Document>
          <Page size="A4" style={styles.page}>
            <Image style={styles.fullImage} src={`${baseUrl}/${file}`} fixed />
          </Page>
        </Document>
      }
      fileName={`${file}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => {
        return (
          <Button disabled={loading} variant={"primary"}>
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Génération..." : "Télécharger"}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  fullImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
});
