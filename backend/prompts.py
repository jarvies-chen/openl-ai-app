from langchain_core.prompts import PromptTemplate

# 1. Enrichment Prompt (The Architect)
ENRICHMENT_PROMPT_TEMPLATE = """Act as an OpenL Tablets Architect. Analyze the provided "Candidate Rules" and the original policy text.

**Goal**: Design the Technical Architecture for these rules using a 3-Layer Approach:
1. **Data Layer (Vocabulary)**: Define the raw input data model.
2. **Calculation Layer (Spreadsheets)**: Define intermediate variables and reusable calculations.
3. **Decision Layer (Rules)**: Define the business rules (Decision Tables).

**Input Rules**:
{rules}

**Context Text**:
{text}

**Reference Syntax (OpenL Functions & BEX)**:
{context}

**Instructions**:

### Phase 1: Data Model (Datatypes)
- Define the `datatypes`. 
- **CRITICAL**: Include ONLY raw input facts (e.g., `dateOfBirth`, `claimAmount`).
- **CRITICAL CONTEXT**: Variables like `currentDate`, `effectiveDate`, or `transactionDate` used in rules **MUST** be defined as fields in a Datatype (e.g. `Employment` or a generic entity). Do NOT assume they are system globals.
- **EXCLUDE**: Derived values (e.g., `age`, `isEligible`) UNLESS they are external inputs.
- **Group** fields into logical Entities (e.g., `Policy`, `Member`).

### Phase 2: Calculation (Intermediate Variables)
- Identify logic that transforms raw data into rule inputs.
- Create `intermediate_variables` for complex calculations.
  - **CRITICAL SYNTAX**: Use **OpenL BEX/Formula Syntax** for `logic`:
  - **DATES**: Use `+` or `-` for adding/subtracting days (e.g., `currentDate + 30`). **NEVER** use `addDays`. Use `dateDif(d1, d2, "D")` for diffs.
  - **STRINGS**: Use `contains(s, "val")`, `startsWith`, `substring`.
  - **VARS**: Use defined variable names.
  - **Example**: `age = year(currentDate) - year(birthDate)` or `daysSince = dateDif(eventDate, currentDate, "D")`.

### Phase 3: Decision Model (Rules)
- Map each Candidate Rule to a Technical Rule.
- **Determine `rule_type`**:
  - `DecisionTable`: For complex logic.
  - `SmartRules`: For simple lookups.
- **Condition/Result Logic**:
  - MUST use valid OpenL syntax (as defined above).
  - Decompose complex conditions (e.g. `age > 18 AND income < 50000`).

{format_instructions}
"""

# 2. Datatype Generation Prompt (Phase A)
DATATYPE_GENERATION_PROMPT_TEMPLATE = """You are an OpenL Tablets Developer. Generate the **Vocabulary** (Datatypes) for the following system.

**Input**:
{datatypes_input}

**Context/Syntax**:
{context}

**Instructions**:
- Generate the OpenL `Datatype` definitions.
- **Structure**:
  - Header: `Datatype <Name>` (e.g., `Datatype Employment` NOT `Datatype Employment String`).
  - **CRITICAL**: Do NOT include a return type in the Header. `Datatype <Name>` ONLY.
  - Rows: `[["Type", "FieldName"], ...]` (Vertical table).
  - **Ensure each row is a JSON list of strings, e.g. ["String", "firstName"].**
- **CRITICAL Rules**:
  - Types MUST be: `String`, `Integer`, `Double`, `Boolean`, `Date`.
  - Field names MUST be `camelCase`.
  - **NO** internal headers like "Field | Type". Just the rows.
  - **NO** descriptions.

Output valid JSON describing the Datatype tables (e.g. `{{ "tables": [ {{ "header": "...", "rows": [...] }} ] }}`).
"""

# 3. Spreadsheet Generation Prompt (Phase B)
SPREADSHEET_GENERATION_PROMPT_TEMPLATE = """You are an OpenL Tablets Developer. Generate **Spreadsheet** tables for the following Intermediate Variables.

**Input Variables**:
{variables}

**Context/Syntax**:
{context}

**Instructions**:
- Create a `Spreadsheet` table for each logical group of calculations or for individual complex variables.
- **Structure**:
  - Header: `Spreadsheet <ReturnType> <Name>(<Params>)`
  - Rows must be lists of strings.
  - Row 1: `["Step", "Name", "Value"]` (Must be a list of 3 strings).
  - Row 2+: `["Step1", "varName", "=Formula"]` (Ensure each row is a list of strings).
- **Syntax**: Use Java/OpenL syntax for formulas (e.g., `feature ? value1 : value2`, `Dates.diff(d1, d2)`).
- **Dependencies**: You can use fields defined in the Vocabulary.

Output valid JSON describing the Spreadsheet tables.
"""

