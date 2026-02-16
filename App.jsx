// src/App.jsx
import { useState } from "react";
import BlocklyWorkspace from "./components/BlocklyWorkspace.jsx";
import { buildAST } from "./logic/astBuilder";
import { analyzeLineByLine } from "./logic/complexityEngine";

export default function App() {
  const [analysisResult, setAnalysisResult] = useState({ lines: [], total: "O(1)" });
  const [generatedPython, setGeneratedPython] = useState("# Drag blocks to generate Python code");

  const handleBlocklyChange = (json, pythonCode) => {
    setGeneratedPython(pythonCode);
    const ast = buildAST(json);
    const report = analyzeLineByLine(ast);
    setAnalysisResult(report);
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <h1>AlgoBlocks</h1>
        <div className="complexity-badge">
          Total Complexity: <strong>{analysisResult.total}</strong>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="main-content">
        
        {/* LEFT: WORKSPACE */}
        <div className="workspace-panel">
          <BlocklyWorkspace onChange={handleBlocklyChange} />
        </div>

        {/* RIGHT: INFO PANEL */}
        <div className="info-panel">
          
          {/* TOP RIGHT: ANALYSIS */}
          <div className="analysis-section">
            <h3>Time Complexity</h3>
            <table>
              <thead>
                <tr>
                  <th>Logic</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {analysisResult.lines.map((row, i) => (
                  <tr key={i} style={{ color: row.color }}>
                    <td style={{ paddingLeft: `${row.indent * 15 + 5}px` }}>
                      {row.lineOfCode}
                    </td>
                    <td>{row.complexity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BOTTOM RIGHT: CODE OUTPUT */}
          <div className="code-section">
            <h3>Generated Python</h3>
            <pre>{generatedPython}</pre>
          </div>

        </div>
      </div>
    </div>
  );
}