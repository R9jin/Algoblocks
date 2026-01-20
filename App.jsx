import { useState } from "react";
import BlocklyWorkspace from "./components/BlocklyWorkspace.jsx";
import CodeRunner from "./components/CodeRunner.jsx";
import ComplexityPanel from "./components/ComplexityPanel.jsx";
import { buildAST } from "./logic/astBuilder.js";
import { analyzeLineByLine } from "./logic/complexityEngine.js";

export default function App() {
  const [lineComplexity, setLineComplexity] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [language, setLanguage] = useState("javascript"); // <--- ADD THIS

  const handleBlocklyChange = (workspaceJson, code) => {
    const ast = buildAST(workspaceJson);
    const complexity = analyzeLineByLine(ast);
    setLineComplexity(complexity);
    setGeneratedCode(code);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2>AlgoBlocks: Interactive System for Learning Algorithms</h2>
        <p>Line-by-Line Complexity & Code Execution Prototype</p>
      </header>

      {/* optional: let user select language */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "40px" }}>
        <BlocklyWorkspace language={language} onChange={handleBlocklyChange} />
        <CodeRunner code={generatedCode} language={language} />
        <ComplexityPanel lineComplexity={lineComplexity} />
      </div>
    </div>
  );
}
