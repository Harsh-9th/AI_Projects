# 🩺 LLM-Powered Medical Chatbot for Abdominal Pain Diagnosis

## Overview

This project is a sophisticated medical chatbot designed to assist with adult abdominal pain symptoms. It leverages a **Retrieval-Augmented Generation (RAG)** architecture to provide accurate, grounded information from a specialized knowledge base, ensuring responses are relevant and safe. A key feature is the integration of **rule-based triage** to recommend professional medical assistance for severe symptoms and to gracefully handle queries outside its domain.

## Tech Stack

### Frontend
![Reactjs]
![TypeScript]
![TailwindCSS]

### Backend/AI
![Python]
![FastAPI]
![Langchain]
![GeminiAPI]
![ChromaDB]

## Project Structure

```
.
|   backend   # Contains the server-side code and knowledge base
|   |   abdominal_data.json   # Knowledge base for the bot
|   |   bot.py   # The main backend script (FastAPI server)
|   |   Key.env   # Environment file to store API keys
|   frontend   # Contains the front-end code for the UI
|   |   front_bot.tsx   # The main React component for the chatbot UI.
|   |   index.tsx   # The entry point for the application
|   |   index.html   #The main HTML file to load the React app.
|   package.json   # Lists project dependencies and script for the frontend.
|   package-lock.json   # Locks the exact versions of the frontend dependencies.
|   tsconfig.json   # TypeScipt configuration file for the frontend.
|   vite.config.ts   # Configuration file for Vite, the frontend built tool.
```