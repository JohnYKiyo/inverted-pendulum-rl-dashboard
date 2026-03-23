"use client";

import { type RewardPoint } from "@/lib/types";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RewardChartProps = {
  data: RewardPoint[];
};

export function RewardChart({ data }: RewardChartProps) {
  return (
    <div className="rounded-xl border border-panel-border bg-panel/80 p-4">
      <p className="mb-3 text-sm font-medium text-muted">Reward Trend</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 4" stroke="#1f2937" />
            <XAxis dataKey="episode" stroke="#94a3b8" tickLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
            />
            <Line
              type="monotone"
              dataKey="reward"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
