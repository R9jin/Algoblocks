import { useState } from "react";
import BlocklyWorkspace from "./components/BlocklyWorkspace.jsx";
import ComplexityPanel from "./components/ComplexityPanel.jsx";
import { buildAST } from "./logic/astBuilder.js";
import { analyzeLineByLine } from "./logic/complexityEngine.js";

export default function App() {
  const [lineComplexity, setLineComplexity] = useState([]);

  const handleBlocklyChange = (workspaceJson) => {
    const ast = buildAST(workspaceJson);
    const complexity = analyzeLineByLine(ast);
    setLineComplexity(complexity);
  };

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      <BlocklyWorkspace onChange={handleBlocklyChange} />
      <ComplexityPanel lineComplexity={lineComplexity} />
    </div>
  );
}
