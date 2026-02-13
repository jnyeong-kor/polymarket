import { BalanceChart } from '@/components/BalanceChart';
import { MetricCard } from '@/components/MetricCard';
import { ProgressBar } from '@/components/ProgressBar';
import { runCycle, startingBalance } from '@/lib/simulator';

const history = [startingBalance, 12510, 12640, 12600, 12780, 12810, 12995, 13020];

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);

export default function HomePage() {
  const { logs, trades, stats } = runCycle();

  return (
    <main className="container">
      <section className="hero card">
        <p className="eyebrow">Autonomous Predictive Intelligence · API-X</p>
        <h1>Polymarket Autonomous Trading Console</h1>
        <p className="small">
          Live operator view for scan/reason/verify/execute flow with risk guardrails, cost monitoring, and target tracking.
        </p>
      </section>

      <header className="header" aria-label="headline metrics">
        <MetricCard label="Current Balance" value={currency(stats.currentBalance)} />
        <MetricCard label="Total PnL" value={currency(stats.totalPnl)} highlight={stats.totalPnl >= 0 ? 'positive' : 'negative'} />
        <MetricCard label="API Costs" value={currency(stats.apiCostsUsd)} />
        <MetricCard label="Win Rate" value={`${Math.round(stats.winRate * 100)}%`} />
      </header>

      <section className="grid2">
        <BalanceChart points={history} />
        <div className="card">
          <h3>Target Tracker</h3>
          <ProgressBar label="Monthly Survival Baseline ($1,000)" value={stats.survivalProgress} />
          <ProgressBar label="Monthly Primary Goal ($10,000)" value={stats.targetProgress} />
          <p className="small">If API spend {'>'} 15% of daily realized PnL, bot auto-switches to ultra-economy mode.</p>
        </div>
      </section>

      <section className="grid2">
        <div className="card">
          <h3>Thinking Process Stream</h3>
          <ul className="logList">
            {logs.map((log) => (
              <li key={`${log.ts}-${log.phase}-${log.message}`}>
                <code>{log.phase}</code>
                <span>{log.message}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Execution Outcomes</h3>
          <table>
            <thead>
              <tr>
                <th>Market</th>
                <th>Status</th>
                <th>Stake</th>
                <th>EV</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.marketId}>
                  <td>{trade.marketId}</td>
                  <td>
                    <span className={`badge ${trade.status === 'executed' ? 'ok' : 'blocked'}`}>{trade.status}</span>
                  </td>
                  <td>{currency(trade.stakeUsd)}</td>
                  <td>{currency(trade.expectedValueUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
