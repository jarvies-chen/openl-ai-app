# 04_Table_Types/03_Data_and_Datatypes

## Chunk ID: CH4-DATATYPE-DEF-001
### Section: 3.3 Table Types - Datatype Table
### Topic: Defining Custom Data Models
### Tags: ["Datatype", "Data Model", "Structure", "Inheritance"]

**Summary**
A `Datatype` table defines a custom Java object (POJO) structure within Excel. It lists fields and their types.

**Structure**
*   **Header:** `Datatype <TypeName>`
*   **Inheritance:** `Datatype <TypeName> extends <ParentType>`
*   **Body:**
    *   Column 1: Field Type (e.g., `String`, `int`, `Date`).
    *   Column 2: Field Name.
    *   Column 3 (Optional): Default Value.

---

## Chunk ID: CH4-DATATYPE-ALIAS-001
### Section: 3.3 Table Types - Datatype Table
### Topic: Alias Datatypes (Vocabulary)
### Tags: ["Datatype", "Alias", "Vocabulary", "Domain"]

**Summary**
Alias types are used to restrict a simple type (like String or Integer) to a specific set of allowed values, creating a controlled vocabulary.

**Structure**
*   **Header:** `Datatype <AliasName> <BaseType>`
    *   Example: `Datatype USState String`
*   **Body:** A list of valid values.
*   **Validation:** OpenL validates that any data using this Alias type matches one of the defined values.

---

## Chunk ID: CH4-DATA-TABLE-001
### Section: 3.3 Table Types - Data Table
### Topic: Data Table Definition
### Tags: ["Data Table", "Test Data", "Storage"]

**Summary**
A `Data` table instantiates objects of a specific Datatype. It essentially acts as a database table or an array of objects defined in Excel.

**Structure**
*   **Header:** `Data <Type> <TableName>`
*   **Row 2:** Attribute names (fields of the Datatype).
*   **Row 3:** Display names (optional).
*   **Data Rows:** Values for the objects.

**Key Features**
*   **Primary Key:** A column named `_PK_` can be used to define a unique identifier for lookup.
*   **Foreign Keys:** Syntax `> <ReferenceTable> <Column>` allows validation against another Data table.
