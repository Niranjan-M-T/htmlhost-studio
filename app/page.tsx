'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Uploader } from '@/components/uploader';
import { ProjectList } from '@/components/project-list';
import { AgentModal } from '@/components/editor/agent-modal';
import { Bot, Sparkles, Server, ShieldCheck, Layers, LogOut, User } from 'lucide-react';
import { ProjectMetadata } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated) {
        setCurrentUserEmail(data.user.email);
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
    }
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchProjects();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-100 text-lg tracking-tight flex items-center gap-2">
                HTMLHost Studio <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">SECURE AGENT ENGINE</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUserEmail && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
                <User className="w-3.5 h-3.5 text-indigo-400" /> {currentUserEmail}
              </span>
            )}

            <button
              onClick={() => setIsAgentModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-2 transition-all shadow-md"
            >
              <Bot className="w-4 h-4 text-indigo-400" /> Connect AI Agents (MCP)
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Self-Hosted Static HTML Hosting & Secure Agent Engine
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Instant Static HTML Hosting with Auto-Asset Path Repair
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Upload HTML files or full folder ZIPs. Auto-detects main entry point, repairs missing or hardcoded relative paths, and enables authenticated AI Agents to upload, edit, and debug live.
          </p>
        </div>

        {/* Drag & Drop Uploader */}
        <Uploader onUploadSuccess={fetchProjects} />

        {/* Project Grid List */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-sm">Loading hosted projects...</div>
        ) : (
          <ProjectList
            projects={projects}
            onDeleteProject={handleDeleteProject}
            onRefresh={fetchProjects}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
          <p className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400" /> Ready for Coolify & Docker Deployment
          </p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Encrypted Session Authentication & API Key Shield
          </p>
        </div>
      </footer>

      {/* AI Agent Connection Guide Modal */}
      <AgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
      />
    </div>
  );
}
