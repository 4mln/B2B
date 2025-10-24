import sys
import logging
from datetime import datetime
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import traceback

import structlog

# Configure structlog for production-grade JSON output
def configure_logging(log_level: str = "INFO"):
    # Configure standard logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, log_level.upper(), logging.INFO),
    )
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

configure_logging()
logger = structlog.get_logger(__name__)


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
    """Setup logging middleware and exception handlers"""
    app.add_middleware(RequestIDMiddleware)
    
    # Add global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """
        Production-grade global exception handler
        Logs all unhandled exceptions and returns a proper error response
        """
        request_id = getattr(request.state, 'request_id', 'unknown')
        
        # Log the exception with full context
        logger.error(
            "unhandled_exception",
            exc_info=exc,
            exception_type=type(exc).__name__,
            exception_message=str(exc),
            method=request.method,
            path=request.url.path,
            client_ip=(request.client.host if request.client else None),
            request_id=request_id,
            traceback=traceback.format_exc(),
        )
        
        # Return a proper error response
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal server error",
                "message": "An unexpected error occurred. Please try again later.",
                "request_id": request_id,
                "type": type(exc).__name__,
            },
            headers={"X-Request-ID": request_id}
        )
    
    # Add handler for validation errors
    from fastapi.exceptions import RequestValidationError
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Handle validation errors with detailed messages"""
        request_id = getattr(request.state, 'request_id', 'unknown')
        
        logger.warning(
            "validation_error",
            errors=exc.errors(),
            method=request.method,
            path=request.url.path,
            request_id=request_id,
        )
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "Validation error",
                "message": "Request validation failed",
                "details": exc.errors(),
                "request_id": request_id,
            },
            headers={"X-Request-ID": request_id}
        )