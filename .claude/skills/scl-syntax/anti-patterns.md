# SCL Anti-Pattern Catalog

Common mistakes and how to avoid them.

---

## AP1: Manual LIMIT Implementation

**Problem**:
```scl
// WRONG
IF val < min THEN
    val := min;
ELSIF val > max THEN
    val := max;
END_IF;
```

**Solution**:
```scl
// CORRECT
val := LIMIT(MN := min, IN := val, MX := max);
```

**Why**: 3x more efficient, more readable code, compiler-optimized.

**Performance Impact**: Manual clamping loop requires 3 comparisons and 2 assignments. LIMIT is a single CPU instruction.

---

## AP2: Manual Edge Detection

**Problem**:
```scl
// WRONG
IF NOT prevSignal AND signal THEN
    // action on edge
END_IF;
prevSignal := signal;
```

**Solution**:
```scl
// CORRECT
VAR
    risingEdge : R_TRIG;
END_VAR

#risingEdge(CLK := signal);
IF #risingEdge.Q THEN
    // action on edge
END_IF;
```

**Why**:
- R_TRIG/F_TRIG are native and reliable
- Do not miss edges during fast scans
- More readable and maintainable code
- Automatic management of previous state

**Risk of Manual Detection**: With variable scan time, manual edge detection can miss fast transitions.

---

## AP3: FOR Loop for Array Copy

**Problem**:
```scl
// WRONG
FOR i := 0 TO 99 DO
    destArray[i] := sourceArray[i];
END_FOR;
```

**Solution**:
```scl
// CORRECT
MOVE_BLK(IN := sourceArray, COUNT := 100, OUT => destArray);
```

**Why**:
- MOVE_BLK is system-level optimized
- DMA transfer when available
- ~10-20x faster than FOR loop
- Clearer and more intentional code

**Benchmark**:
- FOR loop (1000 elements): ~2-3 ms
- MOVE_BLK (1000 elements): ~0.2 ms

---

## AP4: Manual Scaling

**Problem**:
```scl
// WRONG
scaled := (rawValue - rawMin) * (engMax - engMin) / (rawMax - rawMin) + engMin;
```

**Solution**:
```scl
// CORRECT
scaled := SCALE_X(MIN := 0.0, VALUE := rawValue, MAX := 100.0);

// For custom range
scaled := NORM_X(MIN := rawMin, VALUE := rawValue, MAX := rawMax);
scaledEng := SCALE_X(MIN := engMin, VALUE := scaled, MAX := engMax);
```

**Why**:
- SCALE_X is optimized for ADC/DAC
- Automatically handles standard ranges (0-27648 for analog modules)
- Reduces calculation errors
- More readable

**Note**: SCALE_X assumes 0-100 input (percentage), NORM_X normalizes custom range.

---

## AP5: Timer in VAR_TEMP

**Problem**:
```scl
// WRONG - CAUSES SERIOUS ERROR!
VAR_TEMP
    myTimer : TON;  // ERROR: reset every cycle!
END_VAR

BEGIN
    #myTimer(IN := trigger, PT := T#5s);
    // Q will NEVER be TRUE because timer resets every cycle
END;
```

**Solution**:
```scl
// CORRECT
VAR
    myTimer : TON;  // Persistent memory between cycles
END_VAR

BEGIN
    #myTimer(IN := trigger, PT := T#5s);
    IF #myTimer.Q THEN
        // This works correctly
    END_IF;
END;
```

**Why**:
- Timer must maintain internal state (elapsed time, previous IN state)
- VAR_TEMP is completely reset every PLC cycle (typically 10-100ms)
- Result: timer never accumulates time, Q always remains FALSE

**General Rule**: Timer, Counter, Trigger, FB instances → VAR or VAR_STAT, NEVER VAR_TEMP.

**Same rule applies to**:
- TON, TOF, TP
- CTU, CTD, CTUD
- R_TRIG, F_TRIG
- Instances of any custom FB

---

## AP6: String Concatenation with +

**Problem**:
```scl
// WRONG
result := str1 + str2;  // Compile error! Not supported in SCL
```

