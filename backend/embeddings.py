import zlib
import re
from typing import List, Dict, Any, Tuple
from openai import OpenAI
from backend.config import settings

class BM25SparseEncoder:
    """
    A lightweight, deterministic sparse encoder that simulates BM25 values.
    Uses word-level tokenization and hashing to map terms to index positions.
    """
    def __init__(self):
        # Common English stop words
        self.stop_words = {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", "as", 
            "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "cant", 
            "cannot", "could", "couldnt", "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during", 
            "each", "few", "for", "from", "further", "had", "hadnt", "has", "hasnt", "have", "havent", "having", 
            "he", "hed", "hell", "hes", "her", "here", "heres", "hers", "herself", "him", "himself", "his", "how", 
            "hows", "i", "id", "ill", "im", "ive", "if", "in", "into", "is", "isnt", "it", "its", "itself", "lets", 
            "me", "more", "most", "mustnt", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", 
            "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shant", "she", "shed", 
            "shell", "shes", "should", "shouldnt", "so", "some", "such", "than", "that", "thats", "the", "their", 
            "theirs", "them", "themselves", "then", "there", "theres", "these", "they", "theyd", "theyll", "theyre", 
            "theyve", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasnt", "we", 
            "wed", "well", "were", "weve", "werent", "what", "whats", "when", "whens", "where", "wheres", "which", 
            "while", "who", "whos", "whom", "why", "whys", "with", "wont", "would", "wouldnt", "you", "youd", "youll", 
            "youre", "youve", "your", "yours", "yourself", "yourselves"
        }
    
    def tokenize(self, text: str) -> List[str]:
        """Tokenize text into lower-cased alphanumeric words."""
        words = re.findall(r'\b[a-zA-Z0-9_]+\b', text.lower())
        return [w for w in words if w not in self.stop_words]

    def encode(self, text: str) -> Tuple[List[int], List[float]]:
        """
        Encodes a string into a sparse vector representation for Qdrant.
        Returns indices (hashed word slots) and values (simulated TF weights).
        """
        words = self.tokenize(text)
        if not words:
            return [], []
            
        # Count term frequencies
        tf: Dict[str, int] = {}
        for word in words:
            tf[word] = tf.get(word, 0) + 1
            
        # Convert term frequency to BM25-like weights (log normalized)
        # We map words to a 1,000,000 index space using adler32 hashing
        indices = []
        values = []
        
        # Sort terms to keep Qdrant indices ordered (required by Qdrant Client)
        sorted_terms = sorted(tf.keys(), key=lambda w: zlib.adler32(w.encode('utf-8')) % 1000000)
        
        for term in sorted_terms:
            idx = zlib.adler32(term.encode('utf-8')) % 1000000
            freq = tf[term]
            
            # Simple TF-IDF/BM25 style scaling: value = ln(1 + TF)
            # We scale it with a base term weight for search
            val = freq / (freq + 1.2 + 0.75 * 1.0)
            
            indices.append(idx)
            values.append(float(round(val, 4)))
            
        return indices, values

# Dense Embeddings using OpenAI
class EmbeddingGenerator:
    def __init__(self):
        self.client = None
        if settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.sparse_encoder = BM25SparseEncoder()

    def get_dense_embedding(self, text: str) -> List[float]:
        """Generates OpenAI dense vector embedding."""
        if not self.client:
            # Return a deterministic mock vector if OpenAI API key is missing
            # This enables local development and offline mock runs to build successfully!
            import numpy as np
            # Generate deterministic list based on text hash
            seed = zlib.adler32(text.encode('utf-8'))
            rng = np.random.default_rng(seed)
            vector = rng.standard_normal(settings.DENSE_EMBEDDING_DIM).tolist()
            # Normalize vector
            norm = np.linalg.norm(vector)
            return (vector / norm).tolist()
            
        response = self.client.embeddings.create(
            input=text,
            model=settings.DENSE_EMBEDDING_MODEL
        )
        return response.data[0].embedding

    def get_sparse_embedding(self, text: str) -> Tuple[List[int], List[float]]:
        """Generates local sparse vector indices and values."""
        return self.sparse_encoder.encode(text)

# Single instance
embedding_service = EmbeddingGenerator()
