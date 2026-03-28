import { company, formatXAF } from "@/lib/utils";
import { BonsCommande } from "@/types/types";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ACOMPTE_IS_REEL = 0.022;
const IR_SIMPLIFIE = 0.055;
const PRECOMPTE = 0.02;

const roundFCFA = (n: number) => Math.round(n);

const normalizeRate = (v?: number): number => {
  if (typeof v === "number") return v;
  return 0;
};

const isRealRegime = (regem?: string) => {
  const v = (regem ?? "").toLowerCase().trim();
  return v === "reel" || v === "réel";
};

const styles = StyleSheet.create({
  page: {
    size: "A4",
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#111827",
    paddingTop: 92,
    paddingBottom: 42,
    paddingHorizontal: 22,
  },

  watermark: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    minHeight: "100%",
    zIndex: -1,
  },

  content: {
    flexDirection: "column",
    gap: 12,
  },

  topGrid: {
    flexDirection: "row",
    gap: 10,
    alignItems: "stretch",
  },

  blockLeft: {
    width: "38%",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
    justifyContent: "space-between",
    minHeight: 132,
  },

  blockRight: {
    width: "62%",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 0,
    overflow: "hidden",
    minHeight: 132,
  },

  smallLabel: {
    fontSize: 8,
    color: "#6B7280",
    marginBottom: 2,
  },

  text: {
    fontSize: 9,
    color: "#111827",
  },

  textMuted: {
    fontSize: 8.5,
    color: "#4B5563",
  },

  docTitleWrap: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  docTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#700032",
    marginBottom: 0,
  },

  providerHeader: {
    backgroundColor: "#700032",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  providerHeaderText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  providerBody: {
    padding: 0,
  },

  providerRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  providerCell: {
    width: "50%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 34,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    justifyContent: "center",
  },

  providerCellLast: {
    borderRightWidth: 0,
  },

  providerLabel: {
    fontSize: 7.5,
    color: "#6B7280",
    marginBottom: 2,
    textTransform: "uppercase",
  },

  providerValue: {
    fontSize: 9,
    color: "#111827",
  },

  metaWrap: {
    flexDirection: "row",
    gap: 10,
  },

  metaCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
  },

  metaLabel: {
    fontSize: 8,
    color: "#6B7280",
    marginBottom: 3,
  },

  metaValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },

  tableCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    overflow: "hidden",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    minHeight: 28,
    alignItems: "center",
  },

  th: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },

  tr: {
    flexDirection: "row",
    minHeight: 26,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },

  td: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    fontSize: 8,
    color: "#111827",
  },

  tdTextRight: {
    textAlign: "right",
  },

  tdTextCenter: {
    textAlign: "center",
  },

  colDesignation: { width: "27%" },
  colQty: { width: "6%" },
  colPu: { width: "12%" },
  colRrr: { width: "10%" },
  colTva: { width: "10%" },
  colIsIr: { width: "10%" },
  colPrecompte: { width: "10%" },
  colHtNet: { width: "7%" },
  colNet: { width: "8%", borderRightWidth: 0 },

  tableFooterNote: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FAFAFA",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  financeWrap: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },

  conditionsCard: {
    width: "52%",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
  },

  summaryCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
  },

  cardTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#700032",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  conditionItem: {
    fontSize: 8.5,
    color: "#111827",
    marginBottom: 4,
    lineHeight: 1.4,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 3,
  },

  summaryLabel: {
    fontSize: 8.5,
    color: "#374151",
  },

  summaryValue: {
    fontSize: 8.5,
    color: "#111827",
    fontWeight: "bold",
    textAlign: "right",
  },

  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    marginVertical: 5,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderTopColor: "#700032",
  },

  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#700032",
  },

  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#700032",
    textAlign: "right",
  },

  signaturesWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4,
  },

  signatureBox: {
    width: "48.5%",
    minHeight: 72,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 8,
    justifyContent: "space-between",
  },

  signatureTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },

  signatureLine: {
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: "#9CA3AF",
  },

  footer: {
    position: "absolute",
    bottom: 92,
    left: 22,
    right: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#6B7280",
  },
});

