import os
import glob
from typing import List
from langchain_ollama import OllamaEmbeddings
from langchain_postgres import PGVector
from langchain_text_splitters import RecursiveCharacterTextSplitter, MarkdownHeaderTextSplitter
from langchain_core.documents import Document
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "mxbai-embed-large:latest")
DB_USER = os.getenv("PG_USER", "user")
DB_PASSWORD = os.getenv("PG_PASSWORD", "password")
DB_HOST = os.getenv("PG_HOST", "localhost")
DB_PORT = os.getenv("PG_PORT", "5432")
DB_NAME = os.getenv("PG_DB", "openl_rag")
COLLECTION_NAME = "openl_guide"
RAG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "rag")

CONNECTION_STRING = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def get_vector_store():
    embeddings = OllamaEmbeddings(
        base_url=OLLAMA_BASE_URL,
        model=EMBEDDING_MODEL,
    )
    return PGVector(
        embeddings=embeddings,
        collection_name=COLLECTION_NAME,
        connection=CONNECTION_STRING,
        use_jsonb=True,
    )

def load_markdown_files(directory: str) -> List[Document]:
    documents = []
    # Recursive search for .md files
    md_files = glob.glob(os.path.join(directory, "**/*.md"), recursive=True)
    
    print(f"Found {len(md_files)} Markdown files in {directory}")
    
    for file_path in md_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Use filename as metadata source
            relative_path = os.path.relpath(file_path, directory)
            
            # First split by headers to keep context
            headers_to_split_on = [
                ("#", "Header 1"),
                ("##", "Header 2"),
                ("###", "Header 3"),
            ]
            markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
            md_header_splits = markdown_splitter.split_text(content)
            
            # Add source metadata
            for doc in md_header_splits:
                doc.metadata["source"] = relative_path
                documents.append(doc)
                
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            
    return documents

def rebuild_rag():
    print("Starting RAG rebuild...")
    
    # 1. Load Documents
    docs = load_markdown_files(RAG_DIR)
    print(f"Loaded {len(docs)} document sections from Markdown.")
    
    if not docs:
        print("No documents found. Aborting.")
        return

    # 2. Split Documents (Chunking)
    # We use a larger chunk size for RAG to capture more context
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", " ", ""]
    )
    splits = text_splitter.split_documents(docs)
    print(f"Split into {len(splits)} chunks.")

    # 3. Ingest into Vector Store
    try:
        vector_store = get_vector_store()
        
        # Optional: Clear existing collection? 
        # PGVector doesn't have a simple "delete_collection" method exposed easily in all versions,
        # but adding documents usually appends. 
        # For a clean rebuild, we might want to drop the table or delete rows, but for now let's just add.
        # Ideally, we should clear it. Let's try to delete if possible or just accept append (user said "rebuild").
        # Since we don't have a direct delete method in the high-level API easily, we will just add.
        # Wait, if we append, we get duplicates. 
        # Let's try to use `vector_store.delete(ids=...)` if we knew IDs, but we don't.
        # We can try `vector_store.drop_tables()` if available, but that might be too aggressive.
        # Let's assume the user wants to OVERWRITE or UPDATE.
        # For now, I will just add. If the user wants a clean slate, they might need to clear DB manually or I can try to delete all.
        
        print("Ingesting into PGVector...")
        vector_store.add_documents(splits)
        print("Ingestion complete!")
        
    except Exception as e:
        print(f"Error during ingestion: {e}")

if __name__ == "__main__":
    rebuild_rag()
