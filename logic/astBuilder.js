export function buildAST(workspaceJson) {
  if (!workspaceJson || !workspaceJson.blocks || !workspaceJson.blocks.blocks) return [];

  function parseBlock(block) {
    let children = [];
    // Check for nested blocks in inputs (like loop bodies)
    if (block.inputs) {
      Object.values(block.inputs).forEach(input => {
        if (input.block) children.push(parseBlock(input.block));
      });
    }
    // Check for blocks connected below
    if (block.next && block.next.block) {
      children.push(parseBlock(block.next.block));
    }
    return { type: block.type, children };
  }

  return workspaceJson.blocks.blocks.map(b => parseBlock(b));
}