import type { RevenueSchedule, RevenueRecognitionStatus, RevenueRecognitionMethod } from "../../types";

export class RevenueRecognitionService {
  private schedules = new Map<string, RevenueSchedule>();

  addSchedule(schedule: RevenueSchedule): RevenueSchedule {
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  getSchedule(id: string): RevenueSchedule | undefined {
    return this.schedules.get(id);
  }

  getAllSchedules(): RevenueSchedule[] {
    return Array.from(this.schedules.values());
  }

  getByStatus(status: RevenueRecognitionStatus): RevenueSchedule[] {
    return this.getAllSchedules().filter(s => s.status === status);
  }

  getByMethod(method: RevenueRecognitionMethod): RevenueSchedule[] {
    return this.getAllSchedules().filter(s => s.method === method);
  }

  getByCustomer(customerId: string): RevenueSchedule[] {
    return this.getAllSchedules().filter(s => s.customerId === customerId);
  }

  getByPeriod(scheduledDate: Date): RevenueSchedule[] {
    const start = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), 1).getTime();
    const end = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth() + 1, 0, 23, 59, 59).getTime();
    return this.getAllSchedules().filter(s => {
      const t = s.scheduledDate.getTime();
      return t >= start && t <= end;
    });
  }

  getByCompany(companyId: string): RevenueSchedule[] {
    return this.getAllSchedules().filter(s => s.companyId === companyId);
  }

  count(): number {
    return this.schedules.size;
  }
}
