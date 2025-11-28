# 06_Working_with_Projects

## Chunk ID: CH5-PROJ-STRUCT-001
### Section: 5.1 Project Structure
### Topic: Project Organization and Sources
### Tags: ["Project Structure", "Modules", "rules.xml", "Classpath", "WebStudio"]

**Summary**
An OpenL Tablets project is a container for Excel files (modules) and configuration. It typically follows a structure compatible with Maven or standard file systems.

**Key Components**
*   **Modules:** Excel files containing the actual rule tables. In a "Multi Module Project," all modules have mutual access to each other's tables/rules.
*   **rules.xml:** The project descriptor file located in the root. It defines:
    *   Project configuration.
    *   Module definitions.
    *   **Classpath:** References to external libraries (JARs) or compiled Java classes required by the rules.
*   **Creation:** Projects are best created using templates within OpenL WebStudio to ensure the correct structure is generated.

---

## Chunk ID: CH5-RUNTIME-CONTEXT-001
### Section: 5.2 Rules Runtime Context
### Topic: Context and Rule Overloading
### Tags: ["Runtime Context", "Overloading", "Business Dimension", "Dispatching"]

**Summary**
Runtime Context enables **Rule Overloading**. This allows users to define multiple versions of the same rule (same name and signature) that differ only by specific business dimensions (e.g., US State, Region, LOB).

**How It Works**
1.  **Definition:** A "base" rule is defined.
2.  **Overloading:** Additional versions are created with specific properties (e.g., `state = "NY"`).
3.  **Execution:** When the rule is called, the application provides the **Runtime Context** (e.g., "Current State is NY").
4.  **Dispatching:** The engine automatically selects the rule version that best matches the provided context.

**Example**
*   *Rule:* `CalculatePremium`
*   *Version 1:* `state = "NY"` (Formula includes NY tax)
*   *Version 2:* `state = "CA"` (Formula includes CA tax)
*   *Call:* If Context says `usState = NY`, Version 1 is executed.

---

## Chunk ID: CH5-CONTEXT-METHODS-001
### Section: 5.2 Rules Runtime Context
### Topic: Managing Context from Rules
### Tags: ["Runtime Context", "Methods", "modifyContext", "restoreContext"]

**Summary**
OpenL provides internal methods to manipulate the Runtime Context directly within rule logic (e.g., inside a Method table). This allows a rule to temporarily change the context to call a specific version of another rule.

**Key Methods**
*   `getContext()`: Returns a copy of the current context.
*   `setContext(context)`: Replaces the current context completely.
*   `modifyContext(property, value)`: Updates a single property in the current context (e.g., changing `usState` to "FL").
*   `restoreContext()`: Rolls back the context to the state before the last modification.

**Critical Warning**
Modifications to the context persist after the rule execution. **Users must manually restore the context** (using `restoreContext`) after execution to prevent side effects on subsequent rules.

---

## Chunk ID: CH5-DEPENDENCIES-001
### Section: 5.3 Project and Module Dependencies
### Topic: Dependency Types
### Tags: ["Dependencies", "Modules", "Projects", "Architecture"]

**Summary**
Dependencies allow rules to be split across multiple files or projects to promote reuse and maintainability.

**Types**
*   **Module Dependency:** One Excel file depends on another within the *same* project.
    *   *Purpose:* Ordering compilation (Rule A uses data from Rule B).
*   **Project Dependency:** One project depends on another external project.
    *   *Purpose:* Sharing a common Domain Model or Helper functions across multiple initiatives.
    *   *Mode:* Can import specific modules or **All Modules** from the target project.

**Hierarchy**
Rules, Data, and Datatypes from a dependency are accessible to the "Root" module (the one declaring the dependency).

---

## Chunk ID: CH5-DEP-CONFIG-001
### Section: 5.3 Project and Module Dependencies
### Topic: Configuring Dependencies
### Tags: ["Configuration", "Environment Table", "rules.xml", "Syntax"]

**Summary**
Dependencies are configured in two locations depending on the scope.

**1. Module Level (Environment Table)**
To make another module accessible to the current Excel file, add an `Environment` table:
*   **Command:** `dependency`
*   **Value:** Name of the target module (e.g., `Rating-Model`).
*   *Wildcards:* Supports `*` to match multiple files (e.g., `Policy-*`).

**2. Project Level (rules.xml)**
To make an external project accessible:
*   Defined in `rules.xml` under the `<dependencies>` tag.
*   **AutoIncluded:** If set to `true`, the dependency is automatically loaded.

---

## Chunk ID: CH5-IMPORTS-001
### Section: 5.3 Project and Module Dependencies
### Topic: Import Configuration (Java)
### Tags: ["Configuration", "Imports", "Java", "Libraries"]

**Summary**
The `Environment` table is also used to import external Java classes or libraries so they can be used in rules (similar to Java `import` statements).

**Syntax**
*   **Table:** `Environment`
*   **Command:** `import`
*   **Value:** Package name or Class name.
    *   Example: `com.company.utils` (Imports package)
    *   Example: `java.lang.Math` (Imports class)
*   **Static Import:** To use static methods directly (e.g., `abs(-5)` instead of `Math.abs(-5)`), import the class.