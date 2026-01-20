// CodeRunner.jsx
import { useState } from "react";

export default function CodeRunner({ code, language }) {
  const [output, setOutput] = useState("");

  const handleRun = () => {
    try {
      if (language === "javascript") {
        const oldConsoleLog = console.log;
        let logs = [];
        console.log = (...args) => logs.push(args.join(" "));
        eval(code);
        console.log = oldConsoleLog;
        setOutput(logs.join("\n") || "Code ran successfully!");
      } else if (language === "python") {
        setOutput("// Python execution not implemented yet");
      } else {
        setOutput("// Java execution not implemented yet");
      }
    } catch (err) {
      setOutput(err.toString());
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", width: "400px" }}>
      <div style={{ marginBottom: "5px" }}>
        <button onClick={handleRun}>Run</button>
      </div>
      <textarea style={{ width: "100%", height: "200px", fontFamily: "monospace" }} value={code} readOnly />
      <div style={{ marginTop: "10px", background: "#f4f4f4", padding: "5px", minHeight: "50px" }}>
        <strong>Output:</strong>
        <pre>{output}</pre>
      </div>
    </div>
  );
}
