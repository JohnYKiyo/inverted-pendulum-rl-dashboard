import { type Action, type CartPoleState, type StepResult } from "@/lib/types";

const GRAVITY = 9.8;
const MASS_CART = 1.0;
const MASS_POLE = 0.1;
const TOTAL_MASS = MASS_CART + MASS_POLE;
const LENGTH = 0.5;
const POLE_MASS_LENGTH = MASS_POLE * LENGTH;
const FORCE_MAG = 10;
const TAU = 0.02;
const X_THRESHOLD = 2.4;
const THETA_THRESHOLD = (12 * Math.PI) / 180;

export class PendulumEnv {
  private state: CartPoleState = [0, 0, 0, 0];

  reset(): CartPoleState {
    this.state = [
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
    ];
    return [...this.state];
  }

  getState(): CartPoleState {
    return [...this.state];
  }

  step(action: Action): StepResult {
    const [x, xDot, theta, thetaDot] = this.state;
    const force = action === 1 ? FORCE_MAG : -FORCE_MAG;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    const temp = (force + POLE_MASS_LENGTH * thetaDot * thetaDot * sinTheta) / TOTAL_MASS;
    const thetaAcc =
      (GRAVITY * sinTheta - cosTheta * temp) /
      (LENGTH * (4 / 3 - (MASS_POLE * cosTheta * cosTheta) / TOTAL_MASS));
    const xAcc = temp - (POLE_MASS_LENGTH * thetaAcc * cosTheta) / TOTAL_MASS;

    const nextX = x + TAU * xDot;
    const nextXDot = xDot + TAU * xAcc;
    const nextTheta = theta + TAU * thetaDot;
    const nextThetaDot = thetaDot + TAU * thetaAcc;
    this.state = [nextX, nextXDot, nextTheta, nextThetaDot];

    const done = Math.abs(nextX) > X_THRESHOLD || Math.abs(nextTheta) > THETA_THRESHOLD;
    const angleScore = 1 - Math.min(Math.abs(nextTheta) / THETA_THRESHOLD, 1);
    const positionPenalty = Math.min(Math.abs(nextX) / X_THRESHOLD, 1) * 0.2;
    const reward = done ? -1 : angleScore - positionPenalty + 0.2;

    return {
      state: [...this.state],
      reward,
      done,
    };
  }

  getThresholds() {
    return {
      xThreshold: X_THRESHOLD,
      thetaThreshold: THETA_THRESHOLD,
    };
  }
}
