import type { DashboardDataV2, IDashboardService } from "./types";

class DashboardClientService implements IDashboardService {
  async getDashboardData(): Promise<DashboardDataV2> {
    const res = await fetch(`/api/dashboard/data`);
    if (!res.ok) {
      throw new Error(`Dashboard data fetch failed: ${res.status}`);
    }
    return res.json() as Promise<DashboardDataV2>;
  }
}

export const dashboardService: IDashboardService =
  new DashboardClientService();
