AI-Powered RAG Document Chatbot

An AI-powered document-based chatbot that allows users to upload PDF documents and ask questions based on their content. The application uses Retrieval-Augmented Generation (RAG) to retrieve relevant information from documents and generate accurate answers using an LLM.

🚀 Features
📄 Upload and process PDF documents
🔍 Extract text from PDF files
✂️ Split documents into smaller chunks
🧠 Generate vector embeddings
🗄️ Store embeddings in ChromaDB
🔎 Perform semantic similarity search
🤖 Generate answers using Google Gemini
⚡ FastAPI backend
💬 Interactive React frontend
🔗 Frontend and backend API integration
🛠️ Tech Stack
Backend
Python
FastAPI
LangChain
Google Gemini API
ChromaDB
PyPDFLoader
Pydantic
Frontend
React.js
Vite
TypeScript
CSS
AI / RAG
Retrieval-Augmented Generation
Vector Embeddings
Semantic Search
Large Language Model (LLM)
📂 Project Structure
rag-document-chatbot/
│
├── backend/
│ ├── app/
│ │ ├── main.py
│ │ ├── rag.py
│ │ └── ...
│ │
│ ├── requirements.txt
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── App.tsx
│ │ ├── App.css
│ │ └── ...
│ │
│ ├── package.json
│ └── vite.config.ts
│
├── .gitignore
└── README.md
⚙️ How RAG Works
PDF Document
↓
Text Extraction
↓
Document Chunking
↓
Vector Embeddings
↓
ChromaDB
↓
User Question
↓
Similarity Search
↓
Relevant Documents
↓
Google Gemini LLM
↓
Generated Answer
🔧 Backend Setup

Clone the repository:

git clone <your-github-repository-url>
cd rag-document-chatbot

Create a virtual environment:

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create a .env file:

GOOGLE_API_KEY=your_google_api_key

Run the FastAPI server:

uvicorn app.main:app --reload

Backend will run at:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs
💻 Frontend Setup

Go to the frontend directory:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally run at:

http://localhost:5173
🔐 Environment Variables

Never upload your API key to GitHub.

Use:

GOOGLE_API_KEY=your_api_key_here

Add .env to .gitignore:

.env
venv/
**pycache**/
node_modules/
📡 API
Health Check
GET /

Example response:

{
"message": "RAG API is running"
}
Ask Question
POST /ask

Request:

{
"question": "What is mentioned in the document?"
}

Response:

{
"answer": "The answer generated from the document..."
}
🎯 Use Cases
Chat with academic documents
Resume/document analysis
Research papers
Company documentation
Technical PDFs
Study materials
Knowledge-base assistants
🔮 Future Improvements
Support for multiple file formats
Conversation history
Authentication
Multiple document collections
Streaming responses
Better citation/source tracking
Cloud deployment
Chat history database
👨‍💻 Author

MD Dilshad Alam

AI Engineer | Python | FastAPI | Generative AI | LangChain | RAG

⭐ Project

This project demonstrates the practical implementation of Retrieval-Augmented Generation (RAG) using modern AI technologies to build a document-based conversational assistant.
