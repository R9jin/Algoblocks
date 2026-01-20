import { useState } from "react";
import BlocklyWorkspace from "./components/BlocklyWorkspace.jsx";
import ComplexityPanel from "./components/ComplexityPanel.jsx";
import { buildAST } from "./logic/astBuilder.js";
import { analyzeLineByLine } from "./logic/complexityEngine.js";

export default function App() {
  const [lineComplexity, setLineComplexity] = useState([]);
  const [code, setCode] = useState("");

  const handleBlocklyChange = (json, jsCode) => {
    setCode(jsCode);
    const ast = buildAST(json);
    const complexity = analyzeLineByLine(ast);
    setLineComplexity(complexity);
  };

  return (
    <div style={{ padding: "10px", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <header style={{ textAlign: "center", padding: "20px", background: "white", borderRadius: "8px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h2 style={{ margin: 0, color: "#1a73e8" }}>AlgoBlocks</h2>
        <p style={{ margin: "5px 0 0", color: "#5f6368", fontSize: "14px" }}>
          Interactive Algorithm Learning System
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "20px", maxWidth: "1600px", margin: "0 auto" }}>
        {/* Left Side: Workspace and Code Preview */}
        <div>
          <div style={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <BlocklyWorkspace onChange={handleBlocklyChange} />
          </div>
          <div style={{ marginTop: "20px", padding: "15px", background: "#202124", color: "#e8eaed", borderRadius: "8px", minHeight: "150px" }}>
            <h4 style={{ margin: "0 0 10px", color: "#8ab4f8" }}>Generated JavaScript</h4>
            <pre style={{ margin: 0, fontSize: "13px", fontFamily: "monospace" }}>{code || "// Add blocks to generate code"}</pre>
          </div>
        </div>

        {/* Right Side: Complexity Feedback */}
        <div style={{ backgroundColor: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>Complexity Feedback</h3>
          <ComplexityPanel lineComplexity={lineComplexity} />
        </div>
      </div>
    </div>
  );
}