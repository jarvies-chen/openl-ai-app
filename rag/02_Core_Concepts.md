# 02_Core_Concepts

## Chunk ID: CH2-CORE-RULES-001
### Section: 2.2 Basic Concepts
### Topic: Rules
### Tags: ["Core Concepts", "Rules", "Logic"]

**Summary**
A **Rule** in OpenL Tablets is a logical statement comprising conditions and actions, functioning as an IF-THEN structure.

**Key Characteristics**
*   **Logic:** If the conditions of a rule are met (True), the associated actions are executed.
*   **Return Values:** Rules can perform actions or return specific data values to the calling application.
*   **Example:** "If service cost < $1,000 AND time < 8 hours, THEN approve automatically."

---

## Chunk ID: CH2-CORE-TABLES-001
### Section: 2.2 Basic Concepts
### Topic: Tables
### Tags: ["Core Concepts", "Tables", "Excel"]

**Summary**
**Tables** are the visual mechanism used to present all information in OpenL Tablets.

**Key Characteristics**
*   **Container:** Rules, data, datatypes, and configuration are all defined within tables.
*   **Types:** Different table types exist for different purposes (e.g., Decision Tables for logic, Data Tables for storage, Spreadsheet Tables for calculation).
*   **Recognition:** The engine identifies tables in Excel based on specific formatting and keywords.

---

## Chunk ID: CH2-CORE-PROJECTS-001
### Section: 2.2 Basic Concepts
### Topic: Projects
### Tags: ["Core Concepts", "Projects", "Modules"]

**Summary**
an **OpenL Tablets Project** is the top-level container for a rule repository.

**Structure**
*   **Modules:** A project contains one or more Excel files, referred to as Modules.
*   **Resources:** It holds all necessary resources, including the Excel files, library dependencies, and optionally Java code.
*   **Usage:** Projects are primarily used in the development environment to organize and manage the rule lifecycle.