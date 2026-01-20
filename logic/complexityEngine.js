export function analyzeLineByLine(ast) {
  const result = [];

  function traverse(node, depth = 0) {
    if (!node) return;
    let color = "green"; // O(1)
    let text = `${node.type} - depth ${depth} (O(1))`;

    if (node.type === "controls_for") {
      color = "orange";
      text = `${node.type} - depth ${depth} (O(n))`;
    }

    result.push({ text, color });

    if (node.children) node.children.forEach(c => traverse(c, depth + 1));
  }

  ast.forEach(node => traverse(node));
  return result;
}
