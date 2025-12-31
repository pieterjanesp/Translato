# Backend Dockerfile for FastAPI application
# This creates an optimized Docker image for the Python backend

# Start from official Python 3.11 slim image
# "slim" variant is smaller than regular (removes unnecessary packages)
FROM python:3.11-slim

# Set working directory inside container
# All subsequent commands will run in /app
WORKDIR /app

# Copy ONLY requirements.txt first
# This leverages Docker layer caching:
# - If requirements.txt hasn't changed, pip install is cached
# - If only app code changes, we don't reinstall packages
COPY requirements.txt .

# Install Python dependencies
# --no-cache-dir: Don't cache pip downloads (saves space)
# -r requirements.txt: Install from requirements file
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the application code
# This comes AFTER pip install so code changes don't invalidate the install layer
COPY ./app ./app

# Create directory for temporary file storage
# The app stores uploaded/translated files here
RUN mkdir -p /tmp/document_translator

# Expose port 8000 (FastAPI default)
# This is documentation only - doesn't actually open the port
# Must use -p flag when running: docker run -p 8000:8000
EXPOSE 8000

# Command to run when container starts
# --host 0.0.0.0: Listen on all network interfaces (not just localhost)
#                 This allows external connections to the container
# --port 8000: Port to listen on
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
