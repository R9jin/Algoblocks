import "blockly/blocks";
import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import * as En from "blockly/msg/en";
import { pythonGenerator } from "blockly/python";
import { useEffect, useRef } from "react";

Blockly.setLocale(En);

export default function BlocklyWorkspace({ onChange }) {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    // Only inject once
    if (!workspace.current && blocklyDiv.current) {
      const toolbox = {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: "Logic",
            colour: "210",
            contents: [
              { kind: "block", type: "controls_if" },
              { kind: "block", type: "logic_compare" },
              { kind: "block", type: "logic_operation" },
            ],
          },
          {
            kind: "category",
            name: "Loops",
            colour: "120",
            contents: [
              { kind: "block", type: "controls_for" },
              { kind: "block", type: "controls_whileUntil" },
            ],
          },
          {
            kind: "category",
            name: "Lists",
            colour: "260",
            contents: [
              { kind: "block", type: "lists_create_with" },
              { kind: "block", type: "lists_length" },
            ],
          },
          { kind: "category", name: "Variables", colour: "330", custom: "VARIABLE" },
          { kind: "category", name: "Functions", colour: "290", custom: "PROCEDURE" },
        ],
      };

      // Inject workspace after div is ready
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox,
        trashcan: true,
        zoom: { controls: true, wheel: true },
        collapse: true,
      });

      // Add listener after injection
      workspace.current.addChangeListener(() => {
        const json = Blockly.serialization.workspaces.save(workspace.current);
        const jsCode = javascriptGenerator.workspaceToCode(workspace.current);
        const pyCode = pythonGenerator.workspaceToCode(workspace.current);
        onChange(json, jsCode, pyCode);
      });
    }

    // Cleanup
    return () => {
      if (workspace.current) {
        workspace.current.dispose();
        workspace.current = null;
      }
    };
  }, [onChange]);

  return (
    <div
      ref={blocklyDiv}
      style={{
        height: "600px",
        width: "100%",
        border: "1px solid #ccc",
        overflow: "hidden",
      }}
    />
  );
}
