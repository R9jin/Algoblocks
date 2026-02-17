// src/logic/astBuilder.js

export function buildAST(workspaceJson) {
  if (!workspaceJson || !workspaceJson.blocks || !workspaceJson.blocks.blocks) {
    return [];
  }

  // Helper to recursively parse a block and its full chain of children
  function parseBlock(block) {
    const node = {
      type: block.type,
      fields: block.fields || {},
      children: []
    };

    // 1. Inputs (Like "DO" in loops, "STACK" in functions, or "IF" conditions)
    if (block.inputs) {
      Object.values(block.inputs).forEach(input => {
        // FIX: The input points to the *first* block. 
        // We must verify if there's a chain (next, next, next...) and add them all.
        let currentBlock = input.block;
        
        while (currentBlock) {
          node.children.push(parseBlock(currentBlock));
          
          // Move to the next block in the stack
          if (currentBlock.next && currentBlock.next.block) {
            currentBlock = currentBlock.next.block;
          } else {
            currentBlock = null;
          }
        }
      });
    }

    return node;
  }

  const ast = [];

  // 2. Parse Top-Level Blocks (Unwind the main chain)
  if (workspaceJson.blocks && workspaceJson.blocks.blocks) {
    workspaceJson.blocks.blocks.forEach(rootBlock => {
      let currentBlock = rootBlock;
      while (currentBlock) {
        ast.push(parseBlock(currentBlock));
        if (currentBlock.next && currentBlock.next.block) {
          currentBlock = currentBlock.next.block;
        } else {
          currentBlock = null;
        }
      }
    });
  }

  return ast;
}