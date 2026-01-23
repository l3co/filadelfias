"""
Rate limiting middleware configuration.

Uses slowapi to protect against brute force attacks and abuse.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address


def get_client_ip(request) -> str:
    """
    Get client IP address from request.

    Handles proxy headers for accurate IP detection behind load balancers.

    Args:
        request: FastAPI request object

    Returns:
        str: Client IP address
    """
    # Check for forwarded headers (when behind proxy/load balancer)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can contain multiple IPs, take the first (client IP)
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fallback to direct connection IP
    return get_remote_address(request)


from src.config import settings

# Create limiter instance with custom key function
# Disable rate limiting during tests to prevent failure
limiter = Limiter(key_func=get_client_ip, enabled=settings.environment != "test")
