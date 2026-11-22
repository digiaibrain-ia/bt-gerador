# SCL Data Types Reference

Complete SCL data types reference for TIA Portal V19/V20+.

---

## Elementary Types

### Boolean Types

```scl
VAR
    flag : Bool := FALSE;      // 1 bit: TRUE or FALSE
END_VAR

// Boolean constants
valve := TRUE;
pump  := FALSE;
```

**Range**: `FALSE` (0) or `TRUE` (1)
**Usage**: Flags, states, digital signals

---

### Integer Types

```scl
VAR
    // Signed integers
    tinyNum   : SInt := -128;           // -128..127 (8 bit)
    smallInt  : Int  := 100;            // -32768..32767 (16 bit)
    mediumInt : DInt := 1000000;        // -2^31..2^31-1 (32 bit)
    bigInt    : LInt := 1000000000000;  // -2^63..2^63-1 (64 bit)

    // Unsigned integers
    unsignedByte  : USInt := 255;      // 0..255 (8 bit)
    unsignedWord  : UInt  := 65535;    // 0..65535 (16 bit)
    unsignedDWord : UDInt := 4000000;  // 0..2^32-1 (32 bit)
    unsignedLWord : ULInt;             // 0..2^64-1 (64 bit)
END_VAR
```

**Range Summary**:
- `SInt`: -128 to 127
- `Int`: -32,768 to 32,767 ← **Most common**
- `DInt`: -2,147,483,648 to 2,147,483,647
- `LInt`: -9.22x10^18 to 9.22x10^18
- `USInt`: 0 to 255
- `UInt`: 0 to 65,535
- `UDInt`: 0 to 4,294,967,295
- `ULInt`: 0 to 1.84x10^19

**Best Practice**:
- Use `Int` for counters, indexes, state machines (default)
- Use `DInt` for timestamps, large counters
- Use `UInt` for always-positive values (speed, RPM)

---

### Floating Point Types

```scl
VAR
    temperature  : Real  := 25.5;        // 32-bit IEEE 754 (6-7 digits)
    preciseValue : LReal := 3.141592;    // 64-bit IEEE 754 (15-16 digits)
END_VAR

// Scientific notation
velocity   : Real := 1.5E3;    // 1500.0
smallValue : Real := 2.5E-4;   // 0.00025
```

**Precision**:
- `Real`: +/-1.18x10^-38 to +/-3.40x10^38 (6-7 significant digits)
- `LReal`: +/-2.23x10^-308 to +/-1.80x10^308 (15-16 significant digits)

**WARNING**: Do NOT use `=` to compare floats! Use tolerance:
```scl
IF ABS(IN := value1 - value2) < 0.001 THEN
    // Values are "equal" within tolerance
END_IF;
```

---

### Time Types

```scl
VAR
    delay     : Time  := T#5s;          // 5 seconds
    duration  : Time  := T#1h30m45s;    // 1 hour, 30 min, 45 sec
    shortPulse : Time := T#100ms;       // 100 milliseconds
    longDelay : LTime := LT#1d2h;       // 1 day, 2 hours (64-bit)
END_VAR

// Supported formats
pause   := T#1h30m;      // 1 hour 30 minutes
timeout := T#500ms;      // 500 milliseconds
cycle   := T#10s500ms;   // 10.5 seconds
```

**Time Literal Format**: `T#[d][h][m][s][ms][us][ns]`

**Examples**:
- `T#5s` - 5 seconds
- `T#2m30s` - 2 minutes 30 seconds
- `T#1h15m` - 1 hour 15 minutes
- `T#1d` - 1 day
- `T#500ms` - 500 milliseconds

**Range**:
- `Time`: -24d20h31m23s648ms to +24d20h31m23s647ms (32-bit)
- `LTime`: +/-292 years (64-bit, rare)

---

### Date and Time of Day

```scl
VAR
    today     : Date        := D#2024-12-25;    // Date only
    now       : Time_Of_Day := TOD#14:30:00;    // Time only
    timestamp : DTL;                             // Date Time Long (S7-1500 recommended)
END_VAR

// DTL Structure (S7-1500 recommended)
VAR
    currentTime : DTL;
END_VAR

// Access DTL fields
year   := currentTime.YEAR;    // 1970..2262
month  := currentTime.MONTH;   // 1..12
day    := currentTime.DAY;     // 1..31
hour   := currentTime.HOUR;    // 0..23
minute := currentTime.MINUTE;  // 0..59
second := currentTime.SECOND;  // 0..59
```

