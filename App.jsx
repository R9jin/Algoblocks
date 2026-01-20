// src/Algoblocks/App.jsx
import { useState } from "react";
import BlocklyWorkspace from "./components/BlocklyWorkspace.jsx";
import ComplexityPanel from "./components/ComplexityPanel.jsx";
import { buildAST } from "./logic/astBuilder.js";
import { analyzeLineByLine } from "./logic/complexityEngine.js";

export default function App() {
  const [lineComplexity, setLineComplexity] = useState([]);

  const handleBlocklyChange = (workspaceJson) => {
    try {
      const ast = buildAST(workspaceJson);
      const complexity = analyzeLineByLine(ast);
      setLineComplexity(complexity);
    } catch (error) {
      console.error("Analysis Error:", error);
    }
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', padding: "20px" }}>
      {/* Centered Thesis Title Section */}
      <header style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '1.8rem', marginBottom: '10px' }}>
          AlgoBlocks: An Interactive System for Learning Algorithms Using Line-by-Line Complexity Feedback
        </h1>
        <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
          A Prototype for Pamantasan ng Cabuyao Computer Science Department
        </p>
      </header>

      {/* Main Interactive UI Layout */}
      <main style={{ display: "flex", justifyContent: "center", gap: "30px", alignItems: "flex-start" }}>
        <div style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ background: '#34495e', color: 'white', padding: '10px', fontWeight: 'bold' }}>
            Logic Workspace
          </div>
          <BlocklyWorkspace onChange={handleBlocklyChange} />
        </div>

        <div style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden', minWidth: '350px' }}>
          <div style={{ background: '#27ae60', color: 'white', padding: '10px', fontWeight: 'bold' }}>
            Complexity Analysis
          </div>
          <ComplexityPanel lineComplexity={lineComplexity} />
        </div>
      </main>
    </div>
  );
}