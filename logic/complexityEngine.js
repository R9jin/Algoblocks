// src/logic/complexityEngine.js

export function analyzeLineByLine(ast) {
  const result = [];
  let maxComplexityRank = 0;
  let totalComplexity = "O(1)";

  // Rank: Higher number = Slower code
  // Used for calculating the "Total" at the top of the screen
  const ranks = { "O(1)": 1, "O(log n)": 2, "O(n)": 3, "O(n log n)": 4, "O(n^2)": 5, "O(n^3)": 6 };

  function getRank(c) {
    if (c.includes("^")) return 5 + parseInt(c.split("^")[1]);
    const map = { "O(1)": 1, "O(log n)": 2, "O(n)": 3, "O(n log n)": 4, "O(n^2)": 5 };
    return map[c] || 1;
  }

  // --- NEW HELPER: MULTIPLY COMPLEXITY BY LOOP DEPTH ---
  // e.g., base="O(1)", depth=1  -> Returns "O(n)"
  // e.g., base="O(n)", depth=1  -> Returns "O(n^2)"
  function multiplyComplexity(base, depth) {
    if (depth === 0) return base;
    
    let isLog = base.includes("log n");
    let power = 0;

    // 1. Extract existing power from base
    if (base.includes("O(1)")) {
        power = 0;
    } else if (base.includes("O(n^")) {
        // Extract number from O(n^2)
        power = parseInt(base.split("^")[1]); 
    } else if (base.includes("O(n")) {
        // Matches O(n) or O(n log n)
        power = 1;
    }

    // 2. Add Loop Depth
    power += depth;

    // 3. Reconstruct String
    if (power === 0) return "O(1)";
    if (power === 1) return isLog ? "O(n log n)" : "O(n)";
    return isLog ? `O(n^${power} log n)` : `O(n^${power})`;
  }

  // --- RECURSIVE COMPLEXITY WEIGHT ---
  // Calculates the complexity of a SINGLE execution of the block
  function getBlockWeight(node) {
    if (!node) return "O(1)";

    let myComplexity = "O(1)";

    // 1. Specific Blocks
    if (node.type === "lists_sort") myComplexity = "O(n log n)";
    else if (["lists_indexOf", "text_indexOf"].includes(node.type)) myComplexity = "O(n)";
    
    // 2. Bubble up from Inputs
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

  // --- CODE RECONSTRUCTOR (Keep your existing fixes) ---
  function reconstructCode(node) {
    if (!node) return "...";
    
    if (node.type === "variables_get") return node.fields?.VAR?.name || "variable";

    if (node.type === "controls_repeat_ext") {
       const times = node.children[0] ? reconstructCode(node.children[0]) : "n";
       return `for count in range(${times}):`;
    }

    if (node.type === "variables_set") {
      const varName = node.fields?.VAR?.name || "item"; 
      const valueNode = node.children[0]; 
      const valueStr = reconstructCode(valueNode);
      return `${varName} = ${valueStr}`;
    }

    if (node.type === "math_number") return node.fields?.NUM || "0";

    if (node.type === "lists_create_with") {
      if (!node.children || node.children.length === 0) return "[]";
      const elements = node.children.map(child => reconstructCode(child)).join(", ");
      return `[${elements}]`;
    }

    if (node.type === "lists_repeat") {
       const item = reconstructCode(node.children[0]);
       const times = reconstructCode(node.children[1]);
       return `[${item}] * ${times}`;
    }

    if (node.type === "controls_for") {
      const varName = node.fields?.VAR?.name || "i";
      return `for ${varName} in range(...):`;
    }
    
    if (node.type === "controls_forEach") {
       const varName = node.fields?.VAR?.name || "item";
       return `for ${varName} in list:`;
    }

    if (node.type === "text") return `"${node.fields?.TEXT || ""}"`;
    
    if (node.type === "text_print") {
        const content = node.children[0] ? reconstructCode(node.children[0]) : "";
        return `print(${content})`;
    }

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

    const statementBlocks = [
      "variables_set", "controls_if", "controls_for", 
      "controls_forEach", "controls_whileUntil", "controls_repeat_ext",
      "text_print", "lists_setIndex", "math_change"
    ];

    let lineComplexity = "O(1)";
    let color = "#27ae60"; // Green

    // 1. IS IT A LOOP HEADER?
    // The header itself runs N times (or N^depth times if nested)
    if (["controls_for", "controls_forEach", "controls_whileUntil", "controls_repeat_ext"].includes(node.type)) {
      // Loop Logic: A loop at depth 0 is O(n). A loop at depth 1 is O(n^2).
      const power = depth + 1;
      lineComplexity = (power === 1) ? "O(n)" : `O(n^${power})`;
      color = "#e67e22"; // Orange
    } 
    else {
      // 2. IS IT A NORMAL STATEMENT?
      // First, get its single-execution cost (e.g., print is O(1))
      const baseWeight = getBlockWeight(node);
      
      // Then, multiply by the loop depth (This is what your prof wants!)
      // O(1) inside a loop becomes O(n).
      lineComplexity = multiplyComplexity(baseWeight, depth);

      // Color coding
      if (getRank(lineComplexity) >= 4) color = "#e74c3c"; // Red
      else if (getRank(lineComplexity) === 3) color = "#2980b9"; // Blue
    }

    // Update Max Total
    if (getRank(lineComplexity) > maxComplexityRank) {
      maxComplexityRank = getRank(lineComplexity);
      totalComplexity = lineComplexity;
    }

    result.push({
      lineOfCode: reconstructCode(node),
      complexity: lineComplexity,
      color: color,
      indent: depth
    });

    // Recurse into children
    if (node.children) {
      node.children.forEach(child => {
        if (statementBlocks.includes(child.type)) {
           const isLoop = ["controls_for", "controls_forEach", "controls_whileUntil", "controls_repeat_ext"].includes(node.type);
           // If current node is a loop, increment depth for the children
           traverseStatement(child, depth + (isLoop ? 1 : 0));
        }
      });
    }
  }

  if (ast) {
    ast.forEach(node => {
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