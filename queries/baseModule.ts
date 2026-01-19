import api from "@/providers/axios";
import { LoginResponse, ResponseT, User, Role } from "@/types/types";

class UserQueries {
  route = "/base/user";

  // --------------------------------------
  // AUTH
  // --------------------------------------

  // Login
  login = async (data: {
    email: string;
    password: string;
  }): Promise<ResponseT<LoginResponse>> => {
    return api.post(`${this.route}/login`, data).then((response) => {
      return response.data;
    });
  };

  // Register (sans role)
  register = async (
    data: Omit<User, "status" | "lastConnection" | "role" | "members" | "id">,
  ): Promise<ResponseT<User>> => {
    return api.post(`${this.route}/register`, data).then((response) => {
      return response.data;
    });
  };

  // create (sans role)
  create = async (
    data: Omit<
      User,
      "status" | "lastConnection" | "role" | "members" | "id"
    > & { role: Array<number> },
  ): Promise<{ data: User }> => {
    return api.post(`${this.route}/create`, data).then((response) => {
      return response.data;
    });
  };

  changePassword = async (id: number, password: string): Promise<User> => {
    return api
      .put(`${this.route}/changePassWord/${id}`, { password: password })
      .then((response) => {
        return response.data;
      });
  };

  // Register (sans role)
  changeStatus = async (
    id: number,
    data: { status: string },
  ): Promise<ResponseT<User>> => {
    return api
      .put(`${this.route}/changeStatus/${id}`, data)
      .then((response) => {
        return response.data;
      });
  };

  // Vérification OTP
  getVerificationOtp = async (
    otp: number,
    email: string,
  ): Promise<{ message: string }> => {
    return api
      .get(`${this.route}/verify/${otp}?email=${encodeURI(email)}`)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return error.response.data;
      });
  };

  // --------------------------------------
  // CRUD UTILISATEURS
  // --------------------------------------

  getAll = async (): Promise<{ data: User[] }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  getOne = async (id: number): Promise<{ data: User }> => {
    return api.get(`${this.route}/${id}`).then((response) => {
      return response.data;
    });
  };

  update = async (id: number, data: Partial<User>): Promise<{ data: User }> => {
    return api.put(`${this.route}/${id}`, data).then((response) => {
      return response.data;
    });
  };

  delete = async (id: number): Promise<{ data: User }> => {
    return api.delete(`${this.route}/${id}`).then((response) => {
      return response.data;
    });
  };

  // --------------------------------------
  // ROLES
  // --------------------------------------

  getRoles = async (): Promise<{ data: Role[] }> => {
    return api.get(`${this.route}/role/list`).then((response) => {
      return response.data;
    });
  };

  createRole = async (data: {
    label: string;
  }): Promise<{ message: string; data: Role }> => {
    return api.post(`${this.route}/role/create`, data).then((response) => {
      return response.data;
    });
  };

  updateRole = async (
    id: number,
    data: Partial<Role>,
  ): Promise<{ data: Role }> => {
    return api.put(`${this.route}/role/${id}/update`, data).then((response) => {
      return response.data;
    });
  };

  deleteRole = async (id: number): Promise<{ data: Role }> => {
    return api.delete(`${this.route}/role/${id}`).then((response) => {
      return response.data;
    });
  };

  assignRoles = async (id: number, roleId: string): Promise<{ data: any }> => {
    return api
      .post(`${this.route}/${id}/roles`, { roleId })
      .then((response) => {
        return response.data;
      });
  };

  removeRoles = async (id: number, roles: number[]): Promise<{ data: any }> => {
    return api
      .delete(`${this.route}/${id}/roles`, { data: { roles } })
      .then((response) => {
        return response.data;
      });
  };

  // --------------------------------------
  // ROLE PAGES
  // --------------------------------------

  createRolePages = async (data: any): Promise<{ data: any }> => {
    return api.post(`${this.route}/createRolePages`, data).then((response) => {
      return response.data;
    });
  };

  deleteRolePages = async (data: any): Promise<{ data: any }> => {
    return api.post(`${this.route}/deleteRolePages`, data).then((response) => {
      return response.data;
    });
  };

  addRolePages = async (data: any): Promise<{ data: any }> => {
    return api.post(`${this.route}/addRolePages`, data).then((response) => {
      return response.data;
    });
  };

  removePageFromRole = async (data: any): Promise<{ data: any }> => {
    return api
      .patch(`${this.route}/removePageFromRole`, data)
      .then((response) => {
        return response.data;
      });
  };

  getRolePages = async (roleId: number): Promise<{ data: any }> => {
    return api.get(`${this.route}/rolePages/${roleId}`).then((response) => {
      return response.data;
    });
  };
}

export const userQ = new UserQueries();
