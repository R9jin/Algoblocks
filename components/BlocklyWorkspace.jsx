import "blockly/blocks";
import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import * as En from "blockly/msg/en";
import { pythonGenerator } from "blockly/python";
import { useEffect, useRef } from "react";
import { javaGenerator } from "../generators/java"; // Your custom generator

Blockly.setLocale(En);

// ==============================================================================
// 1. JAVA TOOLBOX (Restricted)
// Only shows blocks that your 'generators/java.js' file actually supports.
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
        { kind: "block", type: "logic_operation" },
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
    { kind: "sep" },
    { kind: "category", name: "Variables", colour: "330", custom: "VARIABLE" },
  ],
};

// ==============================================================================
// 2. FULL TOOLBOX (JS / Python)
// The complete list you pasted, including Lists, Functions, and Advanced Math.
// ==============================================================================
const fullToolbox = {
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
        { kind: "block", type: "math_on_list" },
        { kind: "block", type: "math_modulo" },
        { kind: "block", type: "math_constrain" },
        { kind: "block", type: "math_random_int" },
        { kind: "block", type: "math_random_float" },
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
        { kind: "block", type: "text_indexOf" },
        { kind: "block", type: "text_charAt" },
        { kind: "block", type: "text_getSubstring" },
        { kind: "block", type: "text_changeCase" },
        { kind: "block", type: "text_trim" },
        { kind: "block", type: "text_print" },
        { kind: "block", type: "text_prompt_ext" },
      ],
    },
    {
      kind: "category",
      name: "Lists",
      colour: "260",
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
        { kind: "block", type: "lists_sort" },
      ],
    },
    { kind: "sep" },
    { kind: "category", name: "Variables", colour: "330", custom: "VARIABLE" },
    { kind: "category", name: "Functions", colour: "290", custom: "PROCEDURE" },
  ],
};

// ==============================================================================
// 3. THE REACT COMPONENT
// ==============================================================================
export default function BlocklyWorkspace({ onChange, language }) {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    // Only inject once
    if (!workspace.current && blocklyDiv.current) {
      
      // Determine which toolbox to start with
      const initialToolbox = (language === "java") ? javaToolbox : fullToolbox;

      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: initialToolbox,
        trashcan: true,
        zoom: { controls: true, wheel: true },
      });

      // Change Listener (Generates Code)
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
          
          // Java Safety Check
          let javaCode = "// Not supported";
          try {
             javaCode = javaGenerator.workspaceToCode(workspace.current);
          } catch(e) { console.warn("Java Gen Error", e); }

          // Standard Generators
          const js = javascriptGenerator.workspaceToCode(workspace.current);
          const py = pythonGenerator.workspaceToCode(workspace.current);
          
          onChange(json, js, py, javaCode);
        }
      });
    }

    return () => {
      // Cleanup handled by React unmount usually
    };
  }, [onChange]); // Run only on mount (mostly)

  // ============================================================================
  // 4. DYNAMIC TOOLBOX SWITCHING
  // This hook runs whenever the 'language' prop changes (e.g. User selects "Python")
  // ============================================================================
  useEffect(() => {
    if (workspace.current) {
      if (language === "java") {
        workspace.current.updateToolbox(javaToolbox);
      } else {
        workspace.current.updateToolbox(fullToolbox);
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