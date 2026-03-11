import { type EpisodeStats } from "@/lib/types";

type StatsPanelProps = {
  stats: EpisodeStats;
};

type MetricCardProps = {
  label: string;
  value: string | number;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-panel-border bg-slate-900/80 p-3">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="rounded-xl border border-panel-border bg-panel/80 p-4">
      <p className="mb-3 text-sm font-medium text-muted">Realtime Metrics</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard label="Episode" value={stats.episode} />
        <MetricCard label="Step" value={stats.step} />
        <MetricCard label="Total Reward" value={stats.totalReward.toFixed(2)} />
        <MetricCard
          label="Last Episode Reward"
          value={stats.lastEpisodeReward.toFixed(2)}
        />
        <MetricCard label="Epsilon" value={stats.epsilon.toFixed(3)} />
        <MetricCard
          label="Loss"
          value={stats.loss === null ? "-" : stats.loss.toFixed(5)}
        />
      </div>
    </div>
  );
}
