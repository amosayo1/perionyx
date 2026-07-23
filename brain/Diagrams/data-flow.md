```mermaid
sequenceDiagram
    participant User
    participant Proxy
    participant API
    participant Service
    participant Prisma
    participant DB

    User->>Proxy: HTTP Request
    Proxy->>Proxy: Rate Limit Check
    Proxy->>Proxy: CSRF Validation
    Proxy->>Proxy: Auth Token Extraction
    Proxy->>API: Forward Request
    API->>Service: Business Logic
    Service->>Prisma: Database Query
    Prisma->>DB: SQL Query
    DB-->>Prisma: Result
    Prisma-->>Service: Domain Object
    Service-->>API: Response
    API-->>Proxy: HTTP Response
    Proxy-->>User: Response
```
