import api from "@/providers/axios";
import { ProjectT, User } from "@/types/types";

// Project Queries
class ProjectQueries {
  route = "/project/management";

  create = async (
    data: Omit<
      ProjectT,
      "reference" | "updatedAt" | "createdAt" | "id" | "chief"
    > & {
      chiefId: number;
    },
  ) => {
    return api.post(this.route, data).then((response) => {
      return response.data;
    });
  };

  update = async (id: number, data: Partial<ProjectT>) => {
    return api.put(`${this.route}/${id}`, data).then((response) => {
      return response.data;
    });
  };

  getAll = async (): Promise<{ data: ProjectT[] }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  getOne = async (id: number): Promise<{ data: ProjectT }> => {
    return api.get(`${this.route}/${id}`).then((response) => {
      return response.data;
    });
  };

  delete = async (id: number): Promise<{ data: ProjectT }> => {
    return api.delete(`${this.route}/${id}`).then((response) => {
      return response.data;
    });
  };

  // Récupérer le chef d'un projet
  getChief = async (id: number): Promise<{ data: User }> => {
    return api.get(`${this.route}/${id}/chief`).then((response) => {
      return response.data;
    });
  };
}

export const projectQ = new ProjectQueries();
