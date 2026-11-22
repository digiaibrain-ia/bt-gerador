---
name: siemens-wincc-001-js-styleguide
description: Apply and enforce the Siemens SIMATIC WinCC Unified JavaScript programming style guide (Siemens document 109758536). Use this skill whenever the user is writing, reviewing, generating, or debugging JavaScript code intended for SIMATIC WinCC Unified V16 or HMI Unified Comfort Panels in TIA Portal. Trigger this skill when the user mentions WinCC, WinCC Unified, SIMATIC HMI, TIA Portal scripts, HMIRuntime, screen scripting, or asks to review/generate JS for industrial HMI. Also trigger when the user shares JS code and asks for a review, style check, or cleanup — even if WinCC is not explicitly mentioned, if the context suggests industrial HMI scripting.
---

# WinCC Unified JavaScript Style Guide

This skill encodes the official Siemens programming style guide for JavaScript in SIMATIC WinCC Unified V16 and HMI Unified Comfort Panels. It covers both **code generation** (write new code already compliant) and **code review** (audit existing code against all rules).

The runtime uses Google V8, implementing ECMAScript 2015 (ES6). Rules are drawn from ESLint and adapted for TIA Portal consistency.

---

## Rule Classification

- **Rules** — mandatory; deviations must be documented in code comments.
- **Recommendations** — strongly encouraged; may be skipped with justification.

Rule IDs follow the pattern `PREFIX + 3-digit number` (e.g. `GR001`, `ST008`). Custom project rules may use numbers 901–999.

---

## TIA Portal Environment Settings

| Rule | Requirement |
|------|-------------|
| ES001 | Set TIA Portal UI language to **English** |
| ES002 | Set mnemonics to **International** |

---

## General Rules (GR)