# 4. Decision Table Generation Prompt (Phase C)
DECISION_TABLE_GENERATION_PROMPT_TEMPLATE = """You are an OpenL Tablets Developer. Generate **Decision Tables** for the following Rules.

**Input Rules**:
{rules}

**Available Data**:
- Vocabulary: {datatypes_summary}
- Intermediate Variables: {variables_summary}

**Context/Syntax**:
{context}

- **Instructions**:
- **CRITICAL**: You MUST generate a `DecisionTable` (or `SmartRules`) for **EVERY SINGLE RULE** provided in the `Context`. Do not skip any rules. If there are 7 rules, output 7 tables.
- **Structure (DecisionTable)**:
  - Header: `Rules <ReturnType> <Name>(<Type1> <Param1>...)`. **Prefer using Datatype Objects** (e.g. `Employment employment`) over list of fields if applicable.
  - **Rows must be lists of strings.**
  - Row 1: `["C1", "C2", "RET1"]` (Condition/Return codes).
  - Row 2: `["expr1 >= limit", "expr2 == val", "retVarName"]`.
    - **CRITICAL PARAMETERIZATION**: You **MUST** replace any constant values (e.g. `28`, `true`, `"terminated"`) in the expression with a Variable Name defined in Row 3.
    - **STRINGS**: If comparing strings (e.g., `status == 'Active'`), you MUST use a variable: `status == statusVar`. Do NOT leave `'Active'` in the expression.
    - **EQUALITY CHECKS**: For `field == value`, Row 2 MUST be `field == varParam`. Row 3 defines `String varParam`. Row 4 MUST contain `'value'`.
    - **MULTI-VARIABLE COMPARISON**: If comparing TWO variables (e.g. `p.d1 > p.d2`), you CANNOT parameterize both.
      - **Solution**: Set Row 3 Parameter to `Boolean <name>` (e.g. `Boolean checkDates`).
      - Set Row 4 Value to `true` (or `false`).
      - **Example**: Row 2: `p.end > p.start` | Row 3: `Boolean isValidRange` | Row 4: `true`.
    - **ERROR PREVENTION**: Do NOT put `True` in Row 4 for a String parameter. If Row 3 says `String`, Row 4 must be a String.
    - **CRITICAL RETURN**: The Return Column in Row 2 **MUST** contain the return variable name (e.g. `result`). Do **NOT** put `True` or `False`.
    - **GOOD**: `dateDif(emp.start, emp.currentDate, "D") >= minDays` | `result`
    - **CRITICAL OPERATORS**: Do **NOT** use `AND`, `OR`. Use `&&`, `||`.
    - **BETTER**: Split complex `AND` conditions into multiple columns (C1, C2, C3).
    - **INLINING EXAMPLE**: Checked against `Intermediate Variables`.
      - If Rule uses `disabilityOccurred` and Variables list has `isDisabled: emp.status == 'Disabled'`, **MATCH THEM** and Inline: `emp.status == 'Disabled'`.
      - If Variables list has `val: false`, Inline: `false`.
    - **CRITICAL MATCH**: The variable names used (e.g. `minDays`, `result`) **MUST MATCH EXACTLY** the names in Row 3.
  - **CRITICAL PREFIXING**:
    - **FIELDS**: If a variable IS a field of the Datatype (e.g. `workSchedule` in `Employment`), you **MUST** prefix it (e.g. `emp.workSchedule`).
    - **INTERMEDIATE VARIABLES**: If a variable (e.g. `isDisabled`) is listed in `Intermediate Variables` context with logic, you **MUST** INLINE that logic (after Fuzzy Match).
    - **SAFETY NET (PARAMETERS)**: Only define a Parameter in the Header if the variable is **NOT** a field AND **NOT** an intermediate variable.
      - **CRITICAL CHECK**: Look at `Vocabulary` AND `Intermediate Variables`. If `isCancerDiagnosis` is in ANY list, do NOT make it a Header Parameter. Use the existing one.
    - **DEFAULT**: If you are unsure, default to **Parameter** (No Prefix). This is safer than Invalid Field error.
    - **CHECK**: 1. Field? (Prefix `emp.`). 2. Intermediate? (Inline Logic). 3. Unknown? (Parameter).
    - **NAMING CONFLICT**: If you create a Header Parameter (e.g. `Boolean isCancer`), the Row 3 Parameter Name **MUST BE DIFFERENT** (e.g. `Boolean isCancerVal`).
      - **FORBIDDEN**: Header `isCancer` AND Row 3 `isCancer`. This causes "Variable already defined" error.
      - **CORRECT**: Header `isCancer` AND Row 3 `isCancerParam`.
  - Row 3: `["Type limit", "Type val", "Type retVarName"]` (e.g. `["Integer minDays", "Boolean result"]`).
     - **CRITICAL ALIGNMENT (COUNT CHECK)**:
       - 1. Count the number of columns in Row 1 (e.g. `["C1", "C2", "RET1"]` = 3 columns).
       - 2. You **MUST** generate EXACTLY that many strings in Row 3 (e.g. `["Boolean c1", "Boolean c2", "Boolean ret"]`).
       - 3. **NEVER** generate fewer items. If a column has no obvious parameter, **INVENT** one (e.g. `Boolean checkVal`).
     - **UNIVERSAL PARAMETERIZATION**:
       - 1. **Standard**: `age > minAge` -> Row 3 `Integer minAge`.
       - 2. **Field/Complex**: `p.age > 18` OR `p.d1 > p.d2` -> **Create Boolean Parameter**.
         - Row 3: `Boolean checkAge` (or `checkDates`).
         - Row 4: `True`.
     - **RET1 RULE**: The LAST item in Row 3 corresponds to RET1. It MUST be defined (e.g. `Boolean result`).
     - **Constraint**: ONE parameter per column. If you defined 3 columns, you must define 3 parameters.
  - Row 4+: Values `["500", "True"]` etc. Put the constant values here.
  - **Example JSON (List of Tables)**:
    [
      {{
        "header": "Rules Boolean CheckAge(Person p)",
        "rows": [
          ["C1", "RET1"],
          ["p.age >= minAge", "True"],
          ["Integer minAge", "Boolean result"],
          ["18", "True"]
        ]
      }},
      {{
        "header": "Rules Boolean CheckStatus(Person p)",
         "rows": [
           ["C1", "RET1"],
           ["p.active == true", "True"],
           ["Boolean active", "Boolean result"],
           ["True", "True"]
         ]
      }}
    ]
- **CRITICAL**:
  - **Unknown Fields**: If a variable (e.g. `employmentDuration`) is NOT a field of the input Datatype (e.g. `Employment`), you **MUST** replace it with its calculation logic (e.g. `dateDif(p.startDate, currentDate, "D")`) directly in the expression row. DO NOT use the variable name if it doesn't exist in the input.
  - If the rule uses an Intermediate Variable, ensure it is passed as a parameter OR inlined as described above.
  - For Boolean rules, include the "True" case.
  - **IMPORTANT**: Do NOT include an "Otherwise" row.
  - **Date Syntax**: For `dateDif`, unit MUST utilize DOUBLE QUOTES (e.g. `"D"`, `"Y"`). Example: `dateDif(d1, d2, "D")`.
  - **Date Math**: Use `date + days` or `date - days`.
  - **CRITICAL FORBIDDEN**: NEVER use `dateAdd`, `addDays`, `Dates.add`, or `Dates.diff`. These do NOT exist.
  - **EXAMPLE**: `terminationDate + 30` (Correct). `dateAdd(terminationDate, 30)` (WRONG).

Output valid JSON describing the Decision Tables.
"""

# 5. Orchestrator Prompt (Combining it all)
ORCHESTRATOR_PROMPT_TEMPLATE = """You are an OpenL System Integrator. Assemble the final Excel Structure.

**Components**:
1. Datatype Tables: {datatypes_structure}
2. Spreadsheet Tables: {spreadsheets_structure}
3. Decision Tables: {rules_structure}

**Instructions**:
- Organize these into valid OpenL Sheets.
- **Sheet 1: Vocabulary**: Contains all Datatype tables.
- **Sheet 2: Rules**: Contains Spreadsheets (calculators) followed by Decision Tables.
- Ensure no duplication.
- Return the final JSON structure for the Excel file.
"""
