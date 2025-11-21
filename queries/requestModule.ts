import api from "@/providers/axios";
import { RequestModelT } from "@/types/types";

export type CategoryT = {
  id: number;
  label: string;
  description: string | null;
  parentId?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

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
  validate = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.put(`${this.route}/validate/${id}`).then((res) => res.data);
  };

  // Revoir (review)
  review = async (
    id: number,
    data: {validated: boolean, userId: number, decision?: string}
  ): Promise<{ data: RequestModelT }> => {
    return api.put(`${this.route}/review/${id}`, 
      {
        validated: data.validated,
        userId: data.userId
      }
    ).then((res) => res.data);
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

  // ============================
  //       CATEGORY ROUTES
  // ============================

  // GET /request/object/category
  getCategories = async (): Promise<{ data: CategoryT[] }> => {
    return api.get(`${this.route}/category`).then((res) => res.data);
  };

  // POST /request/object/category
  createCategory = async (
    data: Omit<CategoryT, "id" | "createdAt" | "updatedAt">
  ): Promise<{ data: CategoryT }> => {
    return api.post(`${this.route}/category`, data).then((res) => res.data);
  };

  // GET /request/object/category/{id}
  getCategory = async (id: number): Promise<{ data: CategoryT }> => {
    return api.get(`${this.route}/category/${id}`).then((res) => res.data);
  };

  // PUT /request/object/category/{id}
  updateCategory = async (
    id: number,
    data: Partial<CategoryT>
  ): Promise<{ data: CategoryT }> => {
    return api.put(`${this.route}/category/${id}`, data).then((res) => res.data);
  };

  // GET /request/object/category/{id}/children
  getCategoryChildren = async (
    id: number
  ): Promise<{ data: CategoryT[] }> => {
    return api
      .get(`${this.route}/category/${id}/children`)
      .then((res) => res.data);
  };

  // GET /request/object/category/special
  getSpecialCategories = async (): Promise<{ data: CategoryT[] }> => {
    return api
      .get(`${this.route}/category/special`)
      .then((res) => res.data);
  };
}
