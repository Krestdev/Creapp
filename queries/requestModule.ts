import api from "@/providers/axios";
import { RequestModelT } from "@/types/types";

export type newRequestOthers = Omit<
  RequestModelT,
  | "id"
  | "type"
  | "createdAt"
  | "updatedAt"
  | "ref"
  | "validators"
  | "state"
  | "userId"
  | "beneficiary"
  | "user"
> & {
  amount: number;
  benef: Array<number>;
  projectId: number;
};

export type newRequestSettle = Omit<
  RequestModelT,
  | "id"
  | "type"
  | "createdAt"
  | "updatedAt"
  | "ref"
  | "validators"
  | "state"
  | "userId"
  | "beneficiary"
  | "user"
> & {
  amount?: number;
  description?: string;
  benef?: Array<number>;
  proof?: (string | File)[];
  userId: number;
  projectId: number;
};

export type RequestTaxes = Omit<
  RequestModelT,
  | "id"
  | "type"
  | "createdAt"
  | "updatedAt"
  | "ref"
  | "validators"
  | "state"
  | "beneficiary"
  | "user"
> & {
  amount: number;
  benef: Array<number>;
  projectId: number;
};

export type newRequestTransport = Omit<
  RequestModelT,
  | "id"
  | "type"
  | "createdAt"
  | "updatedAt"
  | "ref"
  | "validators"
  | "proof"
  | "state"
  | "userId"
  | "beneficiary"
  | "user"
> & {
  amount: number;
  benef: Array<number>;
  projectId: number;
};

export type newRequestGas = Omit<
  RequestModelT,
  | "id"
  | "type"
  | "createdAt"
  | "updatedAt"
  | "ref"
  | "validators"
  | "proof"
  | "state"
  | "userId"
  | "beneficiary"
  | "liters"
  | "km"
  | "user"
> & {
  benef: Array<number>;
  vehiclesId: number;
};

export type newRequestApprovisionement = Omit<
  RequestModelT,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "ref"
  | "validators"
  | "proof"
  | "userId"
  | "beneficiary"
  | "liters"
  | "km"
  | "state"
  | "user"
>;

class RequestQueries {
  route = "/request/object";

  // ============================
  //         REQUEST CRUD
  // ============================

  // Créer une demande
  create = async (
    data: Omit<
      RequestModelT,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "ref"
      | "project"
      | "validators"
      | "type"
      | "user"
    >,
  ): Promise<{ data: RequestModelT }> => {
    return api.post(this.route, data).then((res) => res.data);
  };

  createApprovisionement = async (
    data: Omit<
      RequestModelT,
      | "id"
      | "updatedAt"
      | "ref"
      | "validators"
      | "proof"
      | "userId"
      | "createdAt"
      | "beneficiary"
      | "state"
      | "user"
    >,
  ) => {
    return api.post(`${this.route}/approvisionement`, data).then((response) => {
      return response.data;
    });
  };

  special = async (
    data: Omit<
      RequestModelT,
      "id" | "createdAt" | "updatedAt" | "ref" | "validators" | "user"
    >,
  ): Promise<{ data: RequestModelT }> => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // Files
      if (Array.isArray(value) && value.every((v) => v instanceof File)) {
        value.forEach((file) => formData.append(key, file));
        return;
      }

      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      // Date
      if (value instanceof Date) {
        formData.append(key, value.toISOString());
        return;
      }

      // Array or Object → JSON
      if (Array.isArray(value) || typeof value === "object") {
        formData.append(key, JSON.stringify(value));
        return;
      }

