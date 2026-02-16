// src/logic/complexityEngine.js

export function analyzeLineByLine(ast) {
  const result = [];
  let maxComplexityRank = 0;
  let totalComplexity = "O(1)";

  // Rank: Higher number = Slower code
  const ranks = { "O(1)": 1, "O(log n)": 2, "O(n)": 3, "O(n log n)": 4, "O(n^2)": 5, "O(n^3)": 6 };

  // Helper: Get complexity rank
  function getRank(c) {
    if (c.includes("^")) return 5 + parseInt(c.split("^")[1]);
    const map = { "O(1)": 1, "O(log n)": 2, "O(n)": 3, "O(n log n)": 4, "O(n^2)": 5 };
    return map[c] || 1;
  }

  // --- RECURSIVE COMPLEXITY WEIGHT ---
  function getBlockWeight(node) {
    if (!node) return "O(1)";

    let myComplexity = "O(1)";

    // 1. Inherent Complexity
    // RULE CHANGE: Creating a fixed list is O(1)
    if (node.type === "lists_sort") myComplexity = "O(n log n)";
    else if (["lists_indexOf", "text_indexOf"].includes(node.type)) myComplexity = "O(n)";
    else if (node.type === "controls_flow_statements") myComplexity = "O(1)"; 
    // lists_create_with is now O(1) by default

    // 2. Max Complexity of Children (Inputs)
    if (node.children) {
      node.children.forEach(child => {
        const childComplexity = getBlockWeight(child);
        if (getRank(childComplexity) > getRank(myComplexity)) {
          myComplexity = childComplexity;
        }
      });
    }

    return myComplexity;
  }

  // --- RECURSIVE CODE RECONSTRUCTOR ---
  // This rebuilds the code string from the block data to match Python exactly
  function reconstructCode(node) {
    if (!node) return "...";

    // 1. Variables
    if (node.type === "variables_set") {
      const varName = node.fields?.VAR?.name || "item"; // Get real var name
      const valueNode = node.children[0]; // The block plugged into it
      const valueStr = reconstructCode(valueNode);
      return `${varName} = ${valueStr}`;
    }

    // 2. Numbers
    if (node.type === "math_number") {
      return node.fields?.NUM || "0";
    }

    // 3. Lists [1, 2, 3]
    if (node.type === "lists_create_with") {
      if (!node.children || node.children.length === 0) return "[]";
      const elements = node.children.map(child => reconstructCode(child)).join(", ");
      return `[${elements}]`;
    }

    // 4. List Repeat [0] * 5
    if (node.type === "lists_repeat") {
       const item = reconstructCode(node.children[0]);
       const times = reconstructCode(node.children[1]);
       return `[${item}] * ${times}`;
    }

    // 5. Loops
    if (node.type === "controls_for") {
      const varName = node.fields?.VAR?.name || "i";
      // We could try to find the range inputs, but generic is usually fine for loops
      return `for ${varName} in range(...):`;
    }
    
    if (node.type === "controls_forEach") {
       const varName = node.fields?.VAR?.name || "item";
       return `for ${varName} in list:`;
    }

    // 6. Text
    if (node.type === "text") {
        return `"${node.fields?.TEXT || ""}"`;
    }
    
    // 7. Print
    if (node.type === "text_print") {
        const content = node.children[0] ? reconstructCode(node.children[0]) : "";
        return `print(${content})`;
    }

    // Fallbacks
    const map = {
      "controls_if": "if condition:",
      "controls_whileUntil": "while condition:",
      "lists_sort": "list.sort()",
    };
    return map[node.type] || "code";
  }

  // --- MAIN TRAVERSAL ---
  function traverseStatement(node, depth = 0) {
    if (!node) return;

    // Only process "Statement" blocks (start of lines)
    const statementBlocks = [
      "variables_set", "controls_if", "controls_for", 
      "controls_forEach", "controls_whileUntil", "controls_repeat_ext",
      "text_print", "lists_setIndex", "math_change"
    ];

    let lineComplexity = "O(1)";
    let color = "#27ae60"; // Green

    // 1. Loop Logic
    if (["controls_for", "controls_forEach", "controls_whileUntil", "controls_repeat_ext"].includes(node.type)) {
      const power = depth + 1;
      lineComplexity = (power === 1) ? "O(n)" : `O(n^${power})`;
      color = "#e67e22"; // Orange
    } 
    else {
      // 2. Linear Logic (Sum of inputs)
      lineComplexity = getBlockWeight(node);
      
      if (getRank(lineComplexity) >= 4) color = "#e74c3c"; // Red
      else if (getRank(lineComplexity) === 3) color = "#2980b9"; // Blue
    }

    // Update Max
    if (getRank(lineComplexity) > maxComplexityRank) {
      maxComplexityRank = getRank(lineComplexity);
      totalComplexity = lineComplexity;
    }

    // Add to Table
    result.push({
      lineOfCode: reconstructCode(node), // Use the new Reconstructor
      complexity: lineComplexity,
      color: color,
      indent: depth
    });

    // Recurse into Bodies
    if (node.children) {
      node.children.forEach(child => {
        // Only go deeper if the child is a Statement (like loop body)
        // If it was a Value (like a number), it was already consumed by reconstructCode
        if (statementBlocks.includes(child.type)) {
           const isLoop = ["controls_for", "controls_forEach", "controls_whileUntil", "controls_repeat_ext"].includes(node.type);
           traverseStatement(child, depth + (isLoop ? 1 : 0));
        }
      });
    }
  }

  // --- START ---
  if (ast) {
    ast.forEach(node => {
      // White-list top level statements
       const isStatement = [
        "variables_set", "controls_if", "controls_for", 
        "controls_forEach", "controls_whileUntil", "controls_repeat_ext",
        "text_print", "lists_setIndex", "math_change"
      ].includes(node.type);

      if (isStatement) traverseStatement(node);
    });
  }

  return { lines: result, total: totalComplexity };
}