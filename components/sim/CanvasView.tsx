"use client";

import { useEffect, useRef } from "react";
import { type CartPoleState } from "@/lib/types";

type CanvasViewProps = {
  state: CartPoleState;
  xThreshold?: number;
};

const WIDTH = 740;
const HEIGHT = 320;

export function CanvasView({ state, xThreshold = 2.4 }: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const [x, , theta] = state;
    const cartY = 220;
    const cartWidth = 84;
    const cartHeight = 36;
    const trackLeft = 40;
    const trackRight = WIDTH - 40;
    const normalizedX = Math.max(-1, Math.min(1, x / xThreshold));
    const cartCenterX =
      ((normalizedX + 1) / 2) * (trackRight - trackLeft) + trackLeft;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(1, "#020617");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trackLeft, cartY + cartHeight / 2 + 24);
    ctx.lineTo(trackRight, cartY + cartHeight / 2 + 24);
    ctx.stroke();

    ctx.fillStyle = "#334155";
    ctx.fillRect(
      cartCenterX - cartWidth / 2,
      cartY - cartHeight / 2,
      cartWidth,
      cartHeight,
    );
    ctx.fillStyle = "#64748b";
    ctx.fillRect(
      cartCenterX - cartWidth / 2 + 8,
      cartY - cartHeight / 2 + 8,
      cartWidth - 16,
      cartHeight - 16,
    );

    const poleLength = 120;
    const anchorX = cartCenterX;
    const anchorY = cartY - cartHeight / 2;
    const poleTipX = anchorX + poleLength * Math.sin(theta);
    const poleTipY = anchorY - poleLength * Math.cos(theta);

    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    ctx.lineTo(poleTipX, poleTipY);
    ctx.stroke();

    ctx.fillStyle = "#67e8f9";
    ctx.beginPath();
    ctx.arc(anchorX, anchorY, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px monospace";
    ctx.fillText(`x=${x.toFixed(3)} m`, 18, 24);
    ctx.fillText(`theta=${((theta * 180) / Math.PI).toFixed(2)} deg`, 18, 42);
  }, [state, xThreshold]);

  return (
    <div className="rounded-xl border border-panel-border bg-panel/80 p-4">
      <p className="mb-3 text-sm font-medium text-muted">Physics Simulation</p>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="h-auto w-full rounded-md border border-panel-border"
      />
    </div>
  );
}
