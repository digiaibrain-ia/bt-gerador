---
name: scl-syntax
description: "SCL (Structured Control Language) syntax assistance for Siemens TIA Portal V19/V20+ PLC programming.\nGenerates error-free SCL code using native functions from a 222-function database.\nWorks with S7-1200/S7-1500 controllers.\n\nUse this skill when:\n- Generating SCL code for Siemens PLCs\n- Creating Function Blocks (FB) or Functions (FC)\n- Working with TIA Portal SCL programming\n- Reviewing or debugging SCL code\n- Questions about SCL syntax, functions, or best practices\n- Converting logic to SCL from other languages\n- Implementing timers, counters, state machines in SCL\n"
---

# SCL Syntax Skill

SCL syntax assistance for Siemens TIA Portal V19/V20+ PLC programming.

---

## CRITICAL NON-NEGOTIABLE RULES

### R1: Named Parameters ALWAYS

All native function parameters MUST use named parameter syntax with `:=` for inputs and `=>` for outputs.

```scl
// CORRECT
result := LIMIT(MN := 0, IN := value, MX := 100);
#Motor1(Start := signal, Running => output);

// WRONG - COMPILE ERROR!
result := LIMIT(0, value, 100);
#Motor1(signal, output);
```

---

### R2: Persistent Storage for Timer/Counter/Trigger

Timer, Counter, Trigger MUST be declared in `VAR` (FB) or `VAR_STAT`, NEVER in `VAR_TEMP`.
VAR_TEMP resets every PLC cycle!

```scl
// WRONG
VAR_TEMP
    myTimer : TON;  // ERROR: timer resets every cycle!
END_VAR

// CORRECT
VAR
    myTimer : TON;  // OK: persistent memory between cycles
END_VAR
```

---

### R3: Use ELSIF Not ELSEIF

In SCL use `ELSIF`, not `ELSEIF`.

```scl
// CORRECT
IF temp < 0 THEN
    state := 'FROZEN';
ELSIF temp < 100 THEN    // ELSIF!
    state := 'LIQUID';
ELSE
    state := 'GAS';
END_IF;
```

---

### R4: Assignment := vs Output =>

Use `:=` for inputs, `=>` for outputs when calling a Function Block.

```scl
// CORRECT
#Motor1(
    Start := startButton,      // IN: use :=
    Speed := speedValue,       // IN: use :=
    Running => motorStatus,    // OUT: use =>
    Error => errorFlag         // OUT: use =>
);
```

---

### R5: FC vs FB

- **FC (Function)**: For stateless logic (calculations, transformations)
- **FB (Function Block)**: For stateful logic with persistent memory (motors, valves, sequences)

---

## Decision Tree: FC vs FB

```
Do you need persistent memory?
|
+-- NO  --> Use FC
|          Examples: calculations, conversions, averaging, validations
|
+-- YES --> Use FB
           Examples: motors, timers, sequences, state machines
```

---

## 3-Step Workflow

**STEP 1**: Identify block type
- Stateless logic (no internal state) → FC (Function)
- Stateful control with memory (motors, valves, sequences) → FB (Function Block)
- Global data → DB (Data Block) or PLC Tags

**STEP 2**: Check native functions
- **Core Functions**: For common functions (LIMIT, MIN, MAX, TON, CONCAT, etc.)
  → See `scl-reference/core-functions.md`
- **Extended Functions**: For 192 additional functions, consult JSON database
  → `scl-reference/functions/`
- **Usage Examples**: See `scl-reference/USAGE_EXAMPLE.md`

**STEP 3**: Validate with checklist
- Named parameters used ✓
- Timers in VAR (not VAR_TEMP) ✓
- ELSIF (not ELSEIF) ✓
- Check `scl-reference/anti-patterns.md` for common errors

---

## Standard Block Templates

### FC (Function) Template

```scl
FUNCTION "FC_Calculate_Average" : REAL
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1

VAR_INPUT
    values : Array[0..9] of Real;    // Input values array
    count : Int;                      // Number of elements
END_VAR

VAR_TEMP
    sum : Real;                       // Temporary sum
    i : Int;                          // Loop index
END_VAR

BEGIN
    // ================= GENERAL DESCRIPTION =================
    // Calculates the arithmetic average of an array of Real values.
    // Returns 0.0 if count is invalid (<=0 or >10).
    // Call example: avg := FC_Calculate_Average(values := myArray, count := 10);

    // ================= INPUT VALIDATION =================
    // Rejects invalid count to avoid division by zero or out-of-bounds.
    IF count <= 0 OR count > 10 THEN
        #FC_Calculate_Average := 0.0;
        RETURN;
    END_IF;

    // ================= AVERAGE CALCULATION =================
    // Accumulates all values then divides by count.
    sum := 0.0;
    FOR i := 0 TO count - 1 DO
        sum := sum + values[i];
    END_FOR;

    // Return result as Real
    #FC_Calculate_Average := sum / TO_REAL(count);
END_FUNCTION
```

