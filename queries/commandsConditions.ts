import api from "@/providers/axios";
import { CommandCondition } from "@/types/types";

class CommandConditionQueries {
    route = "/request/commandCondition";

    // ============================
    //       CommandCondition ROUTES
    // ============================

    // GET /request/CommandCondition
    getAll = async (): Promise<{ data: CommandCondition[] }> => {
        return api.get(`${this.route}/`).then((res) => res.data);
    };

    // POST /request/CommandCondition
    create = async (
        data: Omit<CommandCondition, "id" | "createdAt" | "updatedAt">
    ): Promise<{ message: string; data: CommandCondition }> => {
        return api.post(`${this.route}/`, data).then((res) => res.data);
    };

    // GET /request/CommandCondition/{id}
    getOne = async (id: number): Promise<{ data: CommandCondition }> => {
        return api.get(`${this.route}/${id}`).then((res) => res.data);
    };

    // PUT /request/CommandCondition/{id}
    update = async (
        id: number,
        data: Partial<CommandCondition>
    ): Promise<{ data: CommandCondition }> => {
        return api.put(`${this.route}/${id}`, data).then((res) => res.data);
    };

    // GET /request/CommandCondition/{id}
    delete = async (id: number): Promise<{ data: CommandCondition }> => {
        return api.delete(`${this.route}/${id}`).then((res) => res.data);
    };
}

export const CommandConditionQ = new CommandConditionQueries();
