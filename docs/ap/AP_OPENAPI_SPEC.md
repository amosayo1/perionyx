# Accounts Payable — OpenAPI 3.1.0 Specification

> **Base URL**: `/api/v1/ap`
> **Authentication**: Bearer token (JWT)
> **Idempotency**: `Idempotency-Key` header on all mutating endpoints marked `(idempotent)`
> **Version**: 1.0.0

---

```yaml
openapi: 3.1.0
info:
  title: Perionyx Accounts Payable API
  description: |
    Enterprise Accounts Payable API covering the full procure-to-pay lifecycle:
    vendor management, invoice capture and matching, exception handling,
    multi-level approvals, payment execution, vendor statement reconciliation,
    credit notes, reporting, and dashboards.

    ## Authentication
    All endpoints require a valid JWT bearer token in the `Authorization` header.

    ## Multi-Tenancy
    Every request is scoped to the authenticated user's `companyId`. Cross-tenant access is blocked.

    ## Idempotency
    All endpoints marked **(idempotent)** accept an optional `Idempotency-Key` header.
    Duplicate requests with the same key within 24 hours return the original response.

    ## Financial Precision
    All monetary values use `string` representation of `Decimal(38,12)`.
    Clients must parse as arbitrary-precision decimal — never `float` or `double`.

    ## Audit Trail
    Every state-changing operation produces an immutable audit record. The `correlationId`
    response header links related records across a single request.
  version: 1.0.0
  contact:
    name: Perionyx Engineering
    email: engineering@perionyx.com
  license:
    name: Proprietary

servers:
  - url: /api/v1/ap
    description: Accounts Payable API

security:
  - bearerAuth: []

tags:
  - name: vendor
    description: Vendor master data lifecycle — create, approve, suspend, deactivate
  - name: invoice
    description: Invoice capture, validation, matching, approval, payment scheduling
  - name: exception
    description: Exception queue — assign, resolve, escalate
  - name: approval
    description: Multi-level approval chains — approve, reject, delegate, escalate
  - name: payment
    description: Payment proposals, batches, and execution
  - name: reconciliation
    description: Vendor statement import, matching, adjustment, completion
  - name: credit
    description: Vendor credit notes — receive, apply, void
  - name: report
    description: AP reports — aging, cash requirements, analytics, audit trail
  - name: dashboard
    description: AP dashboard summary

paths:
  # ────────────────────────────────────────────────────────────────
  # VENDORS (10)
  # ────────────────────────────────────────────────────────────────

  /vendors:
    get:
      operationId: listVendors
      summary: List vendors
      description: Returns a paginated list of vendors with optional filtering.
      tags: [vendor]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/PageParam"
        - $ref: "#/components/parameters/LimitParam"
        - name: status
          in: query
          schema:
            $ref: "#/components/schemas/VendorStatus"
        - name: category
          in: query
          schema:
            type: string
            enum: [SUPPLIER, CONTRACTOR, CONSULTANT, SERVICE_PROVIDER, DISTRIBUTOR, MANUFACTURER]
        - name: search
          in: query
          description: Full-text search on name, vendorCode, taxId
          schema:
            type: string
        - name: riskLevel
          in: query
          schema:
            type: string
            enum: [LOW, MEDIUM, HIGH, CRITICAL]
        - name: preferred
          in: query
          schema:
            type: boolean
        - name: sortBy
          in: query
          schema:
            type: string
            enum: [name, vendorCode, createdAt, totalSpend, rating]
            default: name
        - name: sortOrder
          in: query
          schema:
            type: string
            enum: [asc, desc]
            default: asc
      responses:
        "200":
          description: Paginated vendor list
          content:
            application/json:
              schema:
                type: object
                required: [data, pagination]
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Vendor"
                  pagination:
                    $ref: "#/components/schemas/Pagination"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

    post:
      operationId: createVendor
      summary: Create vendor
      description: Register a new vendor. Starts in `PENDING_REVIEW` status.
      tags: [vendor]
      security:
        - bearerAuth: []
      parameters:
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateVendorInput"
      responses:
        "201":
          description: Vendor created
          headers:
            Location:
              schema:
                type: string
              description: URL of the created vendor
            Correlation-Id:
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Vendor"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "409":
          $ref: "#/components/responses/Conflict"

  /vendors/{vendorId}:
    parameters:
      - $ref: "#/components/parameters/VendorIdParam"

    get:
      operationId: getVendor
      summary: Get vendor
      description: Returns full vendor details including bank details and performance metrics.
      tags: [vendor]
      security:
        - bearerAuth: []
      responses:
        "200":
          description: Vendor details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Vendor"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"

    put:
      operationId: updateVendor
      summary: Update vendor
      description: Modify vendor master data. Bank details require a separate endpoint.
      tags: [vendor]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/VendorIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateVendorInput"
      responses:
        "200":
          description: Vendor updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Vendor"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /vendors/{vendorId}/approve:
    post:
      operationId: approveVendor
      summary: Approve vendor
      description: |
        Approve a pending vendor for active use. Risk score ≥ 50 requires Controller;
        ≥ 80 requires CFO. Creator cannot approve their own vendor (SoD).
      tags: [vendor]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/VendorIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                riskScore:
                  type: number
                  format: float
                  minimum: 0
                  maximum: 100
                notes:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Vendor approved
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Vendor"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /vendors/{vendorId}/reject:
    post:
      operationId: rejectVendor
      summary: Reject vendor
      description: Reject a vendor application. Reason is mandatory (≥ 10 chars).
      tags: [vendor]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/VendorIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
                notes:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Vendor rejected
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Vendor"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /vendors/{vendorId}/suspend:
    post:
      operationId: suspendVendor
      summary: Suspend vendor
      description: Temporarily block a vendor from new POs and invoices. Existing obligations continue.
      tags: [vendor]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/VendorIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
                notes:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Vendor suspended
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Vendor"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /vendors/{vendorId}/reactivate:
    post:
      operationId: reactivateVendor
      summary: Reactivate vendor
      description: Restore a suspended vendor to active status. Expired documents block reactivation.
      tags: [vendor]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/VendorIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                notes:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Vendor reactivated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Vendor"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /vendors/{vendorId}/deactivate:
    post:
      operationId: deactivateVendor
      summary: Deactivate vendor
      description: Permanently deactivate a vendor. No new POs or invoices can reference it.
      tags: [vendor]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/VendorIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                reason:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Vendor deactivated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Vendor"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /vendors/{vendorId}/bank-details:
    put:
      operationId: updateVendorBankDetails
      summary: Update bank details
      description: |
        Replace vendor bank account details. Routing and account numbers are encrypted at rest (AES-256-GCM).
        Only ACTIVE vendors can update bank details.
      tags: [vendor]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/VendorIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [bankName, bankCountry, routingNumber, accountNumber, accountHolderName, accountType]
              properties:
                bankName:
                  type: string
                  minLength: 1
                  maxLength: 255
                bankCountry:
                  type: string
                  description: ISO 3166-1 alpha-2
                  pattern: "^[A-Z]{2}$"
                routingNumber:
                  type: string
                  description: Bank routing number (encrypted at rest)
                  minLength: 1
                  maxLength: 50
                accountNumber:
                  type: string
                  description: Bank account number (encrypted at rest)
                  minLength: 4
                  maxLength: 50
                accountHolderName:
                  type: string
                  minLength: 1
                  maxLength: 255
                accountType:
                  type: string
                  enum: [CHECKING, SAVINGS]
                isPrimary:
                  type: boolean
                  default: true
      responses:
        "200":
          description: Bank details updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Vendor"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  # ────────────────────────────────────────────────────────────────
  # INVOICES (16)
  # ────────────────────────────────────────────────────────────────

  /invoices:
    get:
      operationId: listInvoices
      summary: List invoices
      description: Returns a paginated list of invoices with optional filtering.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/PageParam"
        - $ref: "#/components/parameters/LimitParam"
        - name: status
          in: query
          schema:
            $ref: "#/components/schemas/InvoiceStatus"
        - name: vendorId
          in: query
          schema:
            type: string
            format: uuid
        - name: minAmount
          in: query
          description: Minimum totalAmount (inclusive)
          schema:
            type: string
        - name: maxAmount
          in: query
          description: Maximum totalAmount (inclusive)
          schema:
            type: string
        - name: dueBefore
          in: query
          description: Invoices due on or before this date
          schema:
            type: string
            format: date
        - name: dueAfter
          in: query
          description: Invoices due on or after this date
          schema:
            type: string
            format: date
        - name: search
          in: query
          description: Full-text search on invoiceNumber, vendor name, description
          schema:
            type: string
        - name: sortBy
          in: query
          schema:
            type: string
            enum: [invoiceNumber, invoiceDate, dueDate, totalAmount, status, createdAt]
            default: createdAt
        - name: sortOrder
          in: query
          schema:
            type: string
            enum: [asc, desc]
            default: desc
      responses:
        "200":
          description: Paginated invoice list
          content:
            application/json:
              schema:
                type: object
                required: [data, pagination]
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Invoice"
                  pagination:
                    $ref: "#/components/schemas/Pagination"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

    post:
      operationId: receiveInvoice
      summary: Receive invoice
      description: Capture a new invoice. Validates uniqueness per (vendorId, invoiceNumber).
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateInvoiceInput"
      responses:
        "201":
          description: Invoice received
          headers:
            Location:
              schema:
                type: string
            Correlation-Id:
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}:
    parameters:
      - $ref: "#/components/parameters/InvoiceIdParam"

    get:
      operationId: getInvoice
      summary: Get invoice
      description: Returns full invoice details including line items, match results, and approval chain.
      tags: [invoice]
      security:
        - bearerAuth: []
      responses:
        "200":
          description: Invoice details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"

    put:
      operationId: updateInvoice
      summary: Update invoice
      description: Modify invoice data. Mutable fields depend on current status.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateInvoiceInput"
      responses:
        "200":
          description: Invoice updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}/void:
    post:
      operationId: voidInvoice
      summary: Void invoice
      description: |
        Void an invoice. Requires Controller role. Voided invoices are immutable terminal state.
        Available from Approved, Scheduled, Disputed, or Blocked status.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
      responses:
        "200":
          description: Invoice voided
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}/validate:
    post:
      operationId: validateInvoice
      summary: Validate invoice
      description: Run validation rules (format, tax, dates, duplicates). Auto-triggers on capture.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: Invoice validated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}/match:
    post:
      operationId: matchInvoice
      summary: 3-way match
      description: |
        Execute 3-way match against PO and GRN. Compares price, quantity, and terms.
        Auto-approves if variance ≤ threshold (default 5%).
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: Match result
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}/override:
    post:
      operationId: overrideMatchResult
      summary: Override match result
      description: |
        Force approval despite match variance. Requires AP Manager (Controller if variance >$500).
        Override reason is mandatory and recorded in audit trail.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
      responses:
        "200":
          description: Match overridden
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}/approve:
    post:
      operationId: approveInvoice
      summary: Approve invoice
      description: |
        Approve an invoice for payment. Threshold-based authority:
        <$1K auto-approve, $1K-$10K AP Manager, $10K-$50K Controller,
        $50K-$100K CFO, >$100K CFO + Treasury dual.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                comment:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Invoice approved
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}/reject:
    post:
      operationId: rejectInvoice
      summary: Reject invoice
      description: Reject an invoice. Returns to exception queue for resolution.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
      responses:
        "200":
          description: Invoice rejected
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}/escalate:
    post:
      operationId: escalateInvoice
      summary: Escalate invoice
      description: Escalate invoice to a higher approval authority level.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                reason:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Invoice escalated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}/schedule-payment:
    post:
      operationId: scheduleInvoicePayment
      summary: Schedule invoice for payment
      description: Add an approved invoice to the next payment proposal batch.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                paymentDate:
                  type: string
                  format: date
                  description: Target payment date (must be ≥ today)
                paymentMethod:
                  type: string
                  enum: [ACH, WIRE, CHECK, EFT, VIRTUAL_CARD]
                priority:
                  type: integer
                  minimum: 1
                  maximum: 1000
                  default: 100
      responses:
        "200":
          description: Invoice scheduled
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}/block:
    post:
      operationId: blockInvoice
      summary: Block invoice
      description: Block invoice pending investigation or compliance hold.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
      responses:
        "200":
          description: Invoice blocked
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}/unblock:
    post:
      operationId: unblockInvoice
      summary: Unblock invoice
      description: Remove block from an invoice, returning it to active processing.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                notes:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Invoice unblocked
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}/dispute:
    post:
      operationId: disputeInvoice
      summary: Dispute invoice
      description: Initiate a vendor dispute on invoice amount or items.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
                disputedAmount:
                  type: string
                  description: Amount being disputed (Decimal string)
                contactEmail:
                  type: string
                  format: email
                  description: Vendor contact for dispute resolution
      responses:
        "200":
          description: Invoice disputed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /invoices/{invoiceId}/resolve-dispute:
    post:
      operationId: resolveDispute
      summary: Resolve dispute
      description: Resolve a vendor dispute. Requires AP Manager role.
      tags: [invoice]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/InvoiceIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [resolution]
              properties:
                resolution:
                  type: string
                  minLength: 10
                  maxLength: 2000
                adjustedAmount:
                  type: string
                  description: Adjusted amount if dispute changes the invoice total
      responses:
        "200":
          description: Dispute resolved
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Invoice"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  # ────────────────────────────────────────────────────────────────
  # EXCEPTIONS (6)
  # ────────────────────────────────────────────────────────────────

  /exceptions:
    get:
      operationId: listExceptions
      summary: List exceptions
      description: Returns the exception queue with optional filtering.
      tags: [exception]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/PageParam"
        - $ref: "#/components/parameters/LimitParam"
        - name: status
          in: query
          schema:
            type: string
            enum: [OPEN, IN_REVIEW, RESOLVED, WAIVED, ESCALATED]
        - name: severity
          in: query
          schema:
            type: string
            enum: [LOW, MEDIUM, HIGH, CRITICAL]
        - name: exceptionType
          in: query
          schema:
            type: string
            enum:
              - PRICE_VARIANCE
              - QTY_VARIANCE
              - NO_PO
              - DUPLICATE
              - MISSING_GRN
              - GL_CODING_REQUIRED
              - APPROVAL_REQUIRED
              - TAX_MISMATCH
              - CREDIT_NOTE_REQUIRED
        - name: assignedTo
          in: query
          description: Filter by assigned resolver userId
          schema:
            type: string
        - name: invoiceId
          in: query
          description: Filter by linked invoice
          schema:
            type: string
            format: uuid
        - name: sortBy
          in: query
          schema:
            type: string
            enum: [createdAt, severity, varianceAmount, status]
            default: createdAt
        - name: sortOrder
          in: query
          schema:
            type: string
            enum: [asc, desc]
            default: desc
      responses:
        "200":
          description: Paginated exception list
          content:
            application/json:
              schema:
                type: object
                required: [data, pagination]
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Exception"
                  pagination:
                    $ref: "#/components/schemas/Pagination"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  /exceptions/{exceptionId}:
    get:
      operationId: getException
      summary: Get exception
      description: Returns full exception details including linked invoice and resolution history.
      tags: [exception]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ExceptionIdParam"
      responses:
        "200":
          description: Exception details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Exception"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"

  /exceptions/{exceptionId}/assign:
    post:
      operationId: assignException
      summary: Assign exception
      description: Assign an exception to a resolver. Auto-assign by type/expertise.
      tags: [exception]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ExceptionIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [assignedTo]
              properties:
                assignedTo:
                  type: string
                  description: userId of the assigned resolver
                notes:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Exception assigned
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Exception"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /exceptions/{exceptionId}/resolve:
    post:
      operationId: resolveException
      summary: Resolve exception
      description: Resolve an exception with documentation. CRITICAL exceptions require Controller.
      tags: [exception]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ExceptionIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [resolution]
              properties:
                resolution:
                  type: string
                  minLength: 10
                  maxLength: 2000
                action:
                  type: string
                  enum: [RESOLVED, WAIVED]
                  default: RESOLVED
      responses:
        "200":
          description: Exception resolved
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Exception"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /exceptions/{exceptionId}/escalate:
    post:
      operationId: escalateException
      summary: Escalate exception
      description: Escalate exception to a higher authority. Controller for >$5K exceptions.
      tags: [exception]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ExceptionIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                escalatedTo:
                  type: string
                  description: userId of escalation target
                reason:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Exception escalated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Exception"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /exceptions/bulk-resolve:
    post:
      operationId: bulkResolveExceptions
      summary: Bulk resolve exceptions
      description: Resolve multiple exceptions in a single operation. Requires AP Manager.
      tags: [exception]
      security:
        - bearerAuth: []
      parameters:
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [exceptionIds, resolution]
              properties:
                exceptionIds:
                  type: array
                  items:
                    type: string
                    format: uuid
                  minItems: 1
                  maxItems: 100
                resolution:
                  type: string
                  minLength: 10
                  maxLength: 2000
                action:
                  type: string
                  enum: [RESOLVED, WAIVED]
                  default: RESOLVED
      responses:
        "200":
          description: Bulk resolve result
          content:
            application/json:
              schema:
                type: object
                required: [resolved, failed]
                properties:
                  resolved:
                    type: integer
                    description: Count of successfully resolved exceptions
                  failed:
                    type: integer
                    description: Count of exceptions that could not be resolved
                  failedIds:
                    type: array
                    items:
                      type: string
                      format: uuid
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  # ────────────────────────────────────────────────────────────────
  # APPROVALS (7)
  # ────────────────────────────────────────────────────────────────

  /approvals:
    get:
      operationId: listApprovals
      summary: List approval queue
      description: Returns the current user's pending approval queue.
      tags: [approval]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/PageParam"
        - $ref: "#/components/parameters/LimitParam"
        - name: status
          in: query
          schema:
            type: string
            enum: [PENDING, APPROVED, REJECTED, DELEGATED, ESCALATED, SKIPPED]
        - name: minAmount
          in: query
          schema:
            type: string
        - name: maxAmount
          in: query
          schema:
            type: string
        - name: sortBy
          in: query
          schema:
            type: string
            enum: [createdAt, requiredThreshold, approvalLevel]
            default: createdAt
        - name: sortOrder
          in: query
          schema:
            type: string
            enum: [asc, desc]
            default: asc
      responses:
        "200":
          description: Paginated approval list
          content:
            application/json:
              schema:
                type: object
                required: [data, pagination]
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/ApprovalChain"
                  pagination:
                    $ref: "#/components/schemas/Pagination"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  /approvals/{approvalChainId}:
    get:
      operationId: getApprovalChain
      summary: Get approval chain
      description: Returns the full approval chain for an invoice including all levels and decisions.
      tags: [approval]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ApprovalChainIdParam"
      responses:
        "200":
          description: Approval chain details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApprovalChain"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"

  /approvals/{approvalChainId}/approve:
    post:
      operationId: approveApprovalChain
      summary: Approve
      description: Grant approval at the current level. All previous levels must be approved first.
      tags: [approval]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ApprovalChainIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                comment:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Approved
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApprovalChain"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /approvals/{approvalChainId}/reject:
    post:
      operationId: rejectApprovalChain
      summary: Reject
      description: Deny approval at the current level. Invoice returns to exception queue.
      tags: [approval]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ApprovalChainIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
      responses:
        "200":
          description: Rejected
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApprovalChain"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /approvals/{approvalChainId}/delegate:
    post:
      operationId: delegateApproval
      summary: Delegate
      description: Delegate approval to an alternate approver. SoD rules enforced.
      tags: [approval]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ApprovalChainIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [delegatedTo, reason]
              properties:
                delegatedTo:
                  type: string
                  description: userId of the delegate
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
      responses:
        "200":
          description: Delegated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApprovalChain"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /approvals/{approvalChainId}/escalate:
    post:
      operationId: escalateApproval
      summary: Escalate
      description: Escalate to the next authority level. Auto-escalates on SLA breach.
      tags: [approval]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ApprovalChainIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                reason:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Escalated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApprovalChain"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /approvals/{approvalChainId}/recall:
    post:
      operationId: recallApproval
      summary: Recall
      description: |
        Recall a submitted invoice from the approval chain. Only the original submitter
        or Controller can recall. Prevents approval on an invoice that should be corrected.
      tags: [approval]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ApprovalChainIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
      responses:
        "200":
          description: Recalled
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApprovalChain"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  # ────────────────────────────────────────────────────────────────
  # PAYMENTS (11)
  # ────────────────────────────────────────────────────────────────

  /payments/proposals:
    post:
      operationId: generatePaymentProposal
      summary: Generate payment proposal
      description: |
        Generate a payment proposal by selecting approved invoices for payment.
        Considers cash flow, early-pay discounts, and vendor payment terms.
      tags: [payment]
      security:
        - bearerAuth: []
      parameters:
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [paymentDate, paymentMethod]
              properties:
                paymentDate:
                  type: string
                  format: date
                  description: Target payment date (must be ≥ today)
                paymentMethod:
                  type: string
                  enum: [ACH, WIRE, CHECK, EFT, VIRTUAL_CARD]
                vendorIds:
                  type: array
                  description: Restrict to specific vendors (empty = all eligible)
                  items:
                    type: string
                    format: uuid
                prioritizeDiscounts:
                  type: boolean
                  default: false
                  description: Sort by discount deadline descending
                includePartialPayments:
                  type: boolean
                  default: false
                  description: Allow paying partial balances
                maxTotalAmount:
                  type: string
                  description: Cap total proposal amount (Decimal string)
      responses:
        "201":
          description: Proposal generated
          headers:
            Location:
              schema:
                type: string
            Correlation-Id:
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentProposal"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "409":
          $ref: "#/components/responses/Conflict"

  /payments/proposals/{proposalId}:
    get:
      operationId: getPaymentProposal
      summary: Get proposal
      description: Returns full payment proposal details including all invoice items.
      tags: [payment]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ProposalIdParam"
      responses:
        "200":
          description: Proposal details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentProposal"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"

  /payments/proposals/{proposalId}/review:
    post:
      operationId: reviewPaymentProposal
      summary: Review proposal
      description: AP Manager review step before approval. Records review notes.
      tags: [payment]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ProposalIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                notes:
                  type: string
                  maxLength: 2000
                adjustments:
                  type: array
                  description: Invoice-level adjustments
                  items:
                    type: object
                    required: [invoiceId]
                    properties:
                      invoiceId:
                        type: string
                        format: uuid
                      amount:
                        type: string
                        description: Adjusted payment amount (Decimal string)
      responses:
        "200":
          description: Proposal reviewed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentProposal"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /payments/proposals/{proposalId}/approve:
    post:
      operationId: approvePaymentProposal
      summary: Approve proposal
      description: |
        Approve proposal for execution. Controller required if total >$100K.
        Creates a PaymentBatch upon approval.
      tags: [payment]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ProposalIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                comment:
                  type: string
                  maxLength: 2000
      responses:
        "200":
          description: Proposal approved
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentProposal"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /payments/proposals/{proposalId}/reject:
    post:
      operationId: rejectPaymentProposal
      summary: Reject proposal
      description: Reject proposal. Must be modified and resubmitted.
      tags: [payment]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ProposalIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
      responses:
        "200":
          description: Proposal rejected
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentProposal"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /payments/batches:
    post:
      operationId: createPaymentBatch
      summary: Create batch
      description: |
        Create a payment batch from an approved proposal. Generates bank file
        (ACH, wire, check run) and prepares individual payments.
      tags: [payment]
      security:
        - bearerAuth: []
      parameters:
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [proposalId]
              properties:
                proposalId:
                  type: string
                  format: uuid
                bankAccountId:
                  type: string
                  description: Override source bank account
      responses:
        "201":
          description: Batch created
          headers:
            Location:
              schema:
                type: string
            Correlation-Id:
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentBatch"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /payments/batches/{batchId}:
    get:
      operationId: getPaymentBatch
      summary: Get batch
      description: Returns full payment batch details including all individual payments.
      tags: [payment]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/BatchIdParam"
      responses:
        "200":
          description: Batch details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentBatch"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"

  /payments/batches/{batchId}/execute:
    post:
      operationId: executePayment
      summary: Execute payment
      description: |
        Submit batch to bank/payment processor. Treasury Manager role required.
        Payment safety: idempotency, velocity (>5 same vendor/day alerts),
        threshold (>$100K requires CFO + Treasury dual).
      tags: [payment]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/BatchIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: Payment executed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentBatch"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /payments/batches/{batchId}/confirm:
    post:
      operationId: confirmPayment
      summary: Confirm payment
      description: |
        Confirm bank receipt. Marks individual payments as CLEARED and updates
        invoice `amountPaid`. Triggers GL posting.
      tags: [payment]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/BatchIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                confirmations:
                  type: array
                  description: Per-payment confirmations (empty = confirm all cleared)
                  items:
                    type: object
                    required: [paymentId]
                    properties:
                      paymentId:
                        type: string
                        format: uuid
                      transactionReference:
                        type: string
                      clearedDate:
                        type: string
                        format: date
      responses:
        "200":
          description: Payment confirmed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentBatch"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /payments/batches/{batchId}/reverse:
    post:
      operationId: reversePayment
      summary: Reverse payment
      description: |
        Reverse a completed payment. Requires Controller (CFO if >$50K).
        Creates reversing GL entries and restores invoice balances.
      tags: [payment]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/BatchIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason, paymentIds]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
                paymentIds:
                  type: array
                  description: Specific payments to reverse (empty = reverse all)
                  items:
                    type: string
                    format: uuid
      responses:
        "200":
          description: Payment reversed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentBatch"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /payments/batches/{batchId}/cancel:
    post:
      operationId: cancelPayment
      summary: Cancel payment
      description: |
        Cancel a pending or processing batch before bank confirmation.
        Failed payments trigger automatic reversal.
      tags: [payment]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/BatchIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
      responses:
        "200":
          description: Payment cancelled
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentBatch"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  # ────────────────────────────────────────────────────────────────
  # RECONCILIATIONS (6)
  # ────────────────────────────────────────────────────────────────

  /reconciliations:
    get:
      operationId: listReconciliations
      summary: List reconciliations
      description: Returns a paginated list of vendor statement reconciliations.
      tags: [reconciliation]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/PageParam"
        - $ref: "#/components/parameters/LimitParam"
        - name: status
          in: query
          schema:
            type: string
            enum: [IN_PROGRESS, COMPLETED, EXCEPTION, ADJUSTED]
        - name: vendorId
          in: query
          schema:
            type: string
            format: uuid
        - name: sortBy
          in: query
          schema:
            type: string
            enum: [reconciliationDate, matchRate, balanceVariance, status]
            default: reconciliationDate
        - name: sortOrder
          in: query
          schema:
            type: string
            enum: [asc, desc]
            default: desc
      responses:
        "200":
          description: Paginated reconciliation list
          content:
            application/json:
              schema:
                type: object
                required: [data, pagination]
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Reconciliation"
                  pagination:
                    $ref: "#/components/schemas/Pagination"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  /reconciliations/import:
    post:
      operationId: importStatement
      summary: Import statement
      description: Upload and parse a vendor statement for reconciliation.
      tags: [reconciliation]
      security:
        - bearerAuth: []
      parameters:
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [vendorId, statementDate, periodStart, periodEnd]
              properties:
                vendorId:
                  type: string
                  format: uuid
                statementDate:
                  type: string
                  format: date
                periodStart:
                  type: string
                  format: date
                periodEnd:
                  type: string
                  format: date
                openingBalance:
                  type: string
                  description: Opening balance (Decimal string)
                lines:
                  type: array
                  description: Statement lines (manual entry or parsed from file)
                  items:
                    type: object
                    required: [transactionDate, reference, description]
                    properties:
                      transactionDate:
                        type: string
                        format: date
                      reference:
                        type: string
                      description:
                        type: string
                      debitAmount:
                        type: string
                      creditAmount:
                        type: string
                      transactionType:
                        type: string
                        enum: [INVOICE, PAYMENT, CREDIT, ADJUSTMENT, FEE]
      responses:
        "201":
          description: Statement imported
          headers:
            Correlation-Id:
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Reconciliation"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "409":
          $ref: "#/components/responses/Conflict"

  /reconciliations/{reconciliationId}:
    get:
      operationId: getReconciliation
      summary: Get reconciliation detail
      description: Returns full reconciliation details including line-by-line match results.
      tags: [reconciliation]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ReconciliationIdParam"
      responses:
        "200":
          description: Reconciliation details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Reconciliation"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"

  /reconciliations/{reconciliationId}/run:
    post:
      operationId: runReconciliation
      summary: Run reconciliation
      description: |
        Execute auto-matching between statement lines and AP ledger records.
        Matches by reference, amount, and date within tolerance.
      tags: [reconciliation]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ReconciliationIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: Reconciliation completed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Reconciliation"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /reconciliations/{reconciliationId}/adjust:
    post:
      operationId: adjustReconciliation
      summary: Adjust
      description: |
        Post manual adjustments for discrepancies. Threshold: <$50 AP Clerk,
        $50-$500 AP Manager, >$500 Controller.
      tags: [reconciliation]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ReconciliationIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [amount, reason]
              properties:
                amount:
                  type: string
                  description: Adjustment amount (Decimal string)
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
                glAccountId:
                  type: string
                  description: GL account for adjustment posting
      responses:
        "200":
          description: Adjustment posted
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Reconciliation"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /reconciliations/{reconciliationId}/complete:
    post:
      operationId: completeReconciliation
      summary: Complete
      description: Finalize reconciliation. Posts adjustment entries to GL.
      tags: [reconciliation]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ReconciliationIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: Reconciliation completed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Reconciliation"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  # ────────────────────────────────────────────────────────────────
  # CREDITS (5)
  # ────────────────────────────────────────────────────────────────

  /credits:
    get:
      operationId: listCredits
      summary: List credits
      description: Returns a paginated list of vendor credit notes.
      tags: [credit]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/PageParam"
        - $ref: "#/components/parameters/LimitParam"
        - name: status
          in: query
          schema:
            type: string
            enum: [ISSUED, PARTIALLY_APPLIED, FULLY_APPLIED, EXPIRED, VOIDED]
        - name: vendorId
          in: query
          schema:
            type: string
            format: uuid
        - name: sortBy
          in: query
          schema:
            type: string
            enum: [creditNumber, creditDate, creditAmount, status]
            default: creditDate
        - name: sortOrder
          in: query
          schema:
            type: string
            enum: [asc, desc]
            default: desc
      responses:
        "200":
          description: Paginated credit note list
          content:
            application/json:
              schema:
                type: object
                required: [data, pagination]
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/CreditNote"
                  pagination:
                    $ref: "#/components/schemas/Pagination"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

    post:
      operationId: receiveCreditNote
      summary: Receive credit note
      description: Capture a new vendor credit note.
      tags: [credit]
      security:
        - bearerAuth: []
      parameters:
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [vendorId, creditNumber, creditDate, creditAmount, currency]
              properties:
                vendorId:
                  type: string
                  format: uuid
                creditNumber:
                  type: string
                  description: Vendor's credit note number (unique per vendor)
                creditDate:
                  type: string
                  format: date
                creditAmount:
                  type: string
                  description: Total credit value (Decimal string, > 0)
                currency:
                  type: string
                  description: ISO 4217
                  pattern: "^[A-Z]{3}$"
                reason:
                  type: string
                  maxLength: 2000
                expiryDate:
                  type: string
                  format: date
      responses:
        "201":
          description: Credit note received
          headers:
            Location:
              schema:
                type: string
            Correlation-Id:
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CreditNote"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "409":
          $ref: "#/components/responses/Conflict"

  /credits/{creditId}:
    get:
      operationId: getCreditNote
      summary: Get credit note
      description: Returns full credit note details including application history.
      tags: [credit]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/CreditIdParam"
      responses:
        "200":
          description: Credit note details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CreditNote"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"

  /credits/{creditId}/apply:
    post:
      operationId: applyCreditNote
      summary: Apply credit
      description: |
        Apply credit note to an outstanding invoice. Credit and invoice must belong
        to the same vendor. Cannot make invoice netBalance negative.
      tags: [credit]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/CreditIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [invoiceId, amount]
              properties:
                invoiceId:
                  type: string
                  format: uuid
                  description: Invoice to apply credit against
                amount:
                  type: string
                  description: Amount to apply (Decimal string, ≤ remaining credit)
      responses:
        "200":
          description: Credit applied
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CreditNote"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  /credits/{creditId}/void:
    post:
      operationId: voidCreditNote
      summary: Void credit
      description: |
        Void a credit note. Requires Controller role. Any applied amounts are reversed
        on the linked invoices.
      tags: [credit]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/CreditIdParam"
        - name: Idempotency-Key
          in: header
          required: false
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 10
                  maxLength: 2000
      responses:
        "200":
          description: Credit voided
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CreditNote"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "409":
          $ref: "#/components/responses/Conflict"

  # ────────────────────────────────────────────────────────────────
  # REPORTS (8) + DASHBOARD (1)
  # ────────────────────────────────────────────────────────────────

  /reports/aging:
    get:
      operationId: getVendorAging
      summary: Vendor aging report
      description: Returns vendor aging buckets (Current, 1-30, 31-60, 61-90, 90+).
      tags: [report]
      security:
        - bearerAuth: []
      parameters:
        - name: asOf
          in: query
          description: Report date (defaults to today)
          schema:
            type: string
            format: date
        - name: vendorId
          in: query
          description: Filter to specific vendor
          schema:
            type: string
            format: uuid
        - name: groupBy
          in: query
          schema:
            type: string
            enum: [vendor, category, currency]
            default: vendor
      responses:
        "200":
          description: Aging report
          content:
            application/json:
              schema:
                type: object
                required: [data, summary]
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        vendorId:
                          type: string
                          format: uuid
                        vendorName:
                          type: string
                        currency:
                          type: string
                        current:
                          type: string
                        days1to30:
                          type: string
                        days31to60:
                          type: string
                        days61to90:
                          type: string
                        over90:
                          type: string
                        total:
                          type: string
                  summary:
                    type: object
                    properties:
                      totalCurrent:
                        type: string
                      total1to30:
                        type: string
                      total31to60:
                        type: string
                      total61to90:
                        type: string
                      totalOver90:
                        type: string
                      grandTotal:
                        type: string
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  /reports/cash-requirements:
    get:
      operationId: getCashRequirements
      summary: Cash requirements report
      description: Projects cash outflows by date based on approved invoices and payment terms.
      tags: [report]
      security:
        - bearerAuth: []
      parameters:
        - name: horizon
          in: query
          description: Projection horizon in days
          schema:
            type: integer
            minimum: 1
            maximum: 365
            default: 90
        - name: currency
          in: query
          schema:
            type: string
      responses:
        "200":
          description: Cash requirements
          content:
            application/json:
              schema:
                type: object
                required: [data, summary]
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        date:
                          type: string
                          format: date
                        amount:
                          type: string
                        invoiceCount:
                          type: integer
                        vendorCount:
                          type: integer
                  summary:
                    type: object
                    properties:
                      totalRequired:
                        type: string
                      averageDaily:
                        type: string
                      peakDate:
                        type: string
                        format: date
                      peakAmount:
                        type: string
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  /reports/discount-available:
    get:
      operationId: getDiscountsAvailable
      summary: Available discounts report
      description: Shows early-payment discounts available and their expiration deadlines.
      tags: [report]
      security:
        - bearerAuth: []
      parameters:
        - name: vendorId
          in: query
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: Discounts report
          content:
            application/json:
              schema:
                type: object
                required: [data, summary]
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        invoiceId:
                          type: string
                          format: uuid
                        invoiceNumber:
                          type: string
                        vendorName:
                          type: string
                        totalAmount:
                          type: string
                        discountPercent:
                          type: string
                        discountAmount:
                          type: string
                        discountDeadline:
                          type: string
                          format: date
                        daysRemaining:
                          type: integer
                  summary:
                    type: object
                    properties:
                      totalPotentialSavings:
                        type: string
                      invoicesExpiringToday:
                        type: integer
                      invoicesExpiringThisWeek:
                        type: integer
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  /reports/payment-calendar:
    get:
      operationId: getPaymentCalendar
      summary: Payment calendar
      description: Calendar view of scheduled and upcoming payments.
      tags: [report]
      security:
        - bearerAuth: []
      parameters:
        - name: startDate
          in: query
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          schema:
            type: string
            format: date
        - name: paymentMethod
          in: query
          schema:
            type: string
            enum: [ACH, WIRE, CHECK, EFT, VIRTUAL_CARD]
      responses:
        "200":
          description: Payment calendar
          content:
            application/json:
              schema:
                type: object
                required: [data]
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        date:
                          type: string
                          format: date
                        payments:
                          type: array
                          items:
                            type: object
                            properties:
                              invoiceId:
                                type: string
                                format: uuid
                              invoiceNumber:
                                type: string
                              vendorName:
                                type: string
                              amount:
                                type: string
                              paymentMethod:
                                type: string
                              status:
                                type: string
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  /reports/outstanding-liabilities:
    get:
      operationId: getOutstandingLiabilities
      summary: Outstanding liabilities
      description: Total AP balance breakdown by vendor, category, and aging.
      tags: [report]
      security:
        - bearerAuth: []
      parameters:
        - name: asOf
          in: query
          schema:
            type: string
            format: date
        - name: groupBy
          in: query
          schema:
            type: string
            enum: [vendor, category, currency, paymentTerms]
            default: vendor
      responses:
        "200":
          description: Outstanding liabilities
          content:
            application/json:
              schema:
                type: object
                required: [data, summary]
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        group:
                          type: string
                        balance:
                          type: string
                        invoiceCount:
                          type: integer
                        oldestInvoiceDate:
                          type: string
                          format: date
                  summary:
                    type: object
                    properties:
                      totalOutstanding:
                        type: string
                      totalInvoices:
                        type: integer
                      totalVendors:
                        type: integer
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  /reports/analytics:
    get:
      operationId: getAPAnalytics
      summary: AP analytics
      description: Key AP performance metrics — DPO, cycle time, match rate, exception rate.
      tags: [report]
      security:
        - bearerAuth: []
      parameters:
        - name: period
          in: query
          description: Reporting period
          schema:
            type: string
            enum: [current_month, last_30_days, last_90_days, ytd, last_year]
            default: last_30_days
      responses:
        "200":
          description: AP analytics
          content:
            application/json:
              schema:
                type: object
                required: [data]
                properties:
                  data:
                    type: object
                    properties:
                      daysPayableOutstanding:
                        type: number
                        format: float
                        description: Average DPO
                      averageCycleTime:
                        type: number
                        format: float
                        description: Average days from capture to payment
                      matchRate:
                        type: number
                        format: float
                        description: % of invoices matching on first try
                      autoApproveRate:
                        type: number
                        format: float
                        description: % of invoices auto-approved
                      exceptionRate:
                        type: number
                        format: float
                        description: % of invoices hitting exception queue
                      invoiceVolume:
                        type: integer
                        description: Total invoices in period
                      totalSpend:
                        type: string
                      averageInvoiceAmount:
                        type: string
                      topVendors:
                        type: array
                        items:
                          type: object
                          properties:
                            vendorId:
                              type: string
                              format: uuid
                            vendorName:
                              type: string
                            totalAmount:
                              type: string
                            invoiceCount:
                              type: integer
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  /reports/duplicates:
    get:
      operationId: getDuplicateDetection
      summary: Duplicate invoice detection
      description: Lists potential duplicate invoices detected by the system.
      tags: [report]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/PageParam"
        - $ref: "#/components/parameters/LimitParam"
        - name: minConfidence
          in: query
          description: Minimum confidence score (0-100)
          schema:
            type: number
            format: float
            minimum: 0
            maximum: 100
            default: 50
      responses:
        "200":
          description: Duplicate detection results
          content:
            application/json:
              schema:
                type: object
                required: [data, pagination]
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        invoiceId:
                          type: string
                          format: uuid
                        invoiceNumber:
                          type: string
                        vendorName:
                          type: string
                        totalAmount:
                          type: string
                        duplicateOfId:
                          type: string
                          format: uuid
                        duplicateOfNumber:
                          type: string
                        confidence:
                          type: number
                          format: float
                        reasons:
                          type: array
                          items:
                            type: string
                  pagination:
                    $ref: "#/components/schemas/Pagination"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  /reports/audit-trail:
    get:
      operationId: getAuditTrail
      summary: Audit trail
      description: |
        Immutable chronological audit log for AP entities. Supports filtering by entity,
        action, user, and date range. 7-year retention.
      tags: [report]
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/PageParam"
        - $ref: "#/components/parameters/LimitParam"
        - name: entityType
          in: query
          schema:
            type: string
            enum:
              - VendorInvoice
              - ProcurementVendor
              - ThreeWayMatch
              - InvoiceException
              - ApprovalRecord
              - PaymentRecord
              - PaymentBatch
              - PaymentProposal
              - VendorCredit
              - ReconciliationResult
        - name: entityId
          in: query
          description: Filter to specific entity
          schema:
            type: string
            format: uuid
        - name: action
          in: query
          schema:
            type: string
            enum:
              - CREATED
              - UPDATED
              - STATUS_CHANGED
              - APPROVED
              - REJECTED
              - VOIDED
              - PAID
              - EXCEPTION
              - RESOLVED
              - DELEGATED
              - ESCALATED
              - CONFIG_CHANGED
        - name: userId
          in: query
          description: Filter by actor
          schema:
            type: string
        - name: startDate
          in: query
          schema:
            type: string
            format: date-time
        - name: endDate
          in: query
          schema:
            type: string
            format: date-time
        - name: correlationId
          in: query
          description: Filter by request correlation ID
          schema:
            type: string
        - name: sortBy
          in: query
          schema:
            type: string
            enum: [createdAt]
            default: createdAt
        - name: sortOrder
          in: query
          schema:
            type: string
            enum: [asc, desc]
            default: desc
      responses:
        "200":
          description: Audit trail
          content:
            application/json:
              schema:
                type: object
                required: [data, pagination]
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      required: [id, entityType, entityId, action, userId, createdAt]
                      properties:
                        id:
                          type: string
                          format: uuid
                        entityType:
                          type: string
                        entityId:
                          type: string
                          format: uuid
                        action:
                          type: string
                        field:
                          type: string
                        oldValue:
                          type: string
                        newValue:
                          type: string
                        amount:
                          type: string
                        description:
                          type: string
                        reason:
                          type: string
                        userId:
                          type: string
                        userRole:
                          type: string
                        ipAddress:
                          type: string
                        correlationId:
                          type: string
                        createdAt:
                          type: string
                          format: date-time
                  pagination:
                    $ref: "#/components/schemas/Pagination"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  /dashboard:
    get:
      operationId: getAPDashboard
      summary: AP dashboard
      description: |
        Aggregated AP dashboard with KPIs, status breakdowns, and action items.
        Designed for daily management review.
      tags: [dashboard]
      security:
        - bearerAuth: []
      responses:
        "200":
          description: Dashboard data
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/APDashboard"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

# ══════════════════════════════════════════════════════════════════
# COMPONENTS
# ══════════════════════════════════════════════════════════════════

components:
  # ── Security ──────────────────────────────────────────────────
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: >
        JWT access token obtained from the auth service.
        Include in `Authorization: Bearer <token>` header.

  # ── Reusable Parameters ───────────────────────────────────────
  parameters:
    PageParam:
      name: page
      in: query
      description: Page number (1-indexed)
      schema:
        type: integer
        minimum: 1
        default: 1
    LimitParam:
      name: limit
      in: query
      description: Items per page
      schema:
        type: integer
        minimum: 1
        maximum: 200
        default: 50
    VendorIdParam:
      name: vendorId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    InvoiceIdParam:
      name: invoiceId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    ExceptionIdParam:
      name: exceptionId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    ApprovalChainIdParam:
      name: approvalChainId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    ProposalIdParam:
      name: proposalId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    BatchIdParam:
      name: batchId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    ReconciliationIdParam:
      name: reconciliationId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    CreditIdParam:
      name: creditId
      in: path
      required: true
      schema:
        type: string
        format: uuid

  # ── Reusable Responses ────────────────────────────────────────
  responses:
    BadRequest:
      description: Validation error or malformed request
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
    Unauthorized:
      description: Missing or invalid bearer token
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
    Forbidden:
      description: Insufficient permissions for this operation
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
    Conflict:
      description: State conflict, duplicate resource, or idempotency key collision
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"

  # ── Schemas ───────────────────────────────────────────────────
  schemas:
    # ── Enums ─────────────────────────────────────────────────

    VendorStatus:
      type: string
      enum:
        - PENDING_REVIEW
        - ACTIVE
        - SUSPENDED
        - DEACTIVATED

    InvoiceStatus:
      type: string
      enum:
        - DRAFT
        - CAPTURED
        - VALIDATING
        - VALIDATED
        - THREE_WAY_MATCHING
        - MATCHED
        - MATCH_FAILED
        - EXCEPTION
        - PENDING_APPROVAL
        - APPROVED
        - REJECTED
        - PARTIALLY_PAID
        - PAID
        - VOIDED

    # ── Core Entities ──────────────────────────────────────────

    Vendor:
      type: object
      required:
        - id
        - companyId
        - vendorCode
        - name
        - legalName
        - status
        - riskLevel
        - category
        - taxId
        - taxCountry
        - currency
        - paymentTerms
        - preferredPaymentMethod
        - creditLimit
        - createdAt
        - updatedAt
      properties:
        id:
          type: string
          format: uuid
        companyId:
          type: string
          format: uuid
        vendorCode:
          type: string
          description: Human-readable code (e.g., VEN-00001)
        name:
          type: string
        legalName:
          type: string
        status:
          $ref: "#/components/schemas/VendorStatus"
        riskLevel:
          type: string
          enum: [LOW, MEDIUM, HIGH, CRITICAL]
        riskScore:
          type: string
          description: Decimal(5,2) — 0.00 to 100.00
        category:
          type: string
          enum: [SUPPLIER, CONTRACTOR, CONSULTANT, SERVICE_PROVIDER, DISTRIBUTOR, MANUFACTURER]
        taxId:
          type: string
        taxCountry:
          type: string
          description: ISO 3166-1 alpha-2
        currency:
          type: string
          description: ISO 4217
        billingAddress:
          type: string
        shippingAddress:
          type: string
        paymentTerms:
          type: string
          enum: [NET15, NET30, NET60, NET90, DUE_ON_RECEIPT]
        preferredPaymentMethod:
          type: string
          enum: [ACH, WIRE, CHECK, EFT, VIRTUAL_CARD]
        creditLimit:
          type: string
          description: Decimal(38,12)
        bankAccountId:
          type: string
          format: uuid
        preferred:
          type: boolean
        preferredRank:
          type: integer
          nullable: true
        isBlocked:
          type: boolean
        blockReason:
          type: string
          nullable: true
        rating:
          type: string
          description: Decimal(3,1) — 0.0 to 5.0
        totalSpend:
          type: string
          description: Decimal(38,12)
        totalOrders:
          type: integer
        avgPaymentDays:
          type: integer
        contactName:
          type: string
        contactEmail:
          type: string
          format: email
        contactPhone:
          type: string
        tags:
          type: array
          items:
            type: string
        onboardingDate:
          type: string
          format: date
        lastOrderDate:
          type: string
          format: date
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        createdBy:
          type: string
        updatedBy:
          type: string

    CreateVendorInput:
      type: object
      required:
        - name
        - legalName
        - taxId
        - taxCountry
        - category
        - paymentTerms
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 255
        legalName:
          type: string
          minLength: 2
          maxLength: 255
        taxId:
          type: string
          minLength: 1
          maxLength: 50
        taxCountry:
          type: string
          pattern: "^[A-Z]{2}$"
        category:
          type: string
          enum: [SUPPLIER, CONTRACTOR, CONSULTANT, SERVICE_PROVIDER, DISTRIBUTOR, MANUFACTURER]
        currency:
          type: string
          default: USD
        paymentTerms:
          type: string
          enum: [NET15, NET30, NET60, NET90, DUE_ON_RECEIPT]
        preferredPaymentMethod:
          type: string
          enum: [ACH, WIRE, CHECK, EFT, VIRTUAL_CARD]
          default: ACH
        creditLimit:
          type: string
          description: Decimal string, ≥ 0
          default: "0"
        billingAddress:
          type: string
        shippingAddress:
          type: string
        contactName:
          type: string
        contactEmail:
          type: string
          format: email
        contactPhone:
          type: string
        tags:
          type: array
          items:
            type: string

    UpdateVendorInput:
      type: object
      description: At least one field must be provided
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 255
        billingAddress:
          type: string
        shippingAddress:
          type: string
        category:
          type: string
          enum: [SUPPLIER, CONTRACTOR, CONSULTANT, SERVICE_PROVIDER, DISTRIBUTOR, MANUFACTURER]
        paymentTerms:
          type: string
          enum: [NET15, NET30, NET60, NET90, DUE_ON_RECEIPT]
        contactName:
          type: string
        contactEmail:
          type: string
          format: email
        contactPhone:
          type: string
        tags:
          type: array
          items:
            type: string
        preferred:
          type: boolean
        preferredRank:
          type: integer
          nullable: true

    Invoice:
      type: object
      required:
        - id
        - companyId
        - vendorId
        - invoiceNumber
        - invoiceDate
        - dueDate
        - status
        - currency
        - subtotal
        - taxAmount
        - totalAmount
        - createdAt
        - updatedAt
      properties:
        id:
          type: string
          format: uuid
        companyId:
          type: string
          format: uuid
        vendorId:
          type: string
          format: uuid
        invoiceNumber:
          type: string
        invoiceDate:
          type: string
          format: date
        dueDate:
          type: string
          format: date
        receivedDate:
          type: string
          format: date
        status:
          $ref: "#/components/schemas/InvoiceStatus"
        previousStatus:
          type: string
          nullable: true
        poReferenceId:
          type: string
          format: uuid
          nullable: true
        grnReferenceId:
          type: string
          format: uuid
          nullable: true
        currency:
          type: string
        exchangeRate:
          type: string
          description: Decimal(20,8)
        baseCurrency:
          type: string
        subtotal:
          type: string
          description: Decimal(38,12)
        taxAmount:
          type: string
          description: Decimal(38,12)
        discountAmount:
          type: string
          description: Decimal(38,12)
        shippingAmount:
          type: string
          description: Decimal(38,12)
        totalAmount:
          type: string
          description: Decimal(38,12) — primary financial field
        totalWithTax:
          type: string
          description: Decimal(38,12)
        amountPaid:
          type: string
          description: Decimal(38,12)
        balanceDue:
          type: string
          description: Decimal(38,12)
        creditApplied:
          type: string
          description: Decimal(38,12)
        netBalance:
          type: string
          description: Decimal(38,12) — net payable
        paymentTerms:
          type: string
        paymentMethod:
          type: string
          nullable: true
          enum: [ACH, WIRE, CHECK, EFT, VIRTUAL_CARD]
        glAccountId:
          type: string
          nullable: true
        costCenterId:
          type: string
          nullable: true
        departmentId:
          type: string
          nullable: true
        description:
          type: string
          nullable: true
        vendorMemo:
          type: string
          nullable: true
        internalMemo:
          type: string
          nullable: true
        matchResult:
          type: string
          nullable: true
          enum: [MATCHED, VARIANCE, NO_PO, PARTIAL_MATCH]
        varianceAmount:
          type: string
          description: Decimal(38,12)
        isDuplicateSuspicion:
          type: boolean
        approvalRequired:
          type: boolean
        approvedAt:
          type: string
          format: date-time
          nullable: true
        approvedBy:
          type: string
          nullable: true
        rejectedAt:
          type: string
          format: date-time
          nullable: true
        rejectedBy:
          type: string
          nullable: true
        rejectionReason:
          type: string
          nullable: true
        paymentBatchId:
          type: string
          format: uuid
          nullable: true
        paymentDate:
          type: string
          format: date
          nullable: true
        paymentReference:
          type: string
          nullable: true
        source:
          type: string
          enum: [EMAIL, SCAN, EDI, PORTAL, MANUAL, API]
        lineItems:
          type: array
          items:
            $ref: "#/components/schemas/LineItem"
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        createdBy:
          type: string
        updatedBy:
          type: string

    LineItem:
      type: object
      required:
        - id
        - lineNumber
        - description
        - quantity
        - unitPrice
        - lineTotal
      properties:
        id:
          type: string
          format: uuid
        lineNumber:
          type: integer
          minimum: 1
        description:
          type: string
        quantity:
          type: string
          description: Decimal(20,4)
        unitOfMeasure:
          type: string
        unitPrice:
          type: string
          description: Decimal(38,12)
        lineTotal:
          type: string
          description: Decimal(38,12) — derived
        discountPercent:
          type: string
          description: Decimal(5,2)
        discountAmount:
          type: string
          description: Decimal(38,12)
        netLineTotal:
          type: string
          description: Decimal(38,12) — derived
        taxRate:
          type: string
          description: Decimal(5,4) — 0.0000 to 1.0000
        taxAmount:
          type: string
          description: Decimal(38,12) — derived
        taxType:
          type: string
          nullable: true
          enum: [VAT, GST, SALES_TAX, WITHHOLDING, EXEMPT]
        glAccountId:
          type: string
          nullable: true
        costCenterId:
          type: string
          nullable: true
        matchStatus:
          type: string
          nullable: true
          enum: [MATCHED, VARIANCE, UNMATCHED]
        matchVariance:
          type: string
          description: Decimal(38,12)

    CreateInvoiceInput:
      type: object
      required:
        - vendorId
        - invoiceNumber
        - invoiceDate
        - lineItems
      properties:
        vendorId:
          type: string
          format: uuid
        invoiceNumber:
          type: string
          minLength: 1
          maxLength: 100
        invoiceDate:
          type: string
          format: date
        poReferenceId:
          type: string
          format: uuid
        currency:
          type: string
          default: USD
        taxAmount:
          type: string
          description: Decimal string
          default: "0"
        discountAmount:
          type: string
          description: Decimal string
          default: "0"
        shippingAmount:
          type: string
          description: Decimal string
          default: "0"
        glAccountId:
          type: string
          format: uuid
        costCenterId:
          type: string
          format: uuid
        description:
          type: string
        vendorMemo:
          type: string
        internalMemo:
          type: string
        lineItems:
          type: array
          minItems: 1
          items:
            type: object
            required: [lineNumber, description, quantity, unitPrice]
            properties:
              lineNumber:
                type: integer
                minimum: 1
              description:
                type: string
              quantity:
                type: string
                description: Decimal(20,4), > 0
              unitOfMeasure:
                type: string
              unitPrice:
                type: string
                description: Decimal(38,12), ≥ 0
              discountPercent:
                type: string
              taxRate:
                type: string
              taxType:
                type: string
                enum: [VAT, GST, SALES_TAX, WITHHOLDING, EXEMPT]
              glAccountId:
                type: string
              costCenterId:
                type: string

    UpdateInvoiceInput:
      type: object
      description: Mutable fields depend on current invoice status
      properties:
        invoiceDate:
          type: string
          format: date
        dueDate:
          type: string
          format: date
        description:
          type: string
        vendorMemo:
          type: string
        internalMemo:
          type: string
        glAccountId:
          type: string
        costCenterId:
          type: string
        paymentTerms:
          type: string
        lineItems:
          type: array
          items:
            type: object
            required: [lineNumber, description, quantity, unitPrice]
            properties:
              lineNumber:
                type: integer
              description:
                type: string
              quantity:
                type: string
              unitOfMeasure:
                type: string
              unitPrice:
                type: string
              discountPercent:
                type: string
              taxRate:
                type: string
              glAccountId:
                type: string

    Exception:
      type: object
      required:
        - id
        - companyId
        - vendorInvoiceId
        - exceptionType
        - severity
        - description
        - status
        - createdAt
        - updatedAt
      properties:
        id:
          type: string
          format: uuid
        companyId:
          type: string
          format: uuid
        vendorInvoiceId:
          type: string
          format: uuid
        exceptionType:
          type: string
          enum:
            - PRICE_VARIANCE
            - QTY_VARIANCE
            - NO_PO
            - DUPLICATE
            - MISSING_GRN
            - GL_CODING_REQUIRED
            - APPROVAL_REQUIRED
            - TAX_MISMATCH
            - CREDIT_NOTE_REQUIRED
        severity:
          type: string
          enum: [LOW, MEDIUM, HIGH, CRITICAL]
        description:
          type: string
        varianceAmount:
          type: string
          description: Decimal(38,12) — financial impact
        relatedEntityId:
          type: string
          nullable: true
        status:
          type: string
          enum: [OPEN, IN_REVIEW, RESOLVED, WAIVED, ESCALATED]
        assignedTo:
          type: string
          nullable: true
        resolution:
          type: string
          nullable: true
        resolvedAt:
          type: string
          format: date-time
          nullable: true
        resolvedBy:
          type: string
          nullable: true
        escalatedTo:
          type: string
          nullable: true
        escalatedAt:
          type: string
          format: date-time
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        createdBy:
          type: string
        updatedBy:
          type: string

    ApprovalChain:
      type: object
      required:
        - id
        - companyId
        - vendorInvoiceId
        - levels
        - status
        - createdAt
        - updatedAt
      properties:
        id:
          type: string
          format: uuid
        companyId:
          type: string
          format: uuid
        vendorInvoiceId:
          type: string
          format: uuid
        currentLevel:
          type: integer
          description: Current approval level (1-indexed)
        status:
          type: string
          enum: [PENDING, APPROVED, REJECTED, DELEGATED, ESCALATED]
        levels:
          type: array
          items:
            type: object
            required:
              - id
              - approvalLevel
              - approvalLevelName
              - requiredRole
              - status
            properties:
              id:
                type: string
                format: uuid
              approvalLevel:
                type: integer
              approvalLevelName:
                type: string
              requiredRole:
                type: string
              requiredThreshold:
                type: string
                description: Decimal(38,12)
              status:
                type: string
                enum: [PENDING, APPROVED, REJECTED, DELEGATED, SKIPPED]
              decision:
                type: string
                nullable: true
                enum: [APPROVE, REJECT, REQUEST_INFO, DELEGATE]
              decisionAt:
                type: string
                format: date-time
                nullable: true
              decisionBy:
                type: string
                nullable: true
              decisionComment:
                type: string
                nullable: true
              delegatedTo:
                type: string
                nullable: true
              delegatedAt:
                type: string
                format: date-time
                nullable: true
              escalationReason:
                type: string
                nullable: true
              timeLimit:
                type: string
                format: date-time
                nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        createdBy:
          type: string
        updatedBy:
          type: string

    PaymentProposal:
      type: object
      required:
        - id
        - companyId
        - proposalNumber
        - status
        - proposalDate
        - paymentDate
        - currency
        - totalAmount
        - paymentMethod
        - createdAt
        - updatedAt
      properties:
        id:
          type: string
          format: uuid
        companyId:
          type: string
          format: uuid
        proposalNumber:
          type: string
        status:
          type: string
          enum: [DRAFT, SUBMITTED, REVIEWED, APPROVED, REJECTED, EXECUTED, CANCELLED]
        proposalDate:
          type: string
          format: date
        paymentDate:
          type: string
          format: date
        currency:
          type: string
        totalAmount:
          type: string
          description: Decimal(38,12) — sum of all items
        totalInvoices:
          type: integer
        totalVendors:
          type: integer
        paymentMethod:
          type: string
          enum: [ACH, WIRE, CHECK, EFT, VIRTUAL_CARD]
        prioritizeDiscounts:
          type: boolean
        includePartialPayments:
          type: boolean
        submittedBy:
          type: string
          nullable: true
        submittedAt:
          type: string
          format: date-time
          nullable: true
        reviewedBy:
          type: string
          nullable: true
        reviewedAt:
          type: string
          format: date-time
          nullable: true
        approvedBy:
          type: string
          nullable: true
        approvedAt:
          type: string
          format: date-time
          nullable: true
        rejectedBy:
          type: string
          nullable: true
        rejectionReason:
          type: string
          nullable: true
        paymentBatchId:
          type: string
          format: uuid
          nullable: true
        items:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
                format: uuid
              vendorInvoiceId:
                type: string
                format: uuid
              vendorId:
                type: string
                format: uuid
              amount:
                type: string
                description: Decimal(38,12)
              discountTaken:
                type: string
              creditApplied:
                type: string
              netPayment:
                type: string
                description: Decimal(38,12) — derived
              paymentPriority:
                type: integer
              selectedBy:
                type: string
                enum: [AUTO, MANUAL, DISCOUNT_OPTIMIZED]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        createdBy:
          type: string
        updatedBy:
          type: string

    PaymentBatch:
      type: object
      required:
        - id
        - companyId
        - batchNumber
        - status
        - paymentMethod
        - bankAccountId
        - totalAmount
        - createdAt
        - updatedAt
      properties:
        id:
          type: string
          format: uuid
        companyId:
          type: string
          format: uuid
        batchNumber:
          type: string
        paymentProposalId:
          type: string
          format: uuid
        status:
          type: string
          enum: [PENDING, GENERATING, READY, SUBMITTED, COMPLETED, FAILED, CANCELLED]
        paymentMethod:
          type: string
          enum: [ACH, WIRE, CHECK, EFT, VIRTUAL_CARD]
        bankAccountId:
          type: string
        totalPayments:
          type: integer
        totalAmount:
          type: string
          description: Decimal(38,12) — sum of all payments
        totalFees:
          type: string
          description: Decimal(38,12)
        netDisbursement:
          type: string
          description: Decimal(38,12) — totalAmount + totalFees
        fileUrl:
          type: string
          nullable: true
        fileName:
          type: string
          nullable: true
        submittedAt:
          type: string
          format: date-time
          nullable: true
        completedAt:
          type: string
          format: date-time
          nullable: true
        confirmedBy:
          type: string
          nullable: true
        payments:
          type: array
          items:
            $ref: "#/components/schemas/Payment"
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        createdBy:
          type: string
        updatedBy:
          type: string

    Payment:
      type: object
      required:
        - id
        - companyId
        - paymentNumber
        - vendorInvoiceId
        - vendorId
        - paymentDate
        - amount
        - currency
        - paymentMethod
        - status
        - createdAt
      properties:
        id:
          type: string
          format: uuid
        companyId:
          type: string
          format: uuid
        paymentNumber:
          type: string
        paymentBatchId:
          type: string
          format: uuid
        vendorInvoiceId:
          type: string
          format: uuid
        vendorId:
          type: string
          format: uuid
        paymentDate:
          type: string
          format: date
        amount:
          type: string
          description: Decimal(38,12) — gross payment
        discountTaken:
          type: string
          description: Decimal(38,12)
        creditApplied:
          type: string
          description: Decimal(38,12)
        netPayment:
          type: string
          description: Decimal(38,12) — derived
        currency:
          type: string
        exchangeRate:
          type: string
          description: Decimal(20,8)
        baseCurrencyAmount:
          type: string
          description: Decimal(38,12) — derived
        paymentMethod:
          type: string
          enum: [ACH, WIRE, CHECK, EFT, VIRTUAL_CARD]
        bankAccountId:
          type: string
        transactionReference:
          type: string
          nullable: true
        checkNumber:
          type: string
          nullable: true
        status:
          type: string
          enum: [PROCESSED, CLEARED, VOIDED, FAILED, REVERSED]
        glPosted:
          type: boolean
        glPostedAt:
          type: string
          format: date-time
          nullable: true
        voidedAt:
          type: string
          format: date-time
          nullable: true
        voidedBy:
          type: string
          nullable: true
        voidReason:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        createdBy:
          type: string
        updatedBy:
          type: string

    Reconciliation:
      type: object
      required:
        - id
        - companyId
        - vendorId
        - reconciliationDate
        - status
        - createdAt
        - updatedAt
      properties:
        id:
          type: string
          format: uuid
        companyId:
          type: string
          format: uuid
        vendorStatementId:
          type: string
          format: uuid
        vendorId:
          type: string
          format: uuid
        reconciliationDate:
          type: string
          format: date
        apBalance:
          type: string
          description: Decimal(38,12) — AP book balance
        vendorBalance:
          type: string
          description: Decimal(38,12) — vendor stated balance
        balanceVariance:
          type: string
          description: Decimal(38,12) — derived
        totalLines:
          type: integer
        matchedLines:
          type: integer
        unmatchedLines:
          type: integer
        matchRate:
          type: string
          description: Decimal(5,2) — 0.00 to 100.00
        status:
          type: string
          enum: [IN_PROGRESS, COMPLETED, EXCEPTION, ADJUSTED]
        adjustmentAmount:
          type: string
          description: Decimal(38,12)
        adjustmentReason:
          type: string
          nullable: true
        adjustedBy:
          type: string
          nullable: true
        resolvedBy:
          type: string
          nullable: true
        resolvedAt:
          type: string
          format: date-time
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        createdBy:
          type: string
        updatedBy:
          type: string

    CreditNote:
      type: object
      required:
        - id
        - companyId
        - vendorId
        - creditNumber
        - creditDate
        - creditAmount
        - currency
        - status
        - createdAt
        - updatedAt
      properties:
        id:
          type: string
          format: uuid
        companyId:
          type: string
          format: uuid
        vendorId:
          type: string
          format: uuid
        creditNumber:
          type: string
        creditDate:
          type: string
          format: date
        creditAmount:
          type: string
          description: Decimal(38,12) — total credit value
        appliedAmount:
          type: string
          description: Decimal(38,12)
        remainingAmount:
          type: string
          description: Decimal(38,12) — derived
        currency:
          type: string
        status:
          type: string
          enum: [ISSUED, PARTIALLY_APPLIED, FULLY_APPLIED, EXPIRED, VOIDED]
        appliedToInvoiceId:
          type: string
          format: uuid
          nullable: true
        expiryDate:
          type: string
          format: date
          nullable: true
        reason:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        createdBy:
          type: string
        updatedBy:
          type: string

    APDashboard:
      type: object
      required:
        - totalOutstanding
        - invoiceCounts
        - aging
        - pendingApprovals
        - recentActivity
      properties:
        totalOutstanding:
          type: string
          description: Total AP balance (Decimal string)
        totalOutstandingChange:
          type: string
          description: Change from prior period (Decimal string)
        invoiceCounts:
          type: object
          properties:
            draft:
              type: integer
            pendingApproval:
              type: integer
            approved:
              type: integer
            scheduledForPayment:
              type: integer
            paid:
              type: integer
            exceptions:
              type: integer
            total:
              type: integer
        aging:
          type: object
          properties:
            current:
              type: string
            days1to30:
              type: string
            days31to60:
              type: string
            days61to90:
              type: string
            over90:
              type: string
        pendingApprovals:
          type: object
          properties:
            count:
              type: integer
            totalAmount:
              type: string
            oldestDays:
              type: integer
            byLevel:
              type: array
              items:
                type: object
                properties:
                  level:
                    type: integer
                  levelName:
                    type: string
                  count:
                    type: integer
                  totalAmount:
                    type: string
        topExceptions:
          type: array
          items:
            type: object
            properties:
              exceptionId:
                type: string
                format: uuid
              invoiceNumber:
                type: string
              vendorName:
                type: string
              exceptionType:
                type: string
              severity:
                type: string
              varianceAmount:
                type: string
              ageDays:
                type: integer
        upcomingPayments:
          type: object
          properties:
            thisWeek:
              type: string
            thisMonth:
              type: string
            nextMonth:
              type: string
        recentActivity:
          type: array
          description: Last 10 AP events
          items:
            type: object
            properties:
              action:
                type: string
              entityType:
                type: string
              entityId:
                type: string
                format: uuid
              description:
                type: string
              userId:
                type: string
              timestamp:
                type: string
                format: date-time
        kpis:
          type: object
          properties:
            daysPayableOutstanding:
              type: number
              format: float
            averageCycleTime:
              type: number
              format: float
              description: Average days from capture to payment
            matchRate:
              type: number
              format: float
              description: % first-time match rate
            exceptionRate:
              type: number
              format: float
            autoApproveRate:
              type: number
              format: float

    # ── Infrastructure ─────────────────────────────────────────

    Pagination:
      type: object
      required:
        - page
        - limit
        - totalItems
        - totalPages
      properties:
        page:
          type: integer
          description: Current page number (1-indexed)
        limit:
          type: integer
          description: Items per page
        totalItems:
          type: integer
          description: Total items matching the query
        totalPages:
          type: integer
          description: Total number of pages

    Error:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          required:
            - code
            - message
            - category
          properties:
            code:
              type: string
              description: Machine-readable error code (e.g., VENDOR_NOT_FOUND, DUPLICATE_INVOICE)
            message:
              type: string
              description: Technical error description
            category:
              type: string
              enum:
                - VALIDATION
                - AUTHENTICATION
                - AUTHORIZATION
                - NOT_FOUND
                - CONFLICT
                - STATE_MACHINE
                - BUSINESS_RULE
                - INFRASTRUCTURE
              description: Error category for programmatic handling
            correlationId:
              type: string
              description: Request correlation ID for support tickets
            recoverability:
              type: string
              enum: [RETRYABLE, USER_ACTION, PERMANENT, UNKNOWN]
              description: Whether the client can retry, must change input, or should escalate
            userMessage:
              type: string
              description: Human-readable message suitable for end-user display
            field:
              type: string
              description: Specific field that caused the error (for VALIDATION category)
            details:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                  rule:
                    type: string
                  message:
                    type: string
```
