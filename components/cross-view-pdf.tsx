// components/CrossPlatformPDFViewer.tsx
import { useState, useEffect } from "react";
import { DocumentProps, usePDF } from "@react-pdf/renderer";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// Détection Android/mobile (même logique que react-device-detect, sans dépendance)
const isAndroidBrowser = () =>
  /android/i.test(navigator.userAgent) && !/wv/.test(navigator.userAgent);

interface CrossPlatformPDFViewerProps {
  /** Le même document JSX que tu passais à <PDFViewer> */
  document: React.ReactElement<DocumentProps>;
  /** Nom du fichier pour le téléchargement sur Android */
  fileName?: string;
  style?: React.CSSProperties;
  showToolbar?: boolean; // conservé pour compatibilité, ignoré sur Android
  /** Largeur des pages PDF en px (défaut : 100% du conteneur) */
  pageWidth?: number;
}

export const CrossPlatformPDFViewer = ({
  document: doc,
  fileName = "document.pdf",
  style = { width: "100%", height: "75vh" },
  pageWidth,
}: CrossPlatformPDFViewerProps) => {
  const [instance] = usePDF({ document: doc });
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const [android, setAndroid] = useState(false);

  useEffect(() => {
    setAndroid(isAndroidBrowser());
    // Mesure la largeur réelle du conteneur pour adapter les pages
    const width = window.innerWidth;
    setContainerWidth(width > 800 ? 800 : width - 32);
  }, []);

  if (instance.loading) {
    return (
      <div style={{ ...style, display: "grid", placeItems: "center" }}>
        <span>Génération du PDF…</span>
      </div>
    );
  }

  if (instance.error || !instance.blob) {
    return (
      <div style={{ ...style, display: "grid", placeItems: "center" }}>
        <span>Erreur lors de la génération du PDF.</span>
      </div>
    );
  }

  // ── Android : PDF.js viewer (fonctionne là où <iframe> échoue) ──
  if (android) {
    return (
      <div style={{ ...style, overflowY: "auto" }}>
        <Document
          file={instance.blob}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<span>Chargement…</span>}
        >
          {Array.from({ length: numPages }, (_, i) => (
            <Page
              key={i + 1}
              pageNumber={i + 1}
              width={pageWidth ?? containerWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          ))}
        </Document>
      </div>
    );
  }

  // ── Desktop / iOS : iframe classique, comportement identique à <PDFViewer> ──
  return (
    <iframe
      src={instance.url ?? undefined}
      style={{ border: "none", display: "block", ...style }}
      title={fileName}
    />
  );
};