**Solution**:
```scl
// CORRECT
result := CONCAT(IN1 := str1, IN2 := str2);

// For multiple strings
result := CONCAT(
    IN1 := CONCAT(IN1 := str1, IN2 := str2),
    IN2 := str3
);
```

**Why**:
- SCL does not support `+` operator for strings
- CONCAT is a native optimized function
- Supports up to String[254]

**Alternative for Multiple Strings**:
```scl
// Cleaner approach for 4+ strings
temp := CONCAT(IN1 := prefix, IN2 := name);
temp := CONCAT(IN1 := temp,   IN2 := suffix);
result := CONCAT(IN1 := temp, IN2 := extension);
```

---

## AP7: Float Equality Comparison

**Problem**:
```scl
// WRONG
IF temperature = 25.0 THEN
    // May never activate due to floating point errors!
END_IF;
```

**Solution**:
```scl
// CORRECT
VAR CONSTANT
    TOLERANCE : Real := 0.01;  // 1% tolerance
END_VAR

IF ABS(IN := temperature - 25.0) < TOLERANCE THEN
    // Comparison with tolerance
END_IF;
```

**Why**:
- Floating point has representation errors (IEEE 754)
- 0.1 + 0.2 is not exactly 0.3
- Direct comparison with `=` is almost always wrong

**Best Practice for Float**:
- Use `>`, `<`, `>=`, `<=` when possible
- If equality is required, use tolerance-based comparison
- For critical values, consider using scaled Int (e.g. mm instead of meters)

---

## AP8: Positional Parameters

**Problem**:
```scl
// WRONG
result := LIMIT(0, value, 100);  // Compile error!
#Motor1(startBtn, stopBtn, running);  // Compile error!
```

**Solution**:
```scl
// CORRECT
result := LIMIT(MN := 0, IN := value, MX := 100);
#Motor1(Start := startBtn, Stop := stopBtn, Running => running);
```

**Why**:
- SCL always requires named parameters for native functions and FBs
- Improves readability: clear which parameter is which
- Prevents errors from wrong order
- Allows optional parameters to be omitted

**Note**: `:=` for inputs, `=>` for outputs.

---

## AP9: Integer Division Without Cast

**Problem**:
```scl
// WRONG
VAR
    sum   : Int := 100;
    count : Int := 3;
    average : Real;
END_VAR

average := sum / count;  // Result: 33.0 (truncated!)
// Integer division: 100 / 3 = 33, then converted to Real
```

**Solution**:
```scl
// CORRECT
average := TO_REAL(sum) / TO_REAL(count);  // Result: 33.333...
```

**Why**:
- Division between integers returns an integer (truncated)
- Converting to Real after division is too late
- Convert to Real BEFORE dividing

**Rule**: For division with floating point result, convert both operands to Real first.

---

## AP10: ELSEIF Instead of ELSIF

**Problem**:
```scl
// WRONG
IF temp < 0 THEN
    state := 0;
ELSEIF temp < 100 THEN  // Compile error! ELSEIF does not exist in SCL
    state := 1;
END_IF;
```

**Solution**:
```scl
// CORRECT
IF temp < 0 THEN
    state := 0;
ELSIF temp < 100 THEN  // ELSIF! (no E at the end)
    state := 1;
ELSE
    state := 2;
END_IF;
```

**Why**:
- SCL uses `ELSIF` (derived from Pascal/Ada)
- Other languages (Python, C, JavaScript) use `ELSEIF`, `ELIF`, or `else if`
- Common mistake for programmers coming from other languages

**Reminder**: `ELSIF` in SCL, not `ELSEIF`, `ELIF`, or `else if`.

---

## AP11: Modifying FB Output Without Call

**Problem**:
```scl
// WRONG
VAR
    motor : FB_Motor;
END_VAR

motor.Running := TRUE;  // WRONG! Do not modify output directly
```

**Solution**:
```scl
// CORRECT
#motor(Start := TRUE, Stop := FALSE);  // Use input to control

IF #motor.Running THEN  // OK: reading output
    // Motor is running
END_IF;
```

**Why**:
- FB outputs are READ-ONLY from the caller
- Internal FB logic manages outputs
- Modifying outputs directly bypasses FB logic

