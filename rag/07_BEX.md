# 07_BEX

## Chunk ID: CH6-BEX-INTRO-001
### Section: 6.1 Introduction to BEX
### Topic: BEX Language Basics and Keywords
### Tags: ["BEX", "Syntax", "Keywords", "Business Language"]

**Summary**
OpenL Tablets uses **BEX** (Business Expression) language, which extends standard Java grammar to support natural language expressions. It maps the underlying Java object model to business vocabulary automatically.

**Key Features**
*   **No Mapping Required:** Uses the existing Java object model (e.g., `policy.effectiveDate` is automatically understood as "Effective Date of the Policy").
*   **Case Sensitivity:** BEX keywords are lowercase. To avoid clashes, it is recommended to use Upper Case for model attributes.

**Keyword Mappings**
BEX allows replacing mathematical symbols with English phrases:
*   `==` -> `equals to`, `same as`
*   `!=` -> `does not equal to`, `different from`
*   `a.b` -> `b of the a`
*   `<` -> `is less than`
*   `>` -> `is more than`
*   `<=` -> `is less or equal`, `is in`
*   `>=` -> `is more or equal`

---

## Chunk ID: CH6-BEX-SIMPLIFY-001
### Section: 6.3 Simplifying Expressions
### Topic: Explanatory Variables and Scope
### Tags: ["BEX", "Syntax", "Variables", "Scope"]

**Summary**
BEX provides specific syntax to make complex formulas readable for business users by using "Explanatory Variables" and automatic scope resolution.

**Explanatory Variables**
Allows defining variables *after* the formula using a `where` clause.
*   **Syntax:** `<Expression>, where <Var1> - <Description>, <Var2> - <Description>`
*   **Example:** `(A - M) / M > X, where A - Agreed Value, M - Market Value, X - Limit`

**Uniqueness of Scope**
BEX automatically resolves paths to attributes if they are unique in the context.
*   **Example:** If `policy` is the only object with an `effectiveDate`, you can write `effectiveDate` directly instead of `effectiveDate of the Policy`.

---

## Chunk ID: CH6-BEX-OPS-001
### Section: 6.4 Operators Used in OpenL Tablets
### Topic: Standard and String Operators
### Tags: ["BEX", "Operators", "String Operators", "Math"]

**Summary**
BEX supports standard Java operators (Arithmetic, Relational, Logical) and adds specific operators for String comparison that handle mixed alphanumeric sorting.

**String Operators**
*   `string==`: Checks equality treating numbers within strings as numeric values (e.g., "File2" > "File10" is false in string sort, but correct in numeric sort).
*   `string<`, `string>`, `string<=`: Performs comparison separating letter parts from numeric parts.

**Standard Operators (Priority Order)**
1.  **Assignment:** `=`, `+=`, `-=`, etc.
2.  **Conditional:** `? :` (Ternary).
3.  **Logical:** `||` (or), `&&` (and).
4.  **Equality:** `==`, `!=`, `====` (Strict equality, no float rounding).
5.  **Relational:** `<`, `>`, `<=`, `>=`.
6.  **Arithmetic:** `+`, `-`, `*`, `/`, `%`, `**` (Power).
7.  **Unary:** `!`, `++`, `--`, `(Type) cast`.