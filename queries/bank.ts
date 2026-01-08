import api from "@/providers/axios";
import { Bank } from "@/types/types";

export interface BankPayload extends Omit<Bank, "id"| "createdAt" | "updatedAt" | "justification">{
    justification?: File | string
}
export class BankQuery {
  route = "/request/bank";

  getAll = async (): Promise<{ data: Array<Bank> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  create = async (payload:BankPayload):Promise<{data: Bank}> => {
    const formData = new FormData();
    if(payload.justification instanceof File)formData.append("justification", payload.justification);
    formData.append("label", payload.label);
    formData.append("balance", String(payload.balance));
    formData.append("type", payload.type);
    formData.append("Status", String(payload.Status))
    if(!!payload.accountNumber)formData.append("accountNumber", payload.accountNumber);
    if(!!payload.atmCode)formData.append("atmCode", payload.atmCode);
    if(!!payload.bankCode)formData.append("bankCode", payload.bankCode);
    if(!!payload.key)formData.append("key", payload.key);
    if(!!payload.phoneNum)formData.append("phoneNum", payload.phoneNum);
    if(!!payload.merchantNum)formData.append("merchantNum", payload.merchantNum);
    return api.post(this.route, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((response)=>{
    return response.data;
})
  }

  update = async(id:number, payload:BankPayload):Promise<{data: Bank}> => {
    const formData = new FormData();
    if(payload.justification instanceof File)formData.append("justification", payload.justification);
    formData.append("label", payload.label);
    formData.append("balance", String(payload.balance));
    formData.append("type", payload.type);
    formData.append("Status", String(payload.Status))
    if(!!payload.accountNumber)formData.append("accountNumber", payload.accountNumber);
    if(!!payload.atmCode)formData.append("atmCode", payload.atmCode);
    if(!!payload.bankCode)formData.append("bankCode", payload.bankCode);
    if(!!payload.key)formData.append("key", payload.key);
    if(!!payload.phoneNum)formData.append("phoneNum", payload.phoneNum);
    if(!!payload.merchantNum)formData.append("merchantNum", payload.merchantNum);
    return api.put(`${this.route}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((response)=>{
    return response.data;
})
  }
}
