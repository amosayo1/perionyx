import type { Shipment, ShippingStatus } from "../../types";

export class ShippingService {
  private shipments = new Map<string, Shipment>();

  addShipment(shipment: Shipment): Shipment {
    this.shipments.set(shipment.id, shipment);
    return shipment;
  }

  getShipment(id: string): Shipment | undefined {
    return this.shipments.get(id);
  }

  getAllShipments(): Shipment[] {
    return Array.from(this.shipments.values());
  }

  getByOrder(orderId: string): Shipment[] {
    return this.getAllShipments().filter(s => s.orderId === orderId);
  }

  getByStatus(status: ShippingStatus): Shipment[] {
    return this.getAllShipments().filter(s => s.status === status);
  }

  getByTracking(trackingNumber: string): Shipment | undefined {
    return this.getAllShipments().find(s => s.trackingNumber === trackingNumber);
  }

  count(): number {
    return this.shipments.size;
  }
}
