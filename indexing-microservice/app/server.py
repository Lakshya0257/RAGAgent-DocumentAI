import os
from concurrent import futures
import grpc
import requests
import json
from elasticsearch import Elasticsearch
import boto3
from flask import Flask
import rag_service_pb2
import rag_service_pb2_grpc
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()

es = Elasticsearch(
    cloud_id=os.getenv('CLOUD_ID'),
    api_key=os.getenv('API_KEY'),
    verify_certs=True
)

s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

class RAGServiceServicer(rag_service_pb2_grpc.RAGServiceServicer):

    def DeleteDocument(self, request, context):
        try:
            response = self._delete_from_elasticsearch(request.file_id)
            
            if response:
                return rag_service_pb2.DocumentResponse(
                    status="success",
                    message=f"All documents with fileId {request.file_id} deleted successfully"
                )
            else:
                return rag_service_pb2.DocumentResponse(
                    status="error",
                    message=f"No documents found with fileId {request.file_id}"
                )
        except Exception as e:
            print(f"Error deleting documents: {str(e)}")
            return rag_service_pb2.DocumentResponse(
                status="error",
                message=str(e)
            )

    def _delete_from_elasticsearch(self, file_id):
        try:
            query = {
                "query": {
                    "term": {
                        "metadata.file_id": file_id
                    }
                }
            }

            response = es.delete_by_query(index="documents", body=query, refresh=True)
            return response['deleted'] > 0  # Return True if any documents were deleted
        except Exception as e:
            raise Exception(f"Error deleting from Elasticsearch: {str(e)}")


    def ProcessDocument(self, request, context):
        try:
            if not es.ping():
                raise Exception("Could not connect to Elasticsearch")

            file_content = self._download_from_s3(request.file_url)
            extracted_content = self._process_with_unstructured(file_content)
            
            self._index_to_elasticsearch(
                request.file_id,
                request.user_id,
                extracted_content
            )
            
            return rag_service_pb2.DocumentResponse(
                status="success",
                message=f"Document {request.file_id} processed successfully"
            )
        except Exception as e:
            print(f"Error processing document: {str(e)}")
            return rag_service_pb2.DocumentResponse(
                status="error",
                message=str(e)
            )

    def _download_from_s3(self, file_url):
        try:
            parts = file_url.replace("s3://", "").split("/")
            bucket = "ai-planet"
            print(parts)
            key = "/".join(parts[3:])
            print(key)
            
            response = s3.get_object(Bucket=bucket, Key=key)
            return response['Body'].read()
        except Exception as e:
            raise Exception(f"Error downloading from S3: {str(e)}")

    def _process_with_unstructured(self, file_content):
        try:
            url = "https://api.unstructuredapp.io/general/v0/general"
            headers = {
                "Accept": "application/json",
                "unstructured-api-key": os.getenv('UNSTRUCTURED_API_KEY')
            }
            
            files = {
                "files": ("document", file_content)
            }
            
            response = requests.post(url, headers=headers, files=files)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise Exception(f"Error processing with unstructured.io: {str(e)}")

    def _index_to_elasticsearch(self, file_id, user_id, content):
        try:
            processed_content = []
            
            for element in content:
                processed_content.append({
                    "text": element.get("text", ""),
                    "type": element.get("type", ""),
                    "metadata": {
                        "file_id": file_id,
                        "user_id": user_id,
                        "element_id": element.get("element_id", ""),
                        "timestamp": datetime.datetime.utcnow().isoformat()
                    }
                })

            bulk_data = []
            for doc in processed_content:
                bulk_data.append({
                    "index": {
                        "_index": "documents",
                        "_id": f"{file_id}_{doc['metadata']['element_id']}"
                    }
                })
                bulk_data.append(doc)

            # Perform bulk indexing with error checking
            response = es.bulk(index="documents", body=bulk_data, refresh=True)
            if response.get('errors'):
                raise Exception(f"Bulk indexing had errors: {response}")
                
        except Exception as e:
            raise Exception(f"Error indexing to Elasticsearch: {str(e)}")

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    rag_service_pb2_grpc.add_RAGServiceServicer_to_server(
        RAGServiceServicer(), server
    )
    server.add_insecure_port('[::]:50051')
    print("Starting server on port 50051...")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    import datetime
    import os

    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = os.getenv('AWS_REGION')
    UNSTRUCTURED_API_KEY = os.getenv('UNSTRUCTURED_API_KEY')

    if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, UNSTRUCTURED_API_KEY]):
        print("Error: Missing required environment variables. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and UNSTRUCTURED_API_KEY.")
        exit(1)

    try:
        if not es.ping():
            raise Exception("Could not connect to Elasticsearch")
        print("Successfully connected to Elasticsearch")
        
        if not es.indices.exists(index="documents"):
            mappings = {
                "mappings": {
                    "properties": {
                        "text": {"type": "text"},
                        "type": {"type": "keyword"},
                        "metadata": {
                            "properties": {
                                "file_id": {"type": "keyword"},
                                "user_id": {"type": "keyword"},
                                "element_id": {"type": "keyword"},
                                "timestamp": {"type": "date"}
                            }
                        }
                    }
                },
                "settings": {
                    "number_of_shards": 1,
                    "number_of_replicas": 1
                }
            }
            es.indices.create(index="documents", body=mappings)
            print("Created 'documents' index with mappings")
    except Exception as e:
        print(f"Error setting up Elasticsearch: {str(e)}")
        exit(1)
    
    serve()