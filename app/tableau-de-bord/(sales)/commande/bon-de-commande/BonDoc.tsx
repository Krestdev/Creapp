import { formatCurrency } from "@/lib/helpers";
import { BonDeCommande } from "@/types/types";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  viewer: { width: "100%", height: "100vh" },
  page: { padding: 20, fontSize: 10, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  leftHeader: { width: "60%" },
  logoBox: {
    width: 90,
    height: 50,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  companyName: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  rightHeaderBox: {
    width: "38%",
    borderWidth: 1,
    borderColor: "#000",
    padding: 6,
  },
  refTitle: { fontWeight: "bold", fontSize: 11, marginBottom: 4 },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaCol: { width: "33%" },
  table: { borderWidth: 1, borderColor: "#000", marginBottom: 8 },
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
  tr: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ddd" },
  td: { padding: 4, borderRightWidth: 1, borderColor: "#ddd", fontSize: 9 },
  colRef: { width: "12%" },
  colDesignation: { width: "46%" },
  colQty: { width: "8%", textAlign: "right" },
  colPu: { width: "11%", textAlign: "right" },
  colTva: { width: "7%", textAlign: "right" },
  colTotalHt: { width: "8%", textAlign: "right" },
  colTotalTtc: { width: "8%", textAlign: "right" },
  rightSummary: {
    marginLeft: "auto",
    width: "40%",
    alignSelf: "flex-end",
    borderWidth: 1,
    padding: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  bold: { fontWeight: "bold" },
  amountWords: { marginTop: 6, fontStyle: "italic" },
  conditions: { marginTop: 8 },
  signRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  signBox: {
    width: "45%",
    height: 60,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { marginTop: 12, fontSize: 8, color: "#333" },
});

export const BonDocument: React.FC<{ doc: BonDeCommande }> = ({ doc }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={styles.logoBox}>
            <Text>LOGO</Text>
          </View>
          <Text style={styles.companyName}>{doc.company.name}</Text>
          <Text>{doc.company.address}</Text>
        </View>

        <View style={styles.rightHeaderBox}>
          <Text style={styles.refTitle}>Référence du fournisseur</Text>
          <Text style={{ fontSize: 10, fontWeight: "bold" }}>
            {doc.fournisseur.nom}
          </Text>
          <Text>{doc.fournisseur.adresse}</Text>
          <Text>
            {doc.fournisseur.ville} - {doc.fournisseur.pays}
          </Text>
          <Text>NIU: {doc.fournisseur.niu}</Text>
          <Text>Email: {doc.fournisseur.email}</Text>
          <Text>Tél: {doc.fournisseur.telephone}</Text>
        </View>
      </View>

      <Text style={styles.title}>Bon de Commande</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaCol}>
          <Text style={{ fontSize: 11, fontWeight: "bold" }}>
            Numéro du Bon
          </Text>
          <Text>{doc.numero}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={{ fontSize: 11, fontWeight: "bold" }}>
            Date de création
          </Text>
          <Text>{new Date(doc.dateCreation).toLocaleString("fr-FR")}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={{ fontSize: 11, fontWeight: "bold" }}>Imprimé par</Text>
          <Text>
            {doc.imprimePar} - {doc.imprimeLe}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colRef]}>Réf Article</Text>
          <Text style={[styles.th, styles.colDesignation]}>Désignation</Text>
          <Text style={[styles.th, styles.colQty]}>Qté</Text>
          <Text style={[styles.th, styles.colPu]}>PU HT</Text>
          <Text style={[styles.th, styles.colTva]}>TVA</Text>
          <Text style={[styles.th, styles.colTotalHt]}>Total HT</Text>
          <Text style={[styles.th, styles.colTotalTtc]}>Total TTC</Text>
        </View>

        {doc.items.map((it, idx) => {
          const totalHt = it.qty * it.puHt;
          const totalTtc = totalHt + Math.round((totalHt * it.tva) / 100);
          return (
            <View style={styles.tr} key={idx}>
              <Text style={[styles.td, styles.colRef]}>{it.ref}</Text>
              <Text style={[styles.td, styles.colDesignation]}>
                {it.designation}
              </Text>
              <Text style={[styles.td, styles.colQty]}>{it.qty}</Text>
              <Text style={[styles.td, styles.colPu]}>
                {formatCurrency(it.puHt)}
              </Text>
              <Text style={[styles.td, styles.colTva]}>{it.tva}%</Text>
              <Text style={[styles.td, styles.colTotalHt]}>
                {formatCurrency(totalHt)}
              </Text>
              <Text style={[styles.td, styles.colTotalTtc]}>
                {formatCurrency(totalTtc)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.rightSummary}>
        <View style={styles.summaryRow}>
          <Text>Total HT:</Text>
          <Text style={{ textAlign: "right" }}>
            {formatCurrency(doc.totals.totalHt)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Remise:</Text>
          <Text style={{ textAlign: "right" }}>
            {formatCurrency(doc.totals.remise)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>TVA:</Text>
          <Text style={{ textAlign: "right" }}>
            {formatCurrency(doc.totals.tva)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>IS / IR / DA:</Text>
          <Text style={{ textAlign: "right" }}>
            {formatCurrency(doc.totals.isirda)}
          </Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: 6 }]}>
          <Text style={styles.bold}>Total Net à payer:</Text>
          <Text style={[styles.bold, { textAlign: "right" }]}>
            {formatCurrency(doc.totals.net)}
          </Text>
        </View>
        <Text style={styles.amountWords}>{doc.amountInWords}</Text>
      </View>

      <Text style={styles.conditions}>{doc.conditions}</Text>

      <View style={styles.signRow}>
        <View style={styles.signBox}>
          <Text>Visa Responsable des achats</Text>
        </View>
        <View style={styles.signBox}>
          <Text>Signature Fournisseur / Tampon</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        Conditions: 1- la responsabilité de Creaconsult ne saurait en aucun cas
        être engagée après l'annulation de la commande par expiration de la date
        de livraison ci-dessus indiquée. 2- Avant livraison vérifier la date et
        la qualité. 3- Le tribunal de siège (Douala) est compétent en cas de
        litige.
      </Text>
    </Page>
  </Document>
);
