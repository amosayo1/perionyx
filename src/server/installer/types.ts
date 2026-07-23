export type InstallMode = "fresh" | "upgrade" | "repair" | "validate-only"

export type InstallStatus = "pending" | "running" | "completed" | "failed" | "rolled-back"

export type DeploymentEnvironment = "development" | "testing" | "staging" | "production" | "offline"

export type ComponentStatus = "healthy" | "degraded" | "unhealthy" | "not-checked"

export type ValidationSeverity = "error" | "warning" | "info"

export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped"

export type BackupType = "pre-upgrade" | "manual" | "scheduled" | "restore-point"

export type BackupStatus = "completed" | "failed" | "running"

export type SeedEnvironment = "development" | "testing" | "staging" | "production" | "offline"

export type LockResource = "installation" | "migration" | "backup" | "restore" | "upgrade"

export interface InstallationConfig {
  mode: InstallMode
  environment: DeploymentEnvironment
  version: string
  previousVersion?: string
  dbConnectionString?: string
  redisHost?: string
  storagePath?: string
  featureFlags?: Record<string, boolean>
  companyName?: string
  adminEmail?: string
  adminPassword?: string
  baseCurrency?: string
  fiscalYearStart?: number
  skipPrerequisites?: boolean
  skipMigrations?: boolean
  skipSeeding?: boolean
  skipHealthCheck?: boolean
  timeout?: number
  rollbackOnFailure?: boolean
}

export interface InstallationStep {
  id: string
  name: string
  description: string
  order: number
  status: StepStatus
  startedAt?: Date
  completedAt?: Date
  error?: string
  duration?: number
}

export interface InstallationResult {
  id: string
  mode: InstallMode
  environment: DeploymentEnvironment
  version: string
  status: InstallStatus
  steps: InstallationStep[]
  startedAt: Date
  completedAt?: Date
  duration?: number
  errors: string[]
  warnings: string[]
  report?: InstallationReport
}

export interface InstallationReport {
  summary: string
  stepsCompleted: number
  stepsFailed: number
  stepsSkipped: number
  totalDuration: number
  recommendations: string[]
  status: InstallStatus
}

export interface EnvironmentValidationResult {
  nodeVersion: boolean
  nodeVersionValue: string
  memory: boolean
  memoryValue: string
  disk: boolean
  diskValue: string
  platform: boolean
  platformValue: string
  cpuCores: number
}

export interface PrerequisiteCheck {
  name: string
  description: string
  required: boolean
  passed: boolean
  message: string
  severity: ValidationSeverity
}

export interface HealthValidationResult {
  database: ComponentStatus
  redis: ComponentStatus
  queues: ComponentStatus
  storage: ComponentStatus
  cache: ComponentStatus
  persistence: ComponentStatus
  security: ComponentStatus
  backgroundWorkers: ComponentStatus
  applicationServices: ComponentStatus
  details: Record<string, string>
}

export interface MigrationRecord {
  id: string
  name: string
  version: string
  batch: number
  executedAt: Date
  duration: number
  checksum: string
  success: boolean
  rollbackScript?: string
}

export interface CompanyBootstrapConfig {
  companyName: string
  legalName?: string
  taxId?: string
  fiscalYearStart: number
  fiscalYearEnd: number
  baseCurrency: string
  reportingCurrency: string
  country?: string
  timezone?: string
  chartOfAccountsTemplate?: string
  departments: string[]
  businessUnits: string[]
  enableTax: boolean
  enableTreasury: boolean
}

export interface AdministratorSetup {
  email: string
  firstName: string
  lastName: string
  password: string
  mfaEnabled: boolean
  recoveryCodes: string[]
  roles: string[]
  permissions: string[]
}

export interface SeedManifest {
  id: string
  name: string
  description: string
  version: string
  environments: SeedEnvironment[]
  required: boolean
  dependsOn: string[]
  data: Record<string, unknown>
}

export interface BackupManifest {
  id: string
  type: BackupType
  version: string
  timestamp: Date
  includes: string[]
  size: number
  checksum: string
  location: string
  status: BackupStatus
}

export interface DeploymentMetrics {
  deploymentSuccess: number
  deploymentFailed: number
  averageDeploymentDuration: number
  averageMigrationDuration: number
  startupTime: number
  healthScore: number
  lastDeployment: Date | null
  lastUpgrade: Date | null
  versionHistory: string[]
}

export interface UpgradePlan {
  currentVersion: string
  targetVersion: string
  migrations: MigrationRecord[]
  compatibility: boolean
  estimatedDowntime: number
  preUpgradeChecks: PrerequisiteCheck[]
  rollbackSteps: string[]
  warnings: string[]
}

export interface EnvironmentProfile {
  name: DeploymentEnvironment
  database: { host: string; port: number; name: string; user: string; poolSize: number }
  redis: { host: string; port: number; db: number }
  storage: { path: string; maxSize: string }
  email: { host: string; port: number; secure: boolean; from: string }
  logging: { level: string; format: string; retention: number }
  security: { jwtSecret: string; sessionTimeout: number; maxLoginAttempts: number }
  featureFlags: Record<string, boolean>
}

export interface ValidationError {
  field: string
  message: string
  severity: ValidationSeverity
}

export interface InstallerLock {
  resource: LockResource
  holder: string
  acquiredAt: Date
  expiresAt: Date
  released: boolean
}

export interface InstallationSnapshot {
  id: string
  installId: string
  timestamp: Date
  state: Record<string, unknown>
  checksum: string
}

export interface MigrationBatch {
  id: string
  batch: number
  startedAt: Date
  completedAt?: Date
  migrations: MigrationRecord[]
  success: boolean
  error?: string
}

export interface SeedState {
  manifestId: string
  version: string
  installed: boolean
  installedAt?: Date
  checksum: string
  verified: boolean
}

export interface ComponentHealthDetail {
  name: string
  status: ComponentStatus
  latencyMs: number
  message: string
  lastChecked: Date
}

export interface ReportSection {
  title: string
  content: string[]
  severity: ValidationSeverity
}

export interface InstallationTiming {
  phase: string
  startTime: number
  endTime: number
  duration: number
}

export interface RollbackPoint {
  id: string
  installId: string
  timestamp: Date
  type: "pre-install" | "pre-migration" | "pre-upgrade"
  state: Record<string, unknown>
  restored: boolean
  restoredAt?: Date
}

export interface UpgradeResult {
  plan: UpgradePlan
  executed: boolean
  migrationsRun: number
  migrationsFailed: number
  duration: number
  status: InstallStatus
  errors: string[]
}
