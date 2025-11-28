# 05_Functions_and_Data_Types

## Chunk ID: CH4-ARRAYS-BASICS-001
### Section: 4.1 Working with Arrays
### Topic: Array Basics and Syntax
### Tags: ["Arrays", "Syntax", "Data Types", "Collections"]

**Summary**
An array is a collection of values of the same type. In OpenL Tablets, arrays are denoted by square brackets in the data type name (e.g., `String[]`, `Double[]`).

**Representation**
*   **Horizontal:** Multiple values in adjacent columns.
*   **Vertical:** Multiple values in adjacent rows (requires a merged cell in the leading column to define the set).
*   **Comma-Separated:** Values in a single cell separated by commas (e.g., `NY, CA, FL`). If a value contains a comma, it must be escaped with a backslash (`\,`).

**Accessing Elements**
*   **Numeric Index:** `drivers[5]` returns the 6th element (0-based index).
*   **User Defined Index:** If the array contains objects, and the first field of the object is a unique identifier (like `name` or `id`), elements can be accessed using that value (e.g., `drivers["John"]`).

---

## Chunk ID: CH4-ARRAY-OPS-SELECT-001
### Section: 4.1 Working with Arrays - Array Index Operators
### Topic: Selection Operators
### Tags: ["Arrays", "Operators", "Filtering", "Select"]

**Summary**
Array Index Operators allow filtering and querying arrays directly within expressions using specific syntax in square brackets.

**Select Operators**
*   **Select All:** Returns an array of elements matching the condition.
    *   **Syntax:** `array[@ condition]` or `array[select all having condition]`
    *   **Example:** `drivers[@ age < 25]`
*   **Select First:** Returns the *first* element matching the condition (or null).
    *   **Syntax:** `array[!@ condition]` or `array[select first having condition]`
    *   **Example:** `drivers[!@ name == "John"]`

---

## Chunk ID: CH4-ARRAY-OPS-ADV-001
### Section: 4.1 Working with Arrays - Array Index Operators
### Topic: Sorting, Splitting, and Transforming
### Tags: ["Arrays", "Operators", "Sorting", "Transformation"]

**Summary**
Beyond selection, operators can sort, group, or transform array data.

**Operators**
*   **Order By:** Sorts the array.
    *   **Increasing:** `array[^@ expression]` or `array[order by expression]`
    *   **Decreasing:** `array[v@ expression]`
    *   **Example:** `claims[^@ lossDate]` (Sorts claims by date).
*   **Split By:** Splits an array into a two-dimensional array based on a grouping criterion.
    *   **Syntax:** `array[~@ expression]`
*   **Transform:** Converts an array of one type into an array of another type (Map function).
    *   **Syntax:** `array[*@ expression]`
    *   **Example:** `drivers[*@ name]` returns a `String[]` of names from the `Driver[]` array.
    *   **Unique Transform:** `array[*!@ expression]` returns unique values only.

---

## Chunk ID: CH4-DATATYPES-SIMPLE-001
### Section: 4.2 Working with Data Types
### Topic: Simple and Value Data Types
### Tags: ["Data Types", "Integers", "Booleans", "Dates", "Value Types"]

**Summary**
OpenL Tablets supports standard Java primitives and wrapper types, as well as specific "Value" types that track the calculation source.

**Common Types**
*   **Numeric:** `Integer`, `Double`, `BigDecimal` (for currency), `BigInteger`.
*   **Logical:** `Boolean` (Accepts `TRUE/FALSE`, `Yes/No`, `Y/N`).
*   **Text:** `String`.
*   **Time:** `Date` (Standard Excel dates).

**Value Data Types**
*   **Types:** `IntValue`, `DoubleValue`, `StringValue`, etc.
*   **Purpose:** These act like standard types but include an **Explanation** feature. In WebStudio, clicking a "Value" type result reveals the trace of how that value was calculated (the specific rule or table cell).

---

## Chunk ID: CH4-DATATYPES-RANGE-001
### Section: 4.2 Working with Data Types
### Topic: Range Data Types
### Tags: ["Data Types", "Ranges", "IntRange", "DoubleRange"]

**Summary**
Range types allow defining intervals of numbers or strings. They are primarily used in conditions to check if a value falls within specific boundaries.

**Types**
*   `IntRange`: Whole numbers (e.g., Driver Age).
*   `DoubleRange`: Fractional numbers (e.g., Salary range).
*   `StringRange`: Dictionary ranges (e.g., `[A..C]`).

**Syntax Examples**
*   **Square Brackets `[]`:** Inclusive boundary. `[1; 5]` means 1 to 5 inclusive.
*   **Parentheses `()`:** Exclusive boundary. `(1; 5)` means >1 and <5.
*   **Operators:** `<10`, `>=20`.
*   **Verbal:** `less than 10`, `5 and more`, `10-20`.
*   **Infinity:** represented as `Integer.MIN_VALUE` or `Integer.MAX_VALUE`.

---

## Chunk ID: CH4-FUNCTIONS-MATH-001
### Section: 4.3 Working with Functions
### Topic: Math Functions
### Tags: ["Functions", "Math", "Calculations", "Round"]

**Summary**
OpenL provides standard mathematical functions for use in rules.

**Key Functions**
*   **Min/Max:** `min(value1, value2)` or `max(array[])`. Returns the smallest or largest value.
*   **Sum:** `sum(array[])`. Adds all numbers.
*   **Avg:** `avg(array[])`. Returns arithmetic average.
*   **Product:** `product(array[])`. Multiplies all numbers.
*   **Round:**
    *   `round(number)`: To integer.
    *   `round(number, precision)`: To specific decimal places.
    *   `round(number, precision, roundingMode)`: Uses specific rounding logic (e.g., `ROUND_HALF_UP`).

---

## Chunk ID: CH4-FUNCTIONS-DATE-001
### Section: 4.3 Working with Functions
### Topic: Date Functions
### Tags: ["Functions", "Date", "Time", "Calculations"]

**Summary**
Date functions manipulate `Date` objects to extract components or calculate differences.

**Key Functions**
*   **Calculations:** `dateDif(startDate, endDate, unit)`. Unit can be "Y" (Years), "M" (Months), "D" (Days).
*   **Extraction:** `year(date)`, `month(date)`, `day(date)`, `hour(date)`.
*   **Utility:** `dayOfWeek(date)` (Returns 1 for Sunday... 7 for Saturday).

---

## Chunk ID: CH4-FUNCTIONS-SPECIAL-001
### Section: 4.3 Working with Functions
### Topic: Special Functions and Operators
### Tags: ["Functions", "Error Handling", "Ternary Operator", "Null"]

**Summary**
Special functions handle logic flow and edge cases within rule cells.

**Features**
*   **Error Function:** `error("Message")`. Stops execution and returns an error message. Useful for validating input data constraints (e.g., `age < 0`).
*   **Ternary Operator:** `condition ? valueIfTrue : valueIfFalse`. Inline IF-ELSE logic.
    *   *Example:* `isMember ? 0.10 : 0.0`
*   **Null Handling:**
    *   In math operations (`+`, `-`), `null` is treated as `0`.
    *   In multiplication/division, `null` results in `null`.
    *   To force `null` to be treated as `1` in multiplication, specific operators must be imported via the Environment table.