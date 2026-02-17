// src/App.jsx
import { useState } from "react";
import BlocklyWorkspace from "./components/BlocklyWorkspace.jsx";
import { buildAST } from "./logic/astBuilder";
import { analyzeLineByLine } from "./logic/complexityEngine";

export default function App() {
  const [analysisResult, setAnalysisResult] = useState({ lines: [], total: "O(1)" });
  const [generatedPython, setGeneratedPython] = useState("# Drag blocks to generate Python code");
  const [consoleOutput, setConsoleOutput] = useState("Ready to run...");

  const handleBlocklyChange = (json, pythonCode) => {
    setGeneratedPython(pythonCode);
    const ast = buildAST(json);
    const report = analyzeLineByLine(ast);
    setAnalysisResult(report);
  };

  // --- REAL PYTHON EXECUTION ---
  const runCode = () => {
    // 1. Clear Console
    setConsoleOutput("> Running...");
    
    // 2. Check if Skulpt is loaded
    if (!window.Sk) {
      setConsoleOutput("Error: Python engine (Skulpt) not loaded. Check index.html");
      return;
    }

    // 3. Configure Output Capture
    let outputBuffer = ""; // Store print outputs here
    
    function outf(text) {
      outputBuffer += text;
    }

    function builtinRead(x) {
      if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][x] === undefined)
          throw "File not found: '" + x + "'";
      return window.Sk.builtinFiles["files"][x];
    }

    // 4. Configure Skulpt
    window.Sk.pre = "output";
    window.Sk.configure({ output: outf, read: builtinRead });

    // 5. Run the Code (Async)
    const prog = generatedPython;
    
    const myPromise = window.Sk.misceval.asyncToPromise(function() {
        return window.Sk.importMainWithBody("<stdin>", false, prog, true);
    });

    myPromise.then(function() {
        // Success: Update Console with the captured buffer
        setConsoleOutput(outputBuffer + "\n> Program finished.");
    }, function(err) {
        // Error: Show Python error
        setConsoleOutput(outputBuffer + "\n> Error: " + err.toString());
    });
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

      {/* MAIN CONTENT ROW */}
      <div className="main-content">
        
        {/* --- LEFT COLUMN (Workspace + Code) --- */}
        <div className="left-column">
          
          {/* Top: Blockly */}
          <div className="workspace-area">
            <BlocklyWorkspace onChange={handleBlocklyChange} />
          </div>

          {/* Bottom: Generated Code */}
          <div className="code-area">
            <div className="panel-header">Generated Python</div>
            <pre>{generatedPython}</pre>
          </div>
        </div>

        {/* --- RIGHT COLUMN (Complexity + Console) --- */}
        <div className="right-column">
          
          {/* Top: Complexity Table */}
          <div className="complexity-area">
            <div className="panel-header">Time Complexity</div>
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

          {/* Bottom: Console & Run Button */}
          <div className="console-area">
            <div className="panel-header console-header">
              <span>Console</span>
              <button className="run-button" onClick={runCode}>
                ▶ RUN
              </button>
            </div>
            <pre className="console-output">{consoleOutput}</pre>
          </div>

        </div>
      </div>
    </div>
  );
}