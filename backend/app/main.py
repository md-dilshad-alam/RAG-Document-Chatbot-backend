from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path
import uuid
import shutil

from app.rag import ingest_documents, run_rag


app = FastAPI()


# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Upload directory
# -----------------------------

UPLOAD_DIR = Path("./uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# -----------------------------
# Request model
# -----------------------------

class QuestionRequest(BaseModel):

    question: str = Field(
        min_length=1
    )

    document_id: str = Field(
        min_length=1
    )


# -----------------------------
# Home
# -----------------------------

@app.get("/")
def home():

    return {
        "message": "RAG API is running"
    }


# -----------------------------
# Health
# -----------------------------

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }


# -----------------------------
# Upload PDF
# -----------------------------

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...)
):

    try:

        # Check PDF
        if file.content_type != "application/pdf":

            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed."
            )


        # Create unique document ID
        document_id = uuid.uuid4().hex


        # Collection name
        collection_name = f"document_{document_id}"


        # Save filename
        file_path = UPLOAD_DIR / f"{document_id}.pdf"


        # Save uploaded file
        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        # Ingest PDF into ChromaDB
        ingest_documents(
            str(file_path),
            collection_name
        )


        return {
            "message": "PDF uploaded successfully",
            "document_id": document_id,
            "filename": file.filename
        }


    except HTTPException:

        raise


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# -----------------------------
# Ask question
# -----------------------------

@app.post("/ask")
def ask_question(
    request: QuestionRequest
):

    try:

        collection_name = (
            f"document_{request.document_id}"
        )


        answer = run_rag(
            request.question,
            collection_name
        )


        return {
            "question": request.question,
            "answer": answer
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )