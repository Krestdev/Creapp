import api from "@/providers/axios";
import { Driver } from "@/types/types";

class DriverQueries {
  route = "/request/driver";

  // --------------------------------------
  // CREATE
  // --------------------------------------

  create = async (
    data: Omit<Driver, "id" | "createdAt">,
  ): Promise<{ message: string; data: Driver }> => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // Multiple files
      if (Array.isArray(value) && value[0] instanceof File) {
        value.forEach((file) => {
          formData.append(key, file);
        });
        return;
      }

      // Single file
      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      // Normal fields (string, number, boolean)
      formData.append(key, String(value));
    });

    return api
      .post(this.route, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };

  // --------------------------------------
  // READ
  // --------------------------------------

  getAll = async (): Promise<{ data: Array<Driver> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  getOne = async (id: number): Promise<{ data: Driver }> => {
    return api.get(`${this.route}/${id}`).then((response) => {
      return response.data;
    });
  };

  // --------------------------------------
  // UPDATE (PUT)
  // --------------------------------------

  update = async (
    id: number,
    data: Partial<Omit<Driver, "id" | "createdAt">>,
  ): Promise<{ data: Driver }> => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // Multiple files
      if (Array.isArray(value) && value[0] instanceof File) {
        value.forEach((file) => {
          formData.append(key, file);
        });
        return;
      }

      // Single file
      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      // Normal fields (string, number, boolean)
      formData.append(key, String(value));
    });

    return api
      .put(`${this.route}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };

  // --------------------------------------
  // DELETE
  // --------------------------------------

  delete = async (id: number): Promise<{ data: Driver }> => {
    return api.delete(`${this.route}/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };
}

export const driverQ = new DriverQueries();
