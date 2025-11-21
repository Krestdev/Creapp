import api from "@/providers/axios";
import { CommandRequestT } from "@/types/types";

export class CommandRequestQueries {
  route = "/request/cmdrqst";

  // ============================
  //       COMMAND REQUEST CRUD
  // ============================

  // Créer une commande
  create = async (
    data: Omit<CommandRequestT, "id" | "createdAt" | "updatedAt" | "submited" | "reference" | "totalPrice" | "state">
  ): Promise<{ data: CommandRequestT }> => {
    return api.post(this.route, data).then(res => res.data);
  };

  // Récupérer toutes les commandes
  getAll = async (): Promise<{ data: CommandRequestT[] }> => {
    return api.get(this.route).then(res => res.data);
  };

  // Récupérer une commande par ID
  getOne = async (id: number): Promise<{ data: CommandRequestT }> => {
    return api.get(`${this.route}/${id}`).then(res => res.data);
  };

  // Mettre à jour une commande
  update = async (
    id: number,
    data: Partial<CommandRequestT>
  ): Promise<{ data: CommandRequestT }> => {
    return api.put(`${this.route}/${id}`, data).then(res => res.data);
  };

  // Supprimer une commande
  delete = async (id: number): Promise<{ data: CommandRequestT }> => {
    return api.delete(`${this.route}/${id}`).then(res => res.data);
  };

  // Valider une commande
  validate = async (id: number): Promise<{ data: CommandRequestT }> => {
    return api.put(`${this.route}/validate/${id}`).then(res => res.data);
  };

  // Rejeter une commande
  reject = async (id: number): Promise<{ data: CommandRequestT }> => {
    return api.put(`${this.route}/reject/${id}`).then(res => res.data);
  };

  // Attacher un document
  attachDoc = async (id: number, docId: number): Promise<{ data: CommandRequestT }> => {
    return api.put(`${this.route}/attachDoc/${id}/${docId}`).then(res => res.data);
  };

  // Soumettre la commande
  submit = async (id: number): Promise<{ data: CommandRequestT }> => {
    return api.put(`${this.route}/submit/${id}`).then(res => res.data);
  };

  // Lier un fournisseur
  linkProvider = async (id: number, providerId: number): Promise<{ data: CommandRequestT }> => {
    return api.put(`${this.route}/linkProvider/${id}/${providerId}`).then(res => res.data);
  };
}
