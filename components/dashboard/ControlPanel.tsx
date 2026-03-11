import { Pause, Play, RotateCcw, Save, Upload } from "lucide-react";

type ControlPanelProps = {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSave: () => void;
  onLoad: () => void;
  isPersisting: boolean;
  persistMessage: string | null;
};

export function ControlPanel({
  isRunning,
  onStart,
  onStop,
  onReset,
  onSave,
  onLoad,
  isPersisting,
  persistMessage,
}: ControlPanelProps) {
  return (
    <div className="rounded-xl border border-panel-border bg-panel/80 p-4">
      <p className="mb-3 text-sm font-medium text-muted">Training Controls</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Play size={16} />
          Start
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={!isRunning}
          className="inline-flex items-center gap-2 rounded-md border border-panel-border bg-slate-800 px-3 py-2 text-sm font-semibold transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Pause size={16} />
          Stop
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-md border border-panel-border bg-slate-800 px-3 py-2 text-sm font-semibold transition hover:bg-slate-700"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isPersisting}
          className="inline-flex items-center gap-2 rounded-md border border-panel-border bg-slate-800 px-3 py-2 text-sm font-semibold transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={16} />
          Save
        </button>
        <button
          type="button"
          onClick={onLoad}
          disabled={isPersisting}
          className="inline-flex items-center gap-2 rounded-md border border-panel-border bg-slate-800 px-3 py-2 text-sm font-semibold transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload size={16} />
          Load
        </button>
      </div>
      {persistMessage ? (
        <p className="mt-3 text-xs text-muted">{persistMessage}</p>
      ) : null}
    </div>
  );
}
