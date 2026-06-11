import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Configurations
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    COHERE_API_KEY: str = os.getenv("COHERE_API_KEY", "")
    
    # Qdrant Configurations
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    QDRANT_URL: str = os.getenv("QDRANT_URL", "")
    
    # Model Configurations
    DENSE_EMBEDDING_MODEL: str = "text-embedding-3-small"
    DENSE_EMBEDDING_DIM: int = 1536
    SPARSE_EMBEDDING_MODEL: str = "bm25"
    
    # Default Chunker Settings
    DEFAULT_CHUNK_SIZE: int = 400
    DEFAULT_CHUNK_OVERLAP: int = 80
    
    # Reranker Settings
    RERANKER_MODEL: str = "rerank-english-v3.0"
    RERANK_RELEVANCE_THRESHOLD: float = 0.45
    RERANK_TOP_K: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
