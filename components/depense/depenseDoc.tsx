import {
  PAY_STATUS,
  PaymentRequest,
  PayType,
  RequestModelT,
  RequestType,
  User,
} from "@/types/types";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import React from "react";
import { formatFCFA } from "@/lib/utils";
import logo from "@/public/logo-icon.png";

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
    position: "relative",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },
  brandBlock: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    maxWidth: "55%",
  },
  logo: {
    width: 54,
    height: 54,
    objectFit: "contain",
  },
  brandText: {
    flexDirection: "column",
    gap: 2,
  },
  brandName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  brandSubtext: {
    fontSize: 9,
    color: "#6B7280",
  },
  docMeta: {
    alignItems: "flex-end",
    gap: 3,
    maxWidth: "40%",
  },
  docTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
  },
  docRef: {
    fontSize: 9,
    color: "#6B7280",
    textAlign: "right",
  },

  // Highlight card
  heroCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  heroLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },
  heroValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  amountBox: {
    alignItems: "flex-end",
  },
  amountLabel: {
    fontSize: 9,
    color: "#6B7280",
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  amountWords: {
    fontSize: 9,
    color: "#4B5563",
    marginTop: 4,
  },

  // Section
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  // Info grid
  infoGrid: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    minHeight: 24,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    width: "34%",
    backgroundColor: "#F9FAFB",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  infoValue: {
    width: "66%",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 10,
    color: "#111827",
  },

  // Attestation
  statementBox: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 6,
  },
  statementText: {
    fontSize: 10.5,
    lineHeight: 1.6,
    textAlign: "justify",
  },
  emphasis: {
    fontWeight: "bold",
  },

  descriptionBox: {
    minHeight: 28,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  descriptionText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#111827",
  },

  // Signatures
  signatureSection: {
    marginTop: 26,
  },
  signatureTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
    color: "#111827",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  signatureCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 12,
    minHeight: 90,
    justifyContent: "flex-start",
  },
  signatureRole: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  signatureHint: {
    fontSize: 8,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  signatureDate: {
    fontSize: 9,
    color: "#374151",
    textAlign: "center",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8.5,
    color: "#6B7280",
  },
});

interface ReceiptPDFProps {
  paymentRequest: PaymentRequest;
  getPaymentType: PayType[];
  users: Array<User>;
  requests: Array<RequestModelT>;
  requestTypes: Array<RequestType>;
}

