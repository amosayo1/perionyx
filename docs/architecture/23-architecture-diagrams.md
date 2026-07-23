---
title: Architecture Diagrams
version: 1.0.0
last_updated: 2026-07-16
status: published
audience: Engineering, Architecture Review
---

# Architecture Diagrams

## 1. Overall Platform Architecture

Seven-layer architecture with all 56 business modules grouped by domain.

```mermaid
graph TB
    subgraph "Edge Layer"
        Proxy["Proxy (src/proxy.ts)<br/>Rate Limiting, Auth, CSRF, Locale"]
    end

    subgraph "Application Layer"
        RSC["React Server Components"]
        CC["Client Components"]
        Pages["96+ Pages, 272+ API Routes"]
    end

    subgraph "Business Modules (56)"
        Treasury["Treasury<br/>Cash, FX, Forecast, Risk"]
        Ledger["Ledger<br/>Double-Entry, Journals"]
        Reporting["Reporting<br/>Statements, Exports"]
        Risk["Risk<br/>Scoring, Limits, Alerts"]
        Workflow["Workflow<br/>Orchestration, Automation"]
        Intel["Intelligence<br/>6 Engines, KPI, Scorecards"]
        Integrations["Integrations<br/>Connectors, Plaid, Webhooks"]
        Notifications["Notifications<br/>Email, Slack, In-App"]
        IAM["Identity & IAM<br/>RBAC, ABAC, SSO, Audit"]
        Platform["Platform<br/>Enterprise Experience"]
    end

    subgraph "Infrastructure Layer"
        Cache["CacheManager<br/>LRU + Redis"]
        Queue["QueueManager<br/>PgBoss (8 queues)"]
        Locks["LockManager<br/>Memory + Redis"]
        Metrics["Metrics + Tracing<br/>Prometheus + OpenTelemetry"]
        Health["Health<br/>Health/Readiness/Liveness"]
        Recovery["Recovery<br/>Backup, Restore, Snapshot"]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL<br/>100+ Models)]
        Redis[(Redis<br/>Cache + Locks)]
    end

    User -->|HTTPS| Proxy
    Proxy -->|Request| RSC
    Proxy -->|Request| CC
    RSC -->|Data| Pages
    CC -->|Data| Pages
    
    Pages -->|Queries| Treasury
    Pages -->|Queries| Ledger
    Pages -->|Queries| Reporting
    Pages -->|Queries| Risk
    Pages -->|Queries| Workflow
    Pages -->|Queries| Intel
    Pages -->|Queries| Integrations
    Pages -->|Queries| Notifications
    Pages -->|Queries| IAM

    Treasury -->|Models| DB
    Ledger -->|Models| DB
    Reporting -->|Models| DB
    Risk -->|Models| DB
    Workflow -->|Models| DB
    Intel -->|Models| DB
    Integrations -->|Models| DB
    IAM -->|Models| DB

    Treasury -->|Cache| Cache
    Ledger -->|Cache| Cache
    Reporting -->|Cache| Cache
    Risk -->|Cache| Cache
    
    Workflow -->|Jobs| Queue
    Notifications -->|Jobs| Queue
    Integrations -->|Jobs| Queue

    Cache --> Redis
    Locks --> Redis
    Locks --> Cache
```

## 2. Financial Transaction Flow

The complete lifecycle of a journal entry from creation to reporting.

```mermaid
graph LR
    subgraph "Entry"
        JE[Journal Entry<br/>Created by User]
        Val[Validation<br/>Debits = Credits]
    end
    subgraph "Approval"
        AM[Approval Matrix<br/>Route to Approver]
        AP[Approval<br/>Approve / Reject]
        Rej[Rejected<br/>Return to Creator]
    end
    subgraph "Posting"
        Post[Post to Ledger<br/>Immutable Append]
        LedgerDB[(Ledger<br/>Double-Entry)]
    end
    subgraph "Reconciliation"
        Rec[Reconcile<br/>Match External]
        Except[Exception<br/>Flag for Review]
    end
    subgraph "Reporting"
        FS[Financial Statements<br/>Balance Sheet, P&L]
        Rep[Custom Reports<br/>Export CSV/XLS]
    end

    JE --> Val
    Val -->|Valid| AM
    Val -->|Invalid| JE
    AM --> AP
    AP -->|Approve| Post
    AP -->|Reject| Rej
    Rej --> JE
    Post --> LedgerDB
    LedgerDB --> Rec
    Rec -->|Matched| FS
    Rec -->|Unmatched| Except
    Except --> Rec
    LedgerDB --> Rep
    LedgerDB --> FS
```

## 3. Integration Data Flow

How connectors bring external data into the platform.

