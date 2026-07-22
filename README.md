# HTMLHost Studio & AI Agent Engine 🚀

A modern, self-hosted web application for uploading single HTML files or full project folders (ZIP archives), featuring **auto-detection** of main HTML entry points, **intelligent asset path repair**, **shareable permalinks**, an in-browser **live code workspace**, and **native MCP & REST API integration** for AI agents like Claude, Antigravity, and Cursor.

Designed for instant deployment on **Coolify** or any Docker server.

---

## ✨ Features

- **Multi-File & Folder Upload**: Upload `.html` files, folder drops, or `.zip` archives containing images, CSS, JS, and font assets.
- **Smart Entry Auto-Detector**: Automatically detects main entry points (`index.html`, root html, `dist/index.html`, `build/index.html`, etc.).
- **Intelligent Asset Path Repair**: Scans HTML DOM & CSS for hardcoded absolute local paths (`file:///C:/...`), mismatched relative depths, or leading slashes, and fixes relative paths automatically.
- **Instant Shareable Permalinks**: Public static serving URLs (`/view/{projectId}/index.html`) with proper MIME types.
- **Interactive Live Code Workspace**: Real-time split view with code editor and responsive live HTML preview (Desktop / Tablet / Mobile).
- **Native AI Agent Integration**: Built-in MCP (Model Context Protocol) Server endpoint (`/api/mcp`) & REST API (`/api/projects`) allowing AI agents (Claude, Antigravity) to upload, inspect, debug, and edit HTML files live.
- **Coolify & Docker Ready**: Optimized multi-stage `Dockerfile` and `docker-compose.yml` with persistent volume support (`/app/data`).

---

## 🛠️ Deploying on Coolify

1. Open your **Coolify Dashboard**.
2. Click **+ New Resource** -> **Public Repository** or **Private Repository**.
3. Select this repository branch.
4. Coolify will auto-detect the `Dockerfile` or `docker-compose.yml`.
5. Under **Storage / Persistent Volumes**, map container path `/app/data` to a persistent volume (e.g. `htmlhost_data`).
6. Click **Deploy**. Your application will be live with full static hosting and agent API capabilities!

---

## 🤖 Connecting AI Agents (Claude & Antigravity)

### Option 1: Native HTTP MCP Endpoint (Recommended)
Point your AI agent to the MCP endpoint:
`https://your-coolify-domain.com/api/mcp`

### Option 2: Claude Desktop Config (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "htmlhost-studio": {
      "command": "node",
      "args": ["/path/to/htmlhost-studio/bin/mcp-server.js"]
    }
  }
}
```

### Available MCP Agent Tools:
- `upload_html_project`: Upload raw HTML string or folder files.
- `list_projects`: List all hosted sites & shareable URLs.
- `get_project_tree`: Inspect file structure & missing asset report.
- `read_project_file`: Fetch HTML, CSS, JS source code.
- `update_project_file`: Edit or patch HTML code live.
- `autofix_asset_paths`: Programmatically run asset path repair.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.
