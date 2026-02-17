// src/components/BlocklyWorkspace.jsx
import "blockly/blocks";
import * as Blockly from "blockly/core";
import * as En from "blockly/msg/en";
import { pythonGenerator } from "blockly/python";
import { useEffect, useRef } from "react";

// --- PLUGIN IMPORTS ---
import { CrossTabCopyPaste } from "@blockly/plugin-cross-tab-copy-paste";
import { Modal } from "@blockly/plugin-modal";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import { PositionedMinimap } from "@blockly/workspace-minimap";
import { ZoomToFitControl } from "@blockly/zoom-to-fit";

Blockly.setLocale(En);

// --- 1. DEFINE CUSTOM COMMENT BLOCK ---
// We define it here so it's registered before the workspace loads
const customBlocks = [
  {
    "type": "comment_block",
    "message0": "Comment %1",
    "args0": [
      {
        "type": "field_input",
        "name": "TEXT",
        "text": "write note here"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#999999", // Grey color for comments
    "tooltip": "Adds a comment to the Python code (ignored by the computer)",
    "helpUrl": ""
  }
];

// Register the block
if (Blockly.common && Blockly.common.defineBlocksWithJsonArray) {
  Blockly.common.defineBlocksWithJsonArray(customBlocks);
} else {
  Blockly.defineBlocksWithJsonArray(customBlocks);
}

// --- TOOLBOX CONFIGURATION ---
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
        { kind: "block", type: "logic_null" },
        { kind: "block", type: "logic_ternary" },
      ],
    },
    {
      kind: "category",
      name: "Loops",
      colour: "120",
      contents: [
        { kind: "block", type: "controls_repeat_ext", 
          inputs: { TIMES: { shadow: { type: "math_number", fields: { NUM: 10 } } } } 
        },
        { kind: "block", type: "controls_whileUntil" },
        { kind: "block", type: "controls_for",
          inputs: { 
            FROM: { shadow: { type: "math_number", fields: { NUM: 1 } } }, 
            TO: { shadow: { type: "math_number", fields: { NUM: 10 } } },
            BY: { shadow: { type: "math_number", fields: { NUM: 1 } } }
          }
        },
        { kind: "block", type: "controls_forEach" },
        { kind: "block", type: "controls_flow_statements" },
      ],
    },
    {
      kind: "category",
      name: "Math",
      colour: "230",
      contents: [
        { kind: "block", type: "math_number", fields: { NUM: 123 } },
        { kind: "block", type: "math_arithmetic", 
          inputs: { 
            A: { shadow: { type: "math_number", fields: { NUM: 1 } } },
            B: { shadow: { type: "math_number", fields: { NUM: 1 } } }
          }
        },
        { kind: "block", type: "math_single" },
        { kind: "block", type: "math_trig" },
        { kind: "block", type: "math_constant" },
        { kind: "block", type: "math_number_property" },
        { kind: "block", type: "math_round" },
        { kind: "block", type: "math_on_list" },
        { kind: "block", type: "math_modulo" },
        { kind: "block", type: "math_constrain",
          inputs: {
            LOW: { shadow: { type: "math_number", fields: { NUM: 1 } } },
            HIGH: { shadow: { type: "math_number", fields: { NUM: 100 } } }
          }
        },
        { kind: "block", type: "math_random_int",
          inputs: {
            FROM: { shadow: { type: "math_number", fields: { NUM: 1 } } },
            TO: { shadow: { type: "math_number", fields: { NUM: 100 } } }
          }
        },
        { kind: "block", type: "math_random_float" },
      ],
    },
    {
      kind: "category",
      name: "Text",
      colour: "160",
      contents: [
        { kind: "block", type: "comment_block" }, 
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
        { kind: "block", type: "text_prompt_ext", 
          inputs: { TEXT: { shadow: { type: "text", fields: { TEXT: "abc" } } } } 
        },
      ],
    },
    {
      kind: "category",
      name: "Lists",
      colour: "260",
      contents: [
        { kind: "block", type: "lists_create_with", extraState: { itemCount: 0 } },
        { kind: "block", type: "lists_create_with" },
        { kind: "block", type: "lists_repeat",
          inputs: { NUM: { shadow: { type: "math_number", fields: { NUM: 5 } } } }
        },
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

export default function BlocklyWorkspace({ onChange }) {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const onChangeRef = useRef(onChange);

  // Keep ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    // 1. Safety Check
    if (workspace.current) return;

    if (blocklyDiv.current) {
      
      // 2. INJECT BLOCKLY
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        trashcan: true,
        move: { scrollbars: true, drag: true, wheel: true },
        zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
        renderer: "geras", 
      });

      // 3. INITIALIZE PLUGINS
      const workspaceSearch = new WorkspaceSearch(workspace.current);
      workspaceSearch.init();

      const zoomToFit = new ZoomToFitControl(workspace.current);
      zoomToFit.init();

      if (!Blockly.ContextMenuRegistry.registry.getItem('blockCopyToStorage')) {
        const crossTab = new CrossTabCopyPaste();
        crossTab.init({ contextMenu: true, shortcut: true }, () => {});
      }

      const minimap = new PositionedMinimap(workspace.current);
      minimap.init();

      const modal = new Modal(workspace.current);
      modal.init();

      // --- [NEW] GENERATOR FOR COMMENT BLOCK ---
      pythonGenerator.forBlock['comment_block'] = function(block) {
        const text = block.getFieldValue('TEXT');
        // Returns a Python comment string
        return `# ${text}\n`;
      };

      // --- [FIX] 1. CLEANER LOOPS (No Helper Functions) ---
      pythonGenerator.forBlock['controls_for'] = function(block) {
        const variable = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
        const from = pythonGenerator.valueToCode(block, 'FROM', pythonGenerator.ORDER_NONE) || '0';
        const to = pythonGenerator.valueToCode(block, 'TO', pythonGenerator.ORDER_ADDITIVE) || '0';
        const step = pythonGenerator.valueToCode(block, 'BY', pythonGenerator.ORDER_NONE) || '1';

        let rangeCode;
        if (step === '1') {
            rangeCode = `range(${from}, ${to})`;
        } else {
            rangeCode = `range(${from}, ${to}, ${step})`;
        }

        let branch = pythonGenerator.statementToCode(block, 'DO') || pythonGenerator.PASS;
        return `for ${variable} in ${rangeCode}:\n${branch}`;
      };

      // --- [FIX] 2. RAW LIST GET (Exact Index) ---
      pythonGenerator.forBlock['lists_getIndex'] = function(block) {
        const mode = block.getFieldValue('MODE') || 'GET';
        const where = block.getFieldValue('WHERE') || 'FROM_START';
        const list = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_MEMBER) || '[]';
        
        if (where === 'FROM_START') {
            const at = pythonGenerator.valueToCode(block, 'AT', pythonGenerator.ORDER_NONE) || '0';
            const indexCode = at; 
            if (mode === 'GET') {
                return [`${list}[${indexCode}]`, pythonGenerator.ORDER_MEMBER];
            } else if (mode === 'REMOVE') {
                return `${list}.pop(${indexCode})\n`;
            }
        }
        return [`${list}[0]`, pythonGenerator.ORDER_MEMBER]; 
      };

      // --- [FIX] 3. RAW LIST SET (Exact Index) ---
      pythonGenerator.forBlock['lists_setIndex'] = function(block) {
        const list = pythonGenerator.valueToCode(block, 'LIST', pythonGenerator.ORDER_MEMBER) || 'list';
        const mode = block.getFieldValue('MODE') || 'SET';
        const where = block.getFieldValue('WHERE') || 'FROM_START';
        const value = pythonGenerator.valueToCode(block, 'TO', pythonGenerator.ORDER_NONE) || 'None';
        
        if (where === 'FROM_START') {
            const at = pythonGenerator.valueToCode(block, 'AT', pythonGenerator.ORDER_NONE) || '0';
            const indexCode = at; 
            if (mode === 'SET') {
                return `${list}[${indexCode}] = ${value}\n`;
            } else if (mode === 'INSERT') {
                return `${list}.insert(${indexCode}, ${value})\n`;
            }
        }
        return `${list}[0] = ${value}\n`;
      };

      // --- [FIX] 4. LOCAL VARIABLES IN FUNCTIONS (Critical for Recursion) ---
      // This stops Blockly from writing "global n, mid, i" inside functions.
      const procedureGenerator = function(block) {
        const funcName = pythonGenerator.getProcedureName(block.getFieldValue('NAME'));
        let branch = pythonGenerator.statementToCode(block, 'STACK');
        
        // Handle "Do" vs "Return"
        let returnValue = '';
        if (block.type === 'procedures_defreturn') {
            returnValue = pythonGenerator.valueToCode(block, 'RETURN', pythonGenerator.ORDER_NONE) || '';
            if (returnValue) {
                returnValue = pythonGenerator.INDENT + 'return ' + returnValue + '\n';
            }
        }

        // Handle arguments
        const args = [];
        const variables = block.getVars();
        for (let i = 0; i < variables.length; i++) {
            args[i] = pythonGenerator.getVariableName(variables[i]);
        }

        // If the function is empty, add 'pass'
        if (!branch && !returnValue) {
            branch = pythonGenerator.PASS;
        }

        // --- THE MAGIC: We intentionally SKIPPED the "global" declaration part ---
        return 'def ' + funcName + '(' + args.join(', ') + '):\n' + branch + returnValue;
      };

      // Apply this generator to both types of functions
      pythonGenerator.forBlock['procedures_defnoreturn'] = procedureGenerator;
      pythonGenerator.forBlock['procedures_defreturn'] = procedureGenerator;

      // 4. EVENT LISTENER
      workspace.current.addChangeListener((event) => {
        if (
          event.type === Blockly.Events.BLOCK_CREATE ||
          event.type === Blockly.Events.BLOCK_DELETE ||
          event.type === Blockly.Events.BLOCK_CHANGE ||
          event.type === Blockly.Events.BLOCK_MOVE
        ) {
          const json = Blockly.serialization.workspaces.save(workspace.current);
          const code = pythonGenerator.workspaceToCode(workspace.current);
          
          if (onChangeRef.current) {
            onChangeRef.current(json, code);
          }
        }
      });
      
      // 5. RESIZE OBSERVER
      const observer = new ResizeObserver(() => {
        if (workspace.current) {
          Blockly.svgResize(workspace.current);
        }
      });
      observer.observe(blocklyDiv.current);
      blocklyDiv.current.resizeObserver = observer;
    }

    // --- CLEANUP FUNCTION ---
    return () => {
      if (workspace.current) {
        workspace.current.dispose(); 
        workspace.current = null;    
      }
      if (blocklyDiv.current && blocklyDiv.current.resizeObserver) {
        blocklyDiv.current.resizeObserver.disconnect();
      }
    };
  }, []); 

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={blocklyDiv} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}