```mermaid
graph TD
    subgraph "External Systems"
        Bank["Banking API<br/>Plaid, ACH"]
        ERP["ERP Systems<br/>SAP, Oracle"]
        CSV["File Upload<br/>CSV, XLS"]
    end

    subgraph "Connector Layer"
        CF[Connector Framework]
        Val[Validation<br/>Schema Check]
        CDM[Canonical Data Model<br/>Normalized Format]
    end

    subgraph "Platform"
        Sync[Sync Engine<br/>Delta + Full Sync]
        Health[Health Check<br/>Connection Monitoring]
        Ledger[Ledger Module]
        Treasury[Treasury Module]
    end

    subgraph "Storage"
        DB[(PostgreSQL)]
        Queue[Queue<br/>PgBoss]
    end

    Bank -->|Webhook / Poll| CF
    ERP -->|REST API| CF
    CSV -->|Upload| CF
    
    CF --> Val
    Val -->|Valid| CDM
    Val -->|Invalid| Error[Error Log]
    
    CDM --> Sync
    Sync -->|Batch| Queue
    
    Queue --> Treasury
    Queue --> Ledger
    
    Treasury --> DB
    Ledger --> DB
    
    CF --> Health
    Health -->|Status| Treasury
```

## 4. Workflow Engine Architecture

How the workflow engine processes events through steps.

```mermaid
graph TD
    subgraph "Triggers"
        Event["Event Trigger<br/>Transaction Created"]
        Cron["Cron Trigger<br/>Schedule"]
        Manual["Manual Trigger<br/>User Action"]
    end

    subgraph "Workflow Engine"
        WE[Workflow Engine<br/>Singleton]
        Disp[Step Dispatcher<br/>Route to Executor]
    end

    subgraph "Step Executors"
        Cond[Condition Evaluator<br/>Branching Logic]
        Approve[Approval Step<br/>Matrix Match]
        Action[Action Step<br/>Module Call]
        Delay[Delay Step<br/>Wait + Resume]
        Notif[Notification Step<br/>Send Alert]
    end

    subgraph "Modules"
        L[Ledger Module]
        T[Treasury Module]
        N[Notifications]
        I[Integrations]
    end

    subgraph "Storage"
        RunDB[(Workflow Runs<br/>Prisma)]
        Logs[(Audit Logs)]
    end

    Event --> WE
    Cron --> WE
    Manual --> WE

    WE -->|Instantiate| RunDB
    WE -->|Dispatch| Disp

    Disp --> Cond
    Disp --> Approve
    Disp --> Action
    Disp --> Delay
    Disp --> Notif

    Cond -->|Evaluate| Disp
    Approve -->|Execute| L
    Action -->|Execute| T
    Action -->|Execute| I
    Notif -->|Execute| N
    
    Cond --> Logs
    Approve --> Logs
    Action --> Logs
    Notif --> Logs
```

## 5. Reporting Data Flow

How data flows from sources to formatted reports.

```mermaid
graph LR
    subgraph "Data Sources"
        Ledger[(Ledger)]
        Treasury[(Treasury)]
        Risk[(Risk)]
        Intel[(Intelligence)]
    end

    subgraph "Report Engine"
        Query[Query Builder<br/>Multi-Source]
        Calc[Calculations<br/>Aggregations]
        Template[Template Engine<br/>Format Selection]
    end

    subgraph "Formats"
        PDF[PDF<br/>Render]
        CSV[CSV<br/>Stream]
        XLS[XLS<br/>Stream]
        Screen[Screen<br/>On-Screen Preview]
    end

    subgraph "Export"
        DL[Download]
        Email[Email Delivery]
        API[API Response]
    end

    Ledger --> Query
    Treasury --> Query
    Risk --> Query
    Intel --> Query

    Query -->|Raw Data| Calc
    Calc -->|Metrics| Template

    Template -->|Config| PDF
    Template -->|Config| CSV
    Template -->|Config| XLS
    Template -->|Config| Screen

    PDF --> DL
    CSV --> DL
    XLS --> DL
    CSV --> Email
    XLS --> Email
    PDF --> API
    Screen --> API
```

## 6. Intelligence Platform Architecture

How the 6 deterministic engines produce scores and recommendations.

```mermaid
graph TD
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Cache[(Redis Cache)]
    end

    subgraph "Intelligence Engines (6)"
        AD[Anomaly Detection<br/>Transaction Patterns]
        CF[Cash Forecasting<br/>Historical + Seasonality]
        RE[Recommendation Engine<br/>Rule-Based]
        TA[Trend Analysis<br/>Metric Snapshots]
        CC[Compliance Checks<br/>Policy + Rules]
        NE[NLP Commentary<br/>Template-Based]
    end

    subgraph "Scoring & KPIs"
        KPI[KPI Framework<br/>Business Metrics]
        SC[Scorecard Service<br/>Composite Scores]
    end

    subgraph "Output"
        Recs[Recommendations<br/>Actionable Items]
        Brief[Executive Briefing<br/>Structured Summary]
        Alert[Risk Alerts<br/>Threshold Violations]
        Report[Analytics Reports<br/>Trend Visualizations]
    end

    DB --> AD
    DB --> CF
    DB --> RE
    DB --> TA
    DB --> CC
    DB --> NE

    Cache --> AD
    Cache --> CF

    AD --> KPI
    CF --> KPI
    RE --> KPI
    TA --> KPI
    CC --> KPI

    KPI --> SC
    SC --> Recs
    SC --> Brief
    SC --> Alert
    SC --> Report
    
    AD --> Alert
    CC --> Alert
    RE --> Recs
    TA --> Report
    NE --> Brief
```

