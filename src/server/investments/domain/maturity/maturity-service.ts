import type { MaturityBucket, Holding, Security } from "../../types";

export class MaturityService {
  getMaturityBucket(maturityDate: Date, asOf: Date = new Date()): MaturityBucket {
    const days = (maturityDate.getTime() - asOf.getTime()) / 86400000;
    if (days <= 30) return "30-days";
    if (days <= 60) return "60-days";
    if (days <= 90) return "90-days";
    if (days <= 180) return "180-days";
    if (days <= 365) return "365-days";
    if (days <= 730) return "2-years";
    if (days <= 1825) return "5-years";
    if (days <= 3650) return "10-years";
    return "over-10-years";
  }

  getMaturityLadder(holdings: Holding[], securities: Map<string, Security>): MaturityLadderEntry[] {
    const ladder: Map<MaturityBucket, number> = new Map();
    const buckets: MaturityBucket[] = [
      "30-days", "60-days", "90-days", "180-days", "365-days",
      "2-years", "5-years", "10-years", "over-10-years",
    ];
    buckets.forEach((b) => ladder.set(b, 0));

    for (const h of holdings) {
      const sec = securities.get(h.securityId);
      if (sec?.maturityDate) {
        const bucket = this.getMaturityBucket(sec.maturityDate);
        ladder.set(bucket, (ladder.get(bucket) ?? 0) + h.marketValue);
      }
    }

    return buckets.map((bucket) => ({
      bucket,
      value: ladder.get(bucket) ?? 0,
      percentage: 0,
    })).map((entry) => ({
      ...entry,
      percentage: holdings.length > 0 ? (entry.value / holdings.reduce((s, h) => s + h.marketValue, 0)) * 100 : 0,
    }));
  }

  getUpcomingMaturities(holdings: Holding[], securities: Map<string, Security>, days: number = 90): Holding[] {
    const cutoff = new Date(Date.now() + days * 86400000);
    return holdings.filter((h) => {
      const sec = securities.get(h.securityId);
      return sec?.maturityDate && sec.maturityDate <= cutoff;
    });
  }

  getLiquidityGap(maturityLadder: MaturityLadderEntry[], projectedNeeds: number): number {
    const shortTerm = maturityLadder
      .filter((e) => ["30-days", "60-days", "90-days"].includes(e.bucket))
      .reduce((sum, e) => sum + e.value, 0);
    return shortTerm - projectedNeeds;
  }
}

export interface MaturityLadderEntry {
  bucket: MaturityBucket;
  value: number;
  percentage: number;
}
