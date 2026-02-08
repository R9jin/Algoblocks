import { useState } from "react";
import BlocklyWorkspace from "./components/BlocklyWorkspace.jsx"; // Check this path!
// ... other imports

export default function App() {
  const [lineComplexity, setLineComplexity] = useState([]);
  
  // 1. GENERATED CODE STATES
  const [generatedJS, setGeneratedJS] = useState("");
  const [generatedPy, setGeneratedPy] = useState("");
  const [generatedJava, setGeneratedJava] = useState(""); 
  
  // 2. UI STATE (Defaults to "java")
  const [selectedLanguage, setSelectedLanguage] = useState("java");

  const handleBlocklyChange = (json, jsCode, pyCode, javaCode) => {
    setGeneratedJS(jsCode);
    setGeneratedPy(pyCode);
    setGeneratedJava(javaCode); 
  };

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
          
          {/* --- THE FIX IS HERE --- */}
          {/* You MUST pass 'language={selectedLanguage}' so the toolbox switches! */}
          <BlocklyWorkspace 
            onChange={handleBlocklyChange} 
            language={selectedLanguage} 
          />
          {/* ----------------------- */}
          
          <div style={{ marginTop: "20px", padding: "15px", background: "#202124", color: "white", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <strong style={{ color: "#8ab4f8" }}>Generated Code Output</strong>
              
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{ padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
              >
                <option value="java">Java (Restricted)</option>
                <option value="javascript">JavaScript (Full)</option>
                <option value="python">Python (Full)</option>
              </select>
            </div>

            <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "13px" }}>
              {getCodeToDisplay() || "// Add blocks to see code"}
            </pre>
          </div>
        </div>
        
      </div>
    </div>
  );
}