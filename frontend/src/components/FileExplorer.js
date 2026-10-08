import React from 'react';
import { playSound } from '../utils/audio';

export default function FileExplorer({ fileTree, selectedFile, setSelectedFile, setActiveTab }) {
  const RenderTree = ({ node, currentPath = "" }) => {
    return (
      <ul className="file-tree-list">
        {Object.entries(node).map(([key, val]) => {
          const fullPath = currentPath ? `${currentPath}/${key}` : key;
          if (val.type === 'dir') {
            return (
              <li key={fullPath} className="tree-dir">
                <span className="dir-label">📁 {key}</span>
                <RenderTree node={val.children} currentPath={fullPath} />
              </li>
            );
          } else {
            const isSelected = selectedFile && selectedFile.path === fullPath;
            return (
              <li
                key={fullPath}
                className={`tree-file ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  playSound('click');
                  setSelectedFile({ name: key, path: fullPath, content: val.content });
                  setActiveTab('code');
                }}
              >
                📄 {key}
              </li>
            );
          }
        })}
      </ul>
    );
  };

  return (
    <div className="explorer-sidebar">
      <div className="explorer-title">📂 Fichiers du Projet</div>
      <div className="explorer-tree">
        <RenderTree node={fileTree} />
      </div>
    </div>
  );
}