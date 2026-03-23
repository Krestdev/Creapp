import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PaymentRequest } from "@/types/types";

// Tu peux remplacer par tes helpers existants
const A4_WIDTH = 595;
const A4_HEIGHT = 842;

const formatXAF = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

/**
 * Optionnel: si tu as déjà une fonction montant -> lettres, remplace ceci.
 * Ici je laisse une valeur fallback simple.
 */
const amountToWordsFR = (amount: number) => {
  // TODO: brancher ta vraie fonction (ex: num2words, etc.)
  return `${formatXAF(amount)} (en lettres à configurer)`;
};


type Props = {
  payment: PaymentRequest;
};


const styles = StyleSheet.create({
  page: {
    width: A4_WIDTH,
    height: A4_HEIGHT,
    paddingTop: 70,
    paddingBottom: 50,
    paddingHorizontal: 45,
    fontSize: 11,
    fontFamily: "Helvetica",
    position: "relative",
  },

  // Header
  headerWrap: {
    position: "absolute",
    top: 20,
    left: 45,
    right: 45,
    height: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logo: {
    height: 28,
    width: 130,
    objectFit: "contain",
  },
  dateTopRight: {
    fontSize: 10,
    color: "#333",
  },

  companyName: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 0.5,
  },

  watermark: {
    position: "absolute",
    top: 120,
    left: 30,
    width: 540,
    height: 540,
    opacity: 0.08,
    objectFit: "contain",
  },

  objectLine: {
    marginTop: 40,
    fontSize: 11,
    fontWeight: 700,
    textDecoration: "underline",
  },

  body: {
    marginTop: 18,
    lineHeight: 1.6,
    textAlign: "justify",
  },

  paragraph: { marginTop: 10 },

  footer: {
    position: "absolute",
    bottom: 45,
    left: 45,
    right: 45,
  },

  pj: {
    marginTop: 30,
    fontSize: 10.5,
  },

  signature: {
    marginTop: 28,
    textAlign: "right",
    fontSize: 11,
    fontWeight: 700,
    color: "#D40000", // rouge comme ton exemple
  },
});

export const NoticeFile = ({
  payment,
}: Props) => {
  const today = new Date(payment.createdAt || Date.now());
  const beneficiaryLabel = "Monsieur/Madame";

  const dateLabel = `Douala, ${format(today, "dd MMMM yyyy", { locale: fr })}`;

  const amountLabel = formatXAF(payment.price);
  const amountWords = amountToWordsFR(payment.price);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.dateTopRight}>{dateLabel}</Text>
        {/* Objet */}
        <Text style={styles.objectLine}>{"Objet : Avis de règlement"}</Text>

        {/* Body */}
        <View style={styles.body}>
          <Text>{beneficiaryLabel},</Text>

          <Text style={styles.paragraph}>
            {`Veuillez trouver ci-joint le ${payment.method?.label ?? "virement"} ${payment.bank?.label ?? "Banque"} N°${payment.bank?.accountNumber ?? "---"} du ${format(new Date(payment.updatedAt), "dd MMMM yyyy", { locale: fr })} de ${amountLabel} (${amountWords}) émis en votre faveur pour le règlement ${payment.isPartial && "partiel"} de la facture ${payment.invoice?.reference} relatif au bon de commande ${payment.invoice?.command.reference}.`}
          </Text>

          <Text style={styles.paragraph}>
            {`En vous souhaitant bonne réception, veuillez agréer, Monsieur/Madame,
            l’expression de notre parfaite considération.`}
          </Text>

          {/* PJ */}
          <Text style={styles.pj}>
            {`PJ ${payment.bank?.label ?? "Banque"} N°${payment.bank?.accountNumber}`}
          </Text>

          {/* Signature */}
          <Text style={styles.signature}>{"LA DIRECTION"}</Text>
        </View>
      </Page>
    </Document>
  );
};