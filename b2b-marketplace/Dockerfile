## Multi-stage Dockerfile
## Builder: install dependencies
FROM python:3.11-slim as builder
WORKDIR /build
COPY requirements.txt ./
RUN python -m pip install --upgrade pip \
        && python -m pip wheel --no-cache-dir --no-deps -r requirements.txt -w /wheels

## Runtime: minimal image, non-root user
FROM python:3.11-slim as runtime
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=development
ENV DEBUG=True
ENV PYTHONPATH=/opt/app

RUN adduser --disabled-password --gecos '' appuser || true
WORKDIR /opt/app

# Copy built wheels and install them
COPY --from=builder /wheels /wheels
RUN python -m pip install --no-cache /wheels/* || true

# Copy application code
COPY . /opt/app
RUN chown -R appuser:appuser /opt/app

USER appuser
EXPOSE 8000

# Lightweight healthcheck — the container image has curl in slim, but keep the check simple
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]