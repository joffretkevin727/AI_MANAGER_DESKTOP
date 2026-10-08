import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ProjectHeader from './components/ProjectHeader';
import ProjectForm from './components/ProjectForm';
import FileExplorer from './components/FileExplorer';
import CodeViewer from './components/CodeViewer';
import ConsoleLogs from './components/ConsoleLogs';
import { playSound } from './utils/audio';
import { parseProjectFiles } from './utils/fileParser';

function App() {
  const [projectsList, setProjectsList] = useState([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [status, setStatus] = useState('Aucun projet actif');
  const [finalResult, setFinalResult] = useState('');
  const [logs, setLogs] = useState([]);

  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('code');
  const [followUpPrompt, setFollowUpPrompt] = useState('');

  const terminalEndRef = useRef(null);

  // Charger la liste des projets au démarrage + connexion WebSocket
  useEffect(() => {
    fetchProjects();
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onmessage = (event) => {
      const msg = event.data;
      if (msg === "--- SYSTEM_EVENT: FINISH ---" || msg === "--- SYSTEM_EVENT: COMPLETED ---") {
        setStatus(msg.includes("COMPLETED") ? "COMPLETED" : "FINISH");
        playSound('success');
        setTimeout(() => { triggerAutoFetch(); }, 600);
      } else if (msg === "--- SYSTEM_EVENT: FAILED ---") {
        setStatus("FAILED");
      } else {
        setLogs((prev) => [...prev, msg]);
      }
    };
    return () => ws.close();
  }, [projectId]);

  // Parsing du résultat markdown en fichiers JSON
  useEffect(() => {
    const currentProj = projectsList.find(p => p.id === projectId);
    const pName = currentProj ? currentProj.name : 'projet_ia';
    const parsed = parseProjectFiles(finalResult, pName);
    setFileTree(parsed);

    if (parsed[pName]?.children['README.md']) {
      setSelectedFile({
        name: 'README.md',
        path: `${pName}/README.md`,
        content: parsed[pName].children['README.md'].content
      });
    }
  }, [finalResult, projectId, projectsList]);

  // Auto-scroll pour la console
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:8000/projects');
      setProjectsList(res.data);
    } catch (err) { console.error(err); }
  };

  const triggerAutoFetch = async () => {
    if (!projectId) return;
    try {
      const res = await axios.get(`http://localhost:8000/projects/${projectId}`);
      setFinalResult(res.data.result || '');
      fetchProjects();
    } catch (err) { console.error(err); }
  };

  const createProject = async () => {
    if (!name.trim()) return;
    playSound('click');
    try {
      const res = await axios.post('http://localhost:8000/projects', { name, description: desc });
      setProjectId(res.data.id);
      setStatus('IDLE');
      setFinalResult('');
      setLogs([]);
      setSelectedFile(null);
      setName('');
      setDesc('');
      fetchProjects();
    } catch (err) { console.error(err); }
  };

  const startNewProject = () => {
    playSound('click');
    setProjectId(null);
    setStatus('Aucun projet actif');
    setFinalResult('');
    setLogs([]);
    setName('');
    setDesc('');
    setSelectedFile(null);
    setFileTree({});
  };

  const selectProject = (project) => {
    playSound('click');
    setProjectId(project.id);
    setStatus(project.status);
    setFinalResult(project.result || '');
    setLogs([]);
  };

  const continueProject = async () => {
    if (status === 'RUNNING' || !projectId) return;
    playSound('click');
    try {
      const promptToSend = followUpPrompt.trim();
      setLogs((prev) => [...prev, `\n--- 🚀 Relancement : "${promptToSend || 'Consigne initiale'}" ---`]);
      await axios.post(`http://localhost:8000/projects/${projectId}/start`, { prompt: promptToSend });
      setStatus('RUNNING');
      setFollowUpPrompt('');
      setActiveTab('logs');
      fetchProjects();
    } catch (err) { console.error(err); }
  };

  const markAsCompleted = async () => {
    playSound('click');
    try {
      await axios.post(`http://localhost:8000/projects/${projectId}/complete`);
      setStatus('COMPLETED');
      fetchProjects();
    } catch (err) { console.error(err); }
  };

  const currentProject = projectsList.find(p => p.id === projectId);

  return (
    <div className="app-container">
      <Sidebar
        projectsList={projectsList}
        projectId={projectId}
        selectProject={selectProject}
        startNewProject={startNewProject}
      />

      <div className="workspace">
        <header className="workspace-header">
          <div>
            <h1 className="workspace-title">🤖 AI Agent Orchestrator</h1>
            <p className="workspace-subtitle">Conception autonome multi-agents en temps réel</p>
          </div>
          <span className="status-indicator">⚡ Status: {status}</span>
        </header>

        {projectId ? (
          <ProjectHeader
            currentProject={currentProject}
            status={status}
            followUpPrompt={followUpPrompt}
            setFollowUpPrompt={setFollowUpPrompt}
            continueProject={continueProject}
            markAsCompleted={markAsCompleted}
            fileTree={fileTree}
          />
        ) : (
          <ProjectForm
            name={name}
            setName={setName}
            desc={desc}
            setDesc={setDesc}
            createProject={createProject}
          />
        )}

        {projectId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            <div className="tab-navigation">
              <button
                className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTab('code')}
              >
                💻 Explorateur & Code Source
              </button>
              <button
                className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
                onClick={() => setActiveTab('logs')}
              >
                📺 Console Agents (Live)
              </button>
            </div>

            {activeTab === 'code' && (
              <div className="explorer-container">
                <FileExplorer
                  fileTree={fileTree}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  setActiveTab={setActiveTab}
                />
                <CodeViewer selectedFile={selectedFile} />
              </div>
            )}

            {activeTab === 'logs' && (
              <ConsoleLogs logs={logs} terminalEndRef={terminalEndRef} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;