import logging
import sys
import json
from datetime import datetime

class JsonFormatter(logging.Formatter):
    """Formats log records as JSON strings for production monitoring."""
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "filename": record.filename,
            "line": record.lineno
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data)

def setup_logging(production: bool = False):
    """Sets up Python logging with JSON formatting in prod and colored stream outputs in dev."""
    root_logger = logging.getLogger()
    
    # Clear existing handlers
    if root_logger.handlers:
        for handler in root_logger.handlers:
            root_logger.removeHandler(handler)
            
    handler = logging.StreamHandler(sys.stdout)
    
    if production:
        handler.setFormatter(JsonFormatter())
        root_logger.setLevel(logging.INFO)
    else:
        # Standard clean output for local development
        formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
            datefmt='%H:%M:%S'
        )
        handler.setFormatter(formatter)
        root_logger.setLevel(logging.DEBUG)
        
    root_logger.addHandler(handler)
    
    # Silence third party noisy loggers
    logging.getLogger("qdrant_client").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
