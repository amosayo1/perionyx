CREATE TABLE IF NOT EXISTS "workspaces" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("company_id", "slug")
);
CREATE INDEX IF NOT EXISTS idx_workspaces_company_active ON "workspaces"("company_id", "is_active");

CREATE TABLE IF NOT EXISTS "role_dashboards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "role" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("company_id", "role")
);

CREATE TABLE IF NOT EXISTS "morning_briefings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "title" TEXT,
    "summary" TEXT,
    "highlights" JSONB,
    "kpis" JSONB,
    "pending_approvals" INTEGER NOT NULL DEFAULT 0,
    "pending_approval_amount" DECIMAL(20,4),
    "cash_position" DECIMAL(20,4),
    "cash_change" DECIMAL(20,4),
    "reconciliation_status" TEXT,
    "risks" JSONB,
    "recommended_actions" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_briefings_company_date ON "morning_briefings"("company_id", "date");

CREATE TABLE IF NOT EXISTS "implementation_milestones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "estimated_days" INTEGER,
    "depends_on" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("company_id", "slug")
);
CREATE INDEX IF NOT EXISTS idx_milestones_company_category ON "implementation_milestones"("company_id", "category");

CREATE TABLE IF NOT EXISTS "implementation_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "milestone_id" TEXT NOT NULL REFERENCES "implementation_milestones"("id") ON DELETE CASCADE,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completed_at" TIMESTAMP WITH TIME ZONE,
    "completed_by" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("company_id", "milestone_id")
);
CREATE INDEX IF NOT EXISTS idx_impl_progress_company_status ON "implementation_progress"("company_id", "status");

CREATE TABLE IF NOT EXISTS "feature_flags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "required_role" TEXT,
    "depends_on" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_beta" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("company_id", "slug")
);
CREATE INDEX IF NOT EXISTS idx_feature_flags_company_cat ON "feature_flags"("company_id", "category", "is_enabled");

CREATE TABLE IF NOT EXISTS "product_guidance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "trigger_on" TEXT,
    "target_role" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("company_id", "slug")
);
CREATE INDEX IF NOT EXISTS idx_guidance_company_active ON "product_guidance"("company_id", "is_active");

CREATE TABLE IF NOT EXISTS "guidance_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guidance_id" TEXT NOT NULL REFERENCES "product_guidance"("id") ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "target_element" TEXT,
    "placement" TEXT NOT NULL DEFAULT 'bottom',
    "media_url" TEXT,
    "action_label" TEXT,
    "action_url" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("guidance_id", "order")
);
CREATE INDEX IF NOT EXISTS idx_guidance_steps_guidance ON "guidance_steps"("guidance_id");

CREATE TABLE IF NOT EXISTS "user_guidance_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "guidance_id" TEXT NOT NULL REFERENCES "product_guidance"("id") ON DELETE CASCADE,
    "step_index" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP WITH TIME ZONE,
    "dismissed_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("user_id", "guidance_id")
);
CREATE INDEX IF NOT EXISTS idx_user_guidance_progress ON "user_guidance_progress"("user_id", "is_completed");

CREATE TABLE IF NOT EXISTS "adoption_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "user_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT,
    "metadata" JSONB,
    "duration_ms" INTEGER,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_adoption_events_company_date ON "adoption_events"("company_id", "created_at");
CREATE INDEX IF NOT EXISTS idx_adoption_events_type_key ON "adoption_events"("company_id", "event_type", "key");
CREATE INDEX IF NOT EXISTS idx_adoption_events_user ON "adoption_events"("user_id");

CREATE TABLE IF NOT EXISTS "adoption_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "period_start" TIMESTAMP WITH TIME ZONE NOT NULL,
    "period_end" TIMESTAMP WITH TIME ZONE NOT NULL,
    "overall_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "user_adoption" JSONB,
    "feature_usage" JSONB,
    "workspace_engagement" JSONB,
    "active_users" INTEGER NOT NULL DEFAULT 0,
    "total_users" INTEGER NOT NULL DEFAULT 0,
    "unused_features" JSONB,
    "recommendations" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_adoption_scores_company_period ON "adoption_scores"("company_id", "period_start", "period_end");

CREATE TABLE IF NOT EXISTS "customer_success_resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "content" TEXT,
    "tags" JSONB,
    "role_target" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_success_resources_company_type ON "customer_success_resources"("company_id", "type", "is_published");

CREATE TABLE IF NOT EXISTS "feature_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "votes" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "admin_notes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feature_requests_company_status ON "feature_requests"("company_id", "status");

CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "user_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'open',
    "assigned_to" TEXT,
    "resolution" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_company_status ON "support_tickets"("company_id", "status", "priority");
