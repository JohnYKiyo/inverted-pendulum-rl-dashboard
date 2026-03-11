"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PendulumEnv } from "@/components/physics/pendulum";
import { DqnAgent } from "@/components/rl/dqnAgent";
import { type EpisodeStats, type RewardPoint } from "@/lib/types";

const MAX_CHART_POINTS = 120;
const STEPS_PER_FRAME = 2;
const MAX_STEPS_PER_EPISODE = 500;

export function useTrainingLoop() {
  const envRef = useRef<PendulumEnv | null>(null);
  const agentRef = useRef<DqnAgent | null>(null);
  const frameRef = useRef<number | null>(null);
  const loopRef = useRef<() => Promise<void>>(async () => {});
  const runningRef = useRef(false);
  const loopBusyRef = useRef(false);

  const [isRunning, setIsRunning] = useState(false);
  const [cartState, setCartState] = useState<[number, number, number, number]>([
    0, 0, 0, 0,
  ]);
  const [rewardHistory, setRewardHistory] = useState<RewardPoint[]>([]);
  const [isPersisting, setIsPersisting] = useState(false);
  const [persistMessage, setPersistMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<EpisodeStats>({
    episode: 1,
    step: 0,
    totalReward: 0,
    lastEpisodeReward: 0,
    epsilon: 1,
    loss: null,
  });

  const liveRef = useRef({
    episode: 1,
    step: 0,
    totalReward: 0,
    lastEpisodeReward: 0,
    loss: null as number | null,
  });

  const resetInternal = useCallback(() => {
    if (agentRef.current) {
      agentRef.current.dispose();
    }
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    runningRef.current = false;
    loopBusyRef.current = false;

    envRef.current = new PendulumEnv();
    agentRef.current = new DqnAgent();
    const initial = envRef.current.reset();
    setCartState(initial);
    liveRef.current = {
      episode: 1,
      step: 0,
      totalReward: 0,
      lastEpisodeReward: 0,
      loss: null,
    };
    setRewardHistory([]);
    setStats({
      episode: 1,
      step: 0,
      totalReward: 0,
      lastEpisodeReward: 0,
      epsilon: agentRef.current.epsilon,
      loss: null,
    });
    setIsRunning(false);
  }, []);

  const loop = useCallback(async () => {
    if (!runningRef.current || loopBusyRef.current) {
      return;
    }
    loopBusyRef.current = true;

    const env = envRef.current;
    const agent = agentRef.current;
    if (!env || !agent) {
      loopBusyRef.current = false;
      return;
    }

    for (let i = 0; i < STEPS_PER_FRAME; i += 1) {
      const state = env.getState();
      const action = agent.chooseAction(state);
      const { state: nextState, reward, done } = env.step(action);
      agent.remember({
        state,
        action,
        reward,
        nextState,
        done,
      });

      liveRef.current.step += 1;
      liveRef.current.totalReward += reward;
      const loss = await agent.trainStep();
      if (loss !== null) {
        liveRef.current.loss = loss;
      }

      setCartState(nextState);

      const episodeFinished = done || liveRef.current.step >= MAX_STEPS_PER_EPISODE;
      if (episodeFinished) {
        liveRef.current.lastEpisodeReward = liveRef.current.totalReward;
        setRewardHistory((prev) => {
          const next = [
            ...prev,
            {
              episode: liveRef.current.episode,
              reward: Number(liveRef.current.lastEpisodeReward.toFixed(2)),
            },
          ];
          return next.slice(-MAX_CHART_POINTS);
        });
        agent.onEpisodeEnd();
        env.reset();
        liveRef.current.episode += 1;
        liveRef.current.step = 0;
        liveRef.current.totalReward = 0;
      }
    }

    setStats({
      episode: liveRef.current.episode,
      step: liveRef.current.step,
      totalReward: Number(liveRef.current.totalReward.toFixed(2)),
      lastEpisodeReward: Number(liveRef.current.lastEpisodeReward.toFixed(2)),
      epsilon: Number(agent.epsilon.toFixed(3)),
      loss: liveRef.current.loss === null ? null : Number(liveRef.current.loss.toFixed(5)),
    });

    loopBusyRef.current = false;
    if (runningRef.current) {
      frameRef.current = requestAnimationFrame(() => {
        void loopRef.current();
      });
    }
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) {
      return;
    }
    runningRef.current = true;
    setIsRunning(true);
    frameRef.current = requestAnimationFrame(() => {
      void loopRef.current();
    });
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    resetInternal();
  }, [resetInternal]);

  const saveModel = useCallback(async () => {
    const agent = agentRef.current;
    if (!agent || isPersisting) {
      return;
    }

    setIsPersisting(true);
    setPersistMessage(null);
    try {
      await agent.saveModel();
      setPersistMessage("モデルをIndexedDBに保存しました。");
    } catch {
      setPersistMessage("モデル保存に失敗しました。");
    } finally {
      setIsPersisting(false);
    }
  }, [isPersisting]);

  const loadModel = useCallback(async () => {
    const agent = agentRef.current;
    if (!agent || isPersisting) {
      return;
    }

    setIsPersisting(true);
    setPersistMessage(null);
    try {
      const loaded = await agent.loadModel();
      if (loaded) {
        setStats((prev) => ({
          ...prev,
          epsilon: Number(agent.epsilon.toFixed(3)),
        }));
        setPersistMessage("モデルをIndexedDBから読み込みました。");
      } else {
        setPersistMessage("保存済みモデルが見つかりません。");
      }
    } catch {
      setPersistMessage("モデル読み込みに失敗しました。");
    } finally {
      setIsPersisting(false);
    }
  }, [isPersisting]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  useEffect(() => {
    resetInternal();
    return () => {
      runningRef.current = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (agentRef.current) {
        agentRef.current.dispose();
      }
    };
  }, [resetInternal]);

  const thresholds = {
    xThreshold: 2.4,
    thetaThreshold: (12 * Math.PI) / 180,
  };

  return {
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
  };
}
