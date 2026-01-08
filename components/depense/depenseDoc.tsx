import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { PaymentRequest } from "@/types/types";

// Register fonts if needed (optional)
// Font.register({ family: 'Helvetica', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  table: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    minHeight: 40,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#000",
    fontSize: 10,
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
    fontWeight: "bold",
    fontSize: 10,
  },
  total: {
    width: 120,
    fontWeight: "bold",
    fontSize: 18,
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
    paddingTop: 40,
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  signatureLabel: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 9,
    color: "#666",
  },
});

interface ReceiptPDFProps {
  paymentRequest: PaymentRequest;
}

const DepenseDocument: React.FC<ReceiptPDFProps> = ({ paymentRequest }) => {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const getBeneficiaryName = () => {
    if (paymentRequest.beneficiary) {
      return `${paymentRequest.beneficiary.firstName} ${paymentRequest.beneficiary.lastName}`;
    }
    return "N/A";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recu {paymentRequest.title}</Text>
          <Text style={styles.subtitle}>Reçu de paiement transport</Text>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume depense</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Beneficier:</Text>
            <Text style={styles.infoValue}>{getBeneficiaryName()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Montant:</Text>
            <Text style={styles.infoValue}>
              {paymentRequest.price ? `${paymentRequest.price} XAF` : "N/A"}
            </Text>
          </View>

          {paymentRequest.model && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicule:</Text>
              <Text style={styles.infoValue}>
                {paymentRequest.model || "N/A"}
              </Text>
            </View>
          )}

          {paymentRequest.km && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kilometrage:</Text>
              <Text style={styles.infoValue}>
                {paymentRequest.km ? `${paymentRequest.km} km` : "N/A"}
              </Text>
            </View>
          )}

          {paymentRequest.liters && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Litre:</Text>
              <Text style={styles.infoValue}>
                {paymentRequest.liters ? `${paymentRequest.liters} L` : "N/A"}
              </Text>
            </View>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, { minHeight: 100 }]}>
              <Text style={[styles.tableCell, styles.tableCellLast]}>
                {paymentRequest.description || "Aucune description fournie"}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Supplémentaires</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Référence:</Text>
            <Text style={styles.infoValue}>{paymentRequest.reference}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type de paiement:</Text>
            <Text style={styles.infoValue}>{paymentRequest.type}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Méthode de paiement:</Text>
            <Text style={styles.infoValue}>{paymentRequest.method}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date de création:</Text>
            <Text style={styles.infoValue}>
              {formatDate(paymentRequest.createdAt)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut:</Text>
            <Text style={styles.infoValue}>{paymentRequest.status}</Text>
          </View>

          {paymentRequest.deadline && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Montant:</Text>
              <Text style={[styles.infoValue, styles.total]}>
                {paymentRequest.price ? `${paymentRequest.price} XAF` : "N/A"}
              </Text>
            </View>
          )}
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Date</Text>
            <Text style={styles.signatureLabel}>{formatDate(new Date())}</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Signature</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Document généré automatiquement - {paymentRequest.reference}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default DepenseDocument;
