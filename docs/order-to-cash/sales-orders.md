# Sales Orders

## Order Lifecycle

Sales orders follow a defined lifecycle managed by `SalesOrderService`:

```
Draft → Submitted → Approved → Confirmed → Partially Fulfilled → Completed
                                                    ↓
                                              Cancelled / Returned
```

| Status | Description |
|--------|-------------|
| `draft` | Order is being created; not yet submitted |
| `submitted` | Order submitted for processing |
| `approved` | Order has been approved for fulfillment |
| `confirmed` | Order confirmed by customer or system |
| `partially-fulfilled` | Some line items fulfilled, others pending |
| `completed` | All line items fulfilled and invoiced |
| `cancelled` | Order cancelled before or during fulfillment |
| `returned` | Order delivered and returned |

## Order Types

| Type | Description |
|------|-------------|
| `standard` | Normal order with standard processing |
| `rush` | Expedited order with priority fulfillment |
| `backorder` | Order for items currently out of stock |
| `replacement` | Replacement order for returned/damaged items |

## Fulfillment Tracking

Orders track fulfillment status independently of order status. `FulfillmentStatus` values:

| Status | Description |
|--------|-------------|
| `pending` | No fulfillment activity started |
| `in-progress` | Fulfillment in progress |
| `completed` | All items fulfilled |
| `partial` | Some items fulfilled, others pending |
| `cancelled` | Fulfillment cancelled |

Each order tracks:
- `fulfillmentPercent`: Percentage of order fulfilled (0-100)
- `fulfillmentStatus`: Overall fulfillment state
- `invoiceStatus`: `pending` / `invoiced` / `partial`

## Order Items

Each sales order contains line items (`SalesOrderItem`) with:
- Product code, name, description
- Quantity ordered / fulfilled / invoiced
- Unit price, discount, total price
- Tax rate and amount
- Account code, cost center, project (for GL integration)
- Notes per line item

## Delivery Tracking

Orders track delivery expectations:
- `requestedDeliveryDate`: Customer's requested date
- `promisedDeliveryDate`: Date promised to customer
- `actualDeliveryDate`: Actual delivery date
- `shippingMethod`: Carrier/service level
- `shippingCost`: Cost of shipping
- `trackingNumber`: Shipment tracking reference

## Key Metrics

| Metric | Calculation |
|--------|-------------|
| Total Orders | `count()` |
| Pending Orders | `getByStatus("submitted" \| "approved")` |
| Fulfillment Rate | `completed / total * 100` |
| Open Order Value | Sum of `totalAmount` for open orders |
