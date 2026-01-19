import api from "@/providers/axios";
import { ResponseT, Vehicle } from "@/types/types";

class VehicleQueries {
  route = "/request/vehicle";

  // --------------------------------------
  // CRUD VEHIVehicleS
  // --------------------------------------

  // Create
  create = async (
    payload: Omit<Vehicle, "id" | "createdAt" | "updatedAt">
  ): Promise<ResponseT<Vehicle>> => {
    const formData = new FormData();

    formData.append("label", payload.label);
    formData.append("mark", payload.mark);

    if (payload.matricule) {
      formData.append("matricule", payload.matricule);
    }

    // Gestion image
    if (payload.proof) {
      if (payload.proof instanceof File) {
        formData.append("proof", payload.proof);
      } else if (typeof payload.proof === "string") {
        // cas image déjà existante (URL ou filename)
        formData.append("proof", payload.proof);
      }
    }

    return api
      .post(this.route, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
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
    const formData = new FormData();

    if (data.label) {
      formData.append("label", data.label);
    }

    if (data.mark) {
      formData.append("mark", data.mark);
    }

    if (data.matricule) {
      formData.append("matricule", data.matricule);
    }

    if (data.proof) {
      if (data.proof instanceof File) {
        formData.append("proof", data.proof);
      } else if (typeof data.proof === "string") {
        // image déjà existante (URL ou nom de fichier)
        formData.append("proof", data.proof);
      }
    }

    return api
      .put(`${this.route}/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
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
