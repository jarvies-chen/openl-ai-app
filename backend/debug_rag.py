import os
from langchain_ollama import OllamaEmbeddings
from langchain_postgres import PGVector
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

def debug_rag():
    print("Debugging RAG Context...")
    vector_store = get_vector_store()
    
    retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 10, "fetch_k": 20}
    )
    
    query = "OpenL Tablets syntax for Datatype Table, SmartRules, Decision Table, and Spreadsheet structure"
    print(f"Query: {query}")
    
    docs = retriever.invoke(query)
    
    print(f"\nRetrieved {len(docs)} documents:\n")
    for i, doc in enumerate(docs):
        print(f"--- Document {i+1} (Source: {doc.metadata.get('source', 'unknown')}) ---")
        print(doc.page_content[:500] + "..." if len(doc.page_content) > 500 else doc.page_content)
        print("\n")

if __name__ == "__main__":
    debug_rag()
