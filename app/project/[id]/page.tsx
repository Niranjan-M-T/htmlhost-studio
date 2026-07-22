'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Save,
  Copy,
  Check,
  Bot,
  RefreshCcw,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  FileCode,
} from 'lucide-react';
import { FileTree } from '@/components/editor/file-tree';
import { MissingAssetsPanel } from '@/components/editor/missing-assets';
import { AgentModal } from '@/components/editor/agent-modal';
import { ProjectMetadata, FileNode } from '@/lib/storage';

export default function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [project, setProject] = useState<ProjectMetadata | null>(null);
  const [tree, setTree] = useState<FileNode[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [iframeKey, setIframeKey] = useState(0);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const [copiedLink, setCopiedLink] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        setTree(data.tree);

        // Auto-select entry HTML file if no file selected yet
        if (!activeFilePath) {
          setActiveFilePath(data.project.entryFile);
          loadFileContent(data.project.entryFile);
        }
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const loadFileContent = async (filePath: string) => {
    setIsLoadingFile(true);
    try {
      const res = await fetch(`/api/projects/${id}/file?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (data.success) {
        setFileContent(data.content);
      }
    } catch (err) {
      console.error('Failed to load file content:', err);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleSelectFile = (filePath: string) => {
    setActiveFilePath(filePath);
    loadFileContent(filePath);
  };

  const handleSaveFile = async () => {
    if (!activeFilePath) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/projects/${id}/file`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: activeFilePath,
          content: fileContent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        setProject(data.project);
        setIframeKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to save file:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareableLink = () => {
    if (!project) return;
    const origin = window.location.origin;
    const url = `${origin}/view/${project.id}/${project.entryFile}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400 animate-pulse text-sm">Loading Project Workspace...</p>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareableUrl = `${origin}/view/${project.id}/${project.entryFile}`;

  const getDeviceWidth = () => {
    if (deviceMode === 'mobile') return 'max-w-[375px]';
    if (deviceMode === 'tablet') return 'max-w-[768px]';
    return 'w-full';
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Top Action Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              {project.name}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {project.entryFile}
              </span>
            </h2>
          </div>
        </div>

        {/* Shareable Link & Agent buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyShareableLink}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            {copiedLink ? 'Copied!' : 'Copy Shareable Link'}
          </button>

          <a
            href={shareableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview Tab
          </a>

          <button
            onClick={() => setIsAgentModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Bot className="w-4 h-4" /> AI Agent Endpoint
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (File Tree & Missing Assets) */}
        <aside className="w-72 border-r border-slate-800 bg-slate-900/60 p-3 flex flex-col justify-between overflow-y-auto space-y-4 flex-shrink-0">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" /> Project Files
            </h3>

            <FileTree
              nodes={tree}
              activeFilePath={activeFilePath}
              entryFile={project.entryFile}
              missingAssets={project.missingAssets || []}
              onSelectFile={handleSelectFile}
            />
          </div>

          <MissingAssetsPanel
            projectId={project.id}
            missingAssets={project.missingAssets || []}
            repairedPathsCount={project.repairedPathsCount || 0}
            onAutofixComplete={fetchProjectDetails}
          />
        </aside>

        {/* Center Code Editor */}
        <main className="flex-1 flex flex-col border-r border-slate-800 bg-slate-950 overflow-hidden">
          {/* File Header Bar */}
          <div className="h-10 border-b border-slate-800 bg-slate-900/50 px-4 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">
              {activeFilePath || 'Select a file'}
            </span>

            {activeFilePath && (
              <button
                onClick={handleSaveFile}
                disabled={isSaving}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save & Refresh'}
              </button>
            )}
          </div>

          {/* Editor Textarea */}
          <div className="flex-1 relative">
            {isLoadingFile ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-xs text-slate-400">
                Loading file content...
              </div>
            ) : (
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full h-full p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-indigo-500 selection:text-white"
                placeholder="Select a file to edit code..."
                spellCheck={false}
              />
            )}
          </div>
        </main>

        {/* Right Iframe Previewer */}
        <section className="w-1/2 flex flex-col bg-slate-900/30 overflow-hidden">
          {/* Iframe Control Bar */}
          <div className="h-10 border-b border-slate-800 bg-slate-900/80 px-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Live HTML Preview
            </span>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`p-1 rounded ${deviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode('tablet')}
                  className={`p-1 rounded ${deviceMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Tablet View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`p-1 rounded ${deviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setIframeKey((prev) => prev + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Reload Preview"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Iframe View Container */}
          <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto">
            <div className={`h-full bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${getDeviceWidth()}`}>
              <iframe
                key={iframeKey}
                src={shareableUrl}
                className="w-full h-full border-none"
                title="Live HTML Preview"
              />
            </div>
          </div>
        </section>
      </div>

      <AgentModal
        projectId={project.id}
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
      />
    </div>
  );
}
