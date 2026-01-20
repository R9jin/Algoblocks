// src/Algoblocks/logic/complexityEngine.js
export function analyzeLineByLine(ast) {
  const result = [];

  function traverse(node, depth = 0) {
    if (!node) return;

    let type = node.type;
    let lineOfCode = "";
    let timeComplexity = "O(1)";
    let spaceComplexity = "O(1)";
    let color = "#27ae60"; // Default Green

    // Rule-based mapping for the table
    switch (node.type) {
      case "controls_for":
        lineOfCode = "for (let i = 0; i < n; i++) { ... }";
        timeComplexity = `O(n${depth > 0 ? '^' + (depth + 1) : ''})`;
        spaceComplexity = "O(1)";
        color = "#e67e22"; // Orange
        break;
      case "variables_set":
        lineOfCode = "let variable = value;";
        timeComplexity = "O(1)";
        spaceComplexity = "O(1)";
        break;
      case "lists_create_with":
        lineOfCode = "let list = [...];";
        timeComplexity = "O(n)";
        spaceComplexity = "O(n)";
        color = "#2980b9"; // Blue
        break;
      default:
        lineOfCode = `${node.type}(...)`;
        timeComplexity = "O(1)";
        spaceComplexity = "O(1)";
    }

    result.push({ type, lineOfCode, timeComplexity, spaceComplexity, color });

    if (node.children) {
      node.children.forEach(child => traverse(child, depth + 1));
    }
  }

  ast.forEach(node => traverse(node));
  return result;
}