import {
  getAllProjects,
  getProject,
  getProjectTree,
  readProjectFile,
  saveProjectFile,
  saveProjectMetadata,
  getAllProjectFilePaths,
  deleteProjectStorage,
  ProjectMetadata,
} from '@/lib/storage';
import { detectEntryHtml } from '@/lib/entry-detector';
import { repairHtmlAssetPaths } from '@/lib/path-fixer';

export const mcpToolSchemas = [
  {
    name: 'list_projects',
    description: 'List all uploaded static HTML projects hosted on the server with shareable URLs.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'upload_html_project',
    description: 'Upload or create a new HTML project. Accept single HTML content or key-value dictionary of files.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the project' },
        entryHtmlContent: {
          type: 'string',
          description: 'Single index.html content (if creating single file HTML project)',
        },
        files: {
          type: 'object',
          description: 'Dictionary of relative file paths to text file contents (e.g. {"index.html": "...", "css/style.css": "..."})',
          additionalProperties: { type: 'string' },
        },
      },
    },
  },
  {
    name: 'get_project_tree',
    description: 'Get file structure, entry file, missing assets, and shareable link for a project.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'read_project_file',
    description: 'Read the text content of a file within a project.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        filePath: { type: 'string', description: 'Relative file path (e.g. "index.html" or "style.css")' },
      },
      required: ['projectId', 'filePath'],
    },
  },
  {
    name: 'update_project_file',
    description: 'Update or create a file in a project and re-verify asset path linking.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        filePath: { type: 'string', description: 'Relative file path' },
        content: { type: 'string', description: 'New text content for the file' },
      },
      required: ['projectId', 'filePath', 'content'],
    },
  },
  {
    name: 'autofix_asset_paths',
    description: 'Run automated asset path repair algorithm on project HTML files to fix broken relative paths.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'get_shareable_url',
    description: 'Get the public permalink URL for a hosted project.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        baseUrl: { type: 'string', description: 'Server base URL (optional)' },
      },
      required: ['projectId'],
    },
  },
];

