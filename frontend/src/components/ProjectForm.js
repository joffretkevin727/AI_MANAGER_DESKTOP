import React from 'react';

export default function ProjectForm({ name, setName, desc, setDesc, createProject }) {
  return (
    <div className="project-form">
      <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#a5b4fc' }}>
        ✨ Créer un nouveau projet
      </h3>
      <input
        type="text"
        placeholder="Nom de l'application..."
        className="form-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Spécifiez votre besoin technique de zéro..."
        rows="3"
        className="form-input form-textarea"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <button onClick={createProject} className="btn btn-primary">
        ➕ Initialiser le Projet
      </button>
    </div>
  );
}