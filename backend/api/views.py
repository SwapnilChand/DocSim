from rest_framework.decorators import api_view
from rest_framework.response import Response
from transformers import AutoTokenizer, AutoModel
import torch
import pinecone

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
model = AutoModel.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
index = pinecone.Index('doc-similarity-index')

def get_embeddings(text):
    inputs = tokenizer(text, return_tensors='pt', padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

@api_view(['POST'])
def upload_document(request):
    file = request.FILES['file']
    content = file.read().decode('utf-8')
    embedding = get_embeddings(content)
    doc_id = request.POST['id']
    index.upsert([(doc_id, embedding)])
    return Response({"status": "success", "id": doc_id})

@api_view(['GET'])
def find_similar(request):
    query = request.GET['query']
    query_embedding = get_embeddings(query)
    result = index.query(queries=[query_embedding], top_k=5)
    return Response(result['matches'])
