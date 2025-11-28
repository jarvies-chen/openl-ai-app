# 03_Creating_Tables/04_Advanced_Properties

## Chunk ID: CH3-PROP-DEV-001
### Section: 3.2 Table Properties
### Topic: Dev Properties
### Tags: ["Properties", "Dev", "Configuration", "Execution Control"]

**Summary**
The "Dev" group properties control system behavior, caching, and validation settings.

**Key Dev Properties**
*   **id:** Unique identifier for direct calling of a specific table (bypassing dimension dispatching).
*   **validateDT:** Controls Decision Table validation (Values: `on`, `off`, `gap` (check coverage), `overlap`).
*   **failOnMiss:** If `TRUE`, throws error when no rule matches. If `FALSE`, returns `NULL`.
*   **cacheable:** If `TRUE` (recommended), caches results for identical inputs to improve performance.
*   **recalculate:** Used for variation support (`Always`, `Never`, `Analyze`).
*   **parallel:** Controls concurrent execution for array inputs.

---

## Chunk ID: CH3-PROP-VAR-001
### Section: 3.2 Table Properties
### Topic: Variation Properties (Recalculate)
### Tags: ["Properties", "Variation", "Recalculation", "Performance"]

**Summary**
Variations involve calculating a rule multiple times with modified arguments. The `recalculate` property optimizes this by defining which tables need reprocessing.

**Recalculate Values**
*   **Always:** The rule is entirely recalculated for every variation.
*   **Never:** The rule is NOT recalculated; cached/previous results are used.
*   **Analyze:** Used for top-level tables. The engine analyzes dependencies to decide what to recalculate.

**Usage Example**
In an insurance quote, if varying only the "Coverage Limit", the "Base Rate" rule (which doesn't depend on Limit) should be set to `recalculate = Never` to save processing time.

---

## Chunk ID: CH3-PROP-FILE-001
### Section: 3.2 Table Properties
### Topic: Properties Defined in File Name
### Tags: ["Properties", "File Name", "Configuration", "CW Property"]

**Summary**
Module-level properties can be extracted directly from the Excel filename to avoid manual entry in tables. This requires configuring a `properties-file-name-pattern` in `rules.xml` or WebStudio.

**Pattern Syntax**
*   Uses `%property%` syntax.
*   Supports date formats: `%effectiveDate:MMddyyyy%`.
*   Example Pattern: `AUTO-%state%-%effectiveDate:MMddyyyy%`
*   Example Filename: `AUTO-FL-01012014.xlsx` -> Sets State=FL, Effective Date=Jan 1, 2014.

**CW (Country Wide) Feature**
*   If the `CWPropertyFileNameProcessor` is enabled, a specific value (e.g., "CW") in the filename can be mapped to "All values" (e.g., All States) for a specific property.
