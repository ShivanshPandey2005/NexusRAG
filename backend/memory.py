import json
import os
from typing import List, Dict, Any, Optional
import redis
from sqlalchemy import create_engine, Column, String, Text, DateTime, JSON, ForeignKey, Integer, Float
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import sqlite3

# 1. Base config and fallbacks
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/nexusrag")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

Base = declarative_base()

# 2. Database Models (SQLAlchemy)
class DbConversation(Base):
    __tablename__ = "conversations"
    id = Column(String(50), primary_key=True)
    user_id = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    messages = relationship("DbMessage", back_populates="conversation", cascade="all, delete-orphan")

class DbMessage(Base):
    __tablename__ = "messages"
    id = Column(String(50), primary_key=True)
    conversation_id = Column(String(50), ForeignKey("conversations.id", ondelete="CASCADE"))
    role = Column(String(20), nullable=False) # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    conversation = relationship("DbConversation", back_populates="messages")

class DbLongTermMemory(Base):
    __tablename__ = "long_term_memories"
    id = Column(String(50), primary_key=True)
    user_id = Column(String(50), nullable=False)
    key = Column(String(100), nullable=False)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)

class DbQueryLog(Base):
    __tablename__ = "query_logs"
    id = Column(String(50), primary_key=True)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    latency_ms = Column(Integer, default=0)
    accuracy = Column(Float, default=1.0)
    tokens_used = Column(Integer, default=0)
    kb_name = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


# 3. DB & Redis Manager with Fallback
class MemoryStorageManager:
    def __init__(self):
        self.use_sqlite_fallback = False
        self.use_redis_fallback = False
        
        # Test Redis Connection
        try:
            self.redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
            self.redis_client.ping()
            print("Connected to Redis successfully.")
        except Exception as e:
            print(f"Warning: Redis connection failed ({e}). Using local dict cache fallback.")
            self.use_redis_fallback = True
            self.redis_cache: Dict[str, str] = {}

        # Test PostgreSQL Connection
        try:
            self.engine = create_engine(DATABASE_URL)
            # Try to connect
            with self.engine.connect() as conn:
                pass
            Base.metadata.create_all(self.engine)
            self.SessionLocal = sessionmaker(bind=self.engine)
            print("Connected to PostgreSQL successfully.")
        except Exception as e:
            print(f"Warning: PostgreSQL connection failed ({e}). Using SQLite local file fallback.")
            self.use_sqlite_fallback = True
            fallback_path = os.path.join(os.getcwd(), "nexusrag_memory.db")
            self.sqlite_url = f"sqlite:///{fallback_path}"
            self.engine = create_engine(self.sqlite_url)
            Base.metadata.create_all(self.engine)
            self.SessionLocal = sessionmaker(bind=self.engine)
            print(f"Initialized SQLite database at {fallback_path}")

    # --- Redis / Preference Caching ---
    def set_preference(self, user_id: str, key: str, value: Any):
        """Sets a user preference. Cached in Redis."""
        redis_key = f"pref:{user_id}:{key}"
        val_str = json.dumps(value)
        
        if self.use_redis_fallback:
            self.redis_cache[redis_key] = val_str
        else:
            try:
                self.redis_client.set(redis_key, val_str)
            except Exception:
                self.redis_cache[redis_key] = val_str

    def get_preference(self, user_id: str, key: str) -> Optional[Any]:
        """Gets a user preference."""
        redis_key = f"pref:{user_id}:{key}"
        val_str = None
        
        if self.use_redis_fallback:
            val_str = self.redis_cache.get(redis_key)
        else:
            try:
                val_str = self.redis_client.get(redis_key)
            except Exception:
                # Fallback to local
                val_str = self.redis_cache.get(redis_key)
                
        if val_str:
            return json.loads(val_str)
        return None

    # --- Session / Conversational Memory ---
    def save_message(self, conversation_id: str, user_id: str, title: str, role: str, content: str):
        """Saves a conversation message in relational database."""
        db = self.SessionLocal()
        try:
            # Check if conversation exists
            conv = db.query(DbConversation).filter(DbConversation.id == conversation_id).first()
            if not conv:
                conv = DbConversation(id=conversation_id, user_id=user_id, title=title)
                db.add(conv)
                db.commit()
                
            # Add message
            msg = DbMessage(
                id=f"msg-{uuid_hex()}",
                conversation_id=conversation_id,
                role=role,
                content=content
            )
            db.add(msg)
            conv.updated_at = datetime.utcnow()
            db.commit()
        except Exception as e:
            print(f"DB Error saving message: {e}")
            db.rollback()
        finally:
            db.close()

    def get_conversation_history(self, conversation_id: str) -> List[Dict[str, str]]:
        """Retrieves conversational history for a session."""
        db = self.SessionLocal()
        history = []
        try:
            messages = db.query(DbMessage)\
                .filter(DbMessage.conversation_id == conversation_id)\
                .order_by(DbMessage.created_at.asc())\
                .all()
            for msg in messages:
                history.append({
                    "role": msg.role,
                    "content": msg.content
                })
        except Exception as e:
            print(f"DB Error getting history: {e}")
        finally:
            db.close()
        return history

    # --- Long-Term Memory (User facts) ---
    def save_long_term_fact(self, user_id: str, key: str, value: str):
        """Saves a fact extracted about a user or project."""
        db = self.SessionLocal()
        try:
            fact = db.query(DbLongTermMemory)\
                .filter(DbLongTermMemory.user_id == user_id, DbLongTermMemory.key == key)\
                .first()
            if fact:
                fact.value = value
                fact.updated_at = datetime.utcnow()
            else:
                fact = DbLongTermMemory(id=f"ltm-{uuid_hex()}", user_id=user_id, key=key, value=value)
                db.add(fact)
            db.commit()
        except Exception as e:
            print(f"DB Error saving long term fact: {e}")
            db.rollback()
        finally:
            db.close()

    def get_long_term_facts(self, user_id: str) -> Dict[str, str]:
        """Gets all saved long-term summaries/facts for a user."""
        db = self.SessionLocal()
        facts = {}
        try:
            results = db.query(DbLongTermMemory).filter(DbLongTermMemory.user_id == user_id).all()
            for item in results:
                facts[item.key] = item.value
        except Exception as e:
            print(f"DB Error getting long term facts: {e}")
        finally:
            db.close()
        return facts

    # --- Query Logging ---
    def log_query(self, query: str, response: str, latency_ms: int, tokens_used: int, kb_name: str):
        """Logs search operations for analytics."""
        db = self.SessionLocal()
        try:
            log = DbQueryLog(
                id=f"log-{uuid_hex()}",
                query=query,
                response=response,
                latency_ms=latency_ms,
                tokens_used=tokens_used,
                kb_name=kb_name
            )
            db.add(log)
            db.commit()
        except Exception as e:
            print(f"DB Error logging query: {e}")
            db.rollback()
        finally:
            db.close()

# Helper UUID string
def uuid_hex() -> str:
    import uuid
    return uuid.uuid4().hex[:12]

# Single instance
memory_service = MemoryStorageManager()
