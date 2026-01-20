import * as Blockly from "blockly";
import { useEffect, useRef } from "react";

export default function BlocklyWorkspace({ onChange }) {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    workspace.current = Blockly.inject(blocklyDiv.current, {
      toolbox: {
        kind: "flyoutToolbox",
        contents: [
          { kind: "block", type: "controls_for" },
          { kind: "block", type: "math_number" },
          { kind: "block", type: "variables_set" }
        ]
      }
    });

    workspace.current.addChangeListener(() => {
      const json = Blockly.serialization.workspaces.save(workspace.current);
      onChange(json);
    });
  }, []);

  return <div ref={blocklyDiv} style={{ height: "500px", width: "400px", border: "1px solid #ccc" }} />;
}
