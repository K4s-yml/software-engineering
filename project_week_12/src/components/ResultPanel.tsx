import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, Sparkles } from "lucide-react";
import type { AvailabilityResult } from "@/types";
import {
  explainWithTimeout,
  FALLBACK_EXPLANATION,
  type ExplanationInput,
} from "@/utils/explain";

interface ResultPanelProps {
  result: AvailabilityResult | null;
  checked: boolean;
  buildInput?: () => ExplanationInput | null;
}

export default function ResultPanel({ result, checked, buildInput }: ResultPanelProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!checked || !result) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-400">
        <Info className="h-5 w-5 flex-shrink-0" />
        <span>Fill in the time and select a room, then check availability.</span>
      </div>
    );
  }

  async function handleExplain() {
    if (!buildInput || loading) return;
    const input = buildInput();
    if (!input) {
      setExplanation(null);
      setExplanationError("Could not build an explanation request. The availability result is unchanged.");
      return;
    }
    setLoading(true);
    setExplanation(null);
    setExplanationError(null);
    try {
      const res = await explainWithTimeout(input, { timeoutMs: 2000 });
      setExplanation(res.explanation);
    } catch {
      setExplanation(null);
      setExplanationError(FALLBACK_EXPLANATION);
    } finally {
      setLoading(false);
    }
  }

  const available = result.status === "available";
  const invalid = result.status === "invalid";

  const styles = available
    ? "border-emerald-200 bg-emerald-50"
    : invalid
      ? "border-amber-200 bg-amber-50"
      : "border-red-200 bg-red-50";

  const iconColor = available
    ? "text-emerald-600"
    : invalid
      ? "text-amber-600"
      : "text-red-600";

  const titleColor = available
    ? "text-emerald-800"
    : invalid
      ? "text-amber-800"
      : "text-red-800";

  const bodyColor = available
    ? "text-emerald-700"
    : invalid
      ? "text-amber-700"
      : "text-red-700";

  const label = available ? "Available" : invalid ? "Invalid input" : "Unavailable";

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`flex items-start gap-3 rounded-xl border p-4 ${styles}`}
        role="status"
        aria-live="polite"
      >
        {available ? (
          <CheckCircle2 className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconColor}`} />
        ) : invalid ? (
          <AlertTriangle className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconColor}`} />
        ) : (
          <XCircle className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconColor}`} />
        )}
        <div>
          <p className={`text-sm font-bold ${titleColor}`}>{label}</p>
          <p className={`mt-0.5 text-sm ${bodyColor}`}>{result.message}</p>
        </div>
      </div>

      {/* Generated explanation (mock) — separate from the confirmed status above */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Generated explanation (mock)
            </span>
          </div>
          <button
            type="button"
            onClick={handleExplain}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Explaining…" : "Explain availability"}
          </button>
        </div>
        {explanationError && (
          <p className="mt-2 text-xs text-amber-700" role="alert">
            {explanationError}
          </p>
        )}
        {explanation && (
          <p className="mt-2 text-sm text-slate-600" aria-live="polite">
            {explanation}
          </p>
        )}
        {!explanation && !explanationError && (
          <p className="mt-2 text-xs text-slate-400">
            Generate a plain-language explanation from the confirmed result above. This uses a
            built-in mock — no data is sent anywhere.
          </p>
        )}
      </div>
    </div>
  );
}
