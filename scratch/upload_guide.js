const fs = require('fs');

const guideHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTMLHost Studio - AI Agent & MCP Integration Guide</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    code, pre { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white">

  <!-- Glow effect -->
  <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-violet-600/10 to-transparent blur-3xl pointer-events-none"></div>

  <!-- Header -->
  <header class="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 py-4">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        </div>
        <div>
          <h1 class="font-extrabold text-slate-100 text-xl tracking-tight">HTMLHost Studio</h1>
          <p class="text-xs text-indigo-400 font-medium">AI Agent & MCP Integration Hub</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> MCP Server Active
        </span>
      </div>
    </div>
  </header>

  <!-- Content Container -->
  <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
    
    <!-- Hero Banner -->
    <div class="text-center space-y-4 max-w-3xl mx-auto">
      <span class="px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
        Official Integration Guide
      </span>
      <h2 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
        Connect Your AI Agents to HTMLHost Studio
      </h2>
      <p class="text-slate-400 text-base leading-relaxed">
        Enable Claude, Antigravity, Cursor, ChatGPT, or custom LLM scripts to automatically upload, inspect, debug, and edit HTML sites with zero manual friction.
      </p>
    </div>

    <!-- Section 1: Connection Methods -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- MCP Server Card -->
      <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-100 text-lg">1. Native MCP Protocol</h3>
            <p class="text-xs text-slate-400">For Claude Desktop, Antigravity, & Cursor</p>
          </div>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          Full bi-directional Model Context Protocol server exposing tool capabilities to list hosted sites, upload ZIP archives, patch code, and repair broken relative paths.
        </p>
        <div class="space-y-1.5">
          <label class="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Live HTTP MCP Endpoint</label>
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300">
            https://ppt.hosting.studiohappens.tech/api/mcp
          </div>
        </div>
      </div>

      <!-- REST API Card -->
      <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-100 text-lg">2. REST API & Header Auth</h3>
            <p class="text-xs text-slate-400">For cURL, Python, & Custom Scripts</p>
          </div>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          Standard HTTP REST API accepting single HTML strings, FormData uploads, or JSON payloads with automatic entry point detection and permalink output.
        </p>
        <div class="space-y-1.5">
          <label class="text-[11px] font-bold text-violet-400 uppercase tracking-wider">Security Header</label>
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300">
            X-API-Key: studio_agent_sec_8849204829
          </div>
        </div>
      </div>

    </div>

    <!-- Section 2: Claude Desktop Setup -->
    <div class="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
      <h3 class="font-bold text-slate-100 text-xl flex items-center gap-2">
        <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
        Claude Desktop Integration (<code class="text-indigo-300 text-sm">claude_desktop_config.json</code>)
      </h3>
      <p class="text-xs text-slate-400">
        Add this configuration block to your Claude Desktop config file to grant Claude native tool access:
      </p>
      <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
        <pre>{
  "mcpServers": {
    "htmlhost-studio": {
      "command": "node",
      "args": [
        "C:/Users/niran/OneDrive/Desktop/Projects/Presentations/bin/mcp-server.js"
      ]
    }
  }
}</pre>
      </div>
    </div>

    <!-- Section 3: Universal System Prompt for ANY AI Agent -->
    <div class="p-8 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 backdrop-blur-xl space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <span class="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold">HIGHLY RECOMMENDED</span>
          <h3 class="font-bold text-slate-100 text-xl mt-1.5">Universal AI Agent System Prompt</h3>
        </div>
        <button onclick="navigator.clipboard.writeText(document.getElementById('agent-prompt').innerText); alert('System Prompt copied to clipboard!');" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5">
          Copy Prompt
        </button>
      </div>

      <p class="text-xs text-slate-300">
        Copy and paste this prompt into any AI Agent (ChatGPT, Claude, Gemini, DeepSeek, Cursor) that does not have local MCP configured:
      </p>

      <div id="agent-prompt" class="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-200/95 leading-relaxed whitespace-pre-wrap select-all">
You are an expert AI developer. Whenever you generate, modify, or debug HTML pages, web applications, or landing pages for me, you can immediately publish and test them live using my self-hosted HTMLHost Studio instance.

SERVER ENDPOINT: https://ppt.hosting.studiohappens.tech/api/projects
AGENT API KEY: studio_agent_sec_8849204829

INSTRUCTIONS FOR PUBLISHING HTML WEBPAGES:
1. To publish a new HTML page, send an HTTP POST request to https://ppt.hosting.studiohappens.tech/api/projects with the header "X-API-Key: studio_agent_sec_8849204829".
   - Include multipart form data "name" and "files" (or single index.html).
2. To modify an existing file live, send an HTTP PUT request to https://ppt.hosting.studiohappens.tech/api/projects/{projectId}/file with header "X-API-Key: studio_agent_sec_8849204829" and JSON payload {"path": "index.html", "content": "NEW_HTML_CONTENT"}.
3. Always return the generated public permalink URL (https://ppt.hosting.studiohappens.tech/view/{projectId}/index.html) to the user so they can view their live hosted website instantly!</div>
    </div>

    <!-- Section 4: cURL Quick Start -->
    <div class="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
      <h3 class="font-bold text-slate-100 text-xl">cURL Quick Start</h3>

      <div class="space-y-2">
        <label class="text-xs font-semibold text-slate-300">Upload single HTML file:</label>
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
          <pre>curl -X POST "https://ppt.hosting.studiohappens.tech/api/projects" \
  -H "X-API-Key: studio_agent_sec_8849204829" \
  -F "name=My HTML Webpage" \
  -F "files=@index.html"</pre>
        </div>
      </div>
    </div>

  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
    <p>HTMLHost Studio &bull; Powered by Cheerio DOM Engine & MCP Protocol</p>
  </footer>

</body>
</html>`;

async function uploadGuide() {
  const targetUrl = 'https://ppt.hosting.studiohappens.tech/api/mcp';
  const apiKey = 'studio_agent_live_7k2m9p4x8v3w1n5q6z0y';

  const mcpPayload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'upload_html_project',
      arguments: {
        name: 'HTMLHost Studio - AI Agent & MCP Integration Guide',
        baseUrl: 'https://ppt.hosting.studiohappens.tech',
        files: {
          'index.html': guideHtml
        }
      }
    }
  };

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify(mcpPayload)
  });

  const result = await response.json();
  console.log('Upload Result:', JSON.stringify(result, null, 2));
}

uploadGuide().catch(console.error);
