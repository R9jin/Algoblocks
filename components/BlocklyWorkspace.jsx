import "blockly/blocks";
import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import * as En from "blockly/msg/en";
import { pythonGenerator } from "blockly/python";
import { useEffect, useRef } from "react";
import { javaGenerator } from "../generators/java";

Blockly.setLocale(En);

// ==============================================================================
// 1. JAVA TOOLBOX (Upgraded for Searching & Sorting)
// Now includes Arrays (Lists), For-Loops, and Functions
// ==============================================================================
const javaToolbox = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Logic",
      colour: "210",
      contents: [
        { kind: "block", type: "controls_if" },
        { kind: "block", type: "logic_compare" },
        { kind: "block", type: "logic_boolean" },
      ],
    },
    {
      kind: "category",
      name: "Loops",
      colour: "120",
      contents: [
        { 
          kind: "block", 
          type: "controls_repeat_ext",
          inputs: { TIMES: { shadow: { type: "math_number", fields: { NUM: 10 } } } } 
        },
        { kind: "block", type: "controls_whileUntil" },
        { kind: "block", type: "controls_for" }, // REQUIRED for Sorting (i=0 to n)
      ],
    },
    {
      kind: "category",
      name: "Math",
      colour: "230",
      contents: [
        { kind: "block", type: "math_number" },
        { kind: "block", type: "math_arithmetic" },
      ],
    },
    {
      kind: "category",
      name: "Text",
      colour: "160",
      contents: [
        { kind: "block", type: "text" },
        { kind: "block", type: "text_print" },
      ],
    },
    {
      kind: "category",
      name: "Lists",
      colour: "260",
      contents: [
        { kind: "block", type: "lists_create_with" }, // int[] arr = {1,2}
        { kind: "block", type: "lists_getIndex" },    // arr[i]
        { kind: "block", type: "lists_setIndex" },    // arr[i] = x
        { kind: "block", type: "lists_length" },      // arr.length
      ],
    },
    { kind: "sep" },
    { kind: "category", name: "Variables", colour: "330", custom: "VARIABLE" },
    { kind: "category", name: "Functions", colour: "290", custom: "PROCEDURE" }, // REQUIRED for Recursion
  ],
};

// ==============================================================================
// 2. GENERAL TOOLBOX (Full)
// ==============================================================================
const generalToolbox = {
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
        { kind: "block", type: "logic_null" },
        { kind: "block", type: "logic_ternary" }
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
        { kind: "block", type: "controls_flow_statements" }
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
        { kind: "block", type: "math_round" },
        { kind: "block", type: "math_modulo" },
        { kind: "block", type: "math_random_int" },
      ],
    },
    {
      kind: "category",
      name: "Text",
      colour: "160",
      contents: [
        { kind: "block", type: "text" },
        { kind: "block", type: "text_join" },
        { kind: "block", type: "text_length" },
        { kind: "block", type: "text_print" },
        { kind: "block", type: "text_prompt_ext" },
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
        { kind: "block", type: "lists_getIndex" },
        { kind: "block", type: "lists_setIndex" },
        { kind: "block", type: "lists_sort" },
      ],
    },
    { kind: "sep" },
    { kind: "category", name: "Variables", colour: "330", custom: "VARIABLE" },
    { kind: "category", name: "Functions", colour: "290", custom: "PROCEDURE" },
  ],
};

// ==============================================================================
// 3. MAIN COMPONENT
// ==============================================================================
export default function BlocklyWorkspace({ onChange, language }) {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    // 1. Initialize Workspace
    if (!workspace.current && blocklyDiv.current) {
      
      const initialToolbox = (language === "java") ? javaToolbox : generalToolbox;

      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: initialToolbox, 
        trashcan: true,
        zoom: { controls: true, wheel: true },
      });

      // 2. Add Change Listener
      workspace.current.addChangeListener((event) => {
        if (
          event.type === Blockly.Events.BLOCK_CREATE ||
          event.type === Blockly.Events.BLOCK_DELETE ||
          event.type === Blockly.Events.BLOCK_MOVE ||
          event.type === Blockly.Events.BLOCK_CHANGE ||
          event.type === Blockly.Events.VAR_CREATE ||
          event.type === Blockly.Events.VAR_DELETE
        ) {
          const json = Blockly.serialization.workspaces.save(workspace.current);
          
          let javaCode = "// Java not supported";
          try {
             javaCode = javaGenerator.workspaceToCode(workspace.current);
          } catch(e) { console.warn("Java Gen Error", e); }

          const js = javascriptGenerator.workspaceToCode(workspace.current);
          const py = pythonGenerator.workspaceToCode(workspace.current);
          
          onChange(json, js, py, javaCode);
        }
      });
    }
  }, [onChange]); 

  // 3. HANDLE LANGUAGE SWITCHING
  useEffect(() => {
    if (workspace.current) {
      if (language === "java") {
        workspace.current.updateToolbox(javaToolbox);
      } else {
        workspace.current.updateToolbox(generalToolbox);
      }
    }
  }, [language]); 

  return (
    <div
      ref={blocklyDiv}
      style={{ height: "600px", width: "100%", border: "1px solid #ccc" }}
    />
  );
}