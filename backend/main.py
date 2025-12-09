import shutil
import os
import io
import uuid
import logging
import traceback
import re
from typing import List, Optional
from urllib.parse import quote_plus, urlparse

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_postgres import PGVector
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Services
from services.generation_service import GenerationService
from services.git_service import GitService

# Models
from models import (
    Rule, Datatype, DatatypeField, ExtractionResponse, GenerationRequest, 
    ExtractionRequest, CandidateRule, EnrichmentRequest, CandidateList, 
    SaveVersionRequest, KrakenRuleRequest, KrakenRuleResponse, KrakenDownloadRequest
)

# Utils (Importing strictly at top)
from utils import parse_document, parse_excel
from version_control import DocumentManager, RuleDiffer, VersionMetadata, DiffResult





# Trigger reload to force .env reload
app = FastAPI(title="OpenL AI App Backend")

# Initialize Services
gen_service = GenerationService()
git_service = GitService()

# Reload trigger 3
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
# Initialize LLM
ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
llm_model = os.getenv("LLM_MODEL", "gpt-oss:20b")

llm = OllamaLLM(
    base_url=ollama_base_url,
    model=llm_model,
)

@app.get("/")
def read_root():
    return {"message": "OpenL AI App Backend is running"}

# Initialize DocumentManager
doc_manager = DocumentManager()

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)

    
    try:
        text = parse_document(file_location)
        return {"filename": file.filename, "temp_path": file_location, "extracted_text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/kraken-upload")