      // Primitive
      formData.append(key, String(value));
    });

    return api
      .post(`${this.route}/special`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };

  specialUpdate = async (
    data: Partial<RequestModelT>,
    id: number,
  ): Promise<{ data: RequestModelT; id: number }> => {
    const formData = new FormData();

    console.log(data);

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // Files
      if (Array.isArray(value) && value.every((v) => v instanceof File)) {
        value.forEach((file) => formData.append(key, file));
        return;
      }

      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      // Date
      if (value instanceof Date) {
        formData.append(key, value.toISOString());
        return;
      }

      // Array or Object → JSON
      if (Array.isArray(value) || typeof value === "object") {
        formData.append(key, JSON.stringify(value));
        return;
      }

      // Primitive
      formData.append(key, String(value));
    });

    return api
      .put(`${this.route}/special/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };

  // Récupérer toutes les demandes
  getAll = async (
    params?: Record<string, any>,
  ): Promise<{ data: { data: RequestModelT[]; total?: number } }> => {
    return api.get(this.route, { params }).then((res) => res.data);
  };

  // ============================
  //       BÉNÉFICIAIRES
  // ============================

  // Récupérer toutes les demandes
  getAllRequestsHavingPayment = async (): Promise<RequestModelT[]> => {
    return api.get(`${this.route}/requestsWithPayment`).then((res) => res.data);
  };

  // Récupérer toutes les demandes
  getForQuotation = async (): Promise<{ data: RequestModelT[] }> => {
    console.log("getForQuotation");
    return api.get(`${this.route}/quotation`).then((res) => res.data);
  };

  // Récupérer toutes les demandes
  getStats = async (
    params?: Record<string, any>,
  ): Promise<{
    data: {
      awaiting: number;
      rejected: number;
      validated: number;
      fromStore: number;
      cancelled: number;
      sent: number;
    };
  }> => {
    return api.get(`${this.route}/stats`, { params }).then((res) => res.data);
  };

  //Statistiques tableau de bord
  getDashboardStats = async (
    params?: Record<string, any>,
  ): Promise<{
    data: {
      awaiting: number;
      rejected: number;
      submited: number;
      approved: number;
      approvedTotal: number;
      total: number;
    };
  }> => {
    return api
      .get(`${this.route}/board/requests/stats`, { params })
      .then((res) => res.data);
  };

  //Graphiques Tableau de bord
  getDashboardGraph = async (
    params?: Record<string, any>,
  ): Promise<{
    submited: RequestModelT[];
    validator: RequestModelT[];
    all: RequestModelT[];
  }> => {
    return api
      .get(`${this.route}/board/requests/graph`, { params })
      .then((res) => res.data);
  };

  // Récupérer une demande par ID
  getOne = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.get(`${this.route}/${id}`).then((res) => res.data);
  };

  // Modifier une demande
  update = async (
    id: number,
    data: Partial<RequestModelT>,
  ): Promise<{ data: RequestModelT }> => {
    return api.put(`${this.route}/${id}`, data).then((res) => res.data);
  };

  // Supprimer une demande
  delete = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.delete(`${this.route}/${id}`).then((res) => res.data);
  };

  // Demandes de l'utilisateur
  getMine = async (userId: number): Promise<{ data: RequestModelT[] }> => {
    return api.get(`${this.route}/mine/${userId}`).then((res) => res.data);
  };

  // Request to approve/reject
  getValidatorRequests = async (
    params?: Record<string, any>,
  ): Promise<{ data: { data: Array<RequestModelT>; total: number } }> => {
    return api
      .get(`${this.route}/validator/all`, { params })
      .then((res) => res.data);
  };

  getValidatorRequestsStats = async (
    params?: Record<string, any>,
  ): Promise<{
    data: {
      awaiting: number;
      rejected: number;
      validated: number;
      total: number;
    };
  }> => {
    return api
      .get(`${this.route}/validator/stats`, { params })
      .then((res) => res.data);
  };

  // Notification Requests to approve/reject for
  getPendingCount = async (): Promise<{ data: number }> => {
    return api
      .get(`${this.route}/pendingRequests/count`)
      .then((res) => res.data);
  };

  //Service head requests
  getServiceRequests = async (): Promise<{ data: Array<RequestModelT> }> => {
    return api.get(`${this.route}/chief/requests`).then((res) => res.data);
  };

  //Service head requests count
  getServiceRequestsCount = async (): Promise<{ data: number }> => {
    return api
      .get(`${this.route}/chief/requests/count`)
      .then((res) => res.data);
  };

  //usableRequests
  getUsableRequestsCount = async (): Promise<{ data: number }> => {
    return api
      .get(`${this.route}/usableRequests/count`)
      .then((res) => res.data);
  };

  // ============================
  //         VALIDATION
  // ============================

  // Valider une demande (pour le DERNIER validateur)
  validate = async (
    id: number,
    validatorId: number,
    validator:
      | {
          id?: number | undefined;
          userId: number;
          rank: number;
        }
      | undefined,
  ): Promise<{ data: RequestModelT }> => {
    return api
      .put(`${this.route}/validate/${id}`, { validatorId, validator })
      .then((res) => res.data);
  };

  // Revoir (review) une demande (pour les validateurs intermédiaires)
  review = async (
    id: number,
    data: {
      validated: boolean;
      userId: number;
      decision?: string;
      validator?:
        | {
            id?: number | undefined;
            userId: number;
            rank: number;
          }
        | undefined;
    },
  ): Promise<{ data: RequestModelT }> => {
    return api
      .put(`${this.route}/review/${id}`, {
        validated: data.validated,
        userId: data.userId,
        decision: data.decision,
        validator: data.validator,
      })
      .then((res) => res.data);
  };

  // Rejeter une demande
  reject = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.put(`${this.route}/reject/${id}`).then((res) => res.data);
  };

  // ============================
  //         ACTIONS GROUPÉES
  // ============================

  /**
   * Valider plusieurs demandes en batch (pour le DERNIER validateur)
   * Route: PUT /request/object/validateBulk
   * Utilisé lorsque l'utilisateur est le dernier validateur de la chaîne
   */
  validateBulk = async (data: {
    ids: number[];
    validatorId: number;
    validator?: {
      id?: number | undefined;
      userId: number;
      rank: number;
    };
  }): Promise<{ data: { success: boolean; count: number } }> => {
    return api
      .put(`${this.route}/validateBulk`, {
        ids: data.ids,
        validatorId: data.validatorId,
        validator: data.validator,
      })
      .then((res) => res.data);
  };

  /**
   * Revoir (review) plusieurs demandes en batch (pour les validateurs ASCENDANTS)
   * Route: PUT /request/object/reviewBulk
   * Utilisé lorsque l'utilisateur n'est pas le dernier validateur
   */
  reviewBulk = async (data: {
    ids: number[];
    validated: boolean;
    validatorId: number;
    decision?: string;
  }): Promise<{
    data: { success: boolean; count: number; errors?: any[] };
  }> => {
    // Construire le body exact selon le format requis
    const body = {
      decision: data.decision || "",
      validated: data.validated,
      validatorId: data.validatorId,
      ids: data.ids,
    };

    return api.put(`${this.route}/reviewBulk`, body).then((res) => res.data);
  };

  //Validate Service Requests
  validateServiceRequests = async (
    id: number,
    decision: "APPROVED" | "REJECTED",
  ): Promise<{ data: RequestModelT }> => {
    return api
      .put(`${this.route}/takeaction/${id}`, { decision })
      .then((res) => res.data);
  };

  // ============================
  //         AUTRES ACTIONS
  // ============================

  // Modifier la priorité
  updatePriority = async (
    id: number,
    priority: string,
  ): Promise<{ data: RequestModelT }> => {
    return api
      .put(`${this.route}/priority/${id}`, { priority })
      .then((res) => res.data);
  };

  // Soumettre une demande
  submit = async (id: number): Promise<{ data: RequestModelT }> => {
    return api.put(`${this.route}/submit/${id}`).then((res) => res.data);
  };
  createOthersRequest = async (
    payload: newRequestOthers,
  ): Promise<RequestModelT> => {
    return api
      .post(this.route, { ...payload, type: "others", beneficiary: "" })
      .then((response) => {
        return response.data;
      });
  };

  // createSettleRequest = async (
  //   payload: newRequestSettle,
  // ): Promise<RequestModelT> => {
  //   return api
  //     .post(this.route, { ...payload, type: "settle", beneficiary: "" })
  //     .then((response) => {
  //       return response.data;
  //     });
  // };

  createSettleRequest = async (
    payload: newRequestSettle,
  ): Promise<RequestModelT> => {
    const formData = new FormData();
    formData.append("label", payload.label);
    formData.append("description", payload.description);
    payload.amount && formData.append("amount", payload.amount.toString());
    formData.append("dueDate", payload.dueDate.toISOString());
    formData.append("unit", payload.unit);
    formData.append("priority", "medium");
    formData.append("type", "settle");
    formData.append("userId", payload.userId.toString());
    payload.benef &&
      formData.append("beneficiary", payload.benef[0].toString());
    formData.append("benef", JSON.stringify(payload.benef));
    if (payload.categoryId)
      formData.append("categoryId", payload.categoryId.toString());
    if (payload.projectId)
      formData.append("projectId", payload.projectId.toString());
    if (payload.paytype) formData.append("paytype", payload.paytype);
    if (payload.proof && payload.proof.length > 0)
      formData.append("proof", payload.proof[0]);
    return api
      .post(`${this.route}/special`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };

  // Edit settle request formData
  editSettleRequest = async (
    id: number,
    payload: newRequestSettle,
  ): Promise<RequestModelT> => {
    const formData = new FormData();
    formData.append("label", payload.label);
    formData.append("description", payload.description);
    payload.amount && formData.append("amount", payload.amount.toString());
    formData.append("dueDate", payload.dueDate.toISOString());
    formData.append("quantity", payload.quantity.toString());
    formData.append("unit", payload.unit);
    formData.append("priority", "medium");
    formData.append("type", "settle");
    formData.append("userId", payload.userId.toString());
    payload.benef &&
      formData.append("beneficiary", payload.benef[0].toString());
    formData.append("benef", JSON.stringify(payload.benef));
    if (payload.categoryId)
      formData.append("categoryId", payload.categoryId.toString());
    if (payload.projectId)
      formData.append("projectId", payload.projectId.toString());
    if (payload.paytype) formData.append("paytype", payload.paytype);
    if (payload.proof && payload.proof.length > 0)
      formData.append("proof", payload.proof[0]);
    return api
      .put(`${this.route}/special/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };

  createTaxesRequest = async (
    payload: RequestTaxes,
  ): Promise<RequestModelT> => {
    const formData = new FormData();
    formData.append("label", payload.label);
    formData.append("description", payload.description);
    formData.append("amount", payload.amount.toString());
    formData.append("dueDate", payload.dueDate.toISOString());
    formData.append("unit", payload.unit);
    formData.append("priority", payload.priority);
    formData.append("type", "taxes");
    formData.append("userId", payload.userId.toString());
    formData.append("beneficiary", payload.benef[0].toString());
    formData.append("benef", JSON.stringify(payload.benef));
    if (payload.categoryId)
      formData.append("categoryId", payload.categoryId.toString());
    if (payload.projectId)
      formData.append("projectId", payload.projectId.toString());
    if (payload.paytype) formData.append("paytype", payload.paytype);
    if (payload.proof && payload.proof.length > 0)
      formData.append("proof", payload.proof[0]);
    return api
      .post(`${this.route}/special`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        return response.data;
      });
  };

  createTransportRequest = async (
    payload: newRequestTransport,
  ): Promise<RequestModelT> => {
    return api
      .post(this.route, { ...payload, type: "transport", beneficiary: "" })
      .then((response) => {
        return response.data;
      });
  };
  createGasRequest = async (payload: newRequestGas): Promise<RequestModelT> => {
    return api
      .post(this.route, { ...payload, type: "carburent", beneficiary: "" })
      .then((response) => {
        return response.data;
      });
  };
}

export const requestQ = new RequestQueries();

//socket invalidated request = ["myRequests","requests"]
