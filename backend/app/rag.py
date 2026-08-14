from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import (
    GoogleGenerativeAIEmbeddings,
    ChatGoogleGenerativeAI,
)
from langchain_chroma import Chroma


load_dotenv()


# -----------------------------
# Load PDF
# -----------------------------

def load_documents(file_path):
    loader = PyPDFLoader(file_path)

    documents = loader.load()

    return documents


# -----------------------------
# Split documents
# -----------------------------

def split_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    splits = splitter.split_documents(documents)

    return splits


# -----------------------------
# Create embeddings
# -----------------------------

def create_embeddings():
    embeddings = GoogleGenerativeAIEmbeddings(
        model="gemini-embedding-2-preview"
    )

    return embeddings


# -----------------------------
# Create vector store
# -----------------------------

def create_vector_store(embeddings, collection_name):
    vector_store = Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory="./chroma_db"
    )

    return vector_store


# -----------------------------
# Add documents
# -----------------------------

def add_documents_to_vector_store(vector_store, documents):

    vector_store.add_documents(
        documents=documents
    )


# -----------------------------
# Ingest PDF
# -----------------------------

def ingest_documents(file_path, collection_name):

    # Load PDF
    documents = load_documents(file_path)

    # Split PDF
    chunks = split_documents(documents)

    # Embeddings
    embeddings = create_embeddings()

    # Create separate collection
    vector_store = create_vector_store(
        embeddings,
        collection_name
    )

    # Add chunks
    add_documents_to_vector_store(
        vector_store,
        chunks
    )

    return vector_store


# -----------------------------
# Retrieve documents
# -----------------------------

def retrieve_documents(vector_store, query):

    results = vector_store.similarity_search(
        query,
        k=6
    )

    return results


# -----------------------------
# Create context
# -----------------------------

def create_context(documents):

    context = ""

    for document in documents:

        context += document.page_content

        context += "\n\n"

    return context


# -----------------------------
# Create prompt
# -----------------------------

def create_prompt(context, query):

    prompt = f"""
You are an AI assistant that answers questions about an uploaded resume.

Use ONLY the information available in the resume context below.

Important instructions:
1. Answer directly and clearly.
2. For questions about the person's name, skills, education, experience,
   projects, career objective, career goal, resume purpose, or job role,
   look carefully through all relevant context.
3. "Purpose of the resume" can refer to the candidate's career objective,
   professional summary, target role, or the type of job they are seeking.
4. Do not invent information.
5. If the requested information genuinely does not exist in the resume,
   say: "I could not find this information in the uploaded document."

Resume Context:
{context}

Question:
{query}

Answer:
"""

    return prompt


# -----------------------------
# Generate answer
# -----------------------------

def generate_answer(prompt):

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash"
    )

    response = llm.invoke(prompt)

    return response.content


# -----------------------------
# Run RAG
# -----------------------------

def run_rag(query, collection_name):

    embeddings = create_embeddings()

    vector_store = Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory="./chroma_db"
    )

    # Retrieve relevant chunks
    retrieved_documents = retrieve_documents(
        vector_store,
        query
    )

    # Create context
    context = create_context(
        retrieved_documents
    )

    # Create prompt
    prompt = create_prompt(
        context,
        query
    )

    # Generate answer
    answer = generate_answer(prompt)

    return answer