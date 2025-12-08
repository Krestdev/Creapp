import api from "@/providers/axios";
import { Quotation, QuotationElement } from "@/types/types";

interface CreateQuotation {
  devis: Omit<Quotation, "id" | "element" | "ref" | "createdAt" | "updatedAt">;
  elements: Array<Omit<QuotationElement, "id" | "deviId">>;
}
interface UpdateQuotation {
  devis: Omit<Quotation, "id" | "element" | "ref" | "createdAt" | "updatedAt">;
  elements: Array<{id?: number} & Omit<QuotationElement, "deviId" | "id">>;
}

export class QuotationQueries {
  route = "/request/devi";

  // CREATE — POST multipart
  create = async ({ devis, elements }: CreateQuotation): Promise<{ data: Quotation }> => {
    const formData = new FormData();

    const { proof, ...restDevis } = devis;

    formData.append("devis", JSON.stringify(restDevis));
    formData.append("elements", JSON.stringify(elements));

    if (proof instanceof File) {
      formData.append("proof", proof);
    } else if (typeof proof === "string") {
      formData.append("proofUrl", proof);
    }

    return api
      .post(this.route, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };

  // GET ALL
  getAll = async (): Promise<{ data: Array<Quotation> }> => {
    return api.get(this.route).then((response) => response.data);
  };

  // UPDATE — PUT multipart
  update = async (
    id: number,
    { devis, elements }: UpdateQuotation
  ): Promise<{ data: Quotation }> => {
    const formData = new FormData();

    const { proof, ...restDevis } = devis;

    formData.append("devis", JSON.stringify(restDevis));
    formData.append("elements", JSON.stringify(elements));

    if (proof instanceof File) {
      formData.append("proof", proof);
    } else if (typeof proof === "string") {
      formData.append("proofUrl", proof);
    }

    return api
      .put(`${this.route}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  };
  cancel = async (id:number):Promise<{data: Quotation}> => {
    return api.delete(`${this.route}/${id}`).then((response) => response.data);
  }
}
