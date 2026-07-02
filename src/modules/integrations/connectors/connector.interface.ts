export interface ConnectorResult {
  success: boolean;
  externalId?: string;
  message?: string;
}

export interface Connector {
  name: string;
  settleTransaction(companyId: string, transaction: unknown): Promise<ConnectorResult>;
}

export default Connector;
