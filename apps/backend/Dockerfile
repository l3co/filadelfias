FROM python:3.11-slim

WORKDIR /app

# Install Poetry
RUN pip install poetry==1.8.0

# Copy dependency files
COPY pyproject.toml poetry.lock* ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

# Copy application code
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 8000

# Run application with migrations
ENTRYPOINT ["./entrypoint.sh"]
