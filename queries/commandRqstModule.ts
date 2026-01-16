import api from "@/providers/axios";
import { CommandRequestT } from "@/types/types";

class CommandRqstQueries {
  route = "/request/cmdrqst";

  // --------------------------------------
  // CREATE
  // --------------------------------------

  create = async (
    data: Omit<
      CommandRequestT,
      "id" | "createdAt" | "updatedAt" | "reference" | "besoins"
    >
  ): Promise<{ data: CommandRequestT }> => {
    return api.post(this.route, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // --------------------------------------
  // READ
  // --------------------------------------

  getAll = async (): Promise<{ data: CommandRequestT[] }> => {
    return api.get(this.route).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  getOne = async (id: number): Promise<{ data: CommandRequestT }> => {
    return api.get(`${this.route}/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // --------------------------------------
  // UPDATE (PUT)
  // --------------------------------------

  update = async (
    id: number,
    data: Partial<CommandRequestT>
  ): Promise<{ data: CommandRequestT }> => {
    return api.put(`${this.route}/${id}`, data).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // --------------------------------------
  // DELETE
  // --------------------------------------

  delete = async (id: number): Promise<{ data: CommandRequestT }> => {
    return api.delete(`${this.route}/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // --------------------------------------
  // VALIDATE / REJECT / SUBMIT
  // --------------------------------------

  validate = async (id: number): Promise<{ data: CommandRequestT }> => {
    return api.put(`${this.route}/validate/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  reject = async (id: number): Promise<{ data: CommandRequestT }> => {
    return api.put(`${this.route}/reject/${id}`).then((response) => {
      return response.data;
    });
  };

  submit = async (id: number): Promise<{ data: CommandRequestT }> => {
    return api.put(`${this.route}/submit/${id}`).then((response) => {
      console.log(response.data);
      return response.data;
    });
  };

  // --------------------------------------
  // DOCUMENT ATTACHMENT
  // --------------------------------------

  attachDoc = async (
    id: number,
    docId: number
  ): Promise<{ data: CommandRequestT }> => {
    return api
      .put(`${this.route}/attachDoc/${id}/${docId}`)
      .then((response) => {
        console.log(response.data);
        return response.data;
      });
  };

  // --------------------------------------
  // PROVIDER LINK
  // --------------------------------------

  linkProvider = async (
    id: number,
    providerId: number
  ): Promise<{ data: CommandRequestT }> => {
    return api
      .put(`${this.route}/linkProvider/${id}/${providerId}`)
      .then((response) => {
        console.log(response.data);
        return response.data;
      });
  };
}

export const commandRqstQ = new CommandRqstQueries();

// socket invalidated commandrequests = ["commands"]
