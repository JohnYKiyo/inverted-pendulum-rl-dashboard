import * as tf from "@tensorflow/tfjs";
import { type Action, type CartPoleState, type Transition } from "@/lib/types";

const STATE_SIZE = 4;
const ACTION_SIZE = 2;
const GAMMA = 0.98;
const LEARNING_RATE = 0.001;
const BATCH_SIZE = 64;
const MEMORY_SIZE = 20_000;
const TARGET_SYNC_INTERVAL = 120;

const normalizeState = (state: CartPoleState): number[] => {
  const [x, xDot, theta, thetaDot] = state;
  return [
    x / 2.4,
    xDot / 3,
    theta / 0.21,
    thetaDot / 3.5,
  ];
};

const sampleBatch = <T,>(arr: T[], batchSize: number): T[] => {
  const copied = [...arr];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied.slice(0, batchSize);
};

export class DqnAgent {
  private model: tf.LayersModel;
  private targetModel: tf.Sequential;
  private memory: Transition[] = [];
  private trainCount = 0;
  epsilon = 1.0;
  readonly epsilonMin = 0.05;
  readonly epsilonDecay = 0.996;

  constructor() {
    this.model = this.buildModel();
    this.targetModel = this.buildModel();
    this.syncTargetModel();
  }

  private static readonly MODEL_KEY = "indexeddb://pendulum-dqn-model";
  private static readonly META_KEY = "pendulum-dqn-meta";

  private buildModel(): tf.Sequential {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        inputShape: [STATE_SIZE],
        units: 64,
        activation: "relu",
      }),
    );
    model.add(tf.layers.dense({ units: 64, activation: "relu" }));
    model.add(tf.layers.dense({ units: ACTION_SIZE }));
    model.compile({
      optimizer: tf.train.adam(LEARNING_RATE),
      loss: "meanSquaredError",
    });
    return model;
  }

  private compileModel(model: tf.LayersModel) {
    model.compile({
      optimizer: tf.train.adam(LEARNING_RATE),
      loss: "meanSquaredError",
    });
  }

  chooseAction(state: CartPoleState): Action {
    if (Math.random() < this.epsilon) {
      return Math.random() < 0.5 ? 0 : 1;
    }
    const action = tf.tidy(() => {
      const stateTensor = tf.tensor2d([normalizeState(state)]);
      const qValues = this.model.predict(stateTensor) as tf.Tensor2D;
      return qValues.argMax(1).dataSync()[0];
    });
    return action === 0 ? 0 : 1;
  }

  remember(transition: Transition) {
    this.memory.push(transition);
    if (this.memory.length > MEMORY_SIZE) {
      this.memory.shift();
    }
  }

  onEpisodeEnd() {
    this.epsilon = Math.max(this.epsilonMin, this.epsilon * this.epsilonDecay);
  }

  async trainStep(): Promise<number | null> {
    if (this.memory.length < BATCH_SIZE) {
      return null;
    }

    const batch = sampleBatch(this.memory, BATCH_SIZE);
    const states = batch.map((item) => normalizeState(item.state));
    const nextStates = batch.map((item) => normalizeState(item.nextState));

    const statesTensor = tf.tensor2d(states);
    const nextStatesTensor = tf.tensor2d(nextStates);

    const currentQ = this.model.predict(statesTensor) as tf.Tensor2D;
    const nextQ = this.targetModel.predict(nextStatesTensor) as tf.Tensor2D;

    const currentQValues = await currentQ.array();
    const nextQValues = await nextQ.array();

    const targetQValues = currentQValues.map((qs, i) => {
      const row = [...qs];
      const { action, reward, done } = batch[i];
      const nextMax = Math.max(...nextQValues[i]);
      row[action] = done ? reward : reward + GAMMA * nextMax;
      return row;
    });

    const targetTensor = tf.tensor2d(targetQValues);
    const history = await this.model.fit(statesTensor, targetTensor, {
      batchSize: BATCH_SIZE,
      epochs: 1,
      verbose: 0,
    });

    statesTensor.dispose();
    nextStatesTensor.dispose();
    currentQ.dispose();
    nextQ.dispose();
    targetTensor.dispose();

    this.trainCount += 1;
    if (this.trainCount % TARGET_SYNC_INTERVAL === 0) {
      this.syncTargetModel();
    }

    const lossValue = history.history.loss[0];
    return typeof lossValue === "number" ? lossValue : null;
  }

  async saveModel() {
    await this.model.save(DqnAgent.MODEL_KEY);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        DqnAgent.META_KEY,
        JSON.stringify({
          epsilon: this.epsilon,
          trainCount: this.trainCount,
        }),
      );
    }
  }

  async loadModel(): Promise<boolean> {
    const existing = await tf.io.listModels();
    if (!existing[DqnAgent.MODEL_KEY]) {
      return false;
    }

    const loaded = await tf.loadLayersModel(DqnAgent.MODEL_KEY);
    this.compileModel(loaded);
    this.model.dispose();
    this.model = loaded;
    this.syncTargetModel();

    if (typeof window !== "undefined") {
      const rawMeta = window.localStorage.getItem(DqnAgent.META_KEY);
      if (rawMeta) {
        try {
          const meta = JSON.parse(rawMeta) as {
            epsilon?: number;
            trainCount?: number;
          };
          if (typeof meta.epsilon === "number") {
            this.epsilon = Math.max(this.epsilonMin, Math.min(1, meta.epsilon));
          }
          if (typeof meta.trainCount === "number") {
            this.trainCount = Math.max(0, Math.floor(meta.trainCount));
          }
        } catch {
          // Ignore broken metadata and continue with model weights only.
        }
      }
    }

    return true;
  }

  dispose() {
    this.model.dispose();
    this.targetModel.dispose();
  }

  private syncTargetModel() {
    const weights = this.model.getWeights();
    this.targetModel.setWeights(weights);
  }
}
