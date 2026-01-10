import api from "@/providers/axios";
import { ResponseT, Vehicle } from "@/types/types";

class VehicleQueries {
  route = "/request/vehicle";

  // --------------------------------------
  // CRUD VEHIVehicleS
  // --------------------------------------

  // Create
  create = async (
    data: Omit<Vehicle, "id" | "createdAt" | "updatedAt">
  ): Promise<ResponseT<Vehicle>> => {
    return api.post(this.route, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // Get all
  getAll = async (): Promise<{ data: Vehicle[] }> => {
    return api.get(this.route).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // Get one
  getOne = async (id: number): Promise<{ data: Vehicle }> => {
    return api.get(`${this.route}/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // Update
  update = async (
    id: number,
    data: Partial<Vehicle>
  ): Promise<{ data: Vehicle }> => {
    return api.put(`${this.route}/${id}`, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // Delete
  delete = async (id: number): Promise<{ data: Vehicle }> => {
    return api.delete(`${this.route}/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // --------------------------------------
  // ACTIONS SPECIFIQUES
  // --------------------------------------

  // Vehicles d’un utilisateur
  getByUser = async (userId: number): Promise<{ data: Vehicle[] }> => {
    return api.get(`${this.route}/user/${userId}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // Marquer comme lue
  markAsRead = async (id: number): Promise<{ data: Vehicle }> => {
    return api.patch(`${this.route}/${id}/read`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // Marquer toutes comme lues (par utilisateur)
  markAllAsRead = async (userId: number): Promise<{ message: string }> => {
    return api
      .patch(`${this.route}/user/${userId}/read-all`)
      .then((response) => {
        console.log(response.data);
        return response.data;
      });
  };
}

export const vehicleQ = new VehicleQueries();
