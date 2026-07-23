import { createFixture } from "./fixture";

export const treasuryFixtures = {
  cashPosition: createFixture({
    id: "cp_001",
    accountId: "acc_001",
    availableBalance: 5000000,
    ledgerBalance: 5250000,
    currency: "USD",
    asOf: new Date("2026-07-09"),
    status: "settled",
  }),
  cashForecast: createFixture({
    id: "cf_001",
    accountId: "acc_001",
    projectedInflows: 2000000,
    projectedOutflows: 1500000,
    netForecast: 500000,
    confidence: 0.85,
    horizonDate: new Date("2026-07-16"),
  }),
  fxRate: createFixture({
    pair: "USD/EUR",
    rate: 0.92,
    bid: 0.9195,
    ask: 0.9205,
    timestamp: new Date(),
    source: "ECB",
  }),
};
