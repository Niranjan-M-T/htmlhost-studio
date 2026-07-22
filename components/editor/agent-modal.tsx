'use client';

import React, { useState } from 'react';
import { Bot, X, Copy, Check, Terminal, Globe, Code2, Key } from 'lucide-react';

interface AgentModalProps {
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentModal({ projectId, isOpen, onClose }: AgentModalProps) {
  const [activeTab, setActiveTab] = useState<'mcp' | 'rest'>('mcp');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const mcpUrl = `${origin}/api/mcp`;
  const restUploadUrl = `${origin}/api/projects`;
  const restFileUrl = projectId ? `${origin}/api/projects/${projectId}/file` : `${origin}/api/projects/{projectId}/file`;
  const apiKey = 'studio_agent_sec_8849204829';

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        'htmlhost-studio': {
          command: 'node',
          args: ['C:/Users/niran/OneDrive/Desktop/Projects/Presentations/bin/mcp-server.js'],
        },
      },
    },
    null,
    2
  );

  const curlUploadExample = `curl -X POST "${restUploadUrl}" \\
  -H "X-API-Key: ${apiKey}" \\
  -F "name=My Agent Webpage" \\
  -F "files=@index.html"`;

  const restUpdateExample = `curl -X PUT "${restFileUrl}" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "path": "index.html",
    "content": "<html><body><h1>Updated by AI Agent</h1></body></html>"
  }'`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">AI Agent Integration Studio</h3>
              <p className="text-xs text-slate-400">Connect Claude, Antigravity, Cursor, or custom LLM scripts directly</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('mcp')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'mcp'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" /> Native MCP Protocol (Claude / Antigravity)
          </button>

          <button
            onClick={() => setActiveTab('rest')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'rest'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" /> REST API Endpoints
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Agent API Key Display Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" /> AI Agent Secret Security Key (<code className="text-amber-300">AGENT_API_KEY</code>)
            </h4>
            <p className="text-slate-400 text-[11px]">
              Pass this key in request headers as <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300">X-API-Key</code> or <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300">Authorization: Bearer</code> to authenticate AI agents automatically.
            </p>
            <div className="relative rounded-lg bg-slate-900 p-2.5 border border-slate-800 font-mono text-amber-300 flex items-center justify-between">
              <span>{apiKey}</span>
              <button
                onClick={() => copyToClipboard(apiKey, 0)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {copiedIndex === 0 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {activeTab === 'mcp' ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  1. HTTP JSON-RPC MCP Server Endpoint
                </h4>
                <p className="text-slate-400">
                  AI agents can send MCP tool requests via HTTP POST to this endpoint:
                </p>
                <div className="relative rounded-xl bg-slate-950 p-3 border border-slate-800 font-mono text-indigo-300 flex items-center justify-between">
                  <span>{mcpUrl}</span>
                  <button
                    onClick={() => copyToClipboard(mcpUrl, 1)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  2. Claude Desktop Config (<code className="text-indigo-300">claude_desktop_config.json</code>)
                </h4>
                <p className="text-slate-400">
                  Add this block to your Claude Desktop config to give Claude direct access to host, inspect, and debug your HTML files:
                </p>
                <div className="relative rounded-xl bg-slate-950 p-3 border border-slate-800 font-mono text-slate-300 overflow-x-auto">
                  <button
                    onClick={() => copyToClipboard(claudeDesktopConfig, 2)}
                    className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre>{claudeDesktopConfig}</pre>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" /> Available Agent Tools:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-indigo-200/90 text-[11px]">
                  <li><code className="bg-indigo-950 px-1 py-0.5 rounded">upload_html_project</code>: Upload HTML string or folder files</li>
                  <li><code className="bg-indigo-950 px-1 py-0.5 rounded">list_projects</code>: Retrieve all active shareable links</li>
                  <li><code className="bg-indigo-950 px-1 py-0.5 rounded">read_project_file</code>: Read HTML, CSS, JS source code</li>
                  <li><code className="bg-indigo-950 px-1 py-0.5 rounded">update_project_file</code>: Patch/edit HTML/CSS code directly</li>
                  <li><code className="bg-indigo-950 px-1 py-0.5 rounded">autofix_asset_paths</code>: Automatically fix relative asset paths</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 text-sm">Upload Project via cURL / HTTP</h4>
                <div className="relative rounded-xl bg-slate-950 p-3 border border-slate-800 font-mono text-slate-300 overflow-x-auto">
                  <button
                    onClick={() => copyToClipboard(curlUploadExample, 3)}
                    className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre>{curlUploadExample}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 text-sm">Edit HTML File Remotely</h4>
                <div className="relative rounded-xl bg-slate-950 p-3 border border-slate-800 font-mono text-slate-300 overflow-x-auto">
                  <button
                    onClick={() => copyToClipboard(restUpdateExample, 4)}
                    className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {copiedIndex === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre>{restUpdateExample}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
