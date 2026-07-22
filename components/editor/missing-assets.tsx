'use client';

import React, { useState } from 'react';
import { AlertTriangle, Wrench, CheckCircle2, RefreshCw } from 'lucide-react';

interface MissingAssetsProps {
  projectId: string;
  missingAssets: string[];
  repairedPathsCount: number;
  onAutofixComplete: () => void;
}

export function MissingAssetsPanel({
  projectId,
  missingAssets,
  repairedPathsCount,
  onAutofixComplete,
}: MissingAssetsProps) {
  const [isFixing, setIsFixing] = useState(false);
  const [repairMessage, setRepairMessage] = useState<string | null>(null);

  const handleRunAutofix = async () => {
    setIsFixing(true);
    setRepairMessage(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/autofix`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setRepairMessage(
          data.repairedCount > 0
            ? `Auto-repaired ${data.repairedCount} asset path(s)!`
            : 'All asset paths are fully repaired and linked.'
        );
        onAutofixComplete();
      } else {
        setRepairMessage('Failed to auto-fix: ' + data.error);
      }
    } catch (err: any) {
      setRepairMessage('Error running auto-fix: ' + err.message);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-indigo-400" /> Path Repair Diagnostic
        </h4>

        <button
          onClick={handleRunAutofix}
          disabled={isFixing}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFixing ? 'animate-spin' : ''}`} /> Run Auto-Fix
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {repairedPathsCount} Paths Auto-Fixed
        </span>

        <span
          className={`px-2 py-1 rounded border flex items-center gap-1 ${
            missingAssets.length > 0
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" /> {missingAssets.length} Unresolved Links
        </span>
      </div>

      {repairMessage && (
        <p className="text-xs text-indigo-300 bg-indigo-950/60 p-2 rounded border border-indigo-500/30">
          {repairMessage}
        </p>
      )}

      {missingAssets.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-[11px] text-amber-300/80 font-medium">Missing file references detected:</p>
          <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
            {missingAssets.map((asset, idx) => (
              <div
                key={idx}
                className="text-[11px] font-mono text-amber-200 bg-amber-950/40 px-2 py-1 rounded border border-amber-500/20 truncate"
                title={asset}
              >
                {asset}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
