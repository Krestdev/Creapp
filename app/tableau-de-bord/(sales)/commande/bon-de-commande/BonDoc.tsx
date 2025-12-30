import { company, formatXAF, XAF } from "@/lib/utils";
import { BonDeCommande, BonsCommande } from "@/types/types";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Dimensions A4 en points (1 point = 1/72 inch)
const A4_WIDTH = 595; // Largeur A4 en points
const A4_HEIGHT = 842; // Hauteur A4 en points

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
    gap: 19
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: A4_WIDTH,
    height: A4_HEIGHT,
    zIndex: -1,
  },
  mainContent: {
    width: "100%",
    flexDirection: "column",
    marginBottom: 200, // Maintenant ça devrait fonctionner
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  name: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftHeader: {
    display: "flex",
    flexDirection: "column",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
  rightHeaderBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 6,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logoBox: {
    width: 90,
    height: 50,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  companyName: { fontSize: 12, marginBottom: 4 },
  refTitle: { fontWeight: "bold", fontSize: 11, marginBottom: 4 },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#700032",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaCol: { width: "33%" },
  table: {
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 8,
    minHeight: 30,
  },
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
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    minHeight: 25,
  },
  td: {
    padding: 4,
    borderRightWidth: 1,
    borderColor: "#ddd",
    fontSize: 9,
  },
  colDesignation: { width: "30%" },
  colQty: { width: "6%", textAlign: "right" },
  colPu: { width: "13%", textAlign: "right" },
  colTva: { width: "13%", textAlign: "right" },
  colIris: { width: "13%", textAlign: "right" },
  colTotalHt: { width: "13%", textAlign: "right" },
  colTotalTtc: { width: "13%", textAlign: "right" },
  summarySection: {
    marginTop: 1,
  },
  rightSummary: {
    marginLeft: "auto",
    width: "40%",
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
  amountWords: {
    marginTop: 6,
    fontStyle: "italic",
    fontSize: 9,
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
  },
  signBox: {
    width: "45%",
    height: 60,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    right: 30,
    fontSize: 9,
    color: "#666",
  },
});

export const BonDocument: React.FC<{ doc: BonsCommande }> = ({ doc }) => {
  const itemsPerPage = 15;
  const totalPages = Math.ceil(doc.devi.element.length / itemsPerPage);
  // Calcul des montant de la commande
  const tvaRate = 19.25;
  const irisRate = doc.provider.regem!.toLowerCase() === "reel" ? 2.2 : 5.5;

  // Initialisation des totaux
  let totalHt = 0;
  let totalTva = 0;
  let totalIris = 0;
  let totalTtc = 0;

  // Calcul
  doc.devi.element.forEach((el: any) => {
    const ht = el.quantity * el.priceProposed;
    const tva = (ht * tvaRate) / 100;
    const iris = (ht * irisRate) / 100;
    const ttc = ht + tva + iris;

    totalHt += ht;
    totalTva += tva;
    totalIris += iris;
    totalTtc += ttc;
  });

  // Arrondi si nécessaire
  totalHt = Math.round(totalHt);
  totalTva = Math.round(totalTva);
  totalIris = Math.round(totalIris);
  totalTtc = Math.round(totalTtc);

  return (
    <Document>
      {Array.from({ length: totalPages }).map((_, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} wrap={false}>
          {/* En-tête uniquement sur la première page */}
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
                        {"Delai de livraison: "}
                      </Text>
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
                    <Text style={styles.companyName}>
                      {doc.provider.address}
                    </Text>
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
                </View>
              </View>

              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#000",
                  marginBottom: 8,
                }}
              >
                {/* Ligne 1 : Numéro du Bon */}
                <View style={{ flexDirection: "row" }}>
                  {/* Cellule titre */}
                  <View
                    style={{
                      flex: 1,
                      borderRightWidth: 1,
                      borderColor: "#000",
                      padding: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                      Numéro du Bon
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      borderColor: "#000",
                      padding: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                      Date de création
                    </Text>
                  </View>
                </View>

                {/* Ligne 2 : Date de création */}
                <View
                  style={{
                    flexDirection: "row",
                    borderTopWidth: 1,
                    borderColor: "#000",
                  }}
                >
                  {/* Cellule valeur */}
                  <View style={{ flex: 2, padding: 4, borderRightWidth: 1 }}>
                    <Text>
                      {doc.reference +
                        "/" +
                        format(doc.createdAt, "dd/MM/yyyy" + "/", {
                          locale: fr,
                        })}
                    </Text>
                  </View>
                  <View style={{ flex: 2, padding: 4 }}>
                    <Text>
                      {format(doc.createdAt, "dd/MM/yyyy", { locale: fr })}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Contenu principal */}
          <View style={styles.mainContent}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, styles.colDesignation]}>
                  {"Désignation"}
                </Text>
                <Text style={[styles.th, styles.colQty]}>{"Qté"}</Text>
                <Text style={[styles.th, styles.colPu]}>{"PU HT"}</Text>
                <Text style={[styles.th, styles.colTva]}>{"TVA"}</Text>
                <Text style={[styles.th, styles.colIris]}>{"SR/DA"}</Text>
                <Text style={[styles.th, styles.colTotalHt]}>{"Total HT"}</Text>
                <Text style={[styles.th, styles.colTotalTtc]}>
                  {"Total TTC"}
                </Text>
              </View>

              {doc.devi.element
                .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                .map((it, idx) => {
                  // Taux
                  const irisRate = doc.provider.regem === "reel" ? 2.2 : 5.5;
                  const tvaRate = 19.25;

                  // Total HT
                  const totalHt = it.quantity * it.priceProposed;

                  // Taxes (calculées sur le TOTAL HT)
                  const tvaAmount = (totalHt * tvaRate) / 100;
                  const irisAmount = (totalHt * irisRate) / 100;

                  // Total TTC = HT + TVA + IRIS
                  const totalTtc = Math.round(totalHt + tvaAmount + irisAmount);

                  return (
                    <View style={styles.tr} key={idx}>
                      {/* Désignation */}
                      <Text style={[styles.td, styles.colDesignation]}>
                        {it.title}
                      </Text>

                      {/* Quantité */}
                      <Text style={[styles.td, styles.colQty]}>
                        {it.quantity}
                      </Text>

                      {/* Prix unitaire HT */}
                      <Text style={[styles.td, styles.colPu]}>
                        {formatXAF(it.priceProposed)}
                      </Text>

                      {/* TVA */}
                      <Text style={[styles.td, styles.colTva]}>
                        {formatXAF(tvaAmount)}
                      </Text>

                      {/* IRIS / IS */}
                      <Text style={[styles.td, styles.colIris]}>
                        {formatXAF(irisAmount)}
                      </Text>

                      {/* Total HT */}
                      <Text style={[styles.td, styles.colTotalHt]}>
                        {formatXAF(totalHt)}
                      </Text>

                      {/* Total TTC */}
                      <Text style={[styles.td, styles.colTotalTtc]}>
                        {formatXAF(totalTtc)}
                      </Text>
                    </View>
                  );
                })}
            </View>

            {pageIndex === totalPages - 1 && (
              <View style={styles.summarySection}>
                <View style={styles.rightSummary}>
                  <View style={styles.summaryRow}>
                    <Text>{"Total HT:"}</Text>
                    <Text style={{ textAlign: "right" }}>
                      {formatXAF(totalHt)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text>{"TVA:"}</Text>
                    <Text style={{ textAlign: "right" }}>
                      {formatXAF(totalTva)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text>{"IS / IR / DA:"}</Text>
                    <Text style={{ textAlign: "right" }}>
                      {formatXAF(totalIris)}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, { marginTop: 6 }]}>
                    <Text style={styles.bold}>{"Total Net à payer:"}</Text>
                    <Text style={[styles.bold, { textAlign: "right" }]}>
                      {formatXAF(totalTtc)}
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
                  <Text style={{ fontWeight: "semibold", color: "black" }}>
                    {"Conditions"}
                  </Text>
                  <View style={styles.conditionsList}>
                    <Text>
                      {
                        "1- la responsabilité de Creaconsult ne sauraitven aucun cas être engagée après l'annulation de la commande par expiration de la date de livraison ci-dessus indiquée."
                      }
                    </Text>
                    <Text>
                      {"2- Avant livraison vérifier la date et la qualité."}
                    </Text>
                    <Text>
                      {
                        "3- Le tribunal de siège (Douala) est compétent en cas de litige."
                      }
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Numéro de page dans le footer */}
          <Text style={styles.footer}>
            Page {pageIndex + 1} sur {totalPages}
          </Text>
        </Page>
      ))}
    </Document>
  );
};
