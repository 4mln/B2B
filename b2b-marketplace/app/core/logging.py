import sys
from datetime import datetime
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable

import structlog

# Configure structlog for JSON output
def configure_logging():
    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.add_log_level,
            structlog.processors.JSONRenderer()
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
    )

configure_logging()
logger = structlog.get_logger()


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable):
        # Ensure request id is present
        request_id = request.headers.get("X-Request-ID") or request.headers.get("x-request-id")
        if not request_id:
            import uuid
            request_id = str(uuid.uuid4())

        # Attach request_id to request state for handlers
        request.state.request_id = request_id

        # Process request
        start = datetime.utcnow()
        response = await call_next(request)
        duration = (datetime.utcnow() - start).total_seconds()

        # Attach request id header in response
        response.headers.setdefault("X-Request-ID", request_id)

        logger.info(
            "http_request",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration=duration,
            client_ip=(request.client.host if request.client else None),
            user_agent=request.headers.get("user-agent"),
            referer=request.headers.get("referer"),
            query_params=str(request.query_params),
            request_id=request_id,
        )

        return response


def setup_logging_middleware(app: FastAPI):
    app.add_middleware(RequestIDMiddleware)