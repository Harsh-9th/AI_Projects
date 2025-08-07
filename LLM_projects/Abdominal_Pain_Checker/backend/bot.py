import os
import json
import chromadb
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware as cm
from pydantic import BaseModel
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI as chatG, GoogleGenerativeAIEmbeddings as gen
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
from chromadb.api.types import EmbeddingFunction as ChromaEmbeddingFunction

load_dotenv("Key.env")

chatbot=FastAPI()

chatbot.add_middleware(
    cm, allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


llm= chatG(model="gemini-2.0-flash", google_api_key=os.getenv("key"))

embeddings= gen(model="models/embedding-001", google_api_key=os.getenv("key"))


chroma_path="./.chroma_db_data"
chroma=chromadb.PersistentClient(chroma_path)

class Embed_Func(ChromaEmbeddingFunction):
    def __init__(self, google_embeddings_model: gen):
        self.embeddings_model = google_embeddings_model

    def __call__(self, input: list[str]) -> list[list[float]]:
        result = self.embeddings_model.embed_documents(input)
        return result

    def name(self) -> str:
        return "google_generative_ai_embedding_function"


col_name= "abdominal_pain"
gc_col= None
symptom_data= {}
doc_to_add= []


try:
    chroma.delete_collection(name=col_name)
    print(f"deletion successful.")
except Exception as e:
    print(f"failed in deleted {col_name}, doesn't exist {str(e)}")

    
path= os.path.join(os.path.dirname(__file__), "abdominal_data.json")
with open(path, "r", encoding='utf-8') as a:
    symptom_data=json.load(a)


gc_col= chroma.get_or_create_collection(name=col_name, embedding_function=Embed_Func(embeddings))

if gc_col.count() == 0 and doc_to_add:
    try:
        if doc_to_add:
            pass

        gc_col.add(
            ids=[f"doc_{i}" for i in range(len(doc_to_add))])

    except Exception as e:
        print(f"error: {e}")

else:
    pass

vectorstore=Chroma(
    client= chroma, collection_name= col_name, embedding_function= embeddings
)

retriever= vectorstore.as_retriever(search_kwargs={"k":5})

rag_prompt= ChatPromptTemplate.from_messages([
    ("system", """You are a helpful, empathetic and knowledgable AI assistant specialised in adult abdominal pain. You purpose is to assit users in understanding their abdominal pain symptoms based only on 'Context' provided below. Maintain a human-like, conversational tone all the time.
     
    **Important Instructions:**
    1. *Your scope of knowledge is only built around "abdominal pain in adults" as covered in the 'Context', only provide information and ask questions related to that.*
    2. *If a user asks anything "not" related to abdominal pain or if the information is not sufficiently covered in 'Context', you should politely state that you are not trained in that topic. Response should be similar to: "{not_trained}*
    3. *If any "RED FLAG" symptoms are mentioned in the user's input or identified in the context, immediately advise seeking medical attention.*
    4. *Conversational Flow:*
     *understand Initial symptoms.*
     *ask relevant follow-up questions to narrow down possibilities.
     *suggest possible conditions "based on the context" once enough information is gathered, but always mentioned to consult a qualified professional.*

    Conversation history: {chat_history}

    Context(Relevant information from database): {context}"""),
    ("human", "{input}")
])
UNDERAGE_MESSAGE= next((doc["content"] for doc in symptom_data.get("documents", []) if doc["id"] == "age_denial_message"))
NOT_TRAINED_MESSAGE= next((doc["content"] for doc in symptom_data.get("documents", []) if doc["id"] == "not_trained"))
GREETING_MESSAGE= next((doc["content"] for doc in symptom_data.get("documents", []) if doc["id"] == "greet_response"))
doc_chain= create_stuff_documents_chain(llm, rag_prompt)

session_memories: dict[str, ConversationBufferMemory] = {}
session_age_verified: dict[str, bool]= {}

class AgeVerify(BaseModel):
    age: int
    session_id: str

class chatreq(BaseModel):
    message: str
    session_id: str

@chatbot.post("/verify_age")
async def verify_age(req: AgeVerify):
    session_id= req.session_id
    age= req.age

    if not(1 <= age <=100):
        return {"allowed": False, "message": "Invalid Age, Please enter a valid age."}
    if age < 18:
        session_age_verified[session_id]= False
        return {"allowed": False, "message": UNDERAGE_MESSAGE}
    else:
        session_age_verified[session_id] = True

        return {"allowed": True, "message": GREETING_MESSAGE}
    
@chatbot.post("/chat")
async def chat(request: chatreq):
    user_message= request.message.strip()
    session_id= request.session_id

    if session_id not in session_memories:
        session_memories[session_id]= ConversationBufferMemory(memory_key= "chat_history", return_messages=True)
    current_memory= session_memories[session_id]

    try:
        rc= create_retrieval_chain(retriever, doc_chain)

        chat_history= current_memory.load_memory_variables({})["chat_history"]

        react= rc.invoke({
            "input": user_message,
            "chat_history": chat_history,
            "not_trained": NOT_TRAINED_MESSAGE
        })

        bot_respond=react.get('answer', 'I apologize, I am unable to generate any response currently.')

        current_memory.save_context({"input": user_message}, {"output": bot_respond})

        return {"response": bot_respond}

    except Exception as e:
        print(f"Error during chat processing for session {session_id}: {str(e)}")


import uvicorn

uvicorn.run(chatbot, host="0.0.0.0", port=8000)
