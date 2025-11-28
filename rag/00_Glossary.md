# 00_Glossary

## Chunk ID: GLOS-B-001
### Section: Glossary
### Topic: BEX (Business Expression)
### Tags: ["Glossary", "BEX", "Syntax", "Language"]

**Definition**
**BEX (Business Expression)** is the language used in OpenL Tablets for writing expressions in rules. It extends standard Java grammar with natural language semantics (e.g., using "is less than" instead of `<`), allowing business users to write logic that resembles human sentences while mapping automatically to the underlying Java object model.

---

## Chunk ID: GLOS-B-002
### Section: Glossary
### Topic: BRMS / BRE
### Tags: ["Glossary", "BRMS", "BRE", "Definition"]

**Definition**
*   **BRMS (Business Rules Management System):** A software system used to define, deploy, execute, monitor, and maintain the variety and complexity of decision logic that is used by operational systems within an organization or enterprise.
*   **BRE (Business Rules Engine):** The runtime component that executes the rules. OpenL Tablets functions as both.

---

## Chunk ID: GLOS-D-001
### Section: Glossary
### Topic: Decision Table
### Tags: ["Glossary", "Table Types", "Decision Table"]

**Definition**
A **Decision Table** is a tabular representation of logic where conditions are listed in columns (or rows) and the intersection of specific condition values determines an action or a return value. It is the most common way to represent conditional logic in OpenL.

---

## Chunk ID: GLOS-M-001
### Section: Glossary
### Topic: Module
### Tags: ["Glossary", "Project Structure", "Module"]

**Definition**
A **Module** is a single Excel file (`.xls`, `.xlsx`, `.xlsm`) containing OpenL tables. A Project is composed of one or more modules. Rules within a module can access rules in other modules within the same project.

---

## Chunk ID: GLOS-P-001
### Section: Glossary
### Topic: Project
### Tags: ["Glossary", "Project Structure", "Container"]

**Definition**
An **OpenL Tablets Project** is a container for all resources required to process a set of rules. It typically includes one or more Excel files (Modules), a `rules.xml` descriptor file, and optionally Java libraries or source code.

---

## Chunk ID: GLOS-R-001
### Section: Glossary
### Topic: Rule
### Tags: ["Glossary", "Core Concepts", "Rule"]

**Definition**
A **Rule** is a logical statement consisting of conditions (IF) and actions/return values (THEN). In OpenL, rules are encapsulated within Tables. When a rule is called, if its conditions are met, the associated action is executed or a value is returned.

---

## Chunk ID: GLOS-R-002
### Section: Glossary
### Topic: Runtime Context
### Tags: ["Glossary", "Context", "Versioning"]

**Definition**
**Runtime Context** is a set of contextual parameters (e.g., Current Date, US State, Line of Business) passed to the engine at runtime. OpenL uses these values to dynamically select the correct version of a rule when multiple versions exist (Rule Overloading/Versioning).

---

## Chunk ID: GLOS-S-001
### Section: Glossary
### Topic: Spreadsheet Table
### Tags: ["Glossary", "Table Types", "Spreadsheet"]

**Definition**
A **Spreadsheet Table** in OpenL mimics the functionality of an Excel spreadsheet. It allows for defining steps, formulas, and dependencies between cells to perform complex multi-step calculations. It returns a `SpreadsheetResult` object.

---

## Chunk ID: GLOS-T-001
### Section: Glossary
### Topic: Table
### Tags: ["Glossary", "Core Concepts", "Table"]

**Definition**
A **Table** is the fundamental unit of definition in OpenL Tablets. All logic, data, data types, and configurations are defined inside tables drawn in Excel worksheets. The type of table (Decision, Datatype, Test, etc.) is defined by the keyword in its header.

---

## Chunk ID: GLOS-W-001
### Section: Glossary
### Topic: WebStudio
### Tags: ["Glossary", "Tools", "WebStudio"]

**Definition**
**OpenL Tablets WebStudio** is a web-based application used by business analysts and developers to manage, edit, test, and verify OpenL Tablets projects and rules.