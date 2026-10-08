import React from 'react';
import { downloadProjectZip } from '../utils/zipExporter';

export default function ProjectHeader({
  currentProject,
  status,
  followUpPrompt,
  setFollowUpPrompt,
  continueProject,
  markAsCompleted,
  fileTree
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* En-tête du projet actif */}
      <div className="active-project-header">
        <h2 style={{ margin: 0, fontSize: '18px', color: '#f1f5f9' }}>
          📦 Projet actif : {currentProject?.name}
        </h2>
        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {currentProject?.description || 'Aucune description'}
        </p>
      </div>

      {/* Zone de texte d'instructions complémentaires */}
      <div className="instruction-box">
        <label className="instruction-label">
          ✏️ Instructions / Modifications complémentaires pour les Agents :
        </label>
        <textarea
          rows="2"
          className="form-input form-textarea"
          placeholder="Ex: Ajoute un fichier index.html avec une interface graphique HTML/CSS pour jouer directement dans le navigateur..."
          value={followUpPrompt}
          onChange={(e) => setFollowUpPrompt(e.target.value)}
        />
      </div>

      {/* Barre de boutons d'action */}
      <div className="action-bar">
        <button
          onClick={continueProject}
          className="btn btn-blue"
          disabled={status === 'RUNNING'}
          style={{ opacity: status === 'RUNNING' ? 0.6 : 1, flex: 1 }}
        >
          {status === 'RUNNING' ? '🔄 Exécution en cours...' : '🚀 Relancer / Déployer la Crew'}
        </button>

        <button
          onClick={() => downloadProjectZip(fileTree, currentProject?.name)}
          className="btn btn-huge-green"
          style={{ flex: 1.2 }}
        >
          📥 TÉLÉCHARGER LE PROJET (.ZIP)
        </button>

        {status === 'FINISH' && (
          <button
            onClick={markAsCompleted}
            className="btn btn-primary"
            style={{ backgroundColor: '#10b981' }}
          >
            ✅ Terminer (COMPLETED)
          </button>
        )}
      </div>
    </div>
  );
}