---

### FB (Function Block - State Machine) Template

```scl
FUNCTION_BLOCK "FB_Motor_Control"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1

VAR_INPUT
    Start : Bool;           // Start command
    Stop : Bool;            // Stop command
    SpeedSetpoint : Real;   // Requested speed (RPM)
END_VAR

VAR_OUTPUT
    Running : Bool;         // Motor running
    ActualSpeed : Real;     // Current speed
    Alarm : Bool;           // Alarm flag
END_VAR

VAR
    State : Int;            // 0=Idle, 1=Starting, 2=Running
    StartTimer : TON;       // Start timer (MUST be in VAR!)
    ErrorCount : Int;       // Error counter
END_VAR

VAR_TEMP
    tempSpeed : Real;       // Temporary working variable
END_VAR

BEGIN
    // ================= GENERAL DESCRIPTION =================
    // Controls motor start/stop sequence with configurable ramp-up delay.
    // State machine: 0=Idle -> 1=Starting (2s delay) -> 2=Running.
    // Stop command returns to Idle from any state.
    // Alarm activates if speed exceeds 110% of maximum.

    // ================= STATE MACHINE =================
    // State 0: waiting for Start command
    // State 1: start delay (2 seconds)
    // State 2: running at setpoint speed
    CASE #State OF
        0: // Idle
            IF #Start AND NOT #Stop THEN
                #State := 1;
                #StartTimer(IN := FALSE, PT := T#0ms);  // Reset timer
            END_IF;
            #Running := FALSE;

        1: // Starting
            #StartTimer(IN := TRUE, PT := T#2s);
            IF #StartTimer.Q THEN
                #State := 2;
                #Running := TRUE;
            END_IF;
            IF #Stop THEN
                #State := 0;
            END_IF;

        2: // Running
            #Running := TRUE;
            // Limit speed between 0 and 3000 RPM
            #ActualSpeed := LIMIT(
                MN := 0.0,
                IN := #SpeedSetpoint,
                MX := 3000.0
            );
            IF #Stop THEN
                #State := 0;
                #Running := FALSE;
            END_IF;
    END_CASE;

    // ================= ALARM HANDLING =================
    // Activates alarm if speed exceeds 110% of maximum allowed.
    IF #ActualSpeed > 3000.0 * 1.1 THEN
        #Alarm := TRUE;
        #ErrorCount := #ErrorCount + 1;
    END_IF;
END_FUNCTION_BLOCK
```

---

## Control Structures

### IF-ELSIF-ELSE

```scl
// Simple conditional
IF temperature > 100.0 THEN
    alarm := TRUE;
END_IF;

// Full conditional
IF pressure < 1.0 THEN
    status := 'LOW';
ELSIF pressure > 10.0 THEN
    status := 'HIGH';
ELSE
    status := 'NORMAL';
END_IF;

// Combined conditions
IF (temp > 80.0) AND (pressure > 5.0) OR emergencyStop THEN
    shutdown := TRUE;
END_IF;
```

---

### CASE Statement (for State Machine)

```scl
CASE state OF
    0: // Idle
        Running := FALSE;
        IF StartCommand THEN
            state := 1;
        END_IF;

    1: // Starting
        Running := TRUE;
        IF startupComplete THEN
            state := 2;
        END_IF;

    2: // Running
        IF StopCommand THEN
            state := 3;
        END_IF;

    3: // Stopping
        IF shutdownComplete THEN
            state := 0;
        END_IF;

    ELSE
        // Invalid state - go to error
        state := 99;
        errorFlag := TRUE;
END_CASE;
```

---

### FOR Loop

```scl
// Ascending loop
FOR i := 0 TO 9 DO
    temperatures[i] := readSensor(i);
END_FOR;

// Descending loop
FOR i := 10 DOWNTO 0 DO
    buffer[i] := 0;
END_FOR;

// Custom increment
FOR i := 0 TO 100 BY 5 DO
    processValue(i);
END_FOR;

// Early exit
FOR i := 0 TO 99 DO
    IF data[i] = targetValue THEN
        foundIndex := i;
        EXIT;
    END_IF;
END_FOR;

// Skip iteration
FOR i := 0 TO 99 DO
    IF data[i] < 0 THEN
        CONTINUE;
    END_IF;
    processPositiveValue(data[i]);
END_FOR;
```

