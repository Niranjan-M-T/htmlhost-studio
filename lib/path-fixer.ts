import * as cheerio from 'cheerio';
import path from 'path';

export interface RepairResult {
  repairedHtml: string;
  repairedCount: number;
  missingAssets: string[];
  repairs: Array<{ original: string; fixed: string; tag: string; attr: string }>;
}

export function repairHtmlAssetPaths(
  htmlContent: string,
  entryFilePath: string,
  allProjectFiles: string[]
): RepairResult {
  const $ = cheerio.load(htmlContent);
  const normalizedProjectFiles = allProjectFiles.map((p) => p.replace(/\\/g, '/'));
  
  // The directory where entry HTML is located
  const entryDir = path.dirname(entryFilePath.replace(/\\/g, '/'));
  const isRootEntry = entryDir === '.' || entryDir === '';

  let repairedCount = 0;
  const missingAssetsSet = new Set<string>();
  const repairs: Array<{ original: string; fixed: string; tag: string; attr: string }> = [];

  // Helper to normalize and match path against available files
  function resolveTargetAsset(rawUrl: string): string | null {
    if (!rawUrl || rawUrl.trim() === '') return null;
    
    // Ignore external URLs, data URLs, anchors, mailto, etc.
    if (
      rawUrl.startsWith('http://') ||
      rawUrl.startsWith('https://') ||
      rawUrl.startsWith('//') ||
      rawUrl.startsWith('data:') ||
      rawUrl.startsWith('blob:') ||
      rawUrl.startsWith('javascript:') ||
      rawUrl.startsWith('#') ||
      rawUrl.startsWith('mailto:') ||
      rawUrl.startsWith('tel:')
    ) {
      return null;
    }

    let cleaned = rawUrl.trim();

    // 1. Strip file:/// or local C:\ drives
    cleaned = cleaned.replace(/^file:\/\/\/[a-zA-Z]:\//, '');
    cleaned = cleaned.replace(/^[a-zA-Z]:\\/, '');
    cleaned = cleaned.replace(/\\/g, '/');

    // 2. Remove query string / hash for path checking
    const queryIdx = cleaned.indexOf('?');
    const hashIdx = cleaned.indexOf('#');
    let pathOnly = cleaned;
    let suffix = '';

    if (queryIdx !== -1) {
      pathOnly = cleaned.substring(0, queryIdx);
      suffix = cleaned.substring(queryIdx);
    } else if (hashIdx !== -1) {
      pathOnly = cleaned.substring(0, hashIdx);
      suffix = cleaned.substring(hashIdx);
    }

    // Direct match check in project files
    if (normalizedProjectFiles.includes(pathOnly)) {
      return pathOnly + suffix;
    }

    // Strip leading slashes
    const noLeadingSlash = pathOnly.replace(/^\/+/, '');
    if (normalizedProjectFiles.includes(noLeadingSlash)) {
      return noLeadingSlash + suffix;
    }

    // Relative to entry HTML directory check
    const relToEntry = isRootEntry
      ? noLeadingSlash
      : path.posix.normalize(path.posix.join(entryDir, noLeadingSlash));
      
    if (normalizedProjectFiles.includes(relToEntry)) {
      return relToEntry + suffix;
    }

    // Fuzzy basename search across project files
    const baseName = path.basename(pathOnly).toLowerCase();
    if (baseName) {
      const match = normalizedProjectFiles.find(
        (f) => path.basename(f).toLowerCase() === baseName
      );
      if (match) {
        return match + suffix;
      }
    }

    // Asset not found in project tree
    missingAssetsSet.add(pathOnly);
    return null;
  }

  // Tags & attributes to inspect
  const selectors = [
    { tag: 'img', attr: 'src' },
    { tag: 'img', attr: 'srcset' },
    { tag: 'link[rel="stylesheet"]', attr: 'href' },
    { tag: 'link[rel="icon"]', attr: 'href' },
    { tag: 'link[rel="shortcut icon"]', attr: 'href' },
    { tag: 'link[rel="apple-touch-icon"]', attr: 'href' },
    { tag: 'script', attr: 'src' },
    { tag: 'source', attr: 'src' },
    { tag: 'source', attr: 'srcset' },
    { tag: 'video', attr: 'src' },
    { tag: 'audio', attr: 'src' },
    { tag: 'iframe', attr: 'src' },
    { tag: 'embed', attr: 'src' },
    { tag: 'object', attr: 'data' },
  ];

  for (const { tag, attr } of selectors) {
    $(tag).each((_, element) => {
      const $el = $(element);
      const val = $el.attr(attr);
      if (!val) return;

      const fixed = resolveTargetAsset(val);
      if (fixed && fixed !== val) {
        $el.attr(attr, fixed);
        repairedCount++;
        repairs.push({ original: val, fixed, tag, attr });
      }
    });
  }

  // Inspect inline style tags and style attributes for url(...)
  $('[style]').each((_, element) => {
    const $el = $(element);
    const styleVal = $el.attr('style');
    if (!styleVal) return;

    const fixedStyle = styleVal.replace(/url\(['"]?(.*?)['"]?\)/g, (match, url) => {
      const fixed = resolveTargetAsset(url);
      if (fixed && fixed !== url) {
        repairedCount++;
        repairs.push({ original: url, fixed, tag: 'inline-style', attr: 'style' });
        return `url('${fixed}')`;
      }
      return match;
    });

    if (fixedStyle !== styleVal) {
      $el.attr('style', fixedStyle);
    }
  });

  return {
    repairedHtml: $.html(),
    repairedCount,
    missingAssets: Array.from(missingAssetsSet),
    repairs,
  };
}
