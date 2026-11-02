# SCL-Syntax Skill Refactoring Summary

## Overview
The scl-syntax skill was refactored using Progressive Disclosure principles to improve
maintainability, reduce context window usage, and follow skill-creator best practices.
Translated from Italian/English bilingual to English only (v3.0).

---

## Changes Summary

### File Size

| File | Lines |
|---|---|
| SKILL.md | 478 |
| core-functions.md | 680 |
| anti-patterns.md | 519 |
| data-types.md | 478 |

### Structure

```
scl-syntax/
|-- SKILL.md                  <- Core workflow and critical rules
|-- REFACTORING_SUMMARY.md    <- This file
`-- scl-reference/
    |-- core-functions.md     <- 30 most common SCL functions
    |-- anti-patterns.md      <- Common mistakes and solutions
    |-- data-types.md         <- Complete data types reference
    |-- USAGE_EXAMPLE.md      <- Practical examples
    |-- index.json            <- Function index
    |-- schema.json           <- JSON schema
    `-- functions/            <- 222 function database
        |-- math.json
        |-- string.json
        |-- timers.json
        `-- ... (24 categories)
```

---

## What Changed in v3.0

### Language
- Removed Italian text entirely
- English only throughout all files
- Cleaner, faster to read

### SKILL.md
**KEPT**:
- 5 Critical Non-Negotiable Rules
- 3-Step Workflow
- FC vs FB Decision Tree
- Standard FC and FB templates
- Control Structures (IF, CASE, FOR, WHILE, REPEAT)
- Validation Checklist
- Quick Reference (keywords, operators)

**ADDED to checklist**:
- Encoding rule: Windows-1252 (ANSI), NOT UTF-8
- ASCII-only comments rule (no accented characters in SCL)
- S7_Optimized_Access := 'FALSE' for M1604 project

**UPDATED templates**:
- S7_Optimized_Access changed to FALSE (M1604 project standard)
- Added richer section comments (ASCII-only)
- FB template now uses #VariableName syntax correctly

### Reference Files
- **core-functions.md**: English only, same 30 functions, cleaner layout
- **anti-patterns.md**: English only, same 15 anti-patterns
- **data-types.md**: English only, same complete reference

---

## Progressive Disclosure Levels

1. **Level 1 - Metadata** (always in context): Name + Description (~100 words)
2. **Level 2 - Core** (when skill triggers): SKILL.md (~478 lines)
3. **Level 3 - Details** (when needed): Reference files + JSON database

---

## Project-Specific Rules Added (M1604 / LAUT)

The following rules were added for compatibility with the M1604 project at MWM Tupy do Brasil:

| Rule | Value | Reason |
|---|---|---|
| S7_Optimized_Access | FALSE | Allows absolute addressing (%M, %DB), LAD block compatibility |
| File encoding | Windows-1252 | TIA Portal V19 reads SCL sources in ANSI, not UTF-8 |
| Comment characters | ASCII 32-126 only | Accented characters corrupt in TIA Portal Openness import |
| Block type default | FC when no static vars | No instance DB needed, lighter footprint |

---

## Validation Checklist

- All 5 critical rules kept identical
- All templates kept and updated
- All 222 functions still accessible via JSON database
- Anti-patterns preserved
- Data types reference complete
- English only (no mixed Italian/English)
- Project-specific rules documented

---

**Skill Version**: 3.0
**Target**: TIA Portal V19/V20+ / S7-1500 / S7-1200
**Standard**: IEC 61131-3 SCL
**Language**: English
**Author**: Reginaldo Alexandre Ferreira
**Company**: LAUT Automacao Industrial
**Client**: MWM Tupy do Brasil
