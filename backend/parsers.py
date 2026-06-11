import os
import re
from typing import Dict, Any, List
from pypdf import PdfReader
from docx import Document as DocxDocument

def parse_pdf(file_path: str) -> str:
    """Parses a PDF file and returns its text content."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found at: {file_path}")
        
    reader = PdfReader(file_path)
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)
            
    return "\n\n".join(text_parts)

def parse_docx(file_path: str) -> str:
    """Parses a Word (.docx) file and returns its text content."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"DOCX file not found at: {file_path}")
        
    doc = DocxDocument(file_path)
    text_parts = []
    for para in doc.paragraphs:
        if para.text.strip():
            text_parts.append(para.text)
            
    return "\n\n".join(text_parts)

def parse_txt_md(file_path: str) -> str:
    """Parses a plain text or markdown file and returns its content."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Text/MD file not found at: {file_path}")
        
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def extract_metadata(text: str, filename: str) -> Dict[str, Any]:
    """
    Extracts title, author, description, and tags from raw document text.
    Uses rule-based heuristics (first lines, title casing, etc.) as a fast, local default.
    """
    metadata = {
        "title": os.path.splitext(filename)[0].replace("_", " ").title(),
        "author": "Unknown",
        "description": "",
        "tags": []
    }
    
    # 1. Guess tags based on keyword patterns in text
    tag_keywords = {
        "Transformer": ["transformer", "self-attention", "attention mechanism"],
        "Deep Learning": ["deep learning", "neural network", "backpropagation", "weights"],
        "Clinical Oncology": ["oncology", "cancer", "tumor", "chemotherapy", "immunotherapy"],
        "Vector Search": ["vector", "embeddings", "qdrant", "pinecone", "hnsw", "similarity"],
        "System Architecture": ["architecture", "deployment", "kubernetes", "api", "database"],
        "Company Policy": ["policy", "employee", "leave", "pto", "reimbursement", "conduct"],
    }
    
    text_lower = text.lower()
    for tag, keywords in tag_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            metadata["tags"].append(tag)
            
    if not metadata["tags"]:
        metadata["tags"].append("General")

    # 2. Try to extract Title and Author from the first 500 characters
    sample = text[:500]
    lines = [l.strip() for l in sample.split("\n") if l.strip()]
    
    if lines:
        # Check if first line looks like a title
        if len(lines[0]) < 80 and not lines[0].startswith("#") and not lines[0].lower().startswith("by"):
            metadata["title"] = lines[0]
            
        # Look for "Author:" or "By " lines
        for line in lines[:5]:
            author_match = re.search(r'(?:author|by|written by):\s*([a-zA-Z\s.,\-\&]+)', line, re.IGNORECASE)
            if author_match:
                metadata["author"] = author_match.group(1).strip()
                break
            # Or if a line starts with "by "
            if line.lower().startswith("by ") and len(line) < 60:
                metadata["author"] = line[3:].strip()
                break

    # 3. Create a brief description (first sentence or up to 150 chars)
    # Clean double spaces and linebreaks for description
    clean_text = re.sub(r'\s+', ' ', text).strip()
    first_sentence_match = re.match(r'^([^.!?]*[.!?])', clean_text)
    if first_sentence_match:
        desc = first_sentence_match.group(1)
        if len(desc) > 200:
            desc = desc[:197] + "..."
        metadata["description"] = desc
    else:
        metadata["description"] = clean_text[:147] + "..." if len(clean_text) > 150 else clean_text
        
    return metadata
