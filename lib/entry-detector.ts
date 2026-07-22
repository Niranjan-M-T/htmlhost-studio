export function detectEntryHtml(filePaths: string[]): string {
  if (!filePaths || filePaths.length === 0) {
    return 'index.html';
  }

  const normalized = filePaths.map((p) => p.replace(/\\/g, '/'));

  // 1. Root index.html or index.htm
  const rootIndex = normalized.find((p) => p === 'index.html' || p === 'index.htm');
  if (rootIndex) return rootIndex;

  // 2. Any root level HTML file
  const rootHtml = normalized.find((p) => !p.includes('/') && (p.endsWith('.html') || p.endsWith('.htm')));
  if (rootHtml) return rootHtml;

  // 3. Known build output / subfolder index.html (dist/index.html, build/index.html, etc.)
  const priorityFolders = ['dist', 'build', 'public', 'out', 'site', 'docs'];
  for (const folder of priorityFolders) {
    const target = `${folder}/index.html`;
    const found = normalized.find((p) => p.toLowerCase() === target);
    if (found) return found;
  }

  // 4. Any index.html anywhere in tree
  const nestedIndex = normalized.find((p) => p.endsWith('/index.html') || p.endsWith('/index.htm'));
  if (nestedIndex) return nestedIndex;

  // 5. First HTML file discovered anywhere
  const firstHtml = normalized.find((p) => p.endsWith('.html') || p.endsWith('.htm'));
  if (firstHtml) return firstHtml;

  // Fallback
  return 'index.html';
}
