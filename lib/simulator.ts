import type { BotLog, ReasonedSignal, ScanCandidate, TradeExecution } from '@/types/agent';
import { evaluateRisk, fractionalKellyStake } from '@/lib/risk';

export const startingBalance = 12450;

const scanPool: ScanCandidate[] = [
  {
    marketId: 'us-election-2028-dem-win',
    question: 'Will Democrats win the U.S. presidential election in 2028?',
    impliedProbability: 0.47,
    opportunityScore: 82,
    volume24h: 1_250_000,
    openInterest: 5_800_000
  },
  {
    marketId: 'fed-cut-june',
    question: 'Will the Fed cut rates before July?',
    impliedProbability: 0.39,
    opportunityScore: 76,
    volume24h: 850_000,
    openInterest: 3_200_000
  },
  {
    marketId: 'btc-ath-2026',
    question: 'Will BTC hit new ATH before 2026?',
    impliedProbability: 0.42,
    opportunityScore: 69,
    volume24h: 950_000,
    openInterest: 2_300_000
  }
];

const reasoned: ReasonedSignal[] = [
  {
    marketId: 'us-election-2028-dem-win',
    confidence: 0.55,
    edge: 0.08,
    sourcesVerified: 4,
    rationale: [
      'Search grounding confirms candidate filing momentum in 3 major outlets.',
      'Social sentiment skewed positive across X and Reddit compared to baseline.',
      'Market price underreacts to latest state-level polling trend.'
    ]
  },
  {
    marketId: 'fed-cut-june',
    confidence: 0.35,
    edge: -0.04,
    sourcesVerified: 3,
    rationale: ['Labor market surprises keep policy path uncertain.']
  },
  {
    marketId: 'btc-ath-2026',
    confidence: 0.58,
    edge: 0.07,
    sourcesVerified: 2,
    rationale: ['On-chain growth positive but only two independent confirmations today.']
  }
];

export function runCycle() {
  const logs: BotLog[] = [];
  const trades: TradeExecution[] = [];
  let balance = startingBalance;

  const apiCostsUsd = 47;
  const pnlToday = 420;

  scanPool.forEach((candidate) => {
    logs.push({
      ts: new Date().toISOString(),
      phase: '[SCAN]',
      message: `${candidate.marketId} scanned (score=${candidate.opportunityScore}, OI=${candidate.openInterest.toLocaleString()}).`
    });

    const signal = reasoned.find((item) => item.marketId === candidate.marketId);
    if (!signal) return;

    logs.push({
      ts: new Date().toISOString(),
      phase: '[REASON]',
      message: `${candidate.marketId} confidence=${(signal.confidence * 100).toFixed(1)}%, edge=${(signal.edge * 100).toFixed(1)}%.`
    });

    const risk = evaluateRisk({
      signal,
      bankroll: balance,
      currentApiCostsUsd: apiCostsUsd,
      dailyProfitUsd: pnlToday
    });

    logs.push({ ts: new Date().toISOString(), phase: '[VERIFY]', message: `${candidate.marketId}: ${risk.reason}` });

    if (!risk.approved) {
      trades.push({
        marketId: candidate.marketId,
        side: 'YES',
        stakeUsd: 0,
        expectedValueUsd: 0,
        status: 'blocked'
      });
      return;
    }

    const stake = Math.min(
      fractionalKellyStake(signal.confidence, candidate.impliedProbability, balance),
      balance * risk.positionFraction
    );
    const expectedValueUsd = stake * signal.edge;

    trades.push({
      marketId: candidate.marketId,
      side: 'YES',
      stakeUsd: Number(stake.toFixed(2)),
      expectedValueUsd: Number(expectedValueUsd.toFixed(2)),
      status: 'executed'
    });

    balance += expectedValueUsd;

    logs.push({
      ts: new Date().toISOString(),
      phase: '[EXECUTE]',
      message: `${candidate.marketId}: placed YES $${stake.toFixed(2)} (EV +$${expectedValueUsd.toFixed(2)}).`
    });
  });

  logs.push({
    ts: new Date().toISOString(),
    phase: '[ADAPT]',
    message: 'Strategy monitor active: if 7-day Sharpe < 0.8, rebalance feature weights automatically.'
  });

  return {
    logs,
    trades,
    stats: {
      currentBalance: Number(balance.toFixed(2)),
      totalPnl: Number((balance - startingBalance).toFixed(2)),
      apiCostsUsd,
      winRate: 0.61,
      survivalProgress: 0.42,
      targetProgress: 0.11
    }
  };
}
