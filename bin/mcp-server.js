#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Ensure module alias or storage resolution works relative to root directory
const rootDir = path.join(__dirname, '..');
process.chdir(rootDir);

const DATA_DIR = path.join(rootDir, 'data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const METADATA_FILE = path.join(DATA_DIR, 'projects.json');

function getAllProjects() {
  try {
    if (!fs.existsSync(METADATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveProjectMetadata(meta) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const all = getAllProjects();
  all[meta.id] = meta;
  fs.writeFileSync(METADATA_FILE, JSON.stringify(all, null, 2), 'utf-8');
}

function saveProjectFile(id, relPath, content) {
  const fullPath = path.join(PROJECTS_DIR, id, relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
}

const tools = [
  {
    name: 'list_projects',
    description: 'List all hosted HTML sites in HTMLHost Studio with shareable links.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'upload_html_project',
    description: 'Create a new project from raw HTML string or a dictionary of files.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        entryHtmlContent: { type: 'string' },
        files: { type: 'object', additionalProperties: { type: 'string' } },
        baseUrl: { type: 'string' },
      },
    },
  },
  {
    name: 'read_project_file',
    description: 'Read the contents of any file in a project.',
    inputSchema: {
      type: 'object',
      properties: { projectId: { type: 'string' }, filePath: { type: 'string' } },
      required: ['projectId', 'filePath'],
    },
  },
  {
    name: 'update_project_file',
    description: 'Write/edit a file in a project live.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string' },
        filePath: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['projectId', 'filePath', 'content'],
    },
  },
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    const { jsonrpc, id, method, params } = request;

    if (method === 'initialize') {
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'htmlhost-studio-mcp-stdio', version: '1.0.0' },
      });
      return;
    }

    if (method === 'tools/list') {
      sendResponse(id, { tools });
      return;
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      const baseUrl = args.baseUrl || 'http://localhost:3000';

      if (name === 'list_projects') {
        const all = getAllProjects();
        const list = Object.values(all).map((p) => ({
          ...p,
          shareableUrl: `${baseUrl}/view/${p.id}/${p.entryFile}`,
        }));
        sendToolSuccess(id, { projects: list });
        return;
      }

      if (name === 'upload_html_project') {
        const projectId = 'proj_' + Math.random().toString(36).substring(2, 9);
        const nameInput = args.name || 'CLI Agent Project';

        if (args.files) {
          for (const [p, c] of Object.entries(args.files)) {
            saveProjectFile(projectId, p, c);
          }
        } else if (args.entryHtmlContent) {
          saveProjectFile(projectId, 'index.html', args.entryHtmlContent);
        }

        const now = new Date().toISOString();
        const meta = {
          id: projectId,
          name: nameInput,
          entryFile: 'index.html',
          createdAt: now,
          updatedAt: now,
          fileCount: args.files ? Object.keys(args.files).length : 1,
          totalSizeBytes: 1024,
          missingAssets: [],
          repairedPathsCount: 0,
        };
        saveProjectMetadata(meta);

        sendToolSuccess(id, {
          success: true,
          project: meta,
          shareableUrl: `${baseUrl}/view/${projectId}/index.html`,
        });
        return;
      }

      if (name === 'read_project_file') {
        const fullPath = path.join(PROJECTS_DIR, args.projectId, args.filePath);
        if (!fs.existsSync(fullPath)) {
          sendError(id, -32603, `File not found: ${args.filePath}`);
          return;
        }
        const content = fs.readFileSync(fullPath, 'utf-8');
        sendToolSuccess(id, { path: args.filePath, content });
        return;
      }

      if (name === 'update_project_file') {
        saveProjectFile(args.projectId, args.filePath, args.content);
        sendToolSuccess(id, {
          success: true,
          message: 'File updated',
          shareableUrl: `${baseUrl}/view/${args.projectId}/index.html`,
        });
        return;
      }

      sendError(id, -32601, `Unknown tool: ${name}`);
    }
  } catch (err) {
    // Ignore invalid JSON lines
  }
});

function sendResponse(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function sendToolSuccess(id, resultData) {
  sendResponse(id, {
    content: [{ type: 'text', text: JSON.stringify(resultData, null, 2) }],
  });
}

function sendError(id, code, message) {
  process.stdout.write(
    JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n'
  );
}