const DepenseDocument: React.FC<ReceiptPDFProps> = ({
  paymentRequest,
  getPaymentType,
  users,
  requests,
  requestTypes,
}) => {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  //Let's get the requestType
  const rType = requestTypes.find((r) => r.type === paymentRequest.type);

  const getBeneficiaryName = () => {
    if (paymentRequest.beneficiary) {
      return `${paymentRequest.beneficiary.firstName} ${paymentRequest.beneficiary.lastName}`;
    }
    return "N/A";
  };

  const request = requests.find((r) => r.id === paymentRequest.requestId);

  const emitter = request?.beficiaryList?.[0]
    ? `${request.beficiaryList[0].firstName} ${request.beficiaryList[0].lastName}`
    : `${users.find((user) => user.id === request?.userId)?.firstName || ""} ${
        users.find((user) => user.id === request?.userId)?.lastName || ""
      }`.trim() || "N/A";

  const beneficiaryName = getBeneficiaryName();
  const paymentMethod =
    getPaymentType.find((item) => item.id === paymentRequest.methodId)?.label ||
    "N/A";

  const litersCount =
    paymentRequest.liters && paymentRequest.liters > 0
      ? (paymentRequest.price / paymentRequest.liters).toFixed(2)
      : null;

  const documentTitle = "Décharge de paiement en espèces";

  const driver = users.find((u) => u.id === paymentRequest?.driverId);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Image src={logo.src} style={styles.logo} />
            <View style={styles.brandText}>
              <Text style={styles.brandName}>CREACONSULT</Text>
              <Text style={styles.brandSubtext}>
                Confirmation de paiement par la trésorerie
              </Text>
            </View>
          </View>

          <View style={styles.docMeta}>
            <Text style={styles.docTitle}>{documentTitle}</Text>
            <Text style={styles.docRef}>
              Référence: {paymentRequest.reference}
            </Text>
            <Text style={styles.docRef}>
              Date d’émission: {formatDate(paymentRequest.createdAt)}
            </Text>
          </View>
        </View>

        {/* Hero summary */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Bénéficiaire</Text>
              <Text style={styles.heroValue}>{emitter || beneficiaryName}</Text>
            </View>

            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Montant reçu</Text>
              <Text style={styles.amountValue}>
                {formatFCFA(paymentRequest.price)}
              </Text>
            </View>
          </View>

          <Text style={styles.amountWords}>
            Objet: {paymentRequest.title || "Paiement en espèces"}
          </Text>
        </View>

        {/* Payment details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du paiement</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Référence</Text>
              <Text style={styles.infoValue}>{paymentRequest.reference}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type de paiement</Text>
              <Text style={styles.infoValue}>{rType?.label ?? "N/A"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Méthode</Text>
              <Text style={styles.infoValue}>{paymentMethod}</Text>
            </View>

            {/*             <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Statut</Text>
              <Text style={styles.infoValue}>
                {PAY_STATUS.find((x) => x.value === paymentRequest.status)?.name ||
                  "N/A"}
              </Text>
            </View> */}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Demandeur / émetteur</Text>
              <Text style={styles.infoValue}>{emitter}</Text>
            </View>

            <View
              style={[
                styles.infoRow,
                !paymentRequest.model &&
                !paymentRequest.km &&
                !paymentRequest.liters
                  ? styles.infoRowLast
                  : {},
              ]}
            >
              <Text style={styles.infoLabel}>Montant</Text>
              <Text style={styles.infoValue}>
                {formatFCFA(paymentRequest.price)}
              </Text>
            </View>

            {paymentRequest.model && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Véhicule</Text>
                <Text style={styles.infoValue}>
                  {`${paymentRequest.model.label} - ${paymentRequest.model.mark} - ${paymentRequest.model.matricule}`}
                </Text>
              </View>
            )}

            {paymentRequest.km && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kilométrage</Text>
                <Text style={styles.infoValue}>{paymentRequest.km} km</Text>
              </View>
            )}

            {paymentRequest.liters && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Prix unitaire du litre</Text>
                <Text style={styles.infoValue}>
                  {paymentRequest.liters} XAF
                </Text>
              </View>
            )}

            {paymentRequest.liters && (
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>Nombre estimé de litres</Text>
                <Text style={styles.infoValue}>
                  {litersCount ? `${litersCount} L` : "N/A"}
                </Text>
              </View>
            )}
            {!!driver && (
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>Temoin de la carburation</Text>
                <Text style={styles.infoValue}>
                  {driver.firstName.concat(" ", driver.lastName)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Attestation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attestation</Text>
          <View style={styles.statementBox}>
            <Text style={styles.statementText}>
              Je soussigné(e),{" "}
              <Text style={styles.emphasis}>{emitter || beneficiaryName}</Text>,
              reconnais avoir reçu de la trésorerie la somme de{" "}
              <Text style={styles.emphasis}>
                {formatFCFA(paymentRequest.price)}
              </Text>{" "}
              au titre de{" "}
              <Text style={styles.emphasis}>
                {paymentRequest.title || "ce paiement"}
              </Text>
              . La présente décharge vaut confirmation de réception effective
              des fonds en espèces.
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motif / Description</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              {paymentRequest.description || "Aucune description fournie."}
            </Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.signatureTitle}>Validation et signature</Text>

          <View style={styles.signatureRow}>
            <View style={styles.signatureCard}>
              <View>
                <Text style={styles.signatureRole}>Le bénéficiaire</Text>
                <Text style={styles.signatureHint}>
                  Nom, signature et mention “fonds reçus”
                </Text>
              </View>
              {/*               <Text style={styles.signatureDate}>
                Date: {formatDate(new Date())}
              </Text> */}
            </View>

            <View style={styles.signatureCard}>
              <View>
                <Text style={styles.signatureRole}>La trésorerie</Text>
                <Text style={styles.signatureHint}>
                  Nom, visa et cachet si applicable
                </Text>
              </View>
              {/* <Text style={styles.signatureDate}>
                Date: {formatDate(new Date())}
              </Text> */}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Document généré automatiquement</Text>
          <Text style={styles.footerText}>{paymentRequest.reference}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default DepenseDocument;
