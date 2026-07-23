import type { SalesOrder, SalesOrderStatus, FulfillmentStatus } from "../../types";

export class SalesOrderService {
  private orders = new Map<string, SalesOrder>();

  addOrder(order: SalesOrder): SalesOrder {
    this.orders.set(order.id, order);
    return order;
  }

  getOrder(id: string): SalesOrder | undefined {
    return this.orders.get(id);
  }

  getAllOrders(): SalesOrder[] {
    return Array.from(this.orders.values());
  }

  getByStatus(status: SalesOrderStatus): SalesOrder[] {
    return this.getAllOrders().filter(o => o.status === status);
  }

  getByCustomer(customerId: string): SalesOrder[] {
    return this.getAllOrders().filter(o => o.customerId === customerId);
  }

  getByCompany(companyId: string): SalesOrder[] {
    return this.getAllOrders().filter(o => o.companyId === companyId);
  }

  getByFulfillmentStatus(fulfillmentStatus: FulfillmentStatus): SalesOrder[] {
    return this.getAllOrders().filter(o => o.fulfillmentStatus === fulfillmentStatus);
  }

  getPending(): SalesOrder[] {
    return this.getAllOrders().filter(o => o.status === "submitted" || o.status === "approved");
  }

  getByType(type: string): SalesOrder[] {
    return this.getAllOrders().filter(o => o.type === type);
  }

  count(): number {
    return this.orders.size;
  }
}
