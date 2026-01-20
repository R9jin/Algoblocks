export function buildAST(workspaceJson) {
  if (!workspaceJson || !workspaceJson.blocks || !workspaceJson.blocks.blocks) {
    return [];
  }

  function parseBlock(block) {
    let children = [];
    if (block.inputs) {
      Object.values(block.inputs).forEach(input => {
        if (input.block) children.push(parseBlock(input.block));
      });
    }
    if (block.next && block.next.block) {
      children.push(parseBlock(block.next.block));
    }
    return { type: block.type, children };
  }

  return workspaceJson.blocks.blocks.map(b => parseBlock(b));
}