export const BonDocument: React.FC<{ doc: BonsCommande }> = ({ doc }) => {
  const real = isRealRegime(doc.provider.regem);
  const applyPrecompte = doc.hasPrecompt === true;

  const lines = doc.devi.element.map((el) => {
    const lineHTBrut = (el.quantity ?? 0) * (el.priceProposed ?? 0);
    const lineRRR = lineHTBrut * (el.reduction / 100);
    const lineBase = Math.max(0, lineHTBrut - lineRRR);

    const lineTVA = real ? lineBase * (el.tva / 100) : 0;

    const isIrRate = !el.hasIs
      ? 0
      : el.hasIs
        ? real
          ? ACOMPTE_IS_REEL
          : IR_SIMPLIFIE
        : 0;

    const lineIsIr = lineBase * isIrRate;
    const linePrecompte = applyPrecompte ? lineBase * PRECOMPTE : 0;

    const lineNetToPay = lineBase + lineTVA - lineIsIr + linePrecompte;

    return {
      ...el,
      lineHTBrut,
      lineRRR,
      lineBase,
      lineTVA,
      lineIsIr,
      linePrecompte,
      lineNetToPay,
    };
  });

  const totalHTBrut = lines.reduce((sum, l) => sum + l.lineHTBrut, 0);
  const totalRRR = lines.reduce((sum, l) => sum + l.lineRRR, 0);
  const totalBase = lines.reduce((sum, l) => sum + l.lineBase, 0);
  const totalTVA = lines.reduce((sum, l) => sum + l.lineTVA, 0);
  const totalIsIr = lines.reduce((sum, l) => sum + l.lineIsIr, 0);
  const totalPrecompte = lines.reduce((sum, l) => sum + l.linePrecompte, 0);
  const totalNetAPayer = lines.reduce((sum, l) => sum + l.lineNetToPay, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Image fixed style={styles.watermark} src="/images/crea.jpg" />

        <View style={styles.content}>
          <View style={styles.topGrid} fixed>
            <View style={styles.blockLeft}>
              <View>
                <Text style={styles.smallLabel}>Site</Text>
                <Text style={styles.text}>{company.name}</Text>
              </View>

              <View>
                <Text style={styles.smallLabel}>Agent demandeur</Text>
                <Text style={styles.text}>{doc.devi.commandRequest.name}</Text>
              </View>

              <View>
                <Text style={styles.smallLabel}>Téléphone</Text>
                <Text style={styles.text}>{doc.devi.commandRequest.phone}</Text>
              </View>

              <View>
                <Text style={styles.smallLabel}>Lieu de livraison</Text>
                <Text style={styles.text}>{doc.deliveryLocation}</Text>
              </View>

              <View>
                <Text style={styles.smallLabel}>Délai de livraison</Text>
                <Text style={styles.text}>
                  {format(doc.deliveryDelay, "dd/MM/yyyy", { locale: fr })}
                </Text>
              </View>

              <View style={styles.docTitleWrap}>
                <Text style={styles.docTitle}>Bon de commande</Text>
              </View>
            </View>

            <View style={styles.blockRight}>
              <View style={styles.providerHeader}>
                <Text style={styles.providerHeaderText}>Fournisseur</Text>
              </View>

              <View style={styles.providerBody}>
                <View style={styles.providerRow}>
                  <View style={styles.providerCell}>
                    <Text style={styles.providerLabel}>Nom</Text>
                    <Text style={styles.providerValue}>
                      {doc.provider.name}
                    </Text>
                  </View>
                  <View style={[styles.providerCell, styles.providerCellLast]}>
                    <Text style={styles.providerLabel}>Adresse</Text>
                    <Text style={styles.providerValue}>
                      {doc.provider.address || "-"}
                    </Text>
                  </View>
                </View>

                <View style={styles.providerRow}>
                  <View style={styles.providerCell}>
                    <Text style={styles.providerLabel}>NIU</Text>
                    <Text style={styles.providerValue}>
                      {doc.provider.NIU || "-"}
                    </Text>
                  </View>
                  <View style={[styles.providerCell, styles.providerCellLast]}>
                    <Text style={styles.providerLabel}>Email</Text>
                    <Text style={styles.providerValue}>
                      {doc.provider.email || "-"}
                    </Text>
                  </View>
                </View>

                <View style={styles.providerRow}>
                  <View style={styles.providerCell}>
                    <Text style={styles.providerLabel}>Téléphone</Text>
                    <Text style={styles.providerValue}>
                      {doc.provider.phone || "-"}
                    </Text>
                  </View>
                </View>

                <View style={styles.providerRow}>
                  <View style={styles.providerCell}>
                    <Text style={styles.providerLabel}>Précompte</Text>
                    <Text style={styles.providerValue}>
                      {applyPrecompte ? "Oui" : "Non"}
                    </Text>
                  </View>
                  <View style={[styles.providerCell, styles.providerCellLast]}>
                    <Text style={styles.providerLabel}>Régime fiscal</Text>
                    <Text style={styles.providerValue}>
                      {real ? "Réel" : "Simplifié"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.metaWrap} fixed>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Référence du bon</Text>
              <Text style={styles.metaValue}>{doc.reference}</Text>
            </View>

            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Date de création</Text>
              <Text style={styles.metaValue}>
                {format(doc.createdAt, "dd/MM/yyyy", { locale: fr })}
              </Text>
            </View>
          </View>

          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colDesignation]}>
                Désignation
              </Text>
              <Text style={[styles.th, styles.colQty]}>Qté</Text>
              <Text style={[styles.th, styles.colPu]}>PU HT</Text>
              <Text style={[styles.th, styles.colRrr]}>RRR</Text>
              <Text style={[styles.th, styles.colTva]}>TVA</Text>
              <Text style={[styles.th, styles.colIsIr]}>IS / IR</Text>
              <Text style={[styles.th, styles.colPrecompte]}>Précompte</Text>
              <Text style={[styles.th, styles.colHtNet]}>HT Net</Text>
              <Text style={[styles.th, styles.colNet]}>Net à payer</Text>
            </View>

            {lines.map((it: any, idx: number) => (
              <View style={styles.tr} key={idx}>
                <Text style={[styles.td, styles.colDesignation]}>
                  {it.title}
                </Text>

                <Text style={[styles.td, styles.colQty, styles.tdTextCenter]}>
                  {it.quantity}
                </Text>

                <Text style={[styles.td, styles.colPu, styles.tdTextRight]}>
                  {formatXAF(roundFCFA(it.priceProposed))}
                </Text>

                <Text style={[styles.td, styles.colRrr, styles.tdTextRight]}>
                  {formatXAF(roundFCFA(it.lineRRR))}
                </Text>

                <Text style={[styles.td, styles.colTva, styles.tdTextRight]}>
                  {formatXAF(roundFCFA(it.lineTVA))}
                </Text>

                <Text style={[styles.td, styles.colIsIr, styles.tdTextRight]}>
                  {formatXAF(roundFCFA(it.lineIsIr))}
                </Text>

                <Text
                  style={[styles.td, styles.colPrecompte, styles.tdTextRight]}
                >
                  {formatXAF(roundFCFA(it.linePrecompte))}
                </Text>

                <Text style={[styles.td, styles.colHtNet, styles.tdTextRight]}>
                  {formatXAF(roundFCFA(it.lineBase))}
                </Text>

                <Text style={[styles.td, styles.colNet, styles.tdTextRight]}>
                  {formatXAF(roundFCFA(it.lineNetToPay))}
                </Text>
              </View>
            ))}

            <View style={styles.tableFooterNote}>
              <Text style={styles.textMuted}>
                Les montants sont exprimés en FCFA. La TVA est nulle pour les
                fournisseurs au régime IGS. Les retenues IS / IR ne s’appliquent
                que selon les paramètres du bon et des lignes concernées.
              </Text>
            </View>
          </View>

          <View style={styles.financeWrap}>
            <View style={styles.conditionsCard}>
              <Text style={styles.cardTitle}>Conditions</Text>

              {doc.commandConditions?.map((condition, index) => (
                <Text key={index} style={styles.conditionItem}>
                  {`${index + 1}. ${condition.content}`}
                </Text>
              ))}

              {doc.paymentTerms && doc.paymentTerms.length > 0 && (
                <>
                  <Text
                    style={[
                      styles.cardTitle,
                      { marginTop: 8, marginBottom: 6 },
                    ]}
                  >
                    Conditions additionnelles
                  </Text>
                  <Text style={styles.conditionItem}>{doc.paymentTerms}</Text>
                </>
              )}
            </View>

            <View style={styles.summaryCard} wrap={false}>
              <Text style={styles.cardTitle}>Récapitulatif financier</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total HT brut</Text>
                <Text style={styles.summaryValue}>
                  {formatXAF(roundFCFA(totalHTBrut))}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{`Réduction)`}</Text>
                <Text style={styles.summaryValue}>
                  {formatXAF(roundFCFA(totalRRR))}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>HT net commercial</Text>
                <Text style={styles.summaryValue}>
                  {formatXAF(roundFCFA(totalBase))}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{`TVA`}</Text>
                <Text style={styles.summaryValue}>
                  {formatXAF(roundFCFA(totalTVA))}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{`IS / IR`}</Text>
                <Text style={styles.summaryValue}>
                  {formatXAF(roundFCFA(totalIsIr))}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Précompte (2%)</Text>
                <Text style={styles.summaryValue}>
                  {formatXAF(roundFCFA(totalPrecompte))}
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total net à payer</Text>
                <Text style={styles.totalValue}>
                  {formatXAF(roundFCFA(totalNetAPayer))}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.signaturesWrap}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>
                Visa Responsable des achats
              </Text>
              <View style={styles.signatureLine} />
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Visa DG</Text>
              <View style={styles.signatureLine} />
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>{company.name}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