export async function executeMcpTool(name: string, args: any, originUrl: string) {
  const baseUrl = args?.baseUrl || originUrl || 'http://localhost:3000';

  switch (name) {
    case 'list_projects': {
      const map = getAllProjects();
      const list = Object.values(map).map((p) => ({
        ...p,
        shareableUrl: `${baseUrl}/view/${p.id}/${p.entryFile}`,
      }));
      return { projects: list };
    }

    case 'upload_html_project': {
      const projName = args.name || 'Agent Created Project';
      const projectId = 'proj_' + Math.random().toString(36).substring(2, 9);
      let totalBytes = 0;
      let fileCount = 0;

      if (args.files && Object.keys(args.files).length > 0) {
        for (const [relPath, contentStr] of Object.entries(args.files)) {
          const buf = Buffer.from(contentStr as string, 'utf-8');
          saveProjectFile(projectId, relPath, buf);
          totalBytes += buf.length;
          fileCount++;
        }
      } else if (args.entryHtmlContent) {
        const buf = Buffer.from(args.entryHtmlContent, 'utf-8');
        saveProjectFile(projectId, 'index.html', buf);
        totalBytes += buf.length;
        fileCount = 1;
      } else {
        throw new Error('Either entryHtmlContent or files dictionary must be provided');
      }

      const allFiles = getAllProjectFilePaths(projectId);
      const entryFile = detectEntryHtml(allFiles);

      let missingAssets: string[] = [];
      let repairedPathsCount = 0;

      const readRes = readProjectFile(projectId, entryFile);
      if (readRes && typeof readRes.content === 'string') {
        const repairRes = repairHtmlAssetPaths(readRes.content, entryFile, allFiles);
        if (repairRes.repairedCount > 0) {
          saveProjectFile(projectId, entryFile, repairRes.repairedHtml);
        }
        missingAssets = repairRes.missingAssets;
        repairedPathsCount = repairRes.repairedCount;
      }

      const now = new Date().toISOString();
      const metadata: ProjectMetadata = {
        id: projectId,
        name: projName,
        entryFile,
        createdAt: now,
        updatedAt: now,
        fileCount,
        totalSizeBytes: totalBytes,
        missingAssets,
        repairedPathsCount,
      };

      saveProjectMetadata(metadata);
      const shareableUrl = `${baseUrl}/view/${projectId}/${entryFile}`;

      return {
        success: true,
        project: metadata,
        shareableUrl,
      };
    }

    case 'get_project_tree': {
      const project = getProject(args.projectId);
      if (!project) throw new Error(`Project not found: ${args.projectId}`);
      const tree = getProjectTree(args.projectId);
      return {
        project,
        tree,
        shareableUrl: `${baseUrl}/view/${project.id}/${project.entryFile}`,
      };
    }

    case 'read_project_file': {
      const res = readProjectFile(args.projectId, args.filePath);
      if (!res) throw new Error(`File not found: ${args.filePath}`);
      return {
        path: args.filePath,
        content: typeof res.content === 'string' ? res.content : res.content.toString('utf-8'),
        mimeType: res.mimeType,
      };
    }

    case 'update_project_file': {
      const project = getProject(args.projectId);
      if (!project) throw new Error(`Project not found: ${args.projectId}`);

      saveProjectFile(args.projectId, args.filePath, args.content);
      const allFiles = getAllProjectFilePaths(args.projectId);

      let missingAssets = project.missingAssets;
      if (args.filePath === project.entryFile || args.filePath.endsWith('.html')) {
        const readRes = readProjectFile(args.projectId, project.entryFile);
        if (readRes && typeof readRes.content === 'string') {
          const repairRes = repairHtmlAssetPaths(readRes.content, project.entryFile, allFiles);
          missingAssets = repairRes.missingAssets;
        }
      }

      const updated = {
        ...project,
        updatedAt: new Date().toISOString(),
        fileCount: allFiles.length,
        missingAssets,
      };
      saveProjectMetadata(updated);

      return {
        success: true,
        message: 'File updated',
        project: updated,
        shareableUrl: `${baseUrl}/view/${project.id}/${project.entryFile}`,
      };
    }

    case 'autofix_asset_paths': {
      const project = getProject(args.projectId);
      if (!project) throw new Error(`Project not found: ${args.projectId}`);

      const allFiles = getAllProjectFilePaths(args.projectId);
      const readRes = readProjectFile(args.projectId, project.entryFile);

      if (!readRes || typeof readRes.content !== 'string') {
        throw new Error('Entry HTML file could not be read');
      }

      const repairRes = repairHtmlAssetPaths(readRes.content, project.entryFile, allFiles);
      if (repairRes.repairedCount > 0) {
        saveProjectFile(args.projectId, project.entryFile, repairRes.repairedHtml);
      }

      const updated = {
        ...project,
        updatedAt: new Date().toISOString(),
        missingAssets: repairRes.missingAssets,
        repairedPathsCount: project.repairedPathsCount + repairRes.repairedCount,
      };
      saveProjectMetadata(updated);

      return {
        success: true,
        repairedCount: repairRes.repairedCount,
        repairs: repairRes.repairs,
        missingAssets: repairRes.missingAssets,
        shareableUrl: `${baseUrl}/view/${project.id}/${project.entryFile}`,
      };
    }

    case 'get_shareable_url': {
      const project = getProject(args.projectId);
      if (!project) throw new Error(`Project not found: ${args.projectId}`);
      return {
        projectId: project.id,
        entryFile: project.entryFile,
        shareableUrl: `${baseUrl}/view/${project.id}/${project.entryFile}`,
      };
    }

    default:
      throw new Error(`Unknown MCP tool: ${name}`);
  }
}
