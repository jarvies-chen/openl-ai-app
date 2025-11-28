# 03_Creating_Tables/01_Table_Recognition

## Chunk ID: CH3-RECOG-ALGO-001
### Section: 3.1 Table Recognition Algorithm
### Topic: Logical Table Detection
### Tags: ["Table Recognition", "Parsing", "Excel Structure", "Logical Tables"]

**Summary**
OpenL Tablets parses Excel workbooks by identifying logical tables within worksheets. The engine scans from left to right and top to bottom. A logical table is defined as a block of populated cells separated by at least one empty row or column from other tables.

**Key Rules**
*   **Separation:** Tables must be separated by at least one empty row or column.
*   **Start Point:** The first populated cell found that is not part of a previously parsed table becomes the top-left corner of a new logical table.
*   **Header Determination:** The engine determines table width and height using populated cells. It is best practice to merge all cells in the first row (header) to explicitly specify width.
*   **Titles:** To place a title above a table header, there must be an empty row between the title and the actual table header; otherwise, the title may be confused for the header.

---

## Chunk ID: CH3-RECOG-KW-001
### Section: 3.1 Table Recognition Algorithm
### Topic: Supported Table Keywords
### Tags: ["Keywords", "Table Types", "Syntax", "Recognition"]

**Summary**
The engine determines the type of an OpenL Table by reading the text in the top-left cell of the logical table. This cell must start with a predefined keyword. If a table does not start with a keyword, it is ignored and treated as a comment.

**Supported Keywords List**
*   **Rules:** Decision Table
*   **SimpleRules:** Simple Rules Table
*   **SmartRules:** Smart Rules Table
*   **SimpleLookup:** Simple Lookup Table
*   **SmartLookup:** Smart Lookup Table
*   **Spreadsheet:** Spreadsheet Table
*   **Data:** Data Table
*   **Datatype:** Datatype Table
*   **Test:** Test Table
*   **Run:** Run Table
*   **Method:** Method Table
*   **Environment:** Configuration Table
*   **Properties:** Properties Table
*   **Constants:** Constants Table
*   **ColumnMatch:** Column Match Table
*   **TBasic** or **Algorithm:** TBasic Table
*   **TablePart:** Table Part

**Cross-links**
*   See `04_Table_Types` for details on specific table structures.