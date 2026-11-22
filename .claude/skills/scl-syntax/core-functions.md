# SCL Core 30 Functions Reference

Most commonly used Siemens native functions with practical examples.

---

## MATH FUNCTIONS (6 functions)

### 1. LIMIT - Value Limiting

**Signature**: `result := LIMIT(MN := <min>, IN := <value>, MX := <max>);`

**Parameters**:
- `MN` (IN: ANY_NUM) - Minimum value
- `IN` (IN: ANY_NUM) - Value to limit
- `MX` (IN: ANY_NUM) - Maximum value
- **Return**: ANY_NUM - Value clamped to [MN, MX]

**Description**:
Clamps IN to the range [MN, MX]. If IN < MN returns MN, if IN > MX returns MX, otherwise returns IN.

**Example**:
```scl
// Limit speed between 0 and 100 RPM
speed := LIMIT(MN := 0.0, IN := rawSpeed, MX := 100.0);
```

**Anti-Pattern**:
```scl
// WRONG:
IF val < min THEN
    val := min;
ELSIF val > max THEN
    val := max;
END_IF;

// CORRECT:
val := LIMIT(MN := min, IN := val, MX := max);
```

**Why Native**: Single CPU instruction, more efficient than 3 conditionals.

---

### 2. MIN - Minimum Value

**Signature**: `minValue := MIN(IN1 := <v1>, IN2 := <v2>, ...);`

**Parameters**:
- `IN1..IN32` (IN: ANY_NUM) - Values to compare (min 2, max 32)
- **Return**: ANY_NUM - Smallest value among all inputs

**Description**:
Returns the smallest value among 2-32 inputs. Supports Int, DInt, Real, LReal.

**Example**:
```scl
// Find minimum temperature among 3 sensors
tempMin := MIN(IN1 := sensor1, IN2 := sensor2, IN3 := sensor3);
```

---

### 3. MAX - Maximum Value

**Signature**: `maxValue := MAX(IN1 := <v1>, IN2 := <v2>, ...);`

**Parameters**:
- `IN1..IN32` (IN: ANY_NUM) - Values to compare (min 2, max 32)
- **Return**: ANY_NUM - Largest value among all inputs

**Example**:
```scl
// Find maximum pressure among 4 sensors
pressMax := MAX(IN1 := p1, IN2 := p2, IN3 := p3, IN4 := p4);
```

---

### 4. ABS - Absolute Value

**Signature**: `absValue := ABS(IN := <value>);`

**Parameters**:
- `IN` (IN: ANY_NUM) - Value to compute absolute value from
- **Return**: ANY_NUM - |IN|

**Example**:
```scl
// Calculate absolute error
error := ABS(IN := setpoint - actualValue);
```

---

### 5. SQRT - Square Root

**Signature**: `sqrtValue := SQRT(IN := <value>);`

**Parameters**:
- `IN` (IN: Real/LReal) - Value (must be >= 0)
- **Return**: Real/LReal - Square root of IN

**Description**:
Calculates square root. If IN < 0, returns 0 and sets error bit.

**Example**:
```scl
// Calculate Euclidean distance
distance := SQRT(IN := dx*dx + dy*dy);
```

---

### 6. SQR - Square

**Signature**: `sqrValue := SQR(IN := <value>);`

**Parameters**:
- `IN` (IN: ANY_NUM) - Value to square
- **Return**: ANY_NUM - IN squared

**Description**:
Calculates IN^2. More efficient than `IN * IN`.

**Example**:
```scl
// Calculate kinetic energy: E = (m * v^2) / 2
energy := (mass * SQR(IN := velocity)) / 2.0;
```

---

## TIMER FUNCTIONS (3 functions)

### 7. TON - Timer On-Delay

**Signature**: `#myTimer(IN := <trigger>, PT := <preset>);`

