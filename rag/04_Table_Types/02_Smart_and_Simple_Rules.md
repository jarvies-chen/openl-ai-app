# 04_Table_Types/02_Smart_and_Simple_Rules

## Chunk ID: CH4-SMART-RULES-001
### Section: 3.3 Table Types - Smart and Simple
### Topic: Smart Rules Table
### Tags: ["SmartRules", "Simplified Syntax", "Fuzzy Matching"]

**Summary**
`SmartRules` are a simplified version of Decision Tables designed for business users. They hide technical column descriptors (`C1`, `RET1`) and map columns to input parameters via fuzzy matching of column titles.

**Key Rules**
*   **Keyword:** `SmartRules`.
*   **Matching Logic:** The engine compares column titles (e.g., "Driver Age") with input parameter names (e.g., `driverAge`). It handles spaces and capitalization intelligently.
*   **Input:** Conditions check for equality or inclusion (ranges/arrays).
*   **Return:** The last column is implicitly the return value.
*   **Compound Return:** Can return complex objects by mapping multiple columns to the fields of the return type.

---

## Chunk ID: CH4-SIMPLE-RULES-001
### Section: 3.3 Table Types - Smart and Simple
### Topic: Simple Rules Table
### Tags: ["SimpleRules", "Simplified Syntax", "Positional Matching"]

**Summary**
`SimpleRules` are the most stripped-down table version. They do not use column titles for mapping. Instead, they map columns to input parameters strictly by **order**.

**Key Rules**
*   **Keyword:** `SimpleRules`.
*   **Mapping:** The 1st column maps to the 1st input parameter, 2nd to 2nd, etc.
*   **Constraint:** The number of condition columns must exactly match the number of input parameters.
*   **Return:** The last column is the return value.

---

## Chunk ID: CH4-DT-COLLECT-001
### Section: 3.3 Table Types
### Topic: Collecting Results (Array Return)
### Tags: ["Decision Table", "SmartRules", "Collect", "Arrays"]

**Summary**
Standard tables return the result of the *first* matching rule. To return *all* matching results as an array, the `Collect` keyword is used.

**Syntax**
*   **Smart/Simple Rules:** Add `Collect` before the return type in the header.
    *   Example: `SmartRules Collect String[] getMessages(int age)`
*   **Standard Decision Tables:** Use the `CRET` (Collect Return) column descriptor instead of `RET`.

---

## Chunk ID: CH4-DT-RANGES-001
### Section: 3.3 Table Types
### Topic: Ranges and Arrays in Conditions
### Tags: ["Syntax", "Ranges", "Arrays", "Conditions"]

**Summary**
OpenL Tables support defining ranges and lists of values directly in condition cells.

**Syntax**
*   **Ranges:** `1..5`, `<10`, `10-20`.
    *   Smart Rules support merging two columns to define Min/Max for a single parameter.
*   **Arrays:** Comma-separated values (e.g., `NY, CA, FL`).
    *   If a value contains a comma, escape it with a backslash: `\,`.
*   **Logic:** If a cell contains a range or array, the rule is True if the input parameter matches *any* value in that collection.