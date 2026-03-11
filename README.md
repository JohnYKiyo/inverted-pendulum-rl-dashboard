# Inverted Pendulum RL Dashboard

ブラウザ上で倒立振り子（Cart-Pole）を学習する、TensorFlow.jsベースの強化学習ダッシュボードです。  
Next.js + TypeScript で構築され、物理シミュレーション・DQN学習・リアルタイム可視化を1つの画面に統合しています。

## Features

- Cart-Pole 物理シミュレーション（Canvas描画）
- DQN学習（Experience Replay + epsilon-greedy）
- リアルタイム統計（Episode / Step / Reward / Epsilon / Loss）
- 報酬推移チャート（Recharts）
- 学習済みモデルの保存/読込（IndexedDB）

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- TensorFlow.js (`@tensorflow/tfjs`)
- Recharts
- Lucide React

## Run Locally

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## Controls

- `Start`: 学習を開始
- `Stop`: 学習を一時停止
- `Reset`: 学習状態を初期化
- `Save`: 学習済みモデルを `indexeddb://pendulum-dqn-model` に保存
- `Load`: 保存済みモデルを IndexedDB から読み込み

## Build / Lint

```bash
npm run lint
npm run build
```
