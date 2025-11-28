# 04_Table_Types/04_Spreadsheets

## Chunk ID: CH4-SPR-STRUCT-001
### Section: 3.3 Table Types - Spreadsheet
### Topic: Spreadsheet Table Structure
### Tags: ["Spreadsheet", "Structure", "Calculations"]

**Summary**
A Spreadsheet table mimics an Excel sheet with row and column headers. It is used for complex multi-step calculations where intermediate results are referenced by name.

**Structure**
*   **Header:** `Spreadsheet SpreadsheetResult <Name>(<Inputs>)`
*   **First Row/Column:** Define the names of the steps (Rows) and categories (Columns).
*   **Cells:** Contain expressions, formulas, or calls to other rules.

**Return Type**
*   **SpreadsheetResult:** Returns a complex object containing all calculated cells (a map of results).
*   **Custom Type:** Can return a single value if a row/column is marked with the `RETURN` keyword.

---

## Chunk ID: CH4-SPR-REF-001
### Section: 3.3 Table Types - Spreadsheet
### Topic: Referencing Cells in Spreadsheets
### Tags: ["Spreadsheet", "Syntax", "References", "Formulas"]

**Summary**
Formulas in a Spreadsheet table can reference other cells by their Row and Column names.

**Reference Syntax**
*   `$ColumnName`: Value in a specific column of the *current* row.
*   `$RowName`: Value in a specific row of the *current* column.
*   `$ColumnName$RowName`: Absolute reference to a specific cell.
*   **Self-Reference:** Formulas start with `=` or are enclosed in `{ }`.

**Auto Type Discovery**
By default (`autoType = true`), the engine automatically determines the data type of a cell based on the calculation result.
