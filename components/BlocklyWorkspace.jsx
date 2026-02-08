// src/components/BlocklyWorkspace.jsx
import "blockly/blocks";
import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import * as En from "blockly/msg/en";
import { pythonGenerator } from "blockly/python";
import { useEffect, useRef } from "react";

// 1. IMPORT YOUR NEW JAVA GENERATOR
import { javaGenerator } from "../generators/java";

Blockly.setLocale(En);

export default function BlocklyWorkspace({ onChange }) {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    if (!workspace.current) {
      // ... (Your existing toolboxConfig stays exactly the same) ...
      const toolboxConfig = { /* ... keep your existing toolbox ... */ };

      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxConfig,
        trashcan: true,
        zoom: { controls: true, wheel: true },
      });

      // 2. ENABLE THE JAVA GENERATOR
      // This initializes the variable DB and standard functions
      javaGenerator.init(workspace.current);

      workspace.current.addChangeListener((event) => {
        if (
          event.type === Blockly.Events.BLOCK_CREATE ||
          event.type === Blockly.Events.BLOCK_DELETE ||
          event.type === Blockly.Events.BLOCK_MOVE ||
          event.type === Blockly.Events.BLOCK_CHANGE
        ) {
          const json = Blockly.serialization.workspaces.save(workspace.current);
          
          // Generate all 3 languages
          const js = javascriptGenerator.workspaceToCode(workspace.current);
          const py = pythonGenerator.workspaceToCode(workspace.current);
          
          // 3. GENERATE JAVA
          const java = javaGenerator.workspaceToCode(workspace.current);
          
          // Pass all 3 back to App.jsx
          onChange(json, js, py, java);
        }
      });
    }

    return () => {
      if (workspace.current) {
        workspace.current.dispose();
        workspace.current = null;
      }
    };
  }, [onChange]); // End useEffect

  return (
    <div
      ref={blocklyDiv}
      style={{ height: "600px", width: "100%", border: "1px solid #ccc" }}
    />
  );
}