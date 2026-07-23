import type { Customer, CustomerContact, CustomerStatus, CustomerGroup, CustomerRiskRating } from "../../types";

export class CustomerService {
  private customers = new Map<string, Customer>();
  private contacts = new Map<string, CustomerContact>();

  addCustomer(customer: Customer): Customer {
    this.customers.set(customer.id, customer);
    return customer;
  }

  getCustomer(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  getAllCustomers(): Customer[] {
    return Array.from(this.customers.values());
  }

  getByStatus(status: CustomerStatus): Customer[] {
    return this.getAllCustomers().filter(c => c.status === status);
  }

  getByGroup(group: CustomerGroup): Customer[] {
    return this.getAllCustomers().filter(c => c.group === group);
  }

  getByRisk(riskRating: CustomerRiskRating): Customer[] {
    return this.getAllCustomers().filter(c => c.riskRating === riskRating);
  }

  getPreferred(): Customer[] {
    return this.getAllCustomers().filter(c => c.preferred);
  }

  getBlocked(): Customer[] {
    return this.getAllCustomers().filter(c => c.isBlocked);
  }

  search(query: string): Customer[] {
    const q = query.toLowerCase();
    return this.getAllCustomers().filter(
      c => c.name.toLowerCase().includes(q) ||
           c.code.toLowerCase().includes(q) ||
           c.email.toLowerCase().includes(q) ||
           c.legalName.toLowerCase().includes(q)
    );
  }

  addContact(contact: CustomerContact): CustomerContact {
    this.contacts.set(contact.id, contact);
    return contact;
  }

  getContact(id: string): CustomerContact | undefined {
    return this.contacts.get(id);
  }

  getContacts(customerId: string): CustomerContact[] {
    return Array.from(this.contacts.values()).filter(c => c.customerId === customerId);
  }

  count(): number {
    return this.customers.size;
  }
}
