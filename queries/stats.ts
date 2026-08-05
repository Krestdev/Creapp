import api from "@/providers/axios";
import { VehicleStats } from "@/types/types";

class VehicleStatsQueries {
    route = "/request/vehicle/stats";

    // ============================
    //       VehicleStats ROUTES
    // ============================

    // GET /request/VehicleStats
    getAll = async (
        params?: Record<string, any>,
    ): Promise<{ data: VehicleStats }> => {
        return api.get(`${this.route}/`, { params }).then((res) => res.data);
    };

}

export const VehicleStatsQ = new VehicleStatsQueries();
