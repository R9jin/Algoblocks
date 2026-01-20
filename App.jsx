import { useState } from "react";
import BlocklyWorkspace from "./components/BlocklyWorkspace.jsx";
import ComplexityPanel from "./components/ComplexityPanel.jsx";
import { buildAST } from "./logic/astBuilder.js";
import { analyzeLineByLine } from "./logic/complexityEngine.js";

export default function App() {
  const [lineComplexity, setLineComplexity] = useState([]);
  const [generatedJS, setGeneratedJS] = useState("");
  const [generatedPy, setGeneratedPy] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript"); // Track toggle state

  const handleBlocklyChange = (json, jsCode, pyCode) => {
    // Store both generated strings
    setGeneratedJS(jsCode);
    setGeneratedPy(pyCode);

    const ast = buildAST(json);
    const complexity = analyzeLineByLine(ast);
    setLineComplexity(complexity);
  };

  return (
    <div style={{ padding: "20px" }}>
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1>AlgoBlocks</h1>
      </header>
      
      <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        <div style={{ width: "800px" }}>
          <BlocklyWorkspace onChange={handleBlocklyChange} />
          
          {/* Toggle Button / Select Option Section */}
          <div style={{ marginTop: "20px", padding: "15px", background: "#202124", color: "white", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <strong style={{ color: "#8ab4f8" }}>Generated Code Output</strong>
              
              {/* The Select Option Button */}
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{ padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
            </div>

            {/* Display code based on the toggle state */}
            <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "13px" }}>
              {selectedLanguage === "javascript" ? generatedJS : generatedPy || "// Add blocks to see code"}
            </pre>
          </div>
        </div>
        
        <ComplexityPanel lineComplexity={lineComplexity} />
      </div>
    </div>
  );
}