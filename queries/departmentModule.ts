import api from "@/providers/axios";
import { DepartmentT, Member } from "@/types/types";

export class DepartmentQueries {
  route = "/base/Department";

  // -------------------- CRUD DEPARTMENT --------------------

  // Créer un département
  create = async (
    data: Omit<DepartmentT, "id" | "createdAt" | "updatedAt" | "members">
  ): Promise<{ data: DepartmentT }> => {
    return api.post(this.route, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // Liste des départements
  getAll = async (): Promise<{ data: DepartmentT[] }> => {
    return api.get(this.route).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // Récupérer un département
  getOne = async (id: number): Promise<{ data: DepartmentT }> => {
    return api.get(`${this.route}/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // Modifier un département
  update = async (
    id: number,
    data: Partial<DepartmentT>
  ): Promise<{ data: DepartmentT }> => {
    return api.put(`${this.route}/${id}`, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // Supprimer un département
  delete = async (id: number): Promise<{ data: DepartmentT }> => {
    return api.delete(`${this.route}/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // -------------------- MEMBERS --------------------

  // Récupérer les membres d’un département
  getMembers = async (id: number): Promise<{ data: Member[] }> => {
    return api.get(`${this.route}/${id}/members`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // Ajouter des membres
  addMembers = async (
    id: number,
    members: number[]
  ): Promise<{ data: Member[] }> => {
    return api
      .post(`${this.route}/${id}/members`, { members })
      .then((response) => {
        console.log(response.data);
        return response.data;
      });
  };

  // Retirer des membres
  removeMembers = async (
    id: number,
    members: number[]
  ): Promise<{ data: Member[] }> => {
    return api
      .delete(`${this.route}/${id}/members`, { data: { members } })
      .then((response) => {
        console.log(response.data);
        return response.data;
      });
  };

  // -------------------- VALIDATORS --------------------

  // Liste des validateurs
  getValidators = async (id: number): Promise<{ data: Member[] }> => {
    return api.get(`${this.route}/${id}/validators`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // Ajouter des validateurs
  addValidators = async (
    idDep: number,
    userId: number
  ): Promise<{ data: Member[] }> => {
    return api
      .post(`${this.route}/${idDep}/validators`, { userId })
      .then((response) => {
        console.log(response.data);
        return response.data;
      });
  };

  // Retirer des validateurs
  removeValidators = async (
    id: number,
    userId: number
  ): Promise<{ data: Member[] }> => {
    return api
      .delete(`${this.route}/${id}/validators`, { data: { userId } })
      .then((response) => {
        return response.data;
      });
  };

  // -------------------- FINAL VALIDATORS --------------------

  getFinalValidators = async (id: number): Promise<{ data: Member[] }> => {
    return api.get(`${this.route}/${id}/final-validators`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  addFinalValidators = async (
    id: number,
    userId: number
  ): Promise<{ data: Member[] }> => {
    return api
      .post(`${this.route}/${id}/final-validators`, { userId })
      .then((response) => {
        console.log(response.data);
        return response.data;
      });
  };

  removeFinalValidators = async (
    id: number,
    userId: number
  ): Promise<{ data: Member[] }> => {
    return api
      .delete(`${this.route}/${id}/final-validators`, {
        data: { userId },
      })
      .then((response) => {
        return response.data;
      });
  };

  // -------------------- CHIEF --------------------

  // Ajouter un chef
  addChief = async (id: number, userId: number): Promise<{ data: Member }> => {
    return api
      .post(`${this.route}/${id}/chief`, { userId })
      .then((response) => {
        console.log(response.data);
        return response.data;
      });
  };

  // Supprimer un chef
  removeChief = async (
    id: number,
    userId: number
  ): Promise<{ data: Member }> => {
    return api
      .delete(`${this.route}/${id}/chief`, { data: { userId } })
      .then((response) => {
        console.log(response.data);
        return response.data;
      });
  };
}
