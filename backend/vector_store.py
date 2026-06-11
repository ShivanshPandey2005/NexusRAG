import uuid
from typing import List, Dict, Any, Tuple, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models
from backend.config import settings
from backend.embeddings import embedding_service

class QdrantVectorStore:
    def __init__(self):
        self.use_fallback = False
        self.fallback_db: Dict[str, Dict[str, Any]] = {} # Memory fallback: id -> {vector_dense, vector_sparse, payload}
        
        try:
            if settings.QDRANT_URL:
                self.client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
            else:
                self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
            
            # Test connection
            self.client.get_collections()
            print("Successfully connected to Qdrant server.")
        except Exception as e:
            print(f"Warning: Failed to connect to Qdrant ({e}). Falling back to local in-memory storage.")
            self.use_fallback = True
            self.client = None

    def initialize_collection(self, collection_name: str):
        """Initializes a collection with both dense and sparse vector configurations."""
        if self.use_fallback:
            return
            
        try:
            # Check if collection exists
            collections = self.client.get_collections().collections
            exists = any(c.name == collection_name for c in collections)
            
            if not exists:
                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config={
                        "dense": models.VectorParams(
                            size=settings.DENSE_EMBEDDING_DIM,
                            distance=models.Distance.COSINE
                        )
                    },
                    sparse_vectors_config={
                        "sparse": models.SparseVectorParams()
                    }
                )
                print(f"Created Qdrant hybrid collection: {collection_name}")
        except Exception as e:
            print(f"Failed to initialize collection {collection_name}: {e}. Enabling memory fallback.")
            self.use_fallback = True

    def upsert_chunks(self, collection_name: str, chunks: List[Dict[str, Any]], kb_id: str, doc_id: str, metadata_base: Dict[str, Any]):
        """Generates dense/sparse vectors and upserts them to the store."""
        if self.use_fallback:
            for chunk in chunks:
                chunk_id = f"chk-{uuid.uuid4().hex[:12]}"
                dense_v = embedding_service.get_dense_embedding(chunk["content"])
                sparse_idx, sparse_val = embedding_service.get_sparse_embedding(chunk["content"])
                
                payload = {
                    "id": chunk_id,
                    "kb_id": kb_id,
                    "doc_id": doc_id,
                    "chunk_index": chunk["chunk_index"],
                    "content": chunk["content"],
                    **metadata_base
                }
                
                self.fallback_db[chunk_id] = {
                    "dense": dense_v,
                    "sparse": (sparse_idx, sparse_val),
                    "payload": payload
                }
            return

        # Prepare points for Qdrant
        points = []
        for chunk in chunks:
            chunk_id = str(uuid.uuid4())
            dense_v = embedding_service.get_dense_embedding(chunk["content"])
            sparse_idx, sparse_val = embedding_service.get_sparse_embedding(chunk["content"])
            
            payload = {
                "id": chunk_id,
                "kb_id": kb_id,
                "doc_id": doc_id,
                "chunk_index": chunk["chunk_index"],
                "content": chunk["content"],
                **metadata_base
            }
            
            points.append(
                models.PointStruct(
                    id=chunk_id,
                    vector={
                        "dense": dense_v,
                        "sparse": models.SparseVector(indices=sparse_idx, values=sparse_val)
                    },
                    payload=payload
                )
            )
            
        try:
            self.initialize_collection(collection_name)
            self.client.upsert(
                collection_name=collection_name,
                points=points
            )
        except Exception as e:
            print(f"Failed upsert to Qdrant: {e}. Indexing to memory fallback instead.")
            # Fallback inline
            for p in points:
                self.fallback_db[p.id] = {
                    "dense": p.vector["dense"],
                    "sparse": (p.vector["sparse"].indices, p.vector["sparse"].values),
                    "payload": p.payload
                }

    def delete_document_chunks(self, collection_name: str, doc_id: str):
        """Deletes all chunks associated with a document ID."""
        if self.use_fallback:
            keys_to_delete = [k for k, v in self.fallback_db.items() if v["payload"]["doc_id"] == doc_id]
            for k in keys_to_delete:
                del self.fallback_db[k]
            return

        try:
            self.client.delete(
                collection_name=collection_name,
                points_selector=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="doc_id",
                            match=models.MatchValue(value=doc_id)
                        )
                    ]
                )
            )
        except Exception as e:
            print(f"Qdrant delete failed: {e}")

    def query_dense(self, collection_name: str, query_text: str, kb_id: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Dense semantic search."""
        query_vector = embedding_service.get_dense_embedding(query_text)
        
        if self.use_fallback:
            import numpy as np
            scores = []
            for cid, data in self.fallback_db.items():
                if data["payload"]["kb_id"] != kb_id:
                    continue
                # Cosine similarity
                a = np.array(query_vector)
                b = np.array(data["dense"])
                sim = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
                scores.append((cid, float(sim), data["payload"]))
            
            # Sort and limit
            scores.sort(key=lambda x: x[1], reverse=True)
            return [{"id": cid, "score": s, "payload": p} for cid, s, p in scores[:limit]]

        try:
            search_result = self.client.search(
                collection_name=collection_name,
                query_vector=("dense", query_vector),
                query_filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="kb_id",
                            match=models.MatchValue(value=kb_id)
                        )
                    ]
                ),
                limit=limit
            )
            return [{"id": r.id, "score": r.score, "payload": r.payload} for r in search_result]
        except Exception as e:
            print(f"Qdrant dense query failed: {e}")
            return []

    def query_sparse(self, collection_name: str, query_text: str, kb_id: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Sparse BM25 search."""
        indices, values = embedding_service.get_sparse_embedding(query_text)
        if not indices:
            return []
            
        if self.use_fallback:
            # Fallback simple overlap score
            scores = []
            query_set = set(indices)
            for cid, data in self.fallback_db.items():
                if data["payload"]["kb_id"] != kb_id:
                    continue
                sp_idx, sp_val = data["sparse"]
                overlap = query_set.intersection(set(sp_idx))
                # Simple weight dot-product
                dot = 0.0
                for idx in overlap:
                    q_val = values[indices.index(idx)]
                    d_val = sp_val[sp_idx.index(idx)]
                    dot += q_val * d_val
                if dot > 0:
                    scores.append((cid, dot, data["payload"]))
            
            scores.sort(key=lambda x: x[1], reverse=True)
            return [{"id": cid, "score": s, "payload": p} for cid, s, p in scores[:limit]]

        try:
            search_result = self.client.search(
                collection_name=collection_name,
                query_vector=models.NamedSparseVector(
                    name="sparse",
                    vector=models.SparseVector(indices=indices, values=values)
                ),
                query_filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="kb_id",
                            match=models.MatchValue(value=kb_id)
                        )
                    ]
                ),
                limit=limit
            )
            return [{"id": r.id, "score": r.score, "payload": r.payload} for r in search_result]
        except Exception as e:
            print(f"Qdrant sparse query failed: {e}")
            return []

# Single instance
vector_store = QdrantVectorStore()
