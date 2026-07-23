import type { Fulfillment, FulfillmentStatus } from "../../types";

export class FulfillmentService {
  private fulfillments = new Map<string, Fulfillment>();

  addFulfillment(fulfillment: Fulfillment): Fulfillment {
    this.fulfillments.set(fulfillment.id, fulfillment);
    return fulfillment;
  }

  getFulfillment(id: string): Fulfillment | undefined {
    return this.fulfillments.get(id);
  }

  getAllFulfillments(): Fulfillment[] {
    return Array.from(this.fulfillments.values());
  }

  getByOrder(orderId: string): Fulfillment[] {
    return this.getAllFulfillments().filter(f => f.orderId === orderId);
  }

  getByStatus(status: FulfillmentStatus): Fulfillment[] {
    return this.getAllFulfillments().filter(f => f.status === status);
  }

  getPending(): Fulfillment[] {
    return this.getAllFulfillments().filter(f => f.status === "pending" || f.status === "in-progress");
  }

  count(): number {
    return this.fulfillments.size;
  }
}
