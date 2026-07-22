import fs from 'fs';
import path from 'path';

export interface ProjectMetadata {
  id: string;
  name: string;
  entryFile: string;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
  totalSizeBytes: number;
  missingAssets: string[];
  repairedPathsCount: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const METADATA_FILE = path.join(DATA_DIR, 'projects.json');

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(METADATA_FILE)) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
}

export function getAllProjects(): Record<string, ProjectMetadata> {
  ensureDirectories();
  try {
    const raw = fs.readFileSync(METADATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getProject(id: string): ProjectMetadata | null {
  const projects = getAllProjects();
  return projects[id] || null;
}

export function saveProjectMetadata(metadata: ProjectMetadata): void {
  ensureDirectories();
  const projects = getAllProjects();
  projects[metadata.id] = metadata;
  fs.writeFileSync(METADATA_FILE, JSON.stringify(projects, null, 2), 'utf-8');
}

export function deleteProjectStorage(id: string): boolean {
  ensureDirectories();
  const projects = getAllProjects();
  if (projects[id]) {
    delete projects[id];
    fs.writeFileSync(METADATA_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  }

  const projPath = path.join(PROJECTS_DIR, id);
  if (fs.existsSync(projPath)) {
    fs.rmSync(projPath, { recursive: true, force: true });
    return true;
  }
  return false;
}

export function getProjectDirPath(id: string): string {
  ensureDirectories();
  return path.join(PROJECTS_DIR, id);
}

export function saveProjectFile(id: string, relativePath: string, content: string | Buffer): void {
  const projDir = getProjectDirPath(id);
  const fullPath = path.join(projDir, relativePath);
  const parentDir = path.dirname(fullPath);

  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  fs.writeFileSync(fullPath, content);
}

export function readProjectFile(id: string, relativePath: string): { content: string | Buffer; mimeType: string } | null {
  const projDir = getProjectDirPath(id);
  const fullPath = path.join(projDir, relativePath);

  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    return null;
  }

  const ext = path.extname(relativePath).toLowerCase();
  const isText = ['.html', '.htm', '.css', '.js', '.json', '.svg', '.txt', '.md', '.xml'].includes(ext);

  if (isText) {
    return {
      content: fs.readFileSync(fullPath, 'utf-8'),
      mimeType: getMimeType(ext),
    };
  }

  return {
    content: fs.readFileSync(fullPath),
    mimeType: getMimeType(ext),
  };
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
}

export function getProjectTree(id: string, currentRelPath = ''): FileNode[] {
  const projDir = getProjectDirPath(id);
  const targetDir = path.join(projDir, currentRelPath);

  if (!fs.existsSync(targetDir)) return [];

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries) {
    const relPath = currentRelPath ? `${currentRelPath}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        path: relPath,
        type: 'directory',
        children: getProjectTree(id, relPath),
      });
    } else {
      const stats = fs.statSync(path.join(targetDir, entry.name));
      nodes.push({
        name: entry.name,
        path: relPath,
        type: 'file',
        size: stats.size,
      });
    }
  }

  return nodes.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });
}

export function getAllProjectFilePaths(id: string): string[] {
  const tree = getProjectTree(id);
  const files: string[] = [];

  function collect(nodes: FileNode[]) {
    for (const node of nodes) {
      if (node.type === 'file') {
        files.push(node.path);
      } else if (node.children) {
        collect(node.children);
      }
    }
  }

  collect(tree);
  return files;
}

export function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
  };
  return map[ext] || 'application/octet-stream';
}
