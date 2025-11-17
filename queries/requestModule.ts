import api from "@/providers/axios";
import { RequestModelT, ResponseT } from "@/types/types";

export class RequestQueries {
  route = "/request/object";

  // Créer une demande
  create = async (
    data: Omit<RequestModelT, "id" | "createdAt" | "updatedAt">
  ): Promise<{ data: RequestModelT }> => {
    return api.post(this.route, data).then((response) => {
      return response.data;
    });
  };

  // Récupérer toutes les demandes
  getAll = async (): Promise<{ data: RequestModelT[] }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  // Récupérer une demande par ID
  getOne = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.get(`${this.route}/${id}`).then((response) => {
      return response.data;
    });
  };

  // Mettre à jour une demande
  update = async (
    id: number,
    data: Partial<RequestModelT>
  ): Promise<{ data: RequestModelT }> => {
    return api.put(`${this.route}/${id}`, data).then((response) => {
      return response.data;
    });
  };

  // Supprimer une demande
  delete = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.delete(`${this.route}/${id}`).then((response) => {
      return response.data;
    });
  };

  // Récupérer toutes les demandes de l'utilisateur
  getMine = async (userId: number): Promise<{ data: RequestModelT[] }> => {
    return api.get(`${this.route}/mine/${userId}`).then((response) => {
      return response.data;
    });
  };

  // Valider une demande
  validate = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.put(`${this.route}/validate/${id}`).then((response) => {
      return response.data;
    });
  };

  // Rejeter une demande
  reject = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.put(`${this.route}/reject/${id}`).then((response) => {
      return response.data;
    });
  };

  // Modifier la priorité
  updatePriority = async (
    id: number,
    priority: string
  ): Promise<{ data: RequestModelT }> => {
    return api
      .put(`${this.route}/priority/${id}`, { priority })
      .then((response) => {
        console.log(response.data);
        return response.data;
      });
  };

  // Soumettre une demande
  submit = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.put(`${this.route}/submit/${id}`).then((response) => {
      return response.data;
    });
  };
}
