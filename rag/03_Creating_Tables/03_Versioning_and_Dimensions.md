# 03_Creating_Tables/03_Versioning_and_Dimensions

## Chunk ID: CH3-VER-INTRO-001
### Section: 3.2 Table Versioning
### Topic: Business Dimension vs Active Table
### Tags: ["Versioning", "Business Dimension", "Active Table"]

**Summary**
OpenL Tablets supports two primary versioning mechanisms: **Business Dimension** (flexible, runtime context-based selection) and **Active Table** (simple on/off switch for "what-if" analysis).

**Comparison**
*   **Business Dimension:** Allows multiple versions of a rule to exist simultaneously (e.g., "2020 Rules" vs "2021 Rules"). The engine selects the correct one at runtime based on context (Date, Region, LOB).
*   **Active Table:** Uses `active` (Boolean) and `version` properties. Only one table with the same signature can be `active = true`.

---

## Chunk ID: CH3-VER-BUS-DIM-001
### Section: 3.2 Table Properties
### Topic: Business Dimension Properties List
### Tags: ["Properties", "Business Dimension", "Context", "Dispatching"]

**Summary**
Business Dimension properties allow "Overloading" of rules. Users create multiple tables with the same name/signature but different dimension properties. The engine selects the matching table at runtime based on the input context.

**Common Dimension Properties**
*   **Date Ranges:** `effectiveDate`, `expirationDate`.
*   **Location:** `country` (Enum[]), `usregion` (Enum[]), `state` (US States), `region` (Economic).
*   **Business:** `lob` (Line of Business), `currency`, `lang` (Language).
*   **Custom:** `origin` (Base/Deviation), `nature` (User-defined string).

**Example**
If Rule A has `state = NY` and Rule B has `state = CA`, calling `Rule(context)` where `context.state = NY` executes Rule A.

---

## Chunk ID: CH3-VER-DATES-001
### Section: 3.2 Table Properties
### Topic: Effective and Expiration Dates
### Tags: ["Versioning", "Dates", "Effective Date", "Expiration Date"]

**Summary**
These properties define the time interval during which a specific rule version is valid for business logic application.

**Properties**
*   **effectiveDate:** The date the rule becomes active.
*   **expirationDate:** The date the rule ceases to be active.

**Logic**
*   The runtime context date (Current Date) must fall within: `effectiveDate <= Current Date <= expirationDate`.
*   If `expirationDate` is undefined, the rule is valid indefinitely after the start date.
*   Multiple versions can exist, but their date ranges should ideally not overlap unless other dimensions differ (see Overlapping).

---

## Chunk ID: CH3-VER-REQ-001
### Section: 3.2 Table Properties
### Topic: Request Dates (Start/End)
### Tags: ["Versioning", "Dates", "Request Date", "Deployment"]

**Summary**
Request dates differ from Effective dates. They define when a rule is *physically* available in the system or legally required to be used, often for "grandfathering" policies based on when a request was made, rather than the current calculation date.

**Properties**
*   **startRequestDate:** Date the rule is introduced/available.
*   **endRequestDate:** Date the system stops using the rule.

**Priority Logic (Intersection)**
If ranges intersect:
1.  Select rule with the **latest** `startRequestDate`.
2.  If ties, select rule with the **earliest** `endRequestDate`.
3.  If exact match on both, an error occurs.

---

## Chunk ID: CH3-VER-OVERLAP-001
### Section: 3.2 Table Properties
### Topic: Property Overlapping Logic
### Tags: ["Versioning", "Overlapping", "Validation", "Dispatching"]

**Summary**
OpenL Tablets validates how Business Dimension properties overlap between rule versions to ensure deterministic execution.

**Overlap Types**
*   **No Overlap:** Property sets are disjoint. (e.g., State=NY vs State=CA). Safe.
*   **Good Overlap (Inclusion):** One property set is completely embedded in another (e.g., Rule A applies to "All States", Rule B applies to "CA").
    *   *Logic:* The **most specific** rule (Rule B) is selected for the specific case.
*   **Bad Overlap (Intersection):** Sets intersect but neither contains the other (e.g., Rule A = [NY, CA], Rule B = [CA, FL]).
    *   *Result:* Ambiguous method dispatch error if the context (CA) matches both.

**Cross-links**
*   See Chunk ID: CH3-VER-BUS-DIM-001 for the list of properties involved in overlapping.
