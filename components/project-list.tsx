'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Code2,
  Trash2,
  Copy,
  Check,
  Wrench,
  AlertTriangle,
  FileText,
  Clock,
} from 'lucide-react';
import { ProjectMetadata } from '@/lib/storage';

interface ProjectListProps {
  projects: ProjectMetadata[];
  onDeleteProject: (id: string) => void;
  onRefresh: () => void;
}

export function ProjectList({ projects, onDeleteProject }: ProjectListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyShareableLink = (id: string, entryFile: string) => {
    const origin = window.location.origin;
    const url = `${origin}/view/${id}/${entryFile}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (projects.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 text-center border border-slate-800 rounded-2xl bg-slate-900/30 backdrop-blur-md">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="text-lg font-medium text-slate-300">No Projects Hosted Yet</h4>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          Upload an HTML file, folder, or ZIP archive above to generate your first shareable link.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          Hosted HTML Applications <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">{projects.length}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const shareUrl = `${origin}/view/${proj.id}/${proj.entryFile}`;

          return (
            <div
              key={proj.id}
              className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 p-5 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-slate-100 text-base truncate group-hover:text-indigo-400 transition-colors">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <code className="bg-slate-800/80 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700/50">
                        {proj.entryFile}
                      </code>
                    </p>
                  </div>

                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 my-3 text-xs">
                  <span className="px-2 py-1 rounded-md bg-slate-800/60 text-slate-300 border border-slate-700/40">
                    {proj.fileCount} files ({formatSize(proj.totalSizeBytes)})
                  </span>

                  {proj.repairedPathsCount > 0 && (
                    <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                      <Wrench className="w-3 h-3" /> {proj.repairedPathsCount} Paths Fixed
                    </span>
                  )}

                  {proj.missingAssets && proj.missingAssets.length > 0 && (
                    <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {proj.missingAssets.length} Missing
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyShareableLink(proj.id, proj.entryFile)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                    title="Copy Shareable URL"
                  >
                    {copiedId === proj.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Link
                      </>
                    )}
                  </button>

                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium flex items-center gap-1 transition-colors border border-indigo-500/30"
                    title="Open live preview in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <Link
                  href={`/project/${proj.id}`}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Code2 className="w-3.5 h-3.5" /> Workspace & Editor
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
