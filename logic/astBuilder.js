export function buildAST(blockJson) {
  // Minimal example: convert Blockly JSON into AST-like structure
  function parse(blocks) {
    if (!blocks || !blocks.blocks) return [];
    return blocks.blocks.map(b => ({
      id: b.id,
      type: b.type,
      children: parse(b.blocks)
    }));
  }
  return parse(blockJson);
}