**Rule**:
- FB inputs: write to control (`:=`)
- FB outputs: read to monitor
- Never modify FB outputs from outside

---

## AP12: Nested IF Instead of CASE

**Problem**:
```scl
// WRONG (for state machine)
IF state = 0 THEN
    // Idle
ELSIF state = 1 THEN
    // Starting
ELSIF state = 2 THEN
    // Running
ELSIF state = 3 THEN
    // Stopping
ELSIF state = 4 THEN
    // Error
END_IF;
```

**Solution**:
```scl
// CORRECT
CASE state OF
    0: // Idle
    1: // Starting
    2: // Running
    3: // Stopping
    4: // Error
    ELSE
        // Invalid state
        state := 4;  // Go to error
END_CASE;
```

**Why**:
- CASE is more readable for state machines
- Compiler generates jump table (O(1) instead of O(n))
- Easier to add/remove states
- ELSE catches invalid states

**When to Use CASE**:
- State machines
- Selection among 3+ discrete values
- Menus or operating modes

**When to Use IF-ELSIF**:
- Complex conditions (not a single value)
- Value ranges
- Combined boolean logic

---

## AP13: Manual Array Reset

**Problem**:
```scl
// WRONG
FOR i := 0 TO 99 DO
    dataArray[i] := 0;
END_FOR;
```

**Solution**:
```scl
// CORRECT
FILL_BLK(IN := 0, COUNT := 100, OUT => dataArray);

// For non-zero values
FILL_BLK(IN := initialValue, COUNT := 100, OUT => dataArray);
```

**Why**:
- FILL_BLK is system-level optimized
- ~10-15x faster than loop
- More declarative and clear code

---

## AP14: Manual MIN/MAX with IF

**Problem**:
```scl
// WRONG
IF sensor1 < sensor2 THEN
    minTemp := sensor1;
ELSE
    minTemp := sensor2;
END_IF;
```

**Solution**:
```scl
// CORRECT
minTemp := MIN(IN1 := sensor1, IN2 := sensor2);

// For 3+ values
minTemp := MIN(IN1 := sensor1, IN2 := sensor2, IN3 := sensor3);
```

**Why**:
- MIN/MAX are native and optimized
- Support up to 32 inputs
- More compact code
- Single CPU instruction

---

## AP15: Ignoring Error Handling

**Problem**:
```scl
// WRONG
result := SQRT(IN := userInput);  // If userInput < 0 -> silent error!
division := numerator / denominator;  // If denominator = 0 -> crash!
```

**Solution**:
```scl
// CORRECT
IF userInput >= 0.0 THEN
    result := SQRT(IN := userInput);
ELSE
    result := 0.0;
    errorFlag := TRUE;
END_IF;

IF denominator <> 0 THEN
    division := numerator / denominator;
ELSE
    division := 0.0;
    divisionByZeroError := TRUE;
END_IF;
```

**Why**:
- Input validation prevents runtime errors
- Defined behavior under abnormal conditions
- Safety: machine does not crash on invalid input

**Input Validation Best Practice**:
1. ALWAYS validate input from HMI/SCADA
2. Validate sensor input (physical range)
3. Validate divisors before division
4. Validate array index before access

---

## Quick Reference Anti-Patterns

| Anti-Pattern | Use Instead | Reason |
|---|---|---|
| Manual IF MIN/MAX | MIN()/MAX() | Native optimized |
| Manual IF LIMIT | LIMIT() | Single CPU instruction |
| Manual edge detection | R_TRIG/F_TRIG | Reliable, no missed edges |
| Array copy FOR loop | MOVE_BLK | 10-20x faster |
| Array fill FOR loop | FILL_BLK | 10-15x faster |
| Timer in VAR_TEMP | Timer in VAR | VAR_TEMP resets every cycle |
| String + operator | CONCAT() | + not supported for strings |
| Float equality = | ABS(a-b) < tol | Floating point imprecision |
| Positional parameters | Named parameters | Required by SCL |
| Integer division | TO_REAL() first | Prevents truncation |
| ELSEIF | ELSIF | Correct SCL syntax |
| Nested IF (state machine) | CASE OF | More readable, faster |
