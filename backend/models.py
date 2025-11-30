from typing import List, Optional
from pydantic import BaseModel

class Rule(BaseModel):
    id: str
    name: Optional[str] = None # Meaningful PascalCase name (e.g., "CalcPremium")
    summary: str # Was description
    condition: Optional[str] = None # Simplified logic/pseudo-code
    result: Optional[str] = None # The expected result/outcome
    source_text: Optional[str] = None # The original text from the document
    category: Optional[str] = "General"
    selected: bool = True
    rule_type: Optional[str] = "SmartRules" # SmartRules, DecisionTable
    related_datatypes: List[str] = [] # Names of related datatypes

class DatatypeField(BaseModel):
    name: str
    type: str # String, Integer, Double, Date, etc.

class Datatype(BaseModel):
    name: str
    fields: List[DatatypeField]
    selected: bool = True

class ExtractionResponse(BaseModel):
    rules: List[Rule]
    datatypes: List[Datatype]

class GenerationRequest(BaseModel):
    rules: List[Rule]
    datatypes: List[Datatype]

class ExtractionRequest(BaseModel):
    text: str

class KrakenRuleRequest(BaseModel):
    excel_data: List[dict]  # List of {summary: str, source_text: str} items

class KrakenRuleResponse(BaseModel):
    generated_rules: str

class KrakenDownloadRequest(BaseModel):
    file_name: str
    name_space: str
    generated_rules: str

class CandidateRule(BaseModel):
    id: str
    name: str
    summary: str
    source_text: str
    selected: bool = True

class CandidateList(BaseModel):
    rules: List[CandidateRule]

class SaveVersionRequest(BaseModel):
    rules: List[Rule]
    text_content: Optional[str] = None
    comments: Optional[str] = None

class EnrichmentRequest(BaseModel):
    rules: List[CandidateRule]
    text: str # Original text context for enrichment

class ExtractionRequest(BaseModel):
    text: str
