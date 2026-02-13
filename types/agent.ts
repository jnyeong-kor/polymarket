export type ScanCandidate = {
  marketId: string;
  question: string;
  impliedProbability: number;
  opportunityScore: number;
  volume24h: number;
  openInterest: number;
};

export type ReasonedSignal = {
  marketId: string;
  confidence: number;
  edge: number;
  rationale: string[];
  sourcesVerified: number;
};

export type RiskDecision = {
  approved: boolean;
  positionFraction: number;
  stopLossUsd: number;
  budgetMode: 'normal' | 'ultra-economy';
  reason: string;
};

export type TradeExecution = {
  marketId: string;
  side: 'YES' | 'NO';
  stakeUsd: number;
  expectedValueUsd: number;
  status: 'executed' | 'blocked';
};

export type BotLog = {
  ts: string;
  phase: '[SCAN]' | '[REASON]' | '[VERIFY]' | '[EXECUTE]' | '[ADAPT]';
  message: string;
};
