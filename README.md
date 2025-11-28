# OpenL AI App

An AI-powered web application for generating OpenL Tablets Excel rules from documents.

## Features

- **Document Upload**: Upload insurance policy documents (PDF/Docx).
- **Rule Extraction**: Automatically extract business rules using LLM (Ollama).
- **Rule Selection**: Review and select rules to include.
- **Excel Generation**: Generate OpenL-compliant Excel files using RAG (OpenL Tablets Guide).

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Shadcn UI
- **Backend**: Python FastAPI, LangChain, Ollama
- **Database**: PostgreSQL (pgvector) for RAG

## Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Ollama (running `gpt-oss:20b` and `mxbai-embed-large`)

### Backend

1.  Navigate to `backend`:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the server:
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8099
    ```

### Frontend

1.  Navigate to `frontend`:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the dev server:
    ```bash
    npm run dev
    ```

### Database (RAG)

1.  Start the database:
    ```bash
    docker-compose up -d
    ```
