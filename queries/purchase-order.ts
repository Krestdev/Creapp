import api from "@/providers/axios"
import { BonsCommande } from "@/types/types"

export type CreatePurchasePayload = {
    command: Omit<BonsCommande, "id" | "createdAt" | "updatedAt" | "status" | "devi" | "reference">;
    ids:Array<number>};

export class PurchaseOrder {
    route = "/request/command"

    getAll = async ():Promise<{data: Array<BonsCommande>}> => {
        return api.get(this.route).then((response)=>{
            return response.data;
        })
    };

    create = async (payload:CreatePurchasePayload):Promise<{data: BonsCommande}> => {
        return api.post(this.route, payload).then((response)=>{
            return response.data;
        })
    }
}