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

### **EXISTING VOCABULARY (PERSISTENCE)**
{existing_context}
- **CRITICAL**: usage of the ABOVE Datatypes is **MANDATORY**.
- Do **NOT** rename existing Datatypes or Fields.
- **Merge Logic**:
  - If a rule uses a field ALREADY in the Vocabulary (e.g. `Policy.effectiveDate`), USE IT.
  - If a rule requires a NEW field not in the set, **ADD IT** to the appropriate Datatype (e.g. add `renewalDate` to `Policy`).

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
- **MANDATORY DATATYPES**:
  - **RuleResult**: You **MUST** generate a `Datatype RuleResult` with the following fields:
    - `String ruleId`
    - `String status`
    - `String message`
- **CRITICAL Rules**:
  - **MISSING FIELDS (currentDate)**: If rules use `currentDate` (or similar), you **MUST** add it as a field to the most relevant Datatype (e.g. `Policy` or `CoveredPerson`). **Do NOT assume it is a global**.
  - Types MUST be: `String`, `Integer`, `Double`, `Boolean`, `Date`.
  - **ARRAYS**: Use `Type[]` for lists. **NEVER** use `List<Type>` or `Array<Type>`.
    - **WRONG**: `List<Diagnosis>`
    - **CORRECT**: `Diagnosis[]`
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
  - **MANDATORY RETURN TYPE**: The return type MUST be `RuleResult`.
    - **Header**: `Rules RuleResult <Name>(<Type1> <Param1>...)`. 
    - **Datatype definition**: The `RuleResult` type has fields: `String ruleId`, `String status`, `String message`. YOU MUST ASSUME THIS EXISTS.
  - **Rows must be lists of strings.**
  - Row 1: `["C1", "C2", "RET1"]` (Condition/Return codes).
  - Row 2: `["expr1 >= limit", "expr2 == val", "result"]`.
    - **CRITICAL PARAMETERIZATION**: You **MUST** replace any constant values (e.g. `28`, `true`, `"terminated"`) in the expression with a Variable Name defined in Row 3.
    - **STRINGS**: 
      - **DOUBLE QUOTES**: Always use DOUBLE QUOTES for string literals: `"Active"`, `"Pending"`. **NEVER** use single quotes (`'`).
      - **COMPARISON**: If comparing strings (e.g., `status == "Active"`), you MUST use a variable: `status == statusVar`.
      - **CRITICAL TYPE MATCH**: The Parameter Type in Row 3 **MUST MATCH** the Field Type being compared.
        - `String field` == `String paramName`
        - `Integer field` == `Integer paramName`
        - **NEVER** use `Boolean` for a non-boolean equality check (e.g. don't use `Boolean` for `status == param`).
      - **CRITICAL STRING OR**: If a rule checks if a string is one of multiple values (e.g. `type == 'A' OR type == 'B'`):
        - **FATAL ERROR**: Do **NOT** use `OR`, `||`, or `in` list in the expression.
        - **WRONG**: `type == 'A' OR type == 'B'` == `checkType`.
        - **CORRECT**: Create **ONE** column with a **String Parameter** (e.g. `String typeParam`).
        - **CORRECT**: Generate **MULTIPLE ROWS** in the table, one for each string value.
        - **Example**: 
          - Row 2: `diagnosisType == typeParam` | Row 3: `String typeParam`.
          - Row 5: `"Recurrence"`
          - Row 6: `"Extension"`
        - **Example RET1 Value**: `"= new RuleResult(\"R001\", \"Fail\", \"Diagnosis mismatch\")"` (MUST start with `=`) 
          - Row 2: `diagnosisType == typeParam` | Row 3: `String typeParam`.
          - Row 5: `"Recurrence"`
          - Row 6: `"Extension"`
          - Row 7: `"Metastatic"`
      - **CRITICAL NO SINGLE QUOTES**: **NEVER** use single quotes `'`. Always use `"`.
    - **EQUALITY CHECKS (STRINGS/CONSTANTS)**:
      - **CRITICAL**: The Expression (Row 2) MUST compare the Field to the **PARAMETER NAME** (Row 3), **NOT** the constant string.
      - **FATAL LOGIC ERROR**: `(p.status == "Active")` in Row 2, with `"Active"` in Row 5. 
        - Result: `(True/False) == "Active"` -> **TYPE MISMATCH ERROR**.
      - **WRONG**: Row 2: `p.status == "Active"` | Row 3: `String s` | Row 5: `"Active"`.
      - **CORRECT**: Row 2: `p.status == s` | Row 3: `String s` | Row 5: `Active`.
      - **Why**: OpenL substitutes the parameter `s` with the value from Row 5.
      - **Row 5 Value**: Do **NOT** use quotes for string values in the table body. `Active`, NOT `"Active"`.
    - **MULTI-VARIABLE COMPARISON / BOOLEAN LOGIC**: 
      - **RULE**: If the expression evaluates to a Boolean (e.g. `p.d1 > p.d2` or `p.isMember`), do **NOT** add `== param`.
      - **SYNTAX**: Just the Expression.
      - **WRONG**: `(p.end > p.start) == isValidRange` (Redundant).
      - **CORRECT**: `p.end > p.start`
      - **Row 2**: `p.end > p.start`
      - **Row 3**: `Boolean isValidRange`
      - **Row 5+**: `TRUE` or `FALSE`.
      - **NOTE**: OpenL implicitly matches the Boolean result of Row 2 with the value in Row 5.
    - **CRITICAL OPERATORS**:
      - **OR Logic**: You **MUST** replace the word `OR` with `||`.
        - **WRONG**: `age > 10 OR age < 5`
        - **CORRECT**: `(age > 10 || age < 5) == checkAge`
      - **SPLIT AND**: If logic is `A && B` (or `AND`), you **MUST SPLIT** it into separate columns:
        - Col 1: `A` (parameterized)
        - Col 2: `B` (parameterized)
        - **WRONG**: `(date1 > date2) && (date1 < date3)` in one cell.
        - **CORRECT**: Col 1 `(date1 > date2) == check1` | Col 2 `(date1 < date3) == check2`.
    - **UNIVERSAL PARAMETERIZATION**: EVERY expression in Row 2 **MUST** be compared to a parameter in Row 3.
      - **WRONG**: `member.age > 18` (No parameter).
      - **WRONG**: `member.date1 > member.date2` (No parameter).
      - **CORRECT**: `member.age >= minAge` (Row 3 `Integer minAge`).
      - **CORRECT**: `(member.date1 > member.date2) == checkDate` (Row 3 `Boolean checkDate`, Row 5 `TRUE`).
      - **NOTE**: The Boolean result matching (implicit) uses Row 3 parameter.
    - **CRITICAL ALIGNMENT (ROW LENGTHS)**:
      - **RULE**: All Rows MUST have the same number of items. If a column (like RET1) does not need a value in Row 3/4/5, use an empty string `""`.
      - **Row 4 (Parameters)**: RET1 column usually has NO parameter. Put `""`.
      - **Row 5 (Headers)**: RET1 column Header is `Result`.
    - **CRITICAL PARAMETER NAMING (COLLISION PREVENTION)**:
      - **RULE**: Parameter names in Row 3 for Conditions (C1, C2...) **MUST** be different from the Return variable name (RET1).
      - **FATAL ERROR**: NEVER name a Condition parameter `result`.
      - **NAMING CONVENTION**: For Boolean conditions, use the prefix `check` or `is`.
        - **WRONG**: Col C1 Row 3: `Boolean result`. (COLLISION with RET1).
        - **CORRECT**: Col C1 Row 3: `Boolean checkTreatmentDate` or `Boolean isEligible`.
    - **CRITICAL RETURN (RET1)**: The Return Column in Row 2 **MUST** contain the return variable name (e.g. `result`).
      - **MANDATORY SYNTAX**: Row 6+ values MUST be an OpenL Constructor Expression starting with `=`.
      - **FORMAT**: `= new RuleResult("ConstraintID", "Status", "Message")`
      - **FIELD: ConstraintID**: You MUST use the **ID** provided in the Input Rules (e.g. `ID: Rule-01`).
        - **Format in Context**: `ID: <RuleID> | Name: <RuleName>`.
        - **Action**: Extract `<RuleID>` and put it in the constructor.
      - **FIELD: Status**: MUST be exactly `"Eligible"` or `"Not-Eligible"`.
      - **FIELD: Message**: A short explanation of the rule outcome.
      - **FATAL ERROR**: Do **NOT** return `True` or `False`.
      - **WRONG**: Row 6: `True`
      - **WRONG**: Row 6: `= new RuleResult("C1", "Fail", "Msg")` ("Fail" is invalid).
      - **CORRECT**: Row 6: `= new RuleResult("Rule-01", "Not-Eligible", "Diagnosis must be Cancer")`
      - **CLARIFICATION**: 
         - Row 2: `RET1`
         - Row 3: `result`
         - Row 4: `""`
         - Row 5: `"Result"`
         - Row 6: `= new RuleResult("Rule-01", "Eligible/Not-Eligible", "Description")`
    - **WILDCARDS / ANY**:
      - **RULE**: If a rule applies to "Any" value for a column, or "Don't Care", put an EMPTY STRING `""` in the JSON row.
      - **FATAL ERROR**: Do NOT use the word `"Any"` or `"*"` or `"-"` or `Any` or `Null`.
      - **Why**: Empty cell in OpenL means "match anything".
      - **WRONG**: Row 6: `"Any"`
      - **WRONG**: Row 6: `Any`
      - **CORRECT**: Row 6: `""`
    - **GOOD**: `(dateDif(emp.start, emp.currentDate, "D") >= minDays) == checkDuration` | `result`
    - **BETTER**: Split complex `AND` conditions into multiple columns (C1, C2, C3).
    - **INLINING EXAMPLE**: Checked against `Intermediate Variables`.
      - If Rule uses `disabilityOccurred` and Variables list has `isDisabled: emp.status == "Disabled"`, **MATCH THEM** and Inline: `(emp.status == "Disabled") == checkDisabled`.
      - If Variables list has `val: false`, Inline: `false`.
    - **CRITICAL MATCH**: The variable names used (e.g. `minDays`, `result`) **MUST MATCH EXACTLY** the names in Row 3.
  - **CRITICAL SUBSTITUTION (INTERMEDIATE VARIABLES)**:
    - **SPLIT MUltiple Conditions (AND / &&)**:
      - **FATAL ERROR**: You MUST NOT put `&&` or `AND` inside a single Condition Cell.
      - **ACTION**: Split `A && B` into **Column C1** and **Column C2**.
      - **WRONG**: `(date1 > date2 && date3 > date4)` in one cell.
      - **CORRECT**: Col 1 `(date1 > date2) == check1` | Col 2 `(date3 > date4) == check2`.
    - **CRITICAL SUBSTITUTION (INTERMEDIATE VARIABLES)**:
      - **CONTEXT**: Check the `Intermediate Variables` list provided above.
      - **FATAL ERROR 1**: Do NOT treat these variables as fields of an object (e.g. `policy.waitingPeriodEndDate`).
      - **FATAL ERROR 2**: Do NOT prefix them (e.g. NO `policy.var`, NO `p.var`).
      - **ACTION**: You **MUST REPLACE** the variable name with its defined `logic`.
      - **WRONG**: `p.diagnosis < policy.waitingPeriodEndDate` (Field 'waitingPeriodEndDate' not found on Policy).
      - **WRONG**: `p.diagnosis < benefitAccrualDate` (Variable 'benefitAccrualDate' not found in scope).
      - **CORRECT**: `p.diagnosis < (policy.effectiveDate + 30)` (Substitutes logic `policy.effectiveDate + 30`).
      - **TIP**: If the logic contains fields from `Policy`, make sure `Policy` is in the rule signature.
  - **CRITICAL FIELD RESOLUTION & MISSING INPUTS**:
    - **STEP 1: LOOKUP**: Before using a variable like `policyEffectiveDate`, **CHECK the Vocabulary context**.
      - Does `CoveredPerson` have this field? NO.
      - Does `Policy` have this field? YES.
    - **STEP 2: ADD MISSING OBJECTS**: If the field belongs to `Policy` but `Policy` is not in the Rule Header, **YOU MUST ADD IT**.
      - **WRONG**: `Rules boolean Check(CoveredPerson p)` -> `p.policyEffectiveDate` (Hallucinates field on `p`).
      - **CORRECT**: `Rules boolean Check(CoveredPerson p, Policy policy)` -> `policy.effectiveDate` (Correct object added).
    - **STEP 3: CORRECT PREFIX**: Use the prefix for the **CORRECT OBJECT**.
      - If field is in `Policy`, use `policy.effectiveDate`.
      - If field is in `CoveredPerson`, use `p.diagnosisDate`.
    - **INTERMEDIATE VARIABLES**: If `isDisabled` is an Intermediate Variable, Inline the logic: `(p.status == "Disabled")`.
    - **PARAMETERS**: Only if it is NOT a field and NOT a variable, treat as a Header Parameter.
    - **CHECK**: 1. Field? (Correct Object Prefix). 2. Intermediate? (Inline Logic). 3. Unknown? (Parameter).
    - **NAMING CONFLICT**: If you create a Header Parameter (e.g. `Boolean isCancer`), the Row 3 Parameter Name **MUST BE DIFFERENT** (e.g. `Boolean isCancerVal`).
      - **FORBIDDEN**: Header `isCancer` AND Row 3 `isCancer`. This causes "Variable already defined" error.
      - **CORRECT**: Header `isCancer` AND Row 3 `isCancerParam`.
  - Row 3: `["Type limit", "Type val", "Type retVarName"]` (e.g. `["Integer minDays", "Boolean result"]`).
     - **CRITICAL ALIGNMENT (COUNT CHECK)**:
       - 1. Count the number of columns in Row 1 (e.g. `["C1", "C2", "RET1"]` = 3 columns).
       - 2. You **MUST** generate EXACTLY that many strings in Row 3 (e.g. `["Boolean c1", "Boolean c2", "Boolean ret"]`).
       - 3. **NEVER** generate fewer items. If a column has no obvious parameter, **INVENT** one (e.g. `Boolean checkVal`) and use it in Row 2 comparison.
     - **UNIVERSAL PARAMETERIZATION**:
       - 1. **Standard**: `age > minAge` -> Row 3 `Integer minAge`.
       - 2. **Field/Complex**: `p.age > 18` OR `p.d1 > p.d2` -> **Create Boolean Parameter**.
         - Row 3: `Boolean checkAge` (or `checkDates`).
         - Row 5: `True`.
     - **RET1 RULE**: The LAST item in Row 3 corresponds to RET1. It MUST be defined (e.g. `Boolean result`).
     - **Constraint**: ONE parameter per column. If you defined 3 columns, you must define 3 parameters.
  - Row 4: `["Min Days", "Is Active", "Result"]` (Column Headers / Display Names).
     - **INSTRUCTION**: Generate a user-friendly display name (Title Case) for each column.
     - **Example**: If Row 3 is `Integer minAge`, Row 4 should be `Min Age`.
     - **Example**: If Row 3 is `Boolean result`, Row 4 should be `Result`.
  - Row 5+: Values `["500", "True"]` etc. Put the constant values here.
  - **Example JSON (List of Tables)**:
    [
      {{
        "header": "Rules Boolean CheckAge(Person p)",
        "rows": [
          ["C1", "RET1"],
          ["p.age >= minAge", "result"],
          ["Integer minAge", "Boolean result"],
          ["Min Age", "Result"],
          ["18", "True"]
        ]
      }},
      {{
        "header": "Rules Boolean CheckStatus(Person p)",
         "rows": [
           ["C1", "RET1"],
           ["p.active == true", "result"],
           ["Boolean active", "Boolean result"],
           ["Is Active", "Result"],
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

# 6. Test Generation Prompt (Phase D)
TEST_GENERATION_PROMPT_TEMPLATE = """You are an OpenL Tablets Quality Assurance Engineer. Generate **Test Tables** for the provided Rules.

**Context**:
- Rules: {rules_structure}
- Datatypes: {datatypes_summary}
- Syntax Guide: {context}

**Instructions**:
- For **EVERY** Rule defined in the `Rules` section, create a corresponding `Test` table.
- **Header**: `Test <RuleName> <RuleName>Test`.
  - **CRITICAL**: The Rule Name MUST appear **TWICE** in the header.
  - **CRITICAL**: Do **NOT** include the Return Type (e.g. `RuleResult`) in the header.
  - **Why**: The first name links to the Rule. The second is the Test Name.
  - **WRONG**: `Test RuleResult EligibilityRule EligibilityRuleTest` (Has Return Type).
  - **WRONG**: `Test EligibilityRuleTest` (Missing target).
  - **CORRECT**: `Test EligibilityRule EligibilityRuleTest`.
  - **Example**: If Rule is `CheckAge`, Header is `Test CheckAge CheckAgeTest`.
- **Structure (Vertical/Transposed)**:
  - Column 1: **Technical Parameter** (e.g. `_id_`, `p.age`, `policy.effectiveDate`, `_res_.status`).
  - Column 2: **Description** (Human readable).
  - Column 3+: **Test Case 1**, **Test Case 2**, etc.
- **Rows Sequence**:
  1. `_id_`: "ID", "T1", "T2"...
  2. **Input Parameters**: List all fields accessed by the rule. Use dot notation (e.g. `coveredPerson.diagnosisDate`).
  3. **Expected Result**: `_res_.status`.
     - Value: `"Eligible"` or `"Not-Eligible"`.
  4. **Expected Message** (Optional): `_res_.message`.
     - **CRITICAL**: You **MUST COPY** the exact message string from the `RET1` column of the provided `Rule`.
     - **Look Up**: Check the `rows` of the Rule JSON. Find the `new RuleResult(...)` cell. Extract the 3rd argument (Message).
     - **Use**: Paste that EXACT string here. Do NOT invent new messages.
- **CRITICAL DATA**:
  - Generate at least **2 Test Cases** per rule:
    - **T1**: A "Positive" case (Eligible).
    - **T2**: A "Negative" case (Not-Eligible).
  - Use realistic dummy data based on the Datatypes (e.g. Dates `2023-01-01`, Strings "Cancer").
  - **CLEANUP**: If an input parameter value is "Any" or "Null", pass an EMPTY STRING `""` instead. OpenL does not support "Any" keyword in data.
  - **LOGICAL CONSISTENCY CHECK** (CRITICAL):
    - You MUST verify that your Input Data accurately reflects the Expected Result.
    - **FATAL ERROR**: Generating data that results in "Eligible" but expecting "Not-Eligible" (or vice versa).
    - **Example**: If Rule requires `age > 18` for "Eligible":
      - **T1 (Eligible)**: Input `age=25`. Result: `Eligible`. (CORRECT)
      - **T2 (Not-Eligible)**: Input `age=25`. Result: `Not-Eligible`. (WRONG - Data contradiction).
      - **Fix**: For T2, Input MUST be `age=10`.
    - **Instruction**: Pick the Rule Row you are testing (e.g. Row 5). Use the EXACT CONSTANTS from that row as your Input Data. This guarantees the result matches.
      - So inputs must be `p.field`, `policy.field`.

**Output**: valid JSON describing the Test tables (Same structure as others: `{{ "tables": [ ... ] }}`).
"""
