import api from "@/providers/axios";
import { ProjectT } from "@/types/types";

// Project Queries
export class ProjectQueries {
  route = "/project";

  create = (data: ProjectT) => {
    return api.post(this.route, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  update = (id: number, data: Partial<ProjectT>) => {
    return api.put(`${this.route}/${id}`, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  getAll = () => {
    return api.get(this.route).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  getOne = (id: number) => {
    return api.get(`${this.route}/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  delete = (id: number) => {
    return api.delete(`${this.route}/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };
}
