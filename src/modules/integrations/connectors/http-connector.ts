import type { Connector, ConnectorResult } from './connector.interface';

export class HttpConnector implements Connector {
  name = 'http-connector';
  constructor(private opts: { baseUrl: string; apiKey?: string }) {}

  async settleTransaction(companyId: string, tx: any): Promise<ConnectorResult> {
    const url = `${this.opts.baseUrl.replace(/\/$/, '')}/settle`;
    const body = { companyId, transaction: tx };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.opts.apiKey) headers['Authorization'] = `Bearer ${this.opts.apiKey}`;

    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return { success: false, externalId: undefined, message: `status:${res.status} body:${txt}` };
    }
    const json = await res.json().catch(() => null);
    return { success: true, externalId: (json && typeof json.id === 'string') ? json.id : undefined, message: json ? JSON.stringify(json) : undefined };
  }
}

export default HttpConnector;
