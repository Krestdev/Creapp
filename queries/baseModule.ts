import api from "@/providers/axios";
import { DepartmentT, LoginResponse, ResponseT, User } from "@/types/types";

// users queries
export class UserQueries {
  route = "/base/user";

  login = async (data: {
    email: string;
    password: string;
  }): Promise<ResponseT<LoginResponse>> => {
    return api.post(`${this.route}/login`, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  register = (data: User) => {
    return api.post(`${this.route}/register`, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  update = (id: number) => {
    return api.put(`${this.route}/${id}`).then((response) => {
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

// Departement Queries

export class DepartmentQueries {
  route = "/base/department";

  create = (data: DepartmentT) => {
    return api.post(this.route, data).then((response) => {
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

  update = (id: number, data: DepartmentT) => {
    return api.put(`${this.route}/${id}`, data).then((response) => {
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

// Services queries

export class ServiceQueries {
  route = "/base/service";

  create = (data: { label: string; description?: string }) => {
    return api.post(this.route, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };
}
