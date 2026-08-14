from dotenv import load_dotenv
load_dotenv()


from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma

loader = PyPDFLoader("./MD_Dilshad_Alam_resume.pdf")

docs = loader.load()


splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

splits = splitter.split_documents(docs)

embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-2-preview"
)


vector_store = Chroma(
    collection_name="documents",
    embedding_function=embeddings
)

vector_store.add_documents(splits)


query = "What is the name of the person?"
results = vector_store.similarity_search(
    query,
    k=2 
    )


context = ""


for document in results:
    context += document.page_content + "\n\n"
    
print("CONTEXT LENGTH:", len(context))
    

prompt = f"""
Answer the question based only on the context below.

Context:
{context}

Question:
{query}

Answer:
"""

    
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

response = llm.invoke(prompt)

print(response.content)

