import api from "@/providers/axios";
import { Quotation, QuotationElement } from "@/types/types";

interface CreateQuotation {
  devis: Omit<Quotation, "id" | "element" | "ref" | "createdAt" | "updatedAt">;
  elements: Array<Omit<QuotationElement, "id" | "deviId">>;
}

export class QuotationQueries {
  route = "/request/devi";

  // Version FormData pour gérer un File dans proof
  create = async ({ devis, elements }: CreateQuotation): Promise<{ data: Quotation }> => {
    const formData = new FormData();

    // on sépare proof du reste pour gérer File ou string
    const { proof, ...restDevis } = devis;

    formData.append("devis", JSON.stringify(restDevis));
    formData.append("elements", JSON.stringify(elements));

    if (proof instanceof File) {
      formData.append("proof", proof);
    } else if (typeof proof === "string") {
      formData.append("proofUrl", proof); // à adapter selon ton API
    }

    return api
      .post(this.route, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      .then((response) => {
        console.log(response.data);
        return response.data;
      });
  };

  getAll = async (): Promise<{ data: Array<Quotation> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };
}
