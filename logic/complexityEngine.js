export function analyzeLineByLine(ast) {
  const result = [];

  function traverse(node, depth = 0) {
    if (!node) return;

    // Default values for O(1) blocks
    let row = {
      type: node.type,
      lineOfCode: `${node.type}(...)`,
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      color: "#27ae60" // Green
    };

    // Rule-based logic for specific blocks
    if (node.type === "controls_for") {
      row.lineOfCode = "for (let i = 0; i < n; i++) { ... }";
      row.timeComplexity = depth > 0 ? `O(n^${depth + 1})` : "O(n)";
      row.color = "#e67e22"; // Orange for higher cost
    } else if (node.type === "variables_set") {
      row.lineOfCode = "let var = value;";
    } else if (node.type === "lists_create_with") {
      row.lineOfCode = "let list = [];";
      row.timeComplexity = "O(n)";
      row.spaceComplexity = "O(n)";
      row.color = "#2980b9"; // Blue
    }

    result.push(row);

    // Recursive traversal to handle nested blocks
    if (node.children) {
      node.children.forEach(child => traverse(child, depth + 1));
    }
  }

  ast.forEach(node => traverse(node));
  return result;
}