import time
from fastapi import Request, HTTPException, status
from backend.memory import memory_service

class RateLimiter:
    """
    Sliding-window Rate Limiter using Redis keys or a local memory fallback.
    Default rate: 60 requests per minute per IP.
    """
    def __init__(self, limit: int = 60, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds
        # Fallback local storage: ip -> list of timestamps
        self.local_history: dict[str, list[float]] = {}

    def is_allowed(self, ip_address: str) -> bool:
        current_time = time.time()
        
        # 1. Use Redis if connected
        if not memory_service.use_redis_fallback:
            try:
                redis_key = f"rate:{ip_address}"
                pipe = memory_service.redis_client.pipeline()
                
                # Remove timestamps older than the window
                pipe.zremrangebyscore(redis_key, 0, current_time - self.window_seconds)
                # Count current window hits
                pipe.zcard(redis_key)
                # Add current hit
                pipe.zadd(redis_key, {str(current_time): current_time})
                # Set expire on the set
                pipe.expire(redis_key, self.window_seconds)
                
                _, count, _, _ = pipe.execute()
                
                return count < self.limit
            except Exception as e:
                print(f"Redis rate limiter exception: {e}. Falling back to memory rate limiter.")
                
        # 2. Local memory fallback
        history = self.local_history.get(ip_address, [])
        # Prune old timestamps
        history = [t for t in history if t > current_time - self.window_seconds]
        
        allowed = len(history) < self.limit
        if allowed:
            history.append(current_time)
            
        self.local_history[ip_address] = history
        return allowed

    async def __call__(self, request: Request):
        # Extract IP address from request headers or direct client host
        ip = request.headers.get("x-forwarded-for")
        if not ip:
            ip = request.client.host if request.client else "unknown_ip"
            
        # Parse first IP in forwarded list if behind a proxy
        if "," in ip:
            ip = ip.split(",")[0].strip()
            
        if not self.is_allowed(ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Maximum 60 queries per minute."
            )

# Instantiate rate limiter
rate_limiter = RateLimiter()
