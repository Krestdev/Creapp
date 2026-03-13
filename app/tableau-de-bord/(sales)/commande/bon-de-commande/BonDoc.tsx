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

const TVA = 0.1925;
const ACOMPTE_IS_REEL = 0.022;
const IR_SIMPLIFIE = 0.055;
const PRECOMPTE = 0.02;

const styles = StyleSheet.create({
  page: {
    size: "A4",
    position: "relative",
    overflow: "hidden",
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  content: {
    paddingTop: 100,
    paddingBottom: 120,
    paddingHorizontal: 20,
    display: "flex",
    flexDirection: "column",
    gap: 19,
    width: "100%",
    height: "100%",
  },
  mainContent: {
    width: "100%",
    flexDirection: "column",
    gap: 8,
    marginBottom: 200,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  name: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 4,
  },
  tableName: {
    display: "flex",
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "#000",
    paddingLeft: 6,
    paddingRight: 6,
    paddingVertical: 3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#000",
  },
  info: {
    width: "35%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftHeader: {
    display: "flex",
    flexDirection: "column",
  },
  companyName: {
    fontSize: 9,
  },
  title: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    color: "#700032",
  },
  table: {
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 8,
    minHeight: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderColor: "#000",
    minHeight: 26,
    alignItems: "center",
  },
  th: {
    paddingHorizontal: 4,
    paddingVertical: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    fontSize: 8,
    fontWeight: "bold",
    minHeight: 26,
    justifyContent: "center",
  },
  tr: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#DDD",
    minHeight: 24,
    alignItems: "center",
  },
  td: {
    paddingHorizontal: 4,
    paddingVertical: 5,
    borderRightWidth: 1,
    borderColor: "#DDD",
    fontSize: 8,
  },

  // colonnes ajustées pour tenir sur A4
  colDesignation: { width: "27%" },
  colQty: { width: "6%", textAlign: "right" },
  colPu: { width: "12%", textAlign: "right" },
  colRrr: { width: "10%", textAlign: "right" },
  colTva: { width: "10%", textAlign: "right" },
  colIsIr: { width: "10%", textAlign: "right" },
  colPrecompte: { width: "10%", textAlign: "right" },
  colTotalHt: { width: "7%", textAlign: "right" },
  colNet: { width: "8%", textAlign: "right", borderRightWidth: 0 },

  summarySection: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  rightSummary: {
    marginLeft: "auto",
    width: "50%",
    padding: 8,
    backgroundColor: "#E4E4E7",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 2,
  },
  bold: {
    fontWeight: "bold",
  },
  conditions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxWidth: "70%",
  },
  conditionsList: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  signRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 8,
    gap: 6,
  },
  signBox: {
    width: "31.5%",
    height: 60,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    right: 30,
    fontSize: 9,
    color: "#666",
  },
  watermark: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 1,
  },
});

