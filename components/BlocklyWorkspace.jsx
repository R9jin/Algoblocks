// src/Algoblocks/components/BlocklyWorkspace.jsx
import * as Blockly from "blockly";
import { useEffect, useRef } from "react";

export default function BlocklyWorkspace({ onChange }) {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    // Only initialize if it hasn't been already
    if (!workspace.current) {
      const toolbox = {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: "Logic",
            colour: "210",
            contents: [{ kind: "block", type: "controls_if" }]
          },
          {
            kind: "category",
            name: "Loops",
            colour: "120",
            contents: [{ kind: "block", type: "controls_for" }]
          },
          {
            kind: "category",
            name: "Variables",
            colour: "330",
            custom: "VARIABLE"
          }
        ]
      };

      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        trashcan: true,
        zoom: { controls: true, wheel: true }
      });

      workspace.current.addChangeListener(() => {
        const json = Blockly.serialization.workspaces.save(workspace.current);
        onChange(json);
      });
    }

    // Clean up on unmount
    return () => {
      if (workspace.current) {
        workspace.current.dispose();
      }
    };
  }, [onChange]); // Adding onChange as a dependency

  return (
    <div 
      ref={blocklyDiv} 
      style={{ height: "600px", width: "800px", border: "1px solid #ccc" }} 
    />
  );
}