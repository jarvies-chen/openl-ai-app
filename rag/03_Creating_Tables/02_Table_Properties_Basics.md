# 03_Creating_Tables/02_Table_Properties_Basics

## Chunk ID: CH3-PROP-STRUCT-001
### Section: 3.2 Table Properties
### Topic: Property Section Structure
### Tags: ["Properties", "Syntax", "Table Structure"]

**Summary**
Table properties define metadata about a table (e.g., validity dates, authors, version). They are located in an optional section immediately after the table header and before the table body.

**Structure Rules**
*   **Location:** Immediately following the table header row.
*   **Keyword:** The row starts with the keyword `properties`.
*   **Formatting:** The `properties` cell is merged across all columns if multiple properties are defined.
*   **Key-Value Pairs:** Each property row consists of a Property Name (2nd column) and Property Value (3rd column).
*   **Exclusions:** Properties cannot be defined for `Properties Table`, `Configuration Table`, or non-OpenL tables.

**Example (Text Representation)**
```text
| Rules DoubleValue DriverAgeType ... | (Header) |
| properties                          |          |
| gender                              | Male     | (Property 1)
| age                                 | <25      | (Property 2)
| ...                                 | ...      | (Table Body)
```

---

## Chunk ID: CH3-PROP-LEVELS-001
### Section: 3.2 Table Properties
### Topic: Property Scope and Inheritance
### Tags: ["Properties", "Scope", "Inheritance", "Module Level", "Category Level"]

**Summary**
Properties can be defined at the Table, Category, or Module level. This allows for hierarchical inheritance where broader properties (like "Project Name") are defined once and inherited by specific tables.

**Inheritance Priority (Highest to Lowest)**
1.  **Table:** Defined directly in the table's property section.
2.  **Category:** Defined in a `Properties Table` with `scope = Category`.
3.  **Module:** Defined in a `Properties Table` with `scope = Module` or via the file name.
4.  **Default Value:** Predefined in OpenL configuration.

**Key Rules**
*   **Module Level:** Applies to all tables in the Excel file. Can be defined in a `Properties Table` or the file name.
*   **Category Level:** Applies to tables within a specific category (usually the worksheet name).
*   **Properties Table:** A special table type used exclusively to define Category or Module level properties.

**Cross-links**
*   See Chunk ID: CH3-PROP-FILE-001 for File Name properties.

---

## Chunk ID: CH3-PROP-INFO-001
### Section: 3.2 Table Properties (Info Properties)
### Topic: Info Group Properties
### Tags: ["Properties", "Info", "Metadata", "Tags"]

**Summary**
The "Info" group properties provide descriptive metadata about the table for documentation and search purposes.

**Property List**
*   **name:** Technical name of the table.
*   **category:** Categorizes the table (default is the Worksheet name).
*   **description:** Human-readable explanation of the table's purpose.
*   **tags:** Comma-separated keywords for search (String[]).
*   **createdBy / createdOn:** Audit trail for creation (System managed).
*   **modifiedBy / modifiedOn:** Audit trail for modification (System managed).
