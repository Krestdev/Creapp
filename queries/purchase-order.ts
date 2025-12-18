import api from "@/providers/axios"
import { BonsCommande } from "@/types/types"


export class PurchaseOrder {
    route = "/request/command"

    get = async ():Promise<{data: Array<BonsCommande>}> => {
        return api.get(this.route).then((response)=>{
            return response.data;
        })
    };

    create = async (payload:Omit<BonsCommande, "id" | "createdAt" | "updatedAt" | "status">):Promise<{data: BonsCommande}> => {
        return api.post(this.route, payload).then((response)=>{
            return response.data;
        })
    }
}