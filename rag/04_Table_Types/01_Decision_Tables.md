# 04_Table_Types/01_Decision_Tables

## Chunk ID: CH4-DT-STRUCT-001
### Section: 3.3 Table Types - Decision Table
### Topic: Decision Table Structure and Header
### Tags: ["Decision Table", "Structure", "Syntax", "Keywords"]

**Summary**
A Decision Table is a matrix of conditions and actions. It evaluates a set of input parameters against rows of logic (rules) to determine an action or a return value.

**Table Header Syntax**
*   **Keyword:** `Rules` or `DT`
*   **Format:** `<Keyword> <Return Type> <Rule Name>(<Input Parameters>)`
*   **Example:** `Rules String Hello(int hour)`

**Row Structure**
1.  **Header Row:** Defines the table signature.
2.  **Properties (Optional):** Keyword `properties` followed by key-value pairs (e.g., `effectiveDate`).
3.  **Column Descriptors:** Codes indicating column function:
    *   `C` or `C1`, `C2`: **Condition**. Checks input values.
    *   `A` or `A1`: **Action**. Executes code if rule matches.
    *   `RET` or `RET1`: **Return**. Returns a value.
    *   `HC`: **Horizontal Condition** (Lookup tables only).
4.  **Expressions:** Code logic for the column (e.g., `hour < 12`).
5.  **Parameter Definitions:** Variable types and names for the expressions (e.g., `int min`, `int max`).
6.  **Display Names:** Human-readable titles (ignored by engine).
7.  **Data Rows:** The actual rules logic.

---

## Chunk ID: CH4-DT-LOGIC-001
### Section: 3.3 Table Types - Decision Table
### Topic: Interpretation and Execution Logic
### Tags: ["Decision Table", "Execution", "Logic", "Priority"]

**Summary**
Rules in a decision table are processed sequentially from top to bottom.

**Key Rules**
*   **AND Logic:** Within a single row, *all* conditions must be True for the rule to fire.
*   **OR Logic:** Different rows represent alternative scenarios (OR).
*   **Hit Policy:**
    *   If the table returns a value (`RET` column): The engine stops at the **first** matching row and returns that value.
    *   If the table performs actions (`A` column): The engine executes actions for **all** matching rows.
*   **Empty Cells:**
    *   **In Conditions:** Implies "Any value" (Always True).
    *   **In Return/Action:** The rule is ignored; the engine continues to the next row.

---

## Chunk ID: CH4-DT-LOOKUP-001
### Section: 3.3 Table Types - Lookup Tables
### Topic: Lookup Table Structure
### Tags: ["Decision Table", "Lookup Table", "2D Table", "Horizontal Conditions"]

**Summary**
A Lookup Table is a specialized Decision Table that uses both vertical and horizontal axes to determine a result, effectively creating a matrix.

**Structure Requirements**
*   Must have at least one **Vertical Condition** (`C`).
*   Must have at least one **Horizontal Condition** (`HC`).
*   Must have exactly one **Return** column (`RET`).
*   **Note:** The `RET` or `HC` columns typically appear to the right of the vertical conditions.

**Execution Logic**
The engine matches the vertical conditions (rows) and then the horizontal conditions (headers of the matrix) to find the intersecting cell, which contains the return value.

---

## Chunk ID: CH4-DT-ADV-001
### Section: 3.3 Table Types - Decision Table
### Topic: Referents and Rule IDs
### Tags: ["Decision Table", "Advanced", "Rule ID", "Syntax"]

**Summary**
Decision tables support advanced syntax for referencing other values or identifying which rule executed.

**Key Features**
*   **$Rule:** Returns the name of the rule execution.
*   **$RuleId:** Returns the implicit row number (ID) of the executed rule.
*   **Referents:** To use a value from a condition column inside a Return expression, use the syntax `$C<n>`, e.g., `$C1` refers to the value in the first condition column.
*   **Calculations:** Cells can contain formulas (starting with `=`) instead of static literals.