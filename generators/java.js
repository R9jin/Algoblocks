import * as Blockly from 'blockly/core';

// 1. Initialize the Generator
export const javaGenerator = new Blockly.Generator('Java');

// 2. Define Operator Precedence (Standard Java)
javaGenerator.ORDER_ATOMIC = 0;         
javaGenerator.ORDER_MEMBER = 2;         
javaGenerator.ORDER_FUNCTION_CALL = 2;  
javaGenerator.ORDER_INCREMENT = 3;      
javaGenerator.ORDER_MULTIPLICATIVE = 5; 
javaGenerator.ORDER_ADDITIVE = 6;       
javaGenerator.ORDER_RELATIONAL = 8;     
javaGenerator.ORDER_EQUALITY = 9;       
javaGenerator.ORDER_LOGICAL_AND = 13;   
javaGenerator.ORDER_LOGICAL_OR = 14;    
javaGenerator.ORDER_ASSIGNMENT = 16;    
javaGenerator.ORDER_NONE = 99;          

// 3. Define Reserved Words
javaGenerator.addReservedWords(
    'abstract,assert,boolean,break,case,catch,class,const,continue,default,do,double,else,enum,extends,final,finally,float,for,goto,if,implements,import,instanceof,int,interface,long,native,new,package,private,protected,public,return,short,static,strictfp,super,switch,synchronized,this,throw,throws,transient,try,void,volatile,while'
);

// 4. Initialization
javaGenerator.init = function(workspace) {
    this.definitions_ = Object.create(null);
    if (!this.nameDB_) {
        this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
    } else {
        this.nameDB_.reset();
    }
    this.nameDB_.setVariableMap(workspace.getVariableMap());
    this.isInitialized = true;
};

// 5. Finish (Wraps code in Main class)
// FIX: We now inject 'definitions' (functions) BEFORE 'main' but INSIDE the class.
javaGenerator.finish = function(code) {
    var definitions = [];
    for (var name in this.definitions_) {
        definitions.push(this.definitions_[name]);
    }
    
    return `import java.util.Arrays;

public class Main {
    
    // --- User Defined Functions ---
${javaGenerator.prefixLines(definitions.join('\n\n'), javaGenerator.INDENT)}

    public static void main(String[] args) {
${javaGenerator.prefixLines(code, javaGenerator.INDENT)}
    }
}`;
};

// =============================================================================
//                             CORE BLOCKS
// =============================================================================

// --- Logic: IF / ELSE ---
javaGenerator.forBlock['controls_if'] = function(block, generator) {
    var n = 0;
    var code = '', branchCode, conditionCode;
    do {
        conditionCode = generator.valueToCode(block, 'IF' + n, generator.ORDER_NONE) || 'false';
        branchCode = generator.statementToCode(block, 'DO' + n);
        code += (n > 0 ? ' else ' : '') + 'if (' + conditionCode + ') {\n' + branchCode + '}';
        ++n;
    } while (block.getInput('IF' + n));

    if (block.getInput('ELSE')) {
        branchCode = generator.statementToCode(block, 'ELSE');
        code += ' else {\n' + branchCode + '}';
    }
    return code + '\n';
};

// --- Logic: COMPARE ---
javaGenerator.forBlock['logic_compare'] = function(block, generator) {
    var OPERATORS = { 'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=' };
    var operator = OPERATORS[block.getFieldValue('OP')];
    var order = (operator === '==' || operator === '!=') ? generator.ORDER_EQUALITY : generator.ORDER_RELATIONAL;
    var argument0 = generator.valueToCode(block, 'A', order) || '0';
    var argument1 = generator.valueToCode(block, 'B', order) || '0';
    return [argument0 + ' ' + operator + ' ' + argument1, order];
};

// --- Logic: BOOLEAN ---
javaGenerator.forBlock['logic_boolean'] = function(block, generator) {
    var code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
    return [code, generator.ORDER_ATOMIC];
};

// --- Math: NUMBER ---
javaGenerator.forBlock['math_number'] = function(block, generator) {
    var code = parseFloat(block.getFieldValue('NUM'));
    return [code, generator.ORDER_ATOMIC];
};

