// src/components/BlocklyWorkspace.jsx
import "blockly/blocks";
import * as Blockly from "blockly/core";
import * as En from "blockly/msg/en";
import { pythonGenerator } from "blockly/python";
import { useEffect, useRef } from "react";

// --- 1. ADD MISSING PLUGIN IMPORTS ---
import { CrossTabCopyPaste } from "@blockly/plugin-cross-tab-copy-paste";
import { Modal } from "@blockly/plugin-modal";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import { PositionedMinimap } from "@blockly/workspace-minimap";
import { ZoomToFitControl } from "@blockly/zoom-to-fit";

Blockly.setLocale(En);

// --- FULL STANDARD TOOLBOX ---
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
    {
      kind: "category",
      name: "Colour",
      colour: "20",
      contents: [
        { kind: "block", type: "colour_picker" },
        { kind: "block", type: "colour_random" },
        { kind: "block", type: "colour_rgb",
          inputs: {
            RED: { shadow: { type: "math_number", fields: { NUM: 100 } } },
            GREEN: { shadow: { type: "math_number", fields: { NUM: 50 } } },
            BLUE: { shadow: { type: "math_number", fields: { NUM: 0 } } }
          }
        },
        { kind: "block", type: "colour_blend",
          inputs: {
            COLOUR1: { shadow: { type: "colour_picker", fields: { COLOUR: "#ff0000" } } },
            COLOUR2: { shadow: { type: "colour_picker", fields: { COLOUR: "#3333ff" } } },
            RATIO: { shadow: { type: "math_number", fields: { NUM: 0.5 } } }
          }
        },
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

  useEffect(() => {
    // 1. Safety Check: If workspace already exists, don't create another
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

      const crossTab = new CrossTabCopyPaste();
      crossTab.init({ contextMenu: true, shortcut: true }, () => {});

      const minimap = new PositionedMinimap(workspace.current);
      minimap.init();

      const modal = new Modal(workspace.current);
      modal.init();

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
          onChange(json, code);
        }
      });
      
      // 5. TRIGGER INITIAL RESIZE
      window.dispatchEvent(new Event('resize'));
    }

    // --- CLEANUP FUNCTION ---
    return () => {
      if (workspace.current) {
        workspace.current.dispose(); 
        workspace.current = null;    
      }
    };
  }, [onChange]); // IMPORTANT: Ensure 'onChange' in App.jsx doesn't change on every render!

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={blocklyDiv} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}