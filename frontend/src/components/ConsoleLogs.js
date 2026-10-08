import React from 'react';

export default function ConsoleLogs({ logs, terminalEndRef }) {
  return (
    <div className="console-box">
      <div className="console-header">📺 STREAMING CONSOLE LOGS (LIVE) :</div>
      <div className="console-logs">
        {logs.map((log, index) => (
          <div key={index} style={{ whiteSpace: 'pre-wrap' }}>
            {log}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}