import { company, formatXAF } from "@/lib/utils";
import { BonsCommande } from "@/types/types";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const A4_WIDTH = 595;
const A4_HEIGHT = 842;

const TVA = 0.1925;
const IR = 0.05;
const ACOMPTE_IS = 0.022;
const PRECOMPTE = 0.02;

const styles = StyleSheet.create({
  page: {
    width: A4_WIDTH,
    height: A4_HEIGHT,
    paddingTop: 90,
    paddingBottom: 65,
    paddingHorizontal: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 19,
  },
  mainContent: { width: "100%", flexDirection: "column", marginBottom: 200 },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  name: { display: "flex", flexDirection: "row", alignItems: "center" },
  info: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftHeader: { display: "flex", flexDirection: "column" },
  rightHeaderBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 6,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  companyName: { fontSize: 12, marginBottom: 4 },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#700032",
  },
  table: { borderWidth: 1, borderColor: "#000", marginBottom: 8, minHeight: 30 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  th: {
    padding: 4,
    borderRightWidth: 1,
    borderColor: "#000",
    fontSize: 9,
    fontWeight: "bold",
  },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ddd", minHeight: 25 },
  td: { padding: 4, borderRightWidth: 1, borderColor: "#ddd", fontSize: 9 },
  colDesignation: { width: "32%" },
  colQty: { width: "6%", textAlign: "right" },
  colPu: { width: "14%", textAlign: "right" },
  colRrr: { width: "10%", textAlign: "right" },
  colTaxes: { width: "12%", textAlign: "right" }, // TVA+IR+IS+PRECOMPTE (montant)
  colTotalHt: { width: "13%", textAlign: "right" },
  colTotalTtc: { width: "13%", textAlign: "right" },
  summarySection: { marginTop: 1 },
  rightSummary: {
    marginLeft: "auto",
    width: "45%",
    padding: 6,
    backgroundColor: "#E4E4E7",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6,
    paddingVertical: 2,
  },
  bold: { fontWeight: "bold" },
  conditions: { display: "flex", flexDirection: "column", gap: 8, maxWidth: "70%" },
  conditionsList: { display: "flex", flexDirection: "column", gap: 1 },
  signRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 8,
  },
  signBox: {
    width: "45%",
    height: 60,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { position: "absolute", bottom: 30, right: 30, fontSize: 9, color: "#666" },
});

const roundFCFA = (n: number) => Math.round(n);

// supporte 5 ou 0.05
const normalizeRate = (v?: number) => {
  const n = Number(v ?? 0);
  if (!isFinite(n) || n <= 0) return 0;
  return n > 1 ? n / 100 : n;
};

const isRealRegime = (regem?: string) => {
  const v = (regem ?? "").toLowerCase().trim();
  return v === "reel" || v === "réel";
};

export const BonDocument: React.FC<{ doc: BonsCommande }> = ({ doc }) => {
  const itemsPerPage = 15;
  const totalPages = Math.ceil(doc.devi.element.length / itemsPerPage);

  const real = isRealRegime(doc.provider.regem);
  const applyTaxes = !doc.keepTaxes;

  // Taux RRR (rabais/remise/ristourne)
  const rabaisRate = normalizeRate((doc as any).rabaisAmount);
  const remiseRate = normalizeRate((doc as any).remiseAmount);
  const ristourneRate = normalizeRate((doc as any).ristourneAmount);
  const rrrRate = rabaisRate + remiseRate + ristourneRate;

  // 1) Total brut HT (à partir des lignes)
  let totalHTBrut = 0;
  doc.devi.element.forEach((el: any) => {
    totalHTBrut += el.quantity * el.priceProposed;
  });

  // 2) Net commercial = HT - RRR
  const totalRRR = totalHTBrut * rrrRate;
  const netCommercial = Math.max(0, totalHTBrut - totalRRR);

  // 3) Taxes selon règle comptable (réel uniquement)
  const taxFactor = 1 + TVA + IR + ACOMPTE_IS + PRECOMPTE; // 1.2645
  const totalTaxes = applyTaxes && real ? netCommercial * (taxFactor - 1) : 0;

  const totalNetAPayer = applyTaxes && real ? netCommercial * taxFactor : netCommercial;

  // Détail taxes (pour le résumé)
  const tvaAmount = applyTaxes && real ? netCommercial * TVA : 0;
  const irAmount = applyTaxes && real ? netCommercial * IR : 0;
  const acompteISAmount = applyTaxes && real ? netCommercial * ACOMPTE_IS : 0;
  const precompteAmount = applyTaxes && real ? netCommercial * PRECOMPTE : 0;

  return (
    <Document>
      {Array.from({ length: totalPages }).map((_, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} wrap={false}>
          {pageIndex === 0 && (
            <>
              <View style={styles.header}>
                <View style={styles.info}>
                  <View style={styles.leftHeader}>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"Site: "}</Text>
                      <Text style={styles.companyName}>{company.name}</Text>
                    </View>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"Agent: "}</Text>
                      <Text style={styles.companyName}>{doc.devi.commandRequest.name}</Text>
                    </View>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"Téléphone: "}</Text>
                      <Text style={styles.companyName}>{doc.devi.commandRequest.phone}</Text>
                    </View>
                  </View>

                  <View style={styles.leftHeader}>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"Lieu de livraison: "}</Text>
                      <Text style={styles.companyName}>{doc.deliveryLocation}</Text>
                    </View>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"Delai de livraison: "}</Text>
                      <Text style={styles.companyName}>
                        {format(doc.deliveryDelay, "dd/MM/yyyy")}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.title}>{"Bon de Commande"}</Text>
                </View>

                <View style={styles.rightHeaderBox}>
                  <View style={styles.name}>
                    <Text style={styles.companyName}>{"Nom:  "}</Text>
                    <Text style={styles.companyName}>{doc.provider.name}</Text>
                  </View>
                  <View style={styles.name}>
                    <Text style={styles.companyName}>{"Addresse:  "}</Text>
                    <Text style={styles.companyName}>{doc.provider.address}</Text>
                  </View>
                  <View style={styles.name}>
                    <Text style={styles.companyName}>{"NIU:  "}</Text>
                    <Text style={styles.companyName}>{doc.provider.NIU}</Text>
                  </View>
                  <View style={styles.name}>
                    <Text style={styles.companyName}>{"Email:  "}</Text>
                    <Text style={styles.companyName}>{doc.provider.email}</Text>
                  </View>
                  <View style={styles.name}>
                    <Text style={styles.companyName}>{"Téléphone:  "}</Text>
                    <Text style={styles.companyName}>{doc.provider.phone}</Text>
                  </View>

                  <View style={{ marginTop: 6 }}>
                    <Text style={{ fontSize: 9 }}>
                      {"Régime: "}{real ? "Réel (taxes appliquées)" : "Simplifié (net commercial)"}
                    </Text>
                    <Text style={{ fontSize: 9 }}>
                      {"Taxes: "}{applyTaxes ? "Oui" : "Non"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ borderWidth: 1, borderColor: "#000", marginBottom: 8 }}>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 1, borderRightWidth: 1, borderColor: "#000", padding: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: "bold" }}>Numéro du Bon</Text>
                  </View>
                  <View style={{ flex: 1, borderColor: "#000", padding: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: "bold" }}>Date de création</Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: "#000" }}>
                  <View style={{ flex: 2, padding: 4, borderRightWidth: 1 }}>
                    <Text>
                      {doc.reference + "/" + format(doc.createdAt, "dd/MM/yyyy" + "/", { locale: fr })}
                    </Text>
                  </View>
                  <View style={{ flex: 2, padding: 4 }}>
                    <Text>{format(doc.createdAt, "dd/MM/yyyy", { locale: fr })}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={styles.mainContent}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, styles.colDesignation]}>{"Désignation"}</Text>
                <Text style={[styles.th, styles.colQty]}>{"Qté"}</Text>
                <Text style={[styles.th, styles.colPu]}>{"PU HT"}</Text>
                <Text style={[styles.th, styles.colRrr]}>{"RRR"}</Text>
                <Text style={[styles.th, styles.colTaxes]}>
                  {real && applyTaxes ? "Taxes" : "Taxes"}
                </Text>
                <Text style={[styles.th, styles.colTotalHt]}>{"Total HT"}</Text>
                <Text style={[styles.th, styles.colTotalTtc]}>
                  {real && applyTaxes ? "Net à payer" : "Net à payer"}
                </Text>
              </View>

              {doc.devi.element
                .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                .map((it: any, idx) => {
                  const lineHT = it.quantity * it.priceProposed;

                  const lineRRR = lineHT * rrrRate;
                  const lineNetCommercial = Math.max(0, lineHT - lineRRR);

                  const lineTaxes = applyTaxes && real ? lineNetCommercial * (taxFactor - 1) : 0;
                  const lineNetToPay = applyTaxes && real
                    ? lineNetCommercial * taxFactor
                    : lineNetCommercial;

                  return (
                    <View style={styles.tr} key={idx}>
                      <Text style={[styles.td, styles.colDesignation]}>{it.title}</Text>
                      <Text style={[styles.td, styles.colQty]}>{it.quantity}</Text>

                      <Text style={[styles.td, styles.colPu]}>
                        {formatXAF(roundFCFA(it.priceProposed))}
                      </Text>

                      <Text style={[styles.td, styles.colRrr]}>
                        {formatXAF(roundFCFA(lineRRR))}
                      </Text>

                      <Text style={[styles.td, styles.colTaxes]}>
                        {formatXAF(roundFCFA(lineTaxes))}
                      </Text>

                      <Text style={[styles.td, styles.colTotalHt]}>
                        {formatXAF(roundFCFA(lineHT))}
                      </Text>

                      <Text style={[styles.td, styles.colTotalTtc]}>
                        {formatXAF(roundFCFA(lineNetToPay))}
                      </Text>
                    </View>
                  );
                })}
            </View>

            {pageIndex === totalPages - 1 && (
              <View style={styles.summarySection}>
                <View style={styles.rightSummary}>
                  <View style={styles.summaryRow}>
                    <Text>{"Total HT (brut):"}</Text>
                    <Text style={{ textAlign: "right" }}>{formatXAF(roundFCFA(totalHTBrut))}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text>
                      {"RRR ("}{Math.round(rrrRate * 100)}{"%):"}
                    </Text>
                    <Text style={{ textAlign: "right" }}>{formatXAF(roundFCFA(totalRRR))}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.bold}>{"Net commercial:"}</Text>
                    <Text style={[styles.bold, { textAlign: "right" }]}>
                      {formatXAF(roundFCFA(netCommercial))}
                    </Text>
                  </View>

                  {applyTaxes && real && (
                    <>
                      <View style={styles.summaryRow}>
                        <Text>{"TVA (19,25%):"}</Text>
                        <Text style={{ textAlign: "right" }}>{formatXAF(roundFCFA(tvaAmount))}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text>{"IR (5%):"}</Text>
                        <Text style={{ textAlign: "right" }}>{formatXAF(roundFCFA(irAmount))}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text>{"Acompte IS (2,2%):"}</Text>
                        <Text style={{ textAlign: "right" }}>{formatXAF(roundFCFA(acompteISAmount))}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text>{"Précompte (2%):"}</Text>
                        <Text style={{ textAlign: "right" }}>{formatXAF(roundFCFA(precompteAmount))}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text>{"Total taxes:"}</Text>
                        <Text style={{ textAlign: "right" }}>{formatXAF(roundFCFA(totalTaxes))}</Text>
                      </View>
                    </>
                  )}

                  <View style={[styles.summaryRow, { marginTop: 6 }]}>
                    <Text style={styles.bold}>{"Total Net à payer:"}</Text>
                    <Text style={[styles.bold, { textAlign: "right" }]}>
                      {formatXAF(roundFCFA(totalNetAPayer))}
                    </Text>
                  </View>
                </View>

                <View style={styles.signRow}>
                  <View style={styles.signBox}>
                    <Text>{"Visa Responsable des achats"}</Text>
                  </View>
                  <View style={styles.signBox}>
                    <Text>{"Signature Fournisseur"}</Text>
                  </View>
                </View>

                <View style={styles.conditions}>
                  <Text style={{ fontWeight: "semibold", color: "black" }}>{"Conditions"}</Text>
                  <View style={styles.conditionsList}>
                    <Text>
                      {
                        "1- la responsabilité de Creaconsult ne saurait en aucun cas être engagée après l'annulation de la commande par expiration de la date de livraison ci-dessus indiquée."
                      }
                    </Text>
                    <Text>{"2- Avant livraison vérifier la date et la qualité."}</Text>
                    <Text>{"3- Le tribunal de siège (Douala) est compétent en cas de litige."}</Text>
                    {doc.paymentTerms.length > 0 && <Text>{doc.paymentTerms}</Text>}
                  </View>
                </View>
              </View>
            )}
          </View>

          <Text style={styles.footer}>Page {pageIndex + 1} sur {totalPages}</Text>
        </Page>
      ))}
    </Document>
  );
};
