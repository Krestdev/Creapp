"use client";
import { company, formatXAF, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { PaymentRequest } from "@/types/types";
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
    gap: 19,
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

export const DepenseDocument: React.FC<{ doc: PaymentRequest }> = ({ doc }) => {
  const itemsPerPage = 15;
  const totalPages = 1;

  const { user } = useStore();

  return (
    <Document>
      {Array.from({ length: totalPages }).map((_, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} wrap={false}>
          {/* En-tête uniquement sur la première page */}
          <View style={styles.header}>
            <Text style={styles.title}>{`Recu ${doc.title}`}</Text>
            <View style={styles.info}>
              <View style={styles.leftHeader}>
                {doc.title == "Transport" ? (
                  <View>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"Beneficier:  "}</Text>
                      <Text style={styles.companyName}>
                        {doc.beneficiary?.firstName} {doc.beneficiary?.lastName}
                      </Text>
                    </View>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"montant:  "}</Text>
                      <Text style={styles.companyName}>{doc.price}</Text>
                    </View>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"description:  "}</Text>
                      <Text style={styles.companyName}>{doc.description}</Text>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"Chauffeur:  "}</Text>
                      <Text style={styles.companyName}>
                        {doc.beneficiary?.firstName} {doc.beneficiary?.lastName}
                      </Text>
                    </View>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"Vehicule:  "}</Text>
                      <Text style={styles.companyName}>{doc.model}</Text>
                    </View>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"kilometrage:  "}</Text>
                      <Text style={styles.companyName}>{doc.km}</Text>
                    </View>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"Montant:  "}</Text>
                      <Text style={styles.companyName}>{doc.price}</Text>
                    </View>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"Litres:  "}</Text>
                      <Text style={styles.companyName}>{doc.liters}</Text>
                    </View>
                    <View style={styles.name}>
                      <Text style={styles.companyName}>{"description:  "}</Text>
                      <Text style={styles.companyName}>{doc.description}</Text>
                    </View>
                  </View>
                )}

                <View>
                  <View style={styles.signRow}>
                    <View style={styles.signBox}>
                      <Text>{"Visa Responsable des achats"}</Text>
                    </View>
                    <View style={styles.signBox}>
                      <Text>{"Signature Fournisseur"}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
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
