// src/logic/astBuilder.js

export function buildAST(workspaceJson) {
  if (!workspaceJson || !workspaceJson.blocks || !workspaceJson.blocks.blocks) {
    return [];
  }

  function parseBlock(block) {
    const node = {
      type: block.type,
      fields: block.fields || {}, // <--- ADD THIS LINE
      children: []
    };

    if (block.inputs) {
      Object.values(block.inputs).forEach(input => {
        if (input.block) {
          node.children.push(parseBlock(input.block));
        }
      });
    }

    return node;
  }

  const ast = [];
  function unwindChain(block) {
      ast.push(parseBlock(block));
      if (block.next && block.next.block) {
          unwindChain(block.next.block);
      }
  }

  workspaceJson.blocks.blocks.forEach(b => unwindChain(b));
  return ast;
}