import re
from typing import List, Dict, Any
import tiktoken
from backend.config import settings

def count_tokens(text: str, model_name: str = "gpt-4") -> int:
    """Counts the number of tokens in a text string using tiktoken."""
    try:
        encoding = tiktoken.encoding_for_model(model_name)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
        
    return len(encoding.encode(text))

def chunk_text(
    text: str,
    chunk_size: int = settings.DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = settings.DEFAULT_CHUNK_OVERLAP,
    model_name: str = "gpt-4"
) -> List[Dict[str, Any]]:
    """
    Splits text into chunks of maximum token size using a sliding window.
    Aligns chunk splits with sentence boundaries to prevent sentence fragmentation.
    """
    if not text.strip():
        return []

    try:
        encoding = tiktoken.encoding_for_model(model_name)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
        
    # Split text into sentences using simple regex
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    
    current_chunk_sentences = []
    current_chunk_tokens = 0
    chunk_index = 0
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        sentence_tokens = len(encoding.encode(sentence))
        
        # If a single sentence exceeds the chunk size, we split it by words
        if sentence_tokens > chunk_size:
            # Output whatever we have in current chunk first
            if current_chunk_sentences:
                chunk_content = " ".join(current_chunk_sentences)
                chunks.append({
                    "chunk_index": chunk_index,
                    "content": chunk_content,
                    "token_count": current_chunk_tokens
                })
                chunk_index += 1
                current_chunk_sentences = []
                current_chunk_tokens = 0
                
            # Split long sentence by words
            words = sentence.split(" ")
            current_word_chunk = []
            current_word_tokens = 0
            
            for word in words:
                word_tokens = len(encoding.encode(word + " "))
                if current_word_tokens + word_tokens > chunk_size:
                    word_content = " ".join(current_word_chunk)
                    chunks.append({
                        "chunk_index": chunk_index,
                        "content": word_content,
                        "token_count": current_word_tokens
                    })
                    chunk_index += 1
                    current_word_chunk = [word]
                    current_word_tokens = word_tokens
                else:
                    current_word_chunk.append(word)
                    current_word_tokens += word_tokens
                    
            if current_word_chunk:
                word_content = " ".join(current_word_chunk)
                chunks.append({
                    "chunk_index": chunk_index,
                    "content": word_content,
                    "token_count": current_word_tokens
                })
                chunk_index += 1
            continue

        # If adding the sentence exceeds chunk size, save the current chunk
        if current_chunk_tokens + sentence_tokens > chunk_size:
            chunk_content = " ".join(current_chunk_sentences)
            chunks.append({
                "chunk_index": chunk_index,
                "content": chunk_content,
                "token_count": current_chunk_tokens
            })
            chunk_index += 1
            
            # Form overlap: keep last N sentences that sum up to less than chunk_overlap tokens
            overlap_sentences = []
            overlap_tokens = 0
            for s in reversed(current_chunk_sentences):
                s_tok = len(encoding.encode(s))
                if overlap_tokens + s_tok <= chunk_overlap:
                    overlap_sentences.insert(0, s)
                    overlap_tokens += s_tok
                else:
                    break
                    
            current_chunk_sentences = overlap_sentences
            current_chunk_tokens = overlap_tokens

        current_chunk_sentences.append(sentence)
        current_chunk_tokens += sentence_tokens

    # Append remaining text if any
    if current_chunk_sentences:
        chunk_content = " ".join(current_chunk_sentences)
        chunks.append({
            "chunk_index": chunk_index,
            "content": chunk_content,
            "token_count": current_chunk_tokens
        })
        
    return chunks
