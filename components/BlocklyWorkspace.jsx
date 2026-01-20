import "blockly/blocks";
import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import * as En from "blockly/msg/en";
import { useEffect, useRef } from "react";

Blockly.setLocale(En);

export default function BlocklyWorkspace({ onChange }) {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    if (!workspace.current) {
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
              { kind: "block", type: "logic_negate" },
              { kind: "block", type: "logic_boolean" },
            ],
          },
          {
            kind: "category",
            name: "Loops",
            colour: "120",
            contents: [
              { kind: "block", type: "controls_repeat_ext" },
              { kind: "block", type: "controls_whileUntil" },
              { kind: "block", type: "controls_for" },
              { kind: "block", type: "controls_forEach" },
              { kind: "block", type: "controls_flow_statements" },
            ],
          },
          {
            kind: "category",
            name: "Math",
            colour: "230",
            contents: [
              { kind: "block", type: "math_number" },
              { kind: "block", type: "math_arithmetic" },
              { kind: "block", type: "math_single" },
              { kind: "block", type: "math_trig" },
              { kind: "block", type: "math_constant" },
            ],
          },
          {
            kind: "category",
            name: "Text",
            colour: "160",
            contents: [
              { kind: "block", type: "text" },
              { kind: "block", type: "text_join" },
              { kind: "block", type: "text_append" },
              { kind: "block", type: "text_length" },
              { kind: "block", type: "text_isEmpty" },
            ],
          },
          {
            kind: "category",
            name: "Lists",
            colour: "260",
            contents: [
              { kind: "block", type: "lists_create_with" },
              { kind: "block", type: "lists_repeat" },
              { kind: "block", type: "lists_length" },
              { kind: "block", type: "lists_isEmpty" },
              { kind: "block", type: "lists_indexOf" },
            ],
          },
          {
            kind: "sep" // Visual separator
          },
          {
            kind: "category",
            name: "Variables",
            colour: "330",
            custom: "VARIABLE",
          },
          {
            kind: "category",
            name: "Functions",
            colour: "290",
            custom: "PROCEDURE",
          },
        ],
      };

      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        trashcan: true,
        grid: { spacing: 20, length: 3, colour: "#ccc", snap: true },
        zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
      });

      workspace.current.addChangeListener(() => {
        const json = Blockly.serialization.workspaces.save(workspace.current);
        const jsCode = javascriptGenerator.workspaceToCode(workspace.current);
        onChange(json, jsCode);
      });
    }
  }, [onChange]);

  return <div ref={blocklyDiv} style={{ height: "600px", width: "100%", border: "1px solid #ccc" }} />;
}