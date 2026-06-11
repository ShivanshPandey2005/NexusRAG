import os
from typing import List, Dict, Any, Tuple
import numpy as np
from cohere import Client as CohereClient
from backend.config import settings
from backend.vector_store import vector_store
from backend.embeddings import embedding_service
from openai import OpenAI

class RetrievalEngine:
    def __init__(self):
        self.cohere_client = None
        if settings.COHERE_API_KEY:
            self.cohere_client = CohereClient(api_key=settings.COHERE_API_KEY)
            
        self.openai_client = None
        if settings.OPENAI_API_KEY:
            self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def generate_query_expansions(self, query: str) -> List[str]:
        """
        Generates query variations for multi-query retrieval.
        Uses OpenAI LLM if available, otherwise falls back to rule-based term extractors.
        """
        expansions = [query]
        
        if self.openai_client:
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4-turbo",
                    messages=[
                        {"role": "system", "content": "You are a Query Expansion assistant. Generate exactly 2 search query variations for the user query, focusing on synonyms and key concepts. Output each on a new line. Do not number them."},
                        {"role": "user", "content": f"User query: '{query}'"}
                    ],
                    max_tokens=60,
                    temperature=0.3
                )
                lines = response.choices[0].message.content.strip().split("\n")
                for line in lines:
                    cleaned = line.strip().lstrip("12345.-* ").strip()
                    if cleaned and cleaned != query:
                        expansions.append(cleaned)
            except Exception as e:
                print(f"Query expansion LLM error: {e}. Using rule-based fallback.")
                
        # Rule-based fallback if LLM fails or is not available
        if len(expansions) == 1:
            # Basic term extractor: extract nouns and main words
            terms = [t.strip(",.?!()\"") for t in query.split() if len(t) > 3]
            if len(terms) >= 2:
                expansions.append(" ".join(terms[:3]))
                expansions.append(" ".join(terms[-3:]))
                
        return list(set(expansions))[:3]

    def reciprocal_rank_fusion(
        self,
        dense_results: List[Dict[str, Any]],
        sparse_results: List[Dict[str, Any]],
        k: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Combines two ranked list of search results using Reciprocal Rank Fusion (RRF).
        Scores each document based on its reciprocal rank in the input lists.
        """
        rrf_scores: Dict[str, float] = {}
        doc_map: Dict[str, Dict[str, Any]] = {}
        
        # Helper to process a list
        def process_list(results: List[Dict[str, Any]]):
            for rank, item in enumerate(results):
                doc_id = item["id"]
                doc_map[doc_id] = item["payload"]
                
                # RRF calculation: Score = 1 / (k + rank)
                rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank + 1))

        process_list(dense_results)
        process_list(sparse_results)
        
        # Sort documents by RRF score descending
        sorted_ids = sorted(rrf_scores.keys(), key=lambda x: rrf_scores[x], reverse=True)
        
        fused_results = []
        for doc_id in sorted_ids:
            fused_results.append({
                "id": doc_id,
                "score": float(round(rrf_scores[doc_id], 6)),
                "payload": doc_map[doc_id]
            })
            
        return fused_results

    def rerank_results(self, query: str, candidate_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Reranks top retrieved candidate chunks.
        Uses Cohere Rerank API if available, otherwise falls back to a term-overlap cross score.
        """
        if not candidate_chunks:
            return []
            
        texts = [chunk["payload"]["content"] for chunk in candidate_chunks]
        
        # If Cohere API is configured
        if self.cohere_client:
            try:
                response = self.cohere_client.rerank(
                    model=settings.RERANKER_MODEL,
                    query=query,
                    documents=texts,
                    top_n=settings.RERANK_TOP_K
                )
                
                reranked = []
                for result in response.results:
                    idx = result.index
                    score = result.relevance_score
                    if score >= settings.RERANK_RELEVANCE_THRESHOLD:
                        chunk = candidate_chunks[idx]
                        # Update score with rerank relevance
                        chunk["score"] = float(round(score, 4))
                        reranked.append(chunk)
                return reranked
            except Exception as e:
                print(f"Cohere Rerank error: {e}. Using local overlap reranker.")
                
        # Local Overlap Rerank Fallback
        # Multiplies the original RRF score with a query-term overlap ratio
        reranked = []
        query_words = set(query.lower().split())
        
        for chunk in candidate_chunks:
            chunk_content = chunk["payload"]["content"].lower()
            overlap_count = sum(1 for word in query_words if word in chunk_content)
            
            # Simple relevance calculation
            overlap_ratio = overlap_count / max(len(query_words), 1)
            # Combine RRF score with overlap ratio
            relevance_score = 0.3 * chunk["score"] + 0.7 * overlap_ratio
            
            if relevance_score >= 0.2: # Loose threshold for local fallback
                chunk["score"] = float(round(relevance_score, 4))
                reranked.append(chunk)
                
        reranked.sort(key=lambda x: x["score"], reverse=True)
        return reranked[:settings.RERANK_TOP_K]

    def compress_context(self, chunks: List[Dict[str, Any]], max_tokens: int = 1500) -> List[Dict[str, Any]]:
        """
        Compresses retrieval context by selecting highly relevant chunks within a token limit.
        """
        compressed = []
        accumulated_tokens = 0
        
        for chunk in chunks:
            content = chunk["payload"]["content"]
            # Estimate token count
            # Simple token estimation: ~4 chars per token if tiktoken is not run in loop
            tok_count = len(content.split()) * 1.3
            
            if accumulated_tokens + tok_count <= max_tokens:
                compressed.append(chunk)
                accumulated_tokens += tok_count
            else:
                break
                
        return compressed

    def retrieve(self, collection_name: str, query: str, kb_id: str, limit: int = 15) -> List[Dict[str, Any]]:
        """
        Orchestrates the entire query retrieval pipeline:
        1. Query Expansion (Multi-Query Generation)
        2. Parallel search (Dense & Sparse)
        3. Reciprocal Rank Fusion (RRF)
        4. Cross-Encoder Reranking
        5. Context Token Compression
        """
        # 1. Query Expansion
        queries = self.generate_query_expansions(query)
        
        all_dense_results = []
        all_sparse_results = []
        
        # 2. Search for each query expansion
        for q in queries:
            all_dense_results.extend(vector_store.query_dense(collection_name, q, kb_id, limit))
            all_sparse_results.extend(vector_store.query_sparse(collection_name, q, kb_id, limit))
            
        # Deduplicate results by ID, keeping highest score
        def deduplicate(results):
            dedup = {}
            for item in results:
                doc_id = item["id"]
                if doc_id not in dedup or item["score"] > dedup[doc_id]["score"]:
                    dedup[doc_id] = item
            return list(dedup.values())

        dedup_dense = deduplicate(all_dense_results)
        dedup_sparse = deduplicate(all_sparse_results)
        
        # 3. Reciprocal Rank Fusion
        fused = self.reciprocal_rank_fusion(dedup_dense, dedup_sparse)
        
        # 4. Rerank top results
        reranked = self.rerank_results(query, fused)
        
        # 5. Token compression
        final_context = self.compress_context(reranked)
        
        return final_context

# Single instance
retrieval_engine = RetrievalEngine()
