import api from "@/providers/axios";
import { Quotation } from "@/types/types";

interface createQuotation {
    devis:Omit<Quotation, "id"|"element"|"ref">;
    elements: Quotation["element"]
}

export class QuotationQueries {
    route="/request/devi"

    create = async (
        {devis, elements}:createQuotation
    ):Promise<{data: Quotation}>=>{
        return api.post(this.route, {devis, elements}).then((response) => {
      console.log(response.data);
      return response.data;
    });
    }

    getAll = async ():Promise<{data: Array<Quotation>}> => {
        return api.get(this.route).then((response) => {
      return response.data;
    });
    }
}