**DTL vs DATE_AND_TIME**:
- `DTL`: Modern, S7-1500, more precise, easily accessible
- `DATE_AND_TIME`: Legacy, S7-300/400, deprecated

---

### String Types

```scl
VAR
    message  : String;                  // Max 254 characters
    name     : String[20] := 'Motor1'; // Max 20 characters
    wideText : WString;                 // Unicode (16-bit char)
    fixed    : String[10] := 'Test';   // Maximum length 10
END_VAR

// String operations
length := LEN(IN := message);
result := CONCAT(IN1 := 'Error: ', IN2 := name);
```

**Limits**:
- `String`: Max 254 characters
- `WString`: Max 16383 Unicode characters
- Specify maximum length for efficient allocation: `String[N]`

**NOTE**: SCL does NOT support `+` operator for string concatenation! Use `CONCAT()`.

---

### Bit String Types

```scl
VAR
    statusByte  : Byte  := 16#FF;         // 8 bit
    controlWord : Word  := 16#0000;       // 16 bit
    statusDWord : DWord := 16#DEADBEEF;   // 32 bit
    statusLWord : LWord;                  // 64 bit
END_VAR

// Notation
mask  := 16#00FF;   // Hexadecimal
bits  := 2#11110000; // Binary
```

**Sizes**:
- `Byte`: 8 bit
- `Word`: 16 bit ← **Most common for I/O**
- `DWord`: 32 bit
- `LWord`: 64 bit

**Typical Usage**:
- Drive status words
- Packed control bits
- Masks for bitwise operations

---

## Complex Types

### Arrays

```scl
VAR
    // One-dimensional array
    temperatures : Array[0..9] of Real;        // 10 elements
    sensors      : Array[1..5] of Int;         // 5 elements (1-based index)

    // Multi-dimensional array
    matrix : Array[1..3, 1..3] of Int;         // 3x3 matrix
    cube   : Array[0..9, 0..9, 0..9] of Real;  // 3D array

    // Array of strings
    messages : Array[0..4] of String[50];
END_VAR

// Array access
temperatures[0] := 25.5;
value := sensors[3];
matrix[2, 3] := 100;

// Initialization with FILL_BLK
FILL_BLK(IN := 20.0, COUNT := 10, OUT => temperatures);
```

**Best Practices**:
- Typically 0-based index: `Array[0..N-1]`
- Declare the size you will actually use
- For large arrays (>100 elements), consider global DB

---

### Structures

```scl
VAR
    // Inline struct
    motorData : Struct
        running     : Bool;
        speed       : Real;
        current     : Real;
        temperature : Real;
        errorCode   : Int;
    End_Struct;

    // Array of structs
    motors : Array[1..5] of Struct
        id     : Int;
        name   : String[20];
        status : Bool;
    End_Struct;
END_VAR

// Field access
motorData.running := TRUE;
motorData.speed   := 1500.0;
currentValue := motorData.current;

// Struct in array
motors[1].id     := 101;
motors[1].name   := 'Spindle_Main';
motors[1].status := TRUE;
```

**User-Defined Type (UDT)**:
```scl
// Define UDT in PLC Data Types
TYPE "MotorType"
    STRUCT
        running : Bool;
        speed   : Real;
        current : Real;
    END_STRUCT;
END_TYPE

// Use UDT
VAR
    motor1      : "MotorType";
    motor2      : "MotorType";
    motorArray  : Array[1..10] of "MotorType";
END_VAR
```

---

## Type Conversions

### Explicit Conversions

```scl
// Integer <-> Real
realValue := TO_REAL(intValue);        // Int -> Real
intValue  := TRUNC(IN := realValue);   // Real -> Int (truncate)
intValue  := ROUND(IN := realValue);   // Real -> Int (round)

// Integer size conversions
dintValue := TO_DINT(intValue);        // Int -> DInt
intValue  := TO_INT(dintValue);        // DInt -> Int (watch for overflow!)

// Unsigned <-> Signed
uintValue := TO_UINT(intValue);
intValue  := TO_INT(uintValue);

// Bit string <-> Integer
wordValue := TO_WORD(intValue);        // Int -> Word
intValue  := TO_INT(wordValue);        // Word -> Int
```