## 7. AI Decision Flow

The interaction between deterministic systems, AI, and human decision-makers.

```mermaid
graph TD
    subgraph "Deterministic Systems"
        DB[(PostgreSQL<br/>System of Record)]
        Engine[Intelligence Engines<br/>Deterministic Scores]
        Ledger[Double-Entry Ledger<br/>Immutable Records]
    end

    subgraph "AI Layer"
        Context[Context Builder<br/>19 Parallel Queries]
        Explain[Explain Engine<br/>Template Commentary]
        Recommend[Recommendation Engine<br/>Rule-Based Suggestions]
        Investigation[Transaction Investigation<br/>Timeline Tracing]
    end

    subgraph "Human Review"
        Dashboard["Dashboard Review<br/>CFO / Treasurer"]
        Approve{"Approve?<br/>Human Decision"}
        Investigate{"Investigate?<br/> / Auditor"}
    end

    subgraph "Action"
        Execute[Execute Action<br/>Journal Entry / Approval]
        Escalate[Escalate<br/>Senior Approver]
        Reject[Reject<br/>Return with Reason]
    end

    DB -->|Real-Time Data| Context
    Engine -->|Scores| Context
    Ledger -->|History| Context

    Context -->|Structured Context| Explain
    Context -->|Structured Context| Recommend
    Context -->|Traces| Investigation

    Explain -->|Insights| Dashboard
    Recommend -->|Actions| Dashboard
    Investigation -->|Timeline| Investigate

    Dashboard -->|Review| Approve
    Dashboard -->|Dismiss| Reject
    Investigate -->|Confirm| Approve
    Investigate -->|Flag| Escalate

    Approve -->|Yes| Execute
    Approve -->|No| Reject
    Approve -->|Unsure| Escalate

    Execute --> Ledger
    Execute --> DB
    Escalate --> Dashboard
```

## 8. Deployment Architecture

Full infrastructure topology from user to database.

```mermaid
graph TD
    subgraph "User"
        Browser[Browser]
        Mobile[Mobile App]
    end

    subgraph "CDN"
        CDN["CDN Edge<br/>Cache-Control + SWR"]
    end

    subgraph "Kubernetes"
        subgraph "Ingress"
            LB[Load Balancer]
            Ingress[Ingress<br/>TLS Termination]
        end

        subgraph "App Pods"
            Proxy["Edge Proxy<br/>(src/proxy.ts)"]
            App[Next.js App<br/>Server Components]
            API[API Routes<br/>272+ Endpoints]
        end

        subgraph "Workers"
            Queue[Queue Workers<br/>PgBoss]
            Sync[Sync Workers<br/>Connector Jobs]
        end

        subgraph "Monitoring"
            MetricsPod[Prometheus<br/>Metrics Export]
            HealthPod[Health<br/>/health /readiness /liveness]
        end
    end

    subgraph "Data Services"
        Redis[(Redis<br/>Cache + Locks)]
        DB[(PostgreSQL<br/>Primary)]
        Replica[(PostgreSQL<br/>Read Replica<br/>Future)]
    end

    subgraph "CI/CD"
        GH[GitHub Actions]
        DockerReg[Docker Registry]
    end

    Browser --> CDN
    Mobile --> CDN
    CDN --> LB
    
    LB --> Ingress
    Ingress --> Proxy
    Proxy --> App
    Proxy --> API
    
    App -->|Cache| Redis
    App -->|Read/Write| DB
    API -->|Cache| Redis
    API -->|Read/Write| DB
    
    Queue --> Redis
    Queue -->|Async Jobs| DB
    Sync -->|Connector Data| DB
    
    App -->|Metrics| MetricsPod
    API -->|Metrics| MetricsPod
    Queue -->|Metrics| MetricsPod
    MetricsPod -->|Scrape| Prometheus[Prometheus Server]
    
    HealthPod -->|Checks| Redis
    HealthPod -->|Checks| DB
    HealthPod -->|Checks| App
    
    GH -->|Build + Push| DockerReg
    GH -->|Deploy| K8s[Kubernetes API]
    K8s -->|Rolling Update| LB
```
