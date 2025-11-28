# 01_Introducing_OpenL

## Chunk ID: CH2-INTRO-WHATIS-001
### Section: 2.1 What Is OpenL Tablets?
### Topic: Overview and Purpose
### Tags: ["Introduction", "Overview", "Excel", "BRMS"]

**Summary**
OpenL Tablets is a Business Rules Management System (BRMS) that allows users to define business logic directly in Excel tables. It treats business documents as executable source code, bridging the gap between business analysts and software developers.

**Key Capabilities**
*   **Table Processor:** Extracts logic from Excel files for use in software applications.
*   **Transparency:** Makes rules readable and manageable for non-developers.
*   **Validation:** Provides syntax and type checking with detailed error reporting.
*   **Traceability:** Offers calculation explanation to trace results back to source cells.
*   **Formats:** Supports `.xls`, `.xlsx`, and `.xlsm`.

---

## Chunk ID: CH2-SYS-ARCH-001
### Section: 2.3 System Overview
### Topic: Architecture and User Roles
### Tags: ["Architecture", "Workflow", "Users"]

**Summary**
The OpenL ecosystem connects Business Users, Developers, and Administrators through specific tools and workflows.

**Workflow Participants**
1.  **Business Analyst:** Creates and maintains rules in Excel or OpenL WebStudio. Performs testing and verification.
2.  **Developer:** Integrates the OpenL engine into the client application, manages the project structure (Maven), and creates wrapper code.
3.  **Administrator:** Manages project deployment and measures performance.

**System Components**
*   **OpenL WebStudio:** The interface for defining, maintaining, and testing rules.
*   **OpenL Tablets Engine:** The core that processes Excel tables into executable logic.
*   **Client Application:** The external software that calls the rules (via Java API or Web Services).

---

## Chunk ID: CH2-INSTALL-REQ-001
### Section: 2.4 Installing OpenL Tablets
### Topic: Installation Context
### Tags: ["Installation", "Environment"]

**Summary**
Installation requirements depend on how OpenL Tablets is utilized.

**Key Rules**
*   **Development:** Specific software installation is required to run OpenL WebStudio and create projects.
*   **Runtime/Client:** If accessing WebStudio via a browser or consuming rules via Web Services, no local software installation is required for the business user.
*   **Source:** Detailed instructions are found in the *OpenL Tablets Installation Guide*.

---

## Chunk ID: CH2-TUTORIALS-001
### Section: 2.5 Tutorials and Examples
### Topic: Learning Resources
### Tags: ["Tutorials", "Examples", "Getting Started"]

**Summary**
OpenL Tablets WebStudio includes built-in tutorials and example projects to help users learn the system.

**How to Access Tutorials**
1.  Open **Repository Editor** in WebStudio.
2.  Click **Create Project**.
3.  Select a specific **Tutorial** (e.g., "Tutorial 1 - Introduction to Decision Tables") or **Example** from the list.
4.  Click **Create**.
5.  View the project in the **Rules Editor**.

**Recommendation**
Users are encouraged to read the comments inside the Excel files of the generated tutorials for detailed explanations of the syntax.