**Common Conversion Functions**:
- `TO_INT()`, `TO_DINT()`, `TO_REAL()` - Convert to specific type
- `TRUNC()` - Real -> Int (truncate toward zero)
- `ROUND()` - Real -> Int (round to nearest)
- `CEIL()` - Real -> Int (round up)
- `FLOOR()` - Real -> Int (round down)

---

### Implicit Conversions

SCL has limited implicit conversions:

```scl
// OK: Widening (small -> large) is automatic
VAR
    i : Int  := 100;
    d : DInt;
END_VAR
d := i;  // OK: Int -> DInt implicit

// ERROR: Narrowing (large -> small) requires explicit conversion
i := d;         // ERROR!
i := TO_INT(d); // OK: explicit conversion
```

**Rule**:
- Small -> Large (widening): usually OK
- Large -> Small (narrowing): ALWAYS requires explicit conversion
- Signed <-> Unsigned: requires explicit conversion
- Int <-> Real: requires explicit conversion

---

## Type Selection Guidelines

**Bool**: Digital states (valve, pump on/off), flags, digital I/O signals

**Int**: Counters, enumerated states (0=Idle, 1=Running, 2=Error), array indexes, values up to +/-32k

**DInt**: Timestamps (ms since epoch), large counters, calculations that might exceed +/-32k

**Real**: Analog measurements (temperature, pressure, speed), math calculations, setpoints

**String**: Device names, HMI messages, text logging

**Array**: Homogeneous collections (10 temperatures, 5 speeds), data buffers, lookup tables

**Struct**: Groups of related data (motor data, recipe parameters), complex mixed-type data

---

## Memory Allocation

### Size Reference

| Type | Size | Notes |
|------|------|-------|
| Bool | 1 bit* | *Allocated in byte, 8 Bool = 1 byte |
| SInt/USInt | 1 byte | |
| Int/UInt | 2 bytes | |
| DInt/UDInt | 4 bytes | |
| LInt/ULInt | 8 bytes | |
| Real | 4 bytes | IEEE 754 single |
| LReal | 8 bytes | IEEE 754 double |
| Time | 4 bytes | |
| String | 2 + len | 2 byte header + characters |
| String[N] | 2 + N | Allocates N bytes |

### Memory Optimization

```scl
// Inefficient (3 bytes, but allocates 6 for alignment)
VAR
    flag1 : Bool;  // Byte 0
    value : Int;   // Byte 2-3 (aligned)
    flag2 : Bool;  // Byte 4
END_VAR

// Efficient (group Bools together)
VAR
    flag1 : Bool;  // Byte 0 bit 0
    flag2 : Bool;  // Byte 0 bit 1
    value : Int;   // Byte 2-3
END_VAR
```

**Best Practice**:
- Group consecutive Bool variables (up to 8 = 1 byte)
- Declare larger variables (Int, Real) after Bools for alignment
- Use `String[N]` with appropriate N (not always 254)

---

## Constants

```scl
VAR CONSTANT
    MAX_SPEED   : Real   := 3000.0;
    MIN_TEMP    : Real   := -40.0;
    PI          : Real   := 3.14159265;
    BUFFER_SIZE : Int    := 100;
    DEVICE_NAME : String := 'MainMotor';
END_VAR

// Usage
IF speed > MAX_SPEED THEN
    alarm := TRUE;
END_IF;
```

**Best Practice**:
- Use constants for "magic number" values
- UPPER_CASE names by convention
- Easier maintenance (change in one place only)

---

## Enumerations (S7-1500)

```scl
// Define in PLC Data Types
TYPE "MotorState"
    (
        IDLE     := 0,
        STARTING := 1,
        RUNNING  := 2,
        STOPPING := 3,
        ERROR    := 4
    );
END_TYPE

// Usage
VAR
    currentState : "MotorState";
END_VAR

currentState := "MotorState".IDLE;

CASE currentState OF
    "MotorState".IDLE:
        // ...
    "MotorState".STARTING:
        // ...
END_CASE;
```

**Advantages**:
- More readable code
- Type-safe (prevents assignment of invalid values)
- Autocomplete in TIA Portal

---

## Quick Type Selection

```
What do I need to store?
|
+-- On/Off, True/False          --> Bool
+-- Integer -32k..+32k          --> Int
+-- Larger integer              --> DInt
+-- Always positive             --> UInt/UDInt
+-- Decimal, analog measurement --> Real
+-- High precision decimal      --> LReal
+-- Duration, delay             --> Time
+-- Text, name                  --> String
+-- Collection of values        --> Array[...]
+-- Group of related data       --> Struct
```
