// src/App.jsx
import { useState } from "react";
import BlocklyWorkspace from "./components/BlocklyWorkspace.jsx";
// ... other imports

export default function App() {
  const [lineComplexity, setLineComplexity] = useState([]);
  
  // 1. ADD STATE FOR JAVA
  const [generatedJS, setGeneratedJS] = useState("");
  const [generatedPy, setGeneratedPy] = useState("");
  const [generatedJava, setGeneratedJava] = useState(""); 
  
  const [selectedLanguage, setSelectedLanguage] = useState("java"); // Default to Java?

  // 2. ACCEPT JAVA CODE FROM CHILD
  const handleBlocklyChange = (json, jsCode, pyCode, javaCode) => {
    setGeneratedJS(jsCode);
    setGeneratedPy(pyCode);
    setGeneratedJava(javaCode); // Store it

    // Your complexity logic (assuming it runs on JSON)
    // const ast = buildAST(json);
    // const complexity = analyzeLineByLine(ast);
    // setLineComplexity(complexity);
  };

  // 3. HELPER TO PICK WHICH CODE TO SHOW
  const getCodeToDisplay = () => {
    switch (selectedLanguage) {
      case "javascript": return generatedJS;
      case "python": return generatedPy;
      case "java": return generatedJava;
      default: return "// Select a language";
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1>AlgoBlocks</h1>
      </header>
      
      <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        <div style={{ width: "800px" }}>
          <BlocklyWorkspace onChange={handleBlocklyChange} />
          
          <div style={{ marginTop: "20px", padding: "15px", background: "#202124", color: "white", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <strong style={{ color: "#8ab4f8" }}>Generated Code Output</strong>
              
              {/* 4. ADD JAVA OPTION */}
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{ padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
              >
                <option value="java">Java (CS Thesis)</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
            </div>

            <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "13px" }}>
              {getCodeToDisplay() || "// Add blocks to see code"}
            </pre>
          </div>
        </div>
        
        {/* <ComplexityPanel ... /> */}
      </div>
    </div>
  );
}