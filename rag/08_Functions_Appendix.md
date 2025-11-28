# 08_Functions_Appendix

## Chunk ID: CH7-FUNC-MATH-001
### Section: 7.1 Math Functions
### Topic: Mathematical Utilities
### Tags: ["Functions", "Math", "Calculation", "Statistics"]

**Summary**
A library of functions for performing calculations on numeric types (`double`, `int`, `BigDecimal`, etc.).

**Key Functions**
*   **Basic:** `abs(a)`, `min(a, b)`, `max(a, b)`, `sum(array)`, `avg(array)`, `product(array)`.
*   **Rounding:** `round(value)`, `round(value, scale)`, `floor(a)`, `ceil(a)`.
*   **Exponents/Roots:** `pow(a, b)`, `sqrt(a)`, `cbrt(a)`, `log(a)`.
*   **Trigonometry:** `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `toDegrees`, `toRadians`.
*   **Financial:** `mod(number, divisor)`, `quotient(number, divisor)`.

---

## Chunk ID: CH7-FUNC-ARRAY-001
### Section: 7.2 Array Functions
### Topic: Array Manipulation
### Tags: ["Functions", "Arrays", "Collections"]

**Summary**
Functions to manage, query, and modify arrays.

**Key Functions**
*   **Modification:** `add(array, element)`, `remove(array, index)`, `removeElement(array, element)`.
*   **Query:** `contains(array, element)`, `indexOf(array, element)`, `isEmpty(array)`, `length(array)`.
*   **Set Operations:** `intersection(array1, array2)`, `flatten(arrayN)`.
*   **Validation:** `allTrue(boolean[])`, `anyTrue(boolean[])`, `noNulls(array)`.
*   **Sorting:** `sort(array)` (Ascending), `big(array, position)` (Descending sort, returns value at position), `small(array, position)`.

---

## Chunk ID: CH7-FUNC-DATE-001
### Section: 7.3 Date Functions
### Topic: Date and Time Utilities
### Tags: ["Functions", "Date", "Time", "Calendar"]

**Summary**
Functions for Date calculations and component extraction.

**Key Functions**
*   **Difference:** `dateDif(startDate, endDate, unit)`. Unit codes: "Y" (Year), "M" (Month), "D" (Day), "YM" (Months excluding years), etc.
    *   `dayDiff`, `monthDiff`, `yearDiff`, `weekDiff`.
*   **Extraction:** `year`, `month`, `dayOfMonth`, `dayOfWeek` (1=Sunday), `hour`, `minute`, `second`.
*   **Utility:** `absMonth` (Months since AD), `absQuarter`, `amPm` (Returns "AM"/"PM").
*   **Formatting:** `toString(date, format)`, `toDate(string)`.

---

## Chunk ID: CH7-FUNC-STRING-001
### Section: 7.4 String Functions
### Topic: Text Manipulation
### Tags: ["Functions", "String", "Text", "Pattern Matching"]

**Summary**
Functions for processing text strings.

**Key Functions**
*   **Comparison:** `contains(str, search)`, `startsWith`, `endsWith`, `like(str, pattern)` (Pattern matching with wildcards).
*   **Modification:** `replace(str, target, replacement)`, `trim(str)`, `upperCase`, `lowerCase`.
*   **Utility:** `concatenate(str1, str2...)`, `length(str)`, `substring`, `isNumeric(str)`.
*   **Conversion:** `toDouble(str)`, `toInteger(str)`.

---

## Chunk ID: CH7-FUNC-SPECIAL-001
### Section: 7.5 Special Functions
### Topic: System and Support Functions
### Tags: ["Functions", "Special", "Error Handling", "Copy"]

**Summary**
Miscellaneous functions for object management and error control.

**Functions**
*   **copy(object):** Creates a deep copy of an object. Essential for implementing "Variation" logic where a base object needs to be modified independently for different rule runs.
*   **error(String msg):** Explicitly halts execution and displays an error message. Used in rules to validate invalid inputs or impossible states (e.g., `error("Age cannot be negative")`).
