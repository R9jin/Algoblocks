// src/App.jsx
import { useState } from "react";
import Split from "react-split"; // <--- IMPORT THIS
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

  const runCode = () => {
    setConsoleOutput("> Running...");
    if (!window.Sk) {
      setConsoleOutput("Error: Python engine (Skulpt) not loaded. Check index.html");
      return;
    }

    let outputBuffer = "";
    function outf(text) { outputBuffer += text; }
    function builtinRead(x) {
      if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][x] === undefined)
          throw "File not found: '" + x + "'";
      return window.Sk.builtinFiles["files"][x];
    }

    window.Sk.pre = "output";
    window.Sk.configure({ output: outf, read: builtinRead });

    const myPromise = window.Sk.misceval.asyncToPromise(function() {
        return window.Sk.importMainWithBody("<stdin>", false, generatedPython, true);
    });

    myPromise.then(function() {
        setConsoleOutput(outputBuffer + "\n> Program finished.");
    }, function(err) {
        setConsoleOutput(outputBuffer + "\n> Error: " + err.toString());
    });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AlgoBlocks</h1>
        <div className="complexity-badge">
          Total Complexity: <strong>{analysisResult.total}</strong>
        </div>
      </header>

      {/* --- MAIN SPLIT (Horizontal) --- */}
      <Split 
        className="main-content" 
        sizes={[70, 30]} // Default: 70% Left, 30% Right
        minSize={300}    // Minimum width in pixels
        gutterSize={10} 
        snapOffset={30}
      >
        
        {/* --- LEFT COLUMN (Vertical Split) --- */}
        <Split 
          className="left-column" 
          direction="vertical" 
          sizes={[70, 30]} 
          minSize={100}
        >
          <div className="workspace-area">
            <BlocklyWorkspace onChange={handleBlocklyChange} />
          </div>
          
          <div className="code-area">
            <div className="panel-header">Generated Python</div>
            <pre>{generatedPython}</pre>
          </div>
        </Split>

        {/* --- RIGHT COLUMN (Vertical Split) --- */}
        <Split 
          className="right-column" 
          direction="vertical" 
          sizes={[50, 50]} 
          minSize={100}
        >
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

          <div className="console-area">
            <div className="panel-header console-header">
              <span>Console</span>
              <button className="run-button" onClick={runCode}>▶ RUN</button>
            </div>
            <pre className="console-output">{consoleOutput}</pre>
          </div>
        </Split>

      </Split>
    </div>
  );
}