- **GR001** ✅ Always use curly brackets `{}` for multi-line instructions (`if`, `while`, `function`).
- **GR002** ✅ Only use valid regular expressions. Validate at https://regexr.com/
- **GR003** ✅ Use strict equality operators `===` and `!==`. Never use `==` or `!=`.
- **GR004** 💡 Avoid assignment `=` inside conditions (`if`, `for`, `while`). Use `===` instead.
- **GR005** 💡 Avoid empty functions or empty instruction blocks.
- **GR006** 💡 Use single quotes `'` for strings. Use double quotes `"` only inside a string that already contains single quotes. Template literals `` ` `` are allowed with `${variable}` syntax.
- **GR007** 💡 Avoid the comma operator where only one expression is expected.

---

## Stylistic Rules (SR)

- **SR001** ✅ Indent with **2 spaces** (not tabs).
- **SR002** ✅ Maximum **2 consecutive empty lines** in code.
- **SR003** ✅ No space **before** punctuation (`,` `:` `;`). Always one space **after**.
- **SR004** ✅ End every statement with a semicolon `;`. Avoid redundant semicolons.
- **SR005** ✅ Surround keywords (`if`, `else`, `switch`, `return`, etc.) with spaces.
- **SR006** 💡 Insert a space before every opening instruction block `{`.
- **SR007** 💡 Insert spaces around all operators: `a = b + c;` not `a=b+c;`
- **SR008** 💡 Place commas at line **end**, not line start.
- **SR009** 💡 No trailing spaces at end of lines.
- **SR010** 💡 No empty lines at the start of a block or class.
- **SR011** 💡 No space between function name and `()` call: `myFn()` not `myFn ()`.
- **SR012** 💡 Space between function keyword and opening `(` in declarations: `function myFn (a) {}`.
- **SR013** 💡 Begin all comments with a space: `// comment` not `//comment`. Exception: separator lines `//***`.
- **SR014** 💡 Use only standard tabs/spaces for whitespace.
- **SR015** 💡 Keep strings on a single line. Use `'\n'` + concatenation for multiline strings.

---

## Script Variables, Arrays & Structures (ST)

### Naming & General
- **ST001** ✅ Use **camelCase** for all variable names: `machineState`, not `machine_State` or `MachineState`.
- **ST002** ✅ Variable names must be **unique**; no redeclaration; local variables must not shadow globals.
- **ST003** ✅ Use **dot notation** to access object properties: `Screen.Items('Rect1').BackColor`.
- **ST004** ✅ Never use reserved keywords or native names (`length`, `top`, `undefined`, `NaN`, `eval`, etc.) as variable or function names.
- **ST005** ✅ Do not create primitive wrapper objects (`new String()`, `new Number()`, `new Boolean()`).
- **ST006** 💡 Do not use octal escape sequences in strings. Use Unicode escapes instead.
- **ST007** 💡 Avoid unnecessary Boolean coercions (e.g. double negation `!!`).

### Declaration
- **ST008** ✅ Declare variables with `const` by default. Use `let` if the value changes. Avoid `var`.
- **ST009** ✅ Declare all variables at the **top** of their code block.
- **ST010** ✅ If `var` is unavoidable, only use the variable within the block where it was declared.
- **ST011** ✅ One variable declaration per line.
- **ST012** 💡 Only declare variables you actually use.
- **ST013** 💡 If `var` is unavoidable, declare it in the main function body — never in nested sub-functions.

### Comparing
- **ST014** ✅ Never compare a variable with itself (exception: `isNaN()` check).
- **ST015** ✅ To check for NaN, use `isNaN(x)` — never `x == NaN`.
- **ST016** ✅ Always pass the radix argument to `parseInt()`: `parseInt(value, 10)`.

### Numbers
- **ST017** ✅ Always write floating point numbers fully: `0.2` not `.2`; `5.0` not `5.`.
- **ST018** ✅ Never start a number literal with `0` (to avoid octal interpretation).

### Arrays & Structures
- **ST019** ✅ Separate array/object elements with commas. No trailing comma after the last element.
- **ST020** 💡 Do not create sparse arrays with empty slots: `['red','green','blue']` not `['red',,'blue']`.

---

## Functions & Objects (FO)

### Functions
- **FO001** ✅ Do not reassign a declared function. (Anonymous functions assigned to variables may be reassigned.)
- **FO002** ✅ A function must consistently either return a value or not. Define the return explicitly.
- **FO003** ✅ Do not overwrite a function's call parameters inside the function body.
- **FO004** ✅ IIFEs (immediately invoked functions) must be wrapped in parentheses: `(function() { ... })()`.
- **FO005** ✅ Never assign JavaScript code as a string to be executed (no implied `eval`).
- **FO006** ✅ Do not create functions using `new Function(...)`.
- **FO007** ✅ Do not call global objects as functions (`Math()`, `JSON()` are not functions).
- **FO008** 💡 Avoid single-line code blocks inside functions.
- **FO009** 💡 Avoid `eval()`. It is dangerous and often misused.
- **FO010** 💡 Avoid unnecessary use of `.bind()`.

### Objects
- **FO011** ✅ Always store a newly created object in a variable: `const obj = new MyObject();`
- **FO012** ✅ Object constructor names must start with a **capital letter**: `new Object()`, not `new object()`.
- **FO013** ✅ No duplicate property keys in an object literal.
- **FO014** ✅ Do not modify or extend native objects (e.g. `Array.prototype`, `Object.prototype`).
- **FO015** 💡 Prefer object literal syntax over object constructor: `const a = {}` not `const a = new Object()`.

---

## Conditional Instructions, Branches & Loops (IL)

- **IL001** ✅ When an `if` block ends with `return`, omit the `else` — place remaining code outside.
- **IL002** ✅ Never use a bare constant as a condition (`if (false)`, `while (true)` without justification).
- **IL003** ✅ In `for...in` loops, always check `hasOwnProperty()` before using the property.
- **IL004** ✅ Always define a `default` case in `switch` statements. If not applicable, add `// No Default`.
- **IL005** ✅ No duplicate `case` values in a `switch` statement.
- **IL006** ✅ Every `case` in a `switch` must end with `break`. If fall-through is intentional, add `// fall through`.
- **IL007** 💡 Avoid nested ternary operations. Use `if` instead.

---

## Expressions to Avoid (EA)

- **EA001** ✅ Never use `with()`. It makes scope resolution ambiguous.
- **EA002** ✅ Never use `arguments.caller` or `arguments.callee`. They are obsolete.
- **EA003** ✅ Never use `__proto__`. Use `Object.getPrototypeOf()` / `Object.setPrototypeOf()` instead.

---

## Diagnostics & Debugging (DD)

- **DD001** ✅ Use **only** `HMIRuntime.Trace()` for debug output in WinCC Unified. Do not use `console.log()` or `debugger`.
- Remove all `Trace()` calls before releasing code to production.

---

## Code Review Checklist

When reviewing existing JS code for WinCC Unified compliance, check each category in order:

1. **Environment** — ES001, ES002 (TIA Portal settings, out of scope of code itself)
2. **General** — GR001–GR007
3. **Style** — SR001–SR015 (indentation, spacing, semicolons, quotes)
4. **Variables** — ST001–ST020 (naming, declaration, comparison, numbers, arrays)
5. **Functions/Objects** — FO001–FO015
6. **Control Flow** — IL001–IL007
7. **Forbidden Expressions** — EA001–EA003
8. **Debugging** — DD001

For each violation found, report: rule ID, line/location, what is wrong, and the corrected version.

---

## Code Generation Guidelines

When generating new WinCC Unified JS code:

- Default to `const`; use `let` only when mutation is needed; never use `var`
- Always use `===` / `!==`
- Always terminate statements with `;`
- Indent with 2 spaces
- Use single quotes for strings
- Use `HMIRuntime.Trace()` for any debug output
- Name variables in camelCase, object constructors in PascalCase
- Declare all variables at the top of their block
- Include `default:` in every `switch`
- Include `break` in every `case`
- Never use `eval()`, `with()`, `__proto__`, `arguments.callee`

---

## Examples

### Compliant code snippet
```javascript
const motorSpeed = 0;
let currentState = 'idle';

function updateMotor (speed, state) {
  if (speed === 0) {
    HMIRuntime.Trace('Motor stopped');
    return;
  }
  currentState = state;
  HMIRuntime.Trace('Speed: ' + speed);
}

updateMotor(motorSpeed, currentState);
```

### Non-compliant → compliant
```javascript
// ❌ Non-compliant
var x = .5
if(x == 0.5){ doSomething() }

// ✅ Compliant
const x = 0.5;
if (x === 0.5) {
  doSomething();
}
```

---

## Reference

Official document: Siemens Industry Online Support — Article ID 109758536, V1.0, 11/2020  
ESLint rules reference: https://eslint.org/docs/rules/
