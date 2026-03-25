import { CommandRequestT } from "@/types/types";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const CotationPDF = ({ data }: { data: CommandRequestT }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Image style={styles.background} src="/images/crea.jpg" fixed />

        <View style={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.kicker}>Consultation fournisseurs</Text>
            <Text style={styles.title}>Demande de cotation</Text>
            <Text style={styles.subtitle}>
              Merci de bien vouloir nous transmettre votre meilleure offre pour
              les éléments ci-dessous, dans le respect des spécifications
              indiquées.
            </Text>
          </View>

          <View style={styles.metaCard}>
            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Objet</Text>
                <Text style={styles.metaValue}>{data.title || "-"}</Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Référence</Text>
                <Text style={styles.metaValue}>{data.reference || "-"}</Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Date limite de soumission</Text>
                <Text style={styles.metaValue}>
                  {data.dueDate
                    ? format(data.dueDate, "PPP", { locale: fr })
                    : "-"}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Contact principal</Text>
                <Text style={styles.metaValue}>{data.name || "-"}</Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Téléphone</Text>
                <Text style={styles.metaValue}>{data.phone || "-"}</Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Date de création</Text>
                <Text style={styles.metaValue}>
                  {data.createdAt
                    ? format(data.createdAt, "PPP", { locale: fr })
                    : "-"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>Éléments demandés</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader} fixed>
              <View style={[styles.th, styles.colTitle]}>
                <Text style={styles.thText}>Besoin</Text>
              </View>
              <View style={[styles.th, styles.colDescription]}>
                <Text style={styles.thText}>Description détaillée</Text>
              </View>
              <View style={[styles.th, styles.colUnit]}>
                <Text style={styles.thText}>Unité</Text>
              </View>
              <View style={[styles.th, styles.colQty, styles.noBorderRight]}>
                <Text style={styles.thText}>Quantité</Text>
              </View>
            </View>

            {data.besoins.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tr,
                  index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                  index === data.besoins.length - 1 ? styles.lastRow : {},
                ]}
                wrap={false}
              >
                <View style={[styles.td, styles.colTitle]}>
                  <Text style={styles.primaryCellText}>
                    {item.label || "-"}
                  </Text>
                </View>

                <View style={[styles.td, styles.colDescription]}>
                  <Text style={styles.cellText}>{item.description || "-"}</Text>
                </View>

                <View style={[styles.td, styles.colUnit]}>
                  <Text style={styles.cellText}>{item.unit || "-"}</Text>
                </View>

                <View style={[styles.td, styles.colQty, styles.noBorderRight]}>
                  <Text style={styles.qtyText}>
                    {item.quantity !== undefined && item.quantity !== null
                      ? String(item.quantity)
                      : "-"}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Consignes</Text>
            <Text style={styles.noteText}>
              Veuillez préciser pour chaque ligne votre conformité aux
              spécifications demandées, ainsi que toute observation utile liée à
              la disponibilité, au délai, à la garantie ou aux conditions
              particulières.
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>
            {`Créé le ${
              data.createdAt
                ? format(data.createdAt, "PPP", { locale: fr })
                : "-"
            }`}
          </Text>

          <Text
            style={styles.footerCenter}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />

          <Text style={styles.footerRight}>
            Document généré automatiquement
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default CotationPDF;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    backgroundColor: "#FFFFFF",
    position: "relative",
    paddingTop: 110,
    paddingBottom: 90,
    paddingHorizontal: 34,
    color: "#111827",
  },

  background: {
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
    display: "flex",
    flexDirection: "column",
  },

  hero: {
    marginBottom: 18,
  },

  kicker: {
    fontSize: 9,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
  },

  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#700032",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#4B5563",
    maxWidth: "88%",
  },

  metaCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    borderRadius: 6,
    padding: 14,
    marginBottom: 20,
  },

  metaGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },

  metaItem: {
    width: "50%",
    paddingRight: 12,
  },

  metaLabel: {
    fontSize: 8,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 2,
  },

  metaValue: {
    fontSize: 10,
    color: "#111827",
    fontWeight: 500,
    lineHeight: 1.4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },

  sectionBar: {
    width: 4,
    height: 14,
    backgroundColor: "#700032",
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
  },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    minHeight: 38,
  },

  th: {
    paddingVertical: 9,
    paddingHorizontal: 8,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
  },

  thText: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#374151",
    lineHeight: 1.25,
  },

  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    minHeight: 42,
  },

  rowEven: {
    backgroundColor: "#FFFFFF",
  },

  rowOdd: {
    backgroundColor: "#FCFCFD",
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  td: {
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    justifyContent: "flex-start",
  },

  primaryCellText: {
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1.45,
    color: "#111827",
  },

  cellText: {
    fontSize: 10,
    lineHeight: 1.45,
    color: "#374151",
  },

  qtyText: {
    fontSize: 10,
    lineHeight: 1.45,
    color: "#111827",
    fontWeight: 600,
    textAlign: "right",
  },

  colTitle: {
    width: "26%",
  },

  colDescription: {
    width: "46%",
  },

  colUnit: {
    width: "13%",
  },

  colQty: {
    width: "15%",
    alignItems: "flex-end",
  },

  noBorderRight: {
    borderRightWidth: 0,
  },

  noteBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    padding: 12,
    borderRadius: 6,
  },

  noteTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 4,
  },

  noteText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#4B5563",
  },

  footer: {
    position: "absolute",
    bottom: 92,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 9,
    color: "#6B7280",
  },

  footerLeft: {
    width: "33%",
    textAlign: "left",
  },

  footerCenter: {
    width: "34%",
    textAlign: "center",
  },

  footerRight: {
    width: "33%",
    textAlign: "right",
  },
});
