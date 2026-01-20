// src/Algoblocks/logic/astBuilder.js
export function buildAST(workspaceJson) {
  // If the workspace is empty, return an empty array
  if (!workspaceJson || !workspaceJson.blocks || !workspaceJson.blocks.blocks) {
    return [];
  }

  function parseBlock(block) {
    let children = [];

    // 1. Check for blocks inside statement inputs (like the "DO" section of a loop)
    if (block.inputs) {
      Object.values(block.inputs).forEach(input => {
        if (input.block) {
          children.push(parseBlock(input.block));
        }
      });
    }

    // 2. Check for blocks connected directly below (the "next" connection)
    if (block.next && block.next.block) {
      children.push(parseBlock(block.next.block));
    }

    return {
      id: block.id,
      type: block.type,
      children: children
    };
  }

  // Map over the top-level blocks in the workspace
  return workspaceJson.blocks.blocks.map(b => parseBlock(b));
}