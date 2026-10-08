import React from 'react';

export default function CodeViewer({ selectedFile }) {
  if (!selectedFile) {
    return (
      <div className="code-viewer">
        <div className="code-viewer-header">Aucun fichier sélectionné</div>
        <div className="empty-code-notice">Sélectionnez un fichier pour voir son contenu.</div>
      </div>
    );
  }

  const lines = (selectedFile.content || '').split('\n');

  return (
    <div className="code-viewer">
      <div className="code-viewer-header">
        <span>📄 {selectedFile.path}</span>
      </div>
      {/* Conteneur unique avec overflow auto pour éviter le décalage */}
      <div className="code-editor-layout" style={{ overflow: 'auto', maxHeight: '600px' }}>
        <div className="line-numbers">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="code-content" style={{ margin: 0 }}>
          <code>{selectedFile.content}</code>
        </pre>
      </div>
    </div>
  );
}