---

### WHILE Loop

```scl
// Pre-test (condition checked before execution)
WHILE counter < 100 DO
    counter := counter + 1;
    process(counter);
END_WHILE;

// With EXIT
WHILE TRUE DO
    data := readData();
    IF data = STOP_MARKER THEN
        EXIT;
    END_IF;
    processData(data);
END_WHILE;
```

---

### REPEAT Loop

```scl
// Post-test (executes at least once)
REPEAT
    counter := counter + 1;
    value := readSensor();
UNTIL (value > threshold) OR (counter >= maxRetries)
END_REPEAT;

// WARNING: REPEAT exits when condition is TRUE
// (opposite of WHILE which continues when TRUE)
```

---

## Reference Files

### When to Consult Each File

**For common native functions (LIMIT, MIN, MAX, TON, CONCAT, etc.)**:
→ Read `scl-reference/core-functions.md`
- 30 most used functions with practical examples
- Complete signatures, parameters, use cases

**For common errors to avoid**:
→ Read `scl-reference/anti-patterns.md`
- Catalog of 15+ anti-patterns with solutions
- Performance and correctness errors
- Correct vs wrong comparisons

**For data types (Int, Real, String, Array, Struct, etc.)**:
→ Read `scl-reference/data-types.md`
- Complete reference for elementary and complex types
- Type conversions
- Memory allocation best practices

**For functions beyond Core 30**:
→ Consult JSON database in `scl-reference/functions/`
- 192 additional functions organized by category
- Math, Comparison, Conversion, String, Move, Bitwise, Timers, Counters, Triggers

---

## Pre-Commit Checklist

Before finalizing any SCL code, verify all these points:

- [ ] **Named Parameters**: All native function parameters use `:=` (IN) and `=>` (OUT)
- [ ] **Timer Storage**: Timer/Counter/Trigger are in `VAR` (FB) or `VAR_STAT`, NEVER in `VAR_TEMP`
- [ ] **ELSIF Syntax**: Used `ELSIF` (not `ELSEIF`) in conditionals
- [ ] **Native Functions**: Checked core-functions.md, no manual reimplementation of LIMIT, MIN, MAX, etc.
- [ ] **Edge Detection**: Used R_TRIG/F_TRIG (not manual edge detection)
- [ ] **Array Operations**: Used MOVE_BLK/FILL_BLK (not FOR loop for copy/fill)
- [ ] **String Operations**: Used CONCAT (not + operator)
- [ ] **Input Validation**: Checks on input range and valid values
- [ ] **Error Handling**: Appropriate alarm/error handling
- [ ] **Block Type**: FC for stateless logic, FB for stateful logic
- [ ] **Encoding**: File saved in Windows-1252 (ANSI), NOT UTF-8
- [ ] **Comments**: ASCII only (no accented characters in SCL comments)
- [ ] **Optimized Access**: S7_Optimized_Access := 'FALSE' for M1604 project

---

## Quick Reference

**SCL Keywords**:
- `FUNCTION` / `FUNCTION_BLOCK` - Define block
- `VAR` / `VAR_INPUT` / `VAR_OUTPUT` / `VAR_TEMP` - Declaration sections
- `BEGIN` / `END_FUNCTION` / `END_FUNCTION_BLOCK` - Delimiters
- `IF` / `ELSIF` / `ELSE` / `END_IF` - Conditionals
- `CASE` / `OF` / `END_CASE` - Switch statement
- `FOR` / `TO` / `DOWNTO` / `BY` / `END_FOR` - Enumerated loop
- `WHILE` / `END_WHILE` - Pre-test loop
- `REPEAT` / `UNTIL` / `END_REPEAT` - Post-test loop
- `EXIT` / `CONTINUE` - Loop control
- `RETURN` - Exit function

**Operators**:
- `:=` - Assignment / Input parameter
- `=>` - Output parameter
- `=` - Comparison (equal)
- `<>` - Not equal
- `AND` / `OR` / `NOT` - Logical operators
- `&` / `|` / `XOR` - Bitwise operators

---

**Skill Version**: 3.0
**Target**: TIA Portal V19/V20+ / S7-1500 / S7-1200
**Standard**: IEC 61131-3 SCL
**Language**: English
**Project**: M1604 - MWM Tupy do Brasil / LAUT Automacao Industrial
