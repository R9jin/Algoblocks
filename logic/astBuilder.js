export function buildAST(workspaceJson) {
  if (!workspaceJson || !workspaceJson.blocks) return [];

  function parseBlock(block) {
    let children = [];

    // Nested blocks inside inputs
    if (block.inputs) {
      Object.values(block.inputs).forEach(input => {
        if (input.block) children.push(parseBlock(input.block));
      });
    }

    // Blocks connected below
    if (block.next && block.next.block) {
      children.push(parseBlock(block.next.block));
    }

    return { type: block.type, children };
  }

  return workspaceJson.blocks.map(b => parseBlock(b));
}
