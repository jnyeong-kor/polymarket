import type { ReasonedSignal, RiskDecision } from '@/types/agent';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function fractionalKellyStake(
  confidence: number,
  price: number,
  bankroll: number,
  fractionRange: [number, number] = [0.1, 0.25]
): number {
  const b = (1 - price) / price;
  const q = 1 - confidence;
  const rawKelly = (b * confidence - q) / b;
  const safeKelly = clamp(rawKelly, 0, 1);
  const chosenFraction = clamp(safeKelly * fractionRange[1], fractionRange[0], fractionRange[1]);

  return bankroll * chosenFraction;
}

export function evaluateRisk(params: {
  signal: ReasonedSignal;
  bankroll: number;
  currentApiCostsUsd: number;
  dailyProfitUsd: number;
}): RiskDecision {
  const { signal, bankroll, currentApiCostsUsd, dailyProfitUsd } = params;

  const budgetMode = currentApiCostsUsd > Math.max(dailyProfitUsd, 1) * 0.15 ? 'ultra-economy' : 'normal';

  if (signal.sourcesVerified < 3) {
    return {
      approved: false,
      positionFraction: 0,
      stopLossUsd: bankroll * 0.02,
      budgetMode,
      reason: 'Hallucination guard: fewer than 3 independent sources verified.'
    };
  }

  if (signal.edge <= 0) {
    return {
      approved: false,
      positionFraction: 0,
      stopLossUsd: bankroll * 0.02,
      budgetMode,
      reason: 'No measurable edge after reasoning.'
    };
  }

  const capped = clamp(signal.confidence * 0.25, 0.1, 0.25);
  return {
    approved: true,
    positionFraction: capped,
    stopLossUsd: bankroll * 0.02,
    budgetMode,
    reason: 'Risk checks passed with fractional Kelly sizing.'
  };
}
