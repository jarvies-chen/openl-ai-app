# 04_Table_Types/05_Execution_and_Other_Tables

## Chunk ID: CH4-TEST-TABLE-001
### Section: 3.3 Table Types
### Topic: Test Table
### Tags: ["Test Table", "Unit Testing", "Validation"]

**Summary**
A `Test` table performs unit testing on rules. It executes a target rule with specified input data and compares the actual result against an expected result.

**Structure**
*   **Keyword:** `Test`
*   **Header:** `Test <RuleName> <TestTableName>`
*   **Columns:**
    *   Input parameters of the rule.
    *   `_res_`: The expected result column.
    *   `_error_`: Expected error message (optional).
    *   `_context_`: Runtime context values (optional).

---

## Chunk ID: CH4-RUN-METHOD-001
### Section: 3.3 Table Types
### Topic: Run and Method Tables
### Tags: ["Run Table", "Method Table", "Execution", "Java"]

**Summary**
*   **Run Table:** Similar to a Test table but without validation. It simply executes the rule with the provided inputs. Useful for debugging or populating caches.
*   **Method Table:** Contains free-form code (OpenL rules syntax or Java). Used for complex logic that is difficult to express in a table format.
    *   **Header:** `Method <ReturnType> <Name>(<Inputs>)`

---

## Chunk ID: CH4-CONFIG-ENV-001
### Section: 3.3 Table Types
### Topic: Configuration and Properties Tables
### Tags: ["Configuration", "Environment", "Properties", "Dependencies"]

**Summary**
*   **Environment (Configuration) Table:** Manages dependencies and imports.
    *   `dependency`: Links to other OpenL modules.
    *   `import`: Imports Java packages or classes.
*   **Properties Table:** Defines global or category-level properties (e.g., `effectiveDate`) that apply to multiple tables, reducing the need to repeat them in every rule header.

---

## Chunk ID: CH4-OTHER-ALGOS-001
### Section: 3.3 Table Types
### Topic: Column Match and TBasic
### Tags: ["ColumnMatch", "Decision Tree", "TBasic", "Algorithm"]

**Summary**
*   **Column Match:** Implements a Decision Tree. Predefined algorithms include:
    *   `MATCH`: Maps conditions to a single return.
    *   `SCORE`: Sums weighted ratings.
    *   `WEIGHTED`: Combines Score and Match.
*   **TBasic:** A structured algorithm table for sequential logic, subroutines, and loops, offering a middle ground between Decision Tables and Java code.

---

## Chunk ID: CH4-CONST-PART-001
### Section: 3.3 Table Types
### Topic: Constants and Table Parts
### Tags: ["Constants", "Table Part", "Splitting"]

**Summary**
*   **Constants Table:** Defines static, named constant values available globally in the project (e.g., `pi = 3.14`).
*   **Table Part:** Allows splitting a very large table (exceeding Excel's row limits) across multiple sheets. The engine logically merges them back into a single table during execution.
    *   **Header:** `TablePart <TableID> <SplitType> {Current} of {Total}`
