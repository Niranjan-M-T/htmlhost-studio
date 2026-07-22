'use client';

import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, FileImage, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { FileNode } from '@/lib/storage';

interface FileTreeProps {
  nodes: FileNode[];
  activeFilePath: string | null;
  entryFile: string;
  missingAssets: string[];
  onSelectFile: (path: string) => void;
}

export function FileTree({
  nodes,
  activeFilePath,
  entryFile,
  missingAssets,
  onSelectFile,
}: FileTreeProps) {
  return (
    <div className="w-full space-y-0.5 font-mono text-xs select-none">
      {nodes.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          activeFilePath={activeFilePath}
          entryFile={entryFile}
          missingAssets={missingAssets}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}

function TreeItem({
  node,
  activeFilePath,
  entryFile,
  missingAssets,
  onSelectFile,
}: {
  node: FileNode;
  activeFilePath: string | null;
  entryFile: string;
  missingAssets: string[];
  onSelectFile: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const isDirectory = node.type === 'directory';
  const isActive = activeFilePath === node.path;
  const isEntry = node.path === entryFile;

  const getIcon = () => {
    if (isDirectory) {
      return isOpen ? (
        <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
      );
    }
    const ext = node.name.split('.').pop()?.toLowerCase();
    if (['html', 'htm'].includes(ext || '')) {
      return <FileCode className="w-4 h-4 text-indigo-400 flex-shrink-0" />;
    }
    if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(ext || '')) {
      return <FileImage className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />;
  };

  return (
    <div>
      <div
        onClick={() => {
          if (isDirectory) {
            setIsOpen(!isOpen);
          } else {
            onSelectFile(node.path);
          }
        }}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
          isActive
            ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-medium'
            : 'text-slate-300 hover:bg-slate-800/60'
        }`}
      >
        {isDirectory && (
          <span className="text-slate-500">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        )}

        {!isDirectory && <span className="w-3.5" />}

        {getIcon()}

        <span className="truncate flex-1">{node.name}</span>

        {isEntry && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            ENTRY
          </span>
        )}
      </div>

      {isDirectory && isOpen && node.children && (
        <div className="pl-4 border-l border-slate-800 ml-3.5 my-0.5">
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              activeFilePath={activeFilePath}
              entryFile={entryFile}
              missingAssets={missingAssets}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
