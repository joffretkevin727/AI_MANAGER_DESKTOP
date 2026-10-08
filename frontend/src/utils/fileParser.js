export const parseProjectFiles = (rawText, projectName, existingTree = null) => {
  const rootName = projectName || 'projet_ia';

  if (!rawText || !rawText.trim()) {
    if (existingTree) return existingTree;
    return createTree({
      'README.md': `# ${rootName}\n\nEn attente de génération par l'équipe d'agents IA...`
    }, rootName);
  }

  let newFiles = {};

  // --- STRATÉGIE 1 (PRIORITAIRE & SUR) : Delimiteurs FILE_START / FILE_END ---
  const delimiterRegex = /FILE_START:\s*([a-zA-Z0-9_\-\.\/]+)\n([\s\S]*?)FILE_END/gi;
  let match;

  while ((match = delimiterRegex.exec(rawText)) !== null) {
    const filePath = match[1].trim().replace(/`/g, '').replace(/\\/g, '/');
    let content = match[2].trim();

    // Si le contenu a été emballé dans un bloc ```lang ... ``` par sécurité, on retire la première et dernière ligne
    if (content.startsWith('```')) {
      content = content.replace(/^```[a-zA-Z0-9_-]*\n/, '').replace(/\n```$/, '');
    }

    if (filePath) {
      newFiles[filePath] = content;
    }
  }

  // --- STRATÉGIE 2 (FALLBACK) : Marqueurs Markdown classiques (### File: ...) ---
  if (Object.keys(newFiles).length === 0) {
    const fileMarkerRegex = /(?:^|\n)(?:###?\s*(?:File:\s*)?|File:\s*|\*\*File:\*\*|\/\/\s*File:\s*)([a-zA-Z0-9_\-\.\/]+)/gi;
    const matches = [...rawText.matchAll(fileMarkerRegex)];

    for (let i = 0; i < matches.length; i++) {
      const filePath = matches[i][1].trim().replace(/`/g, '').replace(/\\/g, '/');
      const startIndex = matches[i].index + matches[i][0].length;
      const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : rawText.length;

      let blockContent = rawText.substring(startIndex, endIndex).trim();
      blockContent = blockContent.replace(/^```[a-zA-Z0-9_-]*\n/, '').replace(/\n```\s*$/, '');

      if (filePath) {
        newFiles[filePath] = blockContent;
      }
    }
  }

  // --- STRATÉGIE 3 (FALLBACK) : JSON brut ---
  if (Object.keys(newFiles).length === 0) {
    const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || rawText.match(/^[\s]*(\{[\s\S]*\})[\s]*$/);
    if (jsonMatch) {
      try {
        const parsedJson = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        Object.entries(parsedJson).forEach(([path, content]) => {
          newFiles[path] = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);
        });
      } catch (e) {}
    }
  }

  // --- FUSION (MERGE) AVEC LES FICHIERS EXISTANTS ---
  let combinedFiles = {};
  if (existingTree && existingTree[rootName]) {
    combinedFiles = flattenTree(existingTree[rootName].children);
  }

  // Les nouveaux fichiers / modifiés écrasent ou s'ajoutent aux anciens
  Object.assign(combinedFiles, newFiles);

  if (Object.keys(combinedFiles).length === 0) {
    combinedFiles['README.md'] = rawText;
  }

  return createTree(combinedFiles, rootName);
};

// Helper : Convertit un arbre de répertoires en dictionnaire plat
const flattenTree = (children, currentPath = "") => {
  let files = {};
  Object.entries(children).forEach(([key, val]) => {
    const fullPath = currentPath ? `${currentPath}/${key}` : key;
    if (val.type === 'file') {
      files[fullPath] = val.content;
    } else if (val.type === 'dir') {
      Object.assign(files, flattenTree(val.children, fullPath));
    }
  });
  return files;
};

// Helper : Construit l'arbre de fichiers JSON
const createTree = (filesMap, rootName) => {
  const tree = {
    [rootName]: {
      type: 'dir',
      children: {}
    }
  };

  Object.entries(filesMap).forEach(([pathStr, content]) => {
    const parts = pathStr.split('/').filter(Boolean);
    let current = tree[rootName].children;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = { type: 'file', content };
      } else {
        if (!current[part] || current[part].type !== 'dir') {
          current[part] = { type: 'dir', children: {} };
        }
        current = current[part].children;
      }
    });
  });

  return tree;
};