import type { PriceRecord, CustomerGroup } from "../../types";

export class PricingService {
  private prices = new Map<string, PriceRecord>();

  addPrice(price: PriceRecord): PriceRecord {
    this.prices.set(price.id, price);
    return price;
  }

  getPrice(id: string): PriceRecord | undefined {
    return this.prices.get(id);
  }

  getAllPrices(): PriceRecord[] {
    return Array.from(this.prices.values());
  }

  getByCustomer(customerId: string): PriceRecord[] {
    return this.getAllPrices().filter(p => p.customerId === customerId);
  }

  getByProduct(productCode: string): PriceRecord[] {
    return this.getAllPrices().filter(p => p.productCode === productCode);
  }

  getByCurrency(currency: string): PriceRecord[] {
    return this.getAllPrices().filter(p => p.currency === currency);
  }

  count(): number {
    return this.prices.size;
  }
}
