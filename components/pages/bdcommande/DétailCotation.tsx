import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { CommandRequestT } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Charger les variantes nécessaires
Font.register({
  family: "Poppins",
  fonts: [
    { src: "/fonts/Poppins-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Poppins-Bold.ttf", fontWeight: 700 },
    { src: "/fonts/Poppins-Italic.ttf", fontWeight: 400, fontStyle: "italic" },
    { src: "/fonts/Poppins-BoldItalic.ttf", fontWeight: 700, fontStyle: "italic" },
  ],
});

const CotationPDF = ({ data }: { data: CommandRequestT }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --------- TITRE --------- */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{"Demande de Cotation"}</Text>
        </View>

        {/* --------- INFORMATIONS --------- */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{"Objet :"} </Text>
            <Text style={styles.infoValue}>{data.title}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{"Référence : "}</Text>
            <Text style={styles.infoValue}>{data.reference}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {"Date limite de soumission : "}
            </Text>
            <Text style={styles.infoValue}>
              {format(data.dueDate, "PPP", { locale: fr })}
            </Text>
          </View>

          <View style={styles.contactSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{"Contact principal : "}</Text>
              <Text style={styles.infoValue}>
                {"M. Jean Phillipe (Responsable Achat)"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{"Téléphone : "}</Text>
              <Text style={styles.infoValue}>{"+33 35 45 45"}</Text>
            </View>
          </View>
        </View>

        {/* --------- LISTE DES ELEMENTS --------- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{"Liste des éléments"}</Text>
        </View>

        {/* --------- TABLEAU --------- */}
        <View style={styles.table}>
          {/* En-tête */}
          <View style={styles.tableHeader}>
            <View style={[styles.headerCell, styles.headerCell1]}>
              <Text style={styles.headerText}>{"TITRE DU BESOIN"}</Text>
            </View>
            <View style={[styles.headerCell, styles.headerCell2]}>
              <Text style={styles.headerText}>
                {"DESCRIPTION DÉTAILLÉE & SPÉCIFICATIONS"}
              </Text>
            </View>
            <View style={[styles.headerCell, styles.headerCell3]}>
              <Text style={styles.headerText}>{"UNITÉ"}</Text>
            </View>
            <View style={[styles.headerCell, styles.headerCell4]}>
              <Text style={styles.headerText}>{"QUANTITÉ"}</Text>
            </View>
          </View>

          {/* Lignes */}
          {data.besoins.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index === data.besoins.length - 1
                  ? styles.tableRowLast
                  : styles.tableRow,
              ]}
            >
              <View style={[styles.cell, styles.cell1]}>
                <Text style={styles.cellText}>{item.label || "-"}</Text>
              </View>
              <View style={[styles.cell, styles.cell2]}>
                <Text style={styles.cellText}>{item.description || "-"}</Text>
              </View>
              <View style={[styles.cell, styles.cell3]}>
                <Text style={styles.cellText}>{item.unit || "-"}</Text>
              </View>
              <View style={[styles.cell, styles.cell4]}>
                <Text style={styles.cellText}>{item.quantity || "-"}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* --------- FOOTER --------- */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {`Créé le ${format(data.createdAt, "PPP", { locale: fr })}.`}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default CotationPDF;

const styles = StyleSheet.create({
  page: {
    display: "flex",
    flexDirection: "column",
    padding: 40,
    paddingBottom: 60,
    paddingTop: 120,
    fontFamily: "Poppins",
    fontSize: 10,
    lineHeight: 1.4,
    backgroundColor: "#FFFFFF",
  },

  // ===== TITRE =====
  titleContainer: {
    marginBottom: 16,
  },

  title: {
    fontSize: 16,
    color: "#700032",
    fontWeight: "bold",
    letterSpacing: 1,
    lineHeight: "150%"
  },

  // ===== INFORMATIONS =====
  infoSection: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 25,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  infoLabel: {
    textDecoration: "underline",
  },

  infoValue: {
    flex: 1,
  },

  contactSection: {
    display: "flex",
    flexDirection: "column",
    marginTop: 15,
  },

  // ===== SECTION TITRE =====
  sectionHeader: {
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "semibold",
    color: "#000",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ===== TABLEAU =====
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    marginBottom: 24,
    display: "flex",
    flexDirection: "column",
  },

  tableHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch", // Changé de "center" à "stretch" pour étirer verticalement
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    width: "100%",
    // Ajout des bordures supérieure et inférieure
    borderTopWidth: 1,
    borderTopColor: "#000",
    borderTopStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },

  // Style commun pour toutes les cellules d'en-tête
  headerCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "flex-start",
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
    display: "flex",
    flexDirection: "column",
    // Assure que la cellule s'étend sur toute la hauteur
    height: "100%",
  },

  // Largeurs spécifiques pour chaque colonne d'en-tête
  headerCell1: { width: "31%" },
  headerCell2: { width: "39%" },
  headerCell3: { width: "15%" },
  headerCell4: {
    width: "15%",
    borderRightWidth: 0,
  },

  headerText: {
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "uppercase",
    textAlign: "left",
    flexWrap: "wrap",
    width: "100%",
    lineHeight: 1.25,
  },

  tableRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    borderBottomStyle: "solid",
    width: "100%",
  },

  tableRowLast: {
    borderBottomWidth: 0,
  },

  // Style commun pour toutes les cellules de contenu
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  // Largeurs spécifiques pour chaque colonne de contenu
  cell1: {
    width: "31%",
  },

  cell2: {
    width: "39%",
  },

  cell3: {
    width: "15%",
  },

  cell4: {
    width: "15%",
    borderRightWidth: 0,
  },

  cellText: {
    fontSize: 12,
    textAlign: "left",
    flexWrap: "wrap",
    width: "100%",
    wordBreak: "break-word",
    lineHeight: 1.375,
  },

  // ===== FOOTER =====
  footer: {
    paddingTop: 10,
  },

  footerText: {
    fontSize: 10,
    color: "#666",
    textAlign: "right",
    fontStyle: "italic",
  },
});