// --- Math: ARITHMETIC ---
javaGenerator.forBlock['math_arithmetic'] = function(block, generator) {
    var OPERATORS = {
        'ADD': [' + ', generator.ORDER_ADDITIVE],
        'MINUS': [' - ', generator.ORDER_ADDITIVE],
        'MULTIPLY': [' * ', generator.ORDER_MULTIPLICATIVE],
        'DIVIDE': [' / ', generator.ORDER_MULTIPLICATIVE],
        'POWER': [null, generator.ORDER_NONE] 
    };
    var tuple = OPERATORS[block.getFieldValue('OP')];
    var operator = tuple[0];
    var order = tuple[1];
    var argument0 = generator.valueToCode(block, 'A', order) || '0';
    var argument1 = generator.valueToCode(block, 'B', order) || '0';
    
    if (!operator) {
        return ['Math.pow(' + argument0 + ', ' + argument1 + ')', generator.ORDER_FUNCTION_CALL];
    }
    return [argument0 + operator + argument1, order];
};

// --- Variables: GET ---
javaGenerator.forBlock['variables_get'] = function(block, generator) {
    var code = generator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE');
    return [code, generator.ORDER_ATOMIC];
};

// --- Variables: SET ---
javaGenerator.forBlock['variables_set'] = function(block, generator) {
    var argument0 = generator.valueToCode(block, 'VALUE', generator.ORDER_ASSIGNMENT) || '0';
    var varName = generator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE');
    // Heuristic: If value looks like an array start "{", treat as int[], else int
    if (argument0.trim().startsWith('{')) {
         return 'int[] ' + varName + ' = ' + argument0 + ';\n';
    }
    return 'int ' + varName + ' = ' + argument0 + ';\n';
};

// --- Text: PRINT ---
javaGenerator.forBlock['text_print'] = function(block, generator) {
    var msg = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '""';
    return 'System.out.println(' + msg + ');\n';
};

// --- Text: STRING ---
javaGenerator.forBlock['text'] = function(block, generator) {
    return ['"' + block.getFieldValue('TEXT') + '"', generator.ORDER_ATOMIC];
};

// =============================================================================
//                             NEW: LOOPS (For Sorting)
// =============================================================================

// --- Loops: FOR (Standard C-Style) ---
// Essential for: for (int i = 0; i < n; i++)
javaGenerator.forBlock['controls_for'] = function(block, generator) {
    var variable = generator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE');
    var from = generator.valueToCode(block, 'FROM', generator.ORDER_ASSIGNMENT) || '0';
    var to = generator.valueToCode(block, 'TO', generator.ORDER_ASSIGNMENT) || '0';
    var by = generator.valueToCode(block, 'BY', generator.ORDER_ASSIGNMENT) || '1';
    var branch = generator.statementToCode(block, 'DO');
    branch = generator.addLoopTrap(branch, block);

    // Heuristic: Assuming strictly Integer loops for sorting
    return `for (int ${variable} = ${from}; ${variable} <= ${to}; ${variable} += ${by}) {\n${branch}}\n`;
};

// --- Loops: WHILE ---
javaGenerator.forBlock['controls_whileUntil'] = function(block, generator) {
    var until = block.getFieldValue('MODE') === 'UNTIL';
    var argument0 = generator.valueToCode(block, 'BOOL', until ?
        generator.ORDER_LOGICAL_NOT : generator.ORDER_NONE) || 'false';
    var branch = generator.statementToCode(block, 'DO');
    branch = generator.addLoopTrap(branch, block);
    if (until) { argument0 = '!' + argument0; }
    return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

// =============================================================================
//                             NEW: LISTS (For Arrays/Sorting)
// =============================================================================

// --- Lists: CREATE (int[] arr = {1, 2, 3}) ---
javaGenerator.forBlock['lists_create_with'] = function(block, generator) {
    var elements = new Array(block.itemCount_);
    for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = generator.valueToCode(block, 'ADD' + i, generator.ORDER_NONE) || '0';
    }
    // Java Array Syntax
    var code = '{' + elements.join(', ') + '}';
    return [code, generator.ORDER_ATOMIC];
};

