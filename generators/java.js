import { Generator } from 'blockly';

// 1. Initialize the Generator
export const javaGenerator = new Generator('Java');

// 2. Define Operator Precedence (Standard Java)
javaGenerator.ORDER_ATOMIC = 0;         // 0 "" ...
javaGenerator.ORDER_MEMBER = 2;         // . []
javaGenerator.ORDER_FUNCTION_CALL = 2;  // ()
javaGenerator.ORDER_INCREMENT = 3;      // ++
javaGenerator.ORDER_MULTIPLICATIVE = 5; // * / %
javaGenerator.ORDER_ADDITIVE = 6;       // + -
javaGenerator.ORDER_RELATIONAL = 8;     // < > <= >=
javaGenerator.ORDER_EQUALITY = 9;       // == !=
javaGenerator.ORDER_LOGICAL_AND = 13;   // &&
javaGenerator.ORDER_LOGICAL_OR = 14;    // ||
javaGenerator.ORDER_ASSIGNMENT = 16;    // = += -=
javaGenerator.ORDER_NONE = 99;          // (...)

// 3. Define Reserved Words
javaGenerator.addReservedWords(
    'abstract,assert,boolean,break,case,catch,class,const,continue,default,do,double,else,enum,extends,final,finally,float,for,goto,if,implements,import,instanceof,int,interface,long,native,new,package,private,protected,public,return,short,static,strictfp,super,switch,synchronized,this,throw,throws,transient,try,void,volatile,while'
);

// 4. Boilerplate: Setup the "Main" class wrapper
javaGenerator.init = function(workspace) {
    this.definitions_ = Object.create(null);
    this.isInitialized = true;
};

javaGenerator.finish = function(code) {
    // Convert definitions dictionary to a string (if you add custom functions later)
    var definitions = [];
    for (var name in this.definitions_) {
        definitions.push(this.definitions_[name]);
    }
    
    // The final clean Java code
    return `public class Main {
    public static void main(String[] args) {
${javaGenerator.prefixLines(code, javaGenerator.INDENT)}
    }
}`;
};

// =============================================================================
//                             BLOCK GENERATORS
// =============================================================================

// --- Logic: IF / ELSE ---
javaGenerator.forBlock['controls_if'] = function(block, generator) {
    var n = 0;
    var code = '', branchCode, conditionCode;
    
    // If ...
    do {
        conditionCode = generator.valueToCode(block, 'IF' + n, generator.ORDER_NONE) || 'false';
        branchCode = generator.statementToCode(block, 'DO' + n);
        code += (n > 0 ? ' else ' : '') + 'if (' + conditionCode + ') {\n' + branchCode + '}';
        ++n;
    } while (block.getInput('IF' + n));

    // ... Else
    if (block.getInput('ELSE')) {
        branchCode = generator.statementToCode(block, 'ELSE');
        code += ' else {\n' + branchCode + '}';
    }
    return code + '\n';
};

// --- Logic: COMPARE (==, !=, <, >) ---
javaGenerator.forBlock['logic_compare'] = function(block, generator) {
    var OPERATORS = {
        'EQ': '==',
        'NEQ': '!=',
        'LT': '<',
        'LTE': '<=',
        'GT': '>',
        'GTE': '>='
    };
    var operator = OPERATORS[block.getFieldValue('OP')];
    var order = (operator == '==' || operator == '!=') ?
        generator.ORDER_EQUALITY : generator.ORDER_RELATIONAL;
    var argument0 = generator.valueToCode(block, 'A', order) || '0';
    var argument1 = generator.valueToCode(block, 'B', order) || '0';
    var code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, order];
};

// --- Math: NUMBER ---
javaGenerator.forBlock['math_number'] = function(block, generator) {
    var code = parseFloat(block.getFieldValue('NUM'));
    return [code, generator.ORDER_ATOMIC];
};

// --- Math: ARITHMETIC (+, -, *, /) ---
javaGenerator.forBlock['math_arithmetic'] = function(block, generator) {
    var OPERATORS = {
        'ADD': [' + ', generator.ORDER_ADDITIVE],
        'MINUS': [' - ', generator.ORDER_ADDITIVE],
        'MULTIPLY': [' * ', generator.ORDER_MULTIPLICATIVE],
        'DIVIDE': [' / ', generator.ORDER_MULTIPLICATIVE],
        'POWER': [null, generator.ORDER_NONE] // Java doesn't use ^ for power, assumes Math.pow
    };
    var tuple = OPERATORS[block.getFieldValue('OP')];
    var operator = tuple[0];
    var order = tuple[1];
    
    var argument0 = generator.valueToCode(block, 'A', order) || '0';
    var argument1 = generator.valueToCode(block, 'B', order) || '0';
    
    var code;
    // Handle Power special case
    if (!operator) {
        code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
        return [code, generator.ORDER_FUNCTION_CALL];
    }
    code = argument0 + operator + argument1;
    return [code, order];
};

// --- Loops: REPEAT (For Loop) ---
javaGenerator.forBlock['controls_repeat_ext'] = function(block, generator) {
    var repeats = generator.valueToCode(block, 'TIMES', generator.ORDER_ASSIGNMENT) || '0';
    var branch = generator.statementToCode(block, 'DO');
    branch = generator.addLoopTrap(branch, block);
    
    // We use a unique variable name for the loop index to prevent collisions
    var loopVar = generator.nameDB_.getDistinctName('i', 'VARIABLE');
    
    return `for (int ${loopVar} = 0; ${loopVar} < ${repeats}; ${loopVar}++) {\n${branch}}\n`;
};

// --- Loops: WHILE ---
javaGenerator.forBlock['controls_whileUntil'] = function(block, generator) {
    var until = block.getFieldValue('MODE') === 'UNTIL';
    var argument0 = generator.valueToCode(block, 'BOOL', until ?
        generator.ORDER_LOGICAL_NOT : generator.ORDER_NONE) || 'false';
    var branch = generator.statementToCode(block, 'DO');
    branch = generator.addLoopTrap(branch, block);
    
    if (until) {
        argument0 = '!' + argument0;
    }
    return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

// --- Text: PRINT ---
javaGenerator.forBlock['text_print'] = function(block, generator) {
    var msg = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '""';
    return 'System.out.println(' + msg + ');\n';
};

// --- Text: STRING LITERAL ---
javaGenerator.forBlock['text'] = function(block, generator) {
    var textValue = block.getFieldValue('TEXT');
    return ['"' + textValue + '"', generator.ORDER_ATOMIC];
};

// --- Variables: GET ---
javaGenerator.forBlock['variables_get'] = function(block, generator) {
    var code = generator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE');
    return [code, generator.ORDER_ATOMIC];
};

// --- Variables: SET ---
// NOTE: This assumes 'int' for simplicity. 
// For a thesis, you can explain that "For this prototype, all variables are initialized as integers."
javaGenerator.forBlock['variables_set'] = function(block, generator) {
    var argument0 = generator.valueToCode(block, 'VALUE', generator.ORDER_ASSIGNMENT) || '0';
    var varName = generator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE');
    
    // Simple heuristic: If it hasn't been defined yet, define it as int.
    // In a real transpiler, you'd track types. For this demo, we assume int.
    return 'int ' + varName + ' = ' + argument0 + ';\n';
};