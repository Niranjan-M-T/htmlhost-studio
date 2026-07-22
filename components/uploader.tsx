'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileCode, FolderArchive, Sparkles, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface UploaderProps {
  onUploadSuccess: (project: any) => void;
}

export function Uploader({ onUploadSuccess }: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedInfo, setUploadedInfo] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.files;
    if (!items || items.length === 0) return;

    // Check if it's a zip file
    if (items.length === 1 && items[0].name.endsWith('.zip')) {
      await processZipUpload(items[0]);
    } else {
      await processFilesUpload(Array.from(items));
    }
  };

  const processZipUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadedInfo(null);

    try {
      const formData = new FormData();
      formData.append('zip', file);
      formData.append('name', file.name.replace(/\.zip$/i, ''));

      const res = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedInfo(data);
      onUploadSuccess(data.project);
    } catch (err: any) {
      setError(err.message || 'Error processing ZIP file');
    } finally {
      setIsUploading(false);
    }
  };

  const processFilesUpload = async (files: File[]) => {
    setIsUploading(true);
    setError(null);
    setUploadedInfo(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));

      const firstHtml = files.find((f) => f.name.endsWith('.html'));
      const projName = firstHtml ? firstHtml.name.replace(/\.html$/i, '') : 'HTML Project';
      formData.append('name', projName);

      const res = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedInfo(data);
      onUploadSuccess(data.project);
    } catch (err: any) {
      setError(err.message || 'Error uploading files');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 backdrop-blur-xl ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-900/80'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".html,.htm,.zip"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              if (e.target.files[0].name.endsWith('.zip')) {
                processZipUpload(e.target.files[0]);
              } else {
                processFilesUpload(Array.from(e.target.files));
              }
            }
          }}
        />

        <input
          type="file"
          ref={folderInputRef}
          className="hidden"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFilesUpload(Array.from(e.target.files));
            }
          }}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            <p className="text-lg font-medium text-slate-200">Processing HTML & Repairing Asset Paths...</p>
            <p className="text-xs text-slate-400">Parsing DOM structure, checking references & detecting main HTML</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Upload className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-100">
                Drop your HTML file, folder, or ZIP archive here
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Auto-detects main <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded">index.html</code>, fixes broken asset paths, and creates shareable permalinks.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <FileCode className="w-4 h-4" /> Select HTML / ZIP File
              </button>

              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 flex items-center gap-2 transition-all hover:scale-105"
              >
                <FolderArchive className="w-4 h-4" /> Upload Folder
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {uploadedInfo && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-emerald-300 text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-200">
                Uploaded {uploadedInfo.project.name} successfully!
              </p>
              <p className="text-xs text-emerald-400/80">
                Entry file: <code className="bg-emerald-950/60 px-1 py-0.5 rounded">{uploadedInfo.project.entryFile}</code> | {uploadedInfo.project.repairedPathsCount} asset paths auto-repaired
              </p>
            </div>
          </div>

          <a
            href={uploadedInfo.shareableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" /> Open Shareable Link
          </a>
        </div>
      )}
    </div>
  );
}