async def kraken_upload(file: UploadFile = File(...)):
    file_location = f"temp_kraken_{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    try:
        # Check if it's an Excel file
        _, ext = os.path.splitext(file.filename)
        ext = ext.lower()
        
        if ext not in ['.xlsx', '.xls']:
            raise HTTPException(status_code=400, detail="Only Excel files (.xlsx, .xls) are supported")
        
        # Parse Excel file
        excel_data = parse_excel(file_location)
        
        # Convert to candidate rules format
        candidate_rules = []
        for i, item in enumerate(excel_data["excel_data"], 1):
            candidate_rules.append({
                "id": f"Rule-{i:02d}",
                "name": f"Rule-{i:02d}",
                "summary": item["summary"],
                "source_text": item["source_text"]
            })
        
        # Return in the same format as extract-candidates
        return {
            "filename": file.filename,
            "temp_path": file_location,
            "candidates": candidate_rules
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # Note: We don't delete temp file here immediately if we want to use it for versioning later, 
    # but for now the flow is: Upload -> Extract -> (User Reviews) -> (User Saves Version?)
    # Actually, the user request implies "Upload -> Save Rules -> Next Upload -> Compare".
    # So we need a way to "Save" the extracted rules as a version.

@app.post("/save-version", response_model=VersionMetadata)
async def save_version(filename: str, request: SaveVersionRequest, temp_path: Optional[str] = None):
    """
    Saves the current set of rules as a new version for the given filename.
    If temp_path is provided, it uses that file. 
    If temp_path is missing but request.text_content is provided (Manual Entry), it creates a temp file from text.
    """
    
    # Handle Manual Entry case (No temp_path, but has text)
    if (not temp_path or not os.path.exists(temp_path)) and request.text_content:
        # Create a temp file from text
        temp_path = f"temp_manual_{uuid.uuid4()}.txt"
        with open(temp_path, "w", encoding="utf-8") as f:
            f.write(request.text_content)
    
    if not temp_path or not os.path.exists(temp_path):
        raise HTTPException(status_code=400, detail="Temporary file not found and no text content provided.")
        
    try:
        version_meta = doc_manager.add_document(temp_path, filename, request.rules, request.comments)
        # Do NOT delete temp file here, as we might need it for subsequent saves (e.g. multiple steps)
        # if os.path.exists(temp_path):
        #     os.remove(temp_path)
        return version_meta
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents", response_model=List[dict])
async def get_documents():
    docs = doc_manager.get_documents()
    # Convert to simple list for frontend
    return [
        {
            "base_filename": d.base_filename,
            "version_count": len(d.versions),
            "latest_version": d.versions[-1] if d.versions else None
        }
        for d in docs
    ]

@app.get("/versions/{filename}", response_model=List[VersionMetadata])
async def get_versions(filename: str):
    return doc_manager.get_versions(filename)

@app.get("/rules/{filename}/{version}", response_model=List[Rule])
async def get_rules_version(filename: str, version: int):
    rules = doc_manager.get_rules(filename, version)
    # Return empty array for Kraken documents or documents without rules, don't raise 404
    return rules

@app.get("/diff/{filename}/{v_old}/{v_new}", response_model=DiffResult)
async def get_diff(filename: str, v_old: int, v_new: int):
    old_rules = doc_manager.get_rules(filename, v_old)
    new_rules = doc_manager.get_rules(filename, v_new)
    
    # For Kraken documents, get_rules returns empty array, which is expected
    # Don't raise 404, just generate the diff (which will be empty)
    
    return RuleDiffer.diff(old_rules, new_rules)

@app.get("/rule-history/{filename}/{rule_id}")
async def get_rule_history(filename: str, rule_id: str):
    try:
        history = doc_manager.get_rule_history(filename, rule_id)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/document-content/{filename}/{version}")
async def get_document_content(filename: str, version: int):
    try:
        versions = doc_manager.get_versions(filename)
        target_version = next((v for v in versions if v.version == version), None)
        
        if not target_version:
            raise HTTPException(status_code=404, detail="Version not found")
            
        file_path = os.path.join(doc_manager.files_dir, target_version.filename)
        if not os.path.exists(file_path):
             raise HTTPException(status_code=404, detail="File not found")
             
        content = parse_document(file_path)
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-rules", response_model=ExtractionResponse)
async def extract_rules(request: ExtractionRequest):
    # Prompt for rule extraction
    parser = JsonOutputParser(pydantic_object=ExtractionResponse)
    prompt = PromptTemplate(
        template="""Analyze the following insurance policy text and extract:
        1. **Business Rules**: Logic statements. 
           - `name`: A meaningful PascalCase name for the rule (e.g., "DetermineEligibility", "CheckFrequencyLimit").
           - `summary`: A brief English description of the rule.
           - `condition`: A simplified pseudo-code representation. For Decision Tables, list the conditions clearly (e.g., "Student=Yes AND Age<=MaxAge").
           - **CRITICAL**: Decompose complex conditions into atomic fields.
             - **WRONG**: A single boolean `isEligibleForSpecialProgram` that hides all the logic.
             - **CORRECT**: Separate fields like `age`, `income`, `enrollmentStatus` so the rule can check them individually.
           - **CRITICAL**: Infer `Integer` for numeric concepts (Age, Duration, Count, Days, Years).
             - **WRONG**: `String employmentDuration`
             - **CORRECT**: `Integer employmentDuration`
           - **CRITICAL**: Group fields into logical **Datatypes** (Entities).
             - **DO NOT** create a separate Datatype for every single field.
             - **WRONG**: `Datatype Age {{ age }}`, `Datatype Income {{ income }}`
             - **CORRECT**: `Datatype Person {{ age, income, gender }}`
             - **Common Groups**:
               - `Policy`: effectiveDate, expirationDate, type, status
               - `Member`: age, gender, employmentStatus, salary
               - `Claim`: amount, date, diagnosisCode
               - `Vehicle`: make, model, year, vin
             - **Action**: Look at the context. If a field belongs to the policy, put it in `Policy`. If it belongs to the person/employee, put it in `Employee`.

        Text:
        {text}

        {format_instructions}
        """,
        input_variables=["text"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )
    
    chain = prompt | llm | parser
    
    try:
        result = chain.invoke({"text": request.text})
        # Ensure all lists are present
        if 'rules' not in result: result['rules'] = []
        if 'datatypes' not in result: result['datatypes'] = []
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-candidates", response_model=List[CandidateRule])
async def extract_candidates(request: ExtractionRequest):
    parser = JsonOutputParser(pydantic_object=CandidateList)
    prompt = PromptTemplate(
        template="""Act as an Insurance Claims Adjuster. Analyze the policy text and extract all business rules relevant to eligibility, coverage, exclusions, and limitations.

        **Goal**: Create a list of "Candidate Rules" in plain English. Do NOT worry about technical syntax or datatypes yet.

        **Instructions**:
        1. Identify every condition that affects a claim's outcome.
        2. Give each rule a meaningful Name (PascalCase).
        3. Write a clear "Summary" in plain English.
        4. Include the "Source Text" snippet.
        5. Assign a unique ID (UUID).

        Text:
        {text}

        {format_instructions}
        """,
        input_variables=["text"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )
    chain = prompt | llm | parser
    try:
        result = chain.invoke({"text": request.text})
        # Result should be {'rules': [...]}
        rules = result.get('rules', [])
        
        # Assign sequential IDs (Rule-01, Rule-02, etc.)
        for i, r in enumerate(rules, 1):
            r['id'] = f"Rule-{i:02d}"
            
        return rules
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enrich-rules", response_model=ExtractionResponse)
async def enrich_rules(request: EnrichmentRequest):
    try:
        # Delegate to GenerationService (The Architect)
        return await gen_service.enrich_rules(request.rules, request.text)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-kraken-rules", response_model=KrakenRuleResponse)
async def generate_kraken_rules(request: KrakenRuleRequest):
    try:
        # Read the Kraken rule prompt file
        with open("kraken_rule_prompt.md", "r", encoding="utf-8") as f:
            prompt_template = f.read()
        
        # Format the Excel data into a string
        excel_data_str = "\n".join([f"{item['summary']}\n{item['source_text']}" for item in request.excel_data])
        
        # Combine the prompt template with the Excel data
        full_prompt = f"{prompt_template}\n\nPlease generate the following Kraken rule based on the Kraken rule above:\n\n{excel_data_str}"
        
        # Print full_prompt to log
        print("\n=== Full Prompt for Kraken Rules Generation ===")
        print(full_prompt)
        print("=== End of Full Prompt ===\n")
        
        # Call Ollama API directly without parsing (we want raw text response)
        chain = PromptTemplate(
            template="{prompt}",
            input_variables=["prompt"]
        ) | llm
        
        result = chain.invoke({"prompt": full_prompt})
        print("The result is:\n")
        print(result)
        
        # Return the generated rules as raw text
        return KrakenRuleResponse(generated_rules=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/kraken-download")
async def kraken_download(request: KrakenDownloadRequest):
    try:
        # Create the content with namespace as first line
        content = f"Namespace {request.name_space}\n\n{request.generated_rules}"
        
        # Ensure the generated directory exists
        os.makedirs("generated", exist_ok=True)
        
        # Generate the file path with the provided file name
        filename = request.file_name
        file_path = os.path.join("generated", filename)
        
        # Write the content to the file
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        # Return the download URL
        return {"status": "success", "download_url": f"/download/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete-document/{filename}")
async def delete_document(filename: str):
    success = doc_manager.delete_document(filename)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": f"Document {filename} deleted successfully"}



@app.post("/generate-excel")
async def generate_excel(request: GenerationRequest, background_tasks: BackgroundTasks):
    selected_rules = [r for r in request.rules if r.selected]
    if not selected_rules:
        return {"message": "No rules selected"}
    
    try:
        # 1. Generate Structure using 3-Layer Pipeline
        structure = await gen_service.generate_excel_structure(request)
        
        # 2. Create Workbook
        wb = gen_service.create_workbook(structure)
        
        # 3. Handle File Saving / Git
        # Determine clean filename
        clean_name = "OpenL_Rules.xlsx"
        if request.original_filename:
            base_name = os.path.splitext(request.original_filename)[0]
            base_name = re.sub(r'[-_]\d{4}[-_]\d{2}[-_]\d{2}.*', '', base_name)
            base_name = re.sub(r'[-_]\d{10,}.*', '', base_name)
            clean_name = f"{base_name}.xlsx"
            
        # Save locally first
        os.makedirs("generated", exist_ok=True)
        save_path = os.path.join("generated", clean_name)
        wb.save(save_path)
        
        if request.create_pr:
            # Offload Git operations to background task
            background_tasks.add_task(git_service.create_pr_background, save_path, clean_name)
            return {
                "status": "success",
                "message": f"File generated and background task started to push to Git.\n\nFile: {clean_name}",
                "download_url": f"/download/{clean_name}"
            }
        else:
            return {
                "status": "success", 
                "download_url": f"/download/{clean_name}"
            }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{filename}")
async def download_file(filename: str, background_tasks: BackgroundTasks):
    file_path = os.path.join("generated", filename)
    if os.path.exists(file_path):
        background_tasks.add_task(os.remove, file_path)
        return FileResponse(file_path, filename=filename)
    raise HTTPException(status_code=404, detail="File not found")
        
# Connection string for pgvector
DB_USER = os.getenv("PG_USER", "user")
DB_PASSWORD = os.getenv("PG_PASSWORD", "password")
DB_HOST = os.getenv("PG_HOST", "localhost")
DB_PORT = os.getenv("PG_PORT", "5432")
DB_NAME = os.getenv("PG_DB", "openl_rag")

CONNECTION_STRING = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

embedding_model = os.getenv("EMBEDDING_MODEL", "mxbai-embed-large:latest")

embeddings = OllamaEmbeddings(
    base_url=ollama_base_url,
    model=embedding_model,
    # headers={"Authorization": f"Bearer {ollama_api_key}"} if ollama_api_key else None
)

def get_vector_store():
    return PGVector(
        embeddings=embeddings,
        collection_name="openl_guide",
        connection=CONNECTION_STRING,
        use_jsonb=True,
    )

@app.post("/ingest-guide")
async def ingest_guide(file: UploadFile = File(...)):
    file_location = f"temp_guide_{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    try:
        loader = PyPDFLoader(file_location)
        docs = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        
        vector_store = get_vector_store()
        vector_store.add_documents(splits)
        
        return {"message": "Ingestion complete", "chunks": len(splits)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_location):
            os.remove(file_location)
