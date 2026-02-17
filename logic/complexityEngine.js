// src/logic/complexityEngine.js

export function analyzeLineByLine(ast) {
  const result = [];
  let maxComplexityRank = 0;
  let totalComplexity = "O(1)";

  // Rank: Higher number = Slower code
  const ranks = { "O(1)": 1, "O(log n)": 2, "O(n)": 3, "O(n log n)": 4, "O(n^2)": 5, "O(n^3)": 6 };

  function getRank(c) {
    if (c.includes("^")) return 5 + parseInt(c.split("^")[1]);
    const map = { "O(1)": 1, "O(log n)": 2, "O(n)": 3, "O(n log n)": 4, "O(n^2)": 5 };
    return map[c] || 1;
  }

  // --- HELPER: MULTIPLY COMPLEXITY BY LOOP DEPTH ---
  function multiplyComplexity(base, depth) {
    if (depth === 0) return base;
    
    let isLog = base.includes("log n");
    let power = 0;

    // 1. Extract existing power
    if (base.includes("O(1)")) {
        power = 0;
    } else if (base.includes("O(n^")) {
        power = parseInt(base.split("^")[1]); 
    } else if (base.includes("O(n")) {
        power = 1;
    }

    // 2. Add Loop Depth
    power += depth;

    // 3. Reconstruct
    if (power === 0) return "O(1)";
    if (power === 1) return isLog ? "O(n log n)" : "O(n)";
    return isLog ? `O(n^${power} log n)` : `O(n^${power})`;
  }

  // --- BLOCK WEIGHT ---
  function getBlockWeight(node) {
    if (!node) return "O(1)";

    let myComplexity = "O(1)";

    if (node.type === "lists_sort") myComplexity = "O(n log n)";
    else if (["lists_indexOf", "text_indexOf"].includes(node.type)) myComplexity = "O(n)";
    
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

  // --- CODE RECONSTRUCTOR ---
  function reconstructCode(node) {
    if (!node) return "...";
    
    // --- 1. FUNCTIONS (NEW) ---
    if (node.type === "procedures_defnoreturn" || node.type === "procedures_defreturn") {
      const name = node.fields?.NAME || "function";
      return `def ${name}(...):`;
    }
    if (node.type === "procedures_callnoreturn" || node.type === "procedures_callreturn") {
      const name = node.fields?.NAME || "function";
      return `${name}(...)`;
    }

    // --- 2. EXISTING HANDLERS ---
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
      // Simplified list display
      return `[ ... ]`;
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

    // --- UPDATED ALLOW LIST: Added "procedures_..." ---
    const statementBlocks = [
      "variables_set", "controls_if", "controls_for", 
      "controls_forEach", "controls_whileUntil", "controls_repeat_ext",
      "text_print", "lists_setIndex", "math_change",
      "procedures_defnoreturn", "procedures_defreturn", "procedures_callnoreturn"
    ];

    let lineComplexity = "O(1)";
    let color = "#27ae60"; // Green

    // 1. IS IT A LOOP?
    if (["controls_for", "controls_forEach", "controls_whileUntil", "controls_repeat_ext"].includes(node.type)) {
      const power = depth + 1;
      lineComplexity = (power === 1) ? "O(n)" : `O(n^${power})`;
      color = "#e67e22"; // Orange
    } 
    // 2. IS IT A FUNCTION DEF?
    else if (["procedures_defnoreturn", "procedures_defreturn"].includes(node.type)) {
       // Function definition itself is O(1). The code inside matters.
       lineComplexity = "O(1)";
       color = "#8e44ad"; // Purple
    }
    // 3. NORMAL STATEMENT
    else {
      const baseWeight = getBlockWeight(node);
      lineComplexity = multiplyComplexity(baseWeight, depth);

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
        // --- FIX: Check if the child is in our Allowed List ---
        if (statementBlocks.includes(child.type)) {
           const isLoop = ["controls_for", "controls_forEach", "controls_whileUntil", "controls_repeat_ext"].includes(node.type);
           // Recursion: If it's a loop, depth increases. If it's a function, depth stays same (or resets? Usually same context).
           traverseStatement(child, depth + (isLoop ? 1 : 0));
        }
      });
    }
  }

  if (ast) {
    ast.forEach(node => {
       // --- UPDATED ROOT CHECK: Include Functions ---
       const isStatement = [
        "variables_set", "controls_if", "controls_for", 
        "controls_forEach", "controls_whileUntil", "controls_repeat_ext",
        "text_print", "lists_setIndex", "math_change",
        "procedures_defnoreturn", "procedures_defreturn", "procedures_callnoreturn"
      ].includes(node.type);

      if (isStatement) traverseStatement(node);
    });
  }

  return { lines: result, total: totalComplexity };
}