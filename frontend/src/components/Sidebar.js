import React from 'react';

const getBadgeClass = (projStatus) => {
  if (projStatus === 'COMPLETED') return 'status-badge completed';
  if (projStatus === 'RUNNING') return 'status-badge running';
  if (projStatus === 'FAILED') return 'status-badge failed';
  return 'status-badge idle';
};

export default function Sidebar({ projectsList, projectId, selectProject, startNewProject }) {
  return (
    <div className="sidebar">
      <div className="new-project-btn-card" onClick={startNewProject}>
        <div className="plus-icon-box">+</div>
        <span className="new-project-text">Nouveau Projet</span>
      </div>

      <h3 className="sidebar-title">📁 Historique des Projets</h3>
      <div className="project-list">
        {projectsList.map((p) => (
          <div
            key={p.id}
            onClick={() => selectProject(p)}
            className={`project-card ${projectId === p.id ? 'active' : ''}`}
          >
            <strong className="project-card-name" title={p.name}>{p.name}</strong>
            <span className={getBadgeClass(p.status)}>{p.status}</span>
          </div>
        ))}
        {projectsList.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
            Aucun projet.
          </p>
        )}
      </div>
    </div>
  );
}