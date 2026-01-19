import api from "@/providers/axios";
import { Provider } from "@/types/types";

class ProviderQueries {
  route = "/request/provider";

  // --------------------------------------
  // CREATE
  // --------------------------------------

  create = async (
    data: Omit<Provider, "id" | "createdAt">,
  ): Promise<{ message: string; data: Provider }> => {
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

  getAll = async (): Promise<{ data: Array<Provider> }> => {
    return api.get(this.route).then((response) => {
      return response.data;
    });
  };

  getOne = async (id: number): Promise<{ data: Provider }> => {
    return api.get(`${this.route}/${id}`).then((response) => {
      return response.data;
    });
  };

  // --------------------------------------
  // UPDATE (PUT)
  // --------------------------------------

  update = async (
    id: number,
    data: Partial<Omit<Provider, "id" | "createdAt">>,
  ): Promise<{ data: Provider }> => {
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

  delete = async (id: number): Promise<{ data: Provider }> => {
    return api.delete(`${this.route}/${id}`).then((response) => {
      return response.data;
    });
  };
}

export const providerQ = new ProviderQueries();