**Parameters**:
- `IN` (IN: Bool) - Timer start signal
- `PT` (IN: Time) - Preset time (e.g. T#5s)
- `Q` (OUT: Bool) - Timer output (TRUE when elapsed >= PT)
- `ET` (OUT: Time) - Elapsed time

**Description**:
Delayed activation timer. Q becomes TRUE after PT milliseconds from when IN becomes TRUE.

**Example**:
```scl
VAR
    startTimer : TON;  // MUST be in VAR!
END_VAR

// Start motor 2 seconds after start command
#startTimer(IN := startButton, PT := T#2s);
IF #startTimer.Q THEN
    motorRunning := TRUE;
END_IF;
```

**Timing Diagram**:
```
IN:  ___/----------\___
Q:   _______/------\___
        |<--PT-->|
```

---

### 8. TOF - Timer Off-Delay

**Signature**: `#myTimer(IN := <trigger>, PT := <preset>);`

**Parameters**:
- `IN` (IN: Bool) - Control signal
- `PT` (IN: Time) - Preset time
- `Q` (OUT: Bool) - Timer output
- `ET` (OUT: Time) - Elapsed time

**Description**:
Delayed deactivation timer. Q remains TRUE for PT milliseconds after IN becomes FALSE.

**Example**:
```scl
// Keep fan running 30s after heater switches off
#fanOffDelay(IN := heaterOn, PT := T#30s);
fanRunning := #fanOffDelay.Q;
```

**Timing Diagram**:
```
IN:  ---\___________/--
Q:   ----\________/---
          |<--PT-->|
```

---

### 9. TP - Timer Pulse

**Signature**: `#myTimer(IN := <trigger>, PT := <preset>);`

**Parameters**:
- `IN` (IN: Bool) - Trigger signal (rising edge)
- `PT` (IN: Time) - Pulse duration
- `Q` (OUT: Bool) - Pulse output
- `ET` (OUT: Time) - Elapsed time

**Description**:
Generates a fixed-duration pulse of PT on rising edge of IN.

**Example**:
```scl
// 500ms pulse on button press
#buttonPulse(IN := buttonPressed, PT := T#500ms);
IF #buttonPulse.Q THEN
    incrementCounter();
END_IF;
```

---

## COUNTER FUNCTIONS (3 functions)

### 10. CTU - Count Up

**Signature**: `#myCounter(CU := <pulse>, R := <reset>, PV := <preset>);`

**Parameters**:
- `CU` (IN: Bool) - Count up input (counts on rising edge)
- `R` (IN: Bool) - Reset counter (clears CV)
- `PV` (IN: Int) - Preset value (target count)
- `Q` (OUT: Bool) - TRUE when CV >= PV
- `CV` (OUT: Int) - Current value

**Example**:
```scl
VAR
    pieceCounter : CTU;  // Persistent memory
END_VAR

// Count 100 produced pieces
#pieceCounter(
    CU := pieceSensor,
    R  := resetButton,
    PV := 100
);

IF #pieceCounter.Q THEN
    batchComplete := TRUE;
END_IF;
```

---

### 11. CTD - Count Down

**Signature**: `#myCounter(CD := <pulse>, LD := <load>, PV := <preset>);`

**Parameters**:
- `CD` (IN: Bool) - Count down input (counts on rising edge)
- `LD` (IN: Bool) - Load preset (copies PV to CV)
- `PV` (IN: Int) - Preset value
- `Q` (OUT: Bool) - TRUE when CV <= 0
- `CV` (OUT: Int) - Current value

**Example**:
```scl
// Count down from 50
#countdown(
    CD := decrementPulse,
    LD := loadPreset,
    PV := 50
);

IF #countdown.Q THEN
    timeExpired := TRUE;
END_IF;
```

---

### 12. CTUD - Count Up/Down

**Signature**: `#myCounter(CU := <up>, CD := <down>, R := <reset>, LD := <load>, PV := <preset>);`

**Parameters**:
- `CU` (IN: Bool) - Count up input
- `CD` (IN: Bool) - Count down input
- `R` (IN: Bool) - Reset (CV := 0)
- `LD` (IN: Bool) - Load (CV := PV)
- `PV` (IN: Int) - Preset value
- `QU` (OUT: Bool) - TRUE when CV >= PV
- `QD` (OUT: Bool) - TRUE when CV <= 0
- `CV` (OUT: Int) - Current value

**Example**:
```scl
// Warehouse with entries and exits
#warehouseCounter(
    CU := itemEntered,
    CD := itemExited,
    R  := resetInventory,
    LD := FALSE,
    PV := 1000
);

IF #warehouseCounter.QU THEN
    warehouseFull := TRUE;
ELSIF #warehouseCounter.QD THEN
    warehouseEmpty := TRUE;
END_IF;
```

---

## EDGE DETECTION (2 functions)

### 13. R_TRIG - Rising Edge Trigger

**Signature**: `#myTrigger(CLK := <signal>);`

**Parameters**:
- `CLK` (IN: Bool) - Signal to monitor
- `Q` (OUT: Bool) - TRUE for one cycle on rising edge

**Description**:
Detects 0→1 transition. Q is TRUE for exactly one PLC cycle.

**Example**:
```scl
VAR
    startEdge : R_TRIG;
END_VAR

#startEdge(CLK := startButton);
IF #startEdge.Q THEN
    // Executed ONCE on the edge
    cycleCounter := cycleCounter + 1;
END_IF;
```

---

### 14. F_TRIG - Falling Edge Trigger

**Signature**: `#myTrigger(CLK := <signal>);`

**Parameters**:
- `CLK` (IN: Bool) - Signal to monitor
- `Q` (OUT: Bool) - TRUE for one cycle on falling edge

**Description**:
Detects 1→0 transition. Complementary to R_TRIG.

**Example**:
```scl
#stopEdge(CLK := runSignal);
IF #stopEdge.Q THEN
    // Executed when runSignal goes from TRUE to FALSE
    saveDataToLog();
END_IF;
```

---

## COMPARISON & SELECTION (5 functions)

### 15. SEL - Binary Select

**Signature**: `result := SEL(G := <selector>, IN0 := <value0>, IN1 := <value1>);`

**Parameters**:
- `G` (IN: Bool) - Selector (FALSE=IN0, TRUE=IN1)
- `IN0` (IN: ANY) - Value if G=FALSE
- `IN1` (IN: ANY) - Value if G=TRUE
- **Return**: ANY - IN0 or IN1 depending on G

**Example**:
```scl
// Select manual or automatic setpoint
activeSetpoint := SEL(
    G   := autoMode,
    IN0 := manualSetpoint,
    IN1 := autoSetpoint
);
```

---

### 16. MUX - Multiplexer

**Signature**: `result := MUX(K := <index>, IN0 := <v0>, IN1 := <v1>, ...);`

**Parameters**:
- `K` (IN: Int) - Index of input to select (0..N-1)
- `IN0..IN31` (IN: ANY) - Values to select from (max 32)
- **Return**: ANY - INK (or IN0 if K out of range)

**Example**:
```scl
// Select among 4 recipes
activeRecipe := MUX(
    K   := recipeNumber,
    IN0 := recipe1,
    IN1 := recipe2,
    IN2 := recipe3,
    IN3 := recipe4
);
```

---

### 17. ROL - Rotate Left

**Signature**: `result := ROL(IN := <value>, N := <count>);`

**Parameters**:
- `IN` (IN: Bit String) - Value to rotate (Byte/Word/DWord)
- `N` (IN: UInt) - Number of positions
- **Return**: Bit String - Rotated value

**Example**:
```scl
// Rotate bit pattern 3 positions left
pattern := ROL(IN := 16#0F, N := 3);  // 16#0F -> 16#78
```

---

### 18. ROR - Rotate Right

**Signature**: `result := ROR(IN := <value>, N := <count>);`

**Parameters**:
- `IN` (IN: Bit String) - Value to rotate
- `N` (IN: UInt) - Number of positions
- **Return**: Bit String - Rotated value

**Example**:
```scl
pattern := ROR(IN := 16#F0, N := 4);  // 16#F0 -> 16#0F
```

---

### 19. SHL - Shift Left

**Signature**: `result := SHL(IN := <value>, N := <count>);`

**Parameters**:
- `IN` (IN: Bit String) - Value to shift
- `N` (IN: UInt) - Number of positions
- **Return**: Bit String - Shifted value (fills with 0)

**Description**:
Logical left shift. Inserts 0 on the right. Equivalent to multiplication by 2^N.

**Example**:
```scl
// Multiply by 8 (2^3)
result := SHL(IN := 5, N := 3);  // 5 * 8 = 40
```

---

## CONVERSION FUNCTIONS (5 functions)

### 20. TRUNC - Truncate to Integer

**Signature**: `intValue := TRUNC(IN := <real>);`

**Parameters**:
- `IN` (IN: Real/LReal) - Floating point value to truncate
- **Return**: DInt - Integer part (no rounding)

**Description**:
Truncates toward zero. 3.7 → 3, -2.9 → -2.

**Example**:
```scl
// Extract integer part
whole := TRUNC(IN := 45.89);  // = 45
```

---

### 21. ROUND - Round to Nearest Integer

**Signature**: `rounded := ROUND(IN := <real>);`

**Parameters**:
- `IN` (IN: Real/LReal) - Value to round
- **Return**: DInt - Nearest integer

**Example**:
```scl
count := ROUND(IN := 7.4);  // = 7
count := ROUND(IN := 7.6);  // = 8
```

---

### 22. CEIL - Ceiling

**Signature**: `ceiling := CEIL(IN := <real>);`

**Parameters**:
- `IN` (IN: Real/LReal) - Input value
- **Return**: DInt - Smallest integer greater than or equal to IN

**Description**:
Always rounds up. 3.1 → 4, -2.9 → -2.

**Example**:
```scl
// Calculate number of batches required (round up)
batches := CEIL(IN := totalPieces / TO_REAL(batchSize));
```

---

### 23. FLOOR - Floor

**Signature**: `floor := FLOOR(IN := <real>);`

**Parameters**:
- `IN` (IN: Real/LReal) - Input value
- **Return**: DInt - Largest integer less than or equal to IN

**Description**:
Always rounds down. 3.9 → 3, -2.1 → -3.

**Example**:
```scl
batches := FLOOR(IN := ratio);
```

---

### 24. TO_REAL - Convert to Real

**Signature**: `realValue := TO_REAL(<int_value>);`

**Usage**: Converts Int/DInt/UInt to Real for floating point calculations.

**Example**:
```scl
average := TO_REAL(sum) / TO_REAL(count);
```

---

## STRING FUNCTIONS (3 functions)

### 25. CONCAT - String Concatenation

**Signature**: `result := CONCAT(IN1 := <str1>, IN2 := <str2>);`

**Parameters**:
- `IN1` (IN: String) - First string
- `IN2` (IN: String) - Second string
- **Return**: String - IN1 + IN2 concatenated

**Description**:
Joins two strings. SCL does NOT support the `+` operator for strings.

**Example**:
```scl
// Create diagnostic message
message := CONCAT(IN1 := 'Error on ', IN2 := deviceName);
// Result: "Error on Motor_1"
```

---

### 26. LEN - String Length

**Signature**: `length := LEN(IN := <string>);`

**Parameters**:
- `IN` (IN: String) - String to measure
- **Return**: Int - Number of characters (excluding terminator)

**Example**:
```scl
nameLength := LEN(IN := userName);
IF nameLength > 20 THEN
    // Name too long
END_IF;
```

---

### 27. LEFT - Left Substring

**Signature**: `result := LEFT(IN := <string>, L := <length>);`

**Parameters**:
- `IN` (IN: String) - Source string
- `L` (IN: Int) - Number of characters to extract
- **Return**: String - First L characters

**Example**:
```scl
// Extract prefix (first 5 characters)
prefix := LEFT(IN := 'MOTOR_001', L := 5);  // = "MOTOR"
```

---

## MOVE FUNCTIONS (3 functions)

### 28. MOVE - Move Value

**Signature**: `MOVE(IN := <source>, OUT => <destination>);`

**Parameters**:
- `IN` (IN: ANY) - Source value
- `OUT` (OUT: ANY) - Destination (must be same type)

**Example**:
```scl
MOVE(IN := sensorValue, OUT => processValue);
```

---

### 29. MOVE_BLK - Move Block

**Signature**: `MOVE_BLK(IN := <source>, COUNT := <n>, OUT => <dest>);`

**Parameters**:
- `IN` (IN: Variant) - Source array
- `COUNT` (IN: UDInt) - Number of elements
- `OUT` (OUT: Variant) - Destination array

**Description**:
Copies COUNT elements from source to destination array. Much faster than FOR loop.

**Example**:
```scl
// Copy 100 values
MOVE_BLK(IN := sourceArray, COUNT := 100, OUT => destArray);
```

---

### 30. FILL_BLK - Fill Block

**Signature**: `FILL_BLK(IN := <value>, COUNT := <n>, OUT => <array>);`

**Parameters**:
- `IN` (IN: ANY) - Value to replicate
- `COUNT` (IN: UDInt) - Number of elements
- `OUT` (OUT: Variant) - Destination array

**Description**:
Fills an array with the same value repeated COUNT times.

**Example**:
```scl
// Zero out array
FILL_BLK(IN := 0, COUNT := 100, OUT => dataBuffer);

// Initialize with default value
FILL_BLK(IN := 25.0, COUNT := 50, OUT => temperatures);
```

---

## Usage Notes

- **Named Parameters Required**: All these functions require named parameters (`:=` and `=>`).
- **Performance**: Native functions are firmware-optimized, much faster than manual implementations.
- **Type Safety**: The compiler verifies type compatibility — errors at compile time, not runtime.
- **Function vs Function Block**: Functions return a single value; FBs have persistent internal state.

For functions beyond these 30, consult the JSON database (`scl-reference/functions/`).
