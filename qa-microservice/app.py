import os
import requests
from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
# CORS(app)
CORS(app, resources={r"/*": {"origins": ["https://example.com", "http://localhost:3001"]}})

# Set up Elasticsearch client
es = Elasticsearch(
    cloud_id=os.getenv('CLOUD_ID'),
    api_key=os.getenv('API_KEY'),
    verify_certs=True
)

# Ollama API endpoint
OLLAMA_API_URL = 'http://127.0.0.1:11434/api/generate'

def retrieve_content(file_id):
    """
    Retrieve document content from Elasticsearch based on the fileId.
    """
    query = {
        "query": {
            "term": {
                "metadata.file_id": file_id
            }
        }
    }
    response = es.search(index=os.getenv("ES_INDEX"), body=query)
    # Concatenate all retrieved document text into a single context string
    content = " ".join([hit["_source"]["text"] for hit in response["hits"]["hits"]])
    return content if content else None

def get_answer_from_ollama(question, context):
    """
    Sends the question and context to Ollama's Llama model and retrieves the answer in array format.
    """
    prompt = f"Context:\n{context}\n\nQuestion: {question}\nAnswer:"
    headers = {"Content-Type": "application/json"}
    payload = {"prompt": prompt, "model": "llama3.2"}
    
    response = requests.post(OLLAMA_API_URL, json=payload, headers=headers)
    response.raise_for_status()  # Raise an error for bad status
    # print(response)
    print("1")
    print(response.text)
    print("2")
    response_lines = response.text.strip().split('\n')

# Combine the lines into a valid JSON array
    json_array = "[" + ",".join(response_lines) + "]"

    # Parse the combined JSON array
    parsed_response = json.loads(json_array)

    # Print the parsed response
    print(parsed_response)
    # Parse the response to handle the list of responses
    # result = response.text.json()

    # print(result)

    print("3")
    
    return {"response": parsed_response}  # Return in JSON format as an array of responses

@app.route('/qa', methods=['POST'])
def answer_question():
    """
    QA endpoint to answer questions based on document content and a RAG setup.
    """
    # Parse question and fileId from request
    data = request.get_json()
    question = data.get("question")
    file_id = data.get("fileId")
    
    if not question or not file_id:
        return jsonify({"error": "Please provide both question and fileId"}), 400

    # Retrieve document content from Elasticsearch
    content = retrieve_content(file_id)
    if not content:
        return jsonify({"error": f"No content found for fileId {file_id}"}), 404

    # Use Ollama's Llama model to generate an answer
    try:
        answer = get_answer_from_ollama(question, content)
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
