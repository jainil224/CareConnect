# ── CareConnect Flask ML Server ──────────────────────────────────────────────
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Install dependencies first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py .
COPY heart_model.pkl .
COPY templates/ ./templates/

# Expose Flask port
EXPOSE 5000

# Health check — Docker will mark container unhealthy if Flask is down
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

# Run Flask (debug off in container)
ENV FLASK_DEBUG=false
ENV FLASK_PORT=5000
CMD ["python", "app.py"]