// --- Lists: GET INDEX (arr[i]) ---
javaGenerator.forBlock['lists_getIndex'] = function(block, generator) {
    var list = generator.valueToCode(block, 'VALUE', generator.ORDER_MEMBER) || 'arr';
    var at = generator.valueToCode(block, 'AT', generator.ORDER_NONE) || '0';
    
    // Adjust for 1-based indexing if Blockly defaults to it (Blockly usually 1-based, Java 0-based)
    // For CS students, we usually toggle Blockly to 0-based, but here we assume standard subtraction
    // Note: If you want 0-based blocks, we assume 'at' is already 0-based.
    
    // Safety check for first/last
    var mode = block.getFieldValue('WHERE');
    if (mode === 'FIRST') return [list + '[0]', generator.ORDER_MEMBER];
    if (mode === 'LAST')  return [list + '[' + list + '.length - 1]', generator.ORDER_MEMBER];
    
    // Standard FROM_START
    return [list + '[' + at + ']', generator.ORDER_MEMBER];
};

// --- Lists: SET INDEX (arr[i] = val) ---
javaGenerator.forBlock['lists_setIndex'] = function(block, generator) {
    var list = generator.valueToCode(block, 'LIST', generator.ORDER_MEMBER) || 'arr';
    var value = generator.valueToCode(block, 'TO', generator.ORDER_ASSIGNMENT) || '0';
    var at = generator.valueToCode(block, 'AT', generator.ORDER_NONE) || '0';
    
    var mode = block.getFieldValue('WHERE');
    if (mode === 'FIRST') return list + '[0] = ' + value + ';\n';
    if (mode === 'LAST')  return list + '[' + list + '.length - 1] = ' + value + ';\n';

    return list + '[' + at + '] = ' + value + ';\n';
};

// --- Lists: LENGTH (arr.length) ---
javaGenerator.forBlock['lists_length'] = function(block, generator) {
    var list = generator.valueToCode(block, 'VALUE', generator.ORDER_MEMBER) || 'arr';
    return [list + '.length', generator.ORDER_MEMBER];
};

// =============================================================================
//                             NEW: FUNCTIONS (For Recursion)
// =============================================================================

// --- Functions: DEFINE (Return) ---
javaGenerator.forBlock['procedures_defreturn'] = function(block, generator) {
    var funcName = generator.nameDB_.getName(block.getFieldValue('NAME'), 'PROCEDURE');
    var branch = generator.statementToCode(block, 'STACK');
    var returnVar = generator.valueToCode(block, 'RETURN', generator.ORDER_NONE) || '';
    
    // Arguments
    var args = [];
    var variables = block.getVars();
    for (var i = 0; i < variables.length; i++) {
        // Heuristic: Assume all parameters are 'int' for simplicity
        args.push('int ' + generator.nameDB_.getName(variables[i], 'VARIABLE'));
    }
    
    // Heuristic: Assume return type is 'int'
    var code = `public static int ${funcName}(${args.join(', ')}) {\n${branch}  return ${returnVar};\n}`;
    
    // Save to definitions so it appears outside Main
    generator.definitions_['%' + funcName] = code;
    return null;
};

// --- Functions: DEFINE (No Return) ---
javaGenerator.forBlock['procedures_defnoreturn'] = function(block, generator) {
    var funcName = generator.nameDB_.getName(block.getFieldValue('NAME'), 'PROCEDURE');
    var branch = generator.statementToCode(block, 'STACK');
    
    var args = [];
    var variables = block.getVars();
    for (var i = 0; i < variables.length; i++) {
        args.push('int ' + generator.nameDB_.getName(variables[i], 'VARIABLE'));
    }
    
    var code = `public static void ${funcName}(${args.join(', ')}) {\n${branch}}`;
    generator.definitions_['%' + funcName] = code;
    return null;
};

// --- Functions: CALL (Return) ---
javaGenerator.forBlock['procedures_callreturn'] = function(block, generator) {
    var funcName = generator.nameDB_.getName(block.getFieldValue('NAME'), 'PROCEDURE');
    var args = [];
    var variables = block.getArguments();
    for (var i = 0; i < variables.length; i++) {
        args.push(generator.valueToCode(block, 'ARG' + i, generator.ORDER_NONE) || '0');
    }
    return [funcName + '(' + args.join(', ') + ')', generator.ORDER_FUNCTION_CALL];
};

// --- Functions: CALL (No Return) ---
javaGenerator.forBlock['procedures_callnoreturn'] = function(block, generator) {
    var funcName = generator.nameDB_.getName(block.getFieldValue('NAME'), 'PROCEDURE');
    var args = [];
    var variables = block.getArguments();
    for (var i = 0; i < variables.length; i++) {
        args.push(generator.valueToCode(block, 'ARG' + i, generator.ORDER_NONE) || '0');
    }
    return funcName + '(' + args.join(', ') + ');\n';
};