const roundFCFA = (n: number) => Math.round(n);

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
  const real = isRealRegime(doc.provider.regem);

  // keepTaxes = on ne garde pas les retenues IS/IR
  const applyIsIr = !doc.keepTaxes;
  const applyPrecompte = !!doc.hasPrecompt;

  const rabaisRate = normalizeRate((doc as any).rabaisAmount);
  const remiseRate = normalizeRate((doc as any).remiseAmount);
  const ristourneRate = normalizeRate((doc as any).ristourneAmount);
  const rrrRate = rabaisRate + remiseRate + ristourneRate;

  const lines = doc.devi.element.map((el: any) => {
    const lineHTBrut = (el.quantity ?? 0) * (el.priceProposed ?? 0);
    const lineRRR = lineHTBrut * rrrRate;
    const lineBase = Math.max(0, lineHTBrut - lineRRR);

    // TVA : uniquement au réel
    const lineTVA = real ? lineBase * TVA : 0;

    // IS/IR : seulement si keepTaxes = false et si l'élément est concerné
    const isIrRate = !applyIsIr
      ? 0
      : el.hasIs
        ? real
          ? ACOMPTE_IS_REEL
          : IR_SIMPLIFIE
        : 0;

    const lineIsIr = lineBase * isIrRate;

    // Précompte : appliqué sur la base de ligne si activé
    const linePrecompte = applyPrecompte ? lineBase * PRECOMPTE : 0;

    // Net à payer selon régime
    const lineNetToPay = real
      ? lineBase + lineTVA - lineIsIr - linePrecompte
      : lineBase - lineIsIr - linePrecompte;

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
        <Image fixed style={styles.watermark} src={"/images/crea.jpg"} />

        <View style={styles.content}>
          <View fixed>
            <View style={styles.header}>
              <View style={styles.info}>
                <View style={styles.leftHeader}>
                  <View style={styles.name}>
                    <Text style={styles.companyName}>{"Site: "}</Text>
                    <Text style={styles.companyName}>{company.name}</Text>
                  </View>
                  <View style={styles.name}>
                    <Text style={styles.companyName}>{"Agent: "}</Text>
                    <Text style={styles.companyName}>
                      {doc.devi.commandRequest.name}
                    </Text>
                  </View>
                  <View style={styles.name}>
                    <Text style={styles.companyName}>{"Téléphone: "}</Text>
                    <Text style={styles.companyName}>
                      {doc.devi.commandRequest.phone}
                    </Text>
                  </View>
                </View>

                <View style={styles.leftHeader}>
                  <View style={styles.name}>
                    <Text style={styles.companyName}>
                      {"Lieu de livraison: "}
                    </Text>
                    <Text style={styles.companyName}>
                      {doc.deliveryLocation}
                    </Text>
                  </View>
                  <View style={styles.name}>
                    <Text style={styles.companyName}>
                      {"Délai de livraison: "}
                    </Text>
                    <Text style={styles.companyName}>
                      {format(doc.deliveryDelay, "dd/MM/yyyy")}
                    </Text>
                  </View>
                </View>

                <Text style={styles.title}>{"Bon de Commande"}</Text>
              </View>

              <View
                style={{ width: "60%", borderColor: "#000", borderTopWidth: 1 }}
              >
                <View style={styles.tableRow}>
                  <View style={styles.tableName}>
                    <Text style={styles.companyName}>{"Nom:  "}</Text>
                    <Text style={styles.companyName}>{doc.provider.name}</Text>
                  </View>
                  <View style={styles.tableName}>
                    <Text style={styles.companyName}>{"Adresse:  "}</Text>
                    <Text style={styles.companyName}>
                      {doc.provider.address}
                    </Text>
                  </View>
                </View>
                <View style={styles.tableRow}>
                  <View style={styles.tableName}>
                    <Text style={styles.companyName}>{"NIU:  "}</Text>
                    <Text style={styles.companyName}>{doc.provider.NIU}</Text>
                  </View>
                  <View style={styles.tableName}>
                    <Text style={styles.companyName}>{"Email:  "}</Text>
                    <Text style={styles.companyName}>{doc.provider.email}</Text>
                  </View>
                </View>
                <View style={styles.tableRow}>
                  <View style={styles.tableName}>
                    <Text style={styles.companyName}>{"Téléphone:  "}</Text>
                    <Text style={styles.companyName}>{doc.provider.phone}</Text>
                  </View>
                  <View style={styles.tableName} />
                </View>
                <View style={styles.tableRow}>
                  <View style={styles.tableName}>
                    <Text style={{ fontSize: 9 }}>
                      {"Régime: "}
                      {real ? "Réel" : "Simplifié"}
                    </Text>
                  </View>
                  <View style={styles.tableName}>
                    <Text style={{ fontSize: 9 }}>
                      {"Retenue IS/IR: "}
                      {applyIsIr ? "Oui" : "Non"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View
              style={{ borderWidth: 1, borderColor: "#000", marginBottom: 4 }}
            >
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flex: 1,
                    borderRightWidth: 1,
                    borderColor: "#000",
                    padding: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                    {"Numéro du Bon"}
                  </Text>
                </View>
                <View style={{ flex: 1, borderColor: "#000", padding: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                    {"Date de création"}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  borderTopWidth: 1,
                  borderColor: "#000",
                }}
              >
                <View style={{ flex: 2, padding: 4, borderRightWidth: 1 }}>
                  <Text>
                    {doc.reference +
                      "/" +
                      format(doc.createdAt, "dd/MM/yyyy" + "/", { locale: fr })}
                  </Text>
                </View>
                <View style={{ flex: 2, padding: 4 }}>
                  <Text>
                    {format(doc.createdAt, "dd/MM/yyyy", { locale: fr })}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={[styles.th, styles.colDesignation]}>
                  <Text>{"Désignation"}</Text>
                </View>
                <View style={[styles.th, styles.colQty]}>
                  <Text>{"Qté"}</Text>
                </View>
                <View style={[styles.th, styles.colPu]}>
                  <Text>{"PU HT"}</Text>
                </View>
                <View style={[styles.th, styles.colRrr]}>
                  <Text>{"RRR"}</Text>
                </View>
                <View style={[styles.th, styles.colTva]}>
                  <Text>{"TVA"}</Text>
                </View>
                <View style={[styles.th, styles.colIsIr]}>
                  <Text>{"IS / IR"}</Text>
                </View>
                <View style={[styles.th, styles.colPrecompte]}>
                  <Text>{"Précompte"}</Text>
                </View>
                <View style={[styles.th, styles.colTotalHt]}>
                  <Text>{"HT Net"}</Text>
                </View>
                <View style={[styles.th, styles.colNet]}>
                  <Text>{"Net à payer"}</Text>
                </View>
              </View>

              {lines.map((it: any, idx: number) => (
                <View style={styles.tr} key={idx}>
                  <Text style={[styles.td, styles.colDesignation]}>
                    {it.title}
                  </Text>
                  <Text style={[styles.td, styles.colQty]}>{it.quantity}</Text>

                  <Text style={[styles.td, styles.colPu]}>
                    {formatXAF(roundFCFA(it.priceProposed))}
                  </Text>

                  <Text style={[styles.td, styles.colRrr]}>
                    {formatXAF(roundFCFA(it.lineRRR))}
                  </Text>

                  <Text style={[styles.td, styles.colTva]}>
                    {formatXAF(roundFCFA(it.lineTVA))}
                  </Text>

                  <Text style={[styles.td, styles.colIsIr]}>
                    {formatXAF(roundFCFA(it.lineIsIr))}
                  </Text>

                  <Text style={[styles.td, styles.colPrecompte]}>
                    {formatXAF(roundFCFA(it.linePrecompte))}
                  </Text>

                  <Text style={[styles.td, styles.colTotalHt]}>
                    {formatXAF(roundFCFA(it.lineBase))}
                  </Text>

                  <Text style={[styles.td, styles.colNet]}>
                    {formatXAF(roundFCFA(it.lineNetToPay))}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.summarySection}>
              <View style={styles.rightSummary} wrap={false}>
                <View style={styles.summaryRow}>
                  <Text>{"Total HT brut :"}</Text>
                  <Text>{formatXAF(roundFCFA(totalHTBrut))}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text>
                    {"RRR ("}
                    {Math.round(rrrRate * 100)}
                    {"%) :"}
                  </Text>
                  <Text>{formatXAF(roundFCFA(totalRRR))}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.bold}>{"HT net commercial :"}</Text>
                  <Text style={styles.bold}>
                    {formatXAF(roundFCFA(totalBase))}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text>{`TVA (${real ? "19,25%" : "0%"}) :`}</Text>
                  <Text>{formatXAF(roundFCFA(totalTVA))}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text>{`IS / IR (${real ? "2,2%" : "5,5%"} sur lignes concernées) :`}</Text>
                  <Text>{formatXAF(roundFCFA(totalIsIr))}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text>{"Précompte (2%) :"}</Text>
                  <Text>{formatXAF(roundFCFA(totalPrecompte))}</Text>
                </View>

                <View style={[styles.summaryRow, { marginTop: 6 }]}>
                  <Text style={styles.bold}>{"Total Net à payer :"}</Text>
                  <Text style={styles.bold}>
                    {formatXAF(roundFCFA(totalNetAPayer))}
                  </Text>
                </View>
              </View>

              <View style={styles.signRow}>
                <View style={styles.signBox}>
                  <Text>{"Visa Responsable des achats"}</Text>
                </View>
                <View style={styles.signBox}>
                  <Text>{"Visa DG"}</Text>
                </View>
                <View style={styles.signBox}>
                  <Text>{"Signature Fournisseur"}</Text>
                </View>
              </View>

              <View style={[styles.conditions, { marginTop: 12 }]}>
                <Text style={{ fontWeight: "bold", color: "black" }}>
                  {"Conditions :"}
                </Text>
                <View style={styles.conditionsList}>
                  {doc.commandConditions.map((condition, index) => (
                    <Text
                      key={index}
                    >{`${index + 1}. ${condition.content}`}</Text>
                  ))}

                  {doc.paymentTerms && doc.paymentTerms.length > 0 && (
                    <>
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: "black",
                          marginTop: 6,
                        }}
                      >
                        {"Conditions additionnelles :"}
                      </Text>
                      <Text>{doc.paymentTerms}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};
