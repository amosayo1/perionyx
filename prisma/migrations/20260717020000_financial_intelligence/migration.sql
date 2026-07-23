CREATE TABLE IF NOT EXISTS "financial_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "score_type" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "previous_score" DECIMAL(5,2),
    "change" DECIMAL(5,2),
    "change_percent" DECIMAL(5,2),
    "severity" TEXT NOT NULL DEFAULT 'normal',
    "summary" TEXT,
    "components" JSONB,
    "evidence" JSONB,
    "metadata" JSONB,
    "calculated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_financial_scores_lookup ON "financial_scores"("company_id", "score_type", "calculated_at");

CREATE TABLE IF NOT EXISTS "kpi_values" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "kpi_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "current_value" DECIMAL(20,4) NOT NULL,
    "previous_value" DECIMAL(20,4),
    "target_value" DECIMAL(20,4),
    "threshold_low" DECIMAL(20,4),
    "threshold_high" DECIMAL(20,4),
    "unit" TEXT,
    "trend" TEXT,
    "variance" DECIMAL(20,4),
    "variance_pct" DECIMAL(10,4),
    "status" TEXT NOT NULL DEFAULT 'neutral',
    "metadata" JSONB,
    "recorded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kpi_values_lookup ON "kpi_values"("company_id", "kpi_key", "recorded_at");
CREATE INDEX IF NOT EXISTS idx_kpi_values_category ON "kpi_values"("company_id", "category", "status");

CREATE TABLE IF NOT EXISTS "intelligence_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reason" TEXT NOT NULL,
    "evidence" JSONB,
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "affected_modules" JSONB,
    "expected_impact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source_score_type" TEXT,
    "action_url" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "resolved_at" TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON "intelligence_recommendations"("company_id", "category", "status");
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON "intelligence_recommendations"("company_id", "priority", "status");

CREATE TABLE IF NOT EXISTS "intelligence_trends" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "trend_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data_points" JSONB NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'flat',
    "change_percent" DECIMAL(10,4),
    "forecast" JSONB,
    "calculated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("company_id", "trend_key", "period")
);
CREATE INDEX IF NOT EXISTS idx_intelligence_trends_period ON "intelligence_trends"("company_id", "period");

CREATE TABLE IF NOT EXISTS "insight_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "event_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "impact" TEXT,
    "evidence" JSONB,
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_insight_events_date ON "insight_events"("company_id", "created_at");
CREATE INDEX IF NOT EXISTS idx_insight_events_type ON "insight_events"("company_id", "event_type", "severity");

CREATE TABLE IF NOT EXISTS "health_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "alert_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'warning',
    "score_type" TEXT,
    "threshold" DECIMAL(10,4),
    "current_value" DECIMAL(10,4),
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_health_alerts_type ON "health_alerts"("company_id", "alert_type", "is_resolved");
CREATE INDEX IF NOT EXISTS idx_health_alerts_severity ON "health_alerts"("company_id", "severity", "created_at");

CREATE TABLE IF NOT EXISTS "executive_scorecards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "role" TEXT NOT NULL,
    "period_start" TIMESTAMP WITH TIME ZONE NOT NULL,
    "period_end" TIMESTAMP WITH TIME ZONE NOT NULL,
    "scores" JSONB,
    "kpis" JSONB,
    "recommendations" JSONB,
    "summary" TEXT,
    "generated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scorecards_role ON "executive_scorecards"("company_id", "role", "period_start", "period_end");

CREATE TABLE IF NOT EXISTS "explain_sources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "source_label" TEXT,
    "source_url" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_explain_target ON "explain_sources"("company_id", "target_type", "target_id");
CREATE INDEX IF NOT EXISTS idx_explain_source ON "explain_sources"("company_id", "source_type", "source_id");
