export interface FxRate {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
}

export interface FxProvider {
  getRates(baseCurrency: string): Promise<FxRate[]>;
}

export interface FxSyncResult {
  success: boolean;
  currenciesUpdated: number;
  source: string;
  error?: string;
  timestamp: string;
}

export interface FxSyncStatus {
  lastSyncAt: string | null;
  lastSyncSuccess: boolean | null;
  lastError: string | null;
  provider: string;
  currenciesUpdated: number | null;
  active: boolean;
}
