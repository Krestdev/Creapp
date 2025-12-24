import api from "@/providers/axios";
import { RequestModelT } from "@/types/types";

export class RequestQueries {
  route = "/request/object";

  // ============================
  //         REQUEST CRUD
  // ============================

  // Créer une demande
  create = async (
    data: Omit<RequestModelT, "id" | "createdAt" | "updatedAt" | "ref">
  ): Promise<{ data: RequestModelT }> => {
    return api.post(this.route, data).then((res) => res.data);
  };

  // Récupérer toutes les demandes
  getAll = async (): Promise<{ data: RequestModelT[] }> => {
    return api.get(this.route).then((res) => res.data);
  };

  // Récupérer une demande par ID
  getOne = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.get(`${this.route}/${id}`).then((res) => res.data);
  };

  // Modifier une demande
  update = async (
    id: number,
    data: Partial<RequestModelT>
  ): Promise<{ data: RequestModelT }> => {
    return api.put(`${this.route}/${id}`, data).then((res) => res.data);
  };

  // Supprimer une demande
  delete = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.delete(`${this.route}/${id}`).then((res) => res.data);
  };

  // Demandes de l'utilisateur
  getMine = async (userId: number): Promise<{ data: RequestModelT[] }> => {
    return api.get(`${this.route}/mine/${userId}`).then((res) => res.data);
  };

  // Valider
  validate = async (
    id: number,
    validatorId: number,
    validator:
      | {
          id?: number | undefined;
          userId: number;
          rank: number;
        }
      | undefined
  ): Promise<{ data: RequestModelT }> => {
    return api
      .put(`${this.route}/validate/${id}`, { validatorId, validator })
      .then((res) => res.data);
  };

  // Revoir (review)
  review = async (
    id: number,
    data: {
      validated: boolean;
      userId: number;
      decision?: string;
      validator?:
        | {
            id?: number | undefined;
            userId: number;
            rank: number;
          }
        | undefined;
    }
  ): Promise<{ data: RequestModelT }> => {
    return api
      .put(`${this.route}/review/${id}`, {
        validated: data.validated,
        userId: data.userId,
        decision: data.decision,
        validator: data.validator,
      })
      .then((res) => res.data);
  };

  // Rejeter
  reject = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.put(`${this.route}/reject/${id}`).then((res) => res.data);
  };

  // Modifier la priorité
  updatePriority = async (
    id: number,
    priority: string
  ): Promise<{ data: RequestModelT }> => {
    return api
      .put(`${this.route}/priority/${id}`, { priority })
      .then((res) => res.data);
  };

  // Soumettre une demande
  submit = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.put(`${this.route}/submit/${id}`).then((res) => res.data);
  };
}
