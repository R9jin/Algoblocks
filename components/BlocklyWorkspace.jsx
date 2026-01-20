// src/Algoblocks/components/BlocklyWorkspace.jsx
import "blockly/blocks"; // all standard blocks
import * as Blockly from "blockly/core"; // core Blockly
import { javascriptGenerator } from "blockly/javascript";
import { pythonGenerator } from "blockly/python";
import { useEffect, useRef } from "react";

export default function BlocklyWorkspace({ language, onChange }) {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    let initialized = false;

    if (!workspace.current && blocklyDiv.current) {
      // Define toolbox
      const toolbox = {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: "Logic",
            colour: "#5C81A6",
            contents: [
              { kind: "block", type: "controls_if" },
              { kind: "block", type: "logic_compare" },
              { kind: "block", type: "logic_operation" },
              { kind: "block", type: "logic_negate" },
              { kind: "block", type: "logic_boolean" },
              { kind: "block", type: "logic_null" },
              { kind: "block", type: "logic_ternary" }
            ]
          },
          {
            kind: "category",
            name: "Loops",
            colour: "#5CA65C",
            contents: [
              { kind: "block", type: "controls_repeat_ext" },
              { kind: "block", type: "controls_whileUntil" },
              { kind: "block", type: "controls_for" },
              { kind: "block", type: "controls_forEach" },
              { kind: "block", type: "controls_flow_statements" }
            ]
          },
          {
            kind: "category",
            name: "Math",
            colour: "#5C68A6",
            contents: [
              { kind: "block", type: "math_number" },
              { kind: "block", type: "math_arithmetic" },
              { kind: "block", type: "math_single" },
              { kind: "block", type: "math_trig" },
              { kind: "block", type: "math_constant" },
              { kind: "block", type: "math_number_property" },
              { kind: "block", type: "math_round" },
              { kind: "block", type: "math_on_list" },
              { kind: "block", type: "math_modulo" },
              { kind: "block", type: "math_constrain" },
              { kind: "block", type: "math_random_int" },
              { kind: "block", type: "math_random_float" }
            ]
          },
          {
            kind: "category",
            name: "Text",
            colour: "#5CA68D",
            contents: [
              { kind: "block", type: "text" },
              { kind: "block", type: "text_join" },
              { kind: "block", type: "text_append" },
              { kind: "block", type: "text_length" },
              { kind: "block", type: "text_isEmpty" },
              { kind: "block", type: "text_indexOf" },
              { kind: "block", type: "text_charAt" },
              { kind: "block", type: "text_getSubstring" },
              { kind: "block", type: "text_changeCase" },
              { kind: "block", type: "text_trim" },
              { kind: "block", type: "text_print" },
              { kind: "block", type: "text_prompt_ext" }
            ]
          },
          {
            kind: "category",
            name: "Lists",
            colour: "#745CA6",
            contents: [
              { kind: "block", type: "lists_create_empty" },
              { kind: "block", type: "lists_create_with" },
              { kind: "block", type: "lists_repeat" },
              { kind: "block", type: "lists_length" },
              { kind: "block", type: "lists_isEmpty" },
              { kind: "block", type: "lists_indexOf" },
              { kind: "block", type: "lists_getIndex" },
              { kind: "block", type: "lists_setIndex" },
              { kind: "block", type: "lists_getSublist" },
              { kind: "block", type: "lists_split" },
              { kind: "block", type: "lists_sort" }
            ]
          },
          { kind: "category", name: "Variables", colour: "#A65C81", custom: "VARIABLE" },
          { kind: "category", name: "Functions", colour: "#9A5CA6", custom: "PROCEDURE" }
        ]
      };

      // Inject Blockly
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox,
        trashcan: true,
        zoom: { controls: true, wheel: true }
      });
      initialized = true;

      // Workspace change listener
      workspace.current.addChangeListener(() => {
        const json = Blockly.serialization.workspaces.save(workspace.current);
        let code = "";
        if (language === "javascript") {
          code = javascriptGenerator.workspaceToCode(workspace.current);
        } else if (language === "python") {
          code = pythonGenerator.workspaceToCode(workspace.current);
        } else {
          code = "// Language not supported yet";
        }
        onChange(json, code);
      });
    }

    // Cleanup on unmount
    return () => {
      if (initialized && workspace.current) {
        setTimeout(() => {
          workspace.current.dispose();
          workspace.current = null;
        }, 0);
      }
    };
  }, [language, onChange]);

  return (
    <div
      ref={blocklyDiv}
      style={{ height: "600px", width: "800px", border: "1px solid #ccc" }}
    />
  );
}
