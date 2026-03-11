"use client";

import dynamic from "next/dynamic";
import { FlaskConical, Gauge, Orbit } from "lucide-react";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { CanvasView } from "@/components/sim/CanvasView";
import { useTrainingLoop } from "@/lib/hooks/useTrainingLoop";

const RewardChart = dynamic(
  () => import("@/components/dashboard/RewardChart").then((m) => m.RewardChart),
  { ssr: false },
);

export default function Home() {
  const {
    cartState,
    rewardHistory,
    stats,
    isRunning,
    isPersisting,
    persistMessage,
    start,
    stop,
    reset,
    saveModel,
    loadModel,
    thresholds,
  } = useTrainingLoop();

  return (
    <main className="grid-bg min-h-screen px-4 py-6 text-foreground md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="rounded-xl border border-panel-border bg-panel/70 p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Inverted Pendulum Reinforcement Learning Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted">
                DQNが倒立振り子を学習する過程をリアルタイムで観測する実験環境
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <div className="inline-flex items-center gap-1">
                <FlaskConical size={16} />
                TensorFlow.js
              </div>
              <div className="inline-flex items-center gap-1">
                <Orbit size={16} />
                Cart-Pole
              </div>
              <div className="inline-flex items-center gap-1">
                <Gauge size={16} />
                Live Metrics
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <CanvasView state={cartState} xThreshold={thresholds?.xThreshold} />
          <div className="flex flex-col gap-5">
            <ControlPanel
              isRunning={isRunning}
              onStart={start}
              onStop={stop}
              onReset={reset}
              onSave={saveModel}
              onLoad={loadModel}
              isPersisting={isPersisting}
              persistMessage={persistMessage}
            />
            <StatsPanel stats={stats} />
          </div>
        </div>

        <RewardChart data={rewardHistory} />
      </div>
    